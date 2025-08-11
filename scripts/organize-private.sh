#!/bin/bash

# Private Files Organization Script
# プライベートファイルを自動的に整理します

echo "🗂️ プライベートファイル整理スクリプト"
echo "======================================="

# ディレクトリ作成（存在しない場合）
mkdir -p private/{research/{subsidy_docs,competitor_analysis,market_research,technical_research,meeting_notes},drafts/{feature_designs,api_specs,ui_mockups,presentations},temp/{exports,downloads,screenshots,test_data},docs/{development_log,decisions,lessons_learned,future_plans}}

echo "📁 ディレクトリ構造を確認中..."
tree private/ 2>/dev/null || ls -la private/

# 現在のディレクトリから該当ファイルを検索・移動
echo ""
echo "🔍 整理対象ファイルを検索中..."

# RTFファイル
if find . -maxdepth 1 -name "*.rtf" -type f | head -1 | grep -q .; then
    echo "📄 RTFファイルを移動中..."
    find . -maxdepth 1 -name "*.rtf" -type f -exec mv {} private/research/subsidy_docs/ \;
fi

# YAMLファイル（設定以外）
if find . -maxdepth 1 -name "shinseider_*.yaml" -type f | head -1 | grep -q .; then
    echo "⚙️ 開発用YAMLファイルを移動中..."  
    find . -maxdepth 1 -name "shinseider_*.yaml" -type f -exec mv {} private/drafts/feature_designs/ \;
fi

# 一時ファイル
if find . -maxdepth 1 \( -name "*.tmp" -o -name "*.temp" -o -name "*.bak" \) -type f | head -1 | grep -q .; then
    echo "🗑️ 一時ファイルを移動中..."
    find . -maxdepth 1 \( -name "*.tmp" -o -name "*.temp" -o -name "*.bak" \) -type f -exec mv {} private/temp/exports/ \;
fi

# ドラフトファイル
if find . -maxdepth 1 -name "DRAFT_*" -type f | head -1 | grep -q .; then
    echo "📝 下書きファイルを移動中..."
    find . -maxdepth 1 -name "DRAFT_*" -type f -exec mv {} private/drafts/ \;
fi

echo ""
echo "✅ 整理完了！"
echo "📊 整理後の状況:"
echo "   - Research files: $(find private/research -type f | wc -l | tr -d ' ') files"
echo "   - Draft files: $(find private/drafts -type f | wc -l | tr -d ' ') files"  
echo "   - Temp files: $(find private/temp -type f | wc -l | tr -d ' ') files"
echo "   - Documentation: $(find private/docs -type f | wc -l | tr -d ' ') files"

echo ""
echo "🎯 ヒント: 以下のコマンドで内容を確認できます："
echo "   ls -la private/research/subsidy_docs/  # 補助金資料"
echo "   ls -la private/drafts/                 # 下書きファイル"
echo "   ls -la private/temp/                   # 一時ファイル"