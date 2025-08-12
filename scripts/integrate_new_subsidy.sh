#!/bin/bash

# シンセイダー新補助金統合自動化スクリプト
# 使用方法: ./integrate_new_subsidy.sh "補助金名" "公式URL" "管轄官庁"

set -e  # エラーで停止

# 引数チェック
if [ $# -ne 3 ]; then
    echo "使用方法: $0 '補助金名' '公式URL' '管轄官庁'"
    echo "例: $0 'ものづくり補助金' 'https://portal.monodukuri-hojo.jp' '経済産業省'"
    exit 1
fi

SUBSIDY_NAME="$1"
OFFICIAL_URL="$2"
AGENCY="$3"
DATE=$(date +%Y%m%d)
SUBSIDY_ID=$(echo "$SUBSIDY_NAME" | tr '[:upper:]' '[:lower:]' | tr -d ' ' | tr -d '・')

echo "🚀 シンセイダー新補助金統合を開始します"
echo "対象: $SUBSIDY_NAME ($AGENCY)"
echo "ID: $SUBSIDY_ID"
echo "=========================================="

# Step 1: ディレクトリ準備
echo "📁 ディレクトリ準備..."
mkdir -p "data_input/raw_data"
mkdir -p "data_input/knowledge_base"
mkdir -p "private/research/subsidy_docs/research_results"

# Step 2: データ収集プロンプト実行準備
echo "📊 データ収集準備..."
cat > "temp_prompt_${SUBSIDY_ID}.md" << EOF
# ${SUBSIDY_NAME} 専用調査プロンプト

## 基本情報
- 正式名称: ${SUBSIDY_NAME}
- 管轄官庁: ${AGENCY}  
- 公式URL: ${OFFICIAL_URL}
- 調査日: $(date +%Y-%m-%d)

## 指示
prompts/structural_knowledge_collection.md の指示に従い、
${SUBSIDY_NAME}について包括的調査を実施してください。

### 出力先
1. data_input/raw_data/${SUBSIDY_ID}_research_${DATE}.txt
2. data_input/knowledge_base/${SUBSIDY_ID}_structure_${DATE}.txt

### 重点調査項目
1. 制度の創設背景と政策目的
2. 申請要件と審査基準の詳細
3. 予算規模と採択件数の傾向
4. 類似制度との差別化要因
5. 成功事例の構造的特徴

### 必須出力構造
- 2階層構造（simple/detailed）
- 抽象化フレームワーク適用
- 実務活用可能レベルの詳細度
EOF

echo "✅ データ収集プロンプトを準備しました: temp_prompt_${SUBSIDY_ID}.md"

# Step 3: バックエンドYAMLテンプレート生成
echo "🔧 YAMLテンプレート生成..."
cat > "backend/${SUBSIDY_ID}.yaml" << EOF
metadata:
  last_updated: '$(date +%Y-%m-%d)'
  version: 1.0.0
  maintainer: シンセイダー開発チーム
  description: "${SUBSIDY_NAME}に関する体系的知識ベース"
  official_url: "${OFFICIAL_URL}"
  managing_agency: "${AGENCY}"

categories:
  foundation:
    name: "${SUBSIDY_NAME}の基礎"
    description: "制度の基本的な仕組みと理解"
    sections:
      - subsidy_basics
      - funding_sources
      - government_structure
      - policy_objectives

  application:
    name: "申請の実務"
    description: "実際の申請プロセスと成功のポイント"
    sections:
      - application_process
      - required_documents
      - evaluation_criteria
      - common_mistakes

  strategy:
    name: "戦略的活用"
    description: "補助金を事業成長に活かす方法"
    sections:
      - business_planning
      - subsidy_selection
      - timeline_management
      - success_factors

content:
  subsidy_basics:
    title: "${SUBSIDY_NAME}とは何か"
    overview: "制度の基本的な定義と特徴"
    content:
      simple:
        overview: "${SUBSIDY_NAME}の基本的な制度概要を説明します"
        key_points:
          definition:
            title: "${SUBSIDY_NAME}の定義"
            content: "制度の基本的な内容（データ収集後に更新）"
            examples:
              - "具体例1（データ収集後に更新）"
              - "具体例2（データ収集後に更新）"
        quick_takeaway: |
          ${SUBSIDY_NAME}の要点まとめ（データ収集後に更新）
        next_steps: |
          次に理解すべきポイント（データ収集後に更新）
      
      detailed:
        abstract: |
          ${SUBSIDY_NAME}の専門的分析概要（データ収集後に更新）
        comprehensive_analysis:
          theoretical_framework: |
            制度の理論的枠組み（データ収集後に更新）
          empirical_evidence: |
            実証的根拠とデータ（データ収集後に更新）
          policy_implications: |
            政策的含意と戦略的示唆（データ収集後に更新）

  # 他のセクションも同様の構造でテンプレート化
  # （実際のデータ収集後に詳細を追加）
EOF

echo "✅ YAMLテンプレートを生成しました: backend/${SUBSIDY_ID}.yaml"

# Step 4: バックエンドAPI準備
echo "🔗 バックエンドAPI準備..."
API_CODE="
@app.get('/${SUBSIDY_ID}-knowledge')
async def get_${SUBSIDY_ID}_knowledge():
    \"\"\"${SUBSIDY_NAME}の知識ベースを取得\"\"\"
    try:
        return load_yaml_content('${SUBSIDY_ID}.yaml')
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail='${SUBSIDY_NAME} knowledge base not found')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
"

