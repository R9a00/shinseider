#!/usr/bin/env python3
"""
シンセイダー誘導面 静的サイトビルダー
=====================================
data/*.yaml（正本）→ site/dist/ の静的HTML。

公開ゲートのビルド組込み:
- 全ページのフッターにビルド日時とデータ最終確認日を自動表示
- confidence が verified 以外のフィールドには「最終確認前」バッジを必ず付ける
  （バッジなしで unreviewed データを表示するテンプレートを書けない構造にする）
- サイト全体に PREVIEW バナー（公開ゲート6項目クリアまで externally 公開しない）
"""
import datetime as dt
import json
import subprocess
from pathlib import Path

import yaml
from jinja2 import Environment, FileSystemLoader, select_autoescape

ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT / "site"
DIST = SITE / "dist"

PREVIEW = True  # 公開ゲート6項目クリアで False にする


def load(name):
    with open(ROOT / "data" / name, encoding="utf-8") as f:
        return yaml.safe_load(f)


def git_log(n=12):
    try:
        out = subprocess.run(
            ["git", "log", f"-{n}", "--date=short", "--pretty=%ad\t%s"],
            cwd=ROOT, capture_output=True, text=True, check=True).stdout
        return [dict(zip(("date", "subject"), l.split("\t", 1))) for l in out.strip().splitlines()]
    except Exception:
        return []


def collect_confidence_stats(obj, stats=None):
    """データ木からconfidence値を集計（信頼面ページ用）"""
    if stats is None:
        stats = {}
    if isinstance(obj, dict):
        c = obj.get("confidence")
        if isinstance(c, str):
            stats[c] = stats.get(c, 0) + 1
        for v in obj.values():
            collect_confidence_stats(v, stats)
    elif isinstance(obj, list):
        for v in obj:
            collect_confidence_stats(v, stats)
    return stats


# 都道府県タイル地図（列,行）。地理の近似でよい（押す場所の案内が目的）
PREF_GRID = {
    # 北海道・東北（右上の階段）
    "北海道": (12, 1), "青森県": (11, 2), "秋田県": (10, 3), "岩手県": (11, 3),
    "山形県": (10, 4), "宮城県": (11, 4), "新潟県": (9, 5), "福島県": (10, 5),
    # 本州の背骨（中部〜関東の帯）
    "石川県": (6, 6), "富山県": (7, 6), "長野県": (8, 6), "群馬県": (9, 6), "栃木県": (10, 6), "茨城県": (11, 6),
    "福井県": (6, 7), "岐阜県": (7, 7), "山梨県": (8, 7), "埼玉県": (9, 7), "東京都": (10, 7), "千葉県": (11, 7),
    # 山陰〜近畿〜東海の帯
    "島根県": (2, 8), "鳥取県": (3, 8), "兵庫県": (4, 8), "京都府": (5, 8), "滋賀県": (6, 8),
    "愛知県": (7, 8), "静岡県": (8, 8), "神奈川県": (10, 8),
    # 山陽〜近畿南部
    "山口県": (1, 9), "広島県": (2, 9), "岡山県": (3, 9), "大阪府": (5, 9), "奈良県": (6, 9), "三重県": (7, 9),
    # 北九州〜四国〜紀伊
    "福岡県": (1, 10), "大分県": (2, 10), "愛媛県": (3, 10), "香川県": (4, 10), "徳島県": (5, 10), "和歌山県": (6, 10),
    # 九州南部と高知
    "佐賀県": (1, 11), "熊本県": (2, 11), "宮崎県": (3, 11), "高知県": (4, 11),
    "長崎県": (1, 12), "鹿児島県": (2, 12),
    # 沖縄（1行あけて左下に離す）
    "沖縄県": (1, 14),
}
REGIONS = [
    # 大会の地方大会ブロック区分（経済産業局の管轄に一致）。
    # 根拠: 第6回関東ブロック決勝進出=山梨・静岡・東京、ブロック賞は「関東経済産業局長賞」
    # （kyodonewsprwire.jp/release/202601263015）。中部ブロックに石川の受賞者（202601232954）。
    ("北海道・東北", ["北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県"]),
    ("関東", ["茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
              "新潟県", "山梨県", "長野県", "静岡県"]),
    ("中部", ["富山県", "石川県", "岐阜県", "愛知県", "三重県"]),
    ("近畿", ["福井県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県"]),
    ("中国・四国", ["鳥取県", "島根県", "岡山県", "広島県", "山口県", "徳島県", "香川県", "愛媛県", "高知県"]),
    ("九州・沖縄", ["福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"]),
]


def group_by_region(people):
    """人のリストを地域→県→人に組む（載っている県だけ）"""
    return [
        {"name": name, "prefs": [
            {"pref": p, "people": [a for a in people if a["pref"] == p]}
            for p in prefs if any(a["pref"] == p for a in people)
        ]}
        for name, prefs in REGIONS
        if any(a["pref"] in prefs for a in people)
    ]


def koshien_badge(result):
    """出場歴の表示クラス: gp=グランプリ / prize=受賞 / final=決勝出場 / semi=準 / reg=地方大会"""
    if "グランプリ" in result or "大臣賞" in result:
        return "gp"
    if "準ファイナリスト" in result:
        return "semi"
    if "地方大会" in result:
        return "reg"
    if "賞" in result:
        return "prize"
    return "final"


PREF_BY_CODE = {
    1: "北海道", 2: "青森県", 3: "岩手県", 4: "宮城県", 5: "秋田県", 6: "山形県", 7: "福島県",
    8: "茨城県", 9: "栃木県", 10: "群馬県", 11: "埼玉県", 12: "千葉県", 13: "東京都", 14: "神奈川県",
    15: "新潟県", 16: "富山県", 17: "石川県", 18: "福井県", 19: "山梨県", 20: "長野県", 21: "岐阜県",
    22: "静岡県", 23: "愛知県", 24: "三重県", 25: "滋賀県", 26: "京都府", 27: "大阪府", 28: "兵庫県",
    29: "奈良県", 30: "和歌山県", 31: "鳥取県", 32: "島根県", 33: "岡山県", 34: "広島県", 35: "山口県",
    36: "徳島県", 37: "香川県", 38: "愛媛県", 39: "高知県", 40: "福岡県", 41: "佐賀県", 42: "長崎県",
    43: "熊本県", 44: "大分県", 45: "宮崎県", 46: "鹿児島県", 47: "沖縄県",
}


def build_japan_svg(has_prefs):
    """日本地図SVG（geolonia/japanese-prefectures map-polygon, GFDL）を読み、
    アンバサダーのいる県をリンク化して返す。色はCSSに任せる。

    原典は南西諸島を本州北西の海上に斜めに並べる構図（境界線2本で区切る）。
    全県同色なら成立するが、当サイトは在任県を濃色にするため、鹿児島の
    トカラ・奄美が沖縄のすぐ隣に濃色で浮かび「沖縄がずれている」ように読める。
    そこで構図だけ組み替える（形状データは無加工・手描き座標は使わない）:
      1. 境界線2本を除去
      2. 鹿児島のうち北西海上に転置されていた離島7個（トカラ・奄美ほか）を省略
         （本土と種子・屋久・甑島は実位置のまま残る）
      3. 沖縄県は左上に移動し、細枠+「沖縄県」で通常の囲み表示にする
    """
    import xml.etree.ElementTree as ET
    NS = "http://www.w3.org/2000/svg"
    ET.register_namespace("", NS)
    tree = ET.parse(SITE / "static" / "japan-map.svg")
    root = tree.getroot()

    svg_map = root.find(f"{{{NS}}}g[@class='svg-map']")
    # 1. 斜め構図用の境界線を除去
    boundary = svg_map.find(f"{{{NS}}}g[@class='boundary-line']")
    assert boundary is not None, "japan-map.svg: boundary-line が見つからない（原典が変わった）"
    svg_map.remove(boundary)

    prefs_g = svg_map.find(f"{{{NS}}}g[@class='prefectures']")
    # 2. 鹿児島の転置離島（文書順で9〜15個目のpolygon）を省略
    kago = next(g for g in prefs_g if "kagoshima" in (g.get("class") or ""))
    kago_polys = [el for el in kago if el.tag == f"{{{NS}}}polygon"]
    assert len(kago_polys) == 15, f"鹿児島のpolygonが{len(kago_polys)}個（15のはず）— 原典が変わったので転置離島の位置を再測定すること"
    for el in kago_polys[8:]:  # 実測: 8個目までが本土・種子屋久・甑島、以降が北西海上のトカラ・奄美
        kago.remove(el)

    # 3. 沖縄県を左上の囲みへ移動し、1.25倍で描く（島が小さく、等倍では読めないため。
    #    囲み内の拡大は一般的な地図の作法）。
    #    実測: 沖縄のグループ内容はローカル(0,0)-(309,133)。親の matrix(s=1.028807) を挟むので
    #    最終座標 = s*(k*local + translate + (6,18)) + (-47.544,-28.807)。
    #    k=1.25, translate(71.32,41.12) → 内容は最終(32,32)-(430,203)、枠(14,14,420,206)に収まる。
    oki = next(g for g in prefs_g if "okinawa" in (g.get("class") or ""))
    assert oki.get("transform") == "translate(52.000000, 193.000000)", "沖縄のtransformが想定と違う — 原典が変わったので移動量を再計算すること"
    oki.set("transform", "translate(71.32, 41.12) scale(1.25)")

    frame = ET.SubElement(root, f"{{{NS}}}g", {"class": "inset"})
    ET.SubElement(frame, f"{{{NS}}}rect", {"x": "14", "y": "14", "width": "420", "height": "206", "class": "inset-frame"})
    label = ET.SubElement(frame, f"{{{NS}}}text", {"x": "422", "y": "204", "text-anchor": "end", "class": "inset-label"})
    label.text = "沖縄県"

    def walk(parent):
        for i, child in enumerate(list(parent)):
            code = child.get("data-code")
            if code is not None and "prefecture" in (child.get("class") or ""):
                pref = PREF_BY_CODE[int(code)]
                for attr in ("fill", "stroke", "stroke-width"):
                    child.attrib.pop(attr, None)
                if pref in has_prefs:
                    child.set("class", child.get("class") + " has")
                    a = ET.Element(f"{{{NS}}}a", {"href": f"#p-{pref}"})
                    parent.remove(child)
                    a.append(child)
                    parent.insert(i, a)
            else:
                walk(child)

    walk(root)
    return ET.tostring(root, encoding="unicode")


WEEKDAY_JA = ["月", "火", "水", "木", "金", "土", "日"]


def events_ctx(ev_data, news_data):
    """「動き」ページ: 時系列リスト+月グリッド+カレンダー登録リンク。
    月グリッドはシーズン範囲（2026-08〜2027-02）を全部プリレンダし、表示切替はクライアント側"""
    import calendar as calmod
    import urllib.parse

    events = []
    for e in ev_data["events"]:
        d0 = dt.date.fromisoformat(str(e["start"]))
        d1 = dt.date.fromisoformat(str(e.get("end", e["start"])))
        wd = f"{WEEKDAY_JA[d0.weekday()]}"
        if d1 != d0:
            date_disp = f"{d0.month}/{d0.day}（{wd}）〜{d1.month}/{d1.day}（{WEEKDAY_JA[d1.weekday()]}）"
        else:
            date_disp = f"{d0.month}/{d0.day}（{wd}）"
        # Googleカレンダー登録リンク（終日形式・時刻はタイトルに含める。個人情報は載せない）
        gtitle = e["title"] + ("（" + e["time"] + "）" if e.get("time") else "") + "｜アトツギ甲子園"
        q = urllib.parse.urlencode({
            "action": "TEMPLATE",
            "text": gtitle,
            "dates": d0.strftime("%Y%m%d") + "/" + (d1 + dt.timedelta(days=1)).strftime("%Y%m%d"),
            "details": "出典: " + e["source_url"],
            "location": e.get("venue", e.get("format", "")),
        })
        events.append({**e, "d0": d0.isoformat(), "date_disp": date_disp,
                       "past": d1 < dt.date.today(),  # ビルド時点の判定。閲覧時はJSが再判定
                       "gcal_url": "https://calendar.google.com/calendar/render?" + q})

    by_date = {}
    for e in events:
        d = dt.date.fromisoformat(e["d0"])
        d1 = dt.date.fromisoformat(str(e.get("end", e["start"])))
        while d <= d1:
            by_date.setdefault(d, []).append(e)
            d += dt.timedelta(days=1)

    cal = calmod.Calendar(firstweekday=6)  # 日曜はじまり
    months, (y, m) = [], (2026, 8)
    while (y, m) <= (2027, 2):
        weeks = [[{"day": d.day, "in_month": d.month == m, "iso": d.isoformat(),
                   "events": by_date.get(d, []) if d.month == m else []}
                  for d in wk]
                 for wk in cal.monthdatescalendar(y, m)]
        months.append({"y": y, "m": m, "weeks": weeks})
        y, m = (y + 1, 1) if m == 12 else (y, m + 1)

    news = sorted(news_data["items"], key=lambda n: n["date"], reverse=True)
    return {"events": events, "months": months, "news": news, "ev_note": ev_data["meta"]["note"]}


def build_ics(ev_data):
    """主要日程の .ics（終日形式・時刻はタイトルに併記。今日以降のみ）"""
    today = dt.date.today()
    stamp = dt.datetime.now(dt.timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    lines = ["BEGIN:VCALENDAR", "VERSION:2.0",
             "PRODID:-//shinseider//koshien7//JA", "CALSCALE:GREGORIAN"]
    def esc(s):
        return s.replace("\\", "\\\\").replace(",", "\\,").replace(";", "\\;")
    for e in ev_data["events"]:
        d0 = dt.date.fromisoformat(str(e["start"]))
        d1 = dt.date.fromisoformat(str(e.get("end", e["start"])))
        if d1 < today:
            continue
        title = e["title"] + ("（" + e["time"] + "）" if e.get("time") else "") + "｜アトツギ甲子園"
        lines += ["BEGIN:VEVENT",
                  f"UID:{e['id']}-r7@shinseider",
                  f"DTSTAMP:{stamp}",
                  f"DTSTART;VALUE=DATE:{d0.strftime('%Y%m%d')}",
                  f"DTEND;VALUE=DATE:{(d1 + dt.timedelta(days=1)).strftime('%Y%m%d')}",
                  f"SUMMARY:{esc(title)}",
                  f"DESCRIPTION:{esc('出典: ' + e['source_url'])}"]
        if e.get("venue"):
            lines.append(f"LOCATION:{esc(e['venue'])}")
        lines.append("END:VEVENT")
    lines.append("END:VCALENDAR")
    return "\r\n".join(lines) + "\r\n"


def ambassadors_ctx(amb):
    cur_round = amb["meta"]["current_round"]
    people = amb["people"]
    for p in people:
        for k in p.get("koshien", []):
            k["badge"] = koshien_badge(k["result"])
    current = [p for p in people if cur_round in p["terms"]]
    alumni = [p for p in people if cur_round not in p["terms"]]
    rounds = {r["round"]: r for r in amb["meta"]["rounds"]}
    return {
        "meta": amb["meta"],
        "cur": rounds[cur_round],
        "past_rounds": [r for r in amb["meta"]["rounds"] if r["round"] != cur_round],
        "regions": group_by_region(current),
        "alumni_regions": group_by_region(alumni),
        "alumni_count": len(alumni),
        "jmap_svg": build_japan_svg({a["pref"] for a in current}),
    }


def main():
    import urllib.parse
    subsidy = load("jigyo_shokei_ma.yaml")["subsidy"]
    benefit = load("atotsugi_benefit_map.yaml")
    lineage = load("policy_lineage.yaml")
    entry_def = load("koshien_entry.yaml")
    amb = load("ambassadors.yaml")
    fukabori = load("fukabori.yaml")
    ev_data = load("events.yaml")
    news_data = load("news.yaml")

    env = Environment(
        loader=FileSystemLoader(SITE / "templates"),
        autoescape=select_autoescape(["html"]),
        trim_blocks=True, lstrip_blocks=True,
    )
    env.globals.update({
        "preview": PREVIEW,
        "built_at": dt.datetime.now(dt.timezone(dt.timedelta(hours=9))).strftime("%Y-%m-%d %H:%M JST"),
        "site_name": "シンセイダー",
    })

    DIST.mkdir(parents=True, exist_ok=True)
    (DIST / "static").mkdir(exist_ok=True)
    # CSS/JSコピー
    for f in (SITE / "static").glob("*"):
        (DIST / "static" / f.name).write_bytes(f.read_bytes())

    track = next(t for t in subsidy["tracks"] if t["id"] == "succession_promotion")
    entry_end = benefit["event"]["schedule"]["entry_period"]["end"]  # ISO文字列

    # 補助金ページの一覧: 制度（subsidy_directory）×優遇段階（benefit_ladderが正）を結合
    def perks_for(sid):
        return [
            {"stage": step["label"], "effect": u["effect"]}
            for step in benefit["benefit_ladder"]
            for u in step.get("unlocks", [])
            if u.get("subsidy_id") == sid
        ]
    subsidy_rows = [{**e, "perks": perks_for(e["id"])} for e in benefit["subsidy_directory"]]
    assert all(r["perks"] for r in subsidy_rows), "directoryの制度がladderに見当たらない"
    env.globals["entry_deadline"] = entry_end  # ヘッダーの締切チップ用（全ページ）

    # インタビュー指示文: テーマ×要素（旧システム53項目の蒸留）をデータから組み立てる
    theme_lines = [
        f"{i}. {s['title']} — " + "／".join(s["elements"])
        for i, s in enumerate(entry_def["entry_sections"], 1)
    ]
    prompt_text = entry_def["prompt_template"].replace("{theme_elements}", "\n".join(theme_lines))
    # プリフィルURLが長すぎるとAI側で受け取れない・途中で切れる。上限8000字を超えたらビルドを止める
    for t in entry_def["ai_targets"]:
        if t.get("mode") == "prefill":
            _u = t["url"].replace("{prompt}", urllib.parse.quote(prompt_text))
            assert len(_u) <= 8000, f"プリフィルURLが上限超過({len(_u)}字): {t['id']}。prompt_templateを圧縮すること"

    # 「間に合うか」メッセージと逆算プラン（データ駆動）
    pace = entry_def["pace"]
    env.globals["pace_json"] = json.dumps({
        "entry_deadline": entry_end,
        "submit_target": pace["submit_target"],
        "buckets": sorted(pace["buckets"], key=lambda b: -b["min_days"]),
        "closed_message": pace["closed_message"],
    }, ensure_ascii=False).replace("<", "\\u003c")

    # 適合チェック用データ（YAML→JSON埋め込み。ロジックのフロント直書きをしない）
    check_data = {
        "birth_cutoff": "1987-04-01",
        "entry_deadline": entry_end,
        "requirements": [
            {"id": r["id"], "label": r["label"], "severity": r["severity"]}
            for r in subsidy["requirements"]["items"]
        ],
    }
    # JSONをscriptタグへ安全に埋め込む: autoescapeを外す代わりに < をエスケープ
    env.globals["check_json"] = json.dumps(check_data, ensure_ascii=False).replace("<", "\\u003c")

    pages = {
        "index.html": ("index.html", {
            "benefit": benefit, "subsidy": subsidy, "track": track,
            "entry_end": entry_end,
        }),
        "workspace.html": ("workspace.html", {"entry_end": entry_end, "entry_total": len(entry_def["entry_sections"])}),
        "schedule.html": ("schedule.html", {}),
        "cool.html": ("cool.html", {}),
        "entry.html": ("entry.html", {
            "sections": entry_def["entry_sections"],
            "checklist": entry_def["checklist"],
            "prompt_text": prompt_text,
            "sample": entry_def["sample_entry"],
            "ai_targets": [
                {**t, "url_filled": t["url"].replace("{prompt}", urllib.parse.quote(prompt_text))}
                for t in entry_def["ai_targets"]
            ],
            # プリフィルURLが長すぎるとAI側で受け取れない（8000字を上限とする。超えたらビルドを止める）
            "entry_json": json.dumps({
                "sections": [{"id": s["id"], "title": s["title"]} for s in entry_def["entry_sections"]],
                "validation": entry_def["validation"],
                "prompt": prompt_text,
                "review_prompt": entry_def["review_prompt_template"],
            }, ensure_ascii=False).replace("<", "\\u003c"),
        }),
        "fukabori.html": ("fukabori.html", {
            "groups": fukabori["groups"],
            "ai_targets": entry_def["ai_targets"],
            # 器の定義はgroupsから生成して指示文に埋め込む（単一ソース）
            "fk_prompts_json": json.dumps({
                "interview": fukabori["interview_prompt"].replace("{structure}", "\n".join(
                    f"- {b['key']}「{b['title']}」: " + " / ".join(
                        f"{f['key']}={f['label']}" + ("" if f.get("required") else "(任意)")
                        for f in b["fields"])
                    for g in fukabori["groups"] for b in g["blocks"])),
                "critique": fukabori["companion_prompt"],
            }, ensure_ascii=False),
        }),
        "subsidy.html": ("subsidy.html", {"s": subsidy, "track": track,
                                          "subsidy_rows": subsidy_rows,
                                          "benefit_notes": benefit["conditions_and_notes"],
                                          "benefit_src": benefit["provenance"][0]}),
        "check.html": ("check.html", {}),
        # 信頼面: 内部語彙（confidence値・git生ログ）は出さず、人の言葉の更新履歴のみ
        "trust.html": ("trust.html", {
            "updates": load("site_updates.yaml")["updates"],
            "datasets": load("site_sources.yaml")["datasets"],
        }),
        "about.html": ("about.html", {}),
        "ambassadors.html": ("ambassadors.html", ambassadors_ctx(amb)),
        "news.html": ("news.html", events_ctx(ev_data, news_data)),
    }
    # 古いビルドの残骸を掃除（定義にないHTMLをdistに残さない）
    for stale in DIST.glob("*.html"):
        if stale.name not in pages:
            stale.unlink()
            print("removed stale", stale.name)

    (DIST / "koshien7.ics").write_text(build_ics(ev_data), encoding="utf-8")

    for out, (tpl, ctx) in pages.items():
        ctx.setdefault("page", out.rsplit(".", 1)[0])  # ナビの現在地表示用
        (DIST / out).write_text(env.get_template(tpl).render(**ctx), encoding="utf-8")
        print("built", out)

    print(f"→ {DIST}")


if __name__ == "__main__":
    main()
