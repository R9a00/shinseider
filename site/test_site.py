#!/usr/bin/env python3
"""サイトの回帰テスト: ビルド → 語彙リーク検査 → 動作検査。
公開ゲートのE2E項目の実体。`python3 site/test_site.py` で全部走る。"""
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "site" / "dist"

# 画面に出てはいけない語彙
LEAK_WORDS = [
    # 内部状態（品質機構の語彙）
    "最終確認前", "confidence", "verified", "extracted_unreviewed", "unconfirmed",
    "REVIEW REQUIRED", "公開品質ゲート",
    # 設計語彙（読者の言葉ではない）
    "解錠", "逆引き", "ステータスの階段", "Tier",
    "世界の現実", "事実の系譜", "政策の末端", "ドメイン", "作戦室",
]
PAGES = ["index", "workspace", "check", "entry", "schedule", "cool", "subsidy", "trust", "about", "ambassadors", "news"]

SAMPLE_ENTRY = """## 現業と自分
金属加工の会社で営業を5年やっています。年商3億円、従業員20名。
## 現場で感じている課題
熟練の職人がこの3年で4人退職。求人応募は今年ゼロでした。
## やりたい新規事業
地域の町工場向けに、段取りノウハウを共有できるサービスを作りたい。
## 家業の経営資源の活用
50年分の加工ノウハウと、地域200社との取引網を使います。
## 実現したい未来
若手が集まる工場にして、地域の加工業を残す。
"""


def main():
    subprocess.run([sys.executable, str(ROOT / "site" / "build.py")], check=True, capture_output=True)
    from playwright.sync_api import sync_playwright

    failures = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={"width": 1280, "height": 900})
        errors = []
        pg.on("pageerror", lambda e: errors.append(str(e)))

        # 1. 語彙リーク検査（表示テキストに対して）
        for name in PAGES:
            pg.goto(f"file://{DIST}/{name}.html")
            body = pg.inner_text("body")
            for w in LEAK_WORDS:
                if w in body:
                    failures.append(f"語彙リーク {name}: {w}")

        # 2a. 適合チェック: 必須のQ1・Q2だけで判定できる（補助金質問は任意）
        pg.goto(f"file://{DIST}/check.html")
        pg.check("input[name=q_age][value=yes]"); pg.check("input[name=q_pos][value=yes]")
        pg.click("button[type=submit]")
        pg.wait_for_selector("#result:not([hidden])", timeout=8000)
        r = pg.inner_text("#result")
        if "アトツギ甲子園" not in r:
            failures.append("最小回答で甲子園判定が出ない")
        if "未回答のままで大丈夫" not in r:
            failures.append("任意未回答の案内が出ない")

        # 2b. 全回答 → 保存 → 準備室で復元
        pg.goto(f"file://{DIST}/check.html")
        pg.check("input[name=q_age][value=yes]"); pg.check("input[name=q_pos][value=yes]")
        pg.check("input[name=q_succ][value=yes]");
        pg.click("button[type=submit]")
        pg.wait_for_selector("#result:not([hidden])", timeout=8000)
        if "進み具合" not in pg.inner_text("#result"):
            failures.append("チェック結果に進み具合ページへの導線がない")
        pg.goto(f"file://{DIST}/workspace.html")
        try:
            pg.wait_for_selector("#ws-status:not([hidden])", timeout=5000)
            if "適合の見込み" not in pg.inner_text("#ws-status-text"):
                failures.append("準備室の現在地表示が不正")
        except Exception:
            failures.append("準備室で前回チェックが復元されない")

        # 3. エントリー文づくり: 貼り戻し → 取り込み → 検証 → 復元 → 作戦室に進捗
        pg.goto(f"file://{DIST}/entry.html")
        if "## 現業と自分" not in pg.inner_text("#entry-data") and "現業と自分" not in pg.content():
            failures.append("エントリーページにプロンプト定義がない")
        ai_btns = pg.eval_on_selector_all(".ai-card .ai-head", "els => els.map(e => e.textContent.trim())")
        for want in ["Claude", "ChatGPT", "Gemini", "Grok"]:
            if not any(want in t for t in ai_btns):
                failures.append(f"AIボタンに{want}がない: {ai_btns}")
        # 指示文の透明性: 全文がページ内で確認できる
        pv = pg.inner_text("#prompt-view")
        if "現業と自分" not in pg.eval_on_selector("#prompt-view pre", "el => el.textContent"):
            failures.append("指示文の全文表示がない")
        # Geminiカード: クリックで実際に新しいタブが開く（ポップアップブロック回帰の検査）
        # 注: この砂場ではclaude.ai等はプロキシ遮断でウィンドウ自体が実体化しないため、
        #     実体化するGeminiのカードを明示的に押す（検査対象は「同期openか」であり宛先ではない）
        try:
            with pg.expect_popup(timeout=5000) as pop:
                pg.click('.ai-card[data-open*="gemini"]')
            # この環境は外部ネットワーク遮断のため到達先URLは検証しない。
            # 「新規タブが開くこと」自体がポップアップブロック回帰の検査対象。
            pop.value.close()
        except Exception as e:
            failures.append(f"Geminiカードで新規タブが開かない: {type(e).__name__}")
        pg.fill("#paste-area", SAMPLE_ENTRY)
        pg.click("#import-btn")
        msg = pg.inner_text("#import-msg")
        if "5件" not in msg or "そろいました" not in msg:
            failures.append(f"貼り戻し取り込みが不正: {msg}")
        statuses = pg.eval_on_selector_all(".sec-status", "els => els.map(e => e.textContent)")
        if any("未入力" in s for s in statuses):
            failures.append(f"取り込み後も未入力セクションがある: {statuses}")
        # 予行審査: 骨子入りの審査員プロンプトがコピーできる（骨子が空でないので成功パス）
        pg.click("#copy-review")
        try:
            pg.wait_for_function("document.getElementById('review-msg').textContent.length > 0", timeout=5000)
        except Exception:
            failures.append("予行審査ボタンの応答がない")

        # リロードして復元確認
        pg.reload()
        first_text = pg.eval_on_selector(".entry-section .sec-text", "el => el.value")
        if "金属加工" not in first_text:
            failures.append("エントリー骨子がリロード後に復元されない")
        # 準備室に進捗が出る
        pg.goto(f"file://{DIST}/workspace.html")
        ws_entry = pg.inner_text("#ws-entry-text")
        if "5/5" not in ws_entry:
            failures.append(f"準備室のエントリー進捗が不正: {ws_entry}")

        # 3.5 ナビ: 現在地表示
        pg.goto(f"file://{DIST}/subsidy.html")
        on_txt = pg.eval_on_selector("nav a.on", "el => el.textContent") if pg.query_selector("nav a.on") else None
        if on_txt != "補助金":
            failures.append(f"ナビの現在地表示が不正: {on_txt}")

        # 4. カウントダウン（トップは軽く、プランは出さない）
        pg.goto(f"file://{DIST}/index.html")
        days = pg.inner_text("#countdown-days")
        if not (days.isdigit() and 0 < int(days) < 200):
            failures.append(f"カウントダウン異常: {days}")
        if pg.query_selector("#pace-plan"):
            failures.append("トップに逆算プランが出ている（道筋ページへ分離したはず）")
        if not pg.query_selector('a[href="schedule.html"]'):
            failures.append("トップから道筋ページへの導線がない")
        for door in ["cool.html", "check.html", "subsidy.html"]:
            if not pg.query_selector(f'a[href="{door}"]'):
                failures.append(f"トップの入り口に{door}への導線がない")
        # 5. 道筋ページ: 間に合うかメッセージ＋日付入りプラン
        pg.goto(f"file://{DIST}/schedule.html")
        pace_msg = pg.inner_text("#pace-message")
        if "間に合" not in pace_msg:
            failures.append(f"道筋ページのメッセージが不正: {pace_msg}")
        plan_items = pg.eval_on_selector_all("#pace-plan li", "els => els.length")
        if plan_items < 3:
            failures.append(f"逆算プランの項目が少ない: {plan_items}")
        # エントリーページの状況メッセージ（1行のみ）
        pg.goto(f"file://{DIST}/entry.html")
        if "間に合" not in pg.inner_text("#pace-message"):
            failures.append("エントリーページに間に合うかメッセージがない")

        if errors:
            failures.append(f"JSエラー: {errors}")
        b.close()

    if failures:
        print("NG:")
        for f in failures:
            print(" -", f)
        return 1
    print(f"OK: {len(PAGES)}ページ / リークなし / チェック保存・復元 / カウントダウン {days}日")
    return 0


if __name__ == "__main__":
    sys.exit(main())
