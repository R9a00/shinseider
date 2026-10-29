"""Regression checks added by the 2026-10-29 whole-site audit. No external writes."""
import functools
import http.server
import subprocess
import sys
import threading
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
ROOT = Path(__file__).resolve().parent.parent
PAGES = ['application', 'index','check','entry','fukabori','workspace','schedule','news','subsidy','ambassadors','trust','about','cool']

def run(base):
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for width in [375, 1280]:
            ctx = browser.new_context(viewport={'width': width, 'height': 900})
            ctx.route('**/*', lambda r: r.continue_() if r.request.url.startswith(base) else r.fulfill(status=200, body=''))
            errors=[]
            page=ctx.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
            for name in PAGES:
                page.goto(f'{base}/{name}.html')
                assert page.title() and page.locator('h1').count()==1,name
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), f'overflow: {name} at {width}'
            assert not errors,errors
            ctx.close()
        print('PASS: 13 pages at mobile/desktop widths, no horizontal overflow or JS errors')
        ctx=browser.new_context()
        ctx.route('**/*',lambda r:r.continue_() if r.request.url.startswith(base) else r.fulfill(status=200,body=''))
        page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto(base+'/fukabori.html')
        for raw in ['null','[]','{"blocks":{"roots":null}}','{"blocks":{"bad\\\"key":{"when":"x"}}}']:
            page.locator('#fk-patch').fill(raw);page.locator('#fk-apply').click()
            assert page.locator('#fk-patch-msg').inner_text(),raw
        page.locator('#fk-patch').fill('説明 {"blocks":{"roots":{"when":"文字 } と { と \\\"引用\\\""}}} 終わり')
        page.locator('#fk-apply').click()
        expect(page.locator('.fk-text').first).to_have_value('文字 } と { と "引用"')
        assert not errors,errors
        print('PASS: malformed AI JSON and braces inside strings do not break import')
        page.goto(base+'/entry.html')
        page.evaluate("() => {navigator.clipboard.writeText=()=>Promise.reject(new Error('denied')); return true;}")
        page.locator('#copy-prompt').click()
        expect(page.locator('#copy-prompt')).to_contain_text('コピーできません')
        assert not errors,errors
        page.goto(base+'/check.html')
        for key in ['age','pos','sme']:
            page.check(f'input[name=q_{key}][value=yes]')
        page.check('input[name=q_succ][value=yes]');page.click('button[type=submit]')
        expect(page.locator('#result')).not_to_contain_text('満たしています')
        expect(page.locator('#result')).to_contain_text('他の要件は未判定')
        print('PASS: qualification and subsidy verdicts do not claim complete eligibility')
        ctx.close()
        for instant in ['2026-11-24T12:00:00+09:00','2026-11-25T12:00:00+09:00','2026-11-25T18:00:01+09:00','2026-11-27T12:00:01+09:00']:
            ctx=browser.new_context(timezone_id='America/Los_Angeles')
            ctx.route('**/*',lambda r:r.continue_() if r.request.url.startswith(base) else r.fulfill(status=200,body=''))
            ctx.add_init_script("{const Original=Date;const now=new Original('"+instant+"').getTime();window.Date=class extends Original{constructor(...a){super(...(a.length?a:[now]));}static now(){return now;}};}")
            pg=ctx.new_page();pg.goto(base+'/schedule.html')
            if instant<'2026-11-25T18':
                plan=pg.locator('#pace-plan').inner_text()
                assert '明日' not in plan,plan
                if instant.startswith('2026-11-25'):assert '11/24' not in plan,plan
            else:
                expect(pg.locator('#pace-message')).to_contain_text('終了')
                pg.goto(base+'/workspace.html')
                assert 'エントリー受付中' not in pg.locator('.status-strip').inner_text()
            ctx.close()
        print('PASS: deadline-eve, deadline-day and closed states in an overseas timezone')
        browser.close()

def main():
    subprocess.run([sys.executable,str(ROOT/'site/build.py')],check=True)
    handler=functools.partial(http.server.SimpleHTTPRequestHandler,directory=str(ROOT/'site/dist'))
    server=http.server.ThreadingHTTPServer(('127.0.0.1',0),handler)
    threading.Thread(target=server.serve_forever,daemon=True).start()
    try:run(f'http://127.0.0.1:{server.server_port}')
    finally:server.shutdown()
if __name__=='__main__':main()
