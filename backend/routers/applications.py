"""申請書作成関連のAPIエンドポイント"""
from fastapi import APIRouter, HTTPException, Form, UploadFile, File
from pydantic import BaseModel
import yaml
import os
import logging
import json
from datetime import datetime
from typing import Optional

router = APIRouter(prefix="/api/applications", tags=["applications"])

# ロガー設定
security_logger = logging.getLogger("security")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# データモデル
class ApplicationAdviceRequest(BaseModel):
    subsidy_id: str
    application_data: dict
    additional_questions: dict = {}

class DesireRequest(BaseModel):
    desire: str

class TextbookRequest(BaseModel):
    subsidy_id: str
    business_type: str
    specific_needs: str = ""

class ApplicationDataRequest(BaseModel):
    subsidy_id: str
    application_data: dict

class BusinessPlanRequest(BaseModel):
    subsidy_id: str
    business_overview: str
    goals: str
    implementation_plan: str
    budget: dict

class ContactRequest(BaseModel):
    name: str
    email: str
    phone: str = ""
    company: str = ""
    message: str

@router.post("/generate-advice")
async def generate_application_advice(request: ApplicationAdviceRequest):
    """申請書作成のアドバイスを生成"""
    try:
        # 補助金情報を取得
        master_data_path = os.path.join(BASE_DIR, "subsidy_master.yaml")
        with open(master_data_path, "r", encoding="utf-8") as f:
            master_data = yaml.safe_load(f)
        
        subsidies = master_data.get("subsidies", {})
        subsidy = subsidies.get(request.subsidy_id)
        if not subsidy:
            raise HTTPException(status_code=404, detail="Subsidy not found")
        
        # アドバイス生成（簡略版）
        advice = {
            "subsidy_name": subsidy.get("name"),
            "general_advice": [
                "申請書は詳細かつ具体的に記載してください",
                "事業計画書では明確な目標と実現可能性を示してください",
                "予算計画は根拠を持って作成してください"
            ],
            "specific_advice": [],
            "required_documents": subsidy.get("required_documents", []),
            "important_points": subsidy.get("important_points", [])
        }
        
        return advice
        
    except HTTPException:
        raise
    except Exception as e:
        security_logger.error(f"Failed to generate application advice: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate application advice")

@router.post("/save-desire")
async def save_desire(request: DesireRequest):
    """希望情報を保存"""
    try:
        # ユーザーの希望を簡単に保存（実際のDBの代わりにファイル保存）
        desire_data = {
            "desire": request.desire,
            "timestamp": datetime.now().isoformat()
        }
        
        return {"message": "希望情報を保存しました", "data": desire_data}
        
    except Exception as e:
        security_logger.error(f"Failed to save desire: {e}")
        raise HTTPException(status_code=500, detail="Failed to save desire")

@router.post("/generate-textbook")
async def generate_textbook(request: TextbookRequest):
    """事業計画書のテンプレート生成"""
    try:
        # 補助金情報を取得
        master_data_path = os.path.join(BASE_DIR, "subsidy_master.yaml")
        with open(master_data_path, "r", encoding="utf-8") as f:
            master_data = yaml.safe_load(f)
        
        subsidies = master_data.get("subsidies", {})
        subsidy = subsidies.get(request.subsidy_id)
        if not subsidy:
            raise HTTPException(status_code=404, detail="Subsidy not found")
        
        # テンプレート生成（簡略版）
        textbook = {
            "subsidy_name": subsidy.get("name"),
            "business_type": request.business_type,
            "sections": [
                {
                    "title": "事業概要",
                    "content": "事業の目的と概要を記載してください",
                    "guidelines": ["具体的な事業内容", "対象市場", "競合優位性"]
                },
                {
                    "title": "実施計画",
                    "content": "事業の実施スケジュールを記載してください",
                    "guidelines": ["実施期間", "主要マイルストーン", "リスク対策"]
                },
                {
                    "title": "予算計画",
                    "content": "事業に必要な予算を詳細に記載してください",
                    "guidelines": ["人件費", "設備費", "その他経費"]
                }
            ]
        }
        
        return textbook
        
    except HTTPException:
        raise
    except Exception as e:
        security_logger.error(f"Failed to generate textbook: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate textbook")

@router.post("/save-data")
async def save_application_data(request: ApplicationDataRequest):
    """申請データを保存"""
    try:
        # 申請データを保存（実際のDBの代わりにファイル保存）
        save_data = {
            "subsidy_id": request.subsidy_id,
            "application_data": request.application_data,
            "timestamp": datetime.now().isoformat()
        }
        
        return {"message": "申請データを保存しました", "data": save_data}
        
    except Exception as e:
        security_logger.error(f"Failed to save application data: {e}")
        raise HTTPException(status_code=500, detail="Failed to save application data")

@router.post("/generate-business-plan")
async def generate_business_plan(request: BusinessPlanRequest):
    """事業計画書を生成"""
    try:
        # 事業計画書生成（簡略版）
        business_plan = {
            "subsidy_id": request.subsidy_id,
            "business_overview": request.business_overview,
            "goals": request.goals,
            "implementation_plan": request.implementation_plan,
            "budget": request.budget,
            "generated_sections": {
                "executive_summary": "事業の要約をここに記載",
                "market_analysis": "市場分析をここに記載",
                "financial_projections": "財務予測をここに記載"
            },
            "timestamp": datetime.now().isoformat()
        }
        
        return business_plan
        
    except Exception as e:
        security_logger.error(f"Failed to generate business plan: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate business plan")

@router.post("/send-contact")
async def send_contact(
    name: str = Form(...),
    email: str = Form(...),
    subject: str = Form(...),
    message: str = Form(...),
    attachment: Optional[UploadFile] = File(None)
):
    """お問い合わせを送信（FormDataでファイルアップロード対応）"""
    try:
        # ファイルが添付されている場合の処理
        attachment_info = None
        if attachment:
            # ファイルサイズチェック（5MB）
            if attachment.size and attachment.size > 5 * 1024 * 1024:
                raise HTTPException(status_code=400, detail="ファイルサイズが大きすぎます（5MB以下にしてください）")
            
            # ファイル形式チェック
            allowed_types = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'image/jpeg',
                'image/jpg',
                'image/png',
                'image/gif'
            ]
            
            if attachment.content_type not in allowed_types:
                raise HTTPException(status_code=400, detail="許可されていないファイル形式です（PDF, Word, Excel, 画像のみ）")
            
            attachment_info = {
                "filename": attachment.filename,
                "content_type": attachment.content_type,
                "size": attachment.size
            }
        
        # お問い合わせデータを保存（実際のメール送信の代わり）
        contact_data = {
            "name": name,
            "email": email,
            "subject": subject,
            "message": message,
            "attachment": attachment_info,
            "timestamp": datetime.now().isoformat()
        }
        
        # 実際の実装では、ここでメール送信やデータベース保存を行う
        security_logger.info(f"Contact received from {email} with subject: {subject}")
        if attachment:
            security_logger.info(f"Attachment: {attachment.filename} ({attachment.content_type})")
        
        return {"message": "お問い合わせを受け付けました。確認後、ご連絡いたします。"}
        
    except HTTPException:
        raise
    except Exception as e:
        security_logger.error(f"Failed to send contact email: {e}")
        raise HTTPException(status_code=500, detail="メール送信に失敗しました")