# 調査データ管理システム

## フォルダ構造

```
research_data/
├── README.md                    # このファイル
├── investigations/              # 調査結果ファイル
│   ├── 2025-01-11_url_research.yaml
│   ├── 2025-02-01_policy_updates.yaml
│   └── [YYYY-MM-DD]_[調査内容].yaml
├── templates/                   # テンプレート
│   ├── url_research_template.yaml
│   ├── policy_update_template.yaml
│   └── general_research_template.yaml
└── scripts/                    # 管理用スクリプト
    ├── merge_research_data.py
    ├── validate_research_data.py
    └── generate_version_history.py
```

## 命名規則

### ファイル名
- **基本形式**: `YYYY-MM-DD_[調査内容]_[調査者].yaml`
- **例**: 
  - `2025-01-11_url_research_claude.yaml`
  - `2025-02-15_policy_updates_manual.yaml`
  - `2025-03-01_new_subsidies_research.yaml`

### 調査内容の分類
- `url_research`: URL・公式サイト調査
- `policy_updates`: 政策・制度変更調査  
- `new_subsidies`: 新規補助金調査
- `requirement_changes`: 要件変更調査
- `deadline_updates`: 締切・スケジュール更新
- `general_research`: その他の調査

### 調査者識別
- `claude`: Claude Code による調査
- `manual`: 手動調査
- `web_scraping`: 自動スクレイピング
- `official_notice`: 公式通知による更新

## データフォーマット標準

### 調査結果の基本構造
```yaml
investigation:
  date: "YYYY-MM-DD"
  investigator: "claude/manual/etc"
  type: "url_research/policy_updates/etc"
  scope: ["subsidy_id1", "subsidy_id2"]
  
findings:
  subsidy_id:
    changes_detected: true/false
    last_verified_url: "https://..."
    new_information:
      - field: "url"
        old_value: "https://old-url.com"
        new_value: "https://new-url.com"
        confidence: "high/medium/low"
        source: "official announcement"
    
metadata:
  research_duration: "30 minutes"
  tools_used: ["web_browser", "official_documents"]
  next_check_recommended: "2025-02-11"
```

## 使用方法

### 1. 新しい調査を開始
1. `templates/` から適切なテンプレートをコピー
2. `investigations/` フォルダに命名規則に従って配置
3. 調査を実行して結果を記入

### 2. 調査データの検証
```bash
python scripts/validate_research_data.py investigations/2025-01-11_url_research.yaml
```

### 3. version_history.yaml への反映
```bash
python scripts/merge_research_data.py investigations/2025-01-11_url_research.yaml
```

### 4. 全体レポートの生成
```bash
python scripts/generate_version_history.py --output-format summary
```

## 品質管理

### 必須チェック項目
- [ ] URLの有効性確認（実際にアクセス）
- [ ] 情報の最新性確認（更新日付）
- [ ] 複数ソースでのクロスチェック
- [ ] 前回調査からの変更点の明確化

### 信頼度レベル
- **high**: 公式サイト・公式文書で確認済み
- **medium**: 信頼できるソースだが要再確認
- **low**: 未確認情報・要検証

## 更新頻度の推奨

### 定期調査スケジュール
- **毎月1回**: 主要補助金のURL・基本情報チェック
- **四半期1回**: 政策変更・新規制度の調査
- **随時**: 公式通知があった場合の緊急更新

### 優先度別の調査頻度
- **高優先度**: atotsugi, monodukuri_r7_21th, shoukuritsuka_ippan
  - 月1回の詳細チェック
- **中優先度**: gotech_rd_support, jigyou_shoukei_ma
  - 2ヶ月に1回のチェック
- **低優先度**: shinjigyo_shinshutsu
  - 四半期に1回のチェック