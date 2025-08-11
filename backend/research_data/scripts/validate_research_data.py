#!/usr/bin/env python3
"""
調査データの検証スクリプト
使用方法: python validate_research_data.py [調査ファイルパス]
"""

import yaml
import sys
import os
from datetime import datetime
import requests
from urllib.parse import urlparse

def validate_yaml_structure(data):
    """YAML構造の基本検証"""
    errors = []
    warnings = []
    
    # 必須フィールドのチェック
    required_fields = ['investigation', 'findings', 'metadata']
    for field in required_fields:
        if field not in data:
            errors.append(f"必須フィールドが見つかりません: {field}")
    
    # investigation セクションの検証
    if 'investigation' in data:
        inv = data['investigation']
        required_inv_fields = ['date', 'investigator', 'type', 'scope']
        for field in required_inv_fields:
            if field not in inv:
                errors.append(f"investigation.{field} が見つかりません")
        
        # 日付形式の検証
        if 'date' in inv:
            try:
                datetime.strptime(inv['date'], '%Y-%m-%d')
            except ValueError:
                errors.append(f"日付形式が正しくありません: {inv['date']} (YYYY-MM-DD形式で入力してください)")
    
    return errors, warnings

def validate_urls(data):
    """URL の有効性検証"""
    warnings = []
    
    if 'findings' in data:
        for subsidy_id, findings in data['findings'].items():
            # last_verified_url のチェック
            if 'last_verified_url' in findings and findings['last_verified_url']:
                url = findings['last_verified_url']
                if not is_valid_url(url):
                    warnings.append(f"{subsidy_id}: 無効なURL形式 - {url}")
                elif not check_url_accessibility(url):
                    warnings.append(f"{subsidy_id}: アクセスできないURL - {url}")
            
            # new_information 内のURLチェック
            if 'new_information' in findings:
                for info in findings['new_information']:
                    if info.get('field') in ['official_url', 'guideline_url'] and 'new_value' in info:
                        url = info['new_value']
                        if not is_valid_url(url):
                            warnings.append(f"{subsidy_id}: 新しいURLが無効 - {url}")
    
    return warnings

def is_valid_url(url):
    """URL形式の基本チェック"""
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except:
        return False

def check_url_accessibility(url):
    """URL のアクセス可能性チェック（簡易版）"""
    try:
        response = requests.head(url, timeout=10, allow_redirects=True)
        return response.status_code < 400
    except:
        return False

def validate_confidence_levels(data):
    """信頼度レベルの検証"""
    warnings = []
    valid_confidence = ['high', 'medium', 'low']
    
    if 'findings' in data:
        for subsidy_id, findings in data['findings'].items():
            if 'new_information' in findings:
                for info in findings['new_information']:
                    if 'confidence' in info:
                        if info['confidence'] not in valid_confidence:
                            warnings.append(f"{subsidy_id}: 無効な信頼度レベル - {info['confidence']}")
    
    return warnings

def main():
    if len(sys.argv) != 2:
        print("使用方法: python validate_research_data.py [調査ファイルパス]")
        sys.exit(1)
    
    file_path = sys.argv[1]
    
    if not os.path.exists(file_path):
        print(f"ファイルが見つかりません: {file_path}")
        sys.exit(1)
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = yaml.safe_load(f)
    except Exception as e:
        print(f"YAMLファイルの読み込みエラー: {e}")
        sys.exit(1)
    
    print(f"調査データの検証中: {file_path}")
    print("=" * 50)
    
    # 構造検証
    errors, warnings = validate_yaml_structure(data)
    
    # URL検証
    url_warnings = validate_urls(data)
    warnings.extend(url_warnings)
    
    # 信頼度レベル検証
    confidence_warnings = validate_confidence_levels(data)
    warnings.extend(confidence_warnings)
    
    # 結果表示
    if errors:
        print("❌ エラー:")
        for error in errors:
            print(f"  - {error}")
    
    if warnings:
        print("⚠️  警告:")
        for warning in warnings:
            print(f"  - {warning}")
    
    if not errors and not warnings:
        print("✅ 検証完了: 問題は見つかりませんでした")
    elif not errors:
        print("✅ 基本構造: 正常")
        print("⚠️  警告事項を確認してください")
    else:
        print("❌ 検証失敗: エラーを修正してください")
        sys.exit(1)

if __name__ == "__main__":
    main()