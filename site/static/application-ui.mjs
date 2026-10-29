import {extract,bundle} from './application-files.mjs';
const C=ApplicationCore, rules=JSON.parse(document.querySelector('#application-rules').textContent);
const store=ShinseiderStore.open('application-save'),project=store.project;
project.application=project.application||C.blank();
let context=project.application, originals={}, stage='', tick=0;
const $=id=>document.getElementById(id), message=text=>{$('application-message').textContent=text;};
const labels={research:'調べる',prepare:'材料をそろえる',compose:'フォーマットで作る',review:'完成稿を点検する'};
function download(name,value,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([value],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),5000);}
function invalidate(){if(context.review)$('review-status').textContent='材料が変更されています。保存後に点検対象を確認します。';stage='';$('instructions').value='';$('stage-label').textContent='材料が変わりました。各段階の指示を作り直してください。';}
async function changed(){invalidate();await store.save(project);await status();}
async function status(){
  const seq=++tick;
  const issues=C.checks(context);$('mechanical').replaceChildren();
  (issues.length?issues:['空欄・抽出状態の追加指摘はありません。内容・数値・レイアウトの点検は別途必要です。']).forEach(t=>{const li=document.createElement('li');li.textContent=t;$('mechanical').append(li);});
  let binding;try{binding=await C.binding(context,rules);}catch(e){message(e.message+'。控えを保存し、内容を確認してください。');return;}if(seq!==tick)return;
  $('review-status').textContent=!context.review?'まだ点検結果がありません。':context.files.template&&context.files.draft&&context.review.binding===binding?'この材料・ファイルに対するAIの点検記録です。内容と未確認範囲を確認してください。':'材料・ファイル・準備資料が変わったため、以前の点検結果です。再点検してください。';
  $('review-result').textContent=context.review?.result||'';
}
function renderSources(){
  const list=$('source-list');list.replaceChildren();
  context.sources.forEach((s,i)=>{
    const box=document.createElement('div');box.className='app-source';const grid=document.createElement('div');grid.className='app-source-grid';box.append(grid);
    const fields={id:'出典ID',title:'資料名',url:'URL（社内資料は空欄可）',kind:'種類（統計・顧客の声など）',published:'公開日・対象期間',checked:'確認日',status:'確認状態',note:'支持する主張・該当箇所・限界'};
    for(const [k,label] of Object.entries(fields)){
      const wrap=document.createElement('div'),l=document.createElement('label');l.textContent=label;
      const input=document.createElement(k==='status'?'select':k==='note'?'textarea':'input');input.id='source-'+i+'-'+k;l.htmlFor=input.id;
      if(k==='status')for(const v of ['未確認','本人申告','確認済み']){const o=document.createElement('option');o.value=o.textContent=v;input.append(o);}
      input.value=s[k];input.addEventListener('input',async()=>{s[k]=input.value;await changed();});wrap.append(l,input);grid.append(wrap);
    }
    const remove=document.createElement('button');remove.className='btn small';remove.textContent='この出典を削除';remove.onclick=async()=>{context.sources.splice(i,1);renderSources();await changed();};box.append(remove);list.append(box);
  });
}
function render(){
  $('reference').value=context.reference;
  document.querySelectorAll('[data-material-index]').forEach(el=>el.value=context.materials[+el.dataset.materialIndex][el.dataset.field]);
  for(const key of ['template','draft']){const f=context.files[key];$(key+'-preview').textContent=f?f.name+'\n'+f.warnings.join('\n')+'\n\n'+f.pages.map(p=>'【'+p.number+'】\n'+p.text).join('\n\n'):'未読込み';}
  renderSources();status();
}
$('reference').addEventListener('input',()=>{context.reference=$('reference').value;changed();});
document.querySelectorAll('[data-material-index]').forEach(el=>el.addEventListener('input',()=>{context.materials[+el.dataset.materialIndex][el.dataset.field]=el.value;changed();}));
$('legacy').onclick=async()=>{
  const snapshot=store.snapshot(project);const memo=JSON.stringify({entry:snapshot.entry,fukabori:snapshot.fukabori},null,2);
  if(!context.reference.includes(memo)){context.reference+=(context.reference?'\n\n':'')+'既存の記録（内容の確認・6項目への整理はこれから）\n'+memo;render();await changed();message('既存の記録を参考欄へ追加しました。');}else message('同じ記録は既に取り込み済みです。');
};
$('add-source').onclick=async()=>{context.sources.push({id:'s-'+Date.now(),title:'',url:'',published:'',checked:'',kind:'',status:'未確認',note:''});renderSources();await changed();};
for(const key of ['template','draft'])$(key+'-file').onchange=async e=>{
  const file=e.target.files[0];if(!file)return;message('ファイルを読んでいます…');e.target.disabled=true;
  try{if(file.size>0&&file.size<=15*1024*1024&&context.files[key]?.sha256===await C.hash(new Uint8Array(await file.arrayBuffer()))){originals[key]=file;message('保存した内容と同じ原本を添付しました。点検対象は変わりません。');return;}const parsed=await extract(file);const next=C.validate({...context,files:{...context.files,[key]:parsed}});context.files=next.files;originals[key]=file;render();await changed();message('抽出しました。本文と未確認範囲を確認してください。');}catch(err){message('読み込めませんでした：'+err.message+'。保存済みの内容は保持しています。');}finally{e.target.disabled=false;e.target.value='';}
};
document.querySelectorAll('[data-stage]').forEach(btn=>btn.onclick=async()=>{
  try{const value=await C.prompt(btn.dataset.stage,context,rules);stage=btn.dataset.stage;$('stage-label').textContent=labels[stage]+'の指示文';$('instructions').value=value;$('handoff').scrollIntoView({behavior:'smooth'});message('指示文を作りました。原本入り一式を保存してAIへ渡してください。');}catch(e){message(e.message);}
});
$('copy-instructions').onclick=async()=>{if(!stage)return message('先に各段階の指示を作ってください。');try{await navigator.clipboard.writeText($('instructions').value);message('コピーしました。必要な原本もAIへ添付してください。');}catch(_){message('コピーできません。指示文を選択して手動でコピーしてください。');}};
$('bundle').onclick=async()=>{try{if(!stage)throw Error('先に各段階の指示を作ってください');const data=await bundle(C.validate(context),rules,stage,originals);download('shinseider-'+stage+'.zip',data,'application/zip');message('一式を保存しました。AIへ添付する前に内容を確認してください。');}catch(e){message(e.message);}};
$('export-context').onclick=()=>{download('shinseider-context.json',JSON.stringify(context,null,2),'application/json');message('文脈データの控えを保存しました。原本は別途保管してください。');};
$('context-file').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>8*1024*1024)throw Error('ファイルが大きすぎます');const next=C.validate(JSON.parse(await file.text()));context=project.application=next;originals={};render();await changed();message('文脈データを読み込みました。保存状態と、変更された材料を確認してください。');}catch(err){message('読み込めませんでした：'+err.message+'。現在の材料は保持しています。');}finally{e.target.value='';}};
$('import-review').onclick=async()=>{try{if(!context.files.template||!context.files.draft)throw Error('フォーマットと完成稿を読んでから点検してください');const raw=JSON.parse($('review-input').value.trim().replace(/^```(?:json)?\s*|\s*```$/g,''));const next=C.validate({...context,review:raw});const binding=await C.binding(context,rules);if(next.review.binding!==binding)throw Error('別の材料・ファイルへの点検結果です。現在の指示文で再点検してください');if(!raw.result.trim())throw Error('点検本文が空です');context.review=next.review;await store.save(project);await status();message('AIの点検記録を保存しました。指摘と未確認範囲を読み、修正後に再点検してください。');}catch(e){message('保存できませんでした：'+e.message);}};
render();
