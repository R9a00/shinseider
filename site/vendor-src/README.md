# ローカル文書パーサー

`npm ci --ignore-scripts --omit=optional` 後に `node sync.mjs` で固定版を `site/static/` へ複製します。公開時にCDNへ依存せず、選択された文書を外部へアップロードしません。LICENSEも同梱します。変更時は文書読込みのブラウザーテストを実施します。

- PDF.js 6.4.299（Apache-2.0）: https://mozilla.github.io/pdf.js/
- fflate 0.8.3（MIT）: https://github.com/101arrowz/fflate

PDFの文字抽出のみ。画像認識、OCR、編集、レイアウト評価は実装していません。空ページとして抽出された場合は、未確認として原本確認を案内します。
