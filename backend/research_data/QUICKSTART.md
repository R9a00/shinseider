# 調査データ管理システム - クイックスタート

## 1. 新しい調査を開始する

### URL調査の場合
```bash
# テンプレートをコピー
cp templates/url_research_template.yaml investigations/2025-01-11_url_research_claude.yaml

# 調査を実行して結果を記入
# ... 調査作業 ...

# 調査結果を検証
python scripts/validate_research_data.py investigations/2025-01-11_url_research_claude.yaml

# version_history.yaml に反映
python scripts/merge_research_data.py investigations/2025-01-11_url_research_claude.yaml
```

### 政策変更調査の場合
```bash
# テンプレートをコピー
cp templates/policy_update_template.yaml investigations/2025-01-11_policy_updates_claude.yaml

# 調査を実行して結果を記入
# ... 調査作業 ...

# 検証と反映
python scripts/validate_research_data.py investigations/2025-01-11_policy_updates_claude.yaml
python scripts/merge_research_data.py investigations/2025-01-11_policy_updates_claude.yaml
```

## 2. 典型的なワークフロー

### 定期URL調査 (月1回)
1. テンプレートをコピー: `url_research_template.yaml`
2. 6つの補助金の公式サイトを確認
3. 変更があった場合は `new_information` セクションに記録
4. 検証スクリプトで構文チェック
5. マージスクリプトで `version_history.yaml` に反映

### 緊急政策変更対応
1. 公式発表・通知を受信
2. `policy_update_template.yaml` から調査ファイル作成
3. 変更内容を詳細に記録
4. 高インパクトの変更は `impact: "high"` を設定
5. 即座に反映して関係者に通知

## 3. ファイル命名例

```
investigations/
├── 2025-01-11_url_research_claude.yaml          # 定期URL調査
├── 2025-01-15_policy_updates_official.yaml      # 公式通知による更新
├── 2025-02-01_new_subsidies_research_claude.yaml # 新規補助金調査
├── 2025-02-15_requirement_changes_manual.yaml    # 申請要件変更
└── 2025-03-01_deadline_updates_claude.yaml       # 締切情報更新
```

## 4. よくある調査パターン

### パターン1: URL変更
```yaml
findings:
  monodukuri_r7_21th:
    changes_detected: true
    new_information:
      - field: "official_url"
        old_value: "https://old-portal.monodukuri-hojo.jp/"
        new_value: "https://new-portal.monodukuri-hojo.jp/"
        confidence: "high"
        source: "official redirect"
```

### パターン2: 申請要件変更
```yaml
findings:
  shoukuritsuka_ippan:
    changes_detected: true
    new_information:
      - field: "minimum_investment"
        old_value: "500000"
        new_value: "1000000"
        confidence: "high"
        source: "updated guideline"
        impact: "high"
```

### パターン3: 新規補助金発見
```yaml
findings:
  new_dx_support_2025:
    is_new_subsidy: true
    official_name: "中小企業DX推進支援補助金"
    target_industries: ["製造業", "小売業", "サービス業"]
    managing_agency: "中小企業庁"
    confidence: "high"
    source: "official press release"
```

## 5. 緊急時の対応

### 重要な変更が発見された場合
1. 🚨 `critical_changes: true` を metadata に設定
2. 📞 影響の大きい補助金は即座に関係者に連絡
3. 📝 変更内容を詳細にドキュメント化
4. 🔄 システムに即座に反映

### バックアップからの復旧
```bash
# バックアップファイルを確認
ls -la ../../version_history.yaml.backup.*

# 復旧
cp ../../version_history.yaml.backup.20250111_143000 ../../version_history.yaml
```

## 6. 品質保証チェックリスト

調査完了前に以下を確認:
- [ ] 全ての URL が実際にアクセス可能
- [ ] 信頼度レベルが適切に設定されている
- [ ] 変更の影響度が正しく評価されている
- [ ] ソース（出典）が明記されている
- [ ] 日付形式が正しい (YYYY-MM-DD)
- [ ] 検証スクリプトでエラーが出ない

これで Claude Code を使った効率的な調査データ管理が可能になります！