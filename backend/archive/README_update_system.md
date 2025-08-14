# 補助金情報 統合更新システム

## 概要
このシステムは`version_history.yaml`を中心とした情報更新履歴管理により、個別管理の手間を削減し、一元的な情報更新を実現します。

## システム構成

```
補助金情報更新システム
├── version_history.yaml          # 📋 マスター履歴・参照元管理
├── subsidies.yaml               # 💾 実際の補助金データ  
├── llm_update_prompt.md         # 🤖 LLM調査プロンプト（自動生成）
├── update_prompt_generator.py   # 🔄 プロンプト自動生成スクリプト
├── update_subsidies_from_research.py # 📥 調査結果反映スクリプト
└── update_schedule_prompt.md    # 📅 人間用更新手順
```

## 使用方法

### 1. 定期更新（推奨）

**Step 1: 最新プロンプトを生成**
```bash
cd /Users/r9a/exp/attg/backend
python3 update_prompt_generator.py
```
→ `version_history.yaml`から最新の参照元URLを読み取り、`llm_update_prompt.md`を自動更新

**Step 2: LLMで調査実行**
```bash
# llm_update_prompt.mdの内容をClaude等のLLMに投入
# 結果をYAMLファイルとして保存（例: research_2025-08-14.yaml）
```

**Step 3: 調査結果を反映**
```bash
python3 update_subsidies_from_research.py
# プロンプトに従って調査結果YAMLファイルのパスを入力
```
→ 自動で`subsidies.yaml`と`version_history.yaml`を更新、バックアップも作成

### 2. 緊急更新（制度変更時）

**Step 1: 直接編集**
```bash
# subsidies.yamlの該当補助金を直接編集
# application_period情報を更新
```

**Step 2: 履歴記録**
```bash
# version_history.yamlに変更履歴を手動記録
# change_historyに新しいエントリを追加
```

**Step 3: プロンプト同期**
```bash
python3 update_prompt_generator.py
# 変更をLLMプロンプトに反映
```

## ファイル詳細

### version_history.yaml
- **役割**: 全補助金の更新履歴と参照元URLの一元管理
- **重要項目**:
  - `source_references`: 公式サイトURL、最終確認日
  - `change_history`: 詳細な変更履歴
  - `last_updated`: 最終更新日

### llm_update_prompt.md（自動生成）
- **役割**: LLM向け調査指示書
- **特徴**: `version_history.yaml`から自動生成、手動編集不要
- **内容**: 各補助金の公式URL、前回確認日、調査指示

### update_prompt_generator.py
- **役割**: `version_history.yaml`→`llm_update_prompt.md`の自動同期
- **実行タイミング**: 定期更新前、緊急更新後

### update_subsidies_from_research.py
- **役割**: LLM調査結果の自動反映
- **機能**: 
  - 自動バックアップ作成
  - `subsidies.yaml`の`application_period`更新
  - `version_history.yaml`の変更履歴追加
  - バージョン番号自動インクリメント

## 利点

### ✅ 解決された問題
1. **個別管理の手間削減**: 複数ファイルを個別に更新する必要がなくなった
2. **参照元の一元管理**: `version_history.yaml`で全ての公式URLを統合管理
3. **自動同期**: プロンプトファイルが履歴情報と自動で同期
4. **バックアップ自動化**: 更新時に自動でバックアップ作成
5. **変更追跡**: 全ての更新が履歴として記録される

### 🔄 更新フロー
```
version_history.yaml (マスター)
    ↓ 自動生成
llm_update_prompt.md
    ↓ LLM調査
research_results.yaml
    ↓ 自動反映
subsidies.yaml + version_history.yaml (更新)
    ↓ 自動同期
llm_update_prompt.md (最新化)
```

## 注意事項

1. **version_history.yamlが情報の中心**: このファイルを正確に管理すること
2. **llm_update_prompt.mdは自動生成**: 手動編集は避け、必要に応じてスクリプトを修正
3. **バックアップ確認**: 重要な更新前は手動バックアップも推奨
4. **URL有効性**: 公式サイトのURL変更に注意、定期的な確認が必要

## トラブルシューティング

**Q: LLMプロンプトに古い情報が残る**
A: `python3 update_prompt_generator.py`を実行して同期

**Q: 調査結果の反映でエラー**
A: `research_results.yaml`のYAML形式を確認、必要に応じてスクリプトのIDマッピングを調整

**Q: version_history.yamlが破損**
A: `.backup.*`ファイルから復旧可能