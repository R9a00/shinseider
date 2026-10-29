"""Small parser fixtures; not official templates or sample applications."""
from pathlib import Path
from zipfile import ZipFile
from pypdf import PdfWriter
from pypdf.generic import DictionaryObject, NameObject, DecodedStreamObject


def create(root: Path):
    root.mkdir(parents=True, exist_ok=True)
    for filename, title in [('format.pptx', 'TEST TEMPLATE'), ('draft.pptx', 'MONTHLY 40000 x 3 YEARS = 120000')]:
        with ZipFile(root / filename, 'w') as z:
            z.writestr('ppt/presentation.xml', '<p:presentation xmlns:p="urn:p" xmlns:r="urn:r"><p:sldIdLst>'+''.join(f'<p:sldId id="{i}" r:id="r{i}"/>' for i in [2,1,3,4,5,6,7,8])+'</p:sldIdLst></p:presentation>')
            z.writestr('ppt/_rels/presentation.xml.rels', '<Relationships>'+''.join(f'<Relationship Id="r{i}" Target="slides/slide{i}.xml"/>' for i in range(1,9))+'</Relationships>')
            for i in range(1,9):
                z.writestr(f'ppt/slides/slide{i}.xml', f'<p:sld xmlns:p="urn:p" xmlns:a="urn:a"><a:p><a:r><a:t>{title} slide {i}</a:t></a:r></a:p></p:sld>')
    with ZipFile(root / 'notes.docx', 'w') as z:
        z.writestr('word/document.xml', '<w:document xmlns:w="urn:w"><w:p><w:r><w:t>家業の記録</w:t></w:r></w:p></w:document>')
    writer=PdfWriter();page=writer.add_blank_page(width=720,height=405)
    font=DictionaryObject({NameObject('/Type'):NameObject('/Font'),NameObject('/Subtype'):NameObject('/Type1'),NameObject('/BaseFont'):NameObject('/Helvetica')})
    page[NameObject('/Resources')]=DictionaryObject({NameObject('/Font'):DictionaryObject({NameObject('/F1'):writer._add_object(font)})})
    stream=DecodedStreamObject();stream.set_data(b'BT /F1 18 Tf 20 350 Td (TEST DRAFT 40000 x 36 = 1440000) Tj ET')
    page[NameObject('/Contents')]=writer._add_object(stream);writer.add_blank_page(width=720,height=405)
    writer.write(root/'draft.pdf')
    (root/'memo.md').write_text('本人の材料\n売上の累計は144万円。')
