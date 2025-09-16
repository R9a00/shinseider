#!/usr/bin/env python3
"""
システムテスト実行スクリプト

基本的なAPIエンドポイントとシステム機能をテストして結果を保存
"""

import requests
import json
import time
from datetime import datetime
import os
import yaml

BASE_URL = "http://localhost:8000"
TEST_RESULTS_FILE = "test_results.json"

class SystemTester:
    def __init__(self):
        self.results = {
            "timestamp": datetime.now().isoformat(),
            "summary": {
                "total_tests": 0,
                "passed": 0,
                "failed": 0,
                "errors": 0,
                "success_rate": 0
            },
            "test_details": [],
            "features": {
                "api_endpoints": [],
                "data_integrity": [],
                "system_health": []
            },
            "categories": {}
        }
    
    def run_test(self, test_name, test_func, category="general"):
        """個別テストを実行"""
        self.results["summary"]["total_tests"] += 1
        
        try:
            start_time = time.time()
            result = test_func()
            end_time = time.time()
            
            test_detail = {
                "test_name": test_name,
                "category": category,
                "status": "PASSED" if result["success"] else "FAILED",
                "message": result["message"],
                "duration": round(end_time - start_time, 3),
                "timestamp": datetime.now().isoformat()
            }
            
            if result["success"]:
                self.results["summary"]["passed"] += 1
            else:
                self.results["summary"]["failed"] += 1
                
            self.results["test_details"].append(test_detail)
            
            # カテゴリ別集計
            if category not in self.results["categories"]:
                self.results["categories"][category] = {
                    "total": 0, "passed": 0, "failed": 0, "success_rate": 0
                }
            
            cat = self.results["categories"][category]
            cat["total"] += 1
            if result["success"]:
                cat["passed"] += 1
            else:
                cat["failed"] += 1
            cat["success_rate"] = round((cat["passed"] / cat["total"]) * 100, 1)
            
            # features分類
            feature_key = "api_endpoints" if "API" in test_name else \
                         "data_integrity" if "データ" in test_name else \
                         "system_health"
            self.results["features"][feature_key].append(test_detail)
            
            print(f"✅ {test_name}: PASSED" if result["success"] else f"❌ {test_name}: FAILED - {result['message']}")
            
        except Exception as e:
            self.results["summary"]["errors"] += 1
            test_detail = {
                "test_name": test_name,
                "category": category,
                "status": "ERROR",
                "message": f"テスト実行エラー: {str(e)}",
                "duration": 0,
                "timestamp": datetime.now().isoformat()
            }
            self.results["test_details"].append(test_detail)
            print(f"💥 {test_name}: ERROR - {str(e)}")
    
    def test_api_health(self):
        """APIヘルスチェック"""
        try:
            response = requests.get(f"{BASE_URL}/health", timeout=5)
            return {
                "success": response.status_code == 200,
                "message": f"ステータス: {response.status_code}"
            }
        except Exception as e:
            return {"success": False, "message": f"接続エラー: {str(e)}"}
    
    def test_subsidies_endpoint(self):
        """補助金一覧API"""
        try:
            response = requests.get(f"{BASE_URL}/subsidies", timeout=10)
            if response.status_code == 200:
                data = response.json()
                count = len(data) if isinstance(data, list) else len(data.get("subsidies", {}))
                return {
                    "success": count > 0,
                    "message": f"補助金数: {count}件"
                }
            return {"success": False, "message": f"HTTP {response.status_code}"}
        except Exception as e:
            return {"success": False, "message": f"エラー: {str(e)}"}
    
    def test_version_history_api(self):
        """バージョン履歴API"""
        try:
            response = requests.get(f"{BASE_URL}/api/system/version-history", timeout=5)
            if response.status_code == 200:
                data = response.json()
                has_metadata = "metadata" in data
                return {
                    "success": has_metadata,
                    "message": f"バージョン: {data.get('metadata', {}).get('version', 'N/A')}"
                }
            return {"success": False, "message": f"HTTP {response.status_code}"}
        except Exception as e:
            return {"success": False, "message": f"エラー: {str(e)}"}
    
    def test_integrity_status_api(self):
        """完全性チェックAPI"""
        try:
            response = requests.get(f"{BASE_URL}/api/system/integrity-status", timeout=5)
            if response.status_code == 200:
                data = response.json()
                return {
                    "success": data.get("status") in ["ok", "no_data"],
                    "message": f"ステータス: {data.get('status', 'unknown')}"
                }
            return {"success": False, "message": f"HTTP {response.status_code}"}
        except Exception as e:
            return {"success": False, "message": f"エラー: {str(e)}"}
    
    def test_data_integrity(self):
        """データ完全性チェック"""
        try:
            # subsidy_master.yamlの存在確認
            master_path = "subsidy_master.yaml"
            if not os.path.exists(master_path):
                return {"success": False, "message": "マスターデータファイル未存在"}
            
            with open(master_path, 'r', encoding='utf-8') as f:
                data = yaml.safe_load(f)
            
            subsidies_count = len(data.get('subsidies', {}))
            has_metadata = 'metadata' in data
            
            return {
                "success": subsidies_count > 0 and has_metadata,
                "message": f"補助金データ: {subsidies_count}件, メタデータ: {'有' if has_metadata else '無'}"
            }
        except Exception as e:
            return {"success": False, "message": f"データ読み込みエラー: {str(e)}"}
    
    def run_all_tests(self):
        """全テストを実行"""
        print("🚀 システムテスト開始...")
        print("=" * 50)
        
        # 機能系テスト (functionality)
        self.run_test("APIヘルスチェック", self.test_api_health, "functionality")
        self.run_test("補助金一覧API", self.test_subsidies_endpoint, "functionality")
        self.run_test("バージョン履歴API", self.test_version_history_api, "functionality")
        self.run_test("完全性チェックAPI", self.test_integrity_status_api, "functionality")
        
        # 完全性テスト (integrity)
        self.run_test("データ完全性チェック", self.test_data_integrity, "integrity")
        
        # 成功率計算
        if self.results["summary"]["total_tests"] > 0:
            success_count = self.results["summary"]["passed"]
            total_count = self.results["summary"]["total_tests"]
            self.results["summary"]["success_rate"] = round((success_count / total_count) * 100, 1)
        
        print("\n" + "=" * 50)
        print("📊 テスト結果サマリー")
        print(f"✅ 成功: {self.results['summary']['passed']}")
        print(f"❌ 失敗: {self.results['summary']['failed']}")
        print(f"💥 エラー: {self.results['summary']['errors']}")
        print(f"📈 成功率: {self.results['summary']['success_rate']}%")
        
        # 結果をファイルに保存
        with open(TEST_RESULTS_FILE, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 結果を {TEST_RESULTS_FILE} に保存しました")
        return self.results

def main():
    tester = SystemTester()
    results = tester.run_all_tests()
    
    # 終了コード
    if results["summary"]["success_rate"] >= 80:
        print("🎉 テスト完了: システム正常")
        exit(0)
    else:
        print("⚠️  テスト完了: 要確認")
        exit(1)

if __name__ == "__main__":
    main()