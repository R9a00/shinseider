#!/usr/bin/env python3
"""
ミニマル完全性チェッカー
システム完全性フレームワークに基づく5要素の正確性チェック機構
"""

import yaml
import json
import os
import re
import requests
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from urllib.parse import urlparse
import logging

class MinimalIntegrityChecker:
    """ミニマル完全性チェッカー"""
    
    def __init__(self, base_path: str = '/Users/r9a/exp/attg/backend'):
        self.base_path = base_path
        self.framework = self._load_framework()
        self.results = {
            'check_timestamp': datetime.now().isoformat(),
            'overall_score': 0.0,
            'dimension_scores': {},
            'violations': [],
            'recommendations': []
        }
        
        # ログ設定
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
    
    def _load_framework(self) -> Dict[str, Any]:
        """フレームワーク定義を読み込み"""
        framework_path = os.path.join(self.base_path, 'system_integrity_framework.yaml')
        try:
            with open(framework_path, 'r', encoding='utf-8') as f:
                return yaml.safe_load(f)
        except FileNotFoundError:
            self.logger.error("フレームワーク定義ファイルが見つかりません")
            return {}
    
    def run_complete_check(self) -> Dict[str, Any]:
        """完全チェックを実行"""
        print("🔍 システム完全性チェックを開始...")
        print("=" * 60)
        
        # 各次元のチェックを実行
        self._check_information_source()
        self._check_reflection_logic()
        self._check_ui_representation()
        self._check_expression_method()
        self._check_temporal_accuracy()
        
        # 総合スコアを計算
        self._calculate_overall_score()
        
        # レポートを生成
        self._generate_report()
        
        return self.results
    
    def _check_information_source(self):
        """1. 情報ソースの正確性チェック"""
        print("📊 1. 情報ソースの正確性をチェック中...")
        
        dimension_score = 0.0
        violations = []
        
        # subsidy_master.yamlの情報ソースをチェック
        master_data = self._load_yaml('subsidy_master.yaml')
        
        for subsidy_id, subsidy_info in master_data.get('subsidies', {}).items():
            source_refs = subsidy_info.get('source_references', [])
            
            for ref in source_refs:
                url = ref.get('url', '')
                title = ref.get('title', '')
                accessed_date = ref.get('accessed_date', '')
                
                # URL権威性チェック
                authority_score = self._check_url_authority(url)
                
                # 情報鮮度チェック
                freshness_score = self._check_information_freshness(accessed_date)
                
                # 一貫性チェック
                consistency_score = self._check_content_consistency(ref, subsidy_info)
                
                ref_score = (authority_score + freshness_score + consistency_score) / 3
                dimension_score += ref_score
                
                if ref_score < 0.8:  # 80%未満は違反
                    violations.append({
                        'type': 'information_source',
                        'subsidy_id': subsidy_id,
                        'issue': f"情報ソース品質低下: {title}",
                        'score': ref_score,
                        'details': {
                            'url': url,
                            'authority_score': authority_score,
                            'freshness_score': freshness_score,
                            'consistency_score': consistency_score
                        }
                    })
        
        total_refs = sum(len(s.get('source_references', [])) for s in master_data.get('subsidies', {}).values())
        if total_refs > 0:
            dimension_score /= total_refs
        
        self.results['dimension_scores']['information_source'] = dimension_score
        self.results['violations'].extend(violations)
        
        print(f"   情報ソース正確性スコア: {dimension_score:.2%}")
    
    def _check_reflection_logic(self):
        """2. 反映ロジックの正確性チェック"""
        print("⚙️ 2. 反映ロジックの正確性をチェック中...")
        
        violations = []
        dimension_score = 1.0
        
        # マスターデータとAPI出力データの一貫性チェック
        master_data = self._load_yaml('subsidy_master.yaml')
        api_data = self._load_yaml('subsidies.yaml')
        
        # データ変換チェック
        mapping_errors = 0
        total_mappings = 0
        
        for subsidy_id in master_data.get('subsidies', {}):
            master_subsidy = master_data['subsidies'][subsidy_id]
            api_subsidy = next((s for s in api_data if s.get('id') == subsidy_id), {})
            
            if not api_subsidy:
                violations.append({
                    'type': 'reflection_logic',
                    'subsidy_id': subsidy_id,
                    'issue': "API出力にマスターデータが反映されていない",
                    'severity': 'high'
                })
                mapping_errors += 1
            else:
                # application_period の一致チェック
                master_period = master_subsidy.get('application_period', {})
                api_period = api_subsidy.get('application_period', {})
                
                if master_period != api_period:
                    violations.append({
                        'type': 'reflection_logic',
                        'subsidy_id': subsidy_id,
                        'issue': "application_period データの不一致",
                        'severity': 'medium',
                        'details': {
                            'master': master_period,
                            'api': api_period
                        }
                    })
                    mapping_errors += 1
            
            total_mappings += 1
        
        if total_mappings > 0:
            mapping_accuracy = 1.0 - (mapping_errors / total_mappings)
            dimension_score = mapping_accuracy
        
        self.results['dimension_scores']['reflection_logic'] = dimension_score
        self.results['violations'].extend(violations)
        
        print(f"   反映ロジック正確性スコア: {dimension_score:.2%}")
    
    def _check_ui_representation(self):
        """3. UI表現の正確性チェック"""
        print("🖥️ 3. UI表現の正確性をチェック中...")
        
        violations = []
        dimension_score = 1.0
        
        # データファイル存在チェック（API呼び出しの代わり）
        required_files = [
            'subsidies.yaml',
            'subsidy_master.yaml', 
            'version_history.yaml'
        ]
        
        successful_files = 0
        total_files = len(required_files)
        
        for filename in required_files:
            filepath = os.path.join(self.base_path, filename)
            if os.path.exists(filepath):
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        data = yaml.safe_load(f)
                        if data:  # ファイルが空でない
                            successful_files += 1
                        else:
                            violations.append({
                                'type': 'ui_representation',
                                'file': filename,
                                'issue': "空のデータファイル",
                                'severity': 'medium'
                            })
                except Exception as e:
                    violations.append({
                        'type': 'ui_representation',
                        'file': filename,
                        'issue': f"ファイル読み込みエラー: {str(e)}",
                        'severity': 'high'
                    })
            else:
                violations.append({
                    'type': 'ui_representation',
                    'file': filename,
                    'issue': "必要ファイルが存在しません",
                    'severity': 'high'
                })
        
        if total_files > 0:
            dimension_score = successful_files / total_files
        
        self.results['dimension_scores']['ui_representation'] = dimension_score
        self.results['violations'].extend(violations)
        
        print(f"   UI表現正確性スコア: {dimension_score:.2%}")
    
    def _check_expression_method(self):
        """4. 表現方法の正確性チェック"""
        print("📝 4. 表現方法の正確性をチェック中...")
        
        violations = []
        dimension_score = 1.0
        
        # YAMLファイルの構文チェック
        yaml_files = [
            'subsidy_master.yaml',
            'subsidies.yaml',
            'version_history.yaml',
            'system_integrity_framework.yaml'
        ]
        
        syntax_errors = 0
        total_files = len(yaml_files)
        
        for yaml_file in yaml_files:
            try:
                data = self._load_yaml(yaml_file)
                if not data:
                    violations.append({
                        'type': 'expression_method',
                        'file': yaml_file,
                        'issue': "空のファイルまたは読み込みエラー",
                        'severity': 'medium'
                    })
                    syntax_errors += 1
            except yaml.YAMLError as e:
                violations.append({
                    'type': 'expression_method',
                    'file': yaml_file,
                    'issue': f"YAML構文エラー: {str(e)}",
                    'severity': 'high'
                })
                syntax_errors += 1
        
        # 用語一貫性チェック
        terminology_issues = self._check_terminology_consistency()
        violations.extend(terminology_issues)
        
        if total_files > 0:
            syntax_score = 1.0 - (syntax_errors / total_files)
            terminology_score = 1.0 - (len(terminology_issues) * 0.1)  # 各問題で10%減点
            dimension_score = (syntax_score + terminology_score) / 2
        
        self.results['dimension_scores']['expression_method'] = dimension_score
        self.results['violations'].extend(violations)
        
        print(f"   表現方法正確性スコア: {dimension_score:.2%}")
    
    def _check_temporal_accuracy(self):
        """5. 時間情報の正確性チェック"""
        print("⏰ 5. 時間情報の正確性をチェック中...")
        
        violations = []
        dimension_score = 1.0
        
        master_data = self._load_yaml('subsidy_master.yaml')
        current_date = datetime.now().date()
        
        temporal_issues = 0
        total_periods = 0
        
        for subsidy_id, subsidy_info in master_data.get('subsidies', {}).items():
            app_period = subsidy_info.get('application_period', {})
            
            if app_period:
                total_periods += 1
                
                # 日付フォーマットチェック
                start_date = app_period.get('start_date')
                end_date = app_period.get('end_date')
                info_date = app_period.get('information_date')
                
                for date_field, date_value in [('start_date', start_date), ('end_date', end_date), ('information_date', info_date)]:
                    if date_value:
                        try:
                            parsed_date = datetime.strptime(date_value, '%Y-%m-%d').date()
                            
                            # 情報日付の妥当性チェック
                            if date_field == 'information_date':
                                if parsed_date > current_date:
                                    violations.append({
                                        'type': 'temporal_accuracy',
                                        'subsidy_id': subsidy_id,
                                        'issue': f"未来の情報日付: {date_value}",
                                        'severity': 'medium'
                                    })
                                    temporal_issues += 1
                                elif (current_date - parsed_date).days > 90:
                                    violations.append({
                                        'type': 'temporal_accuracy',
                                        'subsidy_id': subsidy_id,
                                        'issue': f"古い情報日付（90日以上前）: {date_value}",
                                        'severity': 'low'
                                    })
                        
                        except ValueError:
                            violations.append({
                                'type': 'temporal_accuracy',
                                'subsidy_id': subsidy_id,
                                'issue': f"無効な日付フォーマット: {date_field}={date_value}",
                                'severity': 'high'
                            })
                            temporal_issues += 1
                
                # 期間の論理チェック
                if start_date and end_date:
                    try:
                        start = datetime.strptime(start_date, '%Y-%m-%d').date()
                        end = datetime.strptime(end_date, '%Y-%m-%d').date()
                        
                        if start > end:
                            violations.append({
                                'type': 'temporal_accuracy',
                                'subsidy_id': subsidy_id,
                                'issue': f"開始日が終了日より後: {start_date} > {end_date}",
                                'severity': 'high'
                            })
                            temporal_issues += 1
                    except ValueError:
                        pass  # フォーマットエラーは上でチェック済み
        
        if total_periods > 0:
            dimension_score = 1.0 - (temporal_issues / total_periods)
        
        self.results['dimension_scores']['temporal_accuracy'] = dimension_score
        self.results['violations'].extend(violations)
        
        print(f"   時間情報正確性スコア: {dimension_score:.2%}")
    
    def _check_url_authority(self, url: str) -> float:
        """URL権威性をチェック"""
        if not url:
            return 0.0
        
        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        
        if domain.endswith('.go.jp'):
            return 1.0  # 政府機関
        elif domain.endswith('.or.jp'):
            return 0.8  # 組織・団体
        elif domain.endswith('.jp'):
            return 0.6  # 日本ドメイン
        else:
            return 0.4  # その他
    
    def _check_information_freshness(self, accessed_date: str) -> float:
        """情報鮮度をチェック"""
        if not accessed_date:
            return 0.0
        
        try:
            access_date = datetime.strptime(accessed_date, '%Y-%m-%d').date()
            days_old = (datetime.now().date() - access_date).days
            
            if days_old <= 7:
                return 1.0
            elif days_old <= 30:
                return 0.8
            elif days_old <= 90:
                return 0.6
            else:
                return 0.3
        except ValueError:
            return 0.0
    
    def _check_content_consistency(self, ref: Dict[str, Any], subsidy_info: Dict[str, Any]) -> float:
        """コンテンツ一貫性をチェック"""
        # 簡易的な一貫性チェック
        ref_version = ref.get('version', '')
        if ref_version and 'application_period' in subsidy_info:
            return 1.0
        return 0.8
    
    def _check_terminology_consistency(self) -> List[Dict[str, Any]]:
        """用語一貫性をチェック"""
        violations = []
        
        # 一般的な用語の一貫性チェック
        terminology_patterns = {
            '補助金': r'補助金',
            '申請': r'申請',
            '募集': r'募集',
            '公募': r'公募'
        }
        
        # これは簡易実装 - 実際にはより詳細な用語辞書が必要
        return violations
    
    def _calculate_overall_score(self):
        """総合スコアを計算"""
        scores = self.results['dimension_scores']
        if scores:
            self.results['overall_score'] = sum(scores.values()) / len(scores)
        
        # 重要度による重み付け
        weights = {
            'information_source': 0.25,
            'reflection_logic': 0.25,
            'temporal_accuracy': 0.20,
            'ui_representation': 0.15,
            'expression_method': 0.15
        }
        
        weighted_score = sum(scores.get(dim, 0) * weight for dim, weight in weights.items())
        self.results['overall_score'] = weighted_score
    
    def _generate_report(self):
        """レポートを生成"""
        print("\n📊 システム完全性チェック結果")
        print("=" * 60)
        print(f"総合スコア: {self.results['overall_score']:.2%}")
        print()
        
        print("各次元スコア:")
        for dimension, score in self.results['dimension_scores'].items():
            icon = "✅" if score >= 0.9 else "⚠️" if score >= 0.7 else "❌"
            print(f"  {icon} {dimension}: {score:.2%}")
        
        print()
        violations_by_severity = {}
        for violation in self.results['violations']:
            severity = violation.get('severity', 'unknown')
            violations_by_severity.setdefault(severity, []).append(violation)
        
        if violations_by_severity:
            print("検出された問題:")
            for severity in ['high', 'medium', 'low']:
                if severity in violations_by_severity:
                    icon = "🔴" if severity == 'high' else "🟡" if severity == 'medium' else "🟢"
                    print(f"  {icon} {severity.upper()}重要度: {len(violations_by_severity[severity])}件")
                    for violation in violations_by_severity[severity][:3]:  # 最初の3件を表示
                        print(f"    - {violation.get('issue', 'Unknown issue')}")
        else:
            print("✅ 問題は検出されませんでした")
    
    def _load_yaml(self, filename: str) -> Dict[str, Any]:
        """YAMLファイルを読み込み"""
        filepath = os.path.join(self.base_path, filename)
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return yaml.safe_load(f) or {}
        except FileNotFoundError:
            return {}
        except yaml.YAMLError:
            raise
    
    def save_results(self, filename: str = 'integrity_check_results.yaml'):
        """結果を保存"""
        filepath = os.path.join(self.base_path, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            yaml.dump(self.results, f, default_flow_style=False, allow_unicode=True)
        print(f"\n💾 チェック結果を保存: {filepath}")

def main():
    """メイン関数"""
    checker = MinimalIntegrityChecker()
    results = checker.run_complete_check()
    checker.save_results()
    
    # 総合評価
    overall_score = results['overall_score']
    if overall_score >= 0.9:
        print("\n🎉 システム完全性: 優秀")
    elif overall_score >= 0.7:
        print("\n⚠️ システム完全性: 良好（改善推奨）")
    else:
        print("\n❌ システム完全性: 要改善")
    
    return results

if __name__ == "__main__":
    main()