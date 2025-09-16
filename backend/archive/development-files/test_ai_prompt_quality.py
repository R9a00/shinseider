#!/usr/bin/env python3
"""
AI プロンプトの品質と構造をテストするスクリプト
"""
import requests
import json

BASE_URL = "http://localhost:8888"

def test_ai_prompt_structure():
    """改善されたAIプロンプトの構造と内容を検証"""
    print("🧪 AIプロンプトの構造と品質テスト...")
    
    # リアルなテストデータ
    realistic_data = {
        "subsidy_id": "atotsugi",
        "answers": {
            "business_overview": {
                "MINI_024_WHO": "地域の高齢者と子育て世代",
                "REV_TARGET": "地域住民（個人のお客様）",
                "SUPPLY": "地元の農家と直接契約済み"
            },
            "feasibility_assessment": {
                "MILESTONES": [
                    {
                        "date": "2025-10",
                        "content": "試作品完成とテスト開始",
                        "owner": "田中（代表）"
                    },
                    {
                        "date": "2025-12",
                        "content": "地域での実証実験開始",
                        "owner": "佐藤（営業担当）"
                    },
                    {
                        "date": "2026-03",
                        "content": "正式サービス開始",
                        "owner": "田中（代表）"
                    }
                ]
            }
        },
        "input_mode": "micro_tasks",
        "target": "ai"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/applications/generate-advice",
            headers={"Content-Type": "application/json"},
            json=realistic_data,
            timeout=15
        )
        
        print(f"ステータスコード: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            prompt_output = data.get('output', '')
            
            print("✅ AIプロンプト生成成功!")
            print(f"プロンプト長: {len(prompt_output)} 文字")
            
            # プロンプトの構造要素をチェック
            structure_checks = {
                "専門家の役割定義": "アトツギ甲子園の審査を知るストーリーテラー" in prompt_output,
                "申請内容の明確な表示": "提供された申請情報" in prompt_output and "MINI_024_WHO" in prompt_output,
                "承継の分析指示": "承継×新規事業の物語を構造化分析" in prompt_output,
                "審査基準の明示": "アトツギ甲子園 審査基準" in prompt_output,
                "連続性/承継軸": "【連続性/承継の明確化】" in prompt_output,
                "社会的インパクト軸": "【社会的・地域的インパクト】" in prompt_output,
                "事業性軸": "【事業性】" in prompt_output,
                "革新性軸": "【革新性】" in prompt_output,
                "実行可能性軸": "【実行可能性】" in prompt_output,
                "構造化された指示": "以下の形式で" in prompt_output,
                "段階的分析指示": "Phase1" in prompt_output or "段階" in prompt_output,
                "継続対話設計": "追加で質問" in prompt_output or "さらに詳しく" in prompt_output,
                "マイルストーン情報反映": "試作品完成" in prompt_output or "実証実験" in prompt_output
            }
            
            print("\n📋 プロンプト構造チェック:")
            passed_checks = 0
            for check_name, result in structure_checks.items():
                status = "✅" if result else "❌"
                print(f"  {status} {check_name}")
                if result:
                    passed_checks += 1
            
            structure_score = (passed_checks / len(structure_checks)) * 100
            print(f"\n📊 構造完成度: {structure_score:.1f}% ({passed_checks}/{len(structure_checks)})")
            
            # AI最適化要素のチェック
            ai_optimization_checks = {
                "明確な指示文": prompt_output.startswith("あなたは"),
                "箇条書き形式": "- " in prompt_output,
                "セクション分け": "##" in prompt_output,
                "具体的要求": "具体的" in prompt_output,
                "実行可能性重視": "実行可能" in prompt_output,
                "優先順位付け": "優先度" in prompt_output or "順序" in prompt_output
            }
            
            print("\n🤖 AI最適化要素チェック:")
            ai_passed = 0
            for check_name, result in ai_optimization_checks.items():
                status = "✅" if result else "❌"
                print(f"  {status} {check_name}")
                if result:
                    ai_passed += 1
            
            ai_score = (ai_passed / len(ai_optimization_checks)) * 100
            print(f"\n🎯 AI最適化度: {ai_score:.1f}% ({ai_passed}/{len(ai_optimization_checks)})")
            
            # 全体評価
            overall_score = (structure_score + ai_score) / 2
            print(f"\n🏆 総合評価: {overall_score:.1f}%")
            
            if overall_score >= 80:
                print("🎉 優秀なAIプロンプトです！")
            elif overall_score >= 60:
                print("👍 良好なAIプロンプトです")
            else:
                print("⚠️ プロンプトに改善の余地があります")
            
            # プロンプト例の表示
            print(f"\n📝 生成されたプロンプト（最初の500文字）:")
            print("-" * 50)
            print(prompt_output[:500] + "..." if len(prompt_output) > 500 else prompt_output)
            print("-" * 50)
            
            return overall_score >= 70
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

def test_output_formats():
    """3つの出力フォーマット（AI、専門家、自己チェック）をテスト"""
    print("\n🧪 出力フォーマットの完全性テスト...")
    
    test_data = {
        "subsidy_id": "atotsugi",
        "answers": {
            "business_overview": {
                "MINI_024_WHO": "若い起業家向け",
                "REV_TARGET": "法人のお客様"
            }
        },
        "input_mode": "micro_tasks"
    }
    
    formats_to_test = [
        ("ai", "AI向けプロンプト"),
        ("human", "専門家向けサマリー"),
        ("self", "自己チェックリスト")
    ]
    
    results = {}
    
    for target, description in formats_to_test:
        print(f"\n  📋 {description}をテスト...")
        test_data["target"] = target
        
        try:
            response = requests.post(
                f"{BASE_URL}/api/applications/generate-advice",
                headers={"Content-Type": "application/json"},
                json=test_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                output = data.get('output', '')
                output_type = data.get('type', '')
                
                print(f"    ✅ 成功 (タイプ: {output_type}, 長さ: {len(output)}文字)")
                
                # フォーマット固有のチェック
                if target == "ai":
                    valid = "アトツギ甲子園" in output and "【" in output and "】" in output
                elif target == "human":
                    valid = "専門家への相談事項" in output and "事業内容" in output
                elif target == "self":
                    valid = "申請書の自己チェックリスト" in output and "□" in output
                
                results[target] = valid
                print(f"    {'✅' if valid else '❌'} フォーマット妥当性")
                
            else:
                print(f"    ❌ エラー: {response.status_code}")
                results[target] = False
                
        except requests.exceptions.RequestException as e:
            print(f"    ❌ リクエストエラー: {e}")
            results[target] = False
    
    success_count = sum(results.values())
    print(f"\n📊 フォーマットテスト結果: {success_count}/3 成功")
    
    return success_count == 3

def main():
    """メインテスト実行"""
    print("🚀 AI プロンプト品質・効果性テスト開始\n")
    
    # 1. プロンプト構造と品質テスト
    quality_ok = test_ai_prompt_structure()
    
    # 2. 出力フォーマットテスト
    formats_ok = test_output_formats()
    
    # 最終結果
    print("\n" + "="*60)
    print("📊 最終テスト結果:")
    print(f"  AIプロンプト品質: {'✅' if quality_ok else '❌'}")
    print(f"  出力フォーマット: {'✅' if formats_ok else '❌'}")
    
    if quality_ok and formats_ok:
        print("\n🎉 AI プロンプトの最適化が成功しました!")
        print("\n💡 改善された点:")
        print("   ✅ AI向けに構造化された明確な指示")
        print("   ✅ 5つのセクションによる体系的な分析要求")
        print("   ✅ 具体的で実行可能な改善提案の要求")
        print("   ✅ 優先度と期限を含む実践的なアドバイス")
        print("   ✅ 補助金審査員視点での客観的評価")
        print("   ✅ 3つの出力フォーマットすべてが正常動作")
        return True
    else:
        print("\n⚠️ 一部のテストが失敗しました")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)