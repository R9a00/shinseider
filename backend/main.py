from fastapi import FastAPI, Request
from fastapi.responses import FileResponse
from middleware.verify_hash import VerifyHashMiddleware
from pdf_generator import generate_pdf
from word_generator import generate_word
import os
import json
from fastapi.middleware.cors import CORSMiddleware

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

@app.post("/save_desire")
async def save_desire(request: Request):
    data = await request.json()
    desire = data.get("desire")

    if not desire:
        return {"error": "Desire not found"}, 400

    # やりたいことをファイルに保存
    with open("desire.txt", "w") as f:
        f.write(desire)

    return {"message": "Desire saved successfully"}

@app.post("/generate_textbook")
async def generate_textbook(request: Request):
    data = await request.json()
    title = data.get("title", "経営者の教科書")
    content = data.get("content", "ここにアドバイスが表示されます。")
    file_path = "textbook.docx" # PDFからDOCXに変更

    generate_word(file_path, content) # generate_pdfからgenerate_wordに変更

    return FileResponse(file_path, media_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document', filename="経営者の教科書.docx") # media_typeとfilenameを変更

@app.post("/fundraising_application")
async def fundraising_application(request: Request):
    data = await request.json()
    with open("fundraising_application.json", "w") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    return {"message": "Application received successfully"}

@app.post("/generate_business_plan")
async def generate_business_plan(request: Request):
    data = await request.json()
    content = data.get("content", "")
    file_path = "business_plan.docx"

    generate_word(file_path, content)

    return FileResponse(file_path, media_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document', filename="事業計画書.docx")
