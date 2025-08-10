# Shinseider rules.shorei.json v0.2（省力化一般）＋配線パッチ

> まず省力化一般（shorei）を**提出可否の核**まで引き上げました。min/max 等の実値は Deep Research で上書き可能なプレースホルダ付きです。UI には出さず、Results/TaskBoard だけに影響します。

---

## 1) rules.shorei.json（v0.2）
```json
{
  "meta": {
    "scheme_id": "shorei",
    "scheme_name": "中小企業省力化投資補助金（一般型）",
    "version": "0.2",
    "last_updated": null,
    "sources": [
      {"id":"src-guideline","title":"公募要領（一般型）","url":"","quoted_at":null},
      {"id":"src-faq","title":"公式FAQ","url":"","quoted_at":null}
    ]
  },
  "eligibility": [
    {"id":"e-01-sme","desc":"中小企業者等に該当","type":"boolean","field":"applicant.sme_class_ok","severity":"block","source_id":"src-guideline"},
    {"id":"e-02-gbiz","desc":"GビズIDプライムを取得済","type":"boolean","field":"applicant.gbizid_ready","severity":"block","source_id":"src-guideline"},
    {"id":"e-03-exclusion","desc":"対象外業種・反社等に該当せず","type":"boolean","field":"applicant.no_exclusion","severity":"block","source_id":"src-guideline"}
  ],
  "scope": [
    {"id":"s-01-purpose","desc":"目的が省力化・人手不足対応","type":"enum_in","field":"plan.purpose","params":{"allowed":["省力化"]},"severity":"block","source_id":"src-guideline"},
    {"id":"s-02-asset","desc":"対象設備/役務が要件表に該当","type":"boolean","field":"plan.asset_eligible","severity":"block","source_id":"src-guideline"},
    {"id":"s-03-capex","desc":"投資規模がレンジ内（閾値は年度反映）","type":"number_range","field":"budget.capex_million","params":{"min":null,"max":null},"severity":"warn","source_id":"src-guideline"}
  ],
  "attachments": [
    {"id":"a-01-quote","desc":"見積（税抜・有効期限・型番・台数・役務）","type":"file_required","field":"files.quote","severity":"block","source_id":"src-guideline"},
    {"id":"a-02-breakdown","desc":"費用内訳の合計＝総事業費（税抜）","type":"calc_equal","field":"budget.total_equals_sum","params":{"lhs":"budget.total_ex_tax","rhs":"sum(items[].ex_tax)","tolerance":0.5},"severity":"block","source_id":"src-guideline"},
    {"id":"a-03-kpi","desc":"KPI数値と測定（式/期間）","type":"compound_required","fields":["effect.kpi_value","effect.kpi_unit","effect.measure_formula","effect.measure_period"],"severity":"block","source_id":"src-guideline"},
    {"id":"a-04-team","desc":"体制表（責任者/担当/保守）","type":"file_or_form","field":"org.team_defined","severity":"warn","source_id":"src-guideline"},
    {"id":"a-05-reason","desc":"業者選定理由書（比較がある場合）","type":"file_or_form","field":"files.vendor_reason","severity":"warn","source_id":"src-guideline"},
    {"id":"a-06-wage","desc":"賃上げ計画の表明（該当時）","type":"file_or_form","field":"files.wage_statement","severity":"warn","source_id":"src-guideline"},
    {"id":"a-07-site","desc":"事業実施場所リスト（所在地・レイアウト）","type":"file_or_form","field":"files.site_list","severity":"warn","source_id":"src-guideline"}
  ],
  "deadline": {"mode":"rolling_round","rounds":[],"note":"回次・締切は Deep Research で更新"},
  "messages": {
    "block_prefix": "このままでは提出できません。",
    "warn_prefix": "提出前に確認をおすすめします。"
  }
}
```

---

## 2) UIメッセージ（ユーザー文言）
```json
{
  "e-02-gbiz": "電子申請に必要なアカウントの準備が確認できません。取得状況をご確認ください。",
  "s-02-asset": "導入予定の設備/役務が要件表に見当たりません。型番・仕様の整合をご確認ください。",
  "a-02-breakdown": "費用内訳の合計が総事業費と一致していません。税抜/税込の計算方法も含めて見直してください。",
  "a-03-kpi": "KPIの数値と測定方法が不足しています。期間と算式まで記載してください。"
}
```

---

## 3) Results への最小配線（不足→上位カード）
```ts
import rules from './rules.shorei.json'
import { mapToResults } from './validator-integration'

const base = scoredCandidates // [{id,name,score,highlights,missing}]
const input = formData        // 3分診断＋詳細フォームのモデル

const { results, submitReady, findings } = mapToResults(input, {
  eligibility: rules.eligibility,
  scope: rules.scope,
  attachments: rules.attachments
}, base)

// props に流し込む
<Results results={results} onStartDraft={...} />
```

---

## 4) TaskBoard への橋渡し（不足→該当タスクを強調）
```ts
import { toTaskHints } from './taskboard-bridge'
const isHot = toTaskHints(findings)

// TaskBoard 側：
<li className={isHot(task.id) ? 'border-red-300 bg-red-50' : 'border-gray-100'}> ... </li>
```

---

## 5) 既存フォームのフィールド対応（例）
```json
{
  "applicant": {"sme_class_ok": true, "gbizid_ready": false, "no_exclusion": true},
  "plan": {"purpose": "省力化", "asset_eligible": true},
  "budget": {"capex_million": 800, "total_ex_tax": 1000, "items": [{"ex_tax": 400},{"ex_tax": 600}]},
  "effect": {"kpi_value": 30, "kpi_unit": "%", "measure_formula": "(後-前)/前", "measure_period": "3ヶ月"},
  "org": {"team_defined": true},
  "files": {"quote": true, "vendor_reason": false, "wage_statement": false, "site_list": false}
}
```

---

### 備考
- `params.min/max` などの閾値、`attachments` の条件分岐は Deep Research 後に埋め込みます。
- 提出ボタンの活性は `submitReady`（block=0）で制御できます。
- UI はあくまで**補助金のシンセイ準備が主役**。アトツギ甲子園は、条件時のみ外から `notice` を渡して“静かに”案内。

