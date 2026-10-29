import {extract, bundle} from './application-files.mjs';
const C = ApplicationCore;
const rules = JSON.parse(document.querySelector('#application-rules').textContent);
const store = ShinseiderStore.open('application-save'), project = store.project;
let context = project.application, originals = {}, stage = '';
let revision = 0, statusRequest = 0, promptRequest = 0, validationMessage = false;
const $ = id => document.getElementById(id);
const labels = {research:'調べる', prepare:'材料をそろえる', compose:'フォーマットで作る', review:'完成稿を点検する'};
function message(text, validation = false) {
  $('application-message').textContent = text;
  validationMessage = validation;
}
// Include untouched fields saved by another tab, as well as our own unsaved edits.
const snapshot = () => store.snapshot(project).application;
const capture = () => ({revision, data:C.canonical(snapshot())});
function unchanged(mark) { return mark.revision === revision && mark.data === C.canonical(snapshot()); }
function ensureCurrent(mark) {
  if (!unchanged(mark)) throw Error('処理中に材料が変更されました。現在の入力を保持しています。操作をやり直してください');
}
function download(name, value, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([value], {type})); a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}
function invalidate() {
  revision++; statusRequest++; promptRequest++;
  if (context.review) $('review-status').textContent = '材料が変更されています。保存後に点検対象を確認します。';
  stage = ''; $('instructions').value = '';
  $('stage-label').textContent = '材料が変わりました。各段階の指示を作り直してください。';
}
async function changed() {
  invalidate(); const saved = await store.save(project); await status(); return saved;
}
async function status() {
  const seq = ++statusRequest;
  try {
    const current = C.validate(snapshot()), mark = capture();
    const issues = C.checks(current);
    $('mechanical').replaceChildren();
    (issues.length ? issues : ['空欄・抽出状態の追加指摘はありません。内容・数値・レイアウトの点検は別途必要です。']).forEach(text => {
      const li = document.createElement('li'); li.textContent = text; $('mechanical').append(li);
    });
    const binding = await C.binding(current, rules);
    if (seq !== statusRequest || !unchanged(mark)) return;
    if (validationMessage) message('入力形式を確認できました。保存状態をご確認ください。');
    $('review-status').textContent = !current.review ? 'まだ点検結果がありません。' :
      current.files.template && current.files.draft && current.review.binding === binding ?
        'この材料・ファイルに対するAIの点検記録です。内容と未確認範囲を確認してください。' :
        '材料・ファイル・準備資料が変わったため、以前の点検結果です。再点検してください。';
    $('review-result').textContent = current.review?.result || '';
  } catch (e) {
    if (seq === statusRequest) message(e.message + '。控えを保存し、内容を確認してください。', true);
  }
}
function renderSources() {
  const list = $('source-list'); list.replaceChildren();
  context.sources.forEach((source, i) => {
    const box = document.createElement('div'); box.className = 'app-source';
    const grid = document.createElement('div'); grid.className = 'app-source-grid'; box.append(grid);
    const fields = {id:'出典ID', title:'資料名', url:'URL（社内資料は空欄可）', kind:'種類（統計・顧客の声など）', published:'公開日・対象期間', checked:'確認日', status:'確認状態', note:'支持する主張・該当箇所・限界'};
    for (const [key, label] of Object.entries(fields)) {
      const wrap = document.createElement('div'), l = document.createElement('label'); l.textContent = label;
      const input = document.createElement(key === 'status' ? 'select' : key === 'note' ? 'textarea' : 'input');
      input.id = 'source-' + i + '-' + key; l.htmlFor = input.id;
      if (key === 'status') for (const value of ['未確認','本人申告','確認済み']) {
        const option = document.createElement('option'); option.value = option.textContent = value; input.append(option);
      }
      input.value = source[key];
      input.addEventListener('input', () => { source[key] = input.value; changed(); });
      wrap.append(l, input); grid.append(wrap);
    }
    const remove = document.createElement('button'); remove.className = 'btn small'; remove.textContent = 'この出典を削除';
    remove.onclick = () => { context.sources.splice(i, 1); renderSources(); changed(); };
    box.append(remove); list.append(box);
  });
}
function render() {
  $('reference').value = context.reference;
  document.querySelectorAll('[data-material-index]').forEach(el => el.value = context.materials[+el.dataset.materialIndex][el.dataset.field]);
  for (const key of ['template','draft']) {
    const file = context.files[key];
    $(key + '-preview').textContent = file ? file.name + '\n' + file.warnings.join('\n') + '\n\n' + file.pages.map(p => '【' + p.number + '】\n' + p.text).join('\n\n') : '未読込み';
  }
  renderSources(); status();
}
$('reference').addEventListener('input', () => { context.reference = $('reference').value; changed(); });
document.querySelectorAll('[data-material-index]').forEach(el => el.addEventListener('input', () => {
  context.materials[+el.dataset.materialIndex][el.dataset.field] = el.value; changed();
}));
$('legacy').onclick = async () => {
  const current = store.snapshot(project), memo = JSON.stringify({entry:current.entry, fukabori:current.fukabori}, null, 2);
  if (context.reference.includes(memo)) return message('同じ記録は既に取り込み済みです。');
  context.reference += (context.reference ? '\n\n' : '') + '既存の記録（内容の確認・6項目への整理はこれから）\n' + memo;
  render(); const saved = await changed(); message(saved ? '既存の記録を参考欄へ追加し、保存しました。' : '参考欄へ追加しましたが未保存です。控えを残してください。');
};
$('add-source').onclick = () => {
  context.sources.push({id:'s-' + crypto.randomUUID(), title:'', url:'', published:'', checked:'', kind:'', status:'未確認', note:''});
  renderSources(); changed();
};
for (const key of ['template','draft']) $(key + '-file').onchange = async e => {
  const input = e.target, file = input.files[0]; if (!file) return;
  const mark = capture(); message('ファイルを読んでいます…'); input.disabled = true;
  try {
    const current = snapshot();
    if (file.size > 0 && file.size <= 15*1024*1024 && current.files[key]?.sha256 === await C.hash(new Uint8Array(await file.arrayBuffer()))) {
      ensureCurrent(mark); originals[key] = file;
      message('保存した内容と同じ原本を添付しました。点検対象は変わりません。'); return;
    }
    const parsed = await extract(file); ensureCurrent(mark);
    const next = C.validate({...context, files:{...context.files, [key]:parsed}});
    context.files = next.files; originals[key] = file; render();
    const saved = await changed(); message(saved ? '抽出しました。本文と未確認範囲を確認してください。' : '抽出しましたが未保存です。控えを残してください。');
  } catch (err) { message('読み込めませんでした：' + err.message + '。現在の内容は保持しています。'); }
  finally { input.disabled = false; input.value = ''; }
};
document.querySelectorAll('[data-stage]').forEach(btn => btn.onclick = async () => {
  const request = ++promptRequest, mark = capture(), selectedStage = btn.dataset.stage;
  try {
    const value = await C.prompt(selectedStage, snapshot(), rules);
    ensureCurrent(mark); if (request !== promptRequest) return;
    stage = selectedStage; $('stage-label').textContent = labels[stage] + 'の指示文'; $('instructions').value = value;
    $('handoff').scrollIntoView({behavior:'smooth'}); message('指示文を作りました。原本入り一式を保存してAIへ渡してください。');
  } catch (e) { message(e.message); }
});
$('copy-instructions').onclick = async () => {
  if (!stage) return message('先に各段階の指示を作ってください。');
  try { await navigator.clipboard.writeText($('instructions').value); message('コピーしました。必要な原本もAIへ添付してください。'); }
  catch (_) { message('コピーできません。指示文を選択して手動でコピーしてください。'); }
};
$('bundle').onclick = async () => {
  const mark = capture(), selectedStage = stage;
  try {
    if (!selectedStage) throw Error('先に各段階の指示を作ってください');
    const data = await bundle(C.validate(snapshot()), rules, selectedStage, {...originals}); ensureCurrent(mark);
    download('shinseider-' + selectedStage + '.zip', data, 'application/zip'); message('一式を保存しました。AIへ添付する前に内容を確認してください。');
  } catch (e) { message(e.message); }
};
$('export-context').onclick = () => {
  download('shinseider-context.json', JSON.stringify(snapshot(), null, 2), 'application/json');
  message('文脈データの控えを保存しました。原本は別途保管してください。');
};
$('context-file').onchange = async e => {
  const input = e.target, file = input.files[0]; if (!file) return;
  const mark = capture(); input.disabled = true;
  try {
    if (file.size > 8*1024*1024) throw Error('ファイルが大きすぎます');
    const next = C.validate(JSON.parse(await file.text())); ensureCurrent(mark);
    context = project.application = next; originals = {}; render();
    const saved = await changed(); message(saved ? '文脈データを読み込み、保存しました。変更された材料を確認してください。' : '文脈データを読み込みましたが未保存です。控えを残してください。');
  } catch (err) { message('読み込めませんでした：' + err.message + '。現在の材料は保持しています。'); }
  finally { input.disabled = false; input.value = ''; }
};
$('import-review').onclick = async () => {
  const mark = capture();
  try {
    const current = C.validate(snapshot());
    if (!current.files.template || !current.files.draft) throw Error('フォーマットと完成稿を読んでから点検してください');
    const raw = JSON.parse($('review-input').value.trim().replace(/^```(?:json)?\s*|\s*```$/g, ''));
    const next = C.validate({...current, review:raw});
    if (!next.review || !next.review.result.trim()) throw Error('点検本文が空です');
    const binding = await C.binding(current, rules); ensureCurrent(mark);
    if (next.review.binding !== binding) throw Error('別の材料・ファイルへの点検結果です。現在の指示文で再点検してください');
    context.review = next.review; revision++;
    const saved = await store.save(project); await status();
    message(saved ? 'AIの点検記録を保存しました。指摘と未確認範囲を読み、修正後に再点検してください。' : '点検結果は未保存です。画面の内容を控えに保存し、保存状態をご確認ください。');
  } catch (e) { message('保存できませんでした：' + e.message); }
};
window.addEventListener('storage', e => {
  if (e.key !== 'shinseider_project') return;
  invalidate(); status(); message('別のタブで保存内容が変更されました。控えには他タブの変更も含めます。入力欄の最新表示は再読み込みで確認してください。');
});
render();
