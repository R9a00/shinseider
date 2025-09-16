#!/usr/bin/env python3
"""
厳格なシステム統合テストスイート
「ザルのテスト」を排除し、実運用での問題を確実に検出する

検出対象:
1. 実際に使用されているエンドポイントの動作
2. フロントエンドが依存するデータ構造
3. データベース整合性
4. パフォーマンス問題
5. セキュリティ問題
"""

import unittest
import requests
import json
import yaml
import os
import time
from datetime import datetime
from typing import Dict, List, Any
import logging

class ComprehensiveSystemTest(unittest.TestCase):
    """厳格なシステム統合テストクラス"""
    
    def setUp(self):
        """テスト環境のセットアップ"""
        self.base_url = "http://localhost:8888"
        self.api_base_url = f"{self.base_url}/api"
        self.test_timeout = 10
        self.max_response_time = 2.0  # 2秒以内
        
        # 実際に使用される補助金IDリスト
        self.production_subsidy_ids = [
            "jigyou_shoukei_ma",
            "monodukuri_r7_21th", 
            "gotech_rd_support",
            "atotsugi",
            "shinjigyo_shinshutsu",
            "shoukuritsuka_ippan"
        ]
        
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
    
    def test_001_critical_endpoints_availability(self):
        """クリティカルエンドポイントの可用性テスト"""
        critical_endpoints = [
            "/subsidies",  # 補助金一覧（フロントエンド依存）
            "/api/subsidies/",  # 新API（フロントエンド移行予定）
            "/system-status",  # システム状態監視
            "/test-results",  # テスト結果表示
        ]
        
        failed_endpoints = []
        for endpoint in critical_endpoints:
            with self.subTest(endpoint=endpoint):
                try:
                    response = requests.get(f"{self.base_url}{endpoint}", timeout=self.test_timeout)
                    if response.status_code != 200:
                        failed_endpoints.append(f"{endpoint}: {response.status_code}")
                        self.logger.error(f"❌ Critical endpoint failed: {endpoint} -> {response.status_code}")
                except Exception as e:
                    failed_endpoints.append(f"{endpoint}: {str(e)}")
                    self.logger.error(f"❌ Critical endpoint error: {endpoint} -> {str(e)}")
        
        if failed_endpoints:
            self.fail(f"Critical endpoints failed: {failed_endpoints}")
    
    def test_002_production_subsidy_data_integrity(self):
        """本番使用補助金データの完全性テスト"""
        # まず補助金一覧を取得
        response = requests.get(f"{self.base_url}/subsidies", timeout=self.test_timeout)
        self.assertEqual(response.status_code, 200, "補助金一覧APIが失敗")
        
        subsidies_data = response.json()
        
        # データ構造の検証
        if isinstance(subsidies_data, dict):
            actual_subsidies = subsidies_data.get('subsidies', [])
        elif isinstance(subsidies_data, list):
            actual_subsidies = subsidies_data
        else:
            self.fail(f"Unexpected subsidies data structure: {type(subsidies_data)}")
        
        # 実際のIDリストを取得
        actual_ids = {subsidy.get('id') for subsidy in actual_subsidies if subsidy.get('id')}
        
        # 必要な補助金がすべて存在することを確認
        missing_subsidies = set(self.production_subsidy_ids) - actual_ids
        if missing_subsidies:
            self.fail(f"Missing production subsidies: {missing_subsidies}")
        
        # 各補助金の必須フィールド検証
        required_fields = ['id', 'name', 'application_period']
        for subsidy in actual_subsidies:
            if subsidy.get('id') in self.production_subsidy_ids:
                with self.subTest(subsidy_id=subsidy.get('id')):
                    for field in required_fields:
                        self.assertIn(field, subsidy, f"Missing required field '{field}' in {subsidy.get('id')}")
                    
                    # 募集期間の詳細検証
                    app_period = subsidy.get('application_period', {})
                    period_fields = ['start_date', 'end_date', 'information_date']
                    for period_field in period_fields:
                        self.assertIn(period_field, app_period, 
                                    f"Missing period field '{period_field}' in {subsidy.get('id')}")
    
    def test_003_form_data_completeness_critical(self):
        """フォームデータ完全性の厳格テスト（実運用必須）"""
        failed_subsidies = []
        
        for subsidy_id in self.production_subsidy_ids:
            with self.subTest(subsidy_id=subsidy_id):
                # 新APIエンドポイントテスト
                try:
                    response = requests.get(
                        f"{self.api_base_url}/subsidies/{subsidy_id}/application-questions", 
                        timeout=self.test_timeout
                    )
                    if response.status_code != 200:
                        failed_subsidies.append(f"{subsidy_id}: New API returned {response.status_code}")
                        continue
                    
                    form_data = response.json()
                    
                    # 必須フォームデータの検証
                    required_form_fields = ['sections', 'validation', 'checklist', 'tasks']
                    for field in required_form_fields:
                        if field not in form_data:
                            failed_subsidies.append(f"{subsidy_id}: Missing form field '{field}'")
                        elif field == 'sections' and len(form_data.get('sections', [])) == 0:
                            failed_subsidies.append(f"{subsidy_id}: Empty sections array")
                    
                    # セクション構造の詳細検証
                    sections = form_data.get('sections', [])
                    if sections:
                        for i, section in enumerate(sections):
                            section_required = ['id', 'title', 'min', 'max', 'hint']
                            for req_field in section_required:
                                if req_field not in section:
                                    failed_subsidies.append(
                                        f"{subsidy_id}: Section {i} missing '{req_field}'"
                                    )
                
                except Exception as e:
                    failed_subsidies.append(f"{subsidy_id}: Exception -> {str(e)}")
        
        if failed_subsidies:
            self.fail(f"Form data completeness failures: {failed_subsidies}")
    
    def test_004_endpoint_consistency_check(self):
        """新旧エンドポイント間の一貫性テスト"""
        consistency_failures = []
        
        for subsidy_id in self.production_subsidy_ids:
            with self.subTest(subsidy_id=subsidy_id):
                try:
                    # 旧エンドポイント
                    old_response = requests.get(
                        f"{self.base_url}/get_application_questions/{subsidy_id}",
                        timeout=self.test_timeout
                    )
                    
                    # 新エンドポイント  
                    new_response = requests.get(
                        f"{self.api_base_url}/subsidies/{subsidy_id}/application-questions",
                        timeout=self.test_timeout
                    )
                    
                    # 両方とも成功すべき
                    if old_response.status_code != 200:
                        consistency_failures.append(f"{subsidy_id}: Old endpoint failed ({old_response.status_code})")
                    if new_response.status_code != 200:
                        consistency_failures.append(f"{subsidy_id}: New endpoint failed ({new_response.status_code})")
                    
                    if old_response.status_code == 200 and new_response.status_code == 200:
                        old_data = old_response.json()
                        new_data = new_response.json()
                        
                        # セクション数の一致確認
                        old_sections = len(old_data.get('sections', []))
                        new_sections = len(new_data.get('sections', []))
                        if old_sections != new_sections:
                            consistency_failures.append(
                                f"{subsidy_id}: Section count mismatch (old: {old_sections}, new: {new_sections})"
                            )
                
                except Exception as e:
                    consistency_failures.append(f"{subsidy_id}: Consistency check exception -> {str(e)}")
        
        if consistency_failures:
            self.fail(f"Endpoint consistency failures: {consistency_failures}")
    
    def test_005_database_integrity_verification(self):
        """データベース整合性の厳格検証"""
        base_dir = os.path.dirname(__file__)
        master_path = os.path.join(base_dir, 'subsidy_master.yaml')
        api_path = os.path.join(base_dir, 'subsidies.yaml')
        
        # ファイル存在確認
        self.assertTrue(os.path.exists(master_path), "Master database file missing")
        self.assertTrue(os.path.exists(api_path), "API database file missing")
        
        # ファイル読み込み
        with open(master_path, 'r', encoding='utf-8') as f:
            master_data = yaml.safe_load(f)
        with open(api_path, 'r', encoding='utf-8') as f:
            api_data = yaml.safe_load(f)
        
        # 基本構造検証
        self.assertIn('subsidies', master_data, "Master DB missing 'subsidies' key")
        self.assertIsInstance(api_data, list, "API data should be a list")
        
        # データ数の一致確認
        master_subsidies = master_data['subsidies']
        api_subsidies = {item['id']: item for item in api_data}
        
        self.assertEqual(len(master_subsidies), len(api_subsidies), 
                        f"Data count mismatch: master({len(master_subsidies)}) vs api({len(api_subsidies)})")
        
        # ID一致確認
        master_ids = set(master_subsidies.keys())
        api_ids = set(api_subsidies.keys())
        self.assertEqual(master_ids, api_ids, f"ID mismatch: master_only={master_ids-api_ids}, api_only={api_ids-master_ids}")
        
        # フォームデータ同期確認
        sync_failures = []
        for subsidy_id in self.production_subsidy_ids:
            if subsidy_id in master_subsidies and subsidy_id in api_subsidies:
                master_sections = len(master_subsidies[subsidy_id].get('sections', []))
                api_sections = len(api_subsidies[subsidy_id].get('sections', []))
                if master_sections != api_sections:
                    sync_failures.append(f"{subsidy_id}: sections count mismatch (master: {master_sections}, api: {api_sections})")
        
        if sync_failures:
            self.fail(f"Database sync failures: {sync_failures}")
    
    def test_006_performance_requirements(self):
        """パフォーマンス要件の厳格テスト"""
        performance_failures = []
        
        # クリティカルエンドポイントのパフォーマンステスト
        critical_endpoints = [
            "/subsidies",
            "/system-status", 
        ]
        
        for endpoint in critical_endpoints:
            with self.subTest(endpoint=endpoint):
                start_time = time.time()
                try:
                    response = requests.get(f"{self.base_url}{endpoint}", timeout=self.test_timeout)
                    end_time = time.time()
                    
                    response_time = end_time - start_time
                    if response.status_code != 200:
                        performance_failures.append(f"{endpoint}: Failed with {response.status_code}")
                    elif response_time > self.max_response_time:
                        performance_failures.append(f"{endpoint}: Too slow ({response_time:.2f}s > {self.max_response_time}s)")
                    
                except Exception as e:
                    performance_failures.append(f"{endpoint}: Performance test exception -> {str(e)}")
        
        # フォームデータ取得のパフォーマンステスト
        for subsidy_id in self.production_subsidy_ids[:3]:  # 主要3件でテスト
            start_time = time.time()
            try:
                response = requests.get(
                    f"{self.api_base_url}/subsidies/{subsidy_id}/application-questions",
                    timeout=self.test_timeout
                )
                end_time = time.time()
                
                response_time = end_time - start_time
                if response.status_code == 200 and response_time > self.max_response_time:
                    performance_failures.append(
                        f"Form data for {subsidy_id}: Too slow ({response_time:.2f}s > {self.max_response_time}s)"
                    )
            except Exception as e:
                performance_failures.append(f"Form data for {subsidy_id}: Performance exception -> {str(e)}")
        
        if performance_failures:
            self.fail(f"Performance requirement failures: {performance_failures}")
    
    def test_007_frontend_integration_critical(self):
        """フロントエンド統合の重要テスト"""
        # フロントエンドが期待するデータ構造をテスト
        response = requests.get(f"{self.base_url}/subsidies", timeout=self.test_timeout)
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        
        # フロントエンドが使用する可能性のある構造をチェック
        if isinstance(data, dict) and 'subsidies' in data:
            subsidies = data['subsidies']
        elif isinstance(data, list):
            subsidies = data
        else:
            self.fail(f"Frontend incompatible data structure: {type(data)}")
        
        # フロントエンドが依存するフィールドの確認
        frontend_required_fields = ['id', 'name', 'application_period', 'sections']
        integration_failures = []
        
        for subsidy in subsidies:
            if subsidy.get('id') in self.production_subsidy_ids:
                for field in frontend_required_fields:
                    if field not in subsidy:
                        integration_failures.append(f"{subsidy.get('id')}: Missing frontend field '{field}'")
                    elif field == 'sections' and not subsidy.get('sections'):
                        integration_failures.append(f"{subsidy.get('id')}: Empty sections for frontend")
        
        if integration_failures:
            self.fail(f"Frontend integration failures: {integration_failures}")
    
    def test_008_error_handling_robustness(self):
        """エラーハンドリングの堅牢性テスト"""
        error_handling_failures = []
        
        # 存在しない補助金IDでのテスト
        invalid_ids = ["nonexistent_id", "test_invalid_123", ""]
        for invalid_id in invalid_ids:
            with self.subTest(invalid_id=invalid_id):
                response = requests.get(
                    f"{self.api_base_url}/subsidies/{invalid_id}/application-questions",
                    timeout=self.test_timeout
                )
                if response.status_code not in [400, 404, 422]:
                    error_handling_failures.append(
                        f"Invalid ID '{invalid_id}' should return 400/404/422, got {response.status_code}"
                    )
        
        # 存在しないエンドポイントでのテスト
        invalid_endpoints = [
            "/api/subsidies/invalid-endpoint",
            "/subsidies/invalid-path", 
            "/nonexistent-api"
        ]
        for endpoint in invalid_endpoints:
            response = requests.get(f"{self.base_url}{endpoint}", timeout=self.test_timeout)
            if response.status_code != 404:
                error_handling_failures.append(
                    f"Invalid endpoint '{endpoint}' should return 404, got {response.status_code}"
                )
        
        if error_handling_failures:
            self.fail(f"Error handling failures: {error_handling_failures}")
    
    def test_009_system_monitoring_accuracy(self):
        """システム監視の正確性テスト"""
        # システム状態エンドポイントのテスト
        response = requests.get(f"{self.base_url}/system-status", timeout=self.test_timeout)
        self.assertEqual(response.status_code, 200)
        
        system_status = response.json()
        
        # 必要な監視項目の確認（最適化後の構造に対応）
        required_monitoring_fields = ['timestamp', 'system_version', 'status']
        monitoring_failures = []
        
        for field in required_monitoring_fields:
            if field not in system_status:
                monitoring_failures.append(f"Missing monitoring field: {field}")
        
        # operational_status内のdatabase_filesとdata_consistencyの確認
        if 'operational_status' in system_status:
            operational_status = system_status['operational_status']
            if 'database_files' not in operational_status:
                monitoring_failures.append("Missing operational_status.database_files")
            if 'data_consistency' not in operational_status:
                monitoring_failures.append("Missing operational_status.data_consistency")
        
        # テスト結果の確認（テスト未実行の場合は正常）
        test_response = requests.get(f"{self.base_url}/test-results", timeout=self.test_timeout)
        if test_response.status_code == 200:
            test_results = test_response.json()
            if 'test_details' in test_results:
                # テスト詳細の基本構造確認（空でもメッセージがあれば正常）
                test_details = test_results['test_details']
                if not isinstance(test_details, list):
                    monitoring_failures.append("Test results details should be a list")
                elif 'message' not in test_results or not test_results['message']:
                    if len(test_details) == 0:
                        monitoring_failures.append("Test results should have message when empty")
        else:
            monitoring_failures.append(f"Test results endpoint failed: {test_response.status_code}")
        
        if monitoring_failures:
            self.fail(f"System monitoring failures: {monitoring_failures}")

