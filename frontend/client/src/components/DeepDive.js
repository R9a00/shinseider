import React, { useState, useEffect } from 'react';

// SpareSlotコンセプトに基づく24ブロックのプレースホルダー
const PLACEHOLDERS = {
  "roots": {
    "when": "例）2004年：精密板金で創業／2012年：樹脂切削追加／2023年：短納期案件が増加",
    "who": "例）先代：段取りと交渉に強い／現代表（アトツギ）：現場とITの橋渡し",
    "why": "例）取りこぼしが粗利を削る。余剰時間を見える化して現金化したい",
    "what": "例）紙・Excel・チャットの見積/指示を、QR×CSV×写真に整理",
    "goal_heritage": "例）小さくても速くて正確をデジタルで持続可能にする"
  },
  "philosophy": {
    "mission": "例）現場の余剰価値をキャッシュに変える",
    "vision": "例）地域工場の72時間見積が当たり前になる世界",
    "values": "例）現場起点／小さく試す／三方よし",
    "manifestations": "例）QR指示書／写真検査PDF／CSV一括入出力（1週間で立ち上げ）",
    "interpretation": "例）理想より運用。明日から回る手順を最優先"
  },
  "strength_1": {
    "claim": "例）短納期見積の型化ができる",
    "evidence": "例）過去見積の係数化→回答リードタイムを平均△△%短縮",
    "why_unique": "例）価格×工数×段取りの係数化ノウハウ",
    "value_link": "例）一次受注の勝率↑→余剰時間が売上に直結"
  },
  "strength_2": {
    "claim": "例）地域ネットワークを束ねる中立性",
    "evidence": "例）同業3社の相互支援実績（工程融通/再加工）",
    "why_unique": "例）自社で抱え込まない方針と信用履歴",
    "value_link": "例）共同で72時間以内に案件を始動できる"
  },
  "strength_3": {
    "claim": "例）ノーサーバでも回せる立ち上げ力",
    "evidence": "例）PWA＋QR＋CSVで1週間運用開始",
    "why_unique": "例）紙併存OKの情報設計（学習コスト極小）",
    "value_link": "例）導入障壁が低く参加工場が増える"
  },
  "pest_p": {
    "facts": "例）電子帳簿保存法／IT導入・ものづくり補助金／グリーン調達",
    "opps": "例）証跡PDFの標準化需要／補助金で導入費実質負担↓",
    "threats": "例）制度改定の追随コスト／取引データ管理規律",
    "horizon": "例）短期：証憑PDF整備／中期：公的API(仮)"
  },
  "pest_e": {
    "facts": "例）原材料高止まり／為替・金利変動",
    "opps": "例）仕掛滞留↓で資金繰り改善／取りこぼし削減で粗利↑",
    "threats": "例）需要変動で稼働率↓／価格転嫁の遅れ",
    "horizon": "例）短期：短納期比率↑／中期：サブスク安定収益"
  },
  "pest_s": {
    "facts": "例）人手不足／働き方改革／地域共助の機運",
    "opps": "例）省手間の受容性↑／若手採用の訴求素材に",
    "threats": "例）デジタル忌避層の抵抗／教育コスト",
    "horizon": "例）短期：紙併存テンプレ／中期：デジタル前提化"
  },
  "pest_t": {
    "facts": "例）スマホ高性能化／低価格ラベルプリンタ／RPA/ノーコード",
    "opps": "例）QRでロット追跡／CSV→APIの段階移行",
    "threats": "例）端末多様性／電波不安定",
    "horizon": "例）短期：PWA＋CSV／中期：MES/EDI(仮)"
  },
  "ff_new": {
    "strength": "例）3（参入容易／現場適合設計は難）",
    "drivers": "例）安価クラウド／運用慣性／短納期需要↑",
    "moves": "例）短納期×小ロット特化／地域アライアンス先行",
    "metrics": "例）導入工場数／継続率／短納期成約率"
  },
  "ff_sup": {
    "strength": "例）2（プリンタ・ラベル・端末の代替多）",
    "drivers": "例）消耗品価格／端末相性／供給安定性",
    "moves": "例）推奨機材リスト／一括購入割引の紹介",
    "metrics": "例）機材初期費の回収月数"
  },
  "ff_riv": {
    "strength": "例）4（ERP/MES/汎用SaaS多数）",
    "drivers": "例）機能過多vs適合／価格／導入コンサル依存",
    "moves": "例）QR×CSV×PDFのみで初日稼働／写真検査テンプレ",
    "metrics": "例）初回スキャン→初回着手まで（目標72h）"
  },
  "ff_buy": {
    "strength": "例）4（買い手の交渉力強い）",
    "drivers": "例）相見積／無料ツール",
    "moves": "例）バイヤー無料・手数料5%・72h回答SLA",
    "metrics": "例）72h見積回答率／受注単価中央値"
  },
  "ff_sub": {
    "strength": "例）3（Excel＋チャット＋電話で代替）",
    "drivers": "例）属人化でも回る文化／外注仲介",
    "moves": "例）紙併存テンプレ／CSV一括集約の時短効果可視化",
    "metrics": "例）紙→QR置換率／CSV取込回数"
  },
  "q1_whyus": {
    "story": "例）短納期見積ノウハウ×地域融通ネットワーク＝余剰時間の現金化",
    "fit": "例）変えすぎない導入と祖業の強みが一致"
  },
  "q2_whose": {
    "persona": "例）設計ベンチャー/保全部門：『1〜20個を今月中に』が頻発",
    "needs": "例）見積が遅い／外注の当たり外れ／検査・証跡のバラつき"
  },
  "q3_idea": {
    "details": "例）72h見積→QR指示→写真検査PDF→納品（PWA／バイヤー無料）",
    "scope": "例）受発注/工程/検査/書類のみ。会計/人事は対象外（将来連携）"
  },
  "q4_onlyus": {
    "assets": "例）地域工場の信頼関係／短納期係数化テンプレ／導入手順",
    "moat": "例）7日導入・紙併存の運用ノウハウ×共同受注の事例蓄積"
  },
  "q5_success": {
    "good": "例）稼働率↑・リードタイム↓・取りこぼし↓・やり直し率↓",
    "bad": "例）標準化vs柔軟性のトレードオフ／データ標準保守"
  },
  "q6_market": {
    "tam_sam_som": "式）TAM＝工場数×(月間短納期/社)×平均単価×12\n例）TAM(仮)：10万社×2×12万円×12＝2,880億円/年\n式）SAM＝対象地域の工場数×…\n例）SAM(仮)：1.5万社×2×12万×12＝432億円/年\n式）SOM（初年度）＝参加工場数×(月間案件/社)×平均単価×12\n例）SOM(仮)：50社×1.5×12万円×12＝1.08億円/年",
    "assumptions": "前提）案件は1〜20個、平均単価12万円（試作・治具含む）／地域工場数は統計で置換"
  },
  "q7_comp": {
    "players": "例）見積プラットフォーム／ERP/MES／地域仲介（人ベース）",
    "diff": "例）短納期×小ロット×写真検査PDF特化／初日稼働（QR/CSV/PDF）"
  },
  "q8_bm": {
    "formula": "式）売上＝サブスク（月1万円×席数）＋手数料(5%×GMV)\n例）50工場×1席＝50万円/月＋(GMV：50×1.5×12万円＝900万円→5%=45万円)＝**95万円/月**",
    "unit": "式）ARPU ≒ 1万円＋(1.5×12万円×5%=9千円)＝**1.9万円/月**\n式）LTV ≒ ARPU×継続月数×粗利率0.8 → 1.9万×24×0.8＝**36.48万円**\n式）CAC ≒ 15万円 → 回収≒ **約8ヶ月**"
  },
  "q9_team": {
    "roles": "例）PdM1／FE1（PWA）／オンボ1（現場導入）／CS1（一次問合せ）",
    "gaps": "例）地域アライアンス形成／データ標準化担当"
  },
  "q10_budget": {
    "capex": "例）初期CAPEX：PWA/UI/QR/CSV **300–500万円**／導入テンプレ **50万円**／PoC **50万円**",
    "opex": "例）月次OPEX：人件(最小4名の一部)＋保守＋ドメイン等＝**約70万円/月** → MRR**95万円**で黒字化可"
  }
};

// 24ブロックの定義
const BLOCKS = [
  { key: 'roots', title: '自社のルーツ', subtitle: '創業から現在までの歴史',
    fields: [
      { key: 'when', label: 'いつ（年表）', type: 'textarea', required: true },
      { key: 'who', label: '誰が（人物）', type: 'textarea', required: true },
      { key: 'why', label: 'なぜ（動機・背景）', type: 'textarea', required: true },
      { key: 'what', label: '何を（行動・取り組み）', type: 'textarea', required: true },
      { key: 'goal_heritage', label: '継承すべき価値観', type: 'textarea', required: false }
    ]
  },
  { key: 'philosophy', title: '企業理念', subtitle: 'ミッション・ビジョン・バリュー',
    fields: [
      { key: 'mission', label: 'ミッション（使命・目的）', type: 'textarea', required: true },
      { key: 'vision', label: 'ビジョン（将来像・目標）', type: 'textarea', required: true },
      { key: 'values', label: 'バリュー（行動指針・価値観）', type: 'textarea', required: true },
      { key: 'manifestations', label: '理念の具現化（事例）', type: 'textarea', required: false },
      { key: 'interpretation', label: '理念の解釈・背景', type: 'textarea', required: false }
    ]
  },
  { key: 'strength_1', title: '真の強み #1', subtitle: '競合にない独自の強みを分析',
    fields: [
      { key: 'claim', label: '何が強みか', type: 'textarea', required: true },
      { key: 'evidence', label: '証拠・根拠', type: 'textarea', required: true },
      { key: 'why_unique', label: 'なぜ独自なのか', type: 'textarea', required: true },
      { key: 'value_link', label: '価値との連関', type: 'textarea', required: false }
    ]
  },
  { key: 'strength_2', title: '真の強み #2', subtitle: '競合にない独自の強みを分析',
    fields: [
      { key: 'claim', label: '何が強みか', type: 'textarea', required: true },
      { key: 'evidence', label: '証拠・根拠', type: 'textarea', required: true },
      { key: 'why_unique', label: 'なぜ独自なのか', type: 'textarea', required: true },
      { key: 'value_link', label: '価値との連関', type: 'textarea', required: false }
    ]
  },
  { key: 'strength_3', title: '真の強み #3', subtitle: '競合にない独自の強みを分析',
    fields: [
      { key: 'claim', label: '何が強みか', type: 'textarea', required: true },
      { key: 'evidence', label: '証拠・根拠', type: 'textarea', required: true },
      { key: 'why_unique', label: 'なぜ独自なのか', type: 'textarea', required: true },
      { key: 'value_link', label: '価値との連関', type: 'textarea', required: false }
    ]
  },
  { key: 'pest_p', title: 'PEST: Politics', subtitle: '政治的要因の分析',
    fields: [
      { key: 'facts', label: '政治的事実', type: 'textarea', required: true },
      { key: 'opps', label: '機会', type: 'textarea', required: true },
      { key: 'threats', label: '脅威', type: 'textarea', required: true },
      { key: 'horizon', label: '時間軸', type: 'textarea', required: false }
    ]
  },
  { key: 'pest_e', title: 'PEST: Economy', subtitle: '経済的要因の分析',
    fields: [
      { key: 'facts', label: '経済的事実', type: 'textarea', required: true },
      { key: 'opps', label: '機会', type: 'textarea', required: true },
      { key: 'threats', label: '脅威', type: 'textarea', required: true },
      { key: 'horizon', label: '時間軸', type: 'textarea', required: false }
    ]
  },
  { key: 'pest_s', title: 'PEST: Society', subtitle: '社会的要因の分析',
    fields: [
      { key: 'facts', label: '社会的事実', type: 'textarea', required: true },
      { key: 'opps', label: '機会', type: 'textarea', required: true },
      { key: 'threats', label: '脅威', type: 'textarea', required: true },
      { key: 'horizon', label: '時間軸', type: 'textarea', required: false }
    ]
  },
  { key: 'pest_t', title: 'PEST: Technology', subtitle: '技術的要因の分析',
    fields: [
      { key: 'facts', label: '技術的事実', type: 'textarea', required: true },
      { key: 'opps', label: '機会', type: 'textarea', required: true },
      { key: 'threats', label: '脅威', type: 'textarea', required: true },
      { key: 'horizon', label: '時間軸', type: 'textarea', required: false }
    ]
  },
  { key: 'ff_new', title: '5Forces: 新規参入', subtitle: '新規参入の脅威',
    fields: [
      { key: 'strength', label: '脅威の強度（1-5）', type: 'textarea', required: true },
      { key: 'drivers', label: '要因・ドライバー', type: 'textarea', required: true },
      { key: 'moves', label: '対応策', type: 'textarea', required: true },
      { key: 'metrics', label: '測定指標', type: 'textarea', required: false }
    ]
  },
  { key: 'ff_sup', title: '5Forces: 供給業者', subtitle: '供給業者の交渉力',
    fields: [
      { key: 'strength', label: '交渉力の強度（1-5）', type: 'textarea', required: true },
      { key: 'drivers', label: '要因・ドライバー', type: 'textarea', required: true },
      { key: 'moves', label: '対応策', type: 'textarea', required: true },
      { key: 'metrics', label: '測定指標', type: 'textarea', required: false }
    ]
  },
  { key: 'ff_riv', title: '5Forces: 既存競合', subtitle: '既存競合の脅威',
    fields: [
      { key: 'strength', label: '競争の激しさ（1-5）', type: 'textarea', required: true },
      { key: 'drivers', label: '要因・ドライバー', type: 'textarea', required: true },
      { key: 'moves', label: '対応策', type: 'textarea', required: true },
      { key: 'metrics', label: '測定指標', type: 'textarea', required: false }
    ]
  },
  { key: 'ff_buy', title: '5Forces: 買い手', subtitle: '買い手の交渉力',
    fields: [
      { key: 'strength', label: '交渉力の強度（1-5）', type: 'textarea', required: true },
      { key: 'drivers', label: '要因・ドライバー', type: 'textarea', required: true },
      { key: 'moves', label: '対応策', type: 'textarea', required: true },
      { key: 'metrics', label: '測定指標', type: 'textarea', required: false }
    ]
  },
  { key: 'ff_sub', title: '5Forces: 代替品', subtitle: '代替品の脅威',
    fields: [
      { key: 'strength', label: '脅威の強度（1-5）', type: 'textarea', required: true },
      { key: 'drivers', label: '要因・ドライバー', type: 'textarea', required: true },
      { key: 'moves', label: '対応策', type: 'textarea', required: true },
      { key: 'metrics', label: '測定指標', type: 'textarea', required: false }
    ]
  },
  { key: 'q1_whyus', title: '1. なぜ自社がやるのか', subtitle: '自社が取り組む理由',
    fields: [
      { key: 'story', label: 'ストーリー・背景', type: 'textarea', required: true },
      { key: 'fit', label: '自社との適合性', type: 'textarea', required: true }
    ]
  },
  { key: 'q2_whose', title: '2. 誰のどんなニーズか', subtitle: 'ターゲット顧客のニーズ',
    fields: [
      { key: 'persona', label: 'ペルソナ（誰が）', type: 'textarea', required: true },
      { key: 'needs', label: 'ニーズ（何を求める）', type: 'textarea', required: true }
    ]
  },
  { key: 'q3_idea', title: '3. 具体的アイデア', subtitle: '事業の具体的内容',
    fields: [
      { key: 'details', label: '詳細内容', type: 'textarea', required: true },
      { key: 'scope', label: 'スコープ（対象・非対象）', type: 'textarea', required: true }
    ]
  },
  { key: 'q4_onlyus', title: '4. なぜ自社だけ可能', subtitle: '独自性と参入障壁',
    fields: [
      { key: 'assets', label: '自社の資産・強み', type: 'textarea', required: true },
      { key: 'moat', label: '参入障壁・堀', type: 'textarea', required: true }
    ]
  },
  { key: 'q5_success', title: '5. 成功後と次課題', subtitle: '成功時の実現と課題',
    fields: [
      { key: 'good', label: '成功時の実現', type: 'textarea', required: true },
      { key: 'bad', label: '次の課題・リスク', type: 'textarea', required: true }
    ]
  },
  { key: 'q6_market', title: '6. 市場規模', subtitle: 'TAM・SAM・SOMの算出',
    fields: [
      { key: 'tam_sam_som', label: 'TAM・SAM・SOM（式と例）', type: 'textarea', required: true },
      { key: 'assumptions', label: '前提条件', type: 'textarea', required: true }
    ]
  },
  { key: 'q7_comp', title: '7. 競合', subtitle: '競合他社と差別化',
    fields: [
      { key: 'players', label: '競合プレイヤー', type: 'textarea', required: true },
      { key: 'diff', label: '差別化ポイント', type: 'textarea', required: true }
    ]
  },
  { key: 'q8_bm', title: '8. ビジネスモデル', subtitle: '収益構造とユニット経済',
    fields: [
      { key: 'formula', label: '収益式と例', type: 'textarea', required: true },
      { key: 'unit', label: 'ユニット経済（ARPU・LTV・CAC）', type: 'textarea', required: true }
    ]
  },
  { key: 'q9_team', title: '9. チーム', subtitle: 'チーム編成と人材',
    fields: [
      { key: 'roles', label: '役割・ポジション', type: 'textarea', required: true },
      { key: 'gaps', label: '不足・ギャップ', type: 'textarea', required: true }
    ]
  },
  { key: 'q10_budget', title: '10. 必要資金', subtitle: '初期投資と運営費',
    fields: [
      { key: 'capex', label: '初期投資（CAPEX）', type: 'textarea', required: true },
      { key: 'opex', label: '運営費（OPEX）', type: 'textarea', required: true }
    ]
  }
];

// AI コンパニオン・ヘッダー
const AI_COMPANION_HEADER = `<!-- AI_COMPANION_BEGIN -->
# Role
あなたは「中小製造・アトツギ新規事業の設計に強いベンチャービルダー／財務モデラ／オペ設計者」です。日本語で、厳密・実務的・短文・数値優先で助言します。

# Mission
以下の「ユーザー下書き（24ブロック）」を、(1)欠落の特定と補強、(2)矛盾ゼロの一貫性、(3)7日で動ける具体アクション、(4)器への貼り戻し用JSON差分、の4点を満たす"仕上がり"に変換する。

# Inputs
- 本文：24ブロック（ルーツ／理念／強み#1-3／PEST P/E/S/T／5FORCES×5／新事業10問）
- DoD（最小完了条件）:
  - roots: 主要年代3点＋各項目になぜ1行
  - philosophy: M/V/Bすべて記入＋事例3件
  - strengths(#1-3): 主張＋エビデンス（固有名詞or数値）＋独自性＋価値連関
  - PEST(P/E/S/T): 事実3・機会2・脅威2・時間軸
  - 5FORCES(新/売/競/買/代): 強度(1-5)＋根拠＋打ち手2＋指標
  - Q1..Q10: それぞれの設問に対し最小でも3行の具体（数値/固有名詞1つ以上）

# Hard Rules
- 出力は**日本語**。箇条書きは**各点1–2行**。数値・単位・式を明示。推定は **(仮)** を付ける。
- **内的推論は表示しない**（ステップや思考過程は出さない）。**結論だけ**を指定フォーマットで出力。
- 事実が欠落している場合は**質問を最小限**にまとめ、**回収手段**（誰から・どこで・所要時間）も同時に示す。
- 範囲外（会計/人事など）は**出力するが"非対象/将来連携"と明示**。
- 同じ内容を繰り返さない。曖昧語は避け、**測れる表現**に置換。

# Method (内部で行う。表示しない)
1) DoDに基づき各ブロックの充足率を算定→欠落を特定。  
2) ブロックごとに要約/補強/矛盾/次アクションを生成。  
3) 横断整合：市場(Q6)↔BM(Q8)↔資金(Q10)、PEST/5F↔強み/アイデアを検算。  
4) 反映しやすい \`JSON_PATCH\` を作る（空欄は触らない、追加・修正のみ）。

# Output Format（この順・この見出しで厳守）
## EXEC_SUMMARY
- 事業要約（1行）
- 強みの核（1行）
- コア顧客と最重要ジョブ（1行）
- 提供価値（1行）
- 先行KPI（3つ）
- 今週やること（3つ）

## GAP_TABLE
| BlockKey | 欠落(箇条書き) | 追加質問(最大8) | 推奨回収手段(誰/どこ/所要) |

## BLOCKS
### <1. 自社のルーツ>
- SYNTHESIS(3)
- ENHANCE(3)
- RISKS/CONFLICTS(≤2)
- NEXT_7D(≤3)
### <2. 企業理念>
…（同形式で #1〜#24 まで繰り返し）

## CONSISTENCY_CHECKS
- 市場↔BM↔資金：式と値の整合（例：GMV/月＝参加工場×月間案件×平均単価、手数料＝GMV×率）
- PEST/5F ↔ 強み/アイデア：矛盾の有無と修正案
- 用語・定義：短納期=72h、小ロット=1–20個 等の統一
- 成功基準：先行KPI→財務KPIへの論理接続

## JSON_PATCH
\`\`\`json
{
  "blocks": {
    "<blockKey>": { "<questionId>": "追記/修正テキスト..." }
  }
}
\`\`\`

## NEXT_STEPS_PACK
- 7日以内：具体タスク(担当/所要/アウトプット)
- 30日以内：検証計画(仮説/指標/合否ライン)
- 90日以内：拡張(顧客/地域/機能)

END_OF_REPORT

<!-- AI_COMPANION_END -->

`;

const STORAGE_KEY = 'deepdive:v3';

function DeepDive() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentBlock, setCurrentBlock] = useState(0);
  const [data, setData] = useState({
    meta: { companyName: '', author: '', updatedAt: '', version: 'v3' },
    blocks: {}
  });

  // ローカルストレージからデータ読み込み
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setData(parsed);
      } catch (e) {
        console.error('Failed to parse saved data:', e);
      }
    }
  }, []);

  // データの自動保存
  const saveData = (newData) => {
    const updatedData = {
      ...newData,
      meta: {
        ...newData.meta,
        updatedAt: new Date().toISOString()
      }
    };
    setData(updatedData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
  };

  // フィールド値の取得
  const getFieldValue = (blockKey, fieldKey) => {
    return data.blocks[blockKey]?.[fieldKey] || '';
  };

  // フィールド値の更新
  const updateField = (blockKey, fieldKey, value) => {
    const newData = {
      ...data,
      blocks: {
        ...data.blocks,
        [blockKey]: {
          ...data.blocks[blockKey],
          [fieldKey]: value
        }
      }
    };
    saveData(newData);
  };

  // メタ情報の更新
  const updateMeta = (key, value) => {
    const newData = {
      ...data,
      meta: {
        ...data.meta,
        [key]: value
      }
    };
    saveData(newData);
  };

  // DoD判定（Definition of Done）
  const calculateCompletionScore = (block) => {
    const requiredFields = block.fields.filter(f => f.required);
    const completedFields = requiredFields.filter(f => {
      const value = getFieldValue(block.key, f.key);
      return value && value.trim().length > 10; // 最低10文字
    });
    
    if (requiredFields.length === 0) return 100;
    
    const inputtedFields = requiredFields.filter(f => {
      const value = getFieldValue(block.key, f.key);
      return value && value.trim().length > 0; // 何か入力されている
    });
    
    if (inputtedFields.length === 0) return 0; // 未入力
    if (completedFields.length === requiredFields.length) return 100; // 完了
    
    // 入力済みだが不完全な場合は25-75%の範囲
    const baseScore = 25;
    const progressScore = (completedFields.length / requiredFields.length) * 50;
    return Math.round(baseScore + progressScore);
  };

  // 全体の完成度計算
  const calculateOverallCompletion = () => {
    const scores = BLOCKS.map(block => calculateCompletionScore(block));
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  };

  // Markdownエクスポート（AI相談用・プロンプト付き）
  const exportMarkdown = () => {
    let md = AI_COMPANION_HEADER + '\n\n';
    md += `# 事業深掘り分析\n\n`;
    md += `**会社名**: ${data.meta.companyName || '（未入力）'}\n`;
    md += `**作成者**: ${data.meta.author || '（未入力）'}\n`;
    md += `**更新日**: ${data.meta.updatedAt ? new Date(data.meta.updatedAt).toLocaleString() : '（未更新）'}\n\n`;

    BLOCKS.forEach(block => {
      md += `## ${block.title}\n\n`;
      block.fields.forEach(field => {
        const value = getFieldValue(block.key, field.key);
        md += `### ${field.label}\n`;
        md += value ? `${value}\n\n` : '（未入力）\n\n';
      });
    });

    return md;
  };

  // Docエクスポート（Word文書形式・HTML）
  const exportDoc = () => {
    let html = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>事業深掘り分析書</title>
    <style>
        body { font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif; line-height: 1.6; margin: 40px; }
        h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
        h2 { color: #34495e; margin-top: 30px; border-left: 4px solid #3498db; padding-left: 10px; }
        h3 { color: #2c3e50; margin-top: 20px; }
        .meta-info { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 30px; }
        .subtitle { color: #7f8c8d; font-style: italic; margin-bottom: 10px; }
        .content { margin-bottom: 15px; padding: 10px; background-color: #ffffff; border-left: 3px solid #ecf0f1; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #bdc3c7; color: #7f8c8d; font-size: 12px; text-align: center; }
    </style>
</head>
<body>
    <h1>事業深掘り分析書</h1>
    
    <div class="meta-info">
        <p><strong>会社名：</strong> ${data.meta.companyName || '（未入力）'}</p>
        <p><strong>作成者：</strong> ${data.meta.author || '（未入力）'}</p>
        <p><strong>作成日：</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>最終更新：</strong> ${data.meta.updatedAt ? new Date(data.meta.updatedAt).toLocaleString() : '（未更新）'}</p>
    </div>
`;

    BLOCKS.forEach((block, index) => {
      html += `    <h2>${index + 1}. ${block.title}</h2>
    <div class="subtitle">${block.subtitle}</div>
`;
      
      block.fields.forEach(field => {
        const value = getFieldValue(block.key, field.key);
        html += `    <h3>${field.label}</h3>
    <div class="content">`;
        if (value && value.trim()) {
          // HTML用にエスケープ
          const escapedValue = value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\\n/g, '<br>');
          html += escapedValue;
        } else {
          html += '（未入力）';
        }
        html += `</div>
`;
      });
    });

    html += `    <div class="footer">
        <p>※このドキュメントは深掘り分析システムで生成されました</p>
    </div>
</body>
</html>`;

    return html;
  };


  // ダウンロード処理
  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // クリップボードにコピー
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('クリップボードにコピーしました');
    } catch (err) {
      console.error('Copy failed:', err);
      // フォールバック
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('クリップボードにコピーしました');
    }
  };

  // 中断処理
  const handlePause = () => {
    const md = exportMarkdown();
    copyToClipboard(md);
    downloadFile(md, `deepdive-${Date.now()}.md`, 'text/markdown');
  };

  // ナビゲーション
  const goToBlock = (index) => {
    setCurrentBlock(Math.max(0, Math.min(BLOCKS.length - 1, index)));
  };

  const currentBlockData = BLOCKS[currentBlock];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-colors"
      >
        🔍 深掘りを開始
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* ヘッダー */}
        <div className="bg-gray-50 border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">🔍 深掘りウィザード</h2>
            <p className="text-sm text-gray-600">完成度: {calculateOverallCompletion().toFixed(1)}%</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePause}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm"
            >
              ⏸️ 中断する
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* メタ情報 */}
        <div className="bg-blue-50 px-6 py-3 border-b">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">会社名</label>
              <input
                type="text"
                value={data.meta.companyName}
                onChange={(e) => updateMeta('companyName', e.target.value)}
                className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm"
                placeholder="株式会社〇〇"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">作成者</label>
              <input
                type="text"
                value={data.meta.author}
                onChange={(e) => updateMeta('author', e.target.value)}
                className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm"
                placeholder="山田太郎"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* サイドナビ */}
          <div className="w-80 bg-gray-50 border-r overflow-y-auto">
            <div className="p-4">
              <h3 className="font-medium text-gray-900 mb-4">ブロック ({currentBlock + 1}/{BLOCKS.length})</h3>
              <div className="space-y-2">
                {BLOCKS.map((block, index) => {
                  const completion = calculateCompletionScore(block);
                  return (
                    <button
                      key={block.key}
                      onClick={() => goToBlock(index)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                        index === currentBlock
                          ? 'bg-blue-100 text-blue-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{block.title}</span>
                        <div className="flex items-center gap-1">
                          {completion === 100 ? '✅' : completion > 0 ? '📝' : '⏳'}
                          <span className="text-xs">
                            {completion === 0 ? '未入力' : completion === 100 ? '完了' : `入力済み`}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                        <div
                          className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${completion}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* メインコンテンツ */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="bg-white border-b px-6 py-4">
              <h3 className="text-xl font-bold text-gray-900">{currentBlockData.title}</h3>
              <p className="text-gray-600">{currentBlockData.subtitle}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {currentBlockData.fields.map(field => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <textarea
                      rows={6}
                      value={getFieldValue(currentBlockData.key, field.key)}
                      onChange={(e) => updateField(currentBlockData.key, field.key, e.target.value)}
                      placeholder={PLACEHOLDERS[currentBlockData.key]?.[field.key] || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* フッター */}
            <div className="bg-gray-50 border-t px-6 py-4 flex justify-between items-center">
              <div className="flex gap-2">
                <button
                  onClick={() => downloadFile(exportDoc(), `深掘り分析書-${Date.now()}.doc`, 'application/msword')}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  📄 Word文書
                </button>
                <button
                  onClick={() => downloadFile(exportMarkdown(), `AI相談パック-${Date.now()}.md`, 'text/markdown')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  🤖 AI相談パック
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => goToBlock(currentBlock - 1)}
                  disabled={currentBlock === 0}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← 前へ
                </button>
                <button
                  onClick={() => goToBlock(currentBlock + 1)}
                  disabled={currentBlock === BLOCKS.length - 1}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  次へ →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeepDive;