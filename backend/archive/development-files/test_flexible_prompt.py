#!/usr/bin/env python3
"""
改良された柔軟なアトツギ甲子園プロンプトのテスト
部分的情報でも価値のあるアドバイスを提供できるかを検証
"""
import requests
import json
import time

BASE_URL = "http://localhost:8888"

def test_minimal_info():
    """最小限の情報での動作テスト"""
    print("🧪 最小限の情報でのプロンプトテスト...")
    
    minimal_data = {
        "subsidy_id": "atotsugi",
        "answers": {
            "basic_info": {
                "MINI_005_NAME": "田中一郎",
                "MINI_006_COMPANY": "田中製作所"
            },
            "solution_idea": {
                "MINI_025_WHAT": "IoTを活用した製造業向けサービス"
            }
        },
        "target": "ai"
    }
    
    return test_prompt_response(minimal_data, "最小限の情報")

def test_partial_info():
    """部分的な情報での動作テスト"""
    print("🧪 部分的な情報でのプロンプトテスト...")
    
    partial_data = {
        "subsidy_id": "atotsugi",
        "answers": {
            "basic_info": {
                "MINI_001_AGE": 32,
                "MINI_005_NAME": "山田花子", 
                "MINI_006_COMPANY": "山田商店",
                "MINI_007_PREFECTURE": "京都府"
            },
            "current_business": {
                "MINI_008_INDUSTRY": "小売業",
                "MINI_011_MAIN_SERVICE": "地域密着型の食品販売"
            },
            "solution_idea": {
                "MINI_023_CATCH": "地域の美味しさを全国へ",
                "MINI_025_WHAT": "オンライン販売×体験ツアー事業"
            }
        },
        "target": "ai"
    }
    
    return test_prompt_response(partial_data, "部分的な情報")

def test_detailed_info():
    """詳細な情報での動作テスト"""
    print("🧪 詳細な情報でのプロンプトテスト...")
    
    detailed_data = {
        "subsidy_id": "atotsugi",
        "answers": {
            "basic_info": {
                "MINI_001_AGE": 35,
                "MINI_005_NAME": "佐藤太郎",
                "MINI_006_COMPANY": "佐藤精密工業株式会社",
                "MINI_007_PREFECTURE": "愛知県",
                "MINI_002_SUCCESSION_PLAN": "あり"
            },
            "current_business": {
                "MINI_008_INDUSTRY": "製造",
                "MINI_011_MAIN_SERVICE": "自動車部品の精密加工",
                "MINI_014_STRENGTHS": ["高精度技術", "品質管理", "短納期対応"],
                "MINI_015_ISSUES": ["人手不足", "海外競争", "設備老朽化"]
            },
            "customer_problem": {
                "MINI_020_PAINS": ["小ロット対応コスト高", "技術伝承の課題"],
                "MINI_021_SOCIAL": ["製造業の空洞化", "技術者不足"],
                "MINI_022_DIFFERENTIATION": ["独自の微細加工技術", "AI品質管理システム"]
            },
            "solution_idea": {
                "MINI_023_CATCH": "AI×職人技で未来の製造業",
                "MINI_024_WHO": "中小製造業",
                "MINI_025_WHAT": "AI支援による精密加工サービス",
                "MINI_026_HOW": "父の技術をAI化し、設備のスマート化",
                "MINI_027_VALUE": ["高品質", "短納期", "コスト削減"]
            },
            "personal_story": {
                "STORY_WHY_ME": "父の技術を次世代に継承しながら、AIで革新したい",
                "STORY_SUCCESSION_FEELING": "伝統と革新の融合で地域製造業を活性化",
                "STORY_FUTURE_VISION": "技術者が憧れる製造業のモデル企業"
            }
        },
        "target": "ai"
    }
    
    return test_prompt_response(detailed_data, "詳細な情報")

