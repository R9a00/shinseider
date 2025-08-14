"""システム監視関連のAPIエンドポイント"""
from fastapi import APIRouter, HTTPException
import yaml
import os
import logging
import time
from datetime import datetime

router = APIRouter(prefix="/api/system", tags=["monitoring"])

# ロガー設定
security_logger = logging.getLogger("security")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# テスト結果キャッシュ（5分間有効）
_test_results_cache = None
_test_results_cache_time = None
TEST_CACHE_DURATION = 300  # 5分

@router.get("/integrity-status")
async def system_integrity_status():
    """システム完全性のチェック状況を返す"""
    try:
        integrity_results_path = os.path.join(BASE_DIR, "integrity_check_results.yaml")
        
        if not os.path.exists(integrity_results_path):
            return {
                "status": "no_data",
                "message": "完全性チェック結果がありません",
                "overall_score": None,
                "violation_count": 0,
                "elapsed_hours": None
            }
        
        with open(integrity_results_path, "r", encoding="utf-8") as f:
            results = yaml.safe_load(f)
        
        # 最後のチェック時刻からの経過時間を計算
        check_timestamp = results.get("check_timestamp")
        elapsed_hours = None
        if check_timestamp:
            try:
                check_time = datetime.fromisoformat(check_timestamp.replace('Z', '+00:00'))
                current_time = datetime.now(check_time.tzinfo) if check_time.tzinfo else datetime.now()
                elapsed_hours = (current_time - check_time).total_seconds() / 3600
            except:
                elapsed_hours = None
        
        # 違反件数を計算（info レベルは除外）
        violations = results.get("violations", [])
        violation_count = len([v for v in violations if v.get("severity") != "info"])
        
        return {
            "status": "ok",
            "overall_score": results.get("overall_score", 0),
            "dimension_scores": results.get("dimension_scores", {}),
            "violation_count": violation_count,
            "elapsed_hours": elapsed_hours,
            "violations": violations
        }
        
    except Exception as e:
        security_logger.error(f"Failed to load system integrity status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"システム完全性状況の取得に失敗しました: {str(e)}")

@router.get("/operational-status")
async def get_operational_status():
    """システムの運用状況を取得"""
    try:
        import requests
        
        status_data = {
            "timestamp": datetime.now().isoformat(),
            "api_endpoints": [],
            "database_status": "healthy",
            "external_services": []
        }
        
        # APIエンドポイントの健全性チェック
        test_endpoints = [
            {"endpoint": "/subsidies", "method": "GET"},
            {"endpoint": "/version-history", "method": "GET"},
            {"endpoint": "/system-integrity-status", "method": "GET"},
        ]
        
        base_url = "http://localhost:8888"
        endpoints_status = []
        
        for endpoint_info in test_endpoints:
            endpoint = endpoint_info["endpoint"]
            method = endpoint_info["method"]
            
            try:
                start_time = time.time()
                response = requests.get(f"{base_url}{endpoint}", timeout=5)
                response_time = time.time() - start_time
                
                endpoints_status.append({
                    'endpoint': endpoint,
                    'status': 'healthy' if response.status_code == 200 else 'degraded',
                    'response_time': round(response_time * 1000, 2),  # ms
                    'status_code': response.status_code
                })
            except Exception as e:
                endpoints_status.append({
                    'endpoint': endpoint,
                    'status': 'unhealthy',
                    'response_time': None,
                    'error': str(e)
                })
        
        status_data["api_endpoints"] = endpoints_status
        
        return status_data
        
    except Exception as e:
        security_logger.error(f"Failed to get operational status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"運用状況の取得に失敗しました: {str(e)}")

@router.post("/trigger-integrity-check")
async def trigger_integrity_check():
    """完全性チェックを手動実行"""
    try:
        import subprocess
        
        # 完全性チェッカーを実行
        result = subprocess.run(
            ["python3", "minimal_integrity_checker.py"],
            cwd=BASE_DIR,
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode == 0:
            return {
                "status": "success",
                "message": "完全性チェックが正常に実行されました",
                "output": result.stdout
            }
        else:
            return {
                "status": "error",
                "message": "完全性チェックでエラーが発生しました",
                "error": result.stderr
            }
            
    except subprocess.TimeoutExpired:
        return {
            "status": "timeout",
            "message": "完全性チェックがタイムアウトしました"
        }
    except Exception as e:
        security_logger.error(f"Failed to trigger integrity check: {str(e)}")
        raise HTTPException(status_code=500, detail=f"完全性チェックの実行に失敗しました: {str(e)}")

@router.get("/test-results")
async def get_detailed_test_results():
    """キャッシュされたテスト結果を取得（テストは手動実行）"""
    global _test_results_cache, _test_results_cache_time
    try:
        # キャッシュがない場合は空の結果を返す
        if _test_results_cache is None:
            return {
                'timestamp': datetime.now().isoformat(),
                'message': 'テスト未実行。/run-testsエンドポイントでテストを実行してください。',
                'summary': {
                    'total_tests': 0,
                    'passed': 0,
                    'failed': 0,
                    'errors': 0,
                    'success_rate': 0
                },
                'test_details': [],
                'features': {},
                'categories': {}
            }
        
        return _test_results_cache
    except Exception as e:
        security_logger.error(f"Failed to get test results: {str(e)}")
        return {
            'timestamp': datetime.now().isoformat(),
            'message': f'テスト結果の取得に失敗: {str(e)}',
            'summary': {
                'total_tests': 0,
                'passed': 0,
                'failed': 0,
                'errors': 0,
                'success_rate': 0
            },
            'test_details': [],
            'features': {},
            'categories': {}
        }

@router.post("/run-tests")
async def run_tests():
    """厳格なシステム統合テストを実行"""
    global _test_results_cache, _test_results_cache_time
    try:
        current_time = time.time()
        
        # 厳格なテストスイートを実行
        from test_comprehensive_system import run_comprehensive_tests
        
        print("🧪 厳格なシステム統合テスト実行中...")
        test_result = run_comprehensive_tests()
        
        # 結果をシステム監視形式に変換
        result = {
            'timestamp': test_result.get('timestamp', datetime.now().isoformat()),
            'summary': {
                'total_tests': test_result.get('total_tests', 0),
                'passed': test_result.get('total_tests', 0) - test_result.get('failures', 0) - test_result.get('errors', 0),
                'failed': test_result.get('failures', 0),
                'errors': test_result.get('errors', 0),
                'success_rate': test_result.get('success_rate', 0)
            },
            'test_details': [],
            'execution_time': test_result.get('execution_time', 0),
            'status': test_result.get('status', 'UNKNOWN'),
            'features': {},
            'categories': {
                'critical_endpoints': {'total': 0, 'passed': 0, 'failed': 0, 'errors': 0},
                'data_integrity': {'total': 0, 'passed': 0, 'failed': 0, 'errors': 0},
                'form_completeness': {'total': 0, 'passed': 0, 'failed': 0, 'errors': 0},
                'endpoint_consistency': {'total': 0, 'passed': 0, 'failed': 0, 'errors': 0},
                'database_integrity': {'total': 0, 'passed': 0, 'failed': 0, 'errors': 0},
                'performance': {'total': 0, 'passed': 0, 'failed': 0, 'errors': 0},
                'frontend_integration': {'total': 0, 'passed': 0, 'failed': 0, 'errors': 0},
                'error_handling': {'total': 0, 'passed': 0, 'failed': 0, 'errors': 0},
                'system_monitoring': {'total': 0, 'passed': 0, 'failed': 0, 'errors': 0}
            }
        }
        
        # テスト詳細の変換とカテゴリ分析
        test_details = test_result.get('test_details', [])
        for detail in test_details:
            test_name = detail.get('test_name', '')
            status = detail.get('status', 'UNKNOWN')
            
            # テスト名からカテゴリを推定
            category = 'other'
            if 'critical_endpoints' in test_name:
                category = 'critical_endpoints'
            elif 'production_subsidy_data' in test_name:
                category = 'data_integrity'
            elif 'form_data_completeness' in test_name:
                category = 'form_completeness'
            elif 'endpoint_consistency' in test_name:
                category = 'endpoint_consistency'
            elif 'database_integrity' in test_name:
                category = 'database_integrity'
            elif 'performance' in test_name:
                category = 'performance'
            elif 'frontend_integration' in test_name:
                category = 'frontend_integration'
            elif 'error_handling' in test_name:
                category = 'error_handling'
            elif 'system_monitoring' in test_name:
                category = 'system_monitoring'
            
            # カテゴリ統計を更新
            if category in result['categories']:
                result['categories'][category]['total'] += 1
                if status == 'PASS':
                    result['categories'][category]['passed'] += 1
                elif status == 'FAIL':
                    result['categories'][category]['failed'] += 1
                else:
                    result['categories'][category]['errors'] += 1
            
            # 表示用の詳細を作成
            result['test_details'].append({
                'test_name': test_name,
                'display_name': test_name.replace('test_', '').replace('_', ' ').title(),
                'description': detail.get('error', 'Comprehensive system test'),
                'category': category,
                'feature': 'System Integration',
                'status': 'passed' if status == 'PASS' else ('failed' if status == 'FAIL' else 'error'),
                'error': detail.get('error') if status != 'PASS' else None
            })
        
        # キャッシュを更新
        _test_results_cache = result
        _test_results_cache_time = current_time
        
        return {"message": "テスト実行を開始しました。結果は /test-results で確認できます。"}
        
    except Exception as e:
        security_logger.error(f"Failed to run tests: {str(e)}")
        raise HTTPException(status_code=500, detail=f"テスト実行に失敗しました: {str(e)}")

@router.post("/refresh-test-results")
async def refresh_test_results():
    """テスト結果キャッシュを強制的にリフレッシュ"""
    global _test_results_cache, _test_results_cache_time
    _test_results_cache = None
    _test_results_cache_time = None
    return {"message": "テスト結果キャッシュをクリアしました"}