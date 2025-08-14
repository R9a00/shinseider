#!/usr/bin/env python3
"""
統合補助金API
subsidy_master.yamlを単一の真理の源として使用
重複排除・一元管理を実現
"""

import yaml
import os
from typing import Dict, List, Optional, Any
from datetime import datetime

class UnifiedSubsidyAPI:
    """統合補助金データAPI"""
    
    def __init__(self, base_path: str = '/Users/r9a/exp/attg/backend'):
        self.base_path = base_path
        self.master_db_path = os.path.join(base_path, 'subsidy_master.yaml')
        self._cache = None
        self._cache_timestamp = None
        
    def _load_master_data(self, force_reload: bool = False) -> Dict[str, Any]:
        """マスターデータをキャッシュ付きで読み込み"""
        if not force_reload and self._cache is not None:
            # ファイル変更時刻をチェック
            current_mtime = os.path.getmtime(self.master_db_path)
            if current_mtime == self._cache_timestamp:
                return self._cache
        
        try:
            with open(self.master_db_path, 'r', encoding='utf-8') as f:
                self._cache = yaml.safe_load(f)
                self._cache_timestamp = os.path.getmtime(self.master_db_path)
                return self._cache
        except FileNotFoundError:
            return {'metadata': {}, 'subsidies': {}}
    
    def get_all_subsidies(self) -> List[Dict[str, Any]]:
        """全補助金リストを取得（API互換形式）"""
        master_data = self._load_master_data()
        subsidies = []
        
        for subsidy_id, subsidy_info in master_data.get('subsidies', {}).items():
            subsidies.append({
                'id': subsidy_id,
                'name': subsidy_info['name'],
                'description': subsidy_info['description'],
                'application_period': subsidy_info['application_period'],
                'support_amount': subsidy_info['application_info']['support_amount'],
                'requirements': subsidy_info['application_info']['requirements'],
                'application_flow': subsidy_info['application_info']['application_flow'],
                'expense_examples': subsidy_info['application_info']['expense_examples']
            })
        
        return subsidies
    
    def get_subsidy_by_id(self, subsidy_id: str) -> Optional[Dict[str, Any]]:
        """指定IDの補助金詳細を取得"""
        master_data = self._load_master_data()
        subsidy_info = master_data.get('subsidies', {}).get(subsidy_id)
        
        if not subsidy_info:
            return None
        
        return {
            'id': subsidy_id,
            'name': subsidy_info['name'],
            'description': subsidy_info['description'],
            'application_period': subsidy_info['application_period'],
            'support_amount': subsidy_info['application_info']['support_amount'],
            'requirements': subsidy_info['application_info']['requirements'],
            'application_flow': subsidy_info['application_info']['application_flow'],
            'expense_examples': subsidy_info['application_info']['expense_examples']
        }
    
    def get_subsidy_metadata(self, subsidy_id: str) -> Optional[Dict[str, Any]]:
        """指定IDの補助金メタデータを取得"""
        master_data = self._load_master_data()
        subsidy_info = master_data.get('subsidies', {}).get(subsidy_id)
        
        if not subsidy_info:
            return None
        
        return {
            'id': subsidy_id,
            'name': subsidy_info['name'],
            'application_period': subsidy_info['application_period']
        }
    
    def get_version_history(self) -> Dict[str, Any]:
        """バージョン履歴情報を取得（既存API互換）"""
        master_data = self._load_master_data()
        
        version_history = {
            'metadata': master_data.get('metadata', {}),
            'subsidies': {},
            'update_policy': {
                'check_frequency': '不定期（制度変更時・ユーザー要望時）',
                'priority_subsidies': [],
                'notification_required': True,
                'backup_before_update': True,
                'update_trigger': '公募要領更新・制度変更・ユーザーフィードバック'
            }
        }
        
        # 優先順位リスト生成
        priority_list = sorted(
            master_data.get('subsidies', {}).keys(),
            key=lambda x: master_data['subsidies'][x]['system_info']['priority_level']
        )[:3]
        
        version_history['update_policy']['priority_subsidies'] = priority_list
        
        # 各補助金のバージョン情報
        for subsidy_id, subsidy_info in master_data.get('subsidies', {}).items():
            version_history['subsidies'][subsidy_id] = {
                'version': subsidy_info['version'],
                'last_updated': subsidy_info['last_updated'],
                'source_references': subsidy_info['source_references'],
                'change_history': subsidy_info['change_history']
            }
        
        return version_history
    
    def get_subsidy_version_history(self, subsidy_id: str) -> Optional[Dict[str, Any]]:
        """指定IDの補助金バージョン履歴を取得"""
        master_data = self._load_master_data()
        subsidy_info = master_data.get('subsidies', {}).get(subsidy_id)
        
        if not subsidy_info:
            return None
        
        return {
            'subsidy_id': subsidy_id,
            'subsidy_name': subsidy_info['name'],
            'version': subsidy_info['version'],
            'last_updated': subsidy_info['last_updated'],
            'source_references': subsidy_info['source_references'],
            'change_history': subsidy_info['change_history']
        }
    
    def search_subsidies(self, query: str) -> List[Dict[str, Any]]:
        """補助金検索"""
        master_data = self._load_master_data()
        results = []
        
        query_lower = query.lower()
        
        for subsidy_id, subsidy_info in master_data.get('subsidies', {}).items():
            # 名前、説明で検索
            searchable_text = f"{subsidy_info['name']} {subsidy_info['description']}".lower()
            
            if query_lower in searchable_text:
                results.append({
                    'id': subsidy_id,
                    'name': subsidy_info['name'],
                    'description': subsidy_info['description'],
                    'application_period': subsidy_info['application_period']
                })
        
        return results
    
    def get_active_subsidies(self) -> List[Dict[str, Any]]:
        """アクティブな補助金のみ取得"""
        master_data = self._load_master_data()
        active_subsidies = []
        
        for subsidy_id, subsidy_info in master_data.get('subsidies', {}).items():
            if subsidy_info.get('status') == 'active' and subsidy_info['system_info']['is_active']:
                active_subsidies.append({
                    'id': subsidy_id,
                    'name': subsidy_info['name'],
                    'description': subsidy_info['description'],
                    'application_period': subsidy_info['application_period'],
                    'last_updated': subsidy_info['last_updated']
                })
        
        return active_subsidies
    
    def get_system_status(self) -> Dict[str, Any]:
        """システム状態取得"""
        master_data = self._load_master_data()
        metadata = master_data.get('metadata', {})
        
        total_subsidies = len(master_data.get('subsidies', {}))
        active_subsidies = len([
            s for s in master_data.get('subsidies', {}).values()
            if s.get('status') == 'active' and s['system_info']['is_active']
        ])
        
        return {
            'system_version': metadata.get('version', 'unknown'),
            'last_updated': metadata.get('last_updated', 'unknown'),
            'maintainer': metadata.get('maintainer', 'unknown'),
            'total_subsidies': total_subsidies,
            'active_subsidies': active_subsidies,
            'data_source': 'subsidy_master.yaml (Single Source of Truth)',
            'cache_status': 'enabled' if self._cache is not None else 'disabled'
        }
    
    def update_subsidy(self, subsidy_id: str, updates: Dict[str, Any]) -> bool:
        """補助金情報更新（マスターデータ更新）"""
        master_data = self._load_master_data(force_reload=True)
        
        if subsidy_id not in master_data.get('subsidies', {}):
            return False
        
        subsidy_info = master_data['subsidies'][subsidy_id]
        
        # 更新可能フィールド
        updatable_fields = [
            'name', 'description', 'application_period', 
            'support_amount', 'requirements', 'application_flow', 
            'expense_examples', 'source_references'
        ]
        
        # 変更履歴エントリ準備
        changes = []
        
        for field in updatable_fields:
            if field in updates:
                old_value = subsidy_info.get(field)
                new_value = updates[field]
                
                if old_value != new_value:
                    if field in ['support_amount', 'requirements', 'application_flow', 'expense_examples']:
                        subsidy_info['application_info'][field] = new_value
                    else:
                        subsidy_info[field] = new_value
                    
                    changes.append(f"{field}更新")
        
        if changes:
            # バージョンアップ
            current_version = subsidy_info['version']
            version_parts = current_version.split('.')
            if len(version_parts) >= 3:
                version_parts[2] = str(int(version_parts[2]) + 1)
                new_version = '.'.join(version_parts)
            else:
                new_version = '1.0.1'
            
            subsidy_info['version'] = new_version
            subsidy_info['last_updated'] = datetime.now().strftime('%Y-%m-%d')
            subsidy_info['system_info']['updated_at'] = datetime.now().strftime('%Y-%m-%d')
            
            # 変更履歴追加
            change_entry = {
                'version': new_version,
                'date': datetime.now().strftime('%Y-%m-%d'),
                'changes': ', '.join(changes),
                'author': 'api_update',
                'reference_updated': 'source_references' in updates
            }
            
            subsidy_info['change_history'].insert(0, change_entry)
            
            # マスターデータ保存
            try:
                with open(self.master_db_path, 'w', encoding='utf-8') as f:
                    yaml.dump(master_data, f, default_flow_style=False, allow_unicode=True, sort_keys=False)
                
                # キャッシュクリア
                self._cache = None
                return True
                
            except Exception:
                return False
        
        return True

