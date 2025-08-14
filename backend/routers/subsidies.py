"""補助金関連のAPIエンドポイント"""
from fastapi import APIRouter, HTTPException
import yaml
import os
import logging

router = APIRouter(prefix="/api/subsidies", tags=["subsidies"])

# ロガー設定
security_logger = logging.getLogger("security")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

@router.get("/")
async def get_subsidies():
    """補助金一覧を取得"""
    try:
        with open(os.path.join(BASE_DIR, "subsidies.yaml"), "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)
        return data
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Subsidies data not found")

@router.get("/{subsidy_id}/metadata")
async def get_subsidy_metadata(subsidy_id: str):
    """指定された補助金のメタデータを取得"""
    try:
        # subsidy_master.yamlから読み込み
        master_data_path = os.path.join(BASE_DIR, "subsidy_master.yaml")
        with open(master_data_path, "r", encoding="utf-8") as f:
            master_data = yaml.safe_load(f)
        
        subsidies = master_data.get("subsidies", {})
        subsidy = subsidies.get(subsidy_id)
        if not subsidy:
            raise HTTPException(status_code=404, detail="Subsidy not found")
        
        return subsidy
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Master data not found")
    except Exception as e:
        security_logger.error(f"Failed to get subsidy metadata: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get subsidy metadata")

@router.get("/{subsidy_id}/expense-examples")
async def get_expense_examples(subsidy_id: str):
    """指定された補助金の経費例を取得"""
    try:
        master_data_path = os.path.join(BASE_DIR, "subsidy_master.yaml")
        with open(master_data_path, "r", encoding="utf-8") as f:
            master_data = yaml.safe_load(f)
        
        subsidies = master_data.get("subsidies", {})
        subsidy = subsidies.get(subsidy_id)
        if not subsidy:
            raise HTTPException(status_code=404, detail="Subsidy not found")
        
        # 経費例を取得
        expense_examples = subsidy.get("expense_examples", [])
        
        return {
            "subsidy_id": subsidy_id,
            "subsidy_name": subsidy.get("name"),
            "expense_examples": expense_examples
        }
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Master data not found")
    except Exception as e:
        security_logger.error(f"Failed to get expense examples: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get expense examples")

@router.get("/{subsidy_id}/version-history")
async def get_subsidy_version_history(subsidy_id: str):
    """指定された補助金のバージョン履歴を取得"""
    try:
        version_data_path = os.path.join(BASE_DIR, "version_history.yaml")
        master_data_path = os.path.join(BASE_DIR, "subsidy_master.yaml")
        
        # バージョン履歴を読み込み
        with open(version_data_path, "r", encoding="utf-8") as f:
            version_data = yaml.safe_load(f)
        
        # マスターデータを読み込み
        with open(master_data_path, "r", encoding="utf-8") as f:
            master_data = yaml.safe_load(f)
        
        subsidies = master_data.get("subsidies", {})
        subsidy = subsidies.get(subsidy_id)
        if not subsidy:
            raise HTTPException(status_code=404, detail="Subsidy not found")
        
        # バージョン履歴を取得
        subsidy_version = version_data.get("subsidies", {}).get(subsidy_id, {})
        if not subsidy_version:
            return {
                "subsidy_id": subsidy_id,
                "subsidy_name": subsidy.get("name"),
                "version": "未設定",
                "last_updated": "未設定",
                "source_references": [],
                "change_history": []
            }
        
        return {
            "subsidy_id": subsidy_id,
            "subsidy_name": subsidy.get("name"),
            **subsidy_version
        }
        
    except HTTPException:
        raise
    except Exception as e:
        security_logger.error(f"Failed to load version history for {subsidy_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load version history")

@router.get("/{subsidy_id}/application-questions")
async def get_application_questions(subsidy_id: str):
    """指定された補助金の申請書作成に必要な質問項目（セクション）を取得"""
    master_data_path = os.path.join(BASE_DIR, "subsidy_master.yaml")
    try:
        with open(master_data_path, "r", encoding="utf-8") as f:
            master_data = yaml.safe_load(f)
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Master data not found")
    
    subsidies = master_data.get("subsidies", {})
    subsidy = subsidies.get(subsidy_id)
    if not subsidy:
        raise HTTPException(status_code=404, detail="Subsidy not found")

    sections = subsidy.get("sections", [])
    validation = subsidy.get("validation", {})
    checklist = subsidy.get("checklist", [])
    tasks = subsidy.get("tasks", {})
    
    return {
        "sections": sections,
        "validation": validation,
        "checklist": checklist,
        "tasks": tasks
    }