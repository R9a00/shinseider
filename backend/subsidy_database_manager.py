#!/usr/bin/env python3
"""
補助金データベース統合管理システム
Single Source of Truth (SSOT) による一元管理

役割分担:
- subsidy_master.yaml: マスターデータベース（完全版、全メタデータ含む）
- subsidies.yaml: API用軽量データ（フロントエンド表示用）
- version_history.yaml: 変更履歴とバージョン管理
"""

import yaml
import json
import os
from datetime import datetime
from typing import Dict, List, Optional, Any
import logging
import shutil
from pathlib import Path

class SubsidyDatabaseManager:
    """補助金データベース統合管理クラス"""
    
    def __init__(self, base_path: str = '/Users/r9a/exp/attg/backend'):
        self.base_path = Path(base_path)
        
        # ファイルパス定義
        self.master_db_path = self.base_path / 'subsidy_master.yaml'      # マスターDB
        self.api_data_path = self.base_path / 'subsidies.yaml'           # API用軽量データ  
        self.version_history_path = self.base_path / 'version_history.yaml' # バージョン履歴
        self.backup_dir = self.base_path / 'backups'                     # バックアップ
        
        # バックアップディレクトリ作成
        self.backup_dir.mkdir(exist_ok=True)
        
        # ログ設定
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
    
    def analyze_current_structure(self) -> Dict[str, Any]:
        """現在のファイル構造を分析"""
        analysis = {
            'files': {},
            'data_consistency': {},
            'recommendations': []
        }
        
        # 各ファイルの分析
        for file_path in [self.master_db_path, self.api_data_path, self.version_history_path]:
            if file_path.exists():
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = yaml.safe_load(f)
                
                analysis['files'][file_path.name] = {
                    'exists': True,
                    'size_mb': file_path.stat().st_size / 1024 / 1024,
                    'structure_type': type(data).__name__,
                    'top_keys': list(data.keys()) if isinstance(data, dict) else 'list',
                    'item_count': len(data) if isinstance(data, (list, dict)) else 0
                }
                
                # 補助金データの詳細分析
                if file_path.name in ['subsidy_master.yaml', 'subsidies.yaml']:
                    subsidies_data = self._extract_subsidies_data(data)
                    analysis['files'][file_path.name]['subsidies_count'] = len(subsidies_data)
                    analysis['files'][file_path.name]['has_form_data'] = self._check_form_data(subsidies_data)
            else:
                analysis['files'][file_path.name] = {'exists': False}
        
        # データ整合性チェック
        analysis['data_consistency'] = self._check_data_consistency()
        
        # 推奨事項
        analysis['recommendations'] = self._generate_recommendations(analysis)
        
        return analysis
    
    def _extract_subsidies_data(self, data: Any) -> Dict[str, Any]:
        """データからsubsidies部分を抽出"""
        if isinstance(data, list):
            return {item.get('id', f'item_{i}'): item for i, item in enumerate(data)}
        elif isinstance(data, dict) and 'subsidies' in data:
            return data['subsidies']
        elif isinstance(data, dict):
            return data
        else:
            return {}
    
    def _check_form_data(self, subsidies_data: Dict[str, Any]) -> bool:
        """フォームデータ（sections等）の存在確認"""
        for subsidy_id, subsidy in subsidies_data.items():
            if 'sections' in subsidy and subsidy['sections']:
                return True
        return False
    
    def _check_data_consistency(self) -> Dict[str, Any]:
        """データ整合性チェック"""
        consistency = {
            'master_vs_api': {},
            'missing_data': [],
            'duplicated_data': [],
            'version_sync': {}
        }
        
        try:
            # マスターとAPIデータの比較
            if self.master_db_path.exists() and self.api_data_path.exists():
                with open(self.master_db_path, 'r', encoding='utf-8') as f:
                    master_data = yaml.safe_load(f)
                with open(self.api_data_path, 'r', encoding='utf-8') as f:
                    api_data = yaml.safe_load(f)
                
                master_subsidies = self._extract_subsidies_data(master_data)
                api_subsidies = self._extract_subsidies_data(api_data)
                
                master_ids = set(master_subsidies.keys())
                api_ids = set(api_subsidies.keys())
                
                consistency['master_vs_api'] = {
                    'master_count': len(master_ids),
                    'api_count': len(api_ids),
                    'common_ids': len(master_ids & api_ids),
                    'master_only': list(master_ids - api_ids),
                    'api_only': list(api_ids - master_ids)
                }
        except Exception as e:
            consistency['error'] = str(e)
        
        return consistency
    
    def _generate_recommendations(self, analysis: Dict[str, Any]) -> List[str]:
        """推奨事項の生成"""
        recommendations = []
        
        # ファイル存在チェック
        if not analysis['files']['subsidy_master.yaml']['exists']:
            recommendations.append("マスターデータベース(subsidy_master.yaml)が存在しません")
        
        if not analysis['files']['subsidies.yaml']['exists']:
            recommendations.append("API用データ(subsidies.yaml)が存在しません")
        
        # データ整合性チェック
        consistency = analysis.get('data_consistency', {})
        master_vs_api = consistency.get('master_vs_api', {})
        
        if master_vs_api.get('master_only'):
            recommendations.append(f"マスターのみに存在するデータ: {master_vs_api['master_only']}")
        
        if master_vs_api.get('api_only'):
            recommendations.append(f"APIのみに存在するデータ: {master_vs_api['api_only']}")
        
        return recommendations
    
    def create_unified_database(self) -> Dict[str, Any]:
        """統合データベースの作成"""
        self.logger.info("🔄 統合データベース作成開始...")
        
        # 現在のデータを分析
        analysis = self.analyze_current_structure()
        
        # バックアップ作成
        self._create_backup()
        
        # マスターデータベースの構築
        master_db = self._build_master_database()
        
        # API用軽量データの生成
        api_data = self._generate_api_data(master_db)
        
        # データベース保存
        self._save_databases(master_db, api_data)
        
        # 検証
        verification = self._verify_databases()
        
        result = {
            'status': 'success' if verification['valid'] else 'warning',
            'analysis': analysis,
            'master_db_created': True,
            'api_data_created': True,
            'verification': verification,
            'timestamp': datetime.now().isoformat()
        }
        
        self.logger.info("✅ 統合データベース作成完了")
        return result
    
    def _create_backup(self):
        """既存ファイルのバックアップ"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        for file_path in [self.master_db_path, self.api_data_path, self.version_history_path]:
            if file_path.exists():
                backup_path = self.backup_dir / f"{file_path.stem}.backup.{timestamp}{file_path.suffix}"
                shutil.copy2(file_path, backup_path)
                self.logger.info(f"📄 バックアップ作成: {backup_path}")
    
    def _build_master_database(self) -> Dict[str, Any]:
        """マスターデータベースの構築"""
        self.logger.info("🏗️ マスターデータベース構築中...")
        
        # 既存のマスターデータを読み込み
        master_db = {}
        if self.master_db_path.exists():
            with open(self.master_db_path, 'r', encoding='utf-8') as f:
                master_db = yaml.safe_load(f) or {}
        
        # メタデータの更新
        if 'metadata' not in master_db:
            master_db['metadata'] = {}
        
        master_db['metadata'].update({
            'last_updated': datetime.now().strftime('%Y-%m-%d'),
            'version': '2.0.0',  # 統合システム版
            'maintainer': '羽生田大陸（株式会社羽生田鉄工所）',
            'system_type': 'unified_database',
            'data_source': 'integrated_master_system'
        })
        
        # 補助金データの確保
        if 'subsidies' not in master_db:
            master_db['subsidies'] = {}
        
        # 既存データとのマージ（必要に応じて）
        if self.api_data_path.exists():
            with open(self.api_data_path, 'r', encoding='utf-8') as f:
                api_data = yaml.safe_load(f)
            
            if isinstance(api_data, list):
                for item in api_data:
                    subsidy_id = item.get('id')
                    if subsidy_id and subsidy_id not in master_db['subsidies']:
                        # API用データからマスター用データを生成
                        master_item = self._convert_api_to_master_format(item)
                        master_db['subsidies'][subsidy_id] = master_item
        
        # 補助金数の更新
        master_db['metadata']['total_subsidies'] = len(master_db['subsidies'])
        
        return master_db
    
    def _convert_api_to_master_format(self, api_item: Dict[str, Any]) -> Dict[str, Any]:
        """API形式からマスター形式への変換"""
        master_item = {
            'id': api_item.get('id'),
            'name': api_item.get('name'),
            'description': api_item.get('description', ''),
            'status': 'active',
            'application_period': api_item.get('application_period', {}),
            'version': '1.0.0',
            'last_updated': datetime.now().strftime('%Y-%m-%d'),
            'source_references': [],
            'change_history': [{
                'author': 'database_unification_system',
                'changes': 'データベース統合による初期化',
                'date': datetime.now().strftime('%Y-%m-%d'),
                'version': '1.0.0'
            }],
            'application_info': {
                'support_amount': api_item.get('support_amount', {}),
                'requirements': api_item.get('requirements', []),
                'application_flow': api_item.get('application_flow', []),
                'expense_examples': api_item.get('expense_examples', [])
            },
            'system_info': {
                'created_at': datetime.now().strftime('%Y-%m-%d'),
                'updated_at': datetime.now().strftime('%Y-%m-%d'),
                'is_active': True,
                'priority_level': 99
            }
        }
        
        # フォームデータの保持
        for form_field in ['sections', 'validation', 'checklist', 'tasks', 'llm_prompt_template', 'diagnosis_expense_examples']:
            if form_field in api_item:
                master_item[form_field] = api_item[form_field]
        
        return master_item
    
    def _generate_api_data(self, master_db: Dict[str, Any]) -> List[Dict[str, Any]]:
        """マスターDBからAPI用軽量データを生成"""
        self.logger.info("📊 API用データ生成中...")
        
        api_data = []
        subsidies = master_db.get('subsidies', {})
        
        for subsidy_id, subsidy_info in subsidies.items():
            api_item = {
                'id': subsidy_id,
                'name': subsidy_info.get('name'),
                'description': subsidy_info.get('description', ''),
                'application_period': subsidy_info.get('application_period', {}),
                'support_amount': subsidy_info.get('application_info', {}).get('support_amount', {}),
                'requirements': subsidy_info.get('application_info', {}).get('requirements', []),
                'application_flow': subsidy_info.get('application_info', {}).get('application_flow', []),
                'expense_examples': subsidy_info.get('application_info', {}).get('expense_examples', [])
            }
            
            # フォームデータの包含（APIでも使用されるため）
            for form_field in ['sections', 'validation', 'checklist', 'tasks', 'llm_prompt_template', 'diagnosis_expense_examples']:
                if form_field in subsidy_info:
                    api_item[form_field] = subsidy_info[form_field]
            
            api_data.append(api_item)
        
        return api_data
    
    def _save_databases(self, master_db: Dict[str, Any], api_data: List[Dict[str, Any]]):
        """データベースファイルの保存"""
        # マスターデータベース保存
        with open(self.master_db_path, 'w', encoding='utf-8') as f:
            yaml.dump(master_db, f, default_flow_style=False, allow_unicode=True, sort_keys=False)
        self.logger.info(f"💾 マスターDB保存: {self.master_db_path}")
        
        # API用データ保存
        with open(self.api_data_path, 'w', encoding='utf-8') as f:
            yaml.dump(api_data, f, default_flow_style=False, allow_unicode=True, sort_keys=False)
        self.logger.info(f"💾 API用データ保存: {self.api_data_path}")
    
    def _verify_databases(self) -> Dict[str, Any]:
        """データベースの検証"""
        verification = {
            'valid': True,
            'checks': {},
            'errors': []
        }
        
        try:
            # ファイル存在確認
            verification['checks']['master_exists'] = self.master_db_path.exists()
            verification['checks']['api_exists'] = self.api_data_path.exists()
            
            if verification['checks']['master_exists'] and verification['checks']['api_exists']:
                # データ整合性確認
                with open(self.master_db_path, 'r', encoding='utf-8') as f:
                    master_data = yaml.safe_load(f)
                with open(self.api_data_path, 'r', encoding='utf-8') as f:
                    api_data = yaml.safe_load(f)
                
                master_subsidies = master_data.get('subsidies', {})
                api_subsidies = {item['id']: item for item in api_data}
                
                verification['checks']['data_count_match'] = len(master_subsidies) == len(api_subsidies)
                verification['checks']['ids_match'] = set(master_subsidies.keys()) == set(api_subsidies.keys())
                
                # フォームデータ確認
                form_data_count = 0
                for subsidy in api_subsidies.values():
                    if 'sections' in subsidy and subsidy['sections']:
                        form_data_count += 1
                
                verification['checks']['form_data_preserved'] = form_data_count > 0
                verification['checks']['form_data_count'] = form_data_count
                
            # 全体検証
            verification['valid'] = all(verification['checks'].values())
            
        except Exception as e:
            verification['valid'] = False
            verification['errors'].append(str(e))
        
        return verification
    
    def get_database_status(self) -> Dict[str, Any]:
        """データベース状態の取得"""
        analysis = self.analyze_current_structure()
        
        return {
            'timestamp': datetime.now().isoformat(),
            'database_files': analysis['files'],
            'data_consistency': analysis['data_consistency'],
            'recommendations': analysis['recommendations'],
            'role_definition': {
                'subsidy_master.yaml': 'マスターデータベース（完全版、全メタデータ、バージョン管理）',
                'subsidies.yaml': 'API用軽量データ（フロントエンド表示、フォームデータ含む）',
                'version_history.yaml': '変更履歴とバージョン管理'
            }
        }

def main():
    """メイン実行関数"""
    print("🚀 補助金データベース統合管理システム")
    print("=" * 50)
    
    db_manager = SubsidyDatabaseManager()
    
    # 現在の状態分析
    print("📊 現在のデータベース状態を分析中...")
    status = db_manager.get_database_status()
    
    print("\n📁 ファイル状態:")
    for filename, info in status['database_files'].items():
        if info.get('exists'):
            print(f"  ✅ {filename}: {info.get('item_count', 0)}件のデータ")
        else:
            print(f"  ❌ {filename}: 存在しません")
    
    print("\n🔍 データ整合性:")
    consistency = status['data_consistency']
    if consistency.get('master_vs_api'):
        mvc = consistency['master_vs_api']
        print(f"  - マスター: {mvc['master_count']}件")
        print(f"  - API: {mvc['api_count']}件")
        print(f"  - 共通: {mvc['common_ids']}件")
        if mvc.get('master_only'):
            print(f"  - マスターのみ: {mvc['master_only']}")
        if mvc.get('api_only'):
            print(f"  - APIのみ: {mvc['api_only']}")
    
    print("\n💡 推奨事項:")
    for rec in status['recommendations']:
        print(f"  - {rec}")
    
    # 統合データベース作成
    print("\n🔧 統合データベースを作成しますか？ (y/n): ", end="")
    user_input = input().strip().lower()
    
    if user_input == 'y':
        result = db_manager.create_unified_database()
        
        print(f"\n✅ 統合完了: {result['status']}")
        print(f"📊 検証結果: {'成功' if result['verification']['valid'] else '警告あり'}")
        
        if not result['verification']['valid']:
            print("⚠️ 検証エラー:")
            for error in result['verification'].get('errors', []):
                print(f"  - {error}")
    else:
        print("❌ 統合をキャンセルしました")

if __name__ == "__main__":
    main()