# FastAPI統合用のヘルパー関数
def create_unified_api_routes(app):
    """FastAPIアプリに統合APIルートを追加"""
    api = UnifiedSubsidyAPI()
    
    @app.get("/unified/subsidies")
    async def get_all_subsidies_unified():
        return api.get_all_subsidies()
    
    @app.get("/unified/subsidies/{subsidy_id}")
    async def get_subsidy_unified(subsidy_id: str):
        subsidy = api.get_subsidy_by_id(subsidy_id)
        if not subsidy:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Subsidy not found")
        return subsidy
    
    @app.get("/unified/subsidies/{subsidy_id}/metadata")
    async def get_subsidy_metadata_unified(subsidy_id: str):
        metadata = api.get_subsidy_metadata(subsidy_id)
        if not metadata:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Subsidy not found")
        return metadata
    
    @app.get("/unified/version-history")
    async def get_version_history_unified():
        return api.get_version_history()
    
    @app.get("/unified/subsidies/{subsidy_id}/version-history")
    async def get_subsidy_version_history_unified(subsidy_id: str):
        history = api.get_subsidy_version_history(subsidy_id)
        if not history:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Subsidy not found")
        return history
    
    @app.get("/unified/system/status")
    async def get_system_status_unified():
        return api.get_system_status()
    
    @app.get("/unified/subsidies/search/{query}")
    async def search_subsidies_unified(query: str):
        return api.search_subsidies(query)
    
    @app.get("/unified/subsidies/active")
    async def get_active_subsidies_unified():
        return api.get_active_subsidies()

