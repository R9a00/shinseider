from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.responses import FileResponse, JSONResponse
from word_generator import generate_word
import os
import json
import yaml
from fastapi.middleware.cors import CORSMiddleware
from middleware.security import SecurityMiddleware, ErrorHandlingMiddleware, RateLimitMiddleware
from models import DesireRequest, GenerateOutputRequest, TextbookRequest, BusinessPlanRequest
from secure_file_utils import get_secure_file_manager
import logging

# セキュリティログの設定
logging.basicConfig(level=logging.INFO)
security_logger = logging.getLogger("security")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def load_subsidy_data():
    file_path = os.path.join(BASE_DIR, "subsidies.yaml")
    with open(file_path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)

app = FastAPI()

origins = [
    "http://localhost:3333",
    "http://localhost:3000",
    "http://127.0.0.1:3333",
    "http://127.0.0.1:3000"
]

# セキュリティミドルウェアの追加
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# セキュリティミドルウェア（REQ-SEC-001, REQ-SEC-006, REQ-SEC-010）
app.add_middleware(SecurityMiddleware, max_request_size=1024*1024)  # 1MB制限

# エラーハンドリングミドルウェア（REQ-SEC-004）
is_production = os.getenv("ENVIRONMENT") == "production"
app.add_middleware(ErrorHandlingMiddleware, is_production=is_production)

# レート制限ミドルウェア（REQ-SEC-008）
app.add_middleware(RateLimitMiddleware, max_requests=100, window_seconds=60)

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/subsidies")
async def get_subsidies():
    """利用可能な補助金の一覧を取得します。"""
    subsidies_data = load_subsidy_data()
    subsidies_list = [
        {"id": subsidy.get("id"), "name": subsidy.get("name")}
        for subsidy in subsidies_data
    ]
    return {"subsidies": subsidies_list}

@app.get("/subsidies/{subsidy_id}/metadata")
async def get_subsidy_metadata(subsidy_id: str):
    """指定された補助金のメタデータを取得します。"""
    subsidies_data = load_subsidy_data()
    subsidy = next((s for s in subsidies_data if s.get("id") == subsidy_id), None)
    if not subsidy or "metadata" not in subsidy:
        raise HTTPException(status_code=404, detail="Subsidy not found or metadata missing")
    return {"metadata": subsidy["metadata"]}

@app.get("/get_application_questions/{subsidy_id}")
async def get_application_questions(subsidy_id: str):
    """指定された補助金の申請書作成に必要な質問項目を取得します。"""
    subsidies_data = load_subsidy_data()
    subsidy = next((s for s in subsidies_data if s.get("id") == subsidy_id), None)
    if not subsidy:
        raise HTTPException(status_code=404, detail="Subsidy not found")

    questions = {"criteria": [], "scoring_factors": {}}
    
    # 必須要件の質問
    for criterion in subsidy.get("criteria", []):
        if "display_question" in criterion:
            questions["criteria"].append({
                "id": criterion["field"],
                "question": criterion["display_question"],
                "type": "boolean" 
            })

    # 審査項目の質問 (シンプル・ガイド付き)
    for factor in subsidy.get("scoring_factors", []):
        factor_key = factor["key"]
        questions["scoring_factors"][factor_key] = {
            "description": factor["description"],
            "simple": factor.get("input_modes", {}).get("simple"),
            "guided": factor.get("input_modes", {}).get("guided", [])
        }
        
    return questions

