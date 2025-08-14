#!/usr/bin/env python3
"""
バージョン自動管理システム
version_management_rules.md に基づいてバージョンを自動計算・更新
"""

import yaml
import re
from datetime import datetime
from typing import Dict, List, Tuple, Any
import logging

class VersionAutoManager:
    """バージョン自動管理システム"""
    
    def __init__(self, base_path: str = '/Users/r9a/exp/attg/backend'):
        self.base_path = base_path
        self.logger = logging.getLogger(__name__)
        
        # キーワードベースの変更タイプ判定
        self.major_keywords = [
            '制度廃止', '要件変更', 'API変更', '非互換', '破壊的変更',
            '削除', '廃止', 'スキーマ変更', '認証変更'
        ]
        
        self.minor_keywords = [
            '新機能', '新項目', 'システム追加', '大幅改善', '新補助金',
            '診断機能', 'UI改善', '機能追加', '新機能実装', 'システム統合'
        ]
        
        # 以下はPATCH扱い（デフォルト）
    
    def determine_change_type(self, changes_description: str) -> str:
        """変更内容からバージョン変更タイプを判定"""
        changes_lower = changes_description.lower()
        
        # MAJOR判定
        for keyword in self.major_keywords:
            if keyword in changes_lower:
                return 'MAJOR'
        
        # MINOR判定
        for keyword in self.minor_keywords:
            if keyword in changes_lower:
                return 'MINOR'
        
        # デフォルトはPATCH
        return 'PATCH'
    
    def calculate_new_version(self, current_version: str, change_type: str) -> str:
        """現在のバージョンと変更タイプから新しいバージョンを計算"""
        try:
            major, minor, patch = map(int, current_version.split('.'))
        except ValueError:
            # 無効なバージョン形式の場合は1.0.0から開始
            major, minor, patch = 1, 0, 0
        
        if change_type == 'MAJOR':
            return f"{major + 1}.0.0"
        elif change_type == 'MINOR':
            return f"{major}.{minor + 1}.0"
        elif change_type == 'PATCH':
            return f"{major}.{minor}.{patch + 1}"
        else:
            # 不明な場合はPATCH扱い
            return f"{major}.{minor}.{patch + 1}"
    
    def is_reference_update(self, changes_description: str) -> bool:
        """参照元情報の更新が含まれているかを判定"""
        reference_keywords = [
            '参照', '調査', '最新情報', '公式サイト', '公募要領',
            '情報更新', '鮮度', 'URL更新', '資料更新', '情報確認'
        ]
        
        changes_lower = changes_description.lower()
        return any(keyword in changes_lower for keyword in reference_keywords)
    
    def add_change_entry(
        self, 
        subsidy_id: str, 
        changes_description: str, 
        author: str = 'claude_auto_update',
        date: str = None
    ) -> Dict[str, Any]:
        """変更履歴エントリを追加し、バージョンを自動更新"""
        
        if date is None:
            date = datetime.now().strftime('%Y-%m-%d')
        
        # バージョン履歴を読み込み
        version_file = f"{self.base_path}/version_history.yaml"
        with open(version_file, 'r', encoding='utf-8') as f:
            data = yaml.safe_load(f)
        
        if subsidy_id not in data.get('subsidies', {}):
            raise ValueError(f"補助金ID '{subsidy_id}' が見つかりません")
        
        subsidy_info = data['subsidies'][subsidy_id]
        current_version = subsidy_info.get('version', '1.0.0')
        
        # 変更タイプを自動判定
        change_type = self.determine_change_type(changes_description)
        new_version = self.calculate_new_version(current_version, change_type)
        
        # 参照更新フラグを自動判定
        reference_updated = self.is_reference_update(changes_description)
        
        # 新しい変更履歴エントリを作成
        new_entry = {
            'version': new_version,
            'date': date,
            'author': author,
            'changes': changes_description,
            'reference_updated': reference_updated
        }
        
        # 変更履歴の先頭に追加
        change_history = subsidy_info.get('change_history', [])
        change_history.insert(0, new_entry)
        
        # 補助金情報を更新
        subsidy_info['change_history'] = change_history
        subsidy_info['version'] = new_version
        subsidy_info['last_updated'] = date
        
        # 参照日も更新（参照更新の場合）
        if reference_updated:
            for ref in subsidy_info.get('source_references', []):
                ref['accessed_date'] = date
        
        # ファイルに保存
        with open(version_file, 'w', encoding='utf-8') as f:
            yaml.dump(data, f, default_flow_style=False, allow_unicode=True)
        
        self.logger.info(f"バージョン更新: {subsidy_id} {current_version} → {new_version} ({change_type})")
        
        return {
            'subsidy_id': subsidy_id,
            'old_version': current_version,
            'new_version': new_version,
            'change_type': change_type,
            'reference_updated': reference_updated,
            'entry': new_entry
        }
    
    def update_system_version(
        self, 
        changes_description: str, 
        author: str = 'claude_auto_update',
        date: str = None
    ) -> Dict[str, Any]:
        """システム全体のバージョンを更新"""
        
        if date is None:
            date = datetime.now().strftime('%Y-%m-%d')
        
        # バージョン履歴を読み込み
        version_file = f"{self.base_path}/version_history.yaml"
        with open(version_file, 'r', encoding='utf-8') as f:
            data = yaml.safe_load(f)
        
        current_version = data.get('metadata', {}).get('version', '1.0.0')
        
        # 変更タイプを自動判定
        change_type = self.determine_change_type(changes_description)
        new_version = self.calculate_new_version(current_version, change_type)
        
        # メタデータを更新
        data['metadata']['version'] = new_version
        data['metadata']['last_updated'] = date
        
        # マスターファイルも同期更新
        master_file = f"{self.base_path}/subsidy_master.yaml"
        with open(master_file, 'r', encoding='utf-8') as f:
            master_data = yaml.safe_load(f)
        
        master_data['metadata']['version'] = new_version
        master_data['metadata']['last_updated'] = date
        
        # ファイルに保存
        with open(version_file, 'w', encoding='utf-8') as f:
            yaml.dump(data, f, default_flow_style=False, allow_unicode=True)
        
        with open(master_file, 'w', encoding='utf-8') as f:
            yaml.dump(master_data, f, default_flow_style=False, allow_unicode=True)
        
        self.logger.info(f"システムバージョン更新: {current_version} → {new_version} ({change_type})")
        
        return {
            'old_version': current_version,
            'new_version': new_version,
            'change_type': change_type,
            'description': changes_description
        }
    
    def bulk_update_all_subsidies(
        self, 
        changes_description: str, 
        author: str = 'claude_auto_update',
        date: str = None
    ) -> List[Dict[str, Any]]:
        """全補助金のバージョンを一括更新"""
        
        if date is None:
            date = datetime.now().strftime('%Y-%m-%d')
        
        version_file = f"{self.base_path}/version_history.yaml"
        with open(version_file, 'r', encoding='utf-8') as f:
            data = yaml.safe_load(f)
        
        results = []
        
        for subsidy_id in data.get('subsidies', {}):
            try:
                result = self.add_change_entry(subsidy_id, changes_description, author, date)
                results.append(result)
            except Exception as e:
                self.logger.error(f"補助金 {subsidy_id} の更新に失敗: {str(e)}")
                results.append({
                    'subsidy_id': subsidy_id,
                    'error': str(e)
                })
        
        return results

def main():
    """テスト用のメイン関数"""
    manager = VersionAutoManager()
    
    # テスト: 個別補助金の更新
    print("=== 個別補助金更新テスト ===")
    result = manager.add_change_entry(
        'atotsugi', 
        '情報鮮度向上のための参照日更新',
        'claude_auto_update'
    )
    print(f"結果: {result}")
    
    # テスト: システム全体の更新
    print("\\n=== システム全体更新テスト ===")
    system_result = manager.update_system_version(
        'バージョン管理システムの実装・自動化機能追加',
        'claude_auto_update'
    )
    print(f"結果: {system_result}")

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    main()