#!/usr/bin/env python3
"""
包括的調査結果処理・変更履歴管理システム
申請要件・項目・手続きの変更を追跡し、公開用の変更履歴を生成
"""

import yaml
import json
import os
from datetime import datetime
from typing import Dict, List, Any, Optional
import difflib

class ComprehensiveUpdateProcessor:
    """包括的更新処理クラス"""
    
    def __init__(self, base_path: str = '/Users/r9a/exp/attg/backend'):
        self.base_path = base_path
        self.master_db_path = os.path.join(base_path, 'subsidy_master.yaml')
        self.change_log_path = os.path.join(base_path, 'public_change_history.yaml')
        self.detailed_log_path = os.path.join(base_path, 'detailed_investigation_log.yaml')
        
    def load_yaml(self, filepath: str) -> Dict[str, Any]:
        """YAMLファイルを読み込み"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return yaml.safe_load(f) or {}
        except FileNotFoundError:
            return {}
    
    def save_yaml(self, filepath: str, data: Dict[str, Any]):
        """YAMLファイルを保存"""
        with open(filepath, 'w', encoding='utf-8') as f:
            yaml.dump(data, f, default_flow_style=False, allow_unicode=True, sort_keys=False)
    
    def detect_changes(self, previous_data: Dict[str, Any], current_data: Dict[str, Any], subsidy_id: str) -> Dict[str, Any]:
        """変更を検出・分析"""
        changes = {
            'has_changes': False,
            'change_categories': [],
            'detailed_changes': {},
            'impact_level': 'none'  # none, low, medium, high, critical
        }
        
        # 募集期間の変更
        if self._compare_application_period(previous_data, current_data):
            changes['has_changes'] = True
            changes['change_categories'].append('application_period')
            changes['detailed_changes']['application_period'] = self._get_period_changes(previous_data, current_data)
        
        # 申請要件の変更
        if current_data.get('requirement_changes', {}).get('eligibility', {}).get('changes_detected'):
            changes['has_changes'] = True
            changes['change_categories'].append('eligibility_requirements')
            changes['detailed_changes']['eligibility'] = current_data['requirement_changes']['eligibility']
        
        # 対象経費の変更
        if current_data.get('requirement_changes', {}).get('eligible_expenses', {}).get('changes_detected'):
            changes['has_changes'] = True
            changes['change_categories'].append('eligible_expenses')
            changes['detailed_changes']['expenses'] = current_data['requirement_changes']['eligible_expenses']
        
        # 補助率・上限額の変更
        if current_data.get('requirement_changes', {}).get('subsidy_amount', {}).get('changes_detected'):
            changes['has_changes'] = True
            changes['change_categories'].append('subsidy_amount')
            changes['detailed_changes']['amount'] = current_data['requirement_changes']['subsidy_amount']
            changes['impact_level'] = 'high'  # 金額変更は重要
        
        # 申請手続きの変更
        if current_data.get('procedure_changes', {}).get('application_method', {}).get('changes_detected'):
            changes['has_changes'] = True
            changes['change_categories'].append('application_procedure')
            changes['detailed_changes']['procedure'] = current_data['procedure_changes']
        
        # 必須書類の変更
        if current_data.get('procedure_changes', {}).get('required_documents', {}).get('changes_detected'):
            changes['has_changes'] = True
            changes['change_categories'].append('required_documents')
            changes['detailed_changes']['documents'] = current_data['procedure_changes']['required_documents']
        
        # 影響レベルの判定
        if not changes['has_changes']:
            changes['impact_level'] = 'none'
        elif 'subsidy_amount' in changes['change_categories'] or 'eligibility_requirements' in changes['change_categories']:
            changes['impact_level'] = 'high'
        elif 'application_procedure' in changes['change_categories'] or 'required_documents' in changes['change_categories']:
            changes['impact_level'] = 'medium'
        else:
            changes['impact_level'] = 'low'
        
        return changes
    
    def _compare_application_period(self, previous: Dict[str, Any], current: Dict[str, Any]) -> bool:
        """募集期間の変更を比較"""
        prev_period = previous.get('application_period', {})
        curr_period = current.get('application_period', {})
        
        key_fields = ['current_round', 'start_date', 'end_date', 'notes']
        for field in key_fields:
            if prev_period.get(field) != curr_period.get(field):
                return True
        return False
    
    def _get_period_changes(self, previous: Dict[str, Any], current: Dict[str, Any]) -> Dict[str, Any]:
        """募集期間の変更詳細を取得"""
        prev_period = previous.get('application_period', {})
        curr_period = current.get('application_period', {})
        
        return {
            'previous': prev_period,
            'current': curr_period,
            'changed_fields': [
                field for field in ['current_round', 'start_date', 'end_date', 'notes']
                if prev_period.get(field) != curr_period.get(field)
            ]
        }
    
    def process_comprehensive_update(self, research_file: str) -> Dict[str, Any]:
        """包括的調査結果を処理"""
        print("🔍 包括的調査結果の処理を開始...")
        
        # 調査結果を読み込み
        research_data = self.load_yaml(research_file)
        
        # 既存のマスターデータを読み込み
        master_data = self.load_yaml(self.master_db_path)
        
        # 詳細な調査ログを読み込み（過去の調査履歴）
        investigation_log = self.load_yaml(self.detailed_log_path)
        
        # 公開用変更履歴を読み込み
        public_log = self.load_yaml(self.change_log_path)
        
        processing_results = {
            'processed_subsidies': 0,
            'total_changes_detected': 0,
            'high_impact_changes': 0,
            'updated_subsidies': [],
            'change_summary': {}
        }
        
        current_date = datetime.now().strftime('%Y-%m-%d')
        
        # 各補助金を処理
        for subsidy_id, research_info in research_data.get('comprehensive_update', {}).items():
            print(f"📋 処理中: {research_info.get('name', subsidy_id)}")
            
            # 既存データを取得
            existing_data = master_data.get('subsidies', {}).get(subsidy_id, {})
            
            # 変更を検出
            changes = self.detect_changes(existing_data, research_info, subsidy_id)
            
            if changes['has_changes']:
                processing_results['total_changes_detected'] += 1
                processing_results['updated_subsidies'].append(subsidy_id)
                
                if changes['impact_level'] == 'high':
                    processing_results['high_impact_changes'] += 1
                
                # マスターデータを更新
                self._update_master_data(master_data, subsidy_id, research_info, changes)
                
                # 詳細調査ログを更新
                self._update_investigation_log(investigation_log, subsidy_id, research_info, changes, current_date)
                
                # 公開用変更履歴を更新
                self._update_public_log(public_log, subsidy_id, research_info, changes, current_date)
                
                processing_results['change_summary'][subsidy_id] = {
                    'impact_level': changes['impact_level'],
                    'categories': changes['change_categories'],
                    'name': research_info.get('name', subsidy_id)
                }
            
            processing_results['processed_subsidies'] += 1
        
        # 更新されたデータを保存
        if processing_results['total_changes_detected'] > 0:
            self.save_yaml(self.master_db_path, master_data)
            self.save_yaml(self.detailed_log_path, investigation_log)
            self.save_yaml(self.change_log_path, public_log)
            
            print(f"✅ 更新完了: {processing_results['total_changes_detected']}件の変更を検出")
            print(f"🔴 高影響度変更: {processing_results['high_impact_changes']}件")
        else:
            print("📋 変更は検出されませんでした")
        
        return processing_results
    
    def _update_master_data(self, master_data: Dict[str, Any], subsidy_id: str, research_info: Dict[str, Any], changes: Dict[str, Any]):
        """マスターデータを更新"""
        if subsidy_id not in master_data.get('subsidies', {}):
            master_data.setdefault('subsidies', {})[subsidy_id] = {}
        
        subsidy_data = master_data['subsidies'][subsidy_id]
        
        # 募集期間を更新
        if 'application_period' in research_info:
            subsidy_data['application_period'] = research_info['application_period']
        
        # 参照元情報を更新
        if 'source_references' in research_info:
            subsidy_data['source_references'] = research_info['source_references']
        
        # バージョンを更新
        current_version = subsidy_data.get('version', '1.0.0')
        version_parts = current_version.split('.')
        if changes['impact_level'] in ['high', 'critical']:
            # メジャーバージョンアップ
            version_parts[1] = str(int(version_parts[1]) + 1)
            version_parts[2] = '0'
        else:
            # マイナーバージョンアップ
            version_parts[2] = str(int(version_parts[2]) + 1)
        
        new_version = '.'.join(version_parts)
        subsidy_data['version'] = new_version
        subsidy_data['last_updated'] = datetime.now().strftime('%Y-%m-%d')
        
        # 変更履歴に追加
        change_entry = {
            'version': new_version,
            'date': datetime.now().strftime('%Y-%m-%d'),
            'changes': f"包括的調査による更新: {', '.join(changes['change_categories'])}",
            'author': 'comprehensive_research_system',
            'reference_updated': True,
            'impact_level': changes['impact_level'],
            'change_categories': changes['change_categories']
        }
        
        subsidy_data.setdefault('change_history', []).insert(0, change_entry)
    
    def _update_investigation_log(self, log_data: Dict[str, Any], subsidy_id: str, research_info: Dict[str, Any], changes: Dict[str, Any], date: str):
        """詳細調査ログを更新"""
        log_data.setdefault('investigations', []).append({
            'date': date,
            'subsidy_id': subsidy_id,
            'subsidy_name': research_info.get('name', subsidy_id),
            'investigation_type': 'comprehensive',
            'changes_detected': changes['has_changes'],
            'impact_level': changes['impact_level'],
            'change_categories': changes['change_categories'],
            'detailed_changes': changes['detailed_changes'],
            'source_references': research_info.get('source_references', []),
            'reliability_score': research_info.get('reliability_score', 'unknown'),
            'raw_research_data': research_info
        })
    
    def _update_public_log(self, public_log: Dict[str, Any], subsidy_id: str, research_info: Dict[str, Any], changes: Dict[str, Any], date: str):
        """公開用変更履歴を更新"""
        public_log.setdefault('change_history', []).append({
            'date': date,
            'subsidy_name': research_info.get('name', subsidy_id),
            'impact_level': changes['impact_level'],
            'change_summary': self._generate_public_summary(changes),
            'source_references': [
                {
                    'url': ref.get('url', ''),
                    'title': ref.get('title', ''),
                    'accessed_date': ref.get('accessed_date', date)
                }
                for ref in research_info.get('source_references', [])
            ],
            'next_check_recommended': self._calculate_next_check_date(changes['impact_level'])
        })
    
    def _generate_public_summary(self, changes: Dict[str, Any]) -> str:
        """公開用の変更概要を生成"""
        if not changes['has_changes']:
            return "変更なし"
        
        categories = changes['change_categories']
        summaries = []
        
        if 'application_period' in categories:
            summaries.append("募集期間")
        if 'eligibility_requirements' in categories:
            summaries.append("申請要件")
        if 'eligible_expenses' in categories:
            summaries.append("対象経費")
        if 'subsidy_amount' in categories:
            summaries.append("補助率・上限額")
        if 'application_procedure' in categories:
            summaries.append("申請手続き")
        if 'required_documents' in categories:
            summaries.append("必要書類")
        
        return f"{', '.join(summaries)}の変更"
    
    def _calculate_next_check_date(self, impact_level: str) -> str:
        """次回チェック推奨日を計算"""
        from datetime import timedelta
        
        days_mapping = {
            'critical': 7,   # 1週間後
            'high': 14,      # 2週間後
            'medium': 30,    # 1か月後
            'low': 60,       # 2か月後
            'none': 90       # 3か月後
        }
        
        days = days_mapping.get(impact_level, 30)
        next_date = datetime.now() + timedelta(days=days)
        return next_date.strftime('%Y-%m-%d')
    
    def generate_public_report(self) -> str:
        """公開用レポートを生成"""
        public_log = self.load_yaml(self.change_log_path)
        
        # 最新の変更履歴を取得（最近30日）
        recent_changes = []
        cutoff_date = datetime.now() - timedelta(days=30)
        
        for change in public_log.get('change_history', []):
            change_date = datetime.strptime(change['date'], '%Y-%m-%d')
            if change_date >= cutoff_date:
                recent_changes.append(change)
        
        # レポート生成
        report = f"""# 補助金情報更新レポート