def test_prompt_response(data, info_level):
    """プロンプトレスポンスのテスト実行"""
    try:
        response = requests.post(
            f"{BASE_URL}/api/applications/generate-advice",
            headers={"Content-Type": "application/json"},
            json=data,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            output = result.get('output', '')
            
            # レスポンス品質の評価
            quality_checks = {
                "アクション指向": any(word in output for word in ["改善", "提案", "戦略", "施策"]),
                "具体的期限": any(word in output for word in ["ヶ月", "期限", "目安", "Phase"]),
                "優先順位付け": any(word in output for word in ["優先", "緊急", "即効", "重要"]),
                "段階的アプローチ": "Phase" in output or "💡" in output or "🚀" in output,
                "補助金戦略": any(word in output for word in ["補助金", "優遇", "予選", "ファイナリスト"]),
                "承継要素": any(word in output for word in ["承継", "継承", "世代", "引き継"]),
                "現実的提案": any(word in output for word in ["現実", "実行", "具体", "段階"]),
                "情報ギャップ対応": "不足" in output or "調査" in output or "確認" in output
            }
            
            quality_score = sum(quality_checks.values()) / len(quality_checks) * 100
            
            print(f"✅ {info_level}テスト成功!")
            print(f"   レスポンス長: {len(output)}文字")
            print(f"   品質スコア: {quality_score:.1f}%")
            
            # 品質チェック詳細
            passed_checks = sum(quality_checks.values())
            print(f"   品質要素: {passed_checks}/{len(quality_checks)}項目 ✅")
            
            # アダプティブ対応のチェック（情報レベル別）
            adaptive_response = False
            if info_level == "最小限の情報":
                adaptive_response = ("情報収集" in output or "調査" in output or 
                                   "成功パターン" in output or "優先順位" in output)
            elif info_level == "部分的な情報": 
                adaptive_response = ("追加調査" in output or "補完" in output or
                                   "推測" in output or "可能性" in output)
            elif info_level == "詳細な情報":
                adaptive_response = ("スコア" in output or "評価" in output or
                                   "0-5点" in output or "具体的" in output)
            
            if adaptive_response:
                print(f"   📊 情報レベル適応: ✅")
            else:
                print(f"   📊 情報レベル適応: ❌")
            
            # サンプル出力を表示（最初の500文字）
            print(f"\n📝 生成例（最初の500文字）:")
            print("-" * 60)
            sample_text = output[:500] + "..." if len(output) > 500 else output
            print(sample_text)
            print("-" * 60)
            
            return quality_score >= 70 and adaptive_response
            
        else:
            print(f"❌ {info_level}テストエラー: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ {info_level}テスト例外: {e}")
        return False

def main():
    """メインテスト実行"""
    print("🚀 改良された柔軟プロンプトテスト開始")
    print("=" * 70)
    
    # 3つの情報レベルでテスト
    tests = [
        test_minimal_info,
        test_partial_info, 
        test_detailed_info
    ]
    
    results = []
    for i, test_func in enumerate(tests):
        print(f"\n【テスト {i+1}/3】")
        result = test_func()
        results.append(result)
        time.sleep(1)  # API負荷軽減
    
    # 総合評価
    print("\n" + "=" * 70)
    print("📊 柔軟性テスト結果")
    print("=" * 70)
    
    test_names = ["最小限情報への対応", "部分情報への対応", "詳細情報への対応"]
    for i, (name, result) in enumerate(zip(test_names, results)):
        status = "✅" if result else "❌"
        print(f"{status} {name}")
    
    success_rate = sum(results) / len(results) * 100
    print(f"\n🎯 総合成功率: {success_rate:.1f}% ({sum(results)}/{len(results)})")
    
    if success_rate == 100:
        print("\n🎉 完璧！すべての情報レベルで適切に機能しています")
        print("\n💡 改良された特徴:")
        print("   ✅ 情報不足でも価値のある提案を生成")
        print("   ✅ 情報量に応じて適応的にアドバイス調整") 
        print("   ✅ 段階的・具体的なアクションプランを提示")
        print("   ✅ 補助金戦略と承継要素を適切に統合")
        print("   ✅ 現実的な期限とステップを明示")
        
    elif success_rate >= 66:
        print("\n👍 良好！多くの場面で適切に機能しています")
        print("   失敗したテストケースの改善余地があります")
        
    else:
        print("\n⚠️ 改善が必要です")
        print("   プロンプトの柔軟性をさらに向上させる必要があります")
        
    return success_rate >= 80

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)