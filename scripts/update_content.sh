#!/bin/bash

# 自動コンテンツ更新シェルスクリプト
# Claude Codeを使用してdata_inputディレクトリの内容を処理

set -e  # エラー時に終了

# スクリプトのディレクトリを取得
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🔄 シンセイダー自動コンテンツ更新"
echo "📂 プロジェクトルート: $PROJECT_ROOT"

# data_inputディレクトリの存在確認
if [ ! -d "$PROJECT_ROOT/data_input" ]; then
    echo "❌ data_inputディレクトリが見つかりません"
    exit 1
fi

cd "$PROJECT_ROOT"

# 処理対象ファイルの数を確認
NEWS_COUNT=$(find data_input/news -name "*.txt" -o -name "*.md" 2>/dev/null | wc -l || echo 0)
SUBSIDY_COUNT=$(find data_input/subsidies -name "*.txt" -o -name "*.md" 2>/dev/null | wc -l || echo 0)
KNOWLEDGE_COUNT=$(find data_input/knowledge_base -name "*.txt" -o -name "*.md" 2>/dev/null | wc -l || echo 0)
RAW_COUNT=$(find data_input/raw_data -name "*.txt" -o -name "*.md" 2>/dev/null | wc -l || echo 0)

TOTAL_COUNT=$((NEWS_COUNT + SUBSIDY_COUNT + KNOWLEDGE_COUNT + RAW_COUNT))

echo "📊 処理対象ファイル:"
echo "   📰 ニュース: ${NEWS_COUNT}件"
echo "   💰 補助金: ${SUBSIDY_COUNT}件"
echo "   📚 基礎知識: ${KNOWLEDGE_COUNT}件"
echo "   🔍 生データ: ${RAW_COUNT}件"
echo "   📁 合計: ${TOTAL_COUNT}件"

if [ $TOTAL_COUNT -eq 0 ]; then
    echo "ℹ️  処理対象のファイルがありません"
    exit 0
fi

# 確認プロンプト
read -p "これらのファイルを処理しますか？ (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 処理を中止しました"
    exit 0
fi

echo "🚀 処理を開始します..."

# ニュースファイルの処理
if [ $NEWS_COUNT -gt 0 ]; then
    echo "📰 ニュースファイルを処理中..."
    for file in data_input/news/*.txt data_input/news/*.md; do
        if [ -f "$file" ]; then
            echo "  🔍 処理中: $(basename "$file")"
            if claude code "\"$file\" の内容を prompts/content_review_template.md のプロンプトで精査し、適切なYAMLを生成して backend/news_content.yaml に追加してください。既存記事との重複チェックも行ってください"; then
                # 処理済みファイルをアーカイブ
                mkdir -p data_input/news/processed
                mv "$file" "data_input/news/processed/"
                echo "    ✅ 処理完了: $(basename "$file")"
            else
                echo "    ❌ 処理失敗: $(basename "$file")"
            fi
        fi
    done
fi

# 補助金ファイルの処理
if [ $SUBSIDY_COUNT -gt 0 ]; then
    echo "💰 補助金ファイルを処理中..."
    for file in data_input/subsidies/*.txt data_input/subsidies/*.md; do
        if [ -f "$file" ]; then
            echo "  🔍 処理中: $(basename "$file")"
            if claude code "\"$file\" の内容を精査し、backend/subsidies.yaml の該当セクションを更新してください。変更がある場合はversion_history.yamlにも記録してください"; then
                mkdir -p data_input/subsidies/processed
                mv "$file" "data_input/subsidies/processed/"
                echo "    ✅ 処理完了: $(basename "$file")"
            else
                echo "    ❌ 処理失敗: $(basename "$file")"
            fi
        fi
    done
fi

# 基礎知識ファイルの処理
if [ $KNOWLEDGE_COUNT -gt 0 ]; then
    echo "📚 基礎知識ファイルを処理中..."
    for file in data_input/knowledge_base/*.txt data_input/knowledge_base/*.md; do
        if [ -f "$file" ]; then
            echo "  🔍 処理中: $(basename "$file")"
            if claude code "\"$file\" の内容を backend/knowledge_base.yaml に統合してください。適切なカテゴリーに分類し、既存コンテンツとの重複をチェックしてください"; then
                mkdir -p data_input/knowledge_base/processed
                mv "$file" "data_input/knowledge_base/processed/"
                echo "    ✅ 処理完了: $(basename "$file")"
            else
                echo "    ❌ 処理失敗: $(basename "$file")"
            fi
        fi
    done
fi

# 生データファイルの処理
if [ $RAW_COUNT -gt 0 ]; then
    echo "🔍 生データファイルを処理中..."
    for file in data_input/raw_data/*.txt data_input/raw_data/*.md; do
        if [ -f "$file" ]; then
            echo "  🔍 処理中: $(basename "$file")"
            if claude code "\"$file\" の内容を分析し、ニュース、補助金情報、基礎知識のいずれに該当するかを判断して、適切なYAMLファイルに追加してください。判断基準も併せて記録してください"; then
                mkdir -p data_input/raw_data/processed
                mv "$file" "data_input/raw_data/processed/"
                echo "    ✅ 処理完了: $(basename "$file")"
            else
                echo "    ❌ 処理失敗: $(basename "$file")"
            fi
        fi
    done
fi

echo ""
echo "✅ 自動更新処理が完了しました！"
echo ""
echo "🔧 次の手順をお勧めします："
echo "   1. 品質チェックの実行:"
echo "      claude code \"backend/ の全YAMLファイルの品質をチェックし、問題があれば修正してください\""
echo ""
echo "   2. 変更内容の確認:"
echo "      git status"
echo "      git diff"
echo ""
echo "   3. テスト実行:"
echo "      # フロントエンド（別ターミナル）"
echo "      cd frontend/client && npm start"
echo "      # バックエンド（別ターミナル）"
echo "      cd backend && python3 main.py"
echo ""
echo "🎉 更新作業お疲れさまでした！"