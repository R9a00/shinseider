#!/usr/bin/env python3
"""
Master DataからAPI互換データを生成
"""
import yaml

print('📋 マスターデータからsubsidies.yaml生成開始...')

# マスターデータを読み込み
with open('/Users/r9a/exp/attg/backend/subsidy_master.yaml', 'r', encoding='utf-8') as f:
    master_data = yaml.safe_load(f)

# API互換形式に変換
subsidies_list = []
for subsidy_id, subsidy_info in master_data['subsidies'].items():
    subsidies_list.append({
        'id': subsidy_id,
        'name': subsidy_info['name'],
        'description': subsidy_info.get('description', ''),
        'application_period': subsidy_info.get('application_period', {}),
        'support_amount': subsidy_info.get('application_info', {}).get('support_amount', {}),
        'requirements': subsidy_info.get('application_info', {}).get('requirements', []),
        'application_flow': subsidy_info.get('application_info', {}).get('application_flow', []),
        'expense_examples': subsidy_info.get('application_info', {}).get('expense_examples', [])
    })

print(f'✅ 変換完了: {len(subsidies_list)}件の補助金データ')

# 募集期間情報チェック
for subsidy in subsidies_list:
    if subsidy['application_period']:
        print(f"  - {subsidy['name']}: 募集期間情報あり")
    else:
        print(f"  - {subsidy['name']}: 募集期間情報なし")

# subsidies.yamlに保存
with open('/Users/r9a/exp/attg/backend/subsidies.yaml', 'w', encoding='utf-8') as f:
    yaml.dump(subsidies_list, f, default_flow_style=False, allow_unicode=True, sort_keys=False)

print('✅ subsidies.yaml生成完了')