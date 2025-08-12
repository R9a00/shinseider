#!/usr/bin/env python3
"""
シンセイダー補助金統合品質検証スクリプト
新規追加された補助金統合の品質を自動チェックする
"""

import os
import sys
import yaml
import json
import requests
from pathlib import Path
from typing import Dict, List, Tuple, Optional
import argparse
from datetime import datetime

class IntegrationValidator:
    def __init__(self, subsidy_id: str, base_path: str = "/Users/r9a/exp/attg"):
        self.subsidy_id = subsidy_id
        self.base_path = Path(base_path)
        self.backend_path = self.base_path / "backend"
        self.frontend_path = self.base_path / "frontend/client/src"
        self.errors = []
        self.warnings = []
        self.info = []
        
    def log_error(self, message: str):
        self.errors.append(f"❌ ERROR: {message}")
        
    def log_warning(self, message: str):
        self.warnings.append(f"⚠️  WARNING: {message}")
        
    def log_info(self, message: str):
        self.info.append(f"✅ INFO: {message}")

    def validate_yaml_structure(self) -> bool:
        """YAML構造の妥当性チェック"""
        yaml_file = self.backend_path / f"{self.subsidy_id}.yaml"
        
        if not yaml_file.exists():
            self.log_error(f"YAML file not found: {yaml_file}")
            return False
            
        try:
            with open(yaml_file, 'r', encoding='utf-8') as f:
                data = yaml.safe_load(f)
                
            # 必須セクションチェック
            required_sections = ['metadata', 'categories', 'content']
            for section in required_sections:
                if section not in data:
                    self.log_error(f"Missing required section: {section}")
                    return False
                    
            # カテゴリ構造チェック
            if 'categories' in data:
                for category_id, category in data['categories'].items():
                    if 'name' not in category:
                        self.log_error(f"Category {category_id} missing 'name'")
                    if 'sections' not in category:
                        self.log_error(f"Category {category_id} missing 'sections'")
                        
            # コンテンツ構造チェック
            if 'content' in data:
                for section_id, section in data['content'].items():
                    # 2階層構造チェック
                    if 'content' in section:
                        if 'simple' not in section['content']:
                            self.log_warning(f"Section {section_id} missing 'simple' content")
                        if 'detailed' not in section['content']:
                            self.log_warning(f"Section {section_id} missing 'detailed' content")
                            
                        # simple構造チェック
                        if 'simple' in section['content']:
                            simple = section['content']['simple']
                            required_simple = ['overview', 'key_points']
                            for req in required_simple:
                                if req not in simple:
                                    self.log_warning(f"Section {section_id} simple missing '{req}'")
                                    
                        # detailed構造チェック
                        if 'detailed' in section['content']:
                            detailed = section['content']['detailed']
                            if 'abstract' not in detailed:
                                self.log_warning(f"Section {section_id} detailed missing 'abstract'")
                            if 'comprehensive_analysis' not in detailed:
                                self.log_warning(f"Section {section_id} detailed missing 'comprehensive_analysis'")
                                
            self.log_info(f"YAML structure validation passed: {yaml_file}")
            return True
            
        except yaml.YAMLError as e:
            self.log_error(f"YAML syntax error: {e}")
            return False
        except Exception as e:
            self.log_error(f"Unexpected error reading YAML: {e}")
            return False

    def validate_backend_api(self, api_base_url: str = "http://localhost:8888") -> bool:
        """バックエンドAPI動作チェック"""
        endpoint = f"{api_base_url}/{self.subsidy_id}-knowledge"
        
        try:
            response = requests.get(endpoint, timeout=10)
            if response.status_code == 200:
                data = response.json()
                
                # レスポンス構造チェック
                if 'categories' not in data:
                    self.log_warning("API response missing 'categories'")
                if 'content' not in data:
                    self.log_warning("API response missing 'content'")
                    
                self.log_info(f"Backend API validation passed: {endpoint}")
                return True
            else:
                self.log_error(f"API returned status {response.status_code}: {endpoint}")
                return False
                
        except requests.exceptions.ConnectionError:
            self.log_warning(f"Backend server not running at {api_base_url}")
            return False
        except requests.exceptions.Timeout:
            self.log_error(f"API request timeout: {endpoint}")
            return False
        except Exception as e:
            self.log_error(f"Unexpected API error: {e}")
            return False

    def validate_frontend_component(self) -> bool:
        """フロントエンドコンポーネント存在チェック"""
        # コンポーネント名を推定
        component_name = ''.join(word.capitalize() for word in self.subsidy_id.split('_')) + 'Guide'
        component_file = self.frontend_path / "components" / f"{component_name}.js"
        
        if not component_file.exists():
            self.log_error(f"Frontend component not found: {component_file}")
            return False
            
        try:
            with open(component_file, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # 基本構造チェック
            required_imports = ['React', 'useState', 'useEffect']
            for imp in required_imports:
                if imp not in content:
                    self.log_warning(f"Component missing import: {imp}")
                    
            # API endpoint参照チェック
            if f"{self.subsidy_id}-knowledge" not in content:
                self.log_warning(f"Component not referencing correct API endpoint")
                
            self.log_info(f"Frontend component validation passed: {component_file}")
            return True
            
        except Exception as e:
            self.log_error(f"Error reading component file: {e}")
            return False

    def validate_content_quality(self) -> bool:
        """コンテンツ品質チェック"""
        yaml_file = self.backend_path / f"{self.subsidy_id}.yaml"
        
        if not yaml_file.exists():
            return False
            
        try:
            with open(yaml_file, 'r', encoding='utf-8') as f:
                data = yaml.safe_load(f)
                
            quality_score = 0
            total_checks = 0
            
            if 'content' in data:
                for section_id, section in data['content'].items():
                    if 'content' in section:
                        # Simple content quality
                        if 'simple' in section['content']:
                            simple = section['content']['simple']
                            total_checks += 4
                            
                            if 'overview' in simple and len(simple['overview']) > 50:
                                quality_score += 1
                            if 'key_points' in simple and simple['key_points']:
                                quality_score += 1
                            if 'quick_takeaway' in simple and len(simple['quick_takeaway']) > 30:
                                quality_score += 1
                            if 'next_steps' in simple and len(simple['next_steps']) > 20:
                                quality_score += 1
                                
                        # Detailed content quality  
                        if 'detailed' in section['content']:
                            detailed = section['content']['detailed']
                            total_checks += 2
                            
                            if 'abstract' in detailed and len(detailed['abstract']) > 100:
                                quality_score += 1
                            if 'comprehensive_analysis' in detailed and detailed['comprehensive_analysis']:
                                quality_score += 1
                                
            if total_checks > 0:
                quality_ratio = quality_score / total_checks
                if quality_ratio >= 0.8:
                    self.log_info(f"Content quality excellent: {quality_ratio:.2%}")
                elif quality_ratio >= 0.6:
                    self.log_info(f"Content quality good: {quality_ratio:.2%}")
                else:
                    self.log_warning(f"Content quality needs improvement: {quality_ratio:.2%}")
                    
                return quality_ratio >= 0.6
            else:
                self.log_warning("No content found for quality assessment")
                return False
                
        except Exception as e:
            self.log_error(f"Error assessing content quality: {e}")
            return False

    def validate_data_consistency(self) -> bool:
        """データ整合性チェック"""
        yaml_file = self.backend_path / f"{self.subsidy_id}.yaml"
        
        if not yaml_file.exists():
            return False
            
        try:
            with open(yaml_file, 'r', encoding='utf-8') as f:
                data = yaml.safe_load(f)
                
            consistency_issues = 0
            
            # カテゴリとコンテンツの整合性
            if 'categories' in data and 'content' in data:
                for category_id, category in data['categories'].items():
                    if 'sections' in category:
                        for section_id in category['sections']:
                            if section_id not in data['content']:
                                self.log_warning(f"Section {section_id} referenced in category but not in content")
                                consistency_issues += 1
                                
                # 逆チェック: contentにあるがcategoryで参照されていない
                referenced_sections = set()
                for category in data['categories'].values():
                    if 'sections' in category:
                        referenced_sections.update(category['sections'])
                        
                for section_id in data['content'].keys():
                    if section_id not in referenced_sections:
                        self.log_info(f"Section {section_id} in content but not referenced in categories")
                        
            if consistency_issues == 0:
                self.log_info("Data consistency validation passed")
                return True
            else:
                self.log_warning(f"Found {consistency_issues} consistency issues")
                return False
                
        except Exception as e:
            self.log_error(f"Error checking data consistency: {e}")
            return False

    def run_full_validation(self, api_base_url: str = "http://localhost:8888") -> Dict[str, bool]:
        """フル検証実行"""
        results = {
            'yaml_structure': self.validate_yaml_structure(),
            'backend_api': self.validate_backend_api(api_base_url),
            'frontend_component': self.validate_frontend_component(),
            'content_quality': self.validate_content_quality(),
            'data_consistency': self.validate_data_consistency()
        }
        
        return results

    def generate_report(self, results: Dict[str, bool]) -> str:
        """検証レポート生成"""
        report = []
        report.append(f"# {self.subsidy_id} 統合品質検証レポート")
        report.append(f"生成日時: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append("")
        
        # サマリー
        passed = sum(results.values())
        total = len(results)
        score = passed / total if total > 0 else 0
        
        report.append("## 📊 総合評価")
        if score >= 0.8:
            report.append(f"🎉 EXCELLENT: {passed}/{total} ({score:.1%})")
        elif score >= 0.6:
            report.append(f"✅ GOOD: {passed}/{total} ({score:.1%})")
        else:
            report.append(f"⚠️  NEEDS IMPROVEMENT: {passed}/{total} ({score:.1%})")
        report.append("")
        
        # 詳細結果
        report.append("## 📋 詳細結果")
        for test_name, passed in results.items():
            status = "✅ PASS" if passed else "❌ FAIL"
            report.append(f"- {test_name}: {status}")
        report.append("")
        
        # エラー・警告・情報
        if self.errors:
            report.append("## ❌ エラー")
            for error in self.errors:
                report.append(f"- {error}")
            report.append("")
            
        if self.warnings:
            report.append("## ⚠️  警告")
            for warning in self.warnings:
                report.append(f"- {warning}")
            report.append("")
            
        if self.info:
            report.append("## ✅ 情報")
            for info in self.info:
                report.append(f"- {info}")
            report.append("")
            
        # 推奨アクション
        report.append("## 🚀 推奨アクション")
        if score >= 0.8:
            report.append("- 統合品質は優秀です。本番環境への展開を検討できます。")
        elif score >= 0.6:
            report.append("- 基本品質は確保されています。警告項目の改善を推奨します。")
        else:
            report.append("- エラーの修正が必要です。再検証前に問題を解決してください。")
            
        return "\\n".join(report)


def main():
    parser = argparse.ArgumentParser(description='シンセイダー補助金統合品質検証')
    parser.add_argument('subsidy_id', help='補助金ID（例: monodukuri_hojo）')
    parser.add_argument('--api-url', default='http://localhost:8888', help='バックエンドAPI URL')
    parser.add_argument('--output', help='レポート出力ファイル（指定なしは標準出力）')
    
    args = parser.parse_args()
    
    # 検証実行
    validator = IntegrationValidator(args.subsidy_id)
    print(f"🔍 {args.subsidy_id} の統合品質検証を開始します...")
    
    results = validator.run_full_validation(args.api_url)
    report = validator.generate_report(results)
    
    # レポート出力
    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            f.write(report)
        print(f"📄 レポートを出力しました: {args.output}")
    else:
        print(report)
        
    # 終了コード
    passed_count = sum(results.values())
    total_count = len(results)
    if passed_count == total_count:
        print("\\n🎉 すべての検証に合格しました！")
        sys.exit(0)
    else:
        print(f"\\n⚠️  {total_count - passed_count}個の問題が検出されました。")
        sys.exit(1)


if __name__ == "__main__":
    main()