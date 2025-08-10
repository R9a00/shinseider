# Deep Research プロンプト集 v1（シンセイダー調査用）

> 目的：各補助金・「アトツギ甲子園」の**一次情報**から、提出可否ロジック（rules.json）・全タスク・チェックリスト・テストケースを設計するためのプロンプト群。  
> 原則：**公式資料のみ**を一次情報として使用し、出典・日付・版を必ず記録。

---

## 0. 使い方（共通ルール）
- 信頼順：**省庁/公式事務局サイト > 官報・告示 > 公式FAQ/様式 > 報道**。二次情報は参考にしない。
- 回答言語：**日本語**。推測・憶測はしない。未確認は `null` と記載。
- 各出力は**構造化（JSON/YAML/TS）**で返す。**該当条文や段落の引用**は20〜80字の範囲で。
- すべての項目に **`source_url` / `source_title` / `publisher` / `published_date` / `accessed_date` / `quote`** を付与。
- 版管理：`version`（例：v2025-1）と`quoted_at`（YYYY-MM-DD）を必ず含む。

---

## 1. 情報収集プロンプト（一次情報の特定）
```text
あなたは制度調査の専門家です。次の制度の一次情報URLを最大5件特定し、重要度順に出力してください。
制度名: {{scheme_name}}
年度/回次: {{fy_or_round}}
出力(JSON): [{"source_title","source_url","publisher","document_type","published_date","why_important"}]
要件: 公式PDF/公募要領/申請手引き/FAQ/様式DLページを優先。二次情報は除外。
```

---

## 2. スナップショット抽出（メタ＋目次）
```text
次の一次情報URLから、文書メタと目次構成を抽出してください。章/節/付録の階層リストも必要です。
URL: {{source_url}}
出力(JSON): {"source_title","source_url","publisher","published_date","version_hint","toc":[{"level":1,"title":"…"}],"accessed_date":"YYYY-MM-DD"}
```

---

## 3. ルール化（validator用 rules.json への写経）
```text
以下の一次情報（公募要領/FAQ）を根拠に、提出可否ロジックを rules.json 形式で作成してください。
対象: {{scheme_name}}
出力(JSON): {"meta":{…},"eligibility":[…],"scope":[…],"attachments":[…],"deadline":{…},"messages":{…}}
要件:
- 各ルールに `id/desc/type/field/params/severity/source_id` を付与
- `type` は boolean|enum_in|number_range|file_required|compound_required|calc_equal|file_or_form
- すべての数値レンジは min/max を具体化（不明は null）
- ルールごとに 20〜80字の根拠引用 `quote` を付けること
- `deadline` は回次制/通年制などのモードを記載
```

---

## 4. 数値・レンジ特定（金額・補助率・下限上限）
```text
{{scheme_name}} の、補助上限/下限、補助率、事業期間、対象経費の金額レンジと例外条件を抽出し、表形式で返してください。
出力(JSON): {"caps": {"min":…,"max":…}, "rate": {"base":…, "bonus":…}, "period": {"from":…, "to":…}, "cost_items": [{"name","eligible","note"}], "sources":[…]}
```

---

## 5. 不可/対象外の洗い出し（Compliance）
```text
{{scheme_name}} における「対象外」「不可」条件を一次情報から収集し、分類してください。
分類: 申請者要件/対象経費/スケジュール/他制度との関係/提出形式
出力(JSON): {"exclusions":[{"category","rule","quote","source_url"}],"notes":"判断が分かれる箇所"}
```

---

## 6. 典型落とし穴とエビデンス（Consistency）
```text
過去FAQや要領の注意書きから、却下/差戻しの典型パターンを3〜7項目抽出し、
修正指示テンプレートを併記してください。
出力(JSON): [{"anti_pattern","why","fix_template","quote","source_url"}]
```

---

