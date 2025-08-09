from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.responses import FileResponse, JSONResponse
from word_generator import generate_word
import os
import json
import yaml
from fastapi.middleware.cors import CORSMiddleware
from middleware.security import SecurityMiddleware, ErrorHandlingMiddleware, RateLimitMiddleware
from models import DesireRequest, ApplicationAdviceRequest, TextbookRequest, BusinessPlanRequest
from secure_file_utils import get_secure_file_manager
import logging

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# セキュリティログの設定
logging.basicConfig(level=logging.INFO)
security_logger = logging.getLogger("security")

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
    if not subsidy:
        raise HTTPException(status_code=404, detail="Subsidy not found")
    return {"id": subsidy.get("id"), "name": subsidy.get("name")}

@app.get("/get_application_questions/{subsidy_id}")
async def get_application_questions(subsidy_id: str):
    """指定された補助金の申請書作成に必要な質問項目（セクション）を取得します。"""
    subsidies_data = load_subsidy_data()
    subsidy = next((s for s in subsidies_data if s.get("id") == subsidy_id), None)
    if not subsidy:
        raise HTTPException(status_code=404, detail="Subsidy not found")

    sections = subsidy.get("sections", [])
    return {"sections": sections}

@app.post("/generate_application_advice")
async def generate_application_advice(advice_request: ApplicationAdviceRequest):
    """ユーザーの回答と目的に応じて、多様なアウトプットを生成します。"""
    try:
        subsidies_data = load_subsidy_data()
        subsidy = next((s for s in subsidies_data if s.get("id") == advice_request.subsidy_id), None)
        if not subsidy:
            raise HTTPException(status_code=404, detail="Subsidy not found")

        prompt_template = subsidy.get("llm_prompt_template")
        if not prompt_template:
            raise HTTPException(status_code=500, detail="Prompt template for this subsidy is not configured.")

        # ユーザーの回答を整形
        def format_answers(answers, sections):
            formatted = ""
            for section in sections:
                section_id = section.get("id")
                if section_id in answers:
                    title = section.get("title", "不明な項目")
                    answer_text = answers.get(section_id, '（回答なし）')
                    formatted += f"▼ {title}\n"
                    formatted += f"A: {answer_text}\n\n"
            return formatted

        formatted_answers = format_answers(advice_request.answers, subsidy.get("sections", []))

        # プロンプトテンプレートに情報を埋め込む
        final_prompt = prompt_template.format(
            user_answers=formatted_answers,
            input_mode=advice_request.input_mode
        )

        # targetに応じた処理は、シンセイダーの設計思想に基づき、
        # フロントエンド側でプロンプトをどう扱うかを決める形に移行することも考えられるが、
        # 一旦、既存の枠組みを維持する。
        if advice_request.target == "ai":
            security_logger.info(f"LLM prompt generated for subsidy: {advice_request.subsidy_id}")
            return {"output": final_prompt, "type": "prompt"}
        elif advice_request.target == "human":
            # human_consultation_pointは新しい構造では定義されていないため、
            # 固定の文言を返すか、あるいはプロンプトをそのまま返す仕様に変更する。
            summary = f"専門家への相談:

{final_prompt}"
            security_logger.info(f"Human consultation summary generated for subsidy: {advice_request.subsidy_id}")
            return {"output": summary, "type": "summary"}
        elif advice_request.target == "self":
            # self_reflection_questionsも新しい構造では定義されていないため、
            # 固定の文言を返すか、あるいはプロンプトをそのまま返す仕様に変更する。
            reflection = f"自己評価用の問いかけ:

{final_prompt}"
            security_logger.info(f"Self-reflection questions generated for subsidy: {advice_request.subsidy_id}")
            return {"output": reflection, "type": "reflection"}
        else:
            raise HTTPException(status_code=400, detail="Invalid target specified.")

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