## 最近の変更履歴（過去30日）

"""
        
        if not recent_changes:
            report += "変更はありません。\n"
        else:
            for change in sorted(recent_changes, key=lambda x: x['date'], reverse=True):
                impact_icon = {
                    'critical': '🔴',
                    'high': '🟠', 
                    'medium': '🟡',
                    'low': '🟢',
                    'none': '⚪'
                }.get(change['impact_level'], '❓')
                
                report += f"""### {change['date']} - {change['subsidy_name']} {impact_icon}

**変更内容**: {change['change_summary']}

**参照元**:
"""
                for ref in change['source_references']:
                    report += f"- [{ref['title']}]({ref['url']}) (確認日: {ref['accessed_date']})\n"
                
                report += f"**次回チェック推奨**: {change['next_check_recommended']}\n\n"
        
        return report

def main():
    """メイン関数"""
    import sys
    
    if len(sys.argv) < 2:
        print("使用方法: python3 comprehensive_update_processor.py <調査結果YAMLファイル>")
        sys.exit(1)
    
    research_file = sys.argv[1]
    processor = ComprehensiveUpdateProcessor()
    
    # 包括的調査結果を処理
    results = processor.process_comprehensive_update(research_file)
    
    # 結果を表示
    print("\n📊 処理結果:")
    print(f"  処理した補助金: {results['processed_subsidies']}件")
    print(f"  変更検出: {results['total_changes_detected']}件")
    print(f"  高影響度変更: {results['high_impact_changes']}件")
    
    if results['change_summary']:
        print("\n🔄 変更された補助金:")
        for subsidy_id, info in results['change_summary'].items():
            impact_icon = {'high': '🔴', 'medium': '🟡', 'low': '🟢'}.get(info['impact_level'], '❓')
            print(f"  {impact_icon} {info['name']}: {', '.join(info['categories'])}")
    
    # 公開用レポートを生成
    report = processor.generate_public_report()
    report_path = '/Users/r9a/exp/attg/backend/public_update_report.md'
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"\n📝 公開用レポートを生成: {report_path}")

if __name__ == "__main__":
    main()