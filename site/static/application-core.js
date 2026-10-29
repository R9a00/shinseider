/* Transferable application context. No AI request or document upload is made here. */
(function(root) {
'use strict';
const SCHEMA='shinseider.application-context/1', IDS=['story','resources','trends','idea','model','details'];
const obj=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const clone=v=>JSON.parse(JSON.stringify(v));
function safe(v){if(v&&typeof v==='object')Object.keys(v).forEach(k=>{if(['__proto__','constructor','prototype'].includes(k))throw Error('不正なキーです');safe(v[k]);});}
function strings(v,keys){return obj(v)&&keys.every(k=>typeof v[k]==='string');}
function validate(v){
  safe(v);
  if(!obj(v)||v.schema!==SCHEMA||!strings(v,['reference'])||!Array.isArray(v.materials)||v.materials.length!==6||!Array.isArray(v.sources)||!obj(v.files))throw Error('文脈データの形式が違います');
  v.materials.forEach((m,i)=>{if(!strings(m,['id','body','basis','gaps','visuals'])||m.id!==IDS[i])throw Error('6項目の材料を確認してください');});
  const seen=new Set();
  v.sources.forEach(s=>{if(!strings(s,['id','title','url','published','checked','kind','status','note'])||!s.id||seen.has(s.id)||!['確認済み','本人申告','未確認'].includes(s.status)|| (s.url&&!/^https?:\/\//i.test(s.url)))throw Error('出典の形式・ID・URLを確認してください');seen.add(s.id);});
  ['template','draft'].forEach(key=>{const f=v.files[key];if(f===null)return;if(!strings(f,['name','sha256'])||!/^[a-f0-9]{64}$/.test(f.sha256)||!Array.isArray(f.pages)||!f.pages.length||f.pages.length>100||!Array.isArray(f.warnings)||!f.warnings.every(x=>typeof x==='string')||!f.pages.every((p,i)=>obj(p)&&p.number===i+1&&typeof p.text==='string'))throw Error('ファイル情報の形式が違います');});
  if(v.review!==null&&(!strings(v.review,['binding','result'])||!/^[a-f0-9]{64}$/.test(v.review.binding)))throw Error('点検結果の形式が違います');
  if(JSON.stringify(v).length>2000000)throw Error('データが大きすぎます（200万文字まで）');
  return clone(v);
}
function blank(){return {schema:SCHEMA,reference:'',materials:IDS.map(id=>({id,body:'',basis:'',gaps:'',visuals:''})),sources:[],files:{template:null,draft:null},review:null};}
function canonical(v){if(Array.isArray(v))return '['+v.map(canonical).join(',')+']';if(obj(v))return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}';return JSON.stringify(v);}
async function hash(v){const bytes=typeof v==='string'?new TextEncoder().encode(v):v;return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),x=>x.toString(16).padStart(2,'0')).join('');}
async function binding(c,rules){const v=validate(c);delete v.review;return hash(canonical({context:v,rules}));}
function checks(c){const issues=[];c.materials.forEach((m,i)=>{if(!m.body.trim())issues.push('材料 '+(i+1)+'：本文が未入力');if(!m.basis.trim())issues.push('材料 '+(i+1)+'：根拠が未入力');if(m.gaps.trim())issues.push('材料 '+(i+1)+'：宿題あり');});['template','draft'].forEach(k=>{const f=c.files[k];const label=k==='template'?'フォーマット':'完成稿';if(!f)issues.push(label+'：未読込み');else{if(f.pages.length!==8)issues.push(label+'：抽出単位は'+f.pages.length+'。原本で表紙＋本文の8ページを確認');f.warnings.forEach(w=>issues.push(label+'：'+w));}});return issues;}
async function prompt(stage,c,rules){
  validate(c);if(!rules.stages[stage])throw Error('段階が不正です');
  if(['compose','review'].includes(stage)&&!c.files.template)throw Error('先にフォーマットを読み込んでください');
  if(stage==='review'&&!c.files.draft)throw Error('先に完成稿を読み込んでください');
  return rules.common+'\n\n# 今回の作業\n'+rules.stages[stage]+'\n\n# 公式要項・準備資料（確認日を再点検）\n'+JSON.stringify(rules,null,2)+'\n\n# 点検対象 binding\n'+await binding(c,rules)+'\n\n# 文脈データ（JSON全体を維持）\n'+JSON.stringify(c,null,2)+'\n\n原本が別添されていなければ、ファイル名を示して添付を依頼してください。読んでいない原本の視覚確認は完了としないでください。';
}
const api={SCHEMA,IDS,validate,blank,canonical,hash,binding,checks,prompt};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ApplicationCore=api;
})(typeof window!=='undefined'?window:globalThis);
