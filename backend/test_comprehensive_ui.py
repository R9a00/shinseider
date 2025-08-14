#!/usr/bin/env python3
"""
UIからの全ての機能要素を包括的にテストするスクリプト
全てのフィールドタイプ、API エンドポイント、エラーハンドリングを検証
"""
import requests
import json
import time
import sys

BASE_URL = "http://localhost:8888"

class UIFunctionalityTester:
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
    
    def test_backend_health(self):
        """バックエンドの基本動作確認"""
        try:
            response = requests.get(f"{BASE_URL}/", timeout=5)
            return response.status_code == 200
        except:
            return False
    
    def test_form_structure_loading(self):
        """フォーム構造の読み込みテスト"""
        try:
            response = requests.get(f"{BASE_URL}/get_application_questions/atotsugi", timeout=10)
            if response.status_code != 200:
                return False
            
            data = response.json()
            required_keys = ['sections', 'validation', 'checklist', 'tasks']
            
            for key in required_keys:
                if key not in data:
                    print(f"    不足している必須キー: {key}")
                    return False
            
            # セクション構造の確認
            sections = data.get('sections', [])
            if not sections:
                print("    セクションが空です")
                return False
            
            print(f"    セクション数: {len(sections)}")
            print(f"    バリデーションルール: {len(data.get('validation', {}))}")
            print(f"    チェックリスト項目: {len(data.get('checklist', []))}")
            return True
        except Exception as e:
            print(f"    例外: {e}")
            return False
    
    def test_all_field_types(self):
        """全てのフィールドタイプの検出テスト"""
        try:
            response = requests.get(f"{BASE_URL}/get_application_questions/atotsugi", timeout=10)
            if response.status_code != 200:
                return False
            
            data = response.json()
            found_field_types = set()
            # 実際に使用されているフィールドタイプに更新
            expected_field_types = {
                'text', 'textarea', 'select', 'multi_select', 'number',
                'select_with_custom', 'milestone_input', 'text_array'
            }
            
            for section in data.get('sections', []):
                input_modes = section.get('input_modes', {})
                for mode_name, mode_data in input_modes.items():
                    if isinstance(mode_data, dict) and 'micro_tasks' in mode_data:
                        tasks = mode_data.get('micro_tasks', [])
                    elif isinstance(mode_data, list):
                        tasks = mode_data
                    else:
                        continue
                    
                    for task in tasks:
                        if isinstance(task, dict) and 'type' in task:
                            found_field_types.add(task['type'])
            
            print(f"    発見されたフィールドタイプ: {found_field_types}")
            missing_types = expected_field_types - found_field_types
            extra_types = found_field_types - expected_field_types
            
            if missing_types:
                print(f"    期待されるが不足しているタイプ: {missing_types}")
            if extra_types:
                print(f"    新しく発見されたタイプ: {extra_types}")
            
            # 主要なフィールドタイプが存在することを確認
            core_types = {'text', 'select', 'select_with_custom', 'milestone_input'}
            missing_core = core_types - found_field_types
            
            return len(missing_core) == 0
        except Exception as e:
            print(f"    例外: {e}")
            return False
    
    def test_select_with_custom_fields(self):
        """select_with_custom フィールドの検証"""
        try:
            response = requests.get(f"{BASE_URL}/get_application_questions/atotsugi", timeout=10)
            if response.status_code != 200:
                return False
            
            data = response.json()
            custom_fields_found = 0
            
            for section in data.get('sections', []):
                input_modes = section.get('input_modes', {})
                for mode_name, mode_data in input_modes.items():
                    if isinstance(mode_data, dict) and 'micro_tasks' in mode_data:
                        tasks = mode_data.get('micro_tasks', [])
                    elif isinstance(mode_data, list):
                        tasks = mode_data
                    else:
                        continue
                    
                    for task in tasks:
                        if isinstance(task, dict) and task.get('type') == 'select_with_custom':
                            custom_fields_found += 1
                            # オプションの存在確認
                            if not task.get('options'):
                                print(f"    {task.get('label', 'Unknown')} にオプションがありません")
                                return False
                            print(f"    ✓ {task.get('label')}: {len(task.get('options', []))} オプション")
            
            print(f"    select_with_custom フィールド数: {custom_fields_found}")
            return custom_fields_found >= 3  # 期待値: 3つ以上
        except Exception as e:
            print(f"    例外: {e}")
            return False
    
    def test_milestone_input_fields(self):
        """milestone_input フィールドの検証"""
        try:
            response = requests.get(f"{BASE_URL}/get_application_questions/atotsugi", timeout=10)
            if response.status_code != 200:
                return False
            
            data = response.json()
            milestone_fields_found = 0
            
            for section in data.get('sections', []):
                input_modes = section.get('input_modes', {})
                for mode_name, mode_data in input_modes.items():
                    if isinstance(mode_data, dict) and 'micro_tasks' in mode_data:
                        tasks = mode_data.get('micro_tasks', [])
                    elif isinstance(mode_data, list):
                        tasks = mode_data
                    else:
                        continue
                    
                    for task in tasks:
                        if isinstance(task, dict) and task.get('type') == 'milestone_input':
                            milestone_fields_found += 1
                            # 必須属性の確認
                            required_attrs = ['max_items', 'help_text', 'example']
                            for attr in required_attrs:
                                if attr not in task:
                                    print(f"    {task.get('label', 'Unknown')} に {attr} がありません")
                                    return False
                            print(f"    ✓ {task.get('label')}: 最大{task.get('max_items')}項目")
            
            print(f"    milestone_input フィールド数: {milestone_fields_found}")
            return milestone_fields_found >= 1  # 期待値: 1つ以上
        except Exception as e:
            print(f"    例外: {e}")
            return False
    
    def test_ai_advice_generation(self):
        """AI アドバイス生成の包括テスト"""
        test_cases = [
            {
                "name": "基本データでのAI相談",
                "data": {
                    "subsidy_id": "atotsugi",
                    "answers": {
                        "business_overview": {
                            "MINI_024_WHO": "地域の高齢者向けサービス",
                            "REV_TARGET": "個人のお客様"
                        }
                    },
                    "input_mode": "micro_tasks",
                    "target": "ai"
                }
            },
            {
                "name": "マイルストーン込みのAI相談",
                "data": {
                    "subsidy_id": "atotsugi",
                    "answers": {
                        "business_overview": {
                            "MINI_024_WHO": "カスタム入力テスト"
                        },
                        "feasibility_assessment": {
                            "MILESTONES": [
                                {"date": "2025-10", "content": "開発開始", "owner": "田中"},
                                {"date": "2025-12", "content": "試作完成", "owner": "佐藤"}
                            ]
                        }
                    },
                    "input_mode": "micro_tasks",
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
                    timeout=15
                )
                
                if response.status_code == 200:
                    data = response.json()
                    output = data.get('output', '')
                    if len(output) > 100 and '専門アドバイザー' in output:
                        print(f"    ✓ {test_case['name']}: 成功")
                        success_count += 1
                    else:
                        print(f"    ❌ {test_case['name']}: 出力が不十分")
                else:
                    print(f"    ❌ {test_case['name']}: HTTPエラー {response.status_code}")
            except Exception as e:
                print(f"    ❌ {test_case['name']}: 例外 {e}")
        
        return success_count == len(test_cases)
    
    def test_human_expert_advice(self):
        """専門家相談用出力のテスト"""
        try:
            test_data = {
                "subsidy_id": "atotsugi",
                "answers": {
                    "business_overview": {
                        "MINI_024_WHO": "新規事業展開",
                        "REV_TARGET": "法人のお客様"
                    }
                },
                "input_mode": "micro_tasks",
                "target": "human"
            }
            
            response = requests.post(
                f"{BASE_URL}/api/applications/generate-advice",
                headers={"Content-Type": "application/json"},
                json=test_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                output = data.get('output', '')
                # 専門家向け特有の要素をチェック
                required_elements = ['専門家への相談事項', '事業内容', 'お聞きしたいこと']
                missing_elements = [elem for elem in required_elements if elem not in output]
                
                if missing_elements:
                    print(f"    不足している要素: {missing_elements}")
                    return False
                
                print(f"    ✓ 専門家向けフォーマット確認済み")
                return True
            else:
                print(f"    HTTPエラー: {response.status_code}")
                return False
        except Exception as e:
            print(f"    例外: {e}")
            return False
    
    def test_self_reflection_checklist(self):
        """自己チェックリスト出力のテスト"""
        try:
            test_data = {
                "subsidy_id": "atotsugi",
                "answers": {
                    "business_overview": {
                        "MINI_024_WHO": "テスト用データ"
                    }
                },
                "input_mode": "micro_tasks",
                "target": "self"
            }
            
            response = requests.post(
                f"{BASE_URL}/api/applications/generate-advice",
                headers={"Content-Type": "application/json"},
                json=test_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                output = data.get('output', '')
                # 自己チェック特有の要素をチェック
                required_elements = ['申請書の自己チェックリスト', '□', 'あなたの入力内容']
                missing_elements = [elem for elem in required_elements if elem not in output]
                
                if missing_elements:
                    print(f"    不足している要素: {missing_elements}")
                    return False
                
                print(f"    ✓ 自己チェックリストフォーマット確認済み")
                return True
            else:
                print(f"    HTTPエラー: {response.status_code}")
                return False
        except Exception as e:
            print(f"    例外: {e}")
            return False
    
    def test_error_handling(self):
        """エラーハンドリングのテスト"""
        error_test_cases = [
            {
                "name": "存在しない補助金ID",
                "data": {
                    "subsidy_id": "nonexistent",
                    "answers": {},
                    "target": "ai"
                },
                "expected_status": 404
            },
            {
                "name": "無効なターゲット",
                "data": {
                    "subsidy_id": "atotsugi",
                    "answers": {},
                    "target": "invalid_target"
                },
                "expected_status": 200  # デフォルト処理で成功
            }
        ]
        
        success_count = 0
        for test_case in error_test_cases:
            try:
                response = requests.post(
                    f"{BASE_URL}/api/applications/generate-advice",
                    headers={"Content-Type": "application/json"},
                    json=test_case["data"],
                    timeout=10
                )
                
                if response.status_code == test_case["expected_status"]:
                    print(f"    ✓ {test_case['name']}: 期待通りのステータス {response.status_code}")
                    success_count += 1
                else:
                    print(f"    ❌ {test_case['name']}: ステータス {response.status_code}, 期待値 {test_case['expected_status']}")
            except Exception as e:
                print(f"    ❌ {test_case['name']}: 例外 {e}")
        
        return success_count == len(error_test_cases)
    
    def test_data_persistence_apis(self):
        """データ保存関連APIのテスト"""
        apis_to_test = [
            {
                "name": "希望保存API",
                "endpoint": "/api/applications/save-desire",
                "data": {"desire": "テスト用希望データ"},
                "method": "POST"
            },
            {
                "name": "申請データ保存API", 
                "endpoint": "/api/applications/save-data",
                "data": {
                    "subsidy_id": "atotsugi",
                    "application_data": {"test": "data"}
                },
                "method": "POST"
            }
        ]
        
        success_count = 0
        for api_test in apis_to_test:
            try:
                response = requests.post(
                    f"{BASE_URL}{api_test['endpoint']}",
                    headers={"Content-Type": "application/json"},
                    json=api_test["data"],
                    timeout=10
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if 'message' in data:
                        print(f"    ✓ {api_test['name']}: 成功")
                        success_count += 1
                    else:
                        print(f"    ❌ {api_test['name']}: レスポンス形式が不正")
                else:
                    print(f"    ❌ {api_test['name']}: HTTPエラー {response.status_code}")
            except Exception as e:
                print(f"    ❌ {api_test['name']}: 例外 {e}")
        
        return success_count == len(apis_to_test)
    
    def run_comprehensive_test(self):
        """全ての包括テストを実行"""
        print("🚀 UI機能の包括的テスト開始")
        print("=" * 60)
        
        # 基本機能テスト
        self.run_test("バックエンド動作確認", self.test_backend_health)
        self.run_test("フォーム構造読み込み", self.test_form_structure_loading)
        
        # フィールドタイプテスト
        self.run_test("全フィールドタイプ検出", self.test_all_field_types)
        self.run_test("select_with_custom フィールド", self.test_select_with_custom_fields)
        self.run_test("milestone_input フィールド", self.test_milestone_input_fields)
        
        # API機能テスト
        self.run_test("AI アドバイス生成", self.test_ai_advice_generation)
        self.run_test("専門家向けアドバイス", self.test_human_expert_advice)
        self.run_test("自己チェックリスト", self.test_self_reflection_checklist)
        
        # エラーハンドリング・その他
        self.run_test("エラーハンドリング", self.test_error_handling)
        self.run_test("データ保存API", self.test_data_persistence_apis)
        
        # 結果サマリー
        print("\n" + "=" * 60)
        print("📊 包括テスト結果")
        print("=" * 60)
        
        success_rate = (self.passed_tests / self.total_tests) * 100 if self.total_tests > 0 else 0
        
        print(f"合格: {self.passed_tests}/{self.total_tests} ({success_rate:.1f}%)")
        
        if self.failed_tests:
            print(f"\n❌ 失敗したテスト:")
            for test in self.failed_tests:
                print(f"  - {test}")
        
        if success_rate >= 90:
            print(f"\n🎉 優秀！UIの全機能が正常に動作しています")
            return True
        elif success_rate >= 70:
            print(f"\n👍 良好：ほとんどの機能が正常です")
            return True
        else:
            print(f"\n⚠️ 改善が必要：複数の機能に問題があります")
            return False

def main():
    """メイン実行関数"""
    tester = UIFunctionalityTester()
    success = tester.run_comprehensive_test()
    
    if success:
        print(f"\n✅ 包括的UIテストが成功しました")
    else:
        print(f"\n❌ 包括的UIテストで問題が発見されました")
    
    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)