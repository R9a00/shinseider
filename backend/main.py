from fastapi import FastAPI, Request
from fastapi.responses import FileResponse
# from .middleware.verify_hash import VerifyHashMiddleware
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

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 環境変数から秘密鍵を読み込む
SECRET_KEY = os.environ.get("SECRET_KEY", "default_secret_key")

# app.add_middleware(VerifyHashMiddleware, secret_key=SECRET_KEY)

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/webhook")
async def webhook(request: dict):
    return {"message": "Webhook received successfully"}

@app.get("/get_subsidy_questions")
async def get_subsidy_questions(purpose: str = None):
    subsidies = load_subsidy_data()
    questions = []
    for subsidy in subsidies:
        # purposeが指定されている場合のみフィルタリング
        if purpose is not None and subsidy.get("purpose") != purpose:
            continue
        for criterion in subsidy.get("criteria", []):
            if "display_question" in criterion:
                question_item = {"id": subsidy["id"] + "_" + criterion["field"], "question": criterion["display_question"]}
                questions.append(question_item)
    return {"questions": questions}

@app.post("/save_desire")
async def save_desire(request: Request):
    data = await request.json()
    answers_data = data.get("answers")

    if not answers_data:
        return {"error": "Answers data not found"}, 400

    formatted_desire = ""
    for item in answers_data:
        formatted_desire += f"Q: {item['question']}\nA: {item['answer']}\n\n"

    # やりたいことをファイルに保存
    with open("desire.txt", "w") as f:
        f.write(formatted_desire)

    return {"message": "Desire saved successfully"}

@app.post("/generate_textbook")
async def generate_textbook(request: Request):
    data = await request.json()
    title = data.get("title", "経営者の教科書")
    content = data.get("content", "ここにアドバイスが表示されます。")
    file_path = "textbook.docx" # PDFからDOCXに変更

    generate_word(file_path, content) # generate_pdfからgenerate_wordに変更

    return FileResponse(file_path, media_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document', filename="経営者の教科書.docx") # media_typeとfilenameを変更

@app.post("/subsidy_recommendation")
async def subsidy_recommendation(request: Request):
    data = await request.json()

    recommendations = []
    subsidies_data = load_subsidy_data()

    for subsidy in subsidies_data:
        # 要件チェック
        is_eligible = True
        for req in subsidy.get("criteria", []):
            field_name = req["field"]
            user_value = data.get(field_name)

            if req["type"] == "field_match":
                if user_value != req["value"]:
                    is_eligible = False
                    break
            elif req["type"] == "field_comparison":
                if user_value is None:
                    is_eligible = False
                    break
                if req["operator"] == "less_than":
                    if not (user_value < req["value"]):
                        is_eligible = False
                        break
                elif req["operator"] == "greater_than_or_equal":
                    if not (user_value >= req["value"]):
                        is_eligible = False
                        break
                elif req["operator"] == "is_met":
                    if not bool(user_value) == bool(req["value"]):
                        is_eligible = False
                        break

        if is_eligible:
            # スコアリング
            score = 0
            for sf in subsidy.get("scoring_factors", []):
                # ここにユーザーの回答とsf["related_user_data"]を比較し、スコアを計算するロジックを実装
                score += sf.get("weight", 0) * 100 # weightを考慮したスコア計算

            # アドバイス生成
            advice = []
            advice.extend(subsidy.get("advice_points", []))
            for sf in subsidy.get("scoring_factors", []):
                if sf.get("guidance_prompt"): # LLM連携用のプロンプトをアドバイスとして追加
                    advice.append(sf["guidance_prompt"])
            advice.extend(subsidy.get("common_mistakes", []))

            recommendations.append({
                "name": subsidy["name"],
                "description": subsidy["description"],
                "max_amount": subsidy["max_amount"],
                "eligible_expenses": subsidy["eligible_expenses"],
                "application_period": subsidy["application_period"],
                "official_url": subsidy.get("official_url", ""),
                "score": score,
                "advice": advice
            })

    # スコアでソート
    recommendations.sort(key=lambda x: x["score"], reverse=True)

    return {"subsidies": recommendations}

@app.post("/generate_business_plan")
async def generate_business_plan(request: Request):
    data = await request.json()
    file_path = "business_plan.docx"

    # word_generator.pyに構造化されたデータを渡す
    generate_word(file_path, json.dumps(data, ensure_ascii=False, indent=2))

    return FileResponse(file_path, media_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document', filename="事業計画書.docx")