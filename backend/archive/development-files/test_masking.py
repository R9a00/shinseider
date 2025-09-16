#!/usr/bin/env python3
"""
マスキング機能のテスト
"""
import requests
import json

BASE_URL = "http://localhost:8888"

def test_masking():
    """マスキング機能のテスト"""
    print("🧪 マスキング機能テスト...")
    
    test_data = {
        "subsidy_id": "atotsugi",
        "answers": {
            "basic_info": {
                "MINI_005_NAME": "田中太郎",
                "MINI_006_COMPANY": "田中商事株式会社"
            },
            "solution_idea": {
                "MINI_025_WHAT": "IoTを活用した製造業向けサービス"
            }
        },
        "target": "ai"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/applications/generate-advice",
            headers={"Content-Type": "application/json"},
            json=test_data,
            timeout=15
        )
        
        if response.status_code == 200:
            data = response.json()
            output = data.get('output', '')
            
            print(f"レスポンス長: {len(output)}文字")
            
            # マスキングチェック
            has_real_name = "田中太郎" in output
            has_real_company = "田中商事株式会社" in output
            has_masked_name = "[匿名]" in output
            has_masked_company = "[会社名]" in output
            
            print("\n🔍 マスキング状況:")
            print(f"実名が含まれている: {'❌' if has_real_name else '✅'}")
            print(f"実会社名が含まれている: {'❌' if has_real_company else '✅'}")
            print(f"マスク済み名前: {'✅' if has_masked_name else '❌'}")
            print(f"マスク済み会社名: {'✅' if has_masked_company else '✅'}")
            
            # 出力例を表示
            print("\n📝 生成されたプロンプト（最初の800文字）:")
            print("-" * 80)
            print(output[:800] + "..." if len(output) > 800 else output)
            print("-" * 80)
            
            success = not has_real_name and not has_real_company
            return success
            
        else:
            print(f"❌ エラー: {response.status_code}")
            print(response.text)
            return False
            
    except Exception as e:
        print(f"❌ 例外: {e}")
        return False

if __name__ == "__main__":
    success = test_masking()
    if success:
        print("\n✅ マスキング機能は正常に動作しています")
    else:
        print("\n❌ マスキング機能に問題があります")
    exit(0 if success else 1)