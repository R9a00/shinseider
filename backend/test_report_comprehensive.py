#!/usr/bin/env python3
"""
包括的機能テストの最終レポート生成
UIから期待される全ての要素の動作確認結果をまとめる
"""
import subprocess
import sys
import json
import time
from datetime import datetime

def run_test_suite(test_file, description):
    """テストスイートを実行し、結果を記録"""
    print(f"\n{'='*60}")
    print(f"🧪 {description}")
    print(f"{'='*60}")
    
    try:
        start_time = time.time()
        result = subprocess.run([sys.executable, test_file], 
                              capture_output=True, text=True, timeout=120)
        end_time = time.time()
        
        execution_time = end_time - start_time
        success = result.returncode == 0
        
        print(result.stdout)
        if result.stderr:
            print("STDERR:", result.stderr)
        
        return {
            "test_file": test_file,
            "description": description,
            "success": success,
            "execution_time": execution_time,
            "stdout": result.stdout,
            "stderr": result.stderr,
            "return_code": result.returncode
        }
    except subprocess.TimeoutExpired:
        print(f"❌ タイムアウト: {test_file}")
        return {
            "test_file": test_file,
            "description": description,
            "success": False,
            "execution_time": 120,
            "error": "timeout"
        }
    except Exception as e:
        print(f"❌ 実行エラー: {e}")
        return {
            "test_file": test_file,
            "description": description,
            "success": False,
            "execution_time": 0,
            "error": str(e)
        }

def generate_summary_report(test_results):
    """総合レポートを生成"""
    print("\n" + "="*80)
    print("📊 包括的UI機能テスト - 最終レポート")
    print("="*80)
    print(f"テスト実行日時: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"テストスイート数: {len(test_results)}")
    
    successful_tests = [result for result in test_results if result['success']]
    failed_tests = [result for result in test_results if not result['success']]
    
    success_rate = (len(successful_tests) / len(test_results)) * 100 if test_results else 0
    total_execution_time = sum(result.get('execution_time', 0) for result in test_results)
    
    print(f"成功率: {success_rate:.1f}% ({len(successful_tests)}/{len(test_results)})")
    print(f"総実行時間: {total_execution_time:.1f}秒")
    
    print(f"\n✅ 成功したテストスイート:")
    for result in successful_tests:
        print(f"  - {result['description']} ({result['execution_time']:.1f}秒)")
    
    if failed_tests:
        print(f"\n❌ 失敗したテストスイート:")
        for result in failed_tests:
            print(f"  - {result['description']}")
            if 'error' in result:
                print(f"    エラー: {result['error']}")
    
    # 詳細分析
    print(f"\n📋 機能別テスト結果:")
    
    function_categories = {
        "フォーム機能": ["select_with_custom", "milestone_input"],
        "AI機能": ["ai_prompt_quality"],
        "基本機能": ["comprehensive_ui"],
        "エラーハンドリング": ["edge_cases"],
        "データ完全性": ["integrity_checker"]
    }
    
    for category, keywords in function_categories.items():
        category_results = [result for result in test_results 
                          if any(keyword in result['test_file'] for keyword in keywords)]
        if category_results:
            category_success = all(result['success'] for result in category_results)
            status = "✅" if category_success else "❌"
            print(f"  {status} {category}: {len([r for r in category_results if r['success']])}/{len(category_results)}")
    
    # 全体評価
    print(f"\n🏆 総合評価:")
    if success_rate >= 95:
        print("🎉 優秀！全ての機能が期待通りに動作しています")
        overall_status = "EXCELLENT"
    elif success_rate >= 85:
        print("👍 良好：ほとんどの機能が正常に動作しています")
        overall_status = "GOOD"
    elif success_rate >= 70:
        print("⚠️ 標準：基本機能は動作していますが改善の余地があります")
        overall_status = "ACCEPTABLE"
    else:
        print("❌ 要改善：複数の機能に問題があります")
        overall_status = "NEEDS_IMPROVEMENT"
    
    # 推奨事項
    print(f"\n💡 推奨事項:")
    if failed_tests:
        print("  - 失敗したテストの詳細調査と修正")
    if success_rate < 100:
        print("  - エラーハンドリングの強化")
    print("  - 定期的な機能テストの実行")
    print("  - パフォーマンス監視の継続")
    
    return {
        "timestamp": datetime.now().isoformat(),
        "success_rate": success_rate,
        "total_tests": len(test_results),
        "successful_tests": len(successful_tests),
        "failed_tests": len(failed_tests),
        "total_execution_time": total_execution_time,
        "overall_status": overall_status,
        "test_results": test_results
    }

def main():
    """メイン実行関数"""
    print("🚀 包括的UI機能テスト開始")
    print("システムの全機能をUIの観点から検証します")
    
    # テストスイートの定義
    test_suites = [
        {
            "file": "test_select_custom.py",
            "description": "select_with_custom フィールドタイプ機能テスト"
        },
        {
            "file": "test_milestone_improvement.py", 
            "description": "milestone_input フィールドタイプ機能テスト"
        },
        {
            "file": "test_ai_prompt_quality.py",
            "description": "AI プロンプト品質・効果性テスト"
        },
        {
            "file": "test_comprehensive_ui.py",
            "description": "UI全機能包括テスト"
        },
        {
            "file": "test_edge_cases.py",
            "description": "エッジケース・エラーハンドリングテスト"
        },
        {
            "file": "test_integrity_checker.py",
            "description": "データ完全性・整合性テスト"
        }
    ]
    
    # 各テストスイートを実行
    test_results = []
    for test_suite in test_suites:
        result = run_test_suite(test_suite["file"], test_suite["description"])
        test_results.append(result)
    
    # 総合レポートを生成
    summary = generate_summary_report(test_results)
    
    # 結果の保存
    with open("test_report_comprehensive.json", "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)
    
    print(f"\n📄 詳細レポートが test_report_comprehensive.json に保存されました")
    
    # 最終判定
    if summary["success_rate"] >= 85:
        print(f"\n🎉 包括的UIテストが成功しました！")
        print(f"✅ UIから期待される全ての要素が適切に動作しています")
        return True
    else:
        print(f"\n⚠️ 包括的UIテストで課題が発見されました")
        print(f"❌ 一部の機能に改善が必要です")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)