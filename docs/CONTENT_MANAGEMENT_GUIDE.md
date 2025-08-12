# シンセイダー コンテンツ管理 達人向けガイド

## 概要

このガイドは、シンセイダーのコンテンツ管理システムを効率的に運用するための上級者向け手順書です。

## システム構成

```
attg/
├── data_input/          # 生データ投入ディレクトリ（gitignoreされる）
│   ├── news/           # ニュース・お知らせ
│   ├── subsidies/      # 補助金制度情報
│   ├── knowledge_base/ # 基礎知識コンテンツ
│   └── raw_data/       # 未分類データ
├── backend/             # YAML データベース
│   ├── news_content.yaml
│   ├── subsidies.yaml
│   └── knowledge_base.yaml
├── prompts/            # Claude Code 処理テンプレート
│   └── content_review_template.md
└── scripts/            # 自動化スクリプト
    ├── update_content.sh
    └── update_content.py
```

## 基本ワークフロー

### 1. データ収集・投入

```bash
# 適切なディレクトリにファイルを配置
# ファイル命名規則に従う
cp ~/Downloads/新しい補助金情報.txt data_input/subsidies/subsidy_monodukuri_20250812.txt
cp ~/Downloads/ニュース記事.md data_input/news/news_20250812_kobo.md
```

### 2. 自動処理実行

```bash
# 方法A: シェルスクリプト（推奨）
./scripts/update_content.sh

# 方法B: Pythonスクリプト
python3 scripts/update_content.py

# 方法C: 個別処理
claude code "data_input/news/news_20250812_*.txt の内容を prompts/content_review_template.md のプロンプトで精査し、適切なYAMLを生成して backend/news_content.yaml に追加してください"
```

### 3. 品質チェック・テスト

```bash
# YAML構文チェック
claude code "backend/ の全YAMLファイルの構文と内容をチェックし、問題があれば修正してください"

# 重複チェック
claude code "backend/ の全YAMLファイルで重複コンテンツがないかチェックしてください"

# リンク検証
claude code "backend/news_content.yaml の全URLの有効性をチェックしてください"

# アプリケーションテスト
cd frontend/client && npm start  # Port 3333
cd backend && python3 main.py    # Port 8000
```

## 高度な運用テクニック

### バッチ処理

```bash
# 複数ファイル一括処理
claude code "data_input/ ディレクトリの全ファイルを精査し、適切なYAMLファイルに反映してください。処理状況も報告してください"

# 特定カテゴリ一括更新
find data_input/news -name "*.txt" -exec claude code "\"{}\" の内容をnews_content.yamlに統合" \;
```

### Git統合ワークフロー

```bash
# 変更確認
git status
git diff backend/

# コミット
git add backend/
git commit -m "feat: 補助金制度情報更新 - ものづくり補助金17次公募対応

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

# プッシュ（必要に応じて）
git push origin main
```

### データ整合性チェック

```bash
# ID重複チェック
claude code "backend/ の全YAMLファイルでID重複をチェックし、見つかった場合は修正案を提示してください"

# 日付形式統一チェック
claude code "backend/ の全YAMLファイルで日付形式がYYYY-MM-DDに統一されているかチェックしてください"

# 必須フィールドチェック
claude code "backend/news_content.yaml の全エントリで必須フィールド（id, title, date, content）が存在するかチェックしてください"
```

## トラブルシューティング

### よくある問題と解決方法

#### 1. YAML構文エラー

```bash
# 症状: アプリケーション起動時にエラー
# 解決方法:
claude code "backend/news_content.yaml の構文をチェックして修正してください。特にインデント、クォート、特殊文字をチェック"
```

#### 2. 重複ID問題

```bash
# 症状: 同じIDのコンテンツが複数存在
# 解決方法:
claude code "backend/ の全YAMLファイルでID重複をチェックし、重複があれば一意のIDに変更してください"
```

#### 3. リンク切れ

```bash
# 症状: 外部リンクが無効
# 解決方法:
claude code "backend/news_content.yaml の全URLの有効性をチェックし、無効なURLがあれば修正または削除してください"
```

#### 4. 文字エンコーディング問題

```bash
# 症状: 日本語が文字化け
# 解決方法:
iconv -f SHIFT_JIS -t UTF-8 data_input/news/problematic_file.txt > data_input/news/fixed_file.txt
```

## 監視・メンテナンス

### 定期チェックリスト

#### 週次作業
- [ ] 新規補助金情報の収集・更新
- [ ] リンク有効性チェック
- [ ] アプリケーション動作確認

#### 月次作業
- [ ] 古いニュース記事のアーカイブ
- [ ] 補助金制度の期限チェック
- [ ] データベース最適化

#### 四半期作業
- [ ] コンテンツ品質監査
- [ ] ユーザーフィードバック反映
- [ ] システム性能評価

### 監視コマンド

```bash
# ファイル数監視
find data_input -name "*.txt" -o -name "*.md" | wc -l

# YAMLファイルサイズ監視
du -h backend/*.yaml

# アプリケーション稼働確認
curl -f http://localhost:8000/news
curl -f http://localhost:3333
```

## 高度なClaude Code活用

### カスタムプロンプト例

```bash
# 詳細分析
claude code "data_input/raw_data/complex_document.pdf を分析し、以下の観点で評価してください: 1)信頼性 2)最新性 3)実用性 4)対象ユーザー。結果に応じて適切なYAMLファイルに分類してください"

# 比較分析
claude code "新しい補助金制度（data_input/subsidies/new_scheme.txt）と既存制度（backend/subsidies.yaml）を比較し、差分と影響を分析してください"

# 品質向上
claude code "backend/knowledge_base.yaml の内容を見直し、ユーザビリティの観点から改善提案をしてください。特に初心者向けの説明を充実させてください"
```

### エラーハンドリング

```bash
# 処理失敗時の復旧
git checkout HEAD -- backend/  # 変更をリセット
./scripts/update_content.sh    # 再処理

# バックアップからの復旧
cp backup/news_content.yaml.backup backend/news_content.yaml
```

## パフォーマンス最適化

### 大量データ処理

```bash
# 並列処理（注意: Claude Code レート制限に注意）
find data_input -name "*.txt" -print0 | xargs -0 -P 4 -I {} claude code "\"{}\" を適切なYAMLファイルに統合"

# メモリ効率的な処理
split -l 100 large_data_file.txt chunk_
for chunk in chunk_*; do
    claude code "\"$chunk\" を処理してください"
done
```

### バックアップ戦略

```bash
# 自動バックアップスクリプト
#!/bin/bash
BACKUP_DIR="backup/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp backend/*.yaml "$BACKUP_DIR/"
echo "バックアップ完了: $BACKUP_DIR"
```

## セキュリティ考慮事項

1. **機密情報の保護**
   - data_input/ ディレクトリは自動的にgitignoreされる
   - 処理前に機密情報の有無を確認

2. **アクセス制御**
   - スクリプトの実行権限を適切に設定
   - 本番環境では読み取り専用ユーザーを使用

3. **監査ログ**
   - 重要な変更はgitコミットで記録
   - Claude Codeの実行ログを保存

## まとめ

このガイドに従って運用することで、効率的で品質の高いコンテンツ管理が実現できます。定期的にシステムの見直しを行い、継続的な改善を心がけてください。

---

**重要**: 本番運用前には必ずテスト環境での動作確認を行ってください。