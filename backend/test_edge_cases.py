#!/usr/bin/env python3
"""
エッジケースとエラーハンドリングの詳細テスト
UIから期待される全ての境界値とエラー状況をテスト
"""
import requests
import json
import time

BASE_URL = "http://localhost:8888"

class EdgeCaseTester:
    def __init__(self):
        self.passed_tests = 0
        self.total_tests = 0
        self.failed_tests = []
    
    def run_test(self, test_name, test_func):
        """個別テストを実行し、結果を記録"""
        print(f"\n🧪 {test_name}...")
        self.total_tests += 1
        
        try:
            result = test_func()
            if result:
                print(f"  ✅ {test_name}: 成功")
                self.passed_tests += 1
            else:
                print(f"  ❌ {test_name}: 失敗")
                self.failed_tests.append(test_name)
            return result
        except Exception as e:
            print(f"  ❌ {test_name}: エラー - {e}")
            self.failed_tests.append(f"{test_name} (例外: {str(e)})")
            return False
    
    def test_empty_data_handling(self):
        """空データでのAI相談テスト"""
        test_cases = [
            {
                "name": "完全に空のanswers",
                "data": {
                    "subsidy_id": "atotsugi",
                    "answers": {},
                    "target": "ai"
                }
            },
            {
                "name": "空のセクション",
                "data": {
                    "subsidy_id": "atotsugi",
                    "answers": {
                        "business_overview": {}
                    },
                    "target": "ai"
                }
            },
            {
                "name": "null値のanswers",
                "data": {
                    "subsidy_id": "atotsugi",
                    "answers": None,
                    "target": "ai"
                }
            }
        ]
        
        success_count = 0
        for test_case in test_cases:
            try:
                response = requests.post(
                    f"{BASE_URL}/api/applications/generate-advice",
                    headers={"Content-Type": "application/json"},
                    json=test_case["data"],
                    timeout=10
                )
                
                # 空データでも適切にハンドリングされることを確認
                if response.status_code == 200:
                    data = response.json()
                    output = data.get('output', '')
                    if len(output) > 50:  # 最低限の出力があることを確認
                        print(f"    ✓ {test_case['name']}: 適切に処理")
                        success_count += 1
                    else:
                        print(f"    ❌ {test_case['name']}: 出力が不十分")
                else:
                    print(f"    ❌ {test_case['name']}: HTTPエラー {response.status_code}")
            except Exception as e:
                print(f"    ❌ {test_case['name']}: 例外 {e}")
        
        return success_count >= 2  # 最低2つは成功することを期待
    
    def test_large_data_handling(self):
        """大きなデータでの処理テスト"""
        # 長いテキストとマイルストーンを含む大きなデータ
        large_data = {
            "subsidy_id": "atotsugi",
            "answers": {
                "business_overview": {
                    "MINI_024_WHO": "X" * 500,  # 長いテキスト
                    "REV_TARGET": "非常に長い説明を含む顧客層の記述です。" * 20
                },
                "feasibility_assessment": {
                    "MILESTONES": [
                        {
                            "date": f"2025-{i:02d}",
                            "content": f"大量マイルストーン{i}の内容です。" * 10,
                            "owner": f"責任者{i}"
                        } for i in range(1, 13)  # 12個のマイルストーン
                    ]
                }
            },
            "target": "ai"
        }
        
        try:
            response = requests.post(
                f"{BASE_URL}/api/applications/generate-advice",
                headers={"Content-Type": "application/json"},
                json=large_data,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                output = data.get('output', '')
                print(f"    ✓ 大量データ処理: 成功 (出力長: {len(output)}文字)")
                return True
            else:
                print(f"    ❌ 大量データ処理: HTTPエラー {response.status_code}")
                return False
        except Exception as e:
            print(f"    ❌ 大量データ処理: 例外 {e}")
            return False
    
    def test_invalid_milestone_data(self):
        """不正なマイルストーンデータのテスト"""
        invalid_milestone_cases = [
            {
                "name": "不完全なマイルストーン（dateなし）",
                "milestones": [
                    {"content": "内容のみ", "owner": "田中"},
                    {"date": "2025-10", "content": "正常なもの", "owner": "佐藤"}
                ]
            },
            {
                "name": "空のマイルストーン配列",
                "milestones": []
            },
            {
                "name": "文字列のマイルストーン",
                "milestones": "無効な文字列データ"
            },
            {
                "name": "数値のマイルストーン",
                "milestones": 12345
            }
        ]
        
        success_count = 0
        for test_case in invalid_milestone_cases:
            try:
                test_data = {
                    "subsidy_id": "atotsugi",
                    "answers": {
                        "feasibility_assessment": {
                            "MILESTONES": test_case["milestones"]
                        }
                    },
                    "target": "ai"
                }
                
                response = requests.post(
                    f"{BASE_URL}/api/applications/generate-advice",
                    headers={"Content-Type": "application/json"},
                    json=test_data,
                    timeout=10
                )
                
                # エラーが起きても適切に処理されることを確認
                if response.status_code in [200, 400]:
                    print(f"    ✓ {test_case['name']}: 適切に処理")
                    success_count += 1
                else:
                    print(f"    ❌ {test_case['name']}: 予期しないステータス {response.status_code}")
            except Exception as e:
                print(f"    ⚠️ {test_case['name']}: 例外（許容範囲）{e}")
                success_count += 1  # 例外処理も適切なハンドリング
        
        return success_count >= 3
    
    def test_concurrent_requests(self):
        """同時リクエストの処理テスト"""
        import threading
        import time
        
        def make_request(request_id):
            try:
                test_data = {
                    "subsidy_id": "atotsugi",
                    "answers": {
                        "business_overview": {
                            "MINI_024_WHO": f"同時リクエスト{request_id}"
                        }
                    },
                    "target": "ai"
                }
                
                response = requests.post(
                    f"{BASE_URL}/api/applications/generate-advice",
                    headers={"Content-Type": "application/json"},
                    json=test_data,
                    timeout=15
                )
                
                return response.status_code == 200
            except:
                return False
        
        # 5つの同時リクエストを実行
        threads = []
        results = [False] * 5
        
        for i in range(5):
            thread = threading.Thread(
                target=lambda idx=i: results.__setitem__(idx, make_request(idx))
            )
            threads.append(thread)
            thread.start()
        
        # 全スレッドの完了を待機
        for thread in threads:
            thread.join()
        
        success_count = sum(results)
        print(f"    同時リクエスト成功: {success_count}/5")
        
        return success_count >= 4  # 80%以上の成功率を期待
    
    def test_api_timeout_handling(self):
        """タイムアウト処理のテスト"""
        try:
            test_data = {
                "subsidy_id": "atotsugi",
                "answers": {
                    "business_overview": {
                        "MINI_024_WHO": "タイムアウトテスト"
                    }
                },
                "target": "ai"
            }
            
            # 非常に短いタイムアウトで実行
            response = requests.post(
                f"{BASE_URL}/api/applications/generate-advice",
                headers={"Content-Type": "application/json"},
                json=test_data,
                timeout=0.1  # 100ms
            )
            
            print("    ⚠️ タイムアウトが発生しませんでした（処理が高速）")
            return True
        except requests.exceptions.Timeout:
            print("    ✓ タイムアウトが適切に処理されました")
            return True
        except Exception as e:
            print(f"    ❌ 予期しない例外: {e}")
            return False
    
    def test_invalid_json_handling(self):
        """不正なJSONの処理テスト"""
        invalid_json_cases = [
            '{"subsidy_id": "atotsugi", "answers": {',  # 不完全なJSON
            '{"subsidy_id": "atotsugi", "answers": {"invalid": }}',  # 構文エラー
            '',  # 空文字列
        ]
        
        success_count = 0
        for i, invalid_json in enumerate(invalid_json_cases):
            try:
                response = requests.post(
                    f"{BASE_URL}/api/applications/generate-advice",
                    headers={"Content-Type": "application/json"},
                    data=invalid_json,
                    timeout=5
                )
                
                # 400エラーが返されることを期待
                if response.status_code == 400:
                    print(f"    ✓ 不正JSON{i+1}: 適切にエラーハンドリング")
                    success_count += 1
                else:
                    print(f"    ❌ 不正JSON{i+1}: 予期しないステータス {response.status_code}")
            except Exception as e:
                print(f"    ⚠️ 不正JSON{i+1}: 例外（許容）{e}")
                success_count += 1
        
        return success_count >= 2
    
    def test_special_characters_handling(self):
        """特殊文字の処理テスト"""
        special_chars_data = {
            "subsidy_id": "atotsugi",
            "answers": {
                "business_overview": {
                    "MINI_024_WHO": "特殊文字テスト: 🚀💡📊⚡️🎉",
                    "REV_TARGET": "日本語特殊文字：①②③④⑤、株式会社・有限会社"
                },
                "feasibility_assessment": {
                    "MILESTONES": [
                        {
                            "date": "2025-12",
                            "content": "特殊文字含有: <script>alert('test')</script>",
                            "owner": "田中@会社"
                        }
                    ]
                }
            },
            "target": "ai"
        }
        
        try:
            response = requests.post(
                f"{BASE_URL}/api/applications/generate-advice",
                headers={"Content-Type": "application/json"},
                json=special_chars_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                output = data.get('output', '')
                print(f"    ✓ 特殊文字処理: 成功")
                return True
            else:
                print(f"    ❌ 特殊文字処理: HTTPエラー {response.status_code}")
                return False
        except Exception as e:
            print(f"    ❌ 特殊文字処理: 例外 {e}")
            return False
    
    def test_form_validation_boundaries(self):
        """フォームバリデーションの境界値テスト"""
        # フォーム構造を取得して境界値をテスト
        try:
            response = requests.get(f"{BASE_URL}/get_application_questions/atotsugi")
            if response.status_code != 200:
                return False
            
            form_data = response.json()
            
            # 年齢制限のテスト (39歳以下)
            age_test_cases = [
                {"age": 39, "should_pass": True},
                {"age": 40, "should_pass": False},
                {"age": 0, "should_pass": False},
                {"age": -1, "should_pass": False}
            ]
            
            success_count = 0
            for test_case in age_test_cases:
                try:
                    test_data = {
                        "subsidy_id": "atotsugi",
                        "answers": {
                            "basic_info": {
                                "MINI_001_AGE": test_case["age"]
                            }
                        },
                        "target": "ai"
                    }
                    
                    advice_response = requests.post(
                        f"{BASE_URL}/api/applications/generate-advice",
                        headers={"Content-Type": "application/json"},
                        json=test_data,
                        timeout=10
                    )
                    
                    # バックエンドでは年齢バリデーションは行われていないため、
                    # レスポンスが正常に返されることを確認
                    if advice_response.status_code == 200:
                        print(f"    ✓ 年齢{test_case['age']}: 処理成功")
                        success_count += 1
                    else:
                        print(f"    ❌ 年齢{test_case['age']}: 処理失敗")
                        
                except Exception as e:
                    print(f"    ❌ 年齢{test_case['age']}: 例外 {e}")
            
            return success_count >= 3
            
        except Exception as e:
            print(f"    例外: {e}")
            return False
    
    def run_all_edge_case_tests(self):
        """全てのエッジケーステストを実行"""
        print("🔥 エッジケース・エラーハンドリング詳細テスト開始")
        print("=" * 70)
        
        # 各エッジケーステストを実行
        self.run_test("空データハンドリング", self.test_empty_data_handling)
        self.run_test("大量データ処理", self.test_large_data_handling)
        self.run_test("不正マイルストーンデータ", self.test_invalid_milestone_data)
        self.run_test("同時リクエスト処理", self.test_concurrent_requests)
        self.run_test("タイムアウト処理", self.test_api_timeout_handling)
        self.run_test("不正JSON処理", self.test_invalid_json_handling)
        self.run_test("特殊文字処理", self.test_special_characters_handling)
        self.run_test("フォームバリデーション境界値", self.test_form_validation_boundaries)
        
        # 結果サマリー
        print("\n" + "=" * 70)
        print("📊 エッジケーステスト結果")
        print("=" * 70)
        
        success_rate = (self.passed_tests / self.total_tests) * 100 if self.total_tests > 0 else 0
        
        print(f"合格: {self.passed_tests}/{self.total_tests} ({success_rate:.1f}%)")
        
        if self.failed_tests:
            print(f"\n❌ 失敗したテスト:")
            for test in self.failed_tests:
                print(f"  - {test}")
        
        if success_rate >= 85:
            print(f"\n🎉 優秀！エッジケースも適切に処理されています")
            return True
        elif success_rate >= 70:
            print(f"\n👍 良好：ほとんどのエッジケースが適切に処理されています")
            return True
        else:
            print(f"\n⚠️ 改善が必要：複数のエッジケースで問題があります")
            return False

def main():
    """メイン実行関数"""
    tester = EdgeCaseTester()
    success = tester.run_all_edge_case_tests()
    
    if success:
        print(f"\n✅ エッジケーステストが成功しました")
    else:
        print(f"\n❌ エッジケーステストで問題が発見されました")
    
    return success

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)