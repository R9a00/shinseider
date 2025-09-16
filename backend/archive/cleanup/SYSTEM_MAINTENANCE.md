# 🔧 補助金システム 統合保守運用ガイド

## 📝 実行指示: 「定期保守を実行してください」

### 🎯 メイン保守コマンド
```bash
python3 comprehensive_maintenance_executor.py
```

### 🔍 完全性チェック
```bash
python3 minimal_integrity_checker.py
```

## 📋 保守作業手順

### Phase 1: システム状態確認
1. 完全性チェック実行
2. データ整合性確認
3. 期限切れ補助金検出

### Phase 2: 情報更新
1. LLM調査実行
2. 補助金データ更新
3. バージョン履歴記録

### Phase 3: 結果確認
1. 更新結果検証
2. エラーログ確認
3. バックアップ作成

## 🗂️ 主要ファイル構成

### データファイル
- `subsidy_master.yaml` - マスターデータ（Single Source of Truth）
- `subsidies.yaml` - API用データ（自動生成）
- `version_history.yaml` - 更新履歴管理

### システムファイル  
- `comprehensive_maintenance_executor.py` - メイン保守ツール
- `minimal_integrity_checker.py` - 完全性チェッカー
- `main.py` - FastAPI サーバー

### 設定ファイル
- `system_integrity_framework.yaml` - 完全性フレームワーク
- `config.py` - システム設定

## ⚠️ 重要な運用ルール

1. **再現性を保つ** - 手動データ修正は禁止
2. **Single Source of Truth** - `subsidy_master.yaml`を唯一の真実とする
3. **自動化優先** - LLM調査と自動更新システムを活用
4. **完全性チェック必須** - 更新前後に必ず実行
5. **バックアップ保持** - 重要な変更前には必ずバックアップ

## 🔄 更新サイクル

- **日次**: 完全性チェック
- **週次**: LLM調査による情報更新
- **月次**: システム全体の包括的保守
- **随時**: 緊急更新・ユーザー要望対応