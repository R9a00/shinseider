#!/usr/bin/env python3
"""
Claude Code専用 補助金システム保守運用スクリプト
Claude Codeのツールセットを活用した効率的な自動保守実行
"""

import subprocess
import yaml
import json
import os
from datetime import datetime, timedelta

def execute_with_report(description, command):
    """コマンド実行と結果報告"""
    print(f"🔄 {description}")
    try:
        if isinstance(command, list):
            result = subprocess.run(command, capture_output=True, text=True, cwd='/Users/r9a/exp/attg/backend')
        else:
            result = subprocess.run(command, shell=True, capture_output=True, text=True, cwd='/Users/r9a/exp/attg/backend')
        
        if result.returncode == 0:
            print(f"✅ {description}: 完了")
            return True, result.stdout
        else:
            print(f"❌ {description}: エラー - {result.stderr}")
            return False, result.stderr
    except Exception as e:
        print(f"❌ {description}: 実行失敗 - {e}")
        return False, str(e)

def validate_file_exists(filepath, description):
    """ファイル存在確認"""
    if os.path.exists(filepath):
        print(f"✅ {description}: 存在確認")
        return True
    else:
        print(f"❌ {description}: ファイルが見つかりません")
        return False

def run_llm_research_and_update():
    """LLM調査と更新の完全自動化"""
    print("\n🤖 LLM調査実行と結果反映を開始...")
    
    # 1. 最新プロンプト生成
    success, output = execute_with_report(
        "LLM更新プロンプト生成", 
        ['python3', 'update_prompt_generator.py']
    )
    if not success:
        return False
    
    # 2. プロンプト内容を読み込み
    try:
        with open('/Users/r9a/exp/attg/backend/llm_update_prompt.md', 'r', encoding='utf-8') as f:
            prompt_content = f.read()
        print(f"✅ LLM更新プロンプト読み込み: 完了 ({len(prompt_content)}文字)")
    except Exception as e:
        print(f"❌ プロンプト読み込み失敗: {e}")
        return False
    
    # 3. Claude Codeで補助金調査実行
    print(f"🔍 6つの補助金の最新情報を調査中...")
    
    # この部分でClaude CodeのWebFetchとWebSearchツールを使用
    research_results = {
        'subsidies_update': {},
        'general_updates': []
    }
    
    # 補助金調査対象リスト
    subsidies_to_research = [
        ('monodukuri', 'ものづくり・商業・サービス生産性向上促進補助金', 'https://portal.monodukuri-hojo.jp/'),
        ('it_dounyuu', 'IT導入補助金', 'https://it-shien.smrj.go.jp/'),
        ('chusho_jigyou', '小規模事業者持続化補助金', 'https://r3.jizokukahojokin.info/'),
        ('shinjigyo_shinshutsu', '中小企業新事業進出補助金', 'https://shinjigyou-shinshutsu.smrj.go.jp/'),
        ('atotsugi', 'アトツギ甲子園', 'https://atotsugi-koshien.go.jp/'),
        ('jigyou_shoukei', '事業承継・M&A補助金（専門家活用枠）', 'https://jsh.go.jp/')
    ]
    
    print("📝 調査実行をClaude Codeに委譲...")
    print("以下の調査を実行してください：")
    print(prompt_content)
    
    return True

def apply_research_results(research_yaml_path):
    """調査結果の自動反映"""
    print(f"\n📥 調査結果反映: {research_yaml_path}")
    
    if not validate_file_exists(research_yaml_path, "調査結果YAMLファイル"):
        return False
    
    # 調査結果反映スクリプト実行
    success, output = execute_with_report(
        "調査結果の自動反映",
        f'echo "{research_yaml_path}" | python3 update_subsidies_from_research.py'
    )
    
    return success

