# API仕様書

## 概要

事業承継・補助金申請サポートシステムのAPI仕様書です。

## ベースURL

- 開発環境: `http://localhost:8888`
- 本番環境: `https://api.example.com` (設定により変更)

## 認証

現在のバージョンでは認証は不要です。

## 共通レスポンス形式

### 成功レスポンス
```json
{
  "data": {...},
  "message": "Success"
}
```

### エラーレスポンス
```json
{
  "error": "Error message",
  "detail": "Detailed error information"
}
```

## エンドポイント一覧

### 1. 補助金一覧取得

**GET** `/subsidies`

利用可能な補助金の一覧を取得します。

#### レスポンス
```json
{
  "subsidies": [
    {
      "id": "shinjigyo_shinshutsu",
      "name": "中小企業新事業進出補助金"
    }
  ]
}
```

### 2. 補助金メタデータ取得

**GET** `/subsidies/{subsidy_id}/metadata`

指定された補助金のメタデータを取得します。

#### パラメータ
- `subsidy_id` (string): 補助金ID

#### レスポンス
```json
{
  "metadata": {
    "source_document_name": "令和5年度補正予算 中小企業省力化投資補助枠 公募要領 (第1回)",
    "source_document_url": "https://shoryokuka.smrj.go.jp/assets/pdf/koubo_01.pdf",
    "last_updated": "2025-08-06"
  }
}
```

### 3. 申請書質問項目取得

**GET** `/get_application_questions/{subsidy_id}`

指定された補助金の申請書作成に必要な質問項目を取得します。

#### パラメータ
- `subsidy_id` (string): 補助金ID

#### レスポンス
```json
{
  "criteria": [
    {
      "id": "is_new_product_and_customer",
      "question": "あなたの事業は、事業者にとって新製品（または新サービス）を新規顧客に提供する新たな挑戦ですか？",
      "type": "boolean"
    }
  ],
  "scoring_factors": {
    "new_market_potential": {
      "description": "新市場性・高付加価値性",
      "simple": "取り組む事業の新規性や革新性、そして高い付加価値について、具体的なデータや比較を交えて説明してください。",
      "guided": [
        "Q1. あなたの製品・サービスは、どのような点で「新しい」と言えますか？",
        "Q2. なぜ、あなたの製品・サービスは、顧客にとって「高い価値」があると言えるのでしょうか？",
        "Q3. その「新しさ」や「価値」を客観的に証明できるデータや事実はありますか？"
      ]
    }
  }
}
```

### 4. LLMプロンプト生成

**POST** `/generate_application_advice`

ユーザーの回答に基づき、LLM向けの高品質なプロンプトを生成します。

#### リクエストボディ
```json
{
  "subsidy_id": "shinjigyo_shinshutsu",
  "input_mode": "simple",
  "answers": {
    "is_new_product_and_customer": true,
    "value_added_growth_rate": true,
    "new_market_potential": "具体的な新規性の説明...",
    "business_viability": "事業の有望度の説明..."
  }
}
```

#### レスポンス
```json
{
  "prompt": "あなたは「中小企業新事業進出補助金」の申請支援AIアドバイザーです..."
}
```

### 5. 事業承継者回答保存

**POST** `/save_desire`

事業承継者の回答をセキュアに保存します。

#### リクエストボディ
```json
{
  "answers": [
    {
      "question": "あなたの事業アイデアの核は何ですか？",
      "answer": "既存事業とのシナジーを活かした新サービスです"
    }
  ]
}
```

#### レスポンス
```json
{
  "message": "Desire saved successfully"
}
```

### 6. 教科書生成

**POST** `/generate_textbook`

教科書をセキュアに生成します。

#### リクエストボディ
```json
{
  "content": "教科書の内容..."
}
```

#### レスポンス
- Content-Type: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- ファイルダウンロード

### 7. 事業計画書生成

**POST** `/generate_business_plan`

事業計画書をセキュアに生成します。

#### リクエストボディ
```json
{
  "business_summary": "事業概要",
  "market_analysis": "市場分析",
  "competitive_advantage": "競合優位性",
  "products_services": "製品・サービス",
  "marketing_strategy": "マーケティング戦略",
  "revenue_plan": "収益計画",
  "funding_plan": "資金計画",
  "implementation_structure": "実施体制"
}
```

#### レスポンス
- Content-Type: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- ファイルダウンロード

## セキュリティ要件

### リクエストサイズ制限
- 最大リクエストサイズ: 1MB
- 超過時: 413エラー

### レート制限
- 最大リクエスト数: 100回/分
- 超過時: 429エラー

### データ型検証
- Pydanticモデルによる厳密な型チェック
- 危険なコンテンツの検出

### ファイルパス検証
- パストラバーサル攻撃対策
- 安全なファイル名のみ許可

## エラーコード

| コード | 説明 |
|--------|------|
| 400 | Bad Request - 不正なリクエスト |
| 404 | Not Found - リソースが見つかりません |
| 413 | Payload Too Large - リクエストサイズ超過 |
| 429 | Too Many Requests - レート制限超過 |
| 500 | Internal Server Error - サーバー内部エラー |

## セキュリティヘッダー

すべてのレスポンスに以下のセキュリティヘッダーが含まれます：

```
Cache-Control: no-store, no-cache, must-revalidate
Pragma: no-cache
Expires: 0
```

## ログ

セキュリティイベントは以下の形式でログに記録されます：

```
[SECURITY] Large request blocked: 1048576 bytes from 192.168.1.1
[SECURITY] Path traversal attempt blocked: ../../../etc/passwd from 192.168.1.1
[SECURITY] Rate limit exceeded for 192.168.1.1
``` 