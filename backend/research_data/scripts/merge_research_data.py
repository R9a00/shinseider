#!/usr/bin/env python3
"""
調査データを version_history.yaml に反映するスクリプト
使用方法: python merge_research_data.py [調査ファイルパス]
"""

import yaml
import sys
import os
from datetime import datetime
import shutil

def load_yaml(file_path):
    """YAMLファイルを読み込み"""
    with open(file_path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)

def save_yaml(data, file_path):
    """YAMLファイルに保存"""
    with open(file_path, 'w', encoding='utf-8') as f:
        yaml.dump(data, f, default_flow_style=False, allow_unicode=True, sort_keys=False)

def create_backup(file_path):
    """バックアップファイルを作成"""
    if os.path.exists(file_path):
        backup_path = f"{file_path}.backup.{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        shutil.copy2(file_path, backup_path)
        print(f"✅ バックアップ作成: {backup_path}")
        return backup_path
    return None

def merge_url_research(version_history, research_data):
    """URL調査結果をマージ"""
    investigation = research_data['investigation']
    findings = research_data['findings']
    
    updates_made = []
    
    for subsidy_id, finding in findings.items():
        if subsidy_id not in version_history['subsidies']:
            print(f"⚠️  {subsidy_id} は version_history に存在しません。スキップします。")
            continue
        
        subsidy_info = version_history['subsidies'][subsidy_id]
        changes_made = False
        
        # URL変更の処理
        if 'new_information' in finding:
            for info in finding['new_information']:
                if info['field'] == 'official_url' and info.get('confidence') == 'high':
                    # source_references の更新
                    if 'source_references' in subsidy_info:
                        for ref in subsidy_info['source_references']:
                            if ref['url'] == info['old_value']:
                                ref['url'] = info['new_value']
                                ref['accessed_date'] = investigation['date']
                                changes_made = True
                                break
                
                elif info['field'] == 'guideline_version':
                    # バージョン情報の更新
                    if 'source_references' in subsidy_info:
                        for ref in subsidy_info['source_references']:
                            if 'version' in ref and ref['version'] == info['old_value']:
                                ref['version'] = info['new_value']
                                ref['accessed_date'] = investigation['date']
                                changes_made = True
                                break
        
        # 最終更新日の更新
        if finding.get('changes_detected') and changes_made:
            # バージョン番号を更新
            current_version = subsidy_info.get('version', '1.0.0')
            version_parts = current_version.split('.')
            version_parts[-1] = str(int(version_parts[-1]) + 1)
            new_version = '.'.join(version_parts)
            
            subsidy_info['version'] = new_version
            subsidy_info['last_updated'] = investigation['date']
            
            # 変更履歴を追加
            if 'change_history' not in subsidy_info:
                subsidy_info['change_history'] = []
            
            change_entry = {
                'version': new_version,
                'date': investigation['date'],
                'changes': 'URL・参照元情報の更新',
                'author': investigation['investigator'],
                'reference_updated': True
            }
            subsidy_info['change_history'].insert(0, change_entry)
            
            updates_made.append(subsidy_id)
    
    return updates_made

def merge_policy_updates(version_history, research_data):
    """政策変更調査結果をマージ"""
    investigation = research_data['investigation']
    findings = research_data['findings']
    
    updates_made = []
    
    for subsidy_id, finding in findings.items():
        if subsidy_id.startswith('new_subsidy_'):
            # 新規補助金の場合は別途処理
            if finding.get('is_new_subsidy'):
                print(f"🆕 新規補助金発見: {finding.get('official_name')}")
                print(f"   - 提案ID: {subsidy_id}")
                print(f"   - 管理機関: {finding.get('managing_agency')}")
                print(f"   - 手動で subsidies.yaml への追加を検討してください")
            continue
        
        if subsidy_id not in version_history['subsidies']:
            print(f"⚠️  {subsidy_id} は version_history に存在しません。スキップします。")
            continue
        
        if not finding.get('changes_detected'):
            continue
        
        subsidy_info = version_history['subsidies'][subsidy_id]
        
        # バージョン更新
        current_version = subsidy_info.get('version', '1.0.0')
        version_parts = current_version.split('.')
        
        # 重要度に応じてバージョンを上げる
        high_impact_changes = any(
            info.get('impact') == 'high' 
            for info in finding.get('new_information', [])
        )
        
        if high_impact_changes:
            # メジャーバージョンアップ
            version_parts[1] = str(int(version_parts[1]) + 1)
            version_parts[2] = '0'
        else:
            # マイナーバージョンアップ
            version_parts[2] = str(int(version_parts[2]) + 1)
        
        new_version = '.'.join(version_parts)
        subsidy_info['version'] = new_version
        subsidy_info['last_updated'] = investigation['date']
        
        # 変更内容のまとめ
        changes_summary = []
        for info in finding.get('new_information', []):
            changes_summary.append(f"{info['field']}: {info['old_value']} → {info['new_value']}")
        
        # 変更履歴を追加
        if 'change_history' not in subsidy_info:
            subsidy_info['change_history'] = []
        
        change_entry = {
            'version': new_version,
            'date': investigation['date'],
            'changes': '; '.join(changes_summary),
            'author': investigation['investigator'],
            'reference_updated': False
        }
        subsidy_info['change_history'].insert(0, change_entry)
        
        updates_made.append(subsidy_id)
    
    return updates_made

def main():
    if len(sys.argv) != 2:
        print("使用方法: python merge_research_data.py [調査ファイルパス]")
        sys.exit(1)
    
    research_file = sys.argv[1]
    version_history_file = os.path.join(os.path.dirname(__file__), '../../version_history.yaml')
    
    if not os.path.exists(research_file):
        print(f"調査ファイルが見つかりません: {research_file}")
        sys.exit(1)
    
    if not os.path.exists(version_history_file):
        print(f"version_history.yaml が見つかりません: {version_history_file}")
        sys.exit(1)
    
    # データ読み込み
    try:
        research_data = load_yaml(research_file)
        version_history = load_yaml(version_history_file)
    except Exception as e:
        print(f"ファイル読み込みエラー: {e}")
        sys.exit(1)
    
    print(f"調査データのマージ中: {research_file}")
    print("=" * 50)
    
    # バックアップ作成
    create_backup(version_history_file)
    
    # 調査タイプに応じて処理
    investigation_type = research_data['investigation']['type']
    
    if investigation_type == 'url_research':
        updates_made = merge_url_research(version_history, research_data)
    elif investigation_type == 'policy_updates':
        updates_made = merge_policy_updates(version_history, research_data)
    else:
        print(f"未対応の調査タイプ: {investigation_type}")
        sys.exit(1)
    
    # 全体メタデータの更新
    version_history['metadata']['last_updated'] = research_data['investigation']['date']
    
    # 保存
    try:
        save_yaml(version_history, version_history_file)
        print(f"✅ version_history.yaml を更新しました")
        
        if updates_made:
            print(f"📝 更新された補助金: {', '.join(updates_made)}")
        else:
            print("📝 変更はありませんでした")
            
    except Exception as e:
        print(f"保存エラー: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()