## 7. タスク生成（全タスク & チェックリスト＝TaskBoard用）
```text
{{scheme_name}} の申請完了までに必要な「全タスク」と「提出前チェックリスト」を作成。
出力(YAML):
phases:
  - id: p1
    name: 要件確認・計画の土台
    hint: …
    tasks:
      - {id: t1, name: 最新の公募要領を確認, required: true, outputs: ["要件メモ.md"], hint: "…"}
  - …
checklist:
  - "費用内訳の合計＝総事業費"
要件: 各タスクに1行ヒントと成果物名を付ける。
```

---

## 8. ゴールデンテスト（通す/落とすケース）
```text
validator用に、{{scheme_name}} のゴールデンテストを10件作成してください。
出力(JSON): {"version":"…","scheme_id":"…","cases":[{"id","label","data":{…},"expect":{"blocks_contains":[…],"warns_contains":[…]}}]}
バランス: 通過3・ブロック5・警告2 程度。
```

---

## 9. 変更差分の特定（Diff）
```text
旧版URL: {{old_url}}
新版URL: {{new_url}}
両者を比較し、提出可否に影響する差分のみ抽出。
出力(JSON): {"added":[…],"removed":[…],"changed":[{"before","after","impact":"low|medium|high","rule_ids":[…]}],"notes":"確認が必要な曖昧表現"}
```

---

## 10. UI向けメッセージ生成（不足の伝え方）
```text
次の rules.json（抜粋）を読み、ユーザーに伝わる不足メッセージを簡潔に作成してください。
制約: 各80字以内、命令形は避け、安心感のあるトーン。
出力(JSON): {"map":{"rule_id":"ユーザーメッセージ"}}
```

---

## 11. ものづくり／承継・M&A／Go-Tech／新事業進出 用の開始プロンプト
```text
以下の制度について、1〜10の全プロンプトを順に適用し、成果物（rules.json / tasks.yml / tests.json）を作成してください。
- ものづくり・商業・サービス生産性向上促進補助金
- 事業承継・M&A補助金
- Go-Tech事業（成長型中小企業等研究開発支援事業）
- 中小企業新事業進出補助金
各制度ごとに、年度/回次を明記。一次情報のみを採用。
```

---

## 12. 「アトツギ甲子園」専用（内部資料用）
> 表示用UIでは仕組みを明記しない。以下は**内部設計**のための収集プロンプト。

```text
「アトツギ甲子園」について、応募対象・評価観点・提出物・スケジュール・FAQを一次情報から抽出。
出力(JSON): {"eligibility":…, "evaluation":…, "documents":…, "timeline":…, "sources":[…]}
```

```text
次に、挑戦者が準備しやすい「学びを残す」チェックリストを20行以内で作成。
出力(MD):
- テーマの明確化（誰に何を、なぜ今）
- 現状の定量データ（最低1指標）
- 実行計画（里程標/体制/リスク）
- KPIと測定（期間/方法）
```

---

## 13. ハルシネーション対策（自戒プロンプト）
```text
あなたは制度調査の専門家です。一次情報にない事項は推測しません。曖昧・不一致・出典不明は `null` とし、
「未確認・保留」のラベルを付けてください。各項目に必ず `source_url` と `quoted_at` を付与。
```

---

## 14. 監視・更新（週次チェック用）
```text
{{scheme_name}} の公式サイト/公募ページ/FAQ更新をチェックし、変更の有無を要約。
出力(JSON): {"has_update":true|false,"changes":[{"url","what","impact"}],"next_action":"rulesのどこを修正するか"}
```

---

## 15. 付録：フィールド定義（rules.json 最低限）
```ts
// Rule
{id, desc, type, field?, fields?, params?, severity: 'block'|'warn', source_id, quote}
// Deadline
{mode: 'rolling_round'|'open_call'|'fixed', rounds: [{name, due}], note}
```

---

### 運用メモ
- 生成物は `rules.{{scheme}}.json / tasks.{{scheme}}.yml / tests.{{scheme}}.json` の3点セットで保存。
- 反映時は「ゴールデンテスト → block=0 → UI配線」の順。
- UIには**補助金シンセイ準備が主役**。アトツギ甲子園は`notice`として静かに提示（仕組みは非表示）。

