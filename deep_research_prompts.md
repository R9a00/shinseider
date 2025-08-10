# Shinseider Deep Research プロンプト集（不足補助金データ収集用）

> 目的：システムで不足している3つの補助金の完全なデータセットを収集し、既存のsubsidies.yaml形式に統合する
> 対象：事業承継・M&A補助金、Go-tech事業、中小企業省力化投資補助金

## 🎯 収集対象補助金

### 1. **事業承継・M&A補助金**
### 2. **Go-tech事業（成長型中小企業等研究開発支援事業）**  
### 3. **中小企業省力化投資補助金（一般型）**

---

## 📋 Phase 1: 一次情報特定プロンプト

```text
あなたは制度調査の専門家です。以下の補助金について、最新の一次情報URLを重要度順に最大5件特定し、構造化して出力してください。

**対象制度：** {{scheme_name}}
**年度：** 令和7年度（2025年度）最新版

**出力形式（JSON）：**
```json
{
  "scheme_id": "{{scheme_id}}",
  "scheme_name": "{{scheme_name}}",
  "sources": [
    {
      "priority": 1,
      "source_title": "公募要領（令和7年度版）",
      "source_url": "https://...",
      "publisher": "中小企業庁",
      "document_type": "公募要領",
      "published_date": "2025-XX-XX",
      "why_important": "申請要件・審査基準の一次情報",
      "accessed_date": "2025-XX-XX"
    }
  ]
}
```

**要件：**
- 公式PDF/公募要領/申請手引き/FAQ/様式DLページを最優先
- 二次情報（解説サイト、民間コンサル資料）は除外
- 中小企業庁・経済産業省の公式サイトを信頼
- 最新年度版を確実に特定
```

---

## 📊 Phase 2: 申請項目抽出プロンプト

```text
以下の一次情報から、申請書作成に必要な「記載項目」を抽出し、Shinseiderのsections形式で構造化してください。

**対象URL：** {{source_url}}
**補助金名：** {{scheme_name}}

**出力形式（YAML）：**
```yaml
sections:
  - id: "business_overview"
    title: "事業概要"
    min: 200
    max: 1500
    hint: "具体的な記載内容のガイダンス"
    input_modes:
      guided:
        - "Q1. 具体的な質問文..."
        - "Q2. 具体的な質問文..."
        - "Q3. 具体的な質問文..."
```

**抽出基準：**
1. 申請書の必須記載項目から3-6項目を特定
2. 各項目に申請者が回答しやすいガイド質問を3つ作成
3. 文字数制限は公募要領の指定に準拠
4. hint文は審査のポイントを反映した具体的なガイダンス

**必須確認点：**
- 事業内容/計画の記載要件
- 市場分析/競合分析の要求レベル
- 技術的優位性/革新性の説明項目
- 実施体制/スケジュールの詳細度
- 収益性/事業性の根拠要求
```

---

## 🔍 Phase 3: バリデーションルール抽出プロンプト

```text
以下の公募要領から、申請可否を判定する「提出要件ルール」を抽出し、Rules-based Validation形式で構造化してください。

**対象：** {{scheme_name}}
**参照資料：** {{source_url}}

**出力形式（YAML）：**
```yaml
validation:
  eligibility:
    - id: "e-01-sme-definition"
      desc: "中小企業者等の定義に該当"
      type: "boolean"
      field: "applicant.sme_class_ok"
      severity: "block"
      source_id: "guideline"
      quote: "20-80字の根拠引用"
  
  scope:
    - id: "s-01-purpose"
      desc: "事業目的の適合性"
      type: "enum_in"
      field: "plan.purpose"
      params:
        allowed: ["事業承継", "M&A"]
      severity: "block"
      source_id: "guideline"
      quote: "根拠引用"
  
  attachments:
    - id: "a-01-application"
      desc: "申請書（様式第1号）"
      type: "file_required"
      field: "files.application_form"
      severity: "block"
      source_id: "guideline"
```

**抽出対象：**
1. **申請資格（eligibility）**: 対象事業者、除外条件、所在地要件
2. **事業範囲（scope）**: 対象事業、補助額範囲、実施期間
3. **必要書類（attachments）**: 必須提出書類、形式要件

**ルールタイプ：**
- `boolean`: yes/no判定
- `enum_in`: 選択肢から選択
- `number_range`: 数値範囲チェック
- `file_required`: ファイル必須
- `compound_required`: 複数項目必須
```

---

## 💰 Phase 4: 補助金制度詳細プロンプト