@app.post("/generate_application_advice")
async def generate_application_advice(advice_request: ApplicationAdviceRequest):
    """ユーザーの回答に基づき、LLM向けの高品質なプロンプトを生成します（REQ-SEC-002, REQ-SEC-006）"""
    try:
        subsidies_data = load_subsidy_data()
        subsidy = next((s for s in subsidies_data if s.get("id") == advice_request.subsidy_id), None)
        if not subsidy:
            raise HTTPException(status_code=404, detail="Subsidy not found")

        prompt_template = subsidy.get("llm_prompt_template")
        if not prompt_template:
            raise HTTPException(status_code=500, detail="Prompt template for this subsidy is not configured.")

    # ユーザーの回答を整形
    formatted_answers = ""
    scoring_factors = subsidy.get("scoring_factors", [])
    
    # scoring_factorsの回答を処理
    for factor in scoring_factors:
        factor_key = factor.get("key")
        if factor_key in advice_request.answers:
            description = factor.get("description", "不明な項目")
            formatted_answers += f"▼ {description}\n"
            
            if advice_request.input_mode == 'simple':
                answer_text = advice_request.answers.get(factor_key, '（回答なし）')
                formatted_answers += f"A: {answer_text}\n\n"
            elif advice_request.input_mode == 'guided':
                guided_answers = advice_request.answers.get(factor_key, {})
                guided_questions = factor.get("input_modes", {}).get("guided", [])
                for q_index_str, q_answer in sorted(guided_answers.items()):
                    q_index = int(q_index_str)
                    question_text = guided_questions[q_index] if q_index < len(guided_questions) else f"質問 {q_index + 1}"
                    formatted_answers += f"{question_text}\n"
                    formatted_answers += f"A: {q_answer or '（回答なし）'}\n\n"

    # 必須要件の充足状況を判断
    criteria_status_map = {
        "is_new_product_and_customer": "new_product_status",
        "value_added_growth_rate": "value_added_growth_status",
        "wage_increase_plan": "wage_increase_plan_status",
        "internal_min_wage_gap_yen": "internal_min_wage_gap_status",
    }
    
    prompt_placeholders = {
        "new_product_status": "不明",
        "value_added_growth_status": "不明",
        "wage_increase_plan_status": "不明",
        "internal_min_wage_gap_status": "不明",
    }

    for criterion in subsidy.get("criteria", []):
        field = criterion.get("field")
        placeholder_key = criteria_status_map.get(field)
        if placeholder_key:
            user_answer = advice_request.answers.get(field, False)
            is_met_text = "満たしている" if user_answer else "満たしていない、または回答なし"
            prompt_placeholders[placeholder_key] = is_met_text

        # プロンプトテンプレートに情報を埋め込む
        final_prompt = prompt_template.format(
            user_answers=formatted_answers,
            input_mode=advice_request.input_mode,
            **prompt_placeholders
        )

        security_logger.info(f"LLM prompt generated for subsidy: {advice_request.subsidy_id}")
        return {"prompt": final_prompt}
    except Exception as e:
        security_logger.error(f"Failed to generate application advice: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate application advice")

@app.post("/save_desire")
async def save_desire(desire_request: DesireRequest):
    """事業承継者の回答をセキュアに保存（REQ-SEC-002, REQ-SEC-006）"""
    try:
        secure_file_manager = get_secure_file_manager()
        
        formatted_desire = ""
        for item in desire_request.answers:
            formatted_desire += f"Q: {item.question}\nA: {item.answer}\n\n"

        # セキュアなファイル書き込み
        secure_file_manager.secure_file_write(formatted_desire, "desire.txt")
        
        security_logger.info("Desire saved securely")
        return {"message": "Desire saved successfully"}
    except Exception as e:
        security_logger.error(f"Failed to save desire: {e}")
        raise HTTPException(status_code=500, detail="Failed to save desire")

@app.post("/generate_textbook")
async def generate_textbook(textbook_request: TextbookRequest):
    """教科書をセキュアに生成（REQ-SEC-002, REQ-SEC-006）"""
    try:
        secure_file_manager = get_secure_file_manager()
        
        # セキュアな一時ファイルを作成
        temp_file_path = secure_file_manager.create_secure_temp_file(".docx")
        
        # ファイル生成
        generate_word(temp_file_path, textbook_request.content)

        return FileResponse(
            temp_file_path, 
            media_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
            filename="経営者の教科書.docx"
        )
    except Exception as e:
        security_logger.error(f"Failed to generate textbook: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate textbook")

@app.post("/generate_business_plan")
async def generate_business_plan(business_plan_request: BusinessPlanRequest):
    """事業計画書をセキュアに生成（REQ-SEC-002, REQ-SEC-006）"""
    try:
        secure_file_manager = get_secure_file_manager()
        
        # セキュアな一時ファイルを作成
        temp_file_path = secure_file_manager.create_secure_temp_file(".docx")
        
        # データをJSONに変換
        plan_data = business_plan_request.dict(exclude_none=True)
        
        # ファイル生成
        generate_word(temp_file_path, json.dumps(plan_data, ensure_ascii=False, indent=2))

        return FileResponse(
            temp_file_path, 
            media_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
            filename="事業計画書.docx"
        )
    except Exception as e:
        security_logger.error(f"Failed to generate business plan: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate business plan")
