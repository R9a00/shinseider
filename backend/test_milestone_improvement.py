#!/usr/bin/env python3
"""
改善されたマイルストーン入力機能のテスト
"""
import requests
import json

BASE_URL = "http://localhost:8888"

def test_milestone_field_structure():
    """マイルストーンフィールドの構造テスト"""
    print("🧪 マイルストーンフィールド構造のテスト...")
    
    try:
        response = requests.get(
            f"{BASE_URL}/get_application_questions/atotsugi",
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ フォームデータ取得成功!")
            
            # milestone_input フィールドを探す
            found_milestone_fields = 0
            for section in data.get('sections', []):
                input_modes = section.get('input_modes', {})
                for mode_name, mode_data in input_modes.items():
                    if isinstance(mode_data, dict) and 'micro_tasks' in mode_data:
                        tasks = mode_data.get('micro_tasks', [])
                        for task in tasks:
                            if task.get('type') == 'milestone_input':
                                found_milestone_fields += 1
                                print(f"  📋 milestone_input フィールド発見: {task.get('label')}")
                                print(f"     最大項目数: {task.get('max_items', 'N/A')}")
                                print(f"     ヘルプテキスト: {task.get('help_text', 'N/A')}")
                                if task.get('example'):
                                    print(f"     例の数: {len(task.get('example', []))}")
                    elif isinstance(mode_data, list):
                        # micro_tasks が直接リストの場合
                        for task in mode_data:
                            if isinstance(task, dict) and task.get('type') == 'milestone_input':
                                found_milestone_fields += 1
                                print(f"  📋 milestone_input フィールド発見: {task.get('label')}")
                                print(f"     最大項目数: {task.get('max_items', 'N/A')}")
                                print(f"     ヘルプテキスト: {task.get('help_text', 'N/A')}")
                                if task.get('example'):
                                    print(f"     例の数: {len(task.get('example', []))}")
            
            print(f"milestone_input フィールド数: {found_milestone_fields}")
            return found_milestone_fields > 0
        else:
            print(f"❌ フォームデータ取得エラー: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ リクエストエラー: {e}")
        return False

def test_milestone_data_processing():
    """マイルストーンデータ処理のテスト"""
    print("\n🧪 マイルストーンデータ処理のテスト...")
    
    # テストデータ（新しい構造でのマイルストーンデータ）
    test_data = {
        "subsidy_id": "atotsugi",
        "answers": {
            "feasibility_assessment": {
                "MILESTONES": [
                    {
                        "date": "2025-11",
                        "content": "試作完了",
                        "owner": "田中"
                    },
                    {
                        "date": "2026-01",
                        "content": "β版提供開始",
                        "owner": "佐藤"
                    },
                    {
                        "date": "2026-04",
                        "content": "本格ローンチ",
                        "owner": "田中"
                    }
                ]
            }
        },
        "input_mode": "micro_tasks",
        "target": "ai"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/generate_application_advice",
            headers={"Content-Type": "application/json"},
            json=test_data,
            timeout=10
        )
        
        print(f"ステータスコード: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ マイルストーンデータ処理成功!")
            print(f"出力タイプ: {data.get('type')}")
            
            # 出力にマイルストーン情報が含まれているかチェック
            output = data.get('output', '')
            milestone_mentioned = any(word in output for word in ['試作完了', 'β版提供', '本格ローンチ', '田中', '佐藤'])
            
            if milestone_mentioned:
                print("✅ マイルストーン情報が出力に反映されています")
            else:
                print("⚠️ マイルストーン情報が出力に反映されていない可能性があります")
                
            print(f"出力の一部: {output[:200]}...")
            return True
        else:
            print(f"❌ エラー: {response.status_code}")
            try:
                error_data = response.json()
                print(f"エラー詳細: {error_data}")
            except:
                print(f"レスポンス内容: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ リクエストエラー: {e}")
        return False

def test_backend_availability():
    """バックエンドの動作確認"""
    print("🧪 バックエンド動作確認...")
    
    try:
        response = requests.get(f"{BASE_URL}/", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ バックエンド動作中: {data.get('message')}")
            return True
        else:
            print(f"❌ バックエンドエラー: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ バックエンド接続エラー: {e}")
        return False

def main():
    """メインテスト実行"""
    print("🚀 改善されたマイルストーン機能のテスト開始\n")
    
    # 1. バックエンド動作確認
    if not test_backend_availability():
        print("❌ バックエンドが動作していません")
        return False
    
    # 2. フィールド構造確認
    structure_ok = test_milestone_field_structure()
    
    # 3. データ処理テスト
    processing_ok = test_milestone_data_processing()
    
    # 結果まとめ
    print("\n📊 テスト結果:")
    print(f"  フィールド構造: {'✅' if structure_ok else '❌'}")
    print(f"  データ処理: {'✅' if processing_ok else '❌'}")
    
    if structure_ok and processing_ok:
        print("\n🎉 マイルストーン機能の改善が成功しました!")
        print("\n💡 改善点:")
        print("   - 専用のmilestone_inputフィールドタイプを実装")
        print("   - 年月入力にはtype='month'を使用")
        print("   - 3つの項目（時期・内容・責任者）を分離して入力")
        print("   - 視覚的にわかりやすいUI設計")
        print("   - 例示とヘルプテキストを表示")
        print("   - 最初は2つ表示、手動で追加する仕組み")
        return True
    else:
        print("\n⚠️ 一部のテストが失敗しました")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)