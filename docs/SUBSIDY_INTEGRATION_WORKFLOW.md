# シンセイダー補助金統合ワークフロー完全手順書

## 概要
補助金制度→データ収集→設計→実装の完全フローを体系化。
「網羅的に抜け漏れなく指示に従えば補助申請を達成できるフォーム」を実現する。

## ワークフローの全体像

```
【Phase 1】データ収集
    ↓
【Phase 2】データ設計・構造化  
    ↓
【Phase 3】システム実装
    ↓
【Phase 4】検証・調整
```

---

## Phase 1: データ収集

### 1.1 プロンプト選択・カスタマイズ
**場所**: `/prompts/`
**使用**: 対象補助金に応じてプロンプトをカスタマイズ

```bash
# 基本構造理解用
cp prompts/structural_knowledge_collection.md prompts/custom_[補助金名].md
# 対象制度に特化したカスタマイズを実施
```

### 1.2 DeepResearch実行
**プロンプト実行**:
```bash
claude code "prompts/custom_[補助金名].md の指示に従い、
[補助金名]について包括的調査を実施し、
data_input/raw_data/[補助金名]_research.txt として保存"
```

**生成される成果物**:
- `data_input/raw_data/[補助金名]_research.txt`
- `data_input/knowledge_base/[補助金名]_structure.txt`
- `private/research/subsidy_docs/research_results/[補助金名]_analysis.pdf`

### 1.3 データ検証
**検証スクリプト実行**:
```bash
cd backend/research_data
python scripts/validate_research_data.py --input [補助金名]_research.txt
```

---

## Phase 2: データ設計・構造化

### 2.1 YAML構造設計
**テンプレート**: `backend/research_data/templates/`を使用

**基本構造**:
```yaml
categories:
  foundation:
    name: "[補助金名]の基礎"
    sections:
      - subsidy_basics
      - funding_sources
      # ...

content:
  subsidy_basics:
    title: "[補助金名]とは"
    overview: "制度の基本的な定義"
    content:
      simple:
        overview: "初心者向け説明"
        key_points:
          definition:
            title: "定義"
            content: "詳細説明"
            examples: ["例1", "例2"]
        quick_takeaway: "要点まとめ"
        next_steps: "次のステップ"
      
      detailed:
        abstract: "専門家向け概要"
        comprehensive_analysis:
          theoretical_framework: "理論的枠組み"
          empirical_evidence: "実証的根拠"
          policy_implications: "政策的含意"
```

### 2.2 データ統合・標準化
```bash
cd backend/research_data
python scripts/merge_research_data.py \
  --input data_input/raw_data/[補助金名]_research.txt \
  --template templates/policy_update_template.yaml \
  --output ../[補助金名].yaml
```

### 2.3 品質チェック
```bash
cd backend/validation
python validator.py --yaml ../[補助金名].yaml --strict
```

---

## Phase 3: システム実装

### 3.1 バックエンド統合
**YAMLファイル配置**:
```bash
cp [補助金名].yaml backend/
```

**API設定更新**:
```python
# backend/main.py
@app.get("/[補助金名]-info")
async def get_subsidy_info():
    return load_yaml_content("[補助金名].yaml")
```

### 3.2 フロントエンド実装

**コンポーネント作成**:
```bash
cp src/components/KnowledgeBase.js src/components/[補助金名]Guide.js
```

**ルーティング追加**:
```javascript
// src/App.js
import [補助金名]Guide from './components/[補助金名]Guide';

// Routes内に追加
<Route path="/[補助金名]-guide" element={<[補助金名]Guide />} />
```

### 3.3 フォーム機能実装

**申請支援フォーム**:
```javascript
// src/components/[補助金名]ApplicationSupport.js
const [補助金名]Form = () => {
  // YAML構造に基づく動的フォーム生成
  // チェックリスト機能
  // Word文書生成機能
};
```

---

## Phase 4: 検証・調整

### 4.1 機能テスト
```bash
cd backend/tests
python test_subsidy_recommendation.py --subsidy [補助金名]
python test_word_generation.py --subsidy [補助金名]
```

### 4.2 コンテンツ品質確認
**チェックポイント**:
- [ ] 2階層構造（simple/detailed）完備
- [ ] 抽象化フレームワーク適用
- [ ] タグ構造統一
- [ ] 相互参照リンク設定
- [ ] 実務的有用性確認

### 4.3 ユーザビリティテスト
- [ ] 初心者向けコンテンツの理解しやすさ
- [ ] 専門家向けコンテンツの実用性
- [ ] フォーム機能の使いやすさ
- [ ] エラーハンドリングの適切性

---

## データ管理標準

### ファイル命名規則
```
raw_data/[補助金名]_research_[YYYYMMDD].txt
knowledge_base/[補助金名]_structure_v[X].txt
research_results/[補助金名]_analysis_[YYYYMMDD].pdf
[補助金名].yaml (バックエンド統合用)
```

### バージョン管理
```bash
# 新しい補助金追加時
git add .
git commit -m "feat: Add [補助金名] integration workflow"

# データ更新時
git commit -m "update: [補助金名] data refresh [YYYYMMDD]"
```

### 品質保証チェックリスト
- [ ] プロンプト実行結果の妥当性
- [ ] YAML構文エラーなし
- [ ] 2階層構造完備
- [ ] API動作確認
- [ ] フロントエンド表示確認
- [ ] Word生成機能動作
- [ ] エラーハンドリング適切

---

## 拡張・運用のポイント

### 新制度追加時の効率化
1. 既存プロンプトの再利用・カスタマイズ
2. 抽象化フレームワークの適用
3. 類似制度との差分分析
4. 段階的実装・検証

### データ最新性維持
1. 定期的な制度変更チェック
2. 政策文書アップデート反映  
3. 利用者フィードバック取り込み
4. A/Bテストによる改善

### 品質向上サイクル
```
データ収集 → 構造化 → 実装 → 検証 → フィードバック → 改善 → データ収集...
```

---

## 成果指標

### 定量指標
- 申請成功率向上
- 作業時間短縮率
- ユーザー満足度スコア
- コンテンツ網羅性指標

### 定性指標  
- 制度理解の深化度
- 申請書類の質的向上
- 戦略的思考力向上
- 自立的申請能力獲得

このワークフローにより、**体系的で再現可能な補助金制度統合**が実現されます。