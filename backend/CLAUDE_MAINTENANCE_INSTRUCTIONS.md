# 🤖 Claude Code専用 保守運用指示書

## 📝 実行指示: 「定期保守を実行してください」

Claude Codeで実行する際は、以下のワークフローで効率的に保守を実行してください。

---

## 🚀 Step 1: 自動保守スクリプト実行

```bash
cd /Users/r9a/exp/attg/backend && python3 claude_maintenance.py
```

### 期待される出力:
```
🚀 Claude Code専用 補助金システム保守開始
============================================================

🔄 LLM更新プロンプト生成
✅ LLM更新プロンプト生成: 完了

✅ LLM更新プロンプト読み込み: 完了 (XXXX文字)

🔍 6つの補助金の最新情報を調査中...
📝 調査実行をClaude Codeに委譲...
以下の調査を実行してください：

# 補助金情報 自動更新調査プロンプト
[プロンプト内容が表示される]
```

---

## 🔍 Step 2: Claude Codeツールでの補助金調査

上記で表示されたプロンプト内容に従って、**WebFetchとWebSearchツールを使用**して6つの補助金を調査：

### 使用するClaude Codeツール:
- `WebFetch`: 各補助金の公式サイトから最新情報取得
- `WebSearch`: サイトアクセス不可時の代替検索
- `Write`: 調査結果をYAMLファイルとして保存

### 調査対象:
1. ものづくり・商業・サービス生産性向上促進補助金
2. IT導入補助金  
3. 小規模事業者持続化補助金
4. 中小企業新事業進出補助金
5. アトツギ甲子園
6. 事業承継・M&A補助金（専門家活用枠）

### 出力要求:
```yaml
# 調査実施日: YYYY-MM-DD
# 調査者: Claude AI Assistant

subsidies_update:
  monodukuri:
    id: "monodukuri"
    name: "ものづくり・商業・サービス生産性向上促進補助金"
    application_period:
      current_round: "第○次締切分"
      start_date: "YYYY-MM-DD"
      end_date: "YYYY-MM-DD"
      information_date: "YYYY-MM-DD"
      notes: "備考"
    status: "募集中/募集終了/次回未定"
    changes: "制度変更があれば記載"
[以下、他の補助金も同様の形式]
```

**調査結果をファイル保存:** `research_YYYY-MM-DD.yaml`

---

## 📥 Step 3: 調査結果の自動反映

調査完了後、結果をシステムに反映：

```bash
python3 update_subsidies_from_research.py
# プロンプトで調査結果YAMLファイルのパス入力: research_YYYY-MM-DD.yaml
```

### 期待される出力:
```
✅ バックアップ作成完了: YYYYMMDD_HHMMSS
📋 更新完了:
   Subsidies.yaml:
     - ものづくり・商業・サービス生産性向上促進補助金: 募集期間更新
     [他の補助金の更新状況]
   
   Version_history.yaml:
     - ものづくり・商業・サービス生産性向上促進補助金: v1.0.X
     [他の補助金のバージョン更新]

🔄 LLM更新プロンプトも自動更新中...
✅ 全て完了しました！
```

---

## 🎯 Step 4: 動作確認

以下のAPI確認で更新が正しく反映されたかチェック：

```bash
# 各補助金のメタデータAPI確認
curl http://localhost:8000/subsidies/shinjigyo_shinshutsu/metadata
curl http://localhost:8000/subsidies/atotsugi/metadata
curl http://localhost:8000/subsidies/monodukuri_r7_21th/metadata
```

**確認ポイント:**
- `application_period`情報が最新に更新されているか
- APIが正常にJSON応答を返すか

---

## ⚡ Claude Code最適化ポイント

### 🔧 効率化された要素:
1. **人間の手動確認を排除**: ブラウザでの目視確認不要
2. **Claude Codeツール活用**: WebFetch/WebSearchで自動情報収集
3. **バッチ処理**: 複数補助金を並行調査可能
4. **自動ファイル操作**: Write/Read/Editツールでファイル更新

### 🚀 実行時間短縮:
- 従来の手動チェックリスト: 40分
- Claude Code自動化: 10分

### 📊 エラーハンドリング:
- アクセス不可サイト → WebSearchで代替検索
- YAML形式エラー → 自動検証・修正提案
- バックアップ自動作成で安全性確保

---

## 🔄 定期実行パターン

### 完全自動実行（推奨）:
```bash
# ワンライナーで全保守実行
cd /Users/r9a/exp/attg/backend && python3 claude_maintenance.py && echo "調査結果をClaude Codeツールで取得・保存し、update_subsidies_from_research.pyで反映してください"
```

### カスタム実行:
特定の補助金のみ更新したい場合は、該当部分のWebFetchのみ実行

---

## 📋 実行完了の確認

以下が確認できれば保守完了:

✅ `claude_maintenance.py`が正常終了  
✅ 6つの補助金すべてを調査・更新  
✅ `research_YYYY-MM-DD.yaml`ファイル作成  
✅ `subsidies.yaml`と`version_history.yaml`更新  
✅ 各補助金APIが正常応答  
✅ フロントエンド画面で最新情報表示  

**🎉 Claude Code専用の効率化された保守フローにより、確実かつ迅速な定期保守が実現できます。**