def main():
    """テスト実行"""
    api = UnifiedSubsidyAPI()
    
    print("🔍 統合補助金API テスト実行")
    print("=" * 50)
    
    # システム状態確認
    status = api.get_system_status()
    print(f"📊 システム状態:")
    print(f"  バージョン: {status['system_version']}")
    print(f"  最終更新: {status['last_updated']}")
    print(f"  総補助金数: {status['total_subsidies']}")
    print(f"  アクティブ: {status['active_subsidies']}")
    print(f"  データソース: {status['data_source']}")
    
    # 全補助金取得
    all_subsidies = api.get_all_subsidies()
    print(f"\n📋 登録補助金一覧 ({len(all_subsidies)}件):")
    for subsidy in all_subsidies:
        print(f"  - {subsidy['id']}: {subsidy['name']}")
    
    # 特定補助金詳細
    test_id = 'gotech_rd_support'
    subsidy_detail = api.get_subsidy_by_id(test_id)
    if subsidy_detail:
        print(f"\n📄 {test_id} 詳細:")
        print(f"  名前: {subsidy_detail['name']}")
        print(f"  説明: {subsidy_detail['description'] or '未設定'}")
    
    # バージョン履歴
    version_history = api.get_version_history()
    print(f"\n📚 バージョン履歴:")
    print(f"  システムバージョン: {version_history['metadata'].get('version', '未設定')}")
    print(f"  管理補助金数: {len(version_history['subsidies'])}")
    
    print("\n✅ 統合補助金APIテスト完了")

if __name__ == "__main__":
    main()