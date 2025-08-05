# Git管理ガイド

## 概要

事業承継・補助金申請サポートシステムのGit管理ガイドです。

## リポジトリ構成

### ブランチ戦略
```
main (本番環境)
├── develop (開発環境)
├── feature/security-implementation (セキュリティ実装)
├── feature/api-documentation (API仕様書)
└── hotfix/security-patch (緊急セキュリティ修正)
```

### 現在のブランチ状況
- **main**: 本番環境用ブランチ
- **最新コミット**: セキュリティ実装の完了とドキュメント整備

## コミット履歴

### 最新コミット
```
50eb380 (HEAD -> main) feat: セキュリティ実装の完了とドキュメント整備
- セキュリティ要件10項目の完全実装
- API仕様書の作成
- 運用ガイドの作成
- セキュリティテストの追加
- LLMプロンプト生成機能のセキュリティ強化
- ドキュメント完全性チェックリストの作成
```

### 主要なコミット履歴
```
50eb380 feat: セキュリティ実装の完了とドキュメント整備
26396c5 feat: 補助金申請サポート機能の抜本的改修
2623b92 feat: Implement enhanced BusinessPlan Word generation
d9b8db3 feat: Implement enhanced BusinessPlan Word generation
8dd1cb2 feat: Implement enhanced BusinessPlan Word generation
```

## ファイル管理

### 追跡対象ファイル
- **ソースコード**: `backend/`, `frontend/`
- **ドキュメント**: `*.md`ファイル
- **設定ファイル**: `.gitignore`, `requirements.txt`, `package.json`

### 除外対象ファイル
```gitignore
# 一時ファイル
backend/temp_files/
backend/*.tmp
backend/*.docx
backend/desire.txt
backend/textbook.docx
backend/business_plan.docx

# ログファイル
*.log
backend/backend_output.log

# 環境変数
.env
.env.local
.env.production

# IDE設定
.vscode/
.idea/
*.swp
*.swo

# 依存関係
node_modules/
venv/
__pycache__/
```

## 開発ワークフロー

### 1. 新機能開発
```bash
# 開発ブランチの作成
git checkout -b feature/new-feature

# 開発作業
# ...

# コミット
git add .
git commit -m "feat: 新機能の実装"

# プルリクエスト作成
git push origin feature/new-feature
```

### 2. セキュリティ修正
```bash
# セキュリティブランチの作成
git checkout -b hotfix/security-patch

# セキュリティ修正
# ...

# コミット
git add .
git commit -m "fix: セキュリティ脆弱性の修正"

# 緊急マージ
git checkout main
git merge hotfix/security-patch
```

### 3. ドキュメント更新
```bash
# ドキュメントブランチの作成
git checkout -b docs/update-api-spec

# ドキュメント更新
# ...

# コミット
git add .
git commit -m "docs: API仕様書の更新"
```

## コミットメッセージ規約

### 形式
```
<type>(<scope>): <subject>

<body>

<footer>
```

### タイプ
- **feat**: 新機能
- **fix**: バグ修正
- **docs**: ドキュメント更新
- **style**: コードスタイル修正
- **refactor**: リファクタリング
- **test**: テスト追加・修正
- **chore**: その他の変更

### 例
```bash
# 新機能
git commit -m "feat: セキュリティミドルウェアの実装"

# バグ修正
git commit -m "fix: パストラバーサル攻撃対策の修正"

# ドキュメント
git commit -m "docs: API仕様書の追加"

# 設定変更
git commit -m "chore: .gitignoreの更新"
```

## セキュリティ管理

### 機密情報の管理
- **環境変数**: `.env`ファイルはGitに含めない
- **APIキー**: 設定ファイルに直接記載しない
- **ログファイル**: セキュリティログは除外

### セキュリティコミット
```bash
# セキュリティ修正の例
git commit -m "fix(security): パストラバーサル攻撃対策の実装

- ファイルパス検証機能の追加
- 危険な文字列の検出
- セキュリティログの記録

Closes #123"
```

## ブランチ保護

### mainブランチの保護
- **直接プッシュ禁止**: プルリクエスト必須
- **レビュー必須**: 最低1名のレビュー
- **テスト必須**: CI/CDパイプラインの通過必須

### developブランチの保護
- **直接プッシュ禁止**: プルリクエスト必須
- **レビュー推奨**: 自動テストの通過必須

## リリース管理

### タグ付け
```bash
# セマンティックバージョニング
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

### リリースノート
```markdown
# v1.0.0 - セキュリティ実装完了

## 新機能
- セキュリティ要件10項目の完全実装
- API仕様書の作成
- 運用ガイドの作成

## セキュリティ
- リクエストサイズ制限（1MB）
- パストラバーサル攻撃対策
- データ型検証の強化
- レート制限の実装

## ドキュメント
- API仕様書の追加
- 運用ガイドの追加
- セキュリティ要件定義書の追加
```

## トラブルシューティング

### よくある問題

#### 1. 大きなファイルのコミット
```bash
# ファイルサイズの確認
git ls-files | xargs ls -la

# 大きなファイルの除外
echo "large_file.zip" >> .gitignore
git rm --cached large_file.zip
```

#### 2. 機密情報の誤コミット
```bash
# コミット履歴から削除
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch config/secrets.json' \
  --prune-empty --tag-name-filter cat -- --all
```

#### 3. ブランチの競合解決
```bash
# 競合の確認
git status

# 競合の解決
# ファイルを編集して競合を解決

# 解決後のコミット
git add .
git commit -m "merge: 競合の解決"
```

## ベストプラクティス

### 1. コミット前のチェック
```bash
# ステージングエリアの確認
git diff --cached

# 未追跡ファイルの確認
git status

# セキュリティチェック
# 機密情報が含まれていないか確認
```

### 2. 定期的なメンテナンス
```bash
# 古いブランチの削除
git branch --merged | grep -v "\*" | xargs -n 1 git branch -d

# リモートブランチの同期
git fetch --prune

# ログの整理
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### 3. セキュリティ監査
```bash
# 機密情報の検索
git log -p | grep -i "password\|secret\|key"

# 大きなファイルの検索
git rev-list --objects --all | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | sed -n 's/^blob //p' | sort -nr -k 2 | head -10
```

## 自動化

### GitHub Actions設定例
```yaml
name: Security Check
on: [push, pull_request]
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Security scan
        run: |
          # セキュリティスキャン
          npm audit
          pip-audit
```

---

**最終更新**: 2024年12月
**バージョン**: 1.0.0 