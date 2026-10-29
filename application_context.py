"""Shared application context contract for local MCP and browser handoff."""
from __future__ import annotations
import copy
import hashlib
import io
import json
import re
import zipfile
from pathlib import Path
import xml.etree.ElementTree as ET
import yaml

SCHEMA = 'shinseider.application-context/1'
IDS = ['story', 'resources', 'trends', 'idea', 'model', 'details']
LIMIT = 15 * 1024 * 1024


def rules(root: Path) -> dict:
    data = yaml.safe_load((root / 'data/application_support.yaml').read_text())
    data['official'] = yaml.safe_load((root / 'data/koshien_entry.yaml').read_text())['official_preparation']
    return data


def blank() -> dict:
    return dict(schema=SCHEMA, reference='', materials=[dict(id=id, body='', basis='', gaps='', visuals='') for id in IDS],
                sources=[], files=dict(template=None, draft=None), review=None)


def _safe(value):
    if isinstance(value, str):
        try:
            value.encode('utf-8')
        except UnicodeEncodeError:
            raise ValueError('不正な文字が含まれています') from None
    if isinstance(value, dict):
        for k, v in value.items():
            if k in ['__proto__', 'constructor', 'prototype']:
                raise ValueError('不正なキーです')
            _safe(v)
    elif isinstance(value, list):
        for v in value:
            _safe(v)


def _strings(value, keys):
    return isinstance(value, dict) and all(isinstance(value.get(k), str) for k in keys)


def _shape(value, keys):
    if not isinstance(value, dict) or set(value) - set(keys):
        raise ValueError('文脈データに未対応の項目があります')


def validate(c: dict) -> dict:
    _safe(c)
    _shape(c, ['schema', 'reference', 'materials', 'sources', 'files', 'review'])
    c = copy.deepcopy(c)
    if not isinstance(c, dict) or c.get('schema') != SCHEMA or not _strings(c, ['reference']) or not isinstance(c.get('materials'), list) or len(c['materials']) != 6 or not isinstance(c.get('sources'), list) or not isinstance(c.get('files'), dict):
        raise ValueError('文脈データの形式が違います')
    for i, m in enumerate(c['materials']):
        _shape(m, ['id', 'body', 'basis', 'gaps', 'visuals'])
        if not _strings(m, ['id', 'body', 'basis', 'gaps', 'visuals']) or m['id'] != IDS[i]:
            raise ValueError('6項目の材料を確認してください')
    seen = set()
    for s in c['sources']:
        _shape(s, ['id', 'title', 'url', 'published', 'checked', 'kind', 'status', 'note'])
        if not _strings(s, ['id', 'title', 'url', 'published', 'checked', 'kind', 'status', 'note']) or not s['id'] or s['id'] in seen or s['status'] not in ['確認済み', '本人申告', '未確認'] or (s['url'] and not re.match(r'https?://', s['url'], re.I)):
            raise ValueError('出典の形式・ID・URLを確認してください')
        seen.add(s['id'])
    _shape(c['files'], ['template', 'draft'])
    for key in ['template', 'draft']:
        if key not in c['files']:
            raise ValueError('ファイル情報がありません')
        f = c['files'][key]
        if f is None:
            continue
        _shape(f, ['name', 'sha256', 'pages', 'warnings'])
        if not _strings(f, ['name', 'sha256']) or not re.fullmatch('[a-f0-9]{64}', f['sha256']) or not isinstance(f.get('pages'), list) or not 1 <= len(f['pages']) <= 100 or not isinstance(f.get('warnings'), list) or not all(isinstance(w, str) for w in f['warnings']) or not all(isinstance(p, dict) and type(p.get('number')) in (int, float) and p['number'] == i+1 and isinstance(p.get('text'), str) for i, p in enumerate(f['pages'])):
            raise ValueError('ファイル情報の形式が違います')
        for page in f['pages']:
            _shape(page, ['number', 'text'])
            page['number'] = int(page['number'])
    if c.get('review') is not None:
        _shape(c['review'], ['binding', 'result'])
    if 'review' not in c or c['review'] is not None and (not _strings(c['review'], ['binding', 'result']) or not re.fullmatch('[a-f0-9]{64}', c['review']['binding'])):
        raise ValueError('点検結果の形式が違います')
    if len(json.dumps(c, ensure_ascii=False, separators=(',', ':'))) > 2000000:
        raise ValueError('データが大きすぎます')
    return copy.deepcopy(c)


def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':'), allow_nan=False)


def binding(context, guide):
    c = validate(context)
    del c['review']
    return hashlib.sha256(canonical(dict(context=c, rules=guide)).encode()).hexdigest()


def prompt(stage, context, guide):
    context = validate(context)
    if stage not in guide['stages']:
        raise ValueError('段階はresearch / prepare / compose / reviewです')
    if stage in ['compose', 'review'] and not context['files']['template']:
        raise ValueError('先にフォーマットを読み込んでください')
    if stage == 'review' and not context['files']['draft']:
        raise ValueError('先に完成稿を読み込んでください')
    return (guide['common'] + '\n\n# 今回の作業\n' + guide['stages'][stage]
            + '\n\n# 公式要項・準備資料（確認日を再点検）\n' + json.dumps(guide, ensure_ascii=False, indent=2)
            + '\n\n# 点検対象 binding\n' + binding(context, guide)
            + '\n\n# 文脈データ（JSON全体を維持）\n' + json.dumps(context, ensure_ascii=False, indent=2)
            + '\n\n原本が別添されていなければ、ファイル名を示して添付を依頼してください。読んでいない原本の視覚確認は完了としないでください。')


def extract(path: Path):
    if not 0 < path.stat().st_size <= LIMIT:
        raise ValueError('空のファイル、または15MBを超えるファイルは読めません')
    data = path.read_bytes()
    ext = path.suffix.lower()
    warnings = ['図・写真・配置は原本での視覚確認が必要です']
    if ext in ['.txt', '.md']:
        texts = [data.decode('utf-8-sig')]
    elif ext in ['.pptx', '.docx']:
        with zipfile.ZipFile(io.BytesIO(data)) as z:
            size = 0
            def read(name):
                nonlocal size
                info = z.getinfo(name)
                size += info.file_size
                if size > LIMIT or info.file_size > 4*1024*1024:
                    raise ValueError('展開後の文書が大きすぎます')
                xml = z.read(name)
                if re.search(br'<!DOCTYPE|<!ENTITY', xml, re.I):
                    raise ValueError('XMLを読み取れません')
                return ET.fromstring(xml)
            def paragraph(node):
                tag = node.tag.rsplit('}', 1)[-1]
                if tag == 't':
                    return node.text or ''
                if tag == 'tab':
                    return '\t'
                if tag in ['br', 'cr']:
                    return '\n'
                return ''.join(paragraph(child) for child in node if child.tag.rsplit('}', 1)[-1] != 'p')
            def text(node):
                return '\n'.join(paragraph(p) for p in node.iter() if p.tag.rsplit('}', 1)[-1] == 'p')
            if ext == '.docx':
                texts = [text(read('word/document.xml'))]
            else:
                presentation = read('ppt/presentation.xml')
                rels = {r.get('Id'): r.get('Target') for r in read('ppt/_rels/presentation.xml.rels') if r.get('TargetMode') != 'External'}
                slides = [s for s in presentation.iter() if s.tag.rsplit('}', 1)[-1] == 'sldId']
                if not 1 <= len(slides) <= 100:
                    raise ValueError('スライド数は1〜100までです')
                texts = []
                for s in slides:
                    rid = next((v for k, v in s.attrib.items() if k.endswith('}id')), None)
                    target = rels.get(rid, '')
                    name = target[1:] if target.startswith('/ppt/') else 'ppt/' + target.removeprefix('./')
                    if not re.fullmatch(r'ppt/slides/slide\d+\.xml', name):
                        raise ValueError('対応できないスライド参照です')
                    texts.append(text(read(name)))
    elif ext == '.pdf':
        from pypdf import PdfReader
        pdf = PdfReader(io.BytesIO(data))
        if pdf.is_encrypted:
            raise ValueError('暗号化PDFには対応していません')
        if not 1 <= len(pdf.pages) <= 100:
            raise ValueError('PDFは1〜100ページまでです')
        texts = []
        for page in pdf.pages:
            content = page.get_contents()
            if content and len(content.get_data()) > LIMIT:
                raise ValueError('PDFの展開後のページが大きすぎます')
            texts.append(page.extract_text() or '')
    else:
        raise ValueError('PDF・PPTX・DOCX・TXT・MDを選んでください')
    if ext in ['.docx', '.txt', '.md']:
        warnings.append('本文を1単位で抽出しています。実際のページ数・改ページ位置は未確認です')
    for i, t in enumerate(texts):
        if not t.strip():
            warnings.append(f'{i+1}ページ目の文字を抽出できません。空欄か画像かを原本で確認し、必要ならOCRを行ってください')
    if sum(map(len, texts)) > 500000:
        raise ValueError('抽出文字数が多すぎます（50万文字まで）')
    return dict(name=path.name, sha256=hashlib.sha256(data).hexdigest(), pages=[dict(number=i+1, text=t) for i, t in enumerate(texts)], warnings=warnings)
