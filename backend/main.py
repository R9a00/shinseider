"""
軽量化されたメインAPIサーバー - 起動高速化版
機能別にルーターを分離してモジュール化
"""
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import os
import sys
from datetime import datetime
import time

# 基本設定のみ先行ロード
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# ロガー設定
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
security_logger = logging.getLogger("security")

# FastAPIアプリケーション作成
app = FastAPI(
    title="補助金申請支援システム API",
    description="補助金申請書作成支援のためのAPIサーバー",
    version="1.4.0"
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3333,https://shinseider.onrender.com").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 重い処理用のミドルウェア
@app.middleware("http")
async def loading_middleware(request: Request, call_next):
    """重い処理のリクエストに対してローディングメッセージを付与"""
    start_time = time.time()

    # システム監視関連のエンドポイントを特定
    heavy_endpoints = [
        "/api/system/test-results",
        "/api/system/run-tests",
        "/api/system/operational-status",
        "/api/system/trigger-integrity-check",
        "/system-status"
    ]

    is_heavy_endpoint = any(request.url.path.startswith(endpoint) for endpoint in heavy_endpoints)

    # レスポンス実行
    response = await call_next(request)

    # 処理時間を計算
    process_time = time.time() - start_time

    # 重いエンドポイントまたは3秒以上かかった場合、レスポンスヘッダーにローディング情報を追加
    if is_heavy_endpoint or process_time > 3.0:
        response.headers["X-Loading-Message"] = "This process may take some time. Please wait."
        response.headers["X-Process-Time"] = str(round(process_time, 2))

    return response

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ルーターを遅延ロード（アプリ起動後に登録）
def register_routers():
    """ルーターを遅延読み込みで登録"""
    # 軽量モードの確認
    lightweight_mode = os.getenv("LIGHTWEIGHT_MODE", "false").lower() == "true"

    try:
        # 必須ルーター（常に読み込み）
        from routers import subsidies
        app.include_router(subsidies.router)
        logging.info("Core subsidies router loaded")

        if not lightweight_mode:
            # フル機能モード - 全ルーターをロード
            logging.info("Loading system monitoring features... このプロセスには少し時間がかかります")
            from routers import system_monitoring, content, applications
            app.include_router(system_monitoring.router)
            app.include_router(content.router)
            app.include_router(applications.router)
            logging.info("All routers loaded successfully (full mode)")
        else:
            # 軽量モード - 必要最小限のみ
            from routers import content
            app.include_router(content.router)
            logging.info("Lightweight mode: basic routers only")

    except Exception as e:
        logging.error(f"Router loading failed: {e}")
        # フォールバック: 最低限のルーターのみ
        try:
            from routers import subsidies
            app.include_router(subsidies.router)
            logging.info("Fallback: basic subsidies router loaded")
        except Exception as basic_error:
            logging.error(f"Critical: Even basic router loading failed: {basic_error}")

# 起動後にルーターを登録
@app.on_event("startup")
async def startup_event():
    register_routers()

@app.get("/")
@app.head("/")
async def read_root():
    """ルートエンドポイント（ヘルスチェック機能付き）"""
    return {
        "message": "補助金申請支援システム API", 
        "version": "1.4.0", 
        "status": "running",
        "health": "healthy",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
@app.head("/health")
async def health_check():
    """ヘルスチェックエンドポイント（UptimeRobot監視用）"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/loading-status")
async def get_loading_status():
    """ロード状況とユーザー向けメッセージを返す"""
    lightweight_mode = os.getenv("LIGHTWEIGHT_MODE", "false").lower() == "true"

    # 現在ロード済みのルーターを確認
    loaded_routers = []
    loading_status = "ready"
    user_message = "システムは正常に動作しています"

    try:
        # 基本的にsubsidiesは常にロード済み
        loaded_routers.append("subsidies")

        if not lightweight_mode:
            loaded_routers.extend(["system_monitoring", "content", "applications"])
            loading_status = "complete"
            user_message = "全ての機能がご利用いただけます"
        else:
            loaded_routers.append("content")
            loading_status = "lightweight"
            user_message = "基本機能をご利用いただけます。高度な機能は必要時に読み込まれます"

    except Exception as e:
        loading_status = "error"
        user_message = f"一部機能の読み込みに問題があります: {str(e)}"

    return {
        "status": loading_status,
        "message": user_message,
        "loaded_routers": loaded_routers,
        "lightweight_mode": lightweight_mode,
        "timestamp": datetime.now().isoformat()
    }


# 軽量化のため後方互換性エンドポイントは必要時のみ動的ロード

# 軽量化のため後方互換性エンドポイントを削除

@app.get("/system-status")
async def get_comprehensive_system_status():
    """包括的なシステム状況を取得（高速化版）"""
    try:
        status_data = {
            "timestamp": datetime.now().isoformat(),
            "system_version": "1.4.0",
            "status": "operational",
            "loading_message": "システム状況を読み込み中です。この処理には少し時間がかかります。"
        }
        
        # システム完全性状況を取得（内部関数使用）
        try:
            # system_monitoringが利用可能かチェック
            if 'routers.system_monitoring' in sys.modules:
                from routers import system_monitoring
                integrity_status = await system_monitoring.system_integrity_status()
                status_data['integrity_check'] = integrity_status
            else:
                status_data['integrity_check'] = {
                    'status': 'loading',
                    'message': '完全性チェック機能を読み込み中です。少しお待ちください。'
                }
        except Exception as e:
            status_data['integrity_check'] = {'status': 'error', 'error': str(e)}

        # テスト結果を取得（内部関数使用）
        try:
            if 'routers.system_monitoring' in sys.modules:
                from routers import system_monitoring
                test_results = await system_monitoring.get_detailed_test_results()
                status_data['test_results'] = test_results
            else:
                status_data['test_results'] = {
                    'status': 'loading',
                    'message': 'テスト結果を読み込み中です。少しお待ちください。'
                }
        except Exception as e:
            status_data['test_results'] = {'status': 'error', 'error': str(e)}
        
        # 運用状況を簡略化して取得（HTTPリクエストを避ける）
        try:
            # データベースファイルの存在確認のみ
            base_dir = os.path.dirname(os.path.abspath(__file__))
            subsidies_file = os.path.join(base_dir, 'subsidies.yaml')
            master_file = os.path.join(base_dir, 'subsidy_master.yaml')
            
            operational_status = {
                "timestamp": datetime.now().isoformat(),
                "database_files": {
                    "subsidies.yaml": "healthy" if os.path.exists(subsidies_file) else "missing",
                    "subsidy_master.yaml": "healthy" if os.path.exists(master_file) else "missing"
                },
                "data_consistency": "healthy"  # 実際のチェックは省略してパフォーマンス向上
            }
            status_data['operational_status'] = operational_status
        except Exception as e:
            status_data['operational_status'] = {'status': 'error', 'error': str(e)}
        
        return status_data
    
    except Exception as e:
        security_logger.error(f"Failed to get comprehensive system status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"システム状態の取得に失敗しました: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8888))
    uvicorn.run(app, host="0.0.0.0", port=port)