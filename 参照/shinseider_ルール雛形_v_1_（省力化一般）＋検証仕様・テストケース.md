# Shinseider ルール雛形 v1（省力化一般）＋検証仕様・テストケース

> 「確実さ」を担保するための**一次情報ベースのルール雛形**と、 フロントに組み込む**検証ロジック仕様**、**ゴールデンテスト**の初版です。 ※本文は骨子です。実値・根拠URLは“Deep Research”で随時更新します。

---

## 1) rules.shorei.json（雛形）

```json
{
  "meta": {
    "scheme_id": "shorei",
    "scheme_name": "中小企業省力化投資補助金（一般型）",
    "version": "0.1",
    "last_updated": null,
    "sources": [
      {
        "id": "src-guideline",
        "title": "公募要領（一般型）",
        "url": "",
        "quoted_at": null,
        "note": "一次情報PDF。改訂版ごとに差し替え"
      },
      {
        "id": "src-faq",
        "title": "公式FAQ",
        "url": "",
        "quoted_at": null,
        "note": "対象経費・申請手続の解釈確認"
      }
    ]
  },
  "eligibility": [
    {
      "id": "e-01-sme-definition",
      "desc": "中小企業者等の範囲に該当する",
      "type": "boolean",
      "field": "applicant.sme_class_ok",
      "severity": "block",
      "source_id": "src-guideline"
    },
    {
      "id": "e-02-gbizid",
      "desc": "GビズID（プライム相当）を取得済",
      "type": "boolean",
      "field": "applicant.gbizid_ready",
      "severity": "block",
      "source_id": "src-guideline"
    },
    {
      "id": "e-03-industry-exclusion",
      "desc": "対象外業種・反社等に該当しない",
      "type": "boolean",
      "field": "applicant.no_exclusion",
      "severity": "block",
      "source_id": "src-guideline"
    }
  ],
  "scope": [
    {
      "id": "s-01-purpose-fit",
      "desc": "目的が省力化・人手不足対応に該当",
      "type": "enum_in",
      "field": "plan.purpose",
      "params": {"allowed": ["省力化"]},
      "severity": "block",
      "source_id": "src-guideline"
    },
    {
      "id": "s-02-asset-eligible",
      "desc": "対象設備/役務が要件表に該当（型番・仕様の整合）",
      "type": "boolean",
      "field": "plan.asset_eligible",
      "severity": "block",
      "source_id": "src-guideline"
    },
    {
      "id": "s-03-capex-range",
      "desc": "投資規模がレンジ内（下限/上限）",
      "type": "number_range",
      "field": "budget.capex_million",
      "params": {"min": null, "max": null},
      "severity": "warn",
      "source_id": "src-guideline"
    }
  ],
  "attachments": [
    {
      "id": "a-01-quote",
      "desc": "見積書（税抜・有効期限・型番・台数・役務）",
      "type": "file_required",
      "field": "files.quote",
      "severity": "block",
      "source_id": "src-guideline"
    },
    {
      "id": "a-02-cost-breakdown",
      "desc": "費用内訳表（税抜合計＝総事業費）",
      "type": "calc_equal",
      "field": "budget.total_equals_sum",
      "params": {"lhs": "budget.total_ex_tax", "rhs": "sum(items[].ex_tax)"},
      "severity": "block",
      "source_id": "src-guideline"
    },
    {
      "id": "a-03-kpi",
      "desc": "KPI数値と測定方法（式/期間）が明記",
      "type": "compound_required",
      "fields": ["effect.kpi_value", "effect.kpi_unit", "effect.measure_formula", "effect.measure_period"],
      "severity": "block",
      "source_id": "src-guideline"
    },
    {
      "id": "a-04-team",
      "desc": "体制表（責任者/担当/保守）",
      "type": "file_or_form",
      "field": "org.team_defined",
      "severity": "warn",
      "source_id": "src-guideline"
    }
  ],
  "deadline": {
    "mode": "rolling_round",
    "rounds": [],
    "note": "回次ごとに受付終了。Deep Researchで更新"
  },
  "messages": {
    "block_prefix": "このままでは提出できません。",
    "warn_prefix": "提出前に確認をおすすめします。"
  }
}
```

---

## 2) validator.spec.ts（検証ロジック仕様）

```ts
// 3層検証: Completeness / Consistency / Compliance
export type Rule = {
  id: string; desc: string; type: string; field?: string; fields?: string[];
  params?: any; severity: 'block'|'warn'; source_id: string
};

export function validate(rules: Rule[], data: any){
  const findings = [] as {id:string; severity:'block'|'warn'; message:string}[];
  for (const r of rules){
    const ok = exec(r, data);
    if (!ok) findings.push({ id: r.id, severity: r.severity, message: r.desc });
  }
  return findings;
}

function exec(r: Rule, data: any){
  switch(r.type){
    case 'boolean': return !!get(data, r.field!);
    case 'enum_in': return (r.params?.allowed||[]).includes(get(data, r.field!));
    case 'number_range': {
      const v = Number(get(data, r.field!));
      const minOk = r.params?.min==null || v >= r.params.min;
      const maxOk = r.params?.max==null || v <= r.params.max;
      return !!(minOk && maxOk);
    }
    case 'file_required': return !!get(data, r.field!);
    case 'compound_required': return r.fields!.every(f=>!!get(data,f));
    case 'calc_equal': {
      const lhs = calcExpr(r.params.lhs, data); const rhs = calcExpr(r.params.rhs, data);
      return Math.abs(lhs - rhs) < 0.5; // 許容誤差
    }
    case 'file_or_form': return !!get(data, r.field!);
    default: return true;
  }
}

// get()/calcExpr() は既存のフォームモデルに合わせて実装
```

---

## 3) golden-tests.shorei.json（10ケース雛形）

```json
{
  "version": "0.1",
  "scheme_id": "shorei",
  "cases": [
    {
      "id": "ok-basic",
      "label": "標準ケース（通過）",
      "data": {
        "applicant": {"sme_class_ok": true, "gbizid_ready": true, "no_exclusion": true},
        "plan": {"purpose": "省力化", "asset_eligible": true},
        "budget": {"capex_million": 800, "total_ex_tax": 1000, "items": [{"ex_tax": 400},{"ex_tax": 600}]},
        "effect": {"kpi_value": 30, "kpi_unit": "%", "measure_formula": "(導入後-導入前)/導入前", "measure_period": "3ヶ月"},
        "org": {"team_defined": true},
        "files": {"quote": true}
      },
      "expect": {"blocks": [], "warns": []}
    },
    {
      "id": "ng-no-gbiz",
      "label": "GビズID未取得（ブロック）",
      "data": {"applicant": {"sme_class_ok": true, "gbizid_ready": false, "no_exclusion": true}},
      "expect": {"blocks_contains": ["e-02-gbizid"]}
    },
    {
      "id": "ng-purpose-mismatch",
      "label": "目的が省力化以外（ブロック）",
      "data": {"plan": {"purpose": "新事業", "asset_eligible": true}},
      "expect": {"blocks_contains": ["s-01-purpose-fit"]}
    },
    {
      "id": "ng-asset-not-eligible",
      "label": "対象設備が該当せず（ブロック）",
      "data": {"plan": {"purpose": "省力化", "asset_eligible": false}},
      "expect": {"blocks_contains": ["s-02-asset-eligible"]}
    },
    {
      "id": "ng-quote-missing",
      "label": "見積不足（ブロック）",
      "data": {"files": {"quote": false}},
      "expect": {"blocks_contains": ["a-01-quote"]}
    },
    {
      "id": "ng-cost-mismatch",
      "label": "内訳合計≠総額（ブロック）",
      "data": {"budget": {"total_ex_tax": 1000, "items": [{"ex_tax": 200},{"ex_tax": 200}]}},
      "expect": {"blocks_contains": ["a-02-cost-breakdown"]}
    },
    {
      "id": "ng-kpi-missing",
      "label": "KPIと測定の未設定（ブロック）",
      "data": {"effect": {"kpi_value": null, "kpi_unit": "", "measure_formula": "", "measure_period": ""}},
      "expect": {"blocks_contains": ["a-03-kpi"]}
    },
    {
      "id": "warn-capex-range",
      "label": "投資額がレンジから外れ（警告）",
      "data": {"budget": {"capex_million": 50}},
      "expect": {"warns_contains": ["s-03-capex-range"]}
    },
    {
      "id": "ok-edge",
      "label": "端数・誤差許容（通過）",
      "data": {"budget": {"total_ex_tax": 1000, "items": [{"ex_tax": 333.4},{"ex_tax": 666.6}]}},
      "expect": {"blocks": []}
    },
    {
      "id": "ng-exclusion",
      "label": "対象外業種/反社該当（ブロック）",
      "data": {"applicant": {"no_exclusion": false}},
      "expect": {"blocks_contains": ["e-03-industry-exclusion"]}
    }
  ]
}
```

---

## 4) UIメッセージ雛形（ユーザー向け）

```json
{
  "block_prefix": "このままでは提出できません。",
  "warn_prefix": "提出前に確認をおすすめします。",
  "map": {
    "e-02-gbizid": "電子申請に必要なアカウントの準備が確認できません。取得状況をご確認ください。",
    "s-02-asset-eligible": "導入予定の設備/役務が要件表に見当たりません。型番・仕様の整合をご確認ください。",
    "a-02-cost-breakdown": "費用内訳の合計が総事業費と一致していません。税抜/税込の計算方法も含めて見直してください。",
    "a-03-kpi": "KPIの数値と測定方法が不足しています。期間と算式まで記載してください。"
  }
}
```

---

## 5) 次の作業

- Deep Research で **min/max・要件表・提出方式**を一次情報から埋め込み（`sources[].url`と`quoted_at`を更新）
- validator 実装を `Results` → `TaskBoard` の流れに差し込み
- golden-tests を通してから UI にメッセージ反映

> ※ 他制度（ものづくり／承継・M&A／Go-Tech／新事業進出）の雛形も、同構成で順次追加します。

