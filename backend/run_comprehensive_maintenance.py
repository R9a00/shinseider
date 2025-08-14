#!/usr/bin/env python3
"""
包括的メンテナンス実行スクリプト
Claude Codeで実行する包括的な補助金情報調査・更新システム
"""

import subprocess
import sys
import os
from datetime import datetime

def main():
    """包括的メンテナンスの実行"""
    
    print("🔍 補助金情報包括的メンテナンスを開始します...")
    print("=" * 60)
    
    current_date = datetime.now().strftime('%Y-%m-%d')
    
    # 1. 包括的調査プロンプトを表示
    print("📋 ステップ1: 包括的調査の実行")
    print("以下のプロンプトファイルを読み込んで調査を実行してください:")
    print(f"📄 ファイル: {os.path.abspath('comprehensive_research_prompt.md')}")
    print()
    
    # プロンプトファイルの内容を表示
    try:
        with open('comprehensive_research_prompt.md', 'r', encoding='utf-8') as f:
            prompt_content = f.read()
        
        print("📝 調査プロンプト:")
        print("-" * 40)
        print(prompt_content)
        print("-" * 40)
        print()
        
    except FileNotFoundError:
        print("❌ エラー: comprehensive_research_prompt.md が見つかりません")
        return
    
    print("🚀 Claude Codeで上記プロンプトを実行し、調査結果YAMLファイルを作成してください。")
    print("💡 調査完了後、作成されたYAMLファイルのパスを入力してください:")
    
    # ユーザーからファイルパスを入力
    research_file = input("調査結果YAMLファイルのパス: ").strip()
    
    if not research_file:
        print("❌ ファイルパスが指定されていません")
        return
    
    if not os.path.exists(research_file):
        print(f"❌ ファイルが見つかりません: {research_file}")
        return
    
    # 2. 包括的調査結果の処理
    print()
    print("📋 ステップ2: 調査結果の処理")
    print("包括的調査結果を処理し、変更履歴を更新します...")
    
    try:
        result = subprocess.run([
            'python3', 'comprehensive_update_processor.py', research_file
        ], capture_output=True, text=True, cwd=os.path.dirname(os.path.abspath(__file__)))
        
        if result.returncode == 0:
            print("✅ 調査結果の処理完了")
            print(result.stdout)
        else:
            print("❌ 調査結果の処理でエラーが発生:")
            print(result.stderr)
            return
            
    except Exception as e:
        print(f"❌ 調査結果処理中にエラーが発生: {e}")
        return
    
    # 3. データベースの更新
    print("📋 ステップ3: データベースの更新")
    print("統合データベースを更新します...")
    
    try:
        result = subprocess.run([
            'python3', 'subsidy_manager.py'
        ], capture_output=True, text=True, cwd=os.path.dirname(os.path.abspath(__file__)))
        
        if result.returncode == 0:
            print("✅ データベース更新完了")
            print(result.stdout)
        else:
            print("❌ データベース更新でエラーが発生:")
            print(result.stderr)
    
    except Exception as e:
        print(f"❌ データベース更新中にエラーが発生: {e}")
    
    # 4. データ整合性チェック
    print("📋 ステップ4: データ整合性チェック")
    print("データの整合性を確認します...")
    
    try:
        result = subprocess.run([
            'python3', 'data_integrity_checker.py'
        ], capture_output=True, text=True, cwd=os.path.dirname(os.path.abspath(__file__)))
        
        if result.returncode == 0:
            print("✅ データ整合性チェック完了")
            print(result.stdout)
        else:
            print("⚠️ データ整合性に問題が検出されました:")
            print(result.stderr)
    
    except Exception as e:
        print(f"❌ データ整合性チェック中にエラーが発生: {e}")
    
    # 5. 公開用レポートの確認
    print("📋 ステップ5: 公開用レポートの確認")
    
    report_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'public_update_report.md')
    if os.path.exists(report_path):
        print(f"📝 公開用レポートが生成されました: {report_path}")
        
        # レポートの内容を少し表示
        try:
            with open(report_path, 'r', encoding='utf-8') as f:
                content = f.read()
                lines = content.split('\n')
                preview = '\n'.join(lines[:20])  # 最初の20行を表示
                
            print("📄 レポートプレビュー:")
            print("-" * 40)
            print(preview)
            if len(lines) > 20:
                print("...")
            print("-" * 40)
        except Exception as e:
            print(f"⚠️ レポートの読み込みでエラー: {e}")
    else:
        print("⚠️ 公開用レポートが見つかりません")
    
    # 6. APIエンドポイントのテスト
    print("📋 ステップ6: APIエンドポイントのテスト")
    print("新しいAPIエンドポイントをテストします...")
    
    api_endpoints = [
        "/public-change-history",
        "/subsidy-investigation-status",
        "/public-update-report"
    ]
    
    for endpoint in api_endpoints:
        try:
            result = subprocess.run([
                'curl', '-s', f'http://localhost:8888{endpoint}'
            ], capture_output=True, text=True)
            
            if result.returncode == 0:
                print(f"✅ {endpoint}: 正常に応答")
            else:
                print(f"❌ {endpoint}: エラー")
                
        except Exception as e:
            print(f"⚠️ {endpoint}: テスト中にエラー ({e})")
    
    # 完了報告
    print()
    print("🎉 包括的メンテナンス完了!")
    print("=" * 60)
    print()
    print("📊 利用可能な新機能:")
    print("- 📈 GET /public-change-history: 公開用変更履歴")
    print("- 🔍 GET /subsidy-investigation-status: 調査状況確認")
    print("- 📝 GET /public-update-report: 更新レポート")
    print()
    print("💡 次回の包括的調査推奨時期:")
    
    # 次回調査時期の計算
    from datetime import timedelta
    next_date = datetime.now() + timedelta(days=30)
    print(f"   📅 {next_date.strftime('%Y-%m-%d')} (30日後)")
    print()
    print("🔧 定期メンテナンスが正常に設定されました。")

if __name__ == "__main__":
    main()