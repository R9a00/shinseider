from docx import Document
from docx.shared import Inches

def generate_word(file_path: str, content: str):
    document = Document()
    document.add_heading('事業計画書', 0)

    # HTMLの<br/>タグを改行に変換
    processed_content = content.replace('<br/>', '\n')

    # 改行で分割してパラグラフを追加
    for paragraph_text in processed_content.split('\n'):
        document.add_paragraph(paragraph_text)

    document.save(file_path)