def verify_system_status():
    """システム状態の包括的検証"""
    print("\n🎯 システム状態検証中...")
    
    verification_results = []
    
    # 1. 重要ファイルの存在確認
    critical_files = [
        ('/Users/r9a/exp/attg/backend/subsidies.yaml', 'メイン補助金データ'),
        ('/Users/r9a/exp/attg/backend/version_history.yaml', 'バージョン履歴'),
        ('/Users/r9a/exp/attg/backend/llm_update_prompt.md', 'LLM更新プロンプト')
    ]
    
    for filepath, description in critical_files:
        if validate_file_exists(filepath, description):
            verification_results.append(True)
        else:
            verification_results.append(False)
    
    # 2. バックアップファイル確認
    try:
        backup_files = [f for f in os.listdir('/Users/r9a/exp/attg/backend') if '.backup.' in f]
        if backup_files:
            latest_backup = max(backup_files, key=lambda x: os.path.getmtime(os.path.join('/Users/r9a/exp/attg/backend', x)))
            print(f"✅ 最新バックアップ: {latest_backup}")
            verification_results.append(True)
        else:
            print(f"⚠️ バックアップファイルなし")
            verification_results.append(False)
    except Exception as e:
        print(f"❌ バックアップ確認失敗: {e}")
        verification_results.append(False)
    
    # 3. version_history.yamlの内容確認
    try:
        with open('/Users/r9a/exp/attg/backend/version_history.yaml', 'r', encoding='utf-8') as f:
            version_data = yaml.safe_load(f)
        
        last_updated = version_data.get('metadata', {}).get('last_updated', 'Unknown')
        subsidies_count = len(version_data.get('subsidies', {}))
        
        print(f"✅ 履歴ファイル: 最終更新{last_updated}, 管理補助金{subsidies_count}件")
        verification_results.append(True)
        
    except Exception as e:
        print(f"❌ 履歴ファイル読み込み失敗: {e}")
        verification_results.append(False)
    
    success_rate = sum(verification_results) / len(verification_results)
    print(f"📊 システム状態: {success_rate:.1%} 正常 ({sum(verification_results)}/{len(verification_results)})")
    
    return success_rate >= 0.8

def generate_maintenance_summary():
    """保守実行サマリー生成"""
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    next_maintenance = (datetime.now() + timedelta(days=14)).strftime('%Y-%m-%d')
    
    summary = f"""
📋 Claude Code 保守実行完了サマリー
実行日時: {timestamp}

✅ 実行内容:
  - LLM更新プロンプト生成・更新
  - 補助金情報調査実行委譲
  - システム状態検証
  - 次回保守予定記録

📅 次回保守予定: {next_maintenance}

💡 注意事項:
  - 調査結果がある場合は apply_research_results() を実行
  - エラーがある場合は該当ファイルを確認
  - 重要な変更前はバックアップを確認

🎯 Claude Code での効率的な保守実行完了
"""
    
    print(summary)
    
    # ログファイルに記録
    try:
        with open('/Users/r9a/exp/attg/backend/claude_maintenance_log.txt', 'a', encoding='utf-8') as f:
            f.write(f"\n{timestamp}: Claude Code保守実行完了\n")
            f.write(f"次回予定: {next_maintenance}\n")
    except Exception as e:
        print(f"⚠️ ログ記録失敗: {e}")

def main():
    """Claude Code専用メイン保守実行"""
    print("🚀 Claude Code専用 補助金システム保守開始")
    print("=" * 60)
    
    # Phase 1: プロンプト更新と調査準備
    success = run_llm_research_and_update()
    if not success:
        print("❌ 保守実行中断: LLM調査準備でエラー")
        return
    
    # Phase 2: システム状態検証
    system_ok = verify_system_status()
    if not system_ok:
        print("⚠️ システム状態に問題あり: 要確認")
    
    # Phase 3: 保守完了サマリー
    generate_maintenance_summary()
    
    print("\n🎉 Claude Code専用保守実行完了!")
    print("📌 調査結果がある場合は、結果YAMLファイルパスを指定して apply_research_results() を実行してください")

if __name__ == "__main__":
    main()