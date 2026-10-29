# Replays recorded MCP results through an isolated browser; no AI calls.
import json,re
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
OUT=Path(__file__).resolve().parent
def restored(name):
 d=json.loads((OUT/name).read_text());assert not d['isError'];return json.loads(d['content'][0]['text'])['content']
draft=restored('read-after.json');patch=restored('read-patch.json');blocks=json.loads(patch)['blocks']
titles=['現業と自分','現場で感じている課題','やりたい新規事業','家業の経営資源の活用','実現したい未来']
ids=['genba','kadai','shinkijigyo','keieishigen','mirai']
expected={key:re.search(r'^## '+re.escape(title)+r'\n(.*?)(?=^## |\Z)',draft,re.M|re.S)[1].strip() for key,title in zip(ids,titles)}
base='https://shinseider.onrender.com'
with sync_playwright() as p:
 browser=p.chromium.launch();ctx=browser.new_context(accept_downloads=True)
 ctx.route('**/*',lambda r:r.continue_() if r.request.url.startswith(base) else r.fulfill(status=200,body=''))
 page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(base+'/entry.html');page.locator('#paste-area').fill(draft);page.locator('#import-btn').click()
 expect(page.locator('#import-msg')).to_contain_text('5つそろいました')
 expect(page.locator('#save-msg')).to_contain_text('自動保存済み')
 for key,value in expected.items():expect(page.locator(f'[data-id="{key}"] .sec-text')).to_have_value(value)
 page.goto(base+'/fukabori.html');page.locator('#fk-patch').fill(patch);page.locator('#fk-apply').click()
 expect(page.locator('#fk-save-msg')).to_contain_text('自動保存済み')
 for block,fields in blocks.items():
  for key,value in fields.items():expect(page.locator(f'[data-block="{block}"] [data-field="{key}"]')).to_have_value(value)
 page.goto(base+'/entry.html')
 with page.expect_download() as download:page.locator('#dl-md').click()
 backup=Path(download.value.path()).read_text();(OUT/'browser-backup.md').write_text(backup)
 data=json.loads(re.findall(r'```json\s*([\s\S]*?)```',backup)[-1]);assert data['entry']['sections']==expected
 assert data['fukabori']['blocks']==blocks
 ctx.close()
 ctx=browser.new_context();ctx.route('**/*',lambda r:r.continue_() if r.request.url.startswith(base) else r.fulfill(status=200,body=''))
 page=ctx.new_page();page.on('pageerror',lambda e:errors.append(str(e)));page.goto(base+'/entry.html')
 page.locator('#up-project').set_input_files(OUT/'browser-backup.md')
 for key,value in expected.items():expect(page.locator(f'[data-id="{key}"] .sec-text')).to_have_value(value)
 page.goto(base+'/fukabori.html')
 for block,fields in blocks.items():
  for key,value in fields.items():expect(page.locator(f'[data-block="{block}"] [data-field="{key}"]')).to_have_value(value)
 assert not errors,errors
 browser.close()
result={'base_url':base,'entry_sections_matched':5,'fukabori_blocks_matched':len(blocks),'fukabori_fields_matched':sum(map(len,blocks.values())),'backup_and_fresh_browser_restore':'exact match','external_AI_requests':'blocked','javascript_errors':errors,'section_lengths':{k:len(v) for k,v in expected.items()}}
(OUT/'browser-check.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps(result,ensure_ascii=False,indent=2))
