# Shinseider 設計ガイドライン統合版

> Deep Research実行時の参考資料として、既存実装とアーキテクチャの全体像をまとめています。

---

## 📋 目次

1. [システム全体アーキテクチャ](#システム全体アーキテクチャ)
2. [補助金データ構造（subsidies.yaml）](#補助金データ構造)
3. [バリデーションシステム設計](#バリデーションシステム設計)
4. [フロントエンド設計原則](#フロントエンド設計原則)
5. [LLMプロンプト設計指針](#llmプロンプト設計指針)
6. [API設計パターン](#api設計パターン)
7. [セキュリティ要件](#セキュリティ要件)

---

## 🏗️ システム全体アーキテクチャ

### コンポーネント構成
```
Shinseider System
├── Frontend (React + Tailwind CSS)
│   ├── Phase1.js - 3分診断
│   ├── SubsidySelection.js - 補助金選択
│   ├── SubsidyApplicationSupport.js - 申請書作成
│   └── Static Pages (運営者情報、プライバシーポリシー)
│
├── Backend (FastAPI + Python)
│   ├── main.py - APIエンドポイント
│   ├── subsidies.yaml - 補助金設定データ
│   ├── validation/ - バリデーションエンジン
│   ├── middleware/ - セキュリティ＆認証
│   └── word_generator.py - 文書生成
│
└── Data Layer
    ├── 補助金マスターデータ（YAML）
    ├── バリデーションルール（Rules-based）
    └── LLMプロンプトテンプレート
```

### データフロー
```
Phase1診断 → 補助金推奨 → 申請書作成 → バリデーション → AI分析 → Word出力
```

---

## 📊 補助金データ構造（subsidies.yaml）

### 完全なエントリ構造
```yaml
- id: "scheme_id"                    # 補助金識別子
  name: "補助金正式名称"               # 表示名
  sections:                          # 申請項目
    - id: "section_id"
      title: "項目名"
      min: 200                       # 最小文字数
      max: 1500                      # 最大文字数
      hint: "記入ガイダンス"
      input_modes:
        guided:                      # ガイド付き質問
          - "Q1. 具体的質問..."
          - "Q2. 具体的質問..."
          - "Q3. 具体的質問..."
  
  validation:                        # バリデーション設定
    required: ["必須項目ID"]
    eligibility:                     # 申請資格
      - id: "e-01-sme"
        desc: "中小企業定義適合"
        type: "boolean"
        field: "applicant.sme_class_ok"
        severity: "block"
        source_id: "guideline"
    scope:                           # 事業範囲
      - id: "s-01-purpose"
        desc: "事業目的適合"
        type: "enum_in"
        field: "plan.purpose"
        params:
          allowed: ["選択肢1", "選択肢2"]
        severity: "block"
    attachments:                     # 必要書類
      - id: "a-01-form"
        desc: "申請書"
        type: "file_required"
        field: "files.application_form"
        severity: "block"
  
  checklist:                         # 確認事項
    - "チェック項目1"
    - "チェック項目2"
  
  tasks:                             # タスク管理
    milestones:
      - id: "m1"
        name: "タスク名"
        lead: "P-30d"                # 期限（提出30日前）
  
  llm_prompt_template: |             # LLMプロンプト
    あなたは専門アドバイザーです...
    {user_answers}を分析し改善提案を行ってください。
```

### 実装済み補助金（参考例）
1. **中小企業新事業進出補助金** - 4申請項目、基本バリデーション
2. **アトツギ甲子園** - 4申請項目、シンプル構成
3. **ものづくり補助金** - 5申請項目、高度バリデーション（15ルール）

---

## 🔍 バリデーションシステム設計

### Rules-based Validation Architecture
```python
# /Users/r9a/exp/attg/backend/validation/validator.py に実装済み

class RuleType(Enum):
    BOOLEAN = "boolean"              # True/False判定
    ENUM_IN = "enum_in"             # 選択肢チェック
    NUMBER_RANGE = "number_range"    # 数値範囲
    FILE_REQUIRED = "file_required"  # ファイル必須
    COMPOUND_REQUIRED = "compound_required"  # 複数項目必須
    CALC_EQUAL = "calc_equal"       # 計算式チェック
    FILE_OR_FORM = "file_or_form"   # ファイルまたはフォーム

class Severity(Enum):
    BLOCK = "block"                 # 致命的エラー（提出不可）
    WARN = "warn"                   # 警告（確認推奨）
```

### バリデーション3層構造
1. **Completeness** - 必須項目の充足
2. **Consistency** - データの整合性  
3. **Compliance** - 制度要件の適合

### 実装例（ものづくり補助金）
```yaml
eligibility:
  - id: "e-01-sme-definition"
    desc: "中小企業基本法による中小企業者等に該当"
    type: "boolean"
    field: "applicant.sme_class_ok"
    severity: "block"
    source_id: "monodukuri-guideline"

scope:
  - id: "s-02-subsidy-range"
    desc: "補助対象経費が100万円以上"
    type: "number_range"
    field: "budget.total_cost_yen"
    params:
      min: 1000000
      max: null
    severity: "block"
```

---

## 🎨 フロントエンド設計原則

### UI/UX設計思想
- **Tailwind CSS**: ユーティリティファーストCSS
- **レスポンシブデザイン**: モバイルファーストアプローチ
- **プログレッシブディスクロージャー**: 段階的な情報開示
- **ユーザビリティ重視**: 直感的な操作フロー

### コンポーネント設計パターン
```jsx
// 標準的なページ構造
function ComponentName() {
  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー部分 - グラデーション背景 */}
      <div className="bg-gradient-to-r from-[color]-50 to-[color]-100 border-b border-[color]-200">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            タイトル
          </h1>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* コンテンツ */}
      </div>
    </div>
  );
}
```

### 色彩設計（統一済み）
- **プライマリ**: Red系（CTA、重要な操作）
- **セカンダリ**: Gray系（テキスト、境界）
- **アクセント**: 補助金種別ごとに異なる色（Purple, Blue, Green, Orange）
- **アトツギセクション**: 統一されたGrayscale + Yellow accent

---

## 🤖 LLMプロンプト設計指針

### プロンプト構造パターン
```yaml
llm_prompt_template: |
  あなたは「{{scheme_name}}」の申請支援専門アドバイザーです。
  ユーザーの回答に基づき、採択率を高めるための具体的な改善提案を日本語で提供してください。
  
  ユーザーの回答（{input_mode}モード）: 
  {user_answers}

  審査で重要な以下の評価項目について、ユーザー回答を分析し改善提案を行ってください:

  【制度固有の評価軸】
  1. 評価項目1: 具体的な評価ポイント
  2. 評価項目2: 具体的な評価ポイント
  3. 評価項目3: 具体的な評価ポイント

  出力形式:
  - 各評価項目について良い点と改善点を指摘
  - 具体的な改善アクション（追加データ、強調ポイント）を提案
  - 採択確率を高める戦略的アドバイスを含める
  - 前向きで建設的な口調で申請者を励ます
```

### 制度別カスタマイズ例
- **ものづくり補助金**: 技術面・事業化面・政策面の6軸評価
- **新事業進出**: 新規性・市場性・実現可能性の3軸評価
- **アトツギ甲子園**: 独自性・社会的インパクト・情熱の3軸評価

---

## 🔌 API設計パターン

### RESTful Endpoint Design
```python
# /Users/r9a/exp/attg/backend/main.py に実装済み

@app.get("/subsidies")                              # 補助金一覧取得
@app.get("/subsidies/{subsidy_id}/metadata")        # 補助金メタデータ
@app.get("/get_application_questions/{subsidy_id}") # 申請項目取得
@app.post("/generate_application_advice")          # AI分析・アドバイス生成
@app.post("/save_desire")                          # Phase1診断結果保存
@app.post("/generate_textbook")                    # Word文書生成
```

### リクエスト/レスポンス設計
```python
# 標準的なレスポンス形式
{
  "success": true,
  "data": { ... },
  "message": "操作完了",
  "timestamp": "2025-XX-XX"
}

# エラーレスポンス形式
{
  "success": false,
  "error": "エラーの詳細",
  "code": "ERROR_CODE",
  "timestamp": "2025-XX-XX"
}
```

---

## 🔐 セキュリティ要件

### 実装済みセキュリティ機能
```python
# /Users/r9a/exp/attg/backend/middleware/security.py

1. SecurityMiddleware - リクエストサイズ制限（1MB）
2. ErrorHandlingMiddleware - 本番環境での詳細エラー非表示
3. RateLimitMiddleware - レート制限（100req/60sec）
4. CORS設定 - 許可オリジンの制限
5. secure_file_utils - ファイル操作のセキュア化
```

### データ保護原則
- **最小権限の原則**: 必要最小限のデータ収集
- **データ暗号化**: ファイル保存時の暗号化
- **ログ記録**: セキュリティイベントのログ出力
- **入力検証**: すべてのユーザー入力の検証

---

## 📝 Deep Research実行時の参考指針

### データ構造統一
1. **フィールド命名**: 既存のnaming conventionに従う
2. **バリデーションタイプ**: 7つの基本型を使用
3. **LLMプロンプト**: 3-6軸の評価基準を設定
4. **タスク管理**: 7-10段階のマイルストーン設定

### 品質保証チェックリスト
- ✅ 一次情報（公募要領・FAQ）からの正確な転記
- ✅ validator.pyで処理可能なルール形式
- ✅ 既存3補助金と統一されたYAML構造
- ✅ 20-80字の根拠引用付与
- ✅ 制度固有の評価軸を反映したLLMプロンプト

### ファイル配置
```
新しい補助金データ → /Users/r9a/exp/attg/backend/subsidies.yaml に追加
バリデーションルール → validator.pyで自動処理
APIエンドポイント → 既存のmain.pyで自動対応
フロントエンド → 既存コンポーネントで自動表示
```

---

## 🎯 実装優先順位

### Phase 1: 基本データ実装
1. 事業承継・M&A補助金のsections作成
2. Go-tech事業のsections作成  
3. 省力化投資補助金のsections完成

### Phase 2: 高度機能実装
4. 全補助金のバリデーションルール追加
5. TaskBoardコンポーネント実装
6. リアルタイムバリデーション機能

### Phase 3: 統合・最適化
7. 補助金横断比較機能
8. 専門家連携機能
9. 分析・レポート機能

このガイドラインを参考に、既存の実装パターンと一貫性を保ちながらDeep Researchを実行してください。