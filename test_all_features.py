#!/usr/bin/env python3
"""
シンセイダー統合テストスクリプト
全主要機能の動作確認を行います
"""

import json
import requests
import time
from typing import Dict, List, Tuple, Any
import sys
import os

# APIベースURL
API_BASE_URL = "http://localhost:8888"
FRONTEND_URL = "http://localhost:3333"

class ShinseiderTester:
    def __init__(self):
        self.results = []
        self.failed_tests = []
        
    def log_test(self, test_name: str, passed: bool, details: str = ""):
        """テスト結果をログに記録"""
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        
        self.results.append({
            "test": test_name,
            "passed": passed,
            "details": details
        })
        
        if not passed:
            self.failed_tests.append(test_name)
    
    def test_backend_health(self) -> bool:
        """バックエンドのヘルスチェック"""
        try:
            # /healthエンドポイントがないので/subsidiesで代用
            response = requests.get(f"{API_BASE_URL}/subsidies", timeout=5)
            passed = response.status_code == 200
            self.log_test("Backend Health Check", passed, f"Status: {response.status_code}")
            return passed
        except Exception as e:
            self.log_test("Backend Health Check", False, str(e))
            return False
    
    def test_subsidies_list(self) -> bool:
        """補助金一覧取得テスト"""
        try:
            response = requests.get(f"{API_BASE_URL}/subsidies", timeout=10)
            if response.status_code != 200:
                self.log_test("Subsidies List", False, f"Status: {response.status_code}")
                return False
            
            data = response.json()
            expected_subsidies = [
                "atotsugi", "shinjigyo_shinshutsu", "monodukuri_r7_21th", 
                "jigyou_shoukei_ma", "gotech_rd_support", "shoukuritsuka_ippan"
            ]
            
            found_ids = [s.get('id') for s in data]
            missing = [sid for sid in expected_subsidies if sid not in found_ids]
            
            passed = len(missing) == 0
            details = f"Found {len(found_ids)} subsidies" + (f", Missing: {missing}" if missing else "")
            self.log_test("Subsidies List", passed, details)
            return passed
            
        except Exception as e:
            self.log_test("Subsidies List", False, str(e))
            return False
    
    def test_form_sections(self, subsidy_id: str) -> bool:
        """申請フォームセクション取得テスト"""
        try:
            response = requests.get(f"{API_BASE_URL}/get_application_questions/{subsidy_id}", timeout=10)
            if response.status_code != 200:
                self.log_test(f"Form Sections ({subsidy_id})", False, f"Status: {response.status_code}")
                return False
            
            data = response.json()
            sections = data.get('sections', [])
            
            # アトツギ甲子園は7セクション、その他は最低1セクションあることを確認
            expected_min = 7 if subsidy_id == "atotsugi" else 1
            passed = len(sections) >= expected_min
            
            details = f"Found {len(sections)} sections (expected >= {expected_min})"
            self.log_test(f"Form Sections ({subsidy_id})", passed, details)
            return passed
            
        except Exception as e:
            self.log_test(f"Form Sections ({subsidy_id})", False, str(e))
            return False
    
    def test_30sec_diagnosis(self) -> bool:
        """30秒診断機能テスト"""
        try:
            # 30秒診断の質問取得
            response = requests.get(f"{API_BASE_URL}/diagnosis_questions", timeout=10)
            if response.status_code != 200:
                self.log_test("30sec Diagnosis Questions", False, f"Status: {response.status_code}")
                return False
            
            questions = response.json()
            if len(questions) == 0:
                self.log_test("30sec Diagnosis Questions", False, "No questions found")
                return False
            
            # 診断実行テスト
            test_answers = ["事業承継", "技術革新", "新製品開発", "既存製品の改良", "効率化"]
            
            diagnosis_response = requests.post(
                f"{API_BASE_URL}/diagnose",
                json={"answers": test_answers[:len(questions)]},
                timeout=15
            )
            
            if diagnosis_response.status_code != 200:
                self.log_test("30sec Diagnosis Execution", False, f"Status: {diagnosis_response.status_code}")
                return False
            
            diagnosis_result = diagnosis_response.json()
            recommendations = diagnosis_result.get('recommendations', [])
            
            passed = len(recommendations) > 0
            details = f"Found {len(questions)} questions, got {len(recommendations)} recommendations"
            self.log_test("30sec Diagnosis", passed, details)
            return passed
            
        except Exception as e:
            self.log_test("30sec Diagnosis", False, str(e))
            return False
    
    def test_expense_examples(self, subsidy_id: str, initiatives: List[str]) -> bool:
        """支出対象例取得テスト"""
        try:
            initiatives_param = ",".join(initiatives)
            response = requests.get(
                f"{API_BASE_URL}/subsidies/{subsidy_id}/expense-examples",
                params={"initiatives": initiatives_param},
                timeout=10
            )
            
            if response.status_code != 200:
                self.log_test(f"Expense Examples ({subsidy_id})", False, f"Status: {response.status_code}")
                return False
            
            data = response.json()
            expense_examples = data.get('expense_examples', {})
            
            passed = len(expense_examples) > 0
            details = f"Found {len(expense_examples)} expense categories"
            self.log_test(f"Expense Examples ({subsidy_id})", passed, details)
            return passed
            
        except Exception as e:
            self.log_test(f"Expense Examples ({subsidy_id})", False, str(e))
            return False
    
    def test_frontend_accessibility(self) -> bool:
        """フロントエンドアクセシビリティテスト"""
        try:
            response = requests.get(FRONTEND_URL, timeout=10)
            passed = response.status_code == 200
            details = f"Status: {response.status_code}"
            self.log_test("Frontend Accessibility", passed, details)
            return passed
        except Exception as e:
            self.log_test("Frontend Accessibility", False, str(e))
            return False
    
    def run_all_tests(self):
        """全テストを実行"""
        print("🔍 シンセイダー統合テスト開始")
        print("=" * 50)
        
        # 基本ヘルスチェック
        if not self.test_backend_health():
            print("❌ バックエンドが応答しません。サーバーを起動してください。")
            return
        
        if not self.test_frontend_accessibility():
            print("⚠️ フロントエンドにアクセスできません。")
        
        # 補助金関連テスト
        self.test_subsidies_list()
        
        # 各補助金のフォームテスト
        subsidies_to_test = ["atotsugi", "shinjigyo_shinshutsu", "monodukuri_r7_21th"]
        for subsidy_id in subsidies_to_test:
            self.test_form_sections(subsidy_id)
        
        # 30秒診断テスト
        self.test_30sec_diagnosis()
        
        # 支出対象例テスト
        test_cases = [
            ("atotsugi", ["事業承継"]),
            ("shinjigyo_shinshutsu", ["新製品・サービスの開発"]),
            ("monodukuri_r7_21th", ["ITシステム導入"])
        ]
        
        for subsidy_id, initiatives in test_cases:
            self.test_expense_examples(subsidy_id, initiatives)
        
        # 結果サマリー
        self.print_summary()
    
    def print_summary(self):
        """テスト結果サマリーを表示"""
        print("\n" + "=" * 50)
        print("🎯 テスト結果サマリー")
        print("=" * 50)
        
        total_tests = len(self.results)
        passed_tests = len([r for r in self.results if r['passed']])
        failed_tests = total_tests - passed_tests
        
        print(f"総テスト数: {total_tests}")
        print(f"成功: {passed_tests} ✅")
        print(f"失敗: {failed_tests} ❌")
        print(f"成功率: {(passed_tests/total_tests)*100:.1f}%")
        
        if self.failed_tests:
            print(f"\n❌ 失敗したテスト:")
            for test_name in self.failed_tests:
                print(f"   - {test_name}")
        else:
            print(f"\n🎉 全てのテストが成功しました！")
        
        # 重要な問題がある場合の推奨アクション
        if "Backend Health Check" in self.failed_tests:
            print(f"\n🚨 推奨アクション:")
            print(f"   - バックエンドサーバーを起動してください: cd backend && python main.py")
        
        if any("Form Sections" in test for test in self.failed_tests):
            print(f"\n⚠️  フォーム表示に問題があります:")
            print(f"   - subsidies.yamlの構造を確認してください")

def main():
    """メイン関数"""
    print("🚀 シンセイダー統合テスト")
    print("主要機能の動作確認を行います...")
    
    tester = ShinseiderTester()
    tester.run_all_tests()

if __name__ == "__main__":
    main()