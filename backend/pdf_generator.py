from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph


def generate_pdf(file_path: str, title: str, content: str):
    # フォントを登録
    # pdfmetrics.registerFont(TTFont('NotoSansJP', 'NotoSansJP-Regular.ttf'))
    # pdfmetrics.Font('NotoSansJP', 'NotoSansJP', 'Identity-H')
    # pdfmetrics.registerFontFamily('NotoSansJP', normal='NotoSansJP')
    print("DEBUG: Font registration commented out.")

    c = canvas.Canvas(file_path, pagesize=letter)
    width, height = letter

    # タイトル
    c.setFont('Helvetica', 32)
    c.drawString(30, height - 50, title)
    print(f"DEBUG: Title drawn: {title}")

    # コンテンツ
    styles = getSampleStyleSheet()
    style = styles['Normal']
    style.fontName = 'Helvetica'
    p = Paragraph(content, style)
    p.wrapOn(c, width - 60, height - 100)
    p.drawOn(c, 30, height - 100)

    c.save()
    print("DEBUG: PDF saved.")

# Noto Sans JPフォントをダウンロードしておく必要があります
# https://fonts.google.com/noto/specimen/Noto+Sans+JP
