#!/usr/bin/env python3
"""Build and test the real generated pages over HTTP with an isolated Chromium context."""
import functools
import http.server
import json
import subprocess
import sys
import threading
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / 'site' / 'dist'
LEAK_WORDS = ['最終確認前', 'confidence', 'verified', 'extracted_unreviewed',
              'unconfirmed', 'REVIEW REQUIRED', '公開品質ゲート', '解錠', '逆引き',
              'ステータスの階段', 'Tier', '世界の現実', '事実の系譜', '政策の末端', 'ドメイン', '作戦室']
PAGES = ['application', 'index', 'workspace', 'check', 'entry', 'schedule', 'cool', 'subsidy',
         'trust', 'about', 'ambassadors', 'news', 'fukabori']
SAMPLE_ENTRY = '''## 現業と自分
金属加工の会社で営業を5年やっています。年商3億円、従業員20名。
## 現場で感じている課題
熟練の職人がこの3年で4人退職。求人応募は今年ゼロでした。
## やりたい新規事業
地域の町工場向けに、段取りノウハウを共有できるサービスを作りたい。
## 家業の経営資源の活用
50年分の加工ノウハウと、地域200社との取引網を使います。
## 実現したい未来
若手が集まる工場にして、地域の加工業を残す。
'''
# Stable dates: the test remains meaningful after this year's deadline passes.
CLOCK = '''(() => {
  const NativeDate = Date, now = new NativeDate('2026-09-29T09:00:00+09:00').getTime();
  window.Date = class extends NativeDate {
    constructor(...args) { super(...(args.length ? args : [now])); }
    static now() { return now; }
  };
})();'''


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


def run(base):
    from playwright.sync_api import sync_playwright, expect
    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context(viewport={'width': 1280, 'height': 900},
                                      permissions=['clipboard-read', 'clipboard-write'])
        context.add_init_script(CLOCK)
        # No external AI requests or analytics during tests.
        context.route('**/*', lambda route: route.continue_() if route.request.url.startswith(base)
                      else route.fulfill(status=200, body=''))
        errors = []
        context.on('page', lambda page: page.on('pageerror', lambda e: errors.append(str(e))))
        pg = context.new_page()
        for name in PAGES:
            pg.goto(f'{base}/{name}.html')
            for word in LEAK_WORDS:
                assert word not in pg.inner_text('body'), f'{name}: {word}'
        print('PASS: 13 pages load without internal vocabulary')

        pg.goto(f'{base}/check.html')
        pg.check('input[name=q_age][value=yes]')
        pg.check('input[name=q_pos][value=yes]')
        pg.click('button[type=submit]')
        expect(pg.locator('#result')).to_be_hidden()  # Q3 is required.
        pg.check('input[name=q_sme][value=yes]')
        pg.click('button[type=submit]')
        expect(pg.locator('#result')).to_contain_text('年齢・立場・規模は適合の見込み')
        expect(pg.locator('#result')).to_contain_text('任意のQ4')
        expect(pg.locator('#result')).to_contain_text('保存済み')
        pg.goto(f'{base}/workspace.html')
        expect(pg.locator('#ws-status-text')).to_contain_text('年齢・立場・規模は適合の見込み')
        print('PASS: required Q3, optional Q4, diagnosis persistence')

        pg.goto(f'{base}/entry.html')
        guide = pg.locator('#official-preparation')
        expect(guide).to_contain_text('公式6記載項目への対応表')
        expect(guide).to_contain_text('本文7ページ＋表紙1ページ')
        expect(guide).to_contain_text('サンプルの使用は任意')
        expect(guide).to_contain_text('熱量・ストーリー')
        pg.locator('.sec-text').first.fill('架空の確認用1。' * 12)
        expect(pg.locator('.sec-status').first).to_contain_text('文字数・数字の目安を充足（内容は要確認）')
        pg.fill('#paste-area', SAMPLE_ENTRY)
        pg.click('#import-btn')
        expect(pg.locator('#import-msg')).to_contain_text('5つそろいました')
        expect(pg.locator('#save-msg')).to_contain_text('自動保存済み')
        pg.click('#copy-review')
        expect(pg.locator('#review-msg')).to_contain_text('コピーしました')
        review = pg.evaluate('navigator.clipboard.readText()')
        assert '金属加工' in review
        assert '承継予定の会社の経営資源活用' in review
        assert '{official_review_axes}' not in review
        with pg.expect_popup() as popup:
            pg.click('.ai-card[data-open*="gemini"]')
        popup.value.close()
        pg.reload()
        assert '金属加工' in pg.locator('.sec-text').first.input_value()
        with pg.expect_download() as download:
            pg.click('#dl-md')
        backup = Path(download.value.path()).read_bytes()
        assert b'"entry"' in backup
        pg.goto(f'{base}/workspace.html')
        expect(pg.locator('#ws-entry-text')).to_contain_text('5/5')
        print('PASS: import, clipboard, popup, reload, progress and backup export')

        pg.goto(f'{base}/entry.html')
        expect(pg.locator('#sprint')).to_contain_text('表紙＋本文7ページ')
        pg.click('#copy-sprint')
        expect(pg.locator('#copy-sprint')).to_contain_text('コピーしました')
        sprint = pg.evaluate('navigator.clipboard.readText()')
        assert '自分らしさ（アトツギとしての歩み）' in sprint and '熱量・ストーリー' in sprint
        assert '{official_items}' not in sprint and '割付は創作しない' in sprint
        with pg.expect_popup() as sprint_popup:
            pg.click('.ai-card[data-sprint-open*="gemini"]')
        sprint_popup.value.close()
        assert '自分らしさ' in pg.evaluate('navigator.clipboard.readText()')
        # 既存の5テーマの指示文は別のボタンのまま
        pg.click('#copy-prompt')
        assert '現業と自分' in pg.evaluate('navigator.clipboard.readText()')
        print('PASS: short-deadline prompt copies and opens separately from the five-theme prompt')

        # Two stale pages: unrelated fields merge, identical fields do not overwrite.
        a = context.new_page(); b = context.new_page()
        a.goto(f'{base}/entry.html'); b.goto(f'{base}/fukabori.html')
        a.locator('.sec-text').first.fill('タブAで更新した申請文')
        expect(a.locator('#save-msg')).to_contain_text('自動保存済み')
        b.locator('details.fk-group > summary').first.click()
        b.locator('.fk-text').first.fill('タブBで追加した来歴')
        expect(b.locator('#fk-save-msg')).to_contain_text('自動保存済み')
        a.reload()
        assert a.locator('.sec-text').first.input_value() == 'タブAで更新した申請文'
        b.reload()
        assert b.locator('.fk-text').first.input_value() == 'タブBで追加した来歴'
        c = context.new_page(); c.goto(f'{base}/entry.html')
        a.locator('.sec-text').first.fill('タブAの最新原稿')
        expect(a.locator('#save-msg')).to_contain_text('自動保存済み')
        c.locator('.sec-text').first.fill('タブCの競合原稿')
        expect(c.locator('#save-msg')).to_contain_text('別のタブで同じ項目')
        assert c.locator('.sec-text').first.input_value() == 'タブCの競合原稿'
        a.reload()
        assert a.locator('.sec-text').first.input_value() == 'タブAの最新原稿'
        print('PASS: multiple tabs preserve independent edits and reject conflicts')

        # Restore into a fresh context, not into a page with a conflicting history.
        restored = browser.new_context(accept_downloads=True)
        restored.add_init_script(CLOCK)
        restored.route('**/*', lambda route: route.continue_() if route.request.url.startswith(base) else route.fulfill(status=200, body=''))
        rp = restored.new_page(); rp.goto(f'{base}/entry.html')
        rp.set_input_files('#up-project', {'name': 'backup.md', 'mimeType': 'text/markdown', 'buffer': backup})
        expect(rp.locator('#save-msg')).to_contain_text('控えを読み込み、保存しました')
        rp.reload()
        assert '金属加工' in rp.locator('.sec-text').first.input_value()
        rp.set_input_files('#up-project', {'name': 'bad.json', 'mimeType': 'application/json',
                                          'buffer': b'{"entry":{"sections":7}}'})
        expect(rp.locator('#save-msg')).to_contain_text('データ形式')
        assert '金属加工' in rp.locator('.sec-text').first.input_value()
        restored.close()
        print('PASS: backup restore and malformed backup protection')

        failure_context = browser.new_context()
        failure_context.add_init_script(CLOCK)
        failure_context.route('**/*', lambda route: route.continue_() if route.request.url.startswith(base) else route.fulfill(status=200, body=''))
        failure_context.add_init_script("Storage.prototype.setItem = function(){ throw new DOMException('full', 'QuotaExceededError'); };")
        fp = failure_context.new_page()
        for name, field, status in [('entry', '.sec-text', '#save-msg'), ('fukabori', '.fk-text', '#fk-save-msg')]:
            fp.goto(f'{base}/{name}.html')
            if name == 'fukabori':
                fp.locator('details.fk-group > summary').first.click()
            fp.locator(field).first.fill('保存失敗でも残す入力')
            expect(fp.locator(status)).to_contain_text('未保存')
            expect(fp.locator(status)).not_to_contain_text('自動保存済み')
            assert fp.locator(field).first.input_value() == '保存失敗でも残す入力'
            # Accept leaving only this isolated synthetic test page.
            fp.once('dialog', lambda dialog: dialog.accept())
        fp.goto(f'{base}/check.html')
        for name in ['q_age', 'q_pos', 'q_sme']:
            fp.check(f'input[name={name}][value=yes]')
        fp.click('button[type=submit]')
        expect(fp.locator('#result')).to_contain_text('結果は未保存')
        expect(fp.locator('#result')).not_to_contain_text('保存済み')
        failure_context.close()
        print('PASS: storage failure is visible in all three forms')

        pg.goto(f'{base}/index.html')
        expect(pg.locator('#countdown-days')).to_have_text('57')
        expect(pg.locator('#late-banner')).to_be_hidden()  # 残り20日を超える時期は出さない
        pg.goto(f'{base}/schedule.html')
        assert pg.locator('#pace-message').inner_text().strip()
        assert pg.locator('#pace-plan li').count() >= 3
        expect(pg.locator('#late-facts .card')).to_have_count(9)
        expect(pg.locator('#late-facts')).to_contain_text('出し直し')
        expect(pg.locator('#late-facts')).to_contain_text('2026-11-12確認')
        pg.goto(f'{base}/entry.html')
        # The pace message belongs inside the expandable guide.
        pg.locator('details.prompt-view').first.locator('summary').click()
        expect(pg.locator('#pace-message')).to_be_visible()
        assert pg.locator('#pace-message').inner_text().strip()
        pg.goto(f'{base}/news.html')
        assert 'ビルド時点で終了していない日程' in pg.inner_text('body')
        assert '今日以降の全日程入り' not in pg.inner_text('body')
        pg.goto(f'{base}/subsidy.html')
        expect(pg.locator('nav a[aria-current=page]')).to_have_text('補助金')
        assert not errors, errors
        for stamp, stage in [('2026-11-24T09:00:00+09:00', 'open'),
                             ('2026-11-25T17:59:00+09:00', 'open'),
                             ('2026-11-25T18:01:00+09:00', 'docs'),
                             ('2026-11-27T12:01:00+09:00', 'closed')]:
            boundary = browser.new_context()
            boundary.add_init_script(CLOCK.replace('2026-09-29T09:00:00+09:00', stamp))
            boundary.route('**/*', lambda route: route.continue_() if route.request.url.startswith(base) else route.fulfill(status=200, body=''))
            bp = boundary.new_page(); bp.goto(f'{base}/schedule.html')
            if stage == 'open':
                text = bp.locator('#pace-plan').inner_text()
                assert '明日' not in text and '11/24まで' not in text
                assert '11/27 12:00' in text
                assert ('今日18:00まで' if '11-25' in stamp else '今日（推奨）') in text
                bp.goto(f'{base}/index.html')
                expect(bp.locator('#late-banner')).to_contain_text(
                    '本日18:00がエントリー締切です' if '11-25' in stamp else 'あと1日')
            else:
                expect(bp.locator('#pace-plan-wrap')).to_be_hidden()
                expect(bp.locator('#pace-message')).to_contain_text('書類' if stage == 'docs' else '受付は終了')
                bp.goto(f'{base}/index.html')
                if stage == 'docs':
                    expect(bp.locator('#late-banner')).to_contain_text('エントリー済みの方へ')
                    expect(bp.locator('#late-banner a')).to_have_attribute('href', 'entry.html')
                else:
                    expect(bp.locator('#late-banner')).to_be_hidden()
            boundary.close()
        print('PASS: 11/24, entry cutoff and document cutoff boundary plans')
        # 終盤の道筋: 登録が先、応募書類は連休で。日付ごとの切り替わりとトップの案内を確かめる。
        for stamp, count, label, message, banner in [
                ('2026-11-12T21:00:00+09:00', 5, '11/19（木）まで', '今からでも間に合います', 'あと13日'),
                ('2026-11-20T09:00:00+09:00', 4, '11/21〜23（連休）', 'まだ間に合います', 'あと5日'),
                ('2026-11-22T09:00:00+09:00', 4, '連休のうちに（〜11/23）', 'まだ間に合います', 'あと3日')]:
            late = browser.new_context()
            late.add_init_script(CLOCK.replace('2026-09-29T09:00:00+09:00', stamp))
            late.route('**/*', lambda route: route.continue_() if route.request.url.startswith(base) else route.fulfill(status=200, body=''))
            late_errors = []
            lp = late.new_page(); lp.on('pageerror', lambda e: late_errors.append(str(e)))
            lp.goto(f'{base}/schedule.html')
            expect(lp.locator('#pace-message')).to_contain_text(message)
            expect(lp.locator('#pace-plan li')).to_have_count(count)
            text = lp.locator('#pace-plan').inner_text()
            assert label in text and '11/27 12:00まで' in text and '明日' not in text, text
            assert text.index('会員登録') < text.index('つくる'), text
            expect(lp.locator('#pace-plan a[href="entry.html"]')).to_have_count(1)
            lp.goto(f'{base}/entry.html')
            lp.locator('details.prompt-view').first.locator('summary').click()
            expect(lp.locator('#pace-message')).to_contain_text(message)
            lp.goto(f'{base}/index.html')
            expect(lp.locator('#late-banner')).to_contain_text(banner)
            expect(lp.locator('#late-banner a')).to_have_attribute('href', 'schedule.html')
            assert not late_errors, late_errors
            late.close()
        print('PASS: late plans by date, registration before documents, top-page notice')
        browser.close()
        print('PASS: calendar description, fixed-date countdown, navigation, no JS errors')


def main():
    subprocess.run([sys.executable, str(ROOT / 'site' / 'build.py')], check=True)
    handler = functools.partial(QuietHandler, directory=str(DIST))
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True); thread.start()
    try:
        run(f'http://127.0.0.1:{server.server_port}')
    finally:
        server.shutdown(); server.server_close(); thread.join()
    print('OK: all site regression checks passed')
    return 0


if __name__ == '__main__':
    sys.exit(main())
