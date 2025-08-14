#!/usr/bin/env python3
"""
select_with_custom フィールドタイプのテスト
"""
import requests
import json
import yaml
import os

BASE_URL = "http://localhost:8888"

def test_generate_application_advice():
    """申請アドバイス生成のテスト"""
    print("🧪 申請アドバイス生成APIのテスト...")
    
    # テストデータ
    test_data = {
        "subsidy_id": "atotsugi",
        "answers": {
            "business_overview": {
                "MINI_024_WHO": "地域の高齢者向けサービス",  # カスタム入力例
                "REV_TARGET": "個人のお客様",  # 既存選択肢
                "SUPPLY": "地域の協力業者と連携中"  # カスタム入力例
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
            print("✅ 成功!")
            print(f"出力タイプ: {data.get('type')}")
            print(f"出力の一部: {data.get('output', '')[:100]}...")
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

def test_subsidy_form_structure():
    """フォーム構造の確認"""
    print("\n🧪 フォーム構造のテスト...")
    
    try:
        response = requests.get(
            f"{BASE_URL}/get_application_questions/atotsugi",
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ フォームデータ取得成功!")
            
            # select_with_custom フィールドを探す
            found_custom_fields = 0
            for section in data.get('sections', []):
                input_modes = section.get('input_modes', {})
                for mode_name, mode_data in input_modes.items():
                    if isinstance(mode_data, dict) and 'micro_tasks' in mode_data:
                        tasks = mode_data.get('micro_tasks', [])
                        for task in tasks:
                            if task.get('type') == 'select_with_custom':
                                found_custom_fields += 1
                                print(f"  📋 select_with_custom フィールド発見: {task.get('label')}")
                                print(f"     選択肢数: {len(task.get('options', []))}")
                    elif isinstance(mode_data, list):
                        # micro_tasks が直接リストの場合
                        for task in mode_data:
                            if isinstance(task, dict) and task.get('type') == 'select_with_custom':
                                found_custom_fields += 1
                                print(f"  📋 select_with_custom フィールド発見: {task.get('label')}")
                                print(f"     選択肢数: {len(task.get('options', []))}")
            
            print(f"select_with_custom フィールド数: {found_custom_fields}")
            return found_custom_fields > 0
        else:
            print(f"❌ フォームデータ取得エラー: {response.status_code}")
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
    print("🚀 select_with_custom フィールドタイプのテスト開始\n")
    
    # 1. バックエンド動作確認
    if not test_backend_availability():
        print("❌ バックエンドが動作していません")
        return False
    
    # 2. フォーム構造確認
    form_ok = test_subsidy_form_structure()
    
    # 3. 申請アドバイス生成テスト
    advice_ok = test_generate_application_advice()
    
    # 結果まとめ
    print("\n📊 テスト結果:")
    print(f"  フォーム構造: {'✅' if form_ok else '❌'}")
    print(f"  アドバイス生成: {'✅' if advice_ok else '❌'}")
    
    if form_ok and advice_ok:
        print("\n🎉 すべてのテストが成功しました!")
        return True
    else:
        print("\n⚠️ 一部のテストが失敗しました")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)