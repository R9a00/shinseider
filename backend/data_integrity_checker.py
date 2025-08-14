#!/usr/bin/env python3
"""
データ整合性チェッカー
Single Source of Truth (subsidy_master.yaml) との整合性を継続的に監視
"""

import yaml
import os
import json
from datetime import datetime
from typing import Dict, List, Any, Tuple

class DataIntegrityChecker:
    """データ整合性チェック・修復ツール"""
    
    def __init__(self, base_path: str = '/Users/r9a/exp/attg/backend'):
        self.base_path = base_path
        self.master_db_path = os.path.join(base_path, 'subsidy_master.yaml')
        self.subsidies_path = os.path.join(base_path, 'subsidies.yaml')
        self.version_history_path = os.path.join(base_path, 'version_history.yaml')
        
    def load_all_data_sources(self) -> Dict[str, Any]:
        """全データソースを読み込み"""
        data = {}
        
        # マスターデータベース
        try:
            with open(self.master_db_path, 'r', encoding='utf-8') as f:
                data['master'] = yaml.safe_load(f)
        except Exception as e:
            data['master'] = None
            data['master_error'] = str(e)
        
        # subsidies.yaml
        try:
            with open(self.subsidies_path, 'r', encoding='utf-8') as f:
                subsidies_raw = yaml.safe_load(f)
                # リスト形式をID辞書形式に変換
                if isinstance(subsidies_raw, list):
                    data['subsidies'] = {s.get('id'): s for s in subsidies_raw if s.get('id')}
                else:
                    data['subsidies'] = subsidies_raw
        except Exception as e:
            data['subsidies'] = None
            data['subsidies_error'] = str(e)
        
        # version_history.yaml
        try:
            with open(self.version_history_path, 'r', encoding='utf-8') as f:
                data['version_history'] = yaml.safe_load(f)
        except Exception as e:
            data['version_history'] = None
            data['version_history_error'] = str(e)
        
        return data
    
    def check_data_consistency(self) -> Dict[str, Any]:
        """データ整合性をチェック"""
        data = self.load_all_data_sources()
        
        consistency_report = {
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'overall_status': 'healthy',
            'issues': [],
            'warnings': [],
            'statistics': {}
        }
        
        # データソース存在確認
        if not data.get('master'):
            consistency_report['issues'].append({
                'severity': 'critical',
                'type': 'missing_master_database',
                'message': 'subsidy_master.yaml が存在しないか読み込み失敗',
                'details': data.get('master_error', 'Unknown error')
            })
            consistency_report['overall_status'] = 'critical'
        
        if not data.get('subsidies'):
            consistency_report['issues'].append({
                'severity': 'high',
                'type': 'missing_subsidies_data',
                'message': 'subsidies.yaml が存在しないか読み込み失敗',
                'details': data.get('subsidies_error', 'Unknown error')
            })
            if consistency_report['overall_status'] != 'critical':
                consistency_report['overall_status'] = 'error'
        
        if not data.get('version_history'):
            consistency_report['issues'].append({
                'severity': 'high',
                'type': 'missing_version_history',
                'message': 'version_history.yaml が存在しないか読み込み失敗',
                'details': data.get('version_history_error', 'Unknown error')
            })
            if consistency_report['overall_status'] not in ['critical', 'error']:
                consistency_report['overall_status'] = 'error'
        
        # データが存在する場合の整合性チェック
        if data.get('master') and data.get('subsidies'):
            self._check_subsidies_consistency(data, consistency_report)
        
        if data.get('master') and data.get('version_history'):
            self._check_version_history_consistency(data, consistency_report)
        
        # 統計情報
        if data.get('master'):
            master_subsidies = len(data['master'].get('subsidies', {}))
            consistency_report['statistics']['master_subsidies_count'] = master_subsidies
        
        if data.get('subsidies'):
            subsidies_count = len(data['subsidies'])
            consistency_report['statistics']['subsidies_yaml_count'] = subsidies_count
        
        if data.get('version_history'):
            version_subsidies = len(data['version_history'].get('subsidies', {}))
            consistency_report['statistics']['version_history_count'] = version_subsidies
        
        # 全体ステータス決定
        if consistency_report['issues']:
            critical_issues = [i for i in consistency_report['issues'] if i['severity'] == 'critical']
            high_issues = [i for i in consistency_report['issues'] if i['severity'] == 'high']
            
            if critical_issues:
                consistency_report['overall_status'] = 'critical'
            elif high_issues:
                consistency_report['overall_status'] = 'error'
            else:
                consistency_report['overall_status'] = 'warning'
        elif consistency_report['warnings']:
            consistency_report['overall_status'] = 'warning'
        
        return consistency_report
    
    def _check_subsidies_consistency(self, data: Dict[str, Any], report: Dict[str, Any]):
        """subsidies.yamlとマスターDBの整合性チェック"""
        master_subsidies = data['master'].get('subsidies', {})
        subsidies_data = data['subsidies']
        
        # 補助金ID一致チェック
        master_ids = set(master_subsidies.keys())
        subsidies_ids = set(subsidies_data.keys())
        
        missing_in_subsidies = master_ids - subsidies_ids
        missing_in_master = subsidies_ids - master_ids
        
        if missing_in_subsidies:
            report['issues'].append({
                'severity': 'high',
                'type': 'missing_subsidies_in_yaml',
                'message': f'subsidies.yamlに不足している補助金: {list(missing_in_subsidies)}',
                'details': 'マスターDBには存在するがsubsidies.yamlにない補助金があります'
            })
        
        if missing_in_master:
            report['warnings'].append({
                'severity': 'medium',
                'type': 'extra_subsidies_in_yaml',
                'message': f'subsidies.yamlに余分な補助金: {list(missing_in_master)}',
                'details': 'subsidies.yamlにあるがマスターDBにない補助金があります'
            })
        
        # 共通補助金の詳細チェック
        common_ids = master_ids & subsidies_ids
        for subsidy_id in common_ids:
            master_info = master_subsidies[subsidy_id]
            subsidies_info = subsidies_data[subsidy_id]
            
            # 名前一致チェック
            master_name = master_info.get('name', '')
            subsidies_name = subsidies_info.get('name', '')
            
            if master_name != subsidies_name:
                report['warnings'].append({
                    'severity': 'medium',
                    'type': 'name_mismatch',
                    'message': f'{subsidy_id}: 名前不一致',
                    'details': f'Master: "{master_name}" vs Subsidies: "{subsidies_name}"'
                })
            
            # application_period一致チェック
            master_period = master_info.get('application_period', {})
            subsidies_period = subsidies_info.get('application_period', {})
            
            if master_period != subsidies_period:
                report['warnings'].append({
                    'severity': 'low',
                    'type': 'application_period_mismatch',
                    'message': f'{subsidy_id}: 募集期間情報が不一致',
                    'details': 'マスターDBとsubsidies.yamlで募集期間情報が異なります'
                })
    
    def _check_version_history_consistency(self, data: Dict[str, Any], report: Dict[str, Any]):
        """version_history.yamlとマスターDBの整合性チェック"""
        master_subsidies = data['master'].get('subsidies', {})
        version_history = data['version_history'].get('subsidies', {})
        
        master_ids = set(master_subsidies.keys())
        version_ids = set(version_history.keys())
        
        missing_in_version = master_ids - version_ids
        missing_in_master = version_ids - master_ids
        
        if missing_in_version:
            report['warnings'].append({
                'severity': 'medium',
                'type': 'missing_version_history',
                'message': f'バージョン履歴なし: {list(missing_in_version)}',
                'details': 'マスターDBには存在するがバージョン履歴にない補助金があります'
            })
        
        if missing_in_master:
            report['warnings'].append({
                'severity': 'low',
                'type': 'orphaned_version_history',
                'message': f'孤立したバージョン履歴: {list(missing_in_master)}',
                'details': 'バージョン履歴にあるがマスターDBにない補助金があります'
            })
        
        # バージョン情報一致チェック
        common_ids = master_ids & version_ids
        for subsidy_id in common_ids:
            master_info = master_subsidies[subsidy_id]
            version_info = version_history[subsidy_id]
            
            master_version = master_info.get('version', '')
            version_version = version_info.get('version', '')
            
            if master_version != version_version:
                report['issues'].append({
                    'severity': 'high',
                    'type': 'version_mismatch',
                    'message': f'{subsidy_id}: バージョン番号不一致',
                    'details': f'Master: "{master_version}" vs History: "{version_version}"'
                })
    
    def auto_repair_consistency(self) -> Dict[str, Any]:
        """自動修復実行"""
        repair_report = {
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'repairs_performed': [],
            'failed_repairs': [],
            'backup_created': False
        }
        
        # バックアップ作成
        try:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            
            backup_subsidies = f"{self.subsidies_path}.backup.{timestamp}"
            backup_version = f"{self.version_history_path}.backup.{timestamp}"
            
            if os.path.exists(self.subsidies_path):
                os.rename(self.subsidies_path, backup_subsidies)
            if os.path.exists(self.version_history_path):
                os.rename(self.version_history_path, backup_version)
            
            repair_report['backup_created'] = True
            repair_report['backup_timestamp'] = timestamp
            
        except Exception as e:
            repair_report['failed_repairs'].append({
                'operation': 'create_backup',
                'error': str(e)
            })
            return repair_report
        
        # マスターDBからAPI互換ファイルを再生成
        try:
            from subsidy_manager import SubsidyDatabase
            db = SubsidyDatabase(self.base_path)
            
            # マスターデータ読み込み
            with open(self.master_db_path, 'r', encoding='utf-8') as f:
                master_data = yaml.safe_load(f)
            
            # API互換データ生成
            compatible_data = db.generate_api_compatible_data(master_data)
            
            # subsidies.yaml再生成
            with open(self.subsidies_path, 'w', encoding='utf-8') as f:
                yaml.dump(compatible_data['subsidies_yaml'], f, default_flow_style=False, allow_unicode=True)
            
            repair_report['repairs_performed'].append('subsidies.yaml再生成完了')
            
            # version_history.yaml再生成  
            with open(self.version_history_path, 'w', encoding='utf-8') as f:
                yaml.dump(compatible_data['version_history_yaml'], f, default_flow_style=False, allow_unicode=True)
            
            repair_report['repairs_performed'].append('version_history.yaml再生成完了')
            
        except Exception as e:
            repair_report['failed_repairs'].append({
                'operation': 'regenerate_files',
                'error': str(e)
            })
        
        return repair_report
    
    def generate_integrity_report(self) -> str:
        """整合性レポートの人間可読形式生成"""
        report = self.check_data_consistency()
        
        output = f"""
📊 データ整合性レポート
================================
実行日時: {report['timestamp']}
総合ステータス: {report['overall_status'].upper()}

📈 統計情報:
"""
        
        stats = report.get('statistics', {})
        for key, value in stats.items():
            output += f"  {key}: {value}\n"
        
        if report['issues']:
            output += f"\n🚨 重要な問題 ({len(report['issues'])}件):\n"
            for issue in report['issues']:
                output += f"  [{issue['severity'].upper()}] {issue['message']}\n"
                if issue.get('details'):
                    output += f"    詳細: {issue['details']}\n"
        
        if report['warnings']:
            output += f"\n⚠️ 警告 ({len(report['warnings'])}件):\n"
            for warning in report['warnings']:
                output += f"  [{warning['severity'].upper()}] {warning['message']}\n"
                if warning.get('details'):
                    output += f"    詳細: {warning['details']}\n"
        
        if report['overall_status'] == 'healthy':
            output += "\n✅ データ整合性に問題はありません\n"
        else:
            output += f"\n💡 推奨アクション:\n"
            if report['overall_status'] in ['critical', 'error']:
                output += "  1. auto_repair_consistency() を実行してデータを修復\n"
                output += "  2. 修復後、再度整合性チェックを実行\n"
            else:
                output += "  1. 警告内容を確認し、必要に応じて手動修正\n"
        
        return output

def main():
    """メイン実行"""
    print("🔍 データ整合性チェック開始...")
    
    checker = DataIntegrityChecker()
    
    # 整合性チェック実行
    print(checker.generate_integrity_report())
    
    # 問題がある場合の修復オプション
    report = checker.check_data_consistency()
    if report['overall_status'] in ['critical', 'error']:
        print("\n🔧 データに重要な問題が検出されました")
        response = input("自動修復を実行しますか？ (y/N): ")
        
        if response.lower() == 'y':
            print("🔄 自動修復実行中...")
            repair_result = checker.auto_repair_consistency()
            
            print(f"\n📋 修復結果:")
            if repair_result['backup_created']:
                print(f"  ✅ バックアップ作成: {repair_result.get('backup_timestamp')}")
            
            for repair in repair_result['repairs_performed']:
                print(f"  ✅ {repair}")
            
            for failure in repair_result['failed_repairs']:
                print(f"  ❌ {failure['operation']}: {failure['error']}")
            
            if repair_result['repairs_performed'] and not repair_result['failed_repairs']:
                print("\n🎉 自動修復完了！再度整合性チェックを実行...")
                print(checker.generate_integrity_report())

if __name__ == "__main__":
    main()