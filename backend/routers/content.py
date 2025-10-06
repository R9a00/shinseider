"""コンテンツ関連のAPIエンドポイント"""
from fastapi import APIRouter, HTTPException
import yaml
import os
import logging

router = APIRouter(prefix="/api/content", tags=["content"])

# ロガー設定
security_logger = logging.getLogger("security")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

@router.get("/version-history")
async def get_version_history():
    """全体のバージョン履歴を取得"""
    try:
        version_data_path = os.path.join(BASE_DIR, "version_history.yaml")
        with open(version_data_path, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)
        return data
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Version history not found")
    except Exception as e:
        security_logger.error(f"Failed to load version history: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load version history")

@router.get("/news")
async def get_news():
    """ニュース一覧を取得"""
    try:
        news_path = os.path.join(BASE_DIR, "news_content.yaml")
        with open(news_path, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)
        return data
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="News data not found")
    except Exception as e:
        security_logger.error(f"Failed to load news: {str(e)}")
        raise HTTPException(status_code=500, detail=f"ニュースデータの取得に失敗しました: {str(e)}")

@router.get("/knowledge-base")
async def get_knowledge_base():
    """基礎知識データを取得"""
    try:
        knowledge_path = os.path.join(BASE_DIR, "knowledge_base.yaml")
        with open(knowledge_path, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)
        return data
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Knowledge base not found")
    except Exception as e:
        security_logger.error(f"Failed to load knowledge base: {str(e)}")
        raise HTTPException(status_code=500, detail=f"基礎知識データの取得に失敗しました: {str(e)}")

@router.get("/subsidy-selection")
async def get_subsidy_selection():
    """補助金選択データを取得"""
    try:
        selection_path = os.path.join(BASE_DIR, "subsidy_selection.yaml")
        with open(selection_path, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)
        return data
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Subsidy selection data not found")
    except Exception as e:
        security_logger.error(f"Failed to load subsidy selection: {str(e)}")
        raise HTTPException(status_code=500, detail=f"補助金選択データの取得に失敗しました: {str(e)}")

@router.get("/knowledge-base/{section_id}")
async def get_knowledge_section(section_id: str):
    """指定されたセクションの基礎知識データを取得"""
    try:
        knowledge_path = os.path.join(BASE_DIR, "knowledge_base.yaml")
        with open(knowledge_path, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)
        
        # セクションデータを検索
        sections = data.get("sections", [])
        for section in sections:
            if section.get("id") == section_id:
                return section
        
        raise HTTPException(status_code=404, detail="Section not found")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Knowledge base not found")
    except Exception as e:
        security_logger.error(f"Failed to load knowledge section: {str(e)}")
        raise HTTPException(status_code=500, detail=f"基礎知識データの取得に失敗しました: {str(e)}")

@router.get("/public-change-history")
async def get_public_change_history():
    """公開用の変更履歴を取得"""
    try:
        change_history_path = os.path.join(BASE_DIR, "public_change_history.yaml")
        
        if not os.path.exists(change_history_path):
            return {
                "changes": [],
                "last_updated": None,
                "message": "変更履歴データが見つかりません"
            }
        
        with open(change_history_path, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)
        
        return data
    except Exception as e:
        security_logger.error(f"Failed to load change history: {str(e)}")
        raise HTTPException(status_code=500, detail=f"変更履歴の取得に失敗しました: {str(e)}")

@router.get("/subsidy-investigation-status")
async def get_subsidy_investigation_status():
    """補助金調査状況を取得"""
    try:
        investigation_status_path = os.path.join(BASE_DIR, "subsidy_investigation_status.yaml")
        
        if not os.path.exists(investigation_status_path):
            return {
                "subsidies": [],
                "last_updated": None,
                "message": "調査状況データが見つかりません"
            }
        
        with open(investigation_status_path, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)
        
        return data
    except Exception as e:
        security_logger.error(f"Failed to load investigation status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"調査状況の取得に失敗しました: {str(e)}")

@router.get("/public-update-report")
async def get_public_update_report():
    """公開用の更新レポートを取得"""
    try:
        update_report_path = os.path.join(BASE_DIR, "public_update_report.yaml")
        
        if not os.path.exists(update_report_path):
            return {
                "reports": [],
                "last_updated": None,
                "message": "更新レポートが見つかりません"
            }
        
        with open(update_report_path, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)
        
        return data
    except Exception as e:
        security_logger.error(f"Failed to load update report: {str(e)}")
        raise HTTPException(status_code=500, detail=f"更新レポートの取得に失敗しました: {str(e)}")