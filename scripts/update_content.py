#!/usr/bin/env python3
"""
自動コンテンツ更新スクリプト
data_input ディレクトリの内容を精査し、適切なYAMLファイルに反映
"""

import os
import sys
import subprocess
import glob
from pathlib import Path

def main():
    """メインの更新処理"""
    print("🔄 自動コンテンツ更新を開始します...")
    
    # プロジェクトルートディレクトリを取得
    project_root = Path(__file__).parent.parent
    data_input_dir = project_root / "data_input"
    
    if not data_input_dir.exists():
        print("❌ data_input ディレクトリが見つかりません")
        return 1
    
    # 処理対象ファイルを検索
    news_files = list((data_input_dir / "news").glob("*.txt")) + list((data_input_dir / "news").glob("*.md"))
    subsidy_files = list((data_input_dir / "subsidies").glob("*.txt")) + list((data_input_dir / "subsidies").glob("*.md"))
    knowledge_files = list((data_input_dir / "knowledge_base").glob("*.txt")) + list((data_input_dir / "knowledge_base").glob("*.md"))
    raw_files = list((data_input_dir / "raw_data").glob("*.txt")) + list((data_input_dir / "raw_data").glob("*.md"))
    
    total_files = len(news_files) + len(subsidy_files) + len(knowledge_files) + len(raw_files)
    
    if total_files == 0:
        print("ℹ️  処理対象のファイルが見つかりませんでした")
        return 0
    
    print(f"📁 処理対象ファイル: {total_files}件")
    
    # ニュースファイルの処理
    if news_files:
        print(f"📰 ニュースファイル {len(news_files)}件を処理中...")
        for news_file in news_files:
            process_news_file(news_file, project_root)
    
    # 補助金ファイルの処理
    if subsidy_files:
        print(f"💰 補助金ファイル {len(subsidy_files)}件を処理中...")
        for subsidy_file in subsidy_files:
            process_subsidy_file(subsidy_file, project_root)
    
    # 基礎知識ファイルの処理
    if knowledge_files:
        print(f"📚 基礎知識ファイル {len(knowledge_files)}件を処理中...")
        for knowledge_file in knowledge_files:
            process_knowledge_file(knowledge_file, project_root)
    
    # 生データファイルの処理
    if raw_files:
        print(f"🔍 生データファイル {len(raw_files)}件を処理中...")
        for raw_file in raw_files:
            process_raw_file(raw_file, project_root)
    
    print("✅ 自動更新が完了しました")
    print("🔧 Claude Codeで品質チェックを実行することをお勧めします：")
    print("   claude code \"backend/ の全YAMLファイルの品質をチェックし、問題があれば修正してください\"")
    
    return 0

def process_news_file(file_path, project_root):
    """ニュースファイルを処理"""
    command = [
        'claude', 'code',
        f'"{file_path}" の内容を prompts/content_review_template.md のプロンプトで精査し、'
        f'適切なYAMLを生成して backend/news_content.yaml に追加してください。'
        f'既存記事との重複チェックも行ってください'
    ]
    
    try:
        result = subprocess.run(command, cwd=project_root, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"  ✅ {file_path.name} を処理しました")
            # 処理済みファイルをアーカイブ
            archive_file(file_path)
        else:
            print(f"  ❌ {file_path.name} の処理でエラーが発生しました")
    except Exception as e:
        print(f"  ❌ {file_path.name} の処理中にエラー: {e}")

def process_subsidy_file(file_path, project_root):
    """補助金ファイルを処理"""
    command = [
        'claude', 'code',
        f'"{file_path}" の内容を精査し、backend/subsidies.yaml の該当セクションを更新してください。'
        f'変更がある場合はversion_history.yamlにも記録してください'
    ]
    
    try:
        result = subprocess.run(command, cwd=project_root, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"  ✅ {file_path.name} を処理しました")
            archive_file(file_path)
        else:
            print(f"  ❌ {file_path.name} の処理でエラーが発生しました")
    except Exception as e:
        print(f"  ❌ {file_path.name} の処理中にエラー: {e}")

def process_knowledge_file(file_path, project_root):
    """基礎知識ファイルを処理"""
    command = [
        'claude', 'code',
        f'"{file_path}" の内容を backend/knowledge_base.yaml に統合してください。'
        f'適切なカテゴリーに分類し、既存コンテンツとの重複をチェックしてください'
    ]
    
    try:
        result = subprocess.run(command, cwd=project_root, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"  ✅ {file_path.name} を処理しました")
            archive_file(file_path)
        else:
            print(f"  ❌ {file_path.name} の処理でエラーが発生しました")
    except Exception as e:
        print(f"  ❌ {file_path.name} の処理中にエラー: {e}")

def process_raw_file(file_path, project_root):
    """生データファイルを処理"""
    command = [
        'claude', 'code',
        f'"{file_path}" の内容を分析し、ニュース、補助金情報、基礎知識のいずれに該当するかを判断して、'
        f'適切なYAMLファイルに追加してください。判断基準も併せて記録してください'
    ]
    
    try:
        result = subprocess.run(command, cwd=project_root, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"  ✅ {file_path.name} を処理しました")
            archive_file(file_path)
        else:
            print(f"  ❌ {file_path.name} の処理でエラーが発生しました")
    except Exception as e:
        print(f"  ❌ {file_path.name} の処理中にエラー: {e}")

def archive_file(file_path):
    """処理済みファイルをアーカイブ"""
    archive_dir = file_path.parent / "processed"
    archive_dir.mkdir(exist_ok=True)
    
    archived_path = archive_dir / file_path.name
    try:
        file_path.rename(archived_path)
        print(f"    📦 {file_path.name} をアーカイブしました")
    except Exception as e:
        print(f"    ⚠️  {file_path.name} のアーカイブに失敗: {e}")

if __name__ == "__main__":
    sys.exit(main())