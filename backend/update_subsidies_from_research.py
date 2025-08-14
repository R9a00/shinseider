#!/usr/bin/env python3
"""
補助金調査結果反映スクリプト
LLMが調査したYAML結果をsubsidies.yamlとversion_history.yamlに反映します。
"""

import yaml
import json
from datetime import datetime
import shutil

def backup_files():
    """既存ファイルのバックアップを作成"""
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    
    shutil.copy('/Users/r9a/exp/attg/backend/subsidies.yaml', 
                f'/Users/r9a/exp/attg/backend/subsidies.yaml.backup.{timestamp}')
    shutil.copy('/Users/r9a/exp/attg/backend/version_history.yaml',
                f'/Users/r9a/exp/attg/backend/version_history.yaml.backup.{timestamp}')
    
    print(f"✅ バックアップ作成完了: {timestamp}")

def load_yaml_file(filepath):
    """YAMLファイルを読み込む"""
    with open(filepath, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)

def save_yaml_file(filepath, data):
    """YAMLファイルを保存"""
    with open(filepath, 'w', encoding='utf-8') as f:
        yaml.dump(data, f, default_flow_style=False, allow_unicode=True, sort_keys=False)

def update_subsidies_yaml(research_results):
    """subsidy_master.yamlの application_period を更新 (Single Source of Truth)"""
    master_data = load_yaml_file('/Users/r9a/exp/attg/backend/subsidy_master.yaml')
    
    # IDマッピング（研究結果のIDと既存IDを対応）
    id_mapping = {
        'monodukuri': 'monodukuri_r7_21th',
        'it_dounyuu': 'it_dounyuu_2025',
        'chusho_jigyou': 'chusho_jigyou_jizokuka',
        'shinjigyo_shinshutsu': 'shinjigyo_shinshutsu',
        'atotsugi': 'atotsugi',
        'jigyou_shoukei': 'jigyou_shoukei_ma',
        'gotech_rd_support': 'gotech_rd_support',
        'shoukuritsuka_ippan': 'shoukuritsuka_ippan'
    }
    
    updates_made = []
    
    for research_id, subsidy_info in research_results.get('subsidies_update', {}).items():
        mapped_id = id_mapping.get(research_id, research_id)  # 直接IDマッチもサポート
        
        if mapped_id and mapped_id in master_data.get('subsidies', {}):
            # application_period情報を更新
            if 'application_period' in subsidy_info:
                master_data['subsidies'][mapped_id]['application_period'] = subsidy_info['application_period']
                
                # last_updatedも更新
                current_date = datetime.now().strftime('%Y-%m-%d')
                master_data['subsidies'][mapped_id]['last_updated'] = current_date
                
                updates_made.append(f"{subsidy_info['name']}: 募集期間更新")
    
    # マスターデータベースを保存
    save_yaml_file('/Users/r9a/exp/attg/backend/subsidy_master.yaml', master_data)
    
    # メタデータも更新
    current_date = datetime.now().strftime('%Y-%m-%d')
    master_data['metadata']['last_updated'] = current_date
    
    return updates_made

def update_version_history(research_results):
    """version_history.yamlを更新"""
    version_data = load_yaml_file('/Users/r9a/exp/attg/backend/version_history.yaml')
    current_date = datetime.now().strftime('%Y-%m-%d')
    
    # IDマッピング
    id_mapping = {
        'monodukuri': 'monodukuri_r7_21th',
        'it_dounyuu': 'it_dounyuu_2025', 
        'chusho_jigyou': 'chusho_jigyou_jizokuka',
        'shinjigyo_shinshutsu': 'shinjigyo_shinshutsu',
        'atotsugi': 'atotsugi',
        'jigyou_shoukei': 'jigyou_shoukei_ma'
    }
    
    updates_made = []
    
    for research_id, subsidy_info in research_results.get('subsidies_update', {}).items():
        mapped_id = id_mapping.get(research_id)
        
        if mapped_id and mapped_id in version_data['subsidies']:
            subsidy_version_data = version_data['subsidies'][mapped_id]
            
            # バージョン番号をインクリメント
            current_version = subsidy_version_data.get('version', '1.0.0')
            version_parts = current_version.split('.')
            if len(version_parts) >= 3:
                version_parts[2] = str(int(version_parts[2]) + 1)
                new_version = '.'.join(version_parts)
            else:
                new_version = '1.0.1'
            
            # 更新情報を追加
            subsidy_version_data['version'] = new_version
            subsidy_version_data['last_updated'] = current_date
            
            # 変更履歴に追加
            change_entry = {
                'version': new_version,
                'date': current_date,
                'changes': f"LLM調査による募集期間更新: {subsidy_info.get('status', '状況不明')}",
                'author': 'claude_auto_update',
                'reference_updated': True
            }
            
            if 'change_history' not in subsidy_version_data:
                subsidy_version_data['change_history'] = []
            
            subsidy_version_data['change_history'].insert(0, change_entry)
            
            updates_made.append(f"{subsidy_info['name']}: v{new_version}")
    
    # メタデータも更新
    version_data['metadata']['last_updated'] = current_date
    
    # ファイルを保存
    save_yaml_file('/Users/r9a/exp/attg/backend/version_history.yaml', version_data)
    
    return updates_made

def main():
    """メイン関数 - 調査結果YAMLを指定"""
    print("補助金調査結果反映スクリプトを開始します...")
    
    import sys
    
    # コマンドライン引数から取得、なければ入力を求める
    if len(sys.argv) > 1:
        research_file = sys.argv[1].strip()
    else:
        research_file = input("調査結果YAMLファイルのパスを入力してください: ").strip()
    
    if not research_file:
        print("❌ ファイルパスが指定されていません")
        return
    
    try:
        # 調査結果を読み込み
        research_results = load_yaml_file(research_file)
        
        # バックアップ作成
        backup_files()
        
        # subsidies.yamlを更新
        subsidies_updates = update_subsidies_yaml(research_results)
        
        # version_history.yamlを更新
        version_updates = update_version_history(research_results)
        
        # 結果報告
        print("\n📋 更新完了:")
        print("   Subsidies.yaml:")
        for update in subsidies_updates:
            print(f"     - {update}")
        
        print("   Version_history.yaml:")
        for update in version_updates:
            print(f"     - {update}")
        
        # プロンプトファイルも自動更新
        print("\n🔄 LLM更新プロンプトも自動更新中...")
        import subprocess
        subprocess.run(['python3', 'update_prompt_generator.py'], 
                      cwd='/Users/r9a/exp/attg/backend')
        
        print("✅ 全て完了しました！")
        
    except Exception as e:
        print(f"❌ エラーが発生しました: {e}")

if __name__ == "__main__":
    main()