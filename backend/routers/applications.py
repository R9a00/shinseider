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

# ヘルパー関数
def mask_sensitive_data(answers):
    """AI相談用に機密情報をマスキング"""
    if not answers:
        return answers
    
    masked_answers = {}
    
    for section_id, section_data in answers.items():
        if isinstance(section_data, dict):
            masked_section = {}
            for key, value in section_data.items():
                # 具体的なフィールド名でマスキング
                if key in ['MINI_005_NAME', 'name', '名前']:
                    masked_section[key] = "[匿名]"
                elif key in ['MINI_006_COMPANY', 'company', '会社名', '会社']:
                    masked_section[key] = "[会社名]"
                elif 'EMAIL' in key.upper() or 'メール' in key:
                    masked_section[key] = "[メールアドレス]"
                elif 'PHONE' in key.upper() or '電話' in key:
                    masked_section[key] = "[電話番号]"
                elif 'ADDRESS' in key.upper() or '住所' in key:
                    masked_section[key] = "[住所]"
                # 一般的なパターンもチェック
                elif any(field in key.upper() for field in ['NAME', 'COMPANY']) and isinstance(value, str):
                    if 'NAME' in key.upper():
                        masked_section[key] = "[匿名]"
                    elif 'COMPANY' in key.upper():
                        masked_section[key] = "[会社名]"
                    else:
                        masked_section[key] = "[非公開]"
                else:
                    masked_section[key] = value
            masked_answers[section_id] = masked_section
        else:
            masked_answers[section_id] = section_data
    
    return masked_answers

def generate_ai_prompt(subsidy, answers, input_mode):
    """AI用プロンプト生成（プライバシー保護版）"""
    subsidy_name = subsidy.get("name", "補助金")
    
    # AI相談の場合は機密情報をマスキング
    answers_text = format_answers_for_prompt(answers, input_mode, mask_data=True)
    
    # 補助金固有のプロンプトテンプレートがある場合はそれを使用
    prompt_template = subsidy.get("llm_prompt_template")
    if prompt_template:
        return prompt_template.format(user_answers=answers_text)
    
    # デフォルトのプロンプト（後方互換性のため）
    prompt = f"""あなたは{subsidy_name}申請の専門アドバイザーです。以下の申請内容を分析し、採択率を高めるための具体的で実行可能な改善提案を提供してください。

# 申請内容
{answers_text}

# あなたの役割
- 補助金審査員の視点から客観的に評価する
- 具体的で実行可能な改善案を提示する
- 根拠となるデータや情報源を示す
- 優先度の高い改善点から順番に整理する

# 分析して回答すべき項目

## 1. 現状評価（強み・弱み）
申請内容の優れている点と不足している点を具体的に指摘してください。

## 2. 重要度高：即座に改善すべき点
採択に大きく影響する、緊急度の高い改善点を3つ挙げてください。各項目について：
- 何が問題か
- なぜ改善が必要か  
- 具体的な改善方法
- 改善の目安となる基準

## 3. 根拠強化：データ・証拠の補強
申請書の説得力を高めるために必要な調査や資料を具体的に示してください。

## 4. 差別化戦略
競合他社との違いを明確にし、独自性をアピールする方法を提案してください。

## 5. 実現可能性の向上
計画の実行可能性を高めるための具体的な改善案を提示してください。

各項目について、実行しやすい順序で整理し、期限の目安も含めて回答してください。"""
    
    return prompt

def generate_human_summary(subsidy, answers, input_mode):
    """専門家相談用サマリー生成"""
    subsidy_name = subsidy.get("name", "補助金")
    answers_text = format_answers_for_prompt(answers, input_mode)
    
    summary = f"""専門家への相談事項

事業内容
{answers_text}

お聞きしたいこと

1. この事業アイデアの独自性をもっと強くアピールするには、どのような点を強調すべきでしょうか？

2. ターゲット市場の規模や成長性を示すために、どのようなデータを調査・収集すべきでしょうか？

3. この事業を実現するために見落としている準備や課題があれば教えてください。

4. 収益予測について、業界水準や市場実態と比較してのご意見をお聞かせください。

5. 初期投資や運転資金の調達で、効果的な方法があれば教えてください。

6. 申請書類で最も効果的にアピールする構成や表現方法を教えてください。

7. この補助金の審査で特に重視されるポイントがあれば教えてください。"""
    
    return summary

def generate_self_reflection(subsidy, answers, input_mode):
    """自己評価用問いかけ生成（元の形式）"""
    answers_text = format_answers_for_prompt(answers, input_mode)
    
    self_reflection = f"""申請書の自己チェックリスト

あなたの入力内容
{answers_text}

自分で確認してみましょう

事業アイデアの魅力度チェック
□ 似たようなサービス・事業と比べて、明確な違いを3つ説明できますか？
□ ターゲット顧客が「これは欲しい」と思う理由を具体的に説明できますか？
□ 「どれくらいの人が使ってくれそうか」を数字で説明できますか？

実現可能性チェック
□ この事業を成功させるのに必要なスキルや経験は身についていますか？
□ 人・物・お金の準備はできていますか？不足分の調達方法は決まっていますか？
□ マイルストーンの日程は現実的で達成可能ですか？

収益計画チェック
□ 売上予測の根拠は説得力がありますか？「なんとなく」になっていませんか？
□ 必要な費用をもれなく計算できていますか？
□ きちんと利益が出る計画になっていますか？

伝わりやすさチェック
□ 事業内容を30秒で説明できますか？
□ なぜあなたがこの事業をやるのか、心に響くストーリーがありますか？
□ 主張を裏付ける具体的な数字やデータが入っていますか？

改善のヒント
上記でチェックが付かない項目について、以下を試してみてください：

1. 足りない情報やデータを調べる
2. 感覚的な表現を具体的な数字に変える  
3. 家族や友人に説明してみて反応を確認
4. 似たサービスをもう一度詳しく調べる
5. 上記で不安な点があれば専門家に相談する

最終確認
全ての項目にチェックが付いたら、あなたの申請書は審査員にしっかり伝わる内容になっています。"""
    
    return self_reflection

def generate_general_advice(subsidy, answers, input_mode):
    """一般的なアドバイス生成"""
    subsidy_name = subsidy.get("name", "補助金")
    
    advice = f"""# {subsidy_name}申請のための一般的なアドバイス

## 申請書作成のポイント
1. **具体性を重視**
   - 抽象的な表現を避け、具体的な数値や事例を記載
   - 「効果的な」「画期的な」などの曖昧な表現は根拠と共に

2. **審査員の視点で考える**
   - 申請書は審査員にとって理解しやすい構成に
   - 専門用語は適切な説明を付加

3. **実現可能性を示す**
   - 計画の実行に必要な体制・設備・資金を明確に
   - リスクの認識と対策を具体的に記載

## 申請成功のコツ
- 制度の目的と自社の事業目標の整合性を明確に
- 競合他社との差別化ポイントを強調
- 事業の社会的意義や波及効果を記載
- 過去の実績や信頼性を適切にアピール

頑張ってください！"""
    
    return advice

def format_answers_for_prompt(answers, input_mode, mask_data=False):
    """回答データを見やすい形式に整形"""
    if not answers:
        return "（まだ入力されていません）"
    
    # マスキング処理
    if mask_data:
        answers = mask_sensitive_data(answers)
    
    try:
        import json
        formatted_lines = []
        
        for section_id, section_data in answers.items():
            if isinstance(section_data, dict):
                for key, value in section_data.items():
                    if value:
                        if isinstance(value, list) and value and isinstance(value[0], dict):
                            # マイルストーンなどの辞書のリスト
                            milestone_text = []
                            for item in value:
                                if isinstance(item, dict) and 'date' in item and 'content' in item:
                                    milestone_text.append(f"{item.get('date', '')} {item.get('content', '')} (担当: {item.get('owner', '')})")
                                else:
                                    milestone_text.append(json.dumps(item, ensure_ascii=False))
                            formatted_lines.append(f"- {key}: {' | '.join(milestone_text)}")
                        elif isinstance(value, list):
                            # 通常のリスト
                            formatted_lines.append(f"- {key}: {', '.join(str(v) for v in value)}")
                        else:
                            # その他の値
                            formatted_lines.append(f"- {key}: {str(value)}")
            elif section_data:
                formatted_lines.append(f"- {section_id}: {str(section_data)}")
        
        return "\n".join(formatted_lines) if formatted_lines else "（入力データが不十分です）"
    
    except Exception as e:
        security_logger.error(f"Error in format_answers_for_prompt: {e}")
        return f"（データ処理エラー: {str(e)}）"

# データモデル
class ApplicationAdviceRequest(BaseModel):
    subsidy_id: str
    answers: dict = {}
    application_data: dict = None
    input_mode: str = "micro_tasks"
    target: str = "ai"
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
        
        # ユーザーの入力データを分析
        answers = request.answers or request.application_data or {}
        target = request.target
        
        # ターゲットに応じた出力生成
        if target == 'ai':
            output = generate_ai_prompt(subsidy, answers, request.input_mode)
            output_type = 'prompt'
        elif target == 'human':
            output = generate_human_summary(subsidy, answers, request.input_mode)
            output_type = 'summary'
        elif target == 'self':
            output = generate_self_reflection(subsidy, answers, request.input_mode)
            output_type = 'reflection'
        else:
            output = generate_general_advice(subsidy, answers, request.input_mode)
            output_type = 'general'
        
        return {
            "output": output,
            "type": output_type,
            "subsidy_name": subsidy.get("name")
        }
        
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