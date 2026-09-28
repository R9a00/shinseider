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
PAGES = ['index', 'workspace', 'check', 'entry', 'schedule', 'cool', 'subsidy',
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
                      else route.fulfill(status=200, body='external page test placeholder'))
        errors = []
        context.on('page', lambda page: page.on('pageerror', lambda e: errors.append(str(e))))
        pg = context.new_page()
        for name in PAGES:
            pg.goto(f'{base}/{name}.html')
            for word in LEAK_WORDS:
                assert word not in pg.inner_text('body'), f'{name}: {word}'
        print('PASS: 12 pages load without internal vocabulary')

        pg.goto(f'{base}/check.html')
        pg.check('input[name=q_age][value=yes]')
        pg.check('input[name=q_pos][value=yes]')
        pg.click('button[type=submit]')
        expect(pg.locator('#result')).to_be_hidden()  # Q3 is required.
        pg.check('input[name=q_sme][value=yes]')
        pg.click('button[type=submit]')
        expect(pg.locator('#result')).to_contain_text('エントリー資格を満たしています')
        expect(pg.locator('#result')).to_contain_text('任意のQ4')
        expect(pg.locator('#result')).to_contain_text('保存済み')
        pg.goto(f'{base}/workspace.html')
        expect(pg.locator('#ws-status-text')).to_contain_text('エントリー資格を満たしています')
        print('PASS: required Q3, optional Q4, diagnosis persistence')

        pg.goto(f'{base}/entry.html')
        pg.fill('#paste-area', SAMPLE_ENTRY)
        pg.click('#import-btn')
        expect(pg.locator('#import-msg')).to_contain_text('5つそろいました')
        expect(pg.locator('#save-msg')).to_contain_text('自動保存済み')
        pg.click('#copy-review')
        expect(pg.locator('#review-msg')).to_contain_text('コピーしました')
        assert '金属加工' in pg.evaluate('navigator.clipboard.readText()')
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
        pg.goto(f'{base}/schedule.html')
        assert pg.locator('#pace-message').inner_text().strip()
        assert pg.locator('#pace-plan li').count() >= 3
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
