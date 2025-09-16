#!/usr/bin/env python3
"""
subsidies_with_forms.yamlのフォーム情報をsubsidy_master.yamlに統合
"""
import yaml
import shutil
from datetime import datetime

def backup_master_data():
    """マスターデータをバックアップ"""
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_file = f'/Users/r9a/exp/attg/backend/subsidy_master.yaml.backup.{timestamp}'
    shutil.copy('/Users/r9a/exp/attg/backend/subsidy_master.yaml', backup_file)
    print(f"✅ バックアップ作成: {backup_file}")
    return backup_file

def load_yaml_file(filepath):
    """YAMLファイルを読み込み"""
    with open(filepath, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)

def save_yaml_file(filepath, data):
    """YAMLファイルを保存"""
    with open(filepath, 'w', encoding='utf-8') as f:
        yaml.dump(data, f, default_flow_style=False, allow_unicode=True, sort_keys=False)

def main():
    print("📋 フォーム情報統合開始...")
    
    # バックアップ作成
    backup_master_data()
    
    # データ読み込み
    master_data = load_yaml_file('/Users/r9a/exp/attg/backend/subsidy_master.yaml')
    form_data = load_yaml_file('/Users/r9a/exp/attg/backend/subsidies_with_forms.yaml')
    
    print(f"📥 マスターデータ: {len(master_data['subsidies'])}件")
    print(f"📥 フォームデータ: {len(form_data)}件")
    
    # フォームデータをIDでマッピング
    form_by_id = {item['id']: item for item in form_data}
    
    # 統合処理
    updates_count = 0
    for subsidy_id, subsidy_info in master_data['subsidies'].items():
        if subsidy_id in form_by_id:
            form_info = form_by_id[subsidy_id]
            
            # フォーム関連情報を追加
            if 'sections' in form_info:
                subsidy_info['sections'] = form_info['sections']
                updates_count += 1
                print(f"  ✅ {subsidy_info['name']}: sections統合完了")
            
            if 'validation' in form_info:
                subsidy_info['validation'] = form_info['validation']
                print(f"  ✅ {subsidy_info['name']}: validation統合完了")
            
            if 'checklist' in form_info:
                subsidy_info['checklist'] = form_info['checklist']
                print(f"  ✅ {subsidy_info['name']}: checklist統合完了")
                
            if 'tasks' in form_info:
                subsidy_info['tasks'] = form_info['tasks']
                print(f"  ✅ {subsidy_info['name']}: tasks統合完了")
                
            if 'llm_prompt_template' in form_info:
                subsidy_info['llm_prompt_template'] = form_info['llm_prompt_template']
                print(f"  ✅ {subsidy_info['name']}: LLMプロンプト統合完了")
                
            if 'diagnosis_expense_examples' in form_info:
                subsidy_info['diagnosis_expense_examples'] = form_info['diagnosis_expense_examples']
                print(f"  ✅ {subsidy_info['name']}: 診断経費例統合完了")
        else:
            print(f"  ⚠️ {subsidy_info['name']}: フォームデータなし")
    
    # メタデータ更新
    current_date = datetime.now().strftime('%Y-%m-%d')
    master_data['metadata']['last_updated'] = current_date
    
    # 保存
    save_yaml_file('/Users/r9a/exp/attg/backend/subsidy_master.yaml', master_data)
    
    print(f"\n🎉 統合完了!")
    print(f"📊 更新件数: {updates_count}件")
    print("📄 保存完了: subsidy_master.yaml")

if __name__ == '__main__':
    main()