from pydantic import BaseModel, Field, validator, EmailStr
from typing import List, Dict, Optional, Any
import re

class DesireAnswer(BaseModel):
    """事業承継者の回答データモデル"""
    question: str = Field(..., max_length=1000, description="質問内容")
    answer: str = Field(..., max_length=5000, description="回答内容")
    
    @validator('question', 'answer')
    def validate_content(cls, v):
        """危険な文字を含まないことを確認"""
        dangerous_chars = ['<', '>', '"', "'", '&', 'script', 'javascript']
        for char in dangerous_chars:
            if char.lower() in v.lower():
                raise ValueError(f"Dangerous content detected: {char}")
        return v

class DesireRequest(BaseModel):
    """事業承継者の回答リクエストモデル"""
    answers: List[DesireAnswer] = Field(..., max_items=50, description="回答リスト")
    
    @validator('answers')
    def validate_answers_length(cls, v):
        """回答数の制限"""
        if len(v) > 50:
            raise ValueError("Too many answers")
        return v

class ApplicationAdviceRequest(BaseModel):
    """申請書アドバイス生成リクエストモデル"""
    subsidy_id: str = Field(..., max_length=50, description="補助金ID")
    answers: Dict[str, Any] = Field(..., description="回答データ")
    input_mode: str = Field(..., pattern="^(simple|guided|micro_tasks|integrated)$", description="入力モード")
    target: str = Field(..., pattern="^(ai|human|self)$", description="生成するアウトプットのターゲット")
    
    @validator('subsidy_id')
    def validate_subsidy_id(cls, v):
        """補助金IDの形式検証"""
        if not re.match(r'^[a-zA-Z0-9_-]+$', v):
            raise ValueError("Invalid subsidy ID format")
        return v

class TextbookRequest(BaseModel):
    """教科書生成リクエストモデル"""
    content: str = Field(..., max_length=10000, description="教科書内容")
    
    @validator('content')
    def validate_content(cls, v):
        """内容の安全性検証"""
        if len(v) > 10000:
            raise ValueError("Content too long")
        return v

class BusinessPlanRequest(BaseModel):
    """事業計画書生成リクエストモデル"""
    business_summary: Optional[str] = Field(None, max_length=2000, description="事業概要")
    market_analysis: Optional[str] = Field(None, max_length=2000, description="市場分析")
    competitive_advantage: Optional[str] = Field(None, max_length=2000, description="競合優位性")
    products_services: Optional[str] = Field(None, max_length=2000, description="製品・サービス")
    marketing_strategy: Optional[str] = Field(None, max_length=2000, description="マーケティング戦略")
    revenue_plan: Optional[str] = Field(None, max_length=2000, description="収益計画")
    funding_plan: Optional[str] = Field(None, max_length=2000, description="資金計画")
    implementation_structure: Optional[str] = Field(None, max_length=2000, description="実施体制")
    
    @validator('*')
    def validate_all_fields(cls, v):
        """全フィールドの安全性検証"""
        if v is not None:
            dangerous_chars = ['<', '>', '"', "'", '&', 'script', 'javascript']
            for char in dangerous_chars:
                if char.lower() in v.lower():
                    raise ValueError(f"Dangerous content detected: {char}")
        return v

class SubsidyMetadata(BaseModel):
    """補助金メタデータモデル"""
    id: str = Field(..., max_length=50, description="補助金ID")
    name: str = Field(..., max_length=200, description="補助金名")
    description: Optional[str] = Field(None, max_length=1000, description="説明")
    url: Optional[str] = Field(None, max_length=500, description="公式URL")
    last_updated: Optional[str] = Field(None, max_length=50, description="最終更新日")

class SubsidyQuestion(BaseModel):
    """補助金質問項目モデル"""
    id: str = Field(..., max_length=50, description="質問ID")
    question: str = Field(..., max_length=1000, description="質問内容")
    type: str = Field(..., pattern="^(boolean|text|number)$", description="質問タイプ")
    required: bool = Field(default=True, description="必須項目かどうか")

class SubsidyScoringFactor(BaseModel):
    """補助金審査項目モデル"""
    key: str = Field(..., max_length=50, description="審査項目キー")
    description: str = Field(..., max_length=1000, description="審査項目説明")
    simple: Optional[str] = Field(None, max_length=2000, description="シンプル入力モード")
    guided: Optional[List[str]] = Field(None, max_items=20, description="ガイド付き入力モード")

class ApplicationQuestions(BaseModel):
    """申請書質問項目モデル"""
    criteria: List[SubsidyQuestion] = Field(default=[], description="必須要件")
    scoring_factors: Dict[str, SubsidyScoringFactor] = Field(default={}, description="審査項目")

class ApplicationAdvice(BaseModel):
    """申請書アドバイスモデル"""
    overall_feedback: str = Field(..., max_length=2000, description="全体的なフィードバック")
    detailed_advice: List[Dict[str, str]] = Field(..., max_items=20, description="詳細アドバイス")
    
    @validator('detailed_advice')
    def validate_advice_items(cls, v):
        """アドバイス項目の検証"""
        for item in v:
            if 'item' not in item or 'feedback' not in item:
                raise ValueError("Invalid advice item format")
        return v

class ContactRequest(BaseModel):
    """お問い合わせフォームリクエストモデル"""
    name: str = Field(..., max_length=100, description="お名前")
    email: EmailStr = Field(..., description="メールアドレス")
    subject: str = Field(..., max_length=200, description="件名")
    message: str = Field(..., max_length=2000, description="メッセージ")
    attachment_info: Optional[str] = Field(None, max_length=500, description="添付ファイル情報")
    
    @validator('name', 'subject', 'message')
    def validate_content(cls, v):
        """危険な文字を含まないことを確認"""
        dangerous_chars = ['<', '>', '"', "'", '&', 'script', 'javascript']
        for char in dangerous_chars:
            if char.lower() in v.lower():
                raise ValueError(f"Dangerous content detected: {char}")
        return v