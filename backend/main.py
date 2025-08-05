from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import FileResponse
from word_generator import generate_word
import os
import json
import yaml
from fastapi.middleware.cors import CORSMiddleware

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

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
async def generate_application_advice(request: Request):
    """ユーザーの回答に基づき、申請書作成のためのAIアドバイスを生成します。"""
    # TODO: LLM呼び出しロジックを実装
    data = await request.json()
    subsidy_id = data.get("subsidy_id")
    answers = data.get("answers")
    input_mode = data.get("input_mode")

    # ダミーレスポンス
    advice = {
        "overall_feedback": "素晴らしい計画の第一歩です！以下の点を改善すると、さらに説得力が増します。",
        "detailed_advice": [
            {"item": "新規性・革新性", "feedback": "「新しい」という点を、具体的な市場データや競合比較でさらに裏付けましょう。"},
            {"item": "事業の有望度", "feedback": "ターゲット顧客の解像度をさらに上げ、その顧客がなぜあなたのサービスを選ぶのかを明確にしましょう。"},
            {"item": "事業の実現可能性", "feedback": "資金計画について、融資以外の選択肢も検討すると、計画の柔軟性が高まります。"}
        ]
    }
    return {"advice": advice}

@app.post("/save_desire")
async def save_desire(request: Request):
    data = await request.json()
    answers_data = data.get("answers")

    if not answers_data:
        return {"error": "Answers data not found"}, 400

    formatted_desire = ""
    for item in answers_data:
        formatted_desire += f"Q: {item['question']}\nA: {item['answer']}\n\n"

    with open("desire.txt", "w", encoding="utf-8") as f:
        f.write(formatted_desire)

    return {"message": "Desire saved successfully"}

@app.post("/generate_textbook")
async def generate_textbook(request: Request):
    data = await request.json()
    content = data.get("content", "ここにアドバイスが表示されます。")
    file_path = "textbook.docx"

    generate_word(file_path, content)

    return FileResponse(
        file_path, 
        media_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
        filename="経営者の教科書.docx"
    )

@app.post("/generate_business_plan")
async def generate_business_plan(request: Request):
    data = await request.json()
    file_path = "business_plan.docx"

    generate_word(file_path, json.dumps(data, ensure_ascii=False, indent=2))

    return FileResponse(
        file_path, 
        media_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
        filename="事業計画書.docx"
    )
