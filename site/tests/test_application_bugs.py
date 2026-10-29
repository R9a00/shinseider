"""Regression cases from the adversarial application audit; isolated browsers/workspaces."""
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
from unittest.mock import patch
from playwright.sync_api import sync_playwright, expect
from application_fixtures import create
ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT))
import application_context as ac
spec=importlib.util.spec_from_file_location('mcp_bug_server',ROOT/'mcp/server.py')
server=importlib.util.module_from_spec(spec);spec.loader.exec_module(server)

class BrowserBugs(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        subprocess.run([sys.executable,str(ROOT/'site/build.py')],check=True,stdout=subprocess.DEVNULL)
        class Quiet(http.server.SimpleHTTPRequestHandler):
            def log_message(self,*args):pass
        cls.server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(ROOT/'site/dist')))
        threading.Thread(target=cls.server.serve_forever,daemon=True).start()
        cls.base=f'http://127.0.0.1:{cls.server.server_port}'
        cls.pw=sync_playwright().start();cls.browser=cls.pw.chromium.launch()
    @classmethod
    def tearDownClass(cls):
        cls.browser.close();cls.pw.stop();cls.server.shutdown();cls.server.server_close()
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory();self.root=Path(self.tmp.name);create(self.root)
        self.ctx=self.browser.new_context(accept_downloads=True)
        self.ctx.route('**/*',lambda r:r.continue_() if r.request.url.startswith(self.base) else r.fulfill(status=200,body=''))
        self.page=self.ctx.new_page();self.errors=[];self.page.on('pageerror',lambda e:self.errors.append(str(e)))
        self.page.goto(self.base+'/application.html')
    def tearDown(self):
        self.ctx.close();self.tmp.cleanup();self.assertFalse(self.errors,self.errors)
    def test_quota_failure_never_claims_review_saved(self):
        c=ac.blank();c['files']={k:ac.extract(self.root/'format.pptx') for k in ['template','draft']}
        self.page.locator('#context-file').set_input_files({'name':'context.json','mimeType':'application/json','buffer':json.dumps(c).encode()})
        expect(self.page.locator('#application-save')).to_contain_text('自動保存済み')
        digest=self.page.evaluate("ApplicationCore.binding(JSON.parse(localStorage.shinseider_project).application,JSON.parse(document.querySelector('#application-rules').textContent))")
        self.page.evaluate("() => {Storage.prototype.setItem=function(){throw new DOMException('full','QuotaExceededError')}}")
        self.page.locator('#review-input').fill(json.dumps({'binding':digest,'result':'保存失敗の検査記録'}));self.page.locator('#import-review').click()
        expect(self.page.locator('#application-save')).to_contain_text('未保存')
        expect(self.page.locator('#application-message')).not_to_contain_text('保存しました')
        self.assertIsNone(self.page.evaluate('JSON.parse(localStorage.shinseider_project).application.review'))
    def test_late_prompt_cannot_reappear_after_edit(self):
        self.page.evaluate("() => {const original=ApplicationCore.prompt;ApplicationCore.prompt=async(...args)=>{const result=await original(...args);await new Promise(r=>window.releasePrompt=r);return result;}}")
        self.page.locator('[data-stage="research"]').click()
        self.page.wait_for_function('typeof releasePrompt===\"function\"')
        self.page.locator('#reference').fill('処理中に変えた材料')
        self.page.evaluate('releasePrompt()')
        expect(self.page.locator('#application-message')).to_contain_text('変更')
        expect(self.page.locator('#instructions')).to_have_value('')
    def test_late_file_read_does_not_overwrite_a_new_context(self):
        self.page.evaluate("() => {const original=File.prototype.arrayBuffer;File.prototype.arrayBuffer=async function(){if(this.name==='format.pptx'&&!window.readReleased)await new Promise(r=>window.releaseFile=()=>{window.readReleased=true;r()});return original.call(this);}}")
        self.page.locator('#template-file').set_input_files(self.root/'format.pptx')
        self.page.wait_for_function('typeof releaseFile===\"function\"')
        self.page.locator('#reference').fill('先に保存した新しい材料')
        self.page.evaluate('releaseFile()')
        expect(self.page.locator('#application-message')).to_contain_text('変更')
        expect(self.page.locator('#template-preview')).to_have_text('未読込み')
        expect(self.page.locator('#reference')).to_have_value('先に保存した新しい材料')
    def test_backup_includes_other_tab_materials_and_unsaved_local_input(self):
        self.page.locator('#reference').fill('共通の参考情報')
        expect(self.page.locator('#application-save')).to_contain_text('自動保存済み')
        other=self.ctx.new_page();other.goto(self.base+'/application.html')
        self.page.locator('[data-material-index="0"][data-field="body"]').fill('別タブで記入した本文')
        expect(self.page.locator('#application-save')).to_contain_text('自動保存済み')
        other.locator('#reference').fill('このタブで記入した参考情報')
        with other.expect_download() as dl:other.locator('#export-context').click()
        out=self.root/'backup.json';dl.value.save_as(out);c=json.loads(out.read_text())
        self.assertEqual(c['materials'][0]['body'],'別タブで記入した本文')
        self.assertEqual(c['reference'],'このタブで記入した参考情報')

    def test_late_context_import_cannot_erase_typed_material(self):
        self.page.evaluate("() => {const original=File.prototype.text;File.prototype.text=async function(){if(this.name==='late.json')await new Promise(r=>window.releaseContext=r);return original.call(this);}}")
        self.page.locator('#context-file').set_input_files({'name':'late.json','mimeType':'application/json','buffer':json.dumps(ac.blank()).encode()})
        self.page.wait_for_function('typeof releaseContext==="function"')
        self.page.locator('#reference').fill('読込み中に入力した本文')
        self.page.evaluate('releaseContext()')
        expect(self.page.locator('#application-message')).to_contain_text('変更')
        expect(self.page.locator('#reference')).to_have_value('読込み中に入力した本文')

    def test_invalid_file_keeps_original_and_office_spacing_is_preserved(self):
        from zipfile import ZipFile
        file=self.root/'spacing.docx'
        with ZipFile(file,'w') as z:z.writestr('word/document.xml','<w:document xmlns:w="urn:w"><w:p><w:r><w:t>4</w:t><w:tab/><w:t>36</w:t><w:br/><w:t>144</w:t></w:r></w:p></w:document>')
        self.page.locator('#template-file').set_input_files(file)
        expect(self.page.locator('#template-preview')).to_contain_text('spacing.docx')
        self.assertIn('4\t36\n144',self.page.locator('#template-preview').text_content())
        before=self.page.locator('#template-preview').text_content()
        self.page.locator('#template-file').set_input_files({'name':'bad.pdf','mimeType':'application/pdf','buffer':b'not a PDF'})
        expect(self.page.locator('#application-message')).to_contain_text('読み込めませんでした')
        self.assertEqual(self.page.locator('#template-preview').text_content(),before)
        self.page.locator('#add-source').click();self.page.locator('#source-0-url').fill('htt')
        expect(self.page.locator('#application-save')).to_contain_text('未保存')
        self.page.locator('#source-0-url').fill('https://example.org/evidence')
        expect(self.page.locator('#application-save')).to_contain_text('自動保存済み')
        expect(self.page.locator('#application-message')).not_to_contain_text('出典の形式')

class MCPBugs(unittest.TestCase):
    def test_old_context_cannot_erase_a_new_review(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp)
            with patch.object(server,'STATE_FILE',root/'state.json'):
                server.workspace_init(str(root/'ws'));create(root/'ws/materials')
                c=ac.blank();c['files']={k:ac.extract(root/'ws/materials/format.pptx') for k in ['template','draft']}
                first=server.application_context_save(c)
                server.application_review_save(first['binding'],'新しい点検記録')
                c['reference']='古い文脈をもとにした変更'
                with self.assertRaises(ValueError):server.application_context_save(c,expected_binding=first['binding'])
                self.assertEqual(server.application_context_read()['context']['review']['result'],'新しい点検記録')
    def test_original_filenames_with_spaces_and_parentheses(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp)
            with patch.object(server,'STATE_FILE',root/'state.json'):
                server.workspace_init(str(root/'ws'))
                (root/'ws/materials/提出 サンプル (1).txt').write_text('提出用の指定欄')
                result=server.application_document_read('materials/提出 サンプル (1).txt')
                self.assertEqual(result['pages'][0]['text'],'提出用の指定欄')
    def test_revision_conflicts_and_atomic_write_failure_preserve_saved_data(self):
        import concurrent.futures
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp)
            with patch.object(server,'STATE_FILE',root/'state.json'):
                server.workspace_init(str(root/'ws'))
                first=server.application_context_save(ac.blank());before=(root/'ws/materials/application-context.json').read_bytes()
                c=first['context'];c['reference']='new'
                with patch.object(server.os,'replace',side_effect=OSError('simulated disk failure')):
                    with self.assertRaises(OSError):server.application_context_save(c,expected_revision=first['revision'])
                self.assertEqual((root/'ws/materials/application-context.json').read_bytes(),before)
                def save(text):
                    candidate=ac.blank();candidate['reference']=text
                    try:server.application_context_save(candidate,expected_revision=first['revision']);return True
                    except ValueError:return False
                with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
                    self.assertEqual(sorted(pool.map(save,['one','two'])),[False,True])
                with self.assertRaises(ValueError):server.workspace_record('materials/application-context.json','{}')

class SchemaAndParsingBugs(unittest.TestCase):
    def test_unicode_size_and_number_representation_have_identical_bindings(self):
        guide=ac.rules(ROOT);c=ac.blank();c['files']['template']={'name':'t.txt','sha256':'a'*64,'pages':[{'number':1.0,'text':'本文🙂'}],'warnings':[]}
        c['reference']='🙂'*100
        normalized=ac.validate(c);self.assertIs(type(normalized['files']['template']['pages'][0]['number']),int)
        script="const C=require('./site/static/application-core.js');let s='';process.stdin.on('data',d=>s+=d);process.stdin.on('end',async()=>{const [c,r]=JSON.parse(s);console.log(await C.binding(c,r));});"
        actual=subprocess.run(['node','-e',script],cwd=ROOT,input=json.dumps([c,guide]),text=True,capture_output=True,check=True).stdout.strip()
        self.assertEqual(actual,ac.binding(c,guide))
        c=ac.blank();compact=json.dumps(c,ensure_ascii=False,separators=(',',':'));c['reference']='x'*(2000000-len(compact))
        self.assertEqual(len(json.dumps(c,ensure_ascii=False,separators=(',',':'))),2000000)
        ac.validate(c);c['reference']+='x'
        with self.assertRaises(ValueError):ac.validate(c)
        for bad in [dict(ac.blank(),unexpected=1.0),dict(ac.blank(),reference='\ud800')]:
            with self.assertRaises(ValueError):ac.validate(bad)
    def test_office_tabs_breaks_and_nested_paragraphs_are_not_concatenated_or_duplicated(self):
        from zipfile import ZipFile
        with tempfile.TemporaryDirectory() as tmp:
            file=Path(tmp)/'spacing.docx'
            with ZipFile(file,'w') as z:z.writestr('word/document.xml','<w:document xmlns:w="urn:w"><w:p><w:r><w:t>4</w:t><w:tab/><w:t>36</w:t><w:br/><w:t>144</w:t></w:r><w:drawing><w:p><w:r><w:t>別の欄</w:t></w:r></w:p></w:drawing></w:p></w:document>')
            self.assertEqual(ac.extract(file)['pages'][0]['text'],'4\t36\n144\n別の欄')
