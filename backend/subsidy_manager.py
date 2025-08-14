#!/usr/bin/env python3
"""
補助金情報統合管理システム
重複を排除し、単一の真理の源(Single Source of Truth)を実現
"""

import yaml
import json
import os
from datetime import datetime
from typing import Dict, List, Optional, Any
import logging

class SubsidyDatabase:
    """補助金情報の統合データベース"""
    
    def __init__(self, base_path: str = '/Users/r9a/exp/attg/backend'):
        self.base_path = base_path
        self.subsidies_path = os.path.join(base_path, 'subsidies.yaml')
        self.version_history_path = os.path.join(base_path, 'version_history.yaml')
        self.master_db_path = os.path.join(base_path, 'subsidy_master.yaml')
        
        # ログ設定
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # マスターデータ構造
        self.master_schema = {
            'metadata': {
                'last_updated': '',
                'version': '',
                'maintainer': '',
                'total_subsidies': 0
            },
            'subsidies': {}
        }
    
    def load_current_data(self) -> Dict[str, Any]:
        """既存の分散データを読み込み"""
        data = {
            'subsidies': {},
            'version_history': {}
        }
        
        # subsidies.yaml読み込み
        try:
            with open(self.subsidies_path, 'r', encoding='utf-8') as f:
                subsidies_raw = yaml.safe_load(f)
                if isinstance(subsidies_raw, list):
                    # リスト形式の場合、IDをキーとした辞書に変換
                    for subsidy in subsidies_raw:
                        if 'id' in subsidy:
                            data['subsidies'][subsidy['id']] = subsidy
                elif isinstance(subsidies_raw, dict):
                    # 辞書形式の場合、そのまま使用
                    data['subsidies'] = subsidies_raw
        except Exception as e:
            self.logger.error(f"subsidies.yaml読み込みエラー: {e}")
        
        # version_history.yaml読み込み
        try:
            with open(self.version_history_path, 'r', encoding='utf-8') as f:
                data['version_history'] = yaml.safe_load(f)
        except Exception as e:
            self.logger.error(f"version_history.yaml読み込みエラー: {e}")
        
        return data
    
    def normalize_subsidy_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """分散データを正規化し統合"""
        master_data = {
            'metadata': {
                'last_updated': datetime.now().strftime('%Y-%m-%d'),
                'version': '2.0.0',
                'maintainer': '羽生田大陸（株式会社羽生田鉄工所）',
                'total_subsidies': 0,
                'data_source': 'unified_from_distributed_files'
            },
            'subsidies': {}
        }
        
        # 補助金データ統合
        subsidies_data = data.get('subsidies', {})
        version_history = data.get('version_history', {}).get('subsidies', {})
        
        # すべての補助金IDを収集
        all_subsidy_ids = set(subsidies_data.keys()) | set(version_history.keys())
        
        for subsidy_id in all_subsidy_ids:
            subsidy_info = subsidies_data.get(subsidy_id, {})
            version_info = version_history.get(subsidy_id, {})
            
            # 統合された補助金情報
            unified_subsidy = {
                'id': subsidy_id,
                'name': subsidy_info.get('name', self._get_display_name_from_id(subsidy_id)),
                'description': subsidy_info.get('description', ''),
                'status': 'active',
                
                # 募集期間情報
                'application_period': subsidy_info.get('application_period', {}),
                
                # バージョン管理情報
                'version': version_info.get('version', '1.0.0'),
                'last_updated': version_info.get('last_updated', datetime.now().strftime('%Y-%m-%d')),
                
                # 参照元情報
                'source_references': version_info.get('source_references', []),
                
                # 変更履歴
                'change_history': version_info.get('change_history', []),
                
                # 申請情報
                'application_info': {
                    'support_amount': subsidy_info.get('support_amount', {}),
                    'requirements': subsidy_info.get('requirements', []),
                    'application_flow': subsidy_info.get('application_flow', []),
                    'expense_examples': subsidy_info.get('expense_examples', [])
                },
                
                # システム情報
                'system_info': {
                    'created_at': version_info.get('change_history', [{}])[-1].get('date', datetime.now().strftime('%Y-%m-%d')),
                    'updated_at': version_info.get('last_updated', datetime.now().strftime('%Y-%m-%d')),
                    'is_active': True,
                    'priority_level': self._get_priority_level(subsidy_id, version_history)
                }
            }
            
            master_data['subsidies'][subsidy_id] = unified_subsidy
        
        master_data['metadata']['total_subsidies'] = len(master_data['subsidies'])
        
        return master_data
    
    def _get_display_name_from_id(self, subsidy_id: str) -> str:
        """IDから表示名を推定（既存のハードコードマッピングを参考）"""
        name_mapping = {
            'shinjigyo_shinshutsu': '中小企業新事業進出補助金',
            'atotsugi': 'アトツギ甲子園',
            'monodukuri_r7_21th': 'ものづくり・商業・サービス生産性向上促進補助金',
            'jigyou_shoukei_ma': '事業承継・M&A補助金（専門家活用枠）',
            'gotech_rd_support': 'Go-Tech事業（成長型中小企業等研究開発支援事業）',
            'shoukuritsuka_ippan': '中小企業省力化投資補助金（一般型）',
            'it_dounyuu_2025': 'IT導入補助金',
            'chusho_jigyou_jizokuka': '小規模事業者持続化補助金'
        }
        return name_mapping.get(subsidy_id, subsidy_id)
    
    def _get_priority_level(self, subsidy_id: str, version_history: Dict) -> int:
        """優先度レベルを設定（既存のpriority_subsidiesを参考）"""
        priority_subsidies = version_history.get('update_policy', {}).get('priority_subsidies', [])
        if subsidy_id in priority_subsidies:
            return priority_subsidies.index(subsidy_id) + 1
        return 99
    
    def save_master_database(self, master_data: Dict[str, Any]) -> bool:
        """統合マスターデータベースを保存"""
        try:
            # バックアップ作成
            if os.path.exists(self.master_db_path):
                backup_path = f"{self.master_db_path}.backup.{datetime.now().strftime('%Y%m%d_%H%M%S')}"
                os.rename(self.master_db_path, backup_path)
                self.logger.info(f"バックアップ作成: {backup_path}")
            
            # マスターデータ保存
            with open(self.master_db_path, 'w', encoding='utf-8') as f:
                yaml.dump(master_data, f, default_flow_style=False, allow_unicode=True, sort_keys=False)
            
            self.logger.info(f"マスターデータベース保存完了: {self.master_db_path}")
            return True
            
        except Exception as e:
            self.logger.error(f"マスターデータベース保存エラー: {e}")
            return False
    
    def generate_api_compatible_data(self, master_data: Dict[str, Any]) -> Dict[str, Any]:
        """既存API互換の形式でデータを生成"""
        
        # subsidies.yaml互換形式
        subsidies_list = []
        for subsidy_id, subsidy_info in master_data['subsidies'].items():
            subsidies_list.append({
                'id': subsidy_id,
                'name': subsidy_info['name'],
                'description': subsidy_info['description'],
                'application_period': subsidy_info['application_period'],
                'support_amount': subsidy_info['application_info']['support_amount'],
                'requirements': subsidy_info['application_info']['requirements'],
                'application_flow': subsidy_info['application_info']['application_flow'],
                'expense_examples': subsidy_info['application_info']['expense_examples']
            })
        
        # version_history.yaml互換形式
        version_history_compatible = {
            'metadata': master_data['metadata'],
            'subsidies': {},
            'update_policy': {
                'check_frequency': '不定期（制度変更時・ユーザー要望時）',
                'priority_subsidies': sorted(
                    master_data['subsidies'].keys(),
                    key=lambda x: master_data['subsidies'][x]['system_info']['priority_level']
                )[:3],
                'notification_required': True,
                'backup_before_update': True,
                'update_trigger': '公募要領更新・制度変更・ユーザーフィードバック'
            }
        }
        
        for subsidy_id, subsidy_info in master_data['subsidies'].items():
            version_history_compatible['subsidies'][subsidy_id] = {
                'version': subsidy_info['version'],
                'last_updated': subsidy_info['last_updated'],
                'source_references': subsidy_info['source_references'],
                'change_history': subsidy_info['change_history']
            }
        
        return {
            'subsidies_yaml': subsidies_list,
            'version_history_yaml': version_history_compatible
        }
    
    def validate_data_integrity(self, master_data: Dict[str, Any]) -> List[str]:
        """データ整合性をチェック"""
        errors = []
        
        for subsidy_id, subsidy_info in master_data['subsidies'].items():
            # 必須フィールドチェック
            required_fields = ['id', 'name', 'version', 'last_updated']
            for field in required_fields:
                if not subsidy_info.get(field):
                    errors.append(f"{subsidy_id}: 必須フィールド '{field}' が不足")
            
            # 日付形式チェック
            date_fields = ['last_updated']
            for field in date_fields:
                try:
                    datetime.strptime(subsidy_info.get(field, ''), '%Y-%m-%d')
                except ValueError:
                    errors.append(f"{subsidy_id}: 日付形式が不正 '{field}': {subsidy_info.get(field)}")
        
        return errors
    
    def migrate_to_unified_system(self) -> bool:
        """既存の分散システムから統合システムへ移行"""
        self.logger.info("補助金情報統合システムへの移行を開始...")
        
        # 1. 既存データ読み込み
        current_data = self.load_current_data()
        self.logger.info(f"既存データ読み込み完了: 補助金{len(current_data['subsidies'])}件")
        
        # 2. データ正規化・統合
        master_data = self.normalize_subsidy_data(current_data)
        self.logger.info(f"データ正規化完了: 統合補助金{len(master_data['subsidies'])}件")
        
        # 3. データ整合性チェック
        errors = self.validate_data_integrity(master_data)
        if errors:
            self.logger.error(f"データ整合性エラー: {errors}")
            return False
        
        # 4. マスターデータベース保存
        if not self.save_master_database(master_data):
            return False
        
        # 5. API互換データ生成
        compatible_data = self.generate_api_compatible_data(master_data)
        
        # 6. 既存ファイル更新（バックアップ後）
        try:
            # subsidies.yaml更新
            backup_subsidies = f"{self.subsidies_path}.backup.{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            os.rename(self.subsidies_path, backup_subsidies)
            
            with open(self.subsidies_path, 'w', encoding='utf-8') as f:
                yaml.dump(compatible_data['subsidies_yaml'], f, default_flow_style=False, allow_unicode=True)
            
            # version_history.yaml更新
            backup_version = f"{self.version_history_path}.backup.{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            os.rename(self.version_history_path, backup_version)
            
            with open(self.version_history_path, 'w', encoding='utf-8') as f:
                yaml.dump(compatible_data['version_history_yaml'], f, default_flow_style=False, allow_unicode=True)
            
            self.logger.info("既存ファイル更新完了（バックアップ作成済み）")
            
        except Exception as e:
            self.logger.error(f"既存ファイル更新エラー: {e}")
            return False
        
        self.logger.info("✅ 補助金情報統合システムへの移行完了")
        return True

def main():
    """メイン実行関数"""
    print("🔄 補助金情報統合システム移行開始...")
    
    db = SubsidyDatabase()
    
    success = db.migrate_to_unified_system()
    
    if success:
        print("🎉 移行完了！単一の真理の源(Single Source of Truth)が確立されました")
        print("\n📋 移行結果:")
        print("  - subsidy_master.yaml: 統合マスターデータベース")
        print("  - subsidies.yaml: API互換形式（自動生成）")
        print("  - version_history.yaml: バージョン履歴（自動生成）")
        print("  - バックアップファイル: 既存データ保護")
    else:
        print("❌ 移行失敗：エラーログを確認してください")

if __name__ == "__main__":
    main()