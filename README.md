# シンセイダー — アトツギのための準備室

https://shinseider.onrender.com で公開している静的サイトのソースです。
中小企業庁が任命するアトツギ甲子園アンバサダーが個人で運営する、非公式・無償の申請準備ツールです。掲載情報には出典と確認日を付記しています。正確な情報は必ず[アトツギ甲子園公式](https://atotsugi-koshien.go.jp/)・各補助金の公募要領原文をご確認ください。

## 構成

- `site/build.py` — `data/` のYAMLとテンプレートから静的サイトを `site/dist/` に生成
- `data/` — 掲載情報の元データ（出典・確認日つき）
- `render.yaml` — Render Static Site のビルド定義

## ビルド

```bash
pip install pyyaml jinja2
python3 site/build.py
```

旧システム（React + FastAPI版）のコードは `archive/v1` ブランチにあります。

## 問い合わせ導線

「相談できる人」ページの紹介文直後に「問い合わせ先」リンクを置き、運営者ページの `about.html#contact` に直接移動します。連絡先は同ページに掲載するX・Facebook・会社サイトです。
直接移動した場合も宛先がわかるよう、見出しに「運営者へのお問い合わせ」、本文に運営者名を明記します。

## 検証と保存仕様

```bash
pip install -r site/requirements-test.txt
python -m playwright install chromium
node --test site/tests/*.test.cjs
python -m unittest discover -s site/tests -p 'test_*.py'
python site/test_site.py
python site/audit_site.py
```

GitHub Actionsで同じ回帰検査を実行します。保存の成功・失敗、複数タブでの競合、控えの扱いは [ブラウザー保存の仕様](site/STORAGE.md) を参照してください。

## 深掘りの記入例

掲載例の正本は `data/fukabori.yaml`。対応する `data/question_bank.yaml` の例も同時に更新する。企業・数値は説明用の仮定であり、実在企業の実績や最新の制度条件ではない。

2026-10-29に全24ブロックの記入例を点検。月額×年数の換算を修正し、売上累計のLTVを144万円、獲得費用5万円に対する比率を28.8とした。原価率60%での粗利ベースは57.6万円・11.52で、健全性の断定はしない。市場・収益・費用の例は顧客100社×年6件×8万円＝年4,800万円、SAM240億円に対するシェア0.2%、月次費用440万円・利益△40万円で統一した。補助金控除前の初期投資1,100万円と資金繰りは区別する。既存の利用者の下書きは自動で書き換えない。

## 全体点検

[2026-10-29の検査記録](docs/AUDIT_20261029.md)に対象・修正・検証・未確認事項を記載しています。補助金の詳細は15次の参考情報、16次は受付期間を確認済みです。資格判定は簡易見立てであり、全条件の確認を代行しません。