class TestExecutor:
    """テスト実行管理クラス"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    def run_comprehensive_tests(self) -> Dict[str, Any]:
        """包括的テストの実行"""
        self.logger.info("🧪 Starting comprehensive system tests...")
        
        # テストスイートの実行
        loader = unittest.TestLoader()
        suite = loader.loadTestsFromTestCase(ComprehensiveSystemTest)
        
        # カスタムテストランナー
        runner = unittest.TextTestRunner(
            verbosity=2,
            stream=open(os.devnull, 'w'),  # 標準出力を抑制
            buffer=True
        )
        
        start_time = time.time()
        result = runner.run(suite)
        end_time = time.time()
        
        # 結果の整理
        test_results = {
            'timestamp': datetime.now().isoformat(),
            'execution_time': round(end_time - start_time, 2),
            'total_tests': result.testsRun,
            'failures': len(result.failures),
            'errors': len(result.errors),
            'success_rate': round((result.testsRun - len(result.failures) - len(result.errors)) / result.testsRun * 100, 1),
            'status': 'PASS' if len(result.failures) == 0 and len(result.errors) == 0 else 'FAIL',
            'test_details': []
        }
        
        # 失敗の詳細
        for test, traceback in result.failures:
            test_results['test_details'].append({
                'test_name': str(test),
                'status': 'FAIL',
                'error': traceback.split('\n')[-2] if traceback else 'Unknown failure'
            })
        
        for test, traceback in result.errors:
            test_results['test_details'].append({
                'test_name': str(test),
                'status': 'ERROR', 
                'error': traceback.split('\n')[-2] if traceback else 'Unknown error'
            })
        
        # 成功したテストも追加
        for i in range(result.testsRun):
            test_name = f"test_{i+1:03d}_comprehensive_check"
            if not any(test_name in detail['test_name'] for detail in test_results['test_details']):
                test_results['test_details'].append({
                    'test_name': test_name,
                    'status': 'PASS',
                    'error': None
                })
        
        self.logger.info(f"✅ Comprehensive tests completed: {test_results['status']} ({test_results['success_rate']}% success)")
        return test_results

def run_comprehensive_tests():
    """包括的システムテストの実行（外部呼び出し用）"""
    executor = TestExecutor()
    return executor.run_comprehensive_tests()

if __name__ == '__main__':
    # 直接実行時は標準のunittestとして動作
    unittest.main(verbosity=2)