echo "📝 以下のコードをbackend/main.pyに追加してください:"
echo "----------------------------------------"
echo "$API_CODE"
echo "----------------------------------------"

# Step 5: フロントエンドコンポーネントテンプレート
echo "🎨 フロントエンドコンポーネント準備..."
COMPONENT_NAME=$(echo "$SUBSIDY_ID" | sed 's/_//g' | sed 's/.*/\u&/')
cat > "src/components/${COMPONENT_NAME}Guide.js" << EOF
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import config from '../config';

// UI Components
import Callout from './ui/Callout';
import ScrollspyNav from './ui/ScrollspyNav';
import SimpleDetailedToggle from './ui/SimpleDetailedToggle';

function ${COMPONENT_NAME}Guide() {
  const [knowledgeData, setKnowledgeData] = useState(null);
  const [currentMode, setCurrentMode] = useState('simple');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchKnowledgeData();
  }, []);

  const fetchKnowledgeData = async () => {
    try {
      const response = await fetch(\`\${config.API_BASE_URL}/${SUBSIDY_ID}-knowledge\`);
      if (!response.ok) {
        throw new Error('${SUBSIDY_NAME}データの取得に失敗しました');
      }
      const data = await response.json();
      setKnowledgeData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            <span className="ml-3 text-lg text-slate-600">読み込み中...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <Callout variant="warning" title="エラーが発生しました">
            <p>{error}</p>
            <button 
              onClick={fetchKnowledgeData}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              再試行
            </button>
          </Callout>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link 
              to="/" 
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              ホームに戻る
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-emerald-800 mb-4">
            📋 ${SUBSIDY_NAME}ガイド
          </h1>
          <SimpleDetailedToggle onChange={setCurrentMode} />
        </div>

        {/* Content rendering logic here */}
        {knowledgeData && (
          <div className="space-y-12">
            <Callout variant="info" title="実装準備完了">
              <p>${SUBSIDY_NAME}の基本コンポーネントが準備されました。</p>
              <p>データ収集完了後、詳細なコンテンツが表示されます。</p>
            </Callout>
          </div>
        )}
      </div>
    </div>
  );
}

export default ${COMPONENT_NAME}Guide;
EOF

echo "✅ フロントエンドコンポーネントを生成しました: src/components/${COMPONENT_NAME}Guide.js"

# Step 6: 完了レポート
echo ""
echo "🎉 ${SUBSIDY_NAME}統合準備完了！"
echo "=========================================="
echo "✅ 生成されたファイル:"
echo "   - temp_prompt_${SUBSIDY_ID}.md (データ収集用)"
echo "   - backend/${SUBSIDY_ID}.yaml (YAMLテンプレート)"
echo "   - src/components/${COMPONENT_NAME}Guide.js (UIコンポーネント)"
echo ""
echo "📋 次の手順:"
echo "1. temp_prompt_${SUBSIDY_ID}.md を使用してデータ収集実行"
echo "2. 収集データでbackend/${SUBSIDY_ID}.yaml を更新"
echo "3. backend/main.py にAPI追加"
echo "4. src/App.js にルート追加"
echo "5. 動作確認・品質チェック"
echo ""
echo "⏱️  推定完了時間: 30分"
echo "📖 詳細手順: docs/QUICK_START_GUIDE.md を参照"

# cleanup
echo ""
echo "🧹 一時ファイルを整理..."
# temp_prompt_${SUBSIDY_ID}.md は手動実行用に残す

echo "✅ 統合準備スクリプト完了"