```text
{{scheme_name}}について、補助金額・補助率・対象経費の詳細情報を抽出し、システム実装用の数値データとして構造化してください。

**出力形式（YAML）：**
```yaml
subsidy_details:
  caps:
    min: 1000000  # 下限額（円）
    max: 10000000  # 上限額（円）
    conditions:
      - range: "従業員5人以下"
        max_subsidy: 7500000
      - range: "従業員21人以上" 
        max_subsidy: 25000000
  
  rates:
    base: 0.5  # 基本補助率
    bonus_conditions:
      - condition: "小規模事業者"
        rate: 0.667
      - condition: "賃上げ計画あり"
        rate: 0.6
  
  eligible_expenses:
    - "設備費"
    - "外注費"
    - "技術導入費"
  
  ineligible_expenses:
    - "汎用品購入費"
    - "人件費"
    - "消費税"
  
  deadlines:
    mode: "rolling_round"  # または "fixed_date"
    rounds:
      - name: "第1回"
        due_date: "2025-XX-XX"
      - name: "第2回"
        due_date: "2025-XX-XX"
```

**必須確認事項：**
- 補助上限額の従業員規模別区分
- 補助率の基本値と加点条件
- 対象経費の具体的カテゴリ
- 対象外経費の明確な除外理由
- 申請締切の回次制/通年制の区別
```

---

## 📝 Phase 5: LLMプロンプトテンプレート作成

```text
{{scheme_name}}の申請支援に特化したLLMプロンプトテンプレートを作成してください。審査基準と採択のポイントを反映した具体的なアドバイス生成用です。

**出力形式（YAML）：**
```yaml
llm_prompt_template: |
  あなたは「{{scheme_name}}」の申請支援専門アドバイザーです。ユーザーの回答に基づき、採択率を高めるための具体的な改善提案を日本語で提供してください。
  
  ユーザーの回答（{input_mode}モード）: 
  {user_answers}

  審査で重要な以下の評価項目について、ユーザー回答を分析し改善提案を行ってください:

  【重点評価項目】
  1. [制度固有の評価軸1]: [具体的な評価ポイント]
  2. [制度固有の評価軸2]: [具体的な評価ポイント]
  3. [制度固有の評価軸3]: [具体的な評価ポイント]

  出力形式:
  - 各評価項目について現在の内容の良い点と改善点を指摘
  - 具体的な改善アクション（追加すべきデータ、強調ポイント）を提案
  - 採択確率を高める戦略的アドバイスを含める
  - 前向きで建設的な口調で申請者を励ます
```

**制度別カスタマイズポイント：**
- **事業承継・M&A**: 承継計画、企業価値向上、統合効果
- **Go-tech**: 技術革新性、研究開発計画、実用化見込み
- **省力化投資**: 省力化効果、生産性向上、投資回収性
```

---

## 🎯 Phase 6: 統合データ生成プロンプト

```text
Phase 1-5で収集した情報を統合し、Shinseiderのsubsidies.yamlに追加可能な完全なエントリを生成してください。

**補助金名：** {{scheme_name}}

**出力形式（YAML）：**
```yaml
- id: {{scheme_id}}
  name: {{scheme_name}}
  sections:
    # Phase 2で抽出した申請項目
  validation:
    # Phase 3で抽出したバリデーションルール
    # Phase 4で抽出した補助金制度詳細
  checklist:
    # 公募要領から抽出した重要チェック項目（5-10個）
  tasks:
    milestones:
      # 申請完了までのタスクフロー（7-10段階）
  llm_prompt_template: |
    # Phase 5で作成したプロンプト
```

**品質チェック項目：**
✅ すべてのフィールドが既存エントリと同じ構造
✅ バリデーションルールが実装可能な形式
✅ LLMプロンプトが制度の特徴を反映
✅ 数値データが最新の公募要領に準拠
✅ 引用・出典が明記されている
```

---

## 🔄 使用手順

### ステップ1: 3つの補助金それぞれについて Phase 1-6を実行

**A. 事業承継・M&A補助金**
```
scheme_name: "事業承継・M&A補助金"
scheme_id: "jigyou_shoukei_ma"
```

**B. Go-tech事業**
```  
scheme_name: "Go-tech事業（成長型中小企業等研究開発支援事業）"
scheme_id: "gotech_rd_support"
```

**C. 中小企業省力化投資補助金**
```
scheme_name: "中小企業省力化投資補助金（一般型）"
scheme_id: "shoukuritsuka_ippan"
```

### ステップ2: 3つの完全なYAMLエントリをsubsidies.yamlに統合

### ステップ3: バリデーション機能のテスト実行

---

## 📌 重要な注意事項

1. **一次情報のみ使用**: 公式サイト・公募要領・FAQ以外は参考にしない
2. **最新年度確認**: 令和7年度（2025年度）版を必ず取得
3. **数値の正確性**: 補助上限額・補助率は公募要領の記載を正確に反映
4. **引用の記録**: 各ルールに20-80字の根拠引用を必ず付与
5. **実装可能性**: 既存のvalidator.pyで処理可能な形式で出力

このプロンプト集を使用して、不足している3つの補助金データを完全に収集してください。