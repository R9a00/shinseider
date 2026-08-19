"""シンセイダーMCPサーバー PoC

サイト(data/*.yaml)を単一の正本とし、資格判定・締切・逆算プラン・質問バンク・
ワークスペース管理をLLMクライアントへ提供する。判定はサイトのJS実装と同一仕様。

進行モデル: 概要ファースト。深掘り(質問バンク)は利用者が要望したときだけ。
質問バンクは裏の座標系(①絞り出し ②執筆 ③DRの3方向で同じ体系を使う)。
"""
from __future__ import annotations

import json
import pathlib
import re
from datetime import datetime, timedelta, timezone

import yaml
from mcp.server import MCPServer

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
STATE_FILE = pathlib.Path(__file__).resolve().parent / ".state.json"
JST = timezone(timedelta(hours=9))

entry_def = yaml.safe_load((DATA / "koshien_entry.yaml").read_text())
benefit = yaml.safe_load((DATA / "atotsugi_benefit_map.yaml").read_text())
bank = yaml.safe_load((DATA / "question_bank.yaml").read_text())
subsidy = yaml.safe_load((DATA / "jigyo_shokei_ma.yaml").read_text())
ambassadors = yaml.safe_load((DATA / "ambassadors.yaml").read_text())
fukabori = yaml.safe_load((DATA / "fukabori.yaml").read_text())

SCHEDULE = benefit["event"]["schedule"]
ENTRY_END = datetime.fromisoformat(str(SCHEDULE["entry_period"]["end"]))
DOCS_END = datetime.fromisoformat(str(SCHEDULE["document_deadline"]["value"]))
PACE = entry_def["pace"]

DISCLAIMER = (
    "※非公式ツール「シンセイダー」の簡易判定です。"
    "適用可否は各制度の公募要領原文が常に優先します。"
)

app = MCPServer(
    name="shinseider",
    title="シンセイダー — アトツギ甲子園の準備室",
    instructions=(
        "アトツギ甲子園への挑戦と申請準備を支援する非公式・無償ツール。"
        "数値・期日は必ず get_deadlines / resources から取り、自前知識で答えないこと。"
        "進行は『概要をまとめる』が既定。質問バンクの深掘りは利用者が要望したときだけ。"
        "出典のない数字は（仮）と明示する。"
        "対話では、自明な事実は入力されたまま記録して聞き返し、非自明な主張は否定でなく"
        "客観的で賢い質問で根拠を引き出す。忖度はしない。正しいものは理由を添えて明確に肯定する"
        "（詳細は質問バンクのdialogue_policy）。"
    ),
)


# ---------- 締切・ペース ----------

def _now() -> datetime:
    return datetime.now(JST)


def _days_left_jst(deadline: datetime) -> int:
    return (deadline.date() - _now().date()).days


def _stage() -> str:
    now = _now()
    if now <= ENTRY_END:
        return "open"
    if now <= DOCS_END:
        return "docs_only"
    return "closed"


@app.tool()
def get_deadlines() -> dict:
    """アトツギ甲子園の二段階締切（エントリー登録／書類提出）と現在の段階・残日数を返す。
    期日に関する質問には必ずこのツールの値で答えること。"""
    stage = _stage()
    days = max(0, _days_left_jst(ENTRY_END))
    if stage == "open":
        pace_msg = next(
            (b["message"] for b in sorted(PACE["check_buckets"], key=lambda b: -b["min_days"])
             if days >= b["min_days"]), "")
    elif stage == "docs_only":
        pace_msg = PACE["closed_message_docs"]
    else:
        pace_msg = PACE["closed_message"]
    return {
        "entry_deadline": ENTRY_END.isoformat(),
        "document_deadline": DOCS_END.isoformat(),
        "stage": stage,
        "days_to_entry": days if stage == "open" else 0,
        "message": pace_msg,
        "note": "煽る対象はエントリー登録。登録さえ済めば書類提出まで約2日ある。",
        "provenance": SCHEDULE["entry_period"].get("provenance"),
        "disclaimer": DISCLAIMER,
    }


@app.tool()
def check_eligibility(
    born_1987_04_or_later: bool,
    position: str,
    sme_status: str,
    succession_within_5y: str | None = None,
) -> dict:
    """アトツギ甲子園のエントリー資格をサイトの30秒チェックと同一ロジックで判定する。
    position: successor(家業があり代表ではない) / other_company_rep(別法人代表だが承継予定・経営資源活用あり) / neither
    sme_status: yes(中小企業にあてはまる) / unsure / no
    succession_within_5y: yes / undecided / no / None（補助金の見立て。任意）"""
    ok = born_1987_04_or_later and position in ("successor", "other_company_rep") and sme_status != "no"
    if ok and sme_status == "yes":
        verdict = "エントリー資格を満たしています"
        detail = ""
    elif ok:
        verdict = "エントリー資格に適合の見込み"
        detail = ("年齢と立場は要件に合っています。残る確認は、家業が中小企業の定義に"
                  "あてはまるかどうかです。現在の代表に会社のことを聞く良い機会になります。")
    else:
        verdict = "資格要件に合わない可能性"
        detail = "年齢・立場・企業規模の要件は公式のエントリー要領で必ず確認してください（例外や詳細条件があります）。"
    result = {"verdict": verdict, "detail": detail, "sme_hint": (
        "目安（中小企業基本法）: 製造業・建設業・運輸業などは資本金3億円以下または従業員300人以下、"
        "卸売業は1億円以下または100人以下、サービス業は5,000万円以下または100人以下、"
        "小売業は5,000万円以下または50人以下。") if sme_status == "unsure" else None}
    if succession_within_5y == "yes":
        result["subsidy_outlook"] = "事業承継・M&A補助金〈促進枠〉の主要な入口要件を満たしそうです。認定支援機関への相談と投資内容の具体化が次の一歩。"
    elif succession_within_5y == "undecided":
        result["subsidy_outlook"] = "この補助金は『5年以内の承継』を決めないと使えません。甲子園への挑戦は、その話を始めるきっかけと締切になります。"
    elif succession_within_5y == "no":
        result["subsidy_outlook"] = "促進枠は対象外の見込み（承継予定が前提の制度のため）。"
    result["disclaimer"] = DISCLAIMER
    return result


@app.tool()
def get_pace_plan() -> dict:
    """今日から始めた場合の逆算プラン（サイトの「間に合うか」と同一ロジック）を返す。"""
    stage = _stage()
    if stage != "open":
        return {"stage": stage, "message": PACE["closed_message_docs"] if stage == "docs_only" else PACE["closed_message"],
                "disclaimer": DISCLAIMER}
    now = _now()
    days = _days_left_jst(ENTRY_END)
    bucket = next((b["message"] for b in sorted(PACE["buckets"], key=lambda b: -b["min_days"])
                   if days >= b["min_days"]), "")
    target = datetime.fromisoformat(PACE["submit_target"] + "T23:59:00+09:00")
    d_t = max(1, (target.date() - now.date()).days)
    fmt = lambda d: f"{d.month}/{d.day}"
    plus = lambda n: now + timedelta(days=n)
    jround = lambda x: int(x + 0.5)  # JSのMath.roundと同一（.5切り上げ）
    if d_t <= 3:
        steps = [["今日", "AIとインタビューして骨子を作る"],
                 ["明日", "声に出して読み合わせ、現経営者に話す"],
                 [f"{fmt(target)}まで", "公式サイトから送信（締切は11/25 18:00）"]]
    else:
        steps = [
            [f"{fmt(plus(max(1, jround(d_t * 0.15))))}まで", "現経営者と、承継の話を始める（いちばん重い一歩）"],
            [f"{fmt(plus(jround(d_t * 0.5)))}まで", "AIとインタビューして骨子を作る"],
            [f"{fmt(plus(jround(d_t * 0.8)))}まで", "読み合わせて磨く。会社名でエントリーすることに合意をとる"],
            [f"{fmt(target)}まで", "公式サイトからエントリー（締切前日推奨）。書類は届くフォーマットで11/27 12:00までにPDF提出"],
        ]
    return {"days_to_entry": days, "message": bucket, "plan": steps, "disclaimer": DISCLAIMER}


# ---------- ワークスペース ----------

SECTIONS = {"profile": "profile.md", "outline": "outline.md", "entry_draft": "entry_draft.md"}


def _load_state() -> dict:
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text())
    return {}


def _ws() -> pathlib.Path:
    st = _load_state()
    if "workspace" not in st:
        raise ValueError("ワークスペース未作成です。先に workspace_init(path) を呼んでください。")
    return pathlib.Path(st["workspace"])


def _journal(ws: pathlib.Path, event: dict) -> None:
    event["ts"] = _now().isoformat()
    with (ws / "journal.jsonl").open("a") as f:
        f.write(json.dumps(event, ensure_ascii=False) + "\n")


@app.tool()
def workspace_init(path: str) -> dict:
    """作業フォルダを作成し、以後の記録先として登録する。pathは利用者に確認した絶対パス。
    既存フォルダを指定した場合は再開として扱い、現状の一覧を返す。"""
    ws = pathlib.Path(path).expanduser()
    for sub in ("materials", "fukabori", "review"):
        (ws / sub).mkdir(parents=True, exist_ok=True)
    STATE_FILE.write_text(json.dumps({"workspace": str(ws)}, ensure_ascii=False))
    _journal(ws, {"event": "init"})
    files = sorted(str(p.relative_to(ws)) for p in ws.rglob("*") if p.is_file())
    return {"workspace": str(ws), "files": files,
            "note": "profile/outline/entry_draft は workspace_record で記録。既存ファイルがあれば読み込んで文脈を復元すること。"}


@app.tool()
def workspace_record(section: str, content: str, mode: str = "replace") -> dict:
    """ワークスペースへ記録する。section: profile / outline / entry_draft /
    fukabori/<ブロックid> / review/<名前> / materials/<名前>。mode: replace / append。
    利用者の入力・確定事項・成果物は必ずここに記録し、会話にだけ残さないこと。"""
    ws = _ws()
    if section in SECTIONS:
        target = ws / SECTIONS[section]
    elif re.fullmatch(r"(fukabori|review|materials)/[\w\-\.ぁ-んァ-ヶ一-龠]+", section):
        target = ws / (section + ("" if "." in section.split("/")[1] else ".md"))
    else:
        raise ValueError(f"不正なsection: {section}")
    target.parent.mkdir(parents=True, exist_ok=True)
    if mode == "append" and target.exists():
        target.write_text(target.read_text() + "\n" + content)
    else:
        target.write_text(content)
    _journal(ws, {"event": "record", "section": section, "mode": mode, "chars": len(content)})
    return {"written": str(target), "chars": len(content)}


@app.tool()
def workspace_state() -> dict:
    """ワークスペースの現状（ファイル一覧・深掘り済みブロック・充足の概観）を返す。
    別の会話から再開するときは、まずこれを呼んで文脈を復元すること。"""
    ws = _ws()
    files = {str(p.relative_to(ws)): p.stat().st_size for p in ws.rglob("*") if p.is_file()}
    done_blocks = [p.stem for p in (ws / "fukabori").glob("*.md")]
    all_blocks = [b["id"] for b in bank["blocks"]]
    return {"workspace": str(ws), "files": files,
            "fukabori_done": done_blocks,
            "fukabori_untouched": [b for b in all_blocks if b not in done_blocks],
            "note": "未着手ブロックは深掘りの候補だが、利用者が要望したときだけ進めること。"}


# ---------- 質問バンク ----------

@app.tool()
def list_question_blocks(group: str | None = None) -> list[dict]:
    """質問バンクの一覧（id/グループ/タイトル/DoD/調査区分/写像）を返す。
    group: 足元 / 外部環境 / 競争構造 / 新事業10問（省略で全件）。"""
    return [
        {k: b[k] for k in ("id", "group", "title", "subtitle", "dod", "research",
                           "sources_required", "entry_themes", "review_axes")}
        for b in bank["blocks"] if group is None or b["group"] == group
    ]


@app.tool()
def get_question_block(block_id: str) -> dict:
    """指定ブロックの全フィールド（設問・必須・記入例）とDoDを返す。深掘り開始時に呼ぶ。"""
    for b in bank["blocks"]:
        if b["id"] == block_id:
            return b
    raise ValueError(f"ブロックが見つかりません: {block_id}")


@app.tool()
def fukabori_coverage(block_id: str, text: str) -> dict:
    """深掘り回答の機械チェック（DoDの数えられる部分のみ）。意味的な充足はLLMが
    get_question_block のDoDと照らして判断し、このツールの結果と合わせて報告する。"""
    block = get_question_block(block_id)
    lines = [ln for ln in text.splitlines() if ln.strip()]
    has_number = bool(re.search(r"\d", text))
    checks = {
        "行数3以上": len(lines) >= 3,
        "数値を含む": has_number,
        "出典の記載": (not block["sources_required"]) or bool(re.search(r"出典|出所|調べ|白書|統計|https?://", text)),
    }
    return {"block": block["title"], "dod": block["dod"], "checks": checks,
            "passed_mechanical": all(checks.values()),
            "note": "機械チェックのみ。DoDの意味的な充足（固有名詞・機会2脅威2など）はLLMが判断し、（仮）の数字が残っていれば指摘すること。"}


# ---------- Prompts ----------

def _dialogue_policy() -> str:
    """質問バンクの対話規律を、聞き出す系プロンプトの前置きとして描画する。"""
    pol = bank["dialogue_policy"]
    rules = "\n".join(f"- {r['rule']}" for r in pol["rules"])
    return (f"# 対話の規律（この規律がテーマ固有の指示より優先される）\n"
            f"{pol['fact_vs_interpretation']}\n{rules}\n\n")


@app.prompt()
def entry_interview() -> str:
    """エントリー文（申請書5テーマ）の骨子づくりインタビューを開始する。"""
    return _dialogue_policy() + entry_def["prompt_template"]


@app.prompt()
def mock_review(draft: str) -> str:
    """予行審査。審査委員視点・忖度なしでエントリー文の骨子を評価する。"""
    return entry_def["review_prompt_template"].replace("{draft}", draft)


@app.prompt()
def dr_review(draft: str) -> str:
    """DR: 申請書から質問バンクの各設問への答えが読み取れるかを、引用必須で照合する。"""
    lines = []
    for b in bank["blocks"]:
        lines.append(f"- {b['id']}: {b['title']}（期待される場所: {'・'.join(b['entry_themes'])} / 観点: {'・'.join(b['review_axes'])} / DoD: {b['dod']}）")
    checks = "\n".join(f"- {c['rule']}" for c in bank["cross_checks"])
    return f"""あなたは申請書のデザインレビュー担当です。忖度は不要です。
以下の申請書を、設問リストに対して照合してください。

# 判定ルール（厳守）
- 各設問について「申請書から答えが読み取れるか」を判定する。
- 読み取れると主張する場合は、必ず申請書から該当箇所を原文引用する。引用できなければ「読み取れない」とする。
- 「期待される場所」の段落を優先的に見るが、全文を対象とする。別の場所に書かれていれば所在を示す。
- 出典のない数値は（仮）扱いとして指摘する。

# 設問リスト
{chr(10).join(lines)}

# 横断整合（数字の検算）
{checks}

# 出力形式
1. 観点別サマリー（承継の物語/実現性/独自性/事業価値/波及ごとに、読み取れた設問数と最重要の欠落）
2. 設問別の判定表（読み取れる=引用 / 読み取れない=どこに何を足すか）
3. 横断整合の検算結果
4. 直すなら最初の一手（1つ）

---
{draft}"""


@app.prompt()
def fukabori_chapter(chapter_no: str) -> str:
    """フカボリの章別インタビュー（1=足元 2=外部環境 3=競争構造 4=新事業10問）。"""
    groups = fukabori["groups"]
    idx = int(chapter_no) - 1
    g = groups[idx]
    structure = "\n".join(f"- {b['title']}" for b in g["blocks"])
    return _dialogue_policy() + (fukabori["chapter_prompt"]
            .replace("{chapter_no}", str(chapter_no))
            .replace("{chapter_title}", g["title"])
            .replace("{structure}", structure))


# ---------- Resources ----------

@app.resource("shinseider://koshien/basics")
def koshien_basics() -> str:
    """アトツギ甲子園の基本（資格・二段階締切・日程・出典）"""
    return yaml.dump({
        "大会": "アトツギ甲子園（中小企業庁主催・39歳以下の後継予定者のピッチ大会）",
        "エントリー締切": str(SCHEDULE["entry_period"]["end"]),
        "書類提出締切": str(SCHEDULE["document_deadline"]["value"]),
        "schedule": SCHEDULE,
        "checklist": entry_def.get("checklist"),
        "免責": DISCLAIMER,
    }, allow_unicode=True, sort_keys=False)


@app.resource("shinseider://subsidy/shokei-ma")
def subsidy_resource() -> str:
    """事業承継・M&A補助金〈促進枠〉の要件・加点・審査観点（出典・取得日付き）"""
    return yaml.dump(subsidy["subsidy"], allow_unicode=True, sort_keys=False)


@app.resource("shinseider://consult")
def consult_resource() -> str:
    """相談できる人（アトツギ甲子園アンバサダー）"""
    return yaml.dump(ambassadors, allow_unicode=True, sort_keys=False)


@app.resource("shinseider://question-bank")
def bank_resource() -> str:
    """質問バンク全体（24ブロック78項目・DoD・写像・横断整合）"""
    return yaml.dump(bank, allow_unicode=True, sort_keys=False)


@app.resource("shinseider://about")
def about_resource() -> str:
    """運営者と方針（非公式・無償・原文優先）"""
    return (
        "シンセイダーは、中小企業庁が任命するアトツギ甲子園アンバサダーが運営する"
        "非公式・無償の申請支援ツールです。申請の成否・情報の完全性を保証するものではありません。"
        "必ずアトツギ甲子園公式（https://atotsugi-koshien.go.jp/）・各補助金の公募要領原文をご確認ください。"
        "掲載情報には取得日と出典を付記しています。"
    )


if __name__ == "__main__":
    app.run()
