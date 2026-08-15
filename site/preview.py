#!/usr/bin/env python3
"""全ページを1枚に束ねた自己完結プレビューHTMLを生成する（チャット/レビュー共有用）。
本番のdistとは別物。ホスティング決定までの「URLの代わり」。
各ページは実物のヘッダー込みで映す（プレビュー固有の部品は上部の黒い目次と赤いラベルだけ）。"""
import base64
import datetime as dt
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "site" / "dist"
OUT = ROOT / "site" / "preview"

subprocess.run([sys.executable, str(ROOT / "site" / "build.py")], check=True, capture_output=True)

deadline = dt.datetime(2026, 11, 25, 18, 0, tzinfo=dt.timezone(dt.timedelta(hours=9)))
days = max(0, (deadline - dt.datetime.now(dt.timezone(dt.timedelta(hours=9)))).days + 1)

sections = [
    ("トップ", "index.html"),
    ("出られるか（30秒確認）", "check.html"),
    ("間に合うか（道筋）", "schedule.html"),
    ("出たくない理由", "cool.html"),
    ("エントリー文をつくる", "entry.html"),
    ("相談できる人（地域アンバサダー）", "ambassadors.html"),
    ("進み具合（試作）", "workspace.html"),
    ("日程と公式発表", "news.html"),
    ("補助金詳細", "subsidy.html"),
    ("情報の確かさ", "trust.html"),
    ("運営者と方針", "about.html"),
]

# 取りこぼし防止: distにあるページがプレビューに全部入っているか検査
_dist_pages = {p.name for p in DIST.glob("*.html")}
_preview_pages = {fn for _, fn in sections}
_missing = _dist_pages - _preview_pages
if _missing:
    raise SystemExit(f"プレビュー未収載のページがある: {sorted(_missing)} — sectionsに追加すること")

css = (DIST / "static" / "style.css").read_text(encoding="utf-8")
logo64 = base64.b64encode((DIST / "static" / "logo.png").read_bytes()).decode()


def to_anchors(s: str) -> str:
    """ページ間リンクをプレビュー内アンカーへ。適合チェックは準備室の埋め込みへ寄せる"""
    for _, f2 in sections:
        s = s.replace(f'href="{f2}"', f'href="#sec-{f2[:-5]}"')
    return s


parts = []
for label, fn in sections:
    html = (DIST / fn).read_text(encoding="utf-8")
    # 実物のヘッダー（ナビ・現在地・締切チップ込み）をそのまま映す
    head = re.search(r'<div class="site-head-wrap">.*?</header>\s*</div>', html, re.S).group(0)
    head = head.replace('src="static/logo.png"', f'src="data:image/png;base64,{logo64}"')
    m = re.search(r"<main>(.*?)</main>", html, re.S).group(1)
    # エントリー文と準備室は、実物と同じ動作にするため末尾のスクリプトも取り込む
    # （これを怠るとプレビューでGeminiボタン等が無反応になる＝実地で検出された問題）
    if fn in ("entry.html", "workspace.html", "news.html"):
        tail = html.split("</main>", 1)[1]
        for sc in re.findall(r"<script>.*?</script>", tail, re.S):
            m += sc
    body = head + "<main>" + m + "</main>"
    body = body.replace('id="countdown-days">—<', f'id="countdown-days">{days}<')
    body = re.sub(r'(class="days-left"[^>]*>)—</', rf"\g<1>{days}</", body)
    body = to_anchors(body)
    parts.append(
        f'<section class="pv-section" id="sec-{fn[:-5]}">'
        f'<div class="pv-label">{label}</div>{body}</section>'
    )

nav = "".join(
    f'<a href="#sec-{fn[:-5]}">{label.split("—")[0].strip()}</a>' for label, fn in sections
)
doc = f"""<!DOCTYPE html>
<html lang="ja"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>シンセイダー プレビュー（全ページ）</title>
<style>
{css}
.pv-topbar {{ position: sticky; top: 0; z-index: 100; background: #2b2926; color: #f5f1e8;
  padding: .5em 1em; font-size: .8rem; display: flex; gap: 1em; flex-wrap: wrap; align-items: baseline; }}
.pv-topbar a {{ color: #f0c9c5; text-decoration: none; }}
.pv-section {{ margin: 0 auto 3.5rem; }}
.pv-section .site-head-wrap {{ position: static; }} /* 束ねているため追従は切る（実物は追従） */
.pv-section main {{ display: block; }}
.pv-label {{ background: var(--accent); color: #fff; display: inline-block; font-size: .78rem;
  font-weight: 700; padding: .3em .9em; margin: 0 0 0 1rem; letter-spacing: .08em; }}
.pv-section main {{ padding-bottom: 3rem; }}
</style></head><body>
<div class="pv-topbar"><strong>プレビュー</strong>{nav}</div>
{"".join(f'{p}' for p in parts)}
<footer class="site-footer"><p>プレビュー（{dt.date.today()}生成）。各ページを実物のヘッダー込みで縦に並べています。実物ではヘッダーは画面上部に追従します。ページ間リンクはページ内アンカーに変換済み。</p></footer>
</body></html>"""

OUT.mkdir(exist_ok=True)
out_file = OUT / "shinseider_preview.html"
out_file.write_text(doc, encoding="utf-8")
print("→", out_file, f"({out_file.stat().st_size // 1024}KB)")
