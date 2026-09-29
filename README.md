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

## 検証と保存仕様

```bash
pip install -r site/requirements-test.txt
python -m playwright install chromium
node --test site/tests/*.test.cjs
python -m unittest discover -s site/tests -p 'test_*.py'
python site/test_site.py
```

GitHub Actionsで同じ回帰検査を実行します。保存の成功・失敗、複数タブでの競合、控えの扱いは [ブラウザー保存の仕様](site/STORAGE.md) を参照してください。
