#!/usr/bin/env python3
"""
マスキング機能のデバッグ
"""
import sys
sys.path.append('/Users/r9a/exp/attg/backend')
from routers.applications import mask_sensitive_data, format_answers_for_prompt

def test_masking_function():
    """マスキング関数のテスト"""
    print("🔍 マスキング関数のデバッグ...")
    
    test_answers = {
        "basic_info": {
            "MINI_005_NAME": "田中太郎",
            "MINI_006_COMPANY": "田中商事株式会社",
            "other_field": "その他のデータ"
        },
        "solution_idea": {
            "MINI_025_WHAT": "IoTを活用した製造業向けサービス"
        }
    }
    
    print("元データ:")
    for section, data in test_answers.items():
        print(f"  {section}: {data}")
    
    # マスキング処理テスト
    masked = mask_sensitive_data(test_answers)
    print("\nマスキング後:")
    for section, data in masked.items():
        print(f"  {section}: {data}")
    
    # format関数でのマスキングテスト
    formatted_no_mask = format_answers_for_prompt(test_answers, "micro_tasks", mask_data=False)
    print(f"\nマスキングなし format:\n{formatted_no_mask}")
    
    formatted_with_mask = format_answers_for_prompt(test_answers, "micro_tasks", mask_data=True)
    print(f"\nマスキングあり format:\n{formatted_with_mask}")
    
    # チェック
    name_masked = "田中太郎" not in formatted_with_mask and "[匿名]" in formatted_with_mask
    company_masked = "田中商事株式会社" not in formatted_with_mask and "[会社名]" in formatted_with_mask
    
    print(f"\n✅ 名前マスキング成功: {name_masked}")
    print(f"✅ 会社名マスキング成功: {company_masked}")
    
    return name_masked and company_masked

if __name__ == "__main__":
    success = test_masking_function()
    print(f"\n{'✅ 成功' if success else '❌ 失敗'}")