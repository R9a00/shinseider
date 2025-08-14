#!/usr/bin/env python3
"""
申請フォームデータを保持しながら最新のapplication_periodを適用するスクリプト
"""

import yaml
import os
from datetime import datetime

def load_yaml(filepath):
    """YAMLファイルを読み込み"""
    with open(filepath, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)

def save_yaml(filepath, data):
    """YAMLファイルを保存"""
    with open(filepath, 'w', encoding='utf-8') as f:
        yaml.dump(data, f, default_flow_style=False, allow_unicode=True, sort_keys=False)

def merge_subsidy_data():
    """申請フォームデータと最新のapplication_periodをマージ"""
    
    # バックアップファイル（申請フォームデータあり）
    backup_data = load_yaml('/Users/r9a/exp/attg/backend/subsidies_with_forms.yaml')
    
    # 調査結果データ
    research_data = load_yaml('/Users/r9a/exp/attg/backend/research_results_20250813.yaml')
    
    # IDマッピング
    id_mapping = {
        'monodukuri_r7_21th': 'monodukuri_r7_21th',
        'it_dounyuu': 'it_dounyuu_2025', 
        'chusho_jigyou': 'chusho_jigyou_jizokuka',
        'shinjigyo_shinshutsu': 'shinjigyo_shinshutsu',
        'atotsugi': 'atotsugi',
        'jigyou_shoukei': 'jigyou_shoukei_ma'
    }
    
    # 調査結果のapplication_periodを既存データに適用
    for backup_subsidy in backup_data:
        subsidy_id = backup_subsidy.get('id')
        
        # 調査結果から対応するデータを検索
        for research_id, research_subsidy in research_data.get('subsidies_update', {}).items():
            if id_mapping.get(research_id) == subsidy_id or research_id == subsidy_id:
                # application_periodを更新
                if 'application_period' in research_subsidy:
                    backup_subsidy['application_period'] = research_subsidy['application_period']
                    print(f"✅ {subsidy_id}: application_period更新")
                break
    
    # 更新されたデータを保存
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_path = f'/Users/r9a/exp/attg/backend/subsidies.yaml.backup.{timestamp}'
    
    # 現在のファイルをバックアップ
    if os.path.exists('/Users/r9a/exp/attg/backend/subsidies.yaml'):
        os.rename('/Users/r9a/exp/attg/backend/subsidies.yaml', backup_path)
        print(f"📄 バックアップ作成: {backup_path}")
    
    # 新しいファイルを保存
    save_yaml('/Users/r9a/exp/attg/backend/subsidies.yaml', backup_data)
    print("✅ subsidies.yaml復元完了（申請フォームデータ + 最新recruitment期間）")
    
    return backup_data

if __name__ == "__main__":
    print("🔄 申請フォームデータ復元開始...")
    merged_data = merge_subsidy_data()
    print(f"📊 復元完了: {len(merged_data)}件の補助金データ")