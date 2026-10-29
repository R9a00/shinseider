import functools
import http.server
import importlib.util
import json
import subprocess
import sys
import tempfile
import threading
import unittest
from pathlib import Path
from application_fixtures import create
ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT))
import application_context as ac

class ApplicationTests(unittest.TestCase):
    def test_parsers_and_browser_python_binding_parity(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);create(root)
            ppt=ac.extract(root/'format.pptx')
            self.assertEqual(len(ppt['pages']),8)
            self.assertIn('slide 2',ppt['pages'][0]['text'])
            self.assertIn('家業の記録',ac.extract(root/'notes.docx')['pages'][0]['text'])
            pdf=ac.extract(root/'draft.pdf')
            self.assertIn('1440000',pdf['pages'][0]['text'])
            self.assertIn('2ページ目',pdf['warnings'][-1])
            context=ac.blank();context['reference']='本人の声🙂';context['files']['template']=ppt
            guide=ac.rules(ROOT)
            script="const C=require('./site/static/application-core.js');let s='';process.stdin.on('data',d=>s+=d);process.stdin.on('end',async()=>{const [c,r]=JSON.parse(s);console.log(JSON.stringify({binding:await C.binding(c,r),prompt:await C.prompt('compose',c,r)}));});"
            r=subprocess.run(['node','-e',script],cwd=ROOT,input=json.dumps([context,guide]),text=True,capture_output=True,check=True)
            actual=json.loads(r.stdout)
            self.assertEqual(actual['binding'],ac.binding(context,guide))
            self.assertEqual(actual['prompt'],ac.prompt('compose',context,guide))
            context['files']['draft']=pdf
            self.assertIn('144万円',ac.prompt('review',context,guide))
            self.assertNotEqual(actual['binding'],ac.binding(context,guide))
            for bad in [None,{},dict(context,materials=[]),dict(context,files={})]:
                with self.assertRaises(ValueError):ac.validate(bad)

    def test_browser_handoff_files_stale_review_and_backup(self):
        from playwright.sync_api import sync_playwright,expect
        subprocess.run([sys.executable,str(ROOT/'site/build.py')],check=True,stdout=subprocess.DEVNULL)
        class Quiet(http.server.SimpleHTTPRequestHandler):
            def log_message(self,*args):pass
        server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(ROOT/'site/dist')))
        thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
        base=f'http://127.0.0.1:{server.server_port}'
        try:
            with tempfile.TemporaryDirectory() as tmp, sync_playwright() as pw:
                root=Path(tmp);create(root);browser=pw.chromium.launch();ctx=browser.new_context(accept_downloads=True)
                ctx.route('**/*',lambda r:r.continue_() if r.request.url.startswith(base) else r.fulfill(status=200,body=''))
                page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
                page.goto(base+'/application.html');page.locator('#reference').fill('架空の本人の材料🙂')
                expect(page.locator('#application-save')).to_contain_text('自動保存済み')
                page.locator('[data-material-index="0"][data-field="body"]').fill('なぜ家業を継ぐのか')
                page.locator('#add-source').click()
                page.locator('#source-0-title').fill('本人への聞き取り')
                expect(page.locator('#application-save')).to_contain_text('自動保存済み')
                self.assertEqual(page.evaluate("JSON.parse(localStorage.shinseider_project).application.sources[0].title"),'本人への聞き取り')
                for key,name in [('template','format.pptx'),('draft','draft.pdf')]:
                    page.locator('#'+key+'-file').set_input_files(root/name)
                    expect(page.locator('#'+key+'-preview')).to_contain_text(name)
                expect(page.locator('#template-preview')).to_contain_text('TEST TEMPLATE slide 2')
                expect(page.locator('#draft-preview')).to_contain_text('1440000')
                expect(page.locator('#draft-preview')).to_contain_text('2ページ目の文字を抽出できません')
                page.locator('[data-stage="review"]').click()
                expect(page.locator('#instructions')).to_have_value(__import__('re').compile('公式6項目|点検対象 binding'))
                binding=page.evaluate("async()=>ApplicationCore.binding(JSON.parse(localStorage.shinseider_project).application,JSON.parse(document.querySelector('#application-rules').textContent))")
                page.locator('#review-input').fill(json.dumps({'binding':binding,'result':'視覚確認未実施。表紙・本文の8ページへの修正が必要。'},ensure_ascii=False));page.locator('#import-review').click()
                expect(page.locator('#review-status')).to_contain_text('この材料・ファイル')
                with page.expect_download() as dl:page.locator('#bundle').click()
                path=root/'bundle.zip';dl.value.save_as(path)
                from zipfile import ZipFile
                with ZipFile(path) as z:
                    self.assertIn('template/format.pptx',z.namelist());self.assertIn('draft/draft.pdf',z.namelist());self.assertIn('instructions.md',z.namelist())
                    self.assertEqual(z.read('draft/draft.pdf'),(root/'draft.pdf').read_bytes())
                with page.expect_download() as dl:page.locator('#export-context').click()
                saved=root/'context.json';dl.value.save_as(saved)
                self.assertEqual(json.loads(saved.read_text())['review']['binding'],binding)
                page.locator('#reference').fill('変更した材料')
                expect(page.locator('#review-status')).to_contain_text('以前の点検結果')
                expect(page.locator('#instructions')).to_have_value('')
                page.locator('#context-file').set_input_files({'name':'bad.json','mimeType':'application/json','buffer':b'{"schema":"bad"}'})
                expect(page.locator('#application-message')).to_contain_text('読み込めませんでした')
                expect(page.locator('#reference')).to_have_value('変更した材料')
                page.locator('#context-file').set_input_files(saved)
                expect(page.locator('#reference')).to_have_value('架空の本人の材料🙂')
                page.locator('[data-stage="review"]').click();page.locator('#bundle').click()
                expect(page.locator('#application-message')).to_contain_text('原本を再選択')
                # Reattaching identical originals must preserve imported extraction and review.
                for key,name in [('template','format.pptx'),('draft','draft.pdf')]:
                    page.locator('#'+key+'-file').set_input_files(root/name)
                    expect(page.locator('#application-message')).to_contain_text('点検対象は変わりません')
                expect(page.locator('#review-status')).to_contain_text('この材料・ファイル')
                with page.expect_download() as dl:page.locator('#bundle').click()
                dl.value.save_as(root/'reattached.zip')
                page.goto(base+'/entry.html')
                with page.expect_download() as dl:page.locator('#dl-md').click()
                backup=root/'old-page-backup.md';dl.value.save_as(backup)
                self.assertIn('shinseider.application-context/1',backup.read_text())
                self.assertFalse(errors,errors);browser.close()
        finally:server.shutdown();server.server_close()
