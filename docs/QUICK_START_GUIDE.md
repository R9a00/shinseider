# シンセイダー補助金統合 クイックスタートガイド

## 🚀 新しい補助金を30分で統合する手順

このガイドでは、新しい補助金制度をシンセイダーに統合する最短手順を示します。

---

## ✅ 事前準備（5分）

### 1. 対象補助金の基本情報収集
- 正式名称
- 管轄官庁
- 公式URL
- 公募要領PDF

### 2. 作業ディレクトリ確認
```bash
cd /Users/r9a/exp/attg
ls -la prompts/          # プロンプトテンプレート存在確認
ls -la data_input/       # データ入力先確認
ls -la backend/          # 実装先確認
```

---

## 📊 Step 1: データ収集（10分）

### プロンプト実行
```bash
claude code "prompts/structural_knowledge_collection.md の指示に従い、
[補助金名（例：ものづくり補助金）]について以下を実施:

1. data_input/raw_data/[補助金名]_research.txt として基本情報保存
2. data_input/knowledge_base/[補助金名]_structure.txt として構造分析保存
3. 2階層構造（simple/detailed）で出力

対象制度: [補助金正式名称]
公式URL: [URL]
管轄: [官庁名]"
```

**確認ポイント**:
- [ ] `data_input/raw_data/` に研究ファイル生成
- [ ] `data_input/knowledge_base/` に構造ファイル生成
- [ ] simple/detailed両方の内容が含まれている

---

## 🔧 Step 2: YAML構造化（10分）

### テンプレート使用
```bash
claude code "data_input/knowledge_base/[補助金名]_structure.txt を元に、
backend/knowledge_base.yaml と同じ構造で、
backend/[補助金名].yaml を作成してください。

必須構造:
- categories (foundation/application/strategy)
- content (各セクション)
  - simple (overview, key_points, quick_takeaway, next_steps)
  - detailed (abstract, comprehensive_analysis)

品質基準:
- 全セクションでsimple/detailed完備
- examples配列の適切な設定
- 実務的に有用な内容"
```

**確認ポイント**:
- [ ] `backend/[補助金名].yaml` が生成された
- [ ] YAML構文エラーなし
- [ ] categories/content構造が標準形式と一致

---

## ⚡ Step 3: システム実装（10分）

### バックエンドAPI追加
```bash
claude code "backend/main.py に以下を追加:

1. [補助金名].yaml を読み込むAPI エンドポイント
2. 既存のknowledge-baseと同様の構造
3. エラーハンドリング付き

例:
@app.get('/[補助金名]-knowledge')
async def get_[補助金名]_knowledge():
    try:
        return load_yaml_content('[補助金名].yaml')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))"
```

### フロントエンド追加
```bash
claude code "src/components/KnowledgeBase.js を参考に、
src/components/[補助金名]Guide.js を作成:

1. 新しいAPIエンドポイントからデータ取得
2. 既存UIコンポーネントを再利用
3. simple/detailedモード切り替え対応

src/App.js にルート追加:
<Route path='/[補助金名]-guide' element={<[補助金名]Guide />} />"
```

**確認ポイント**:
- [ ] バックエンドAPI追加完了
- [ ] フロントエンドコンポーネント作成完了
- [ ] ルーティング設定完了

---

## ✨ Step 4: 動作確認（5分）

### バックエンドテスト
```bash
curl http://localhost:8888/[補助金名]-knowledge | jq
```

### フロントエンドテスト
```bash
# ブラウザで確認
open http://localhost:3000/[補助金名]-guide
```

**確認ポイント**:
- [ ] APIからJSONデータ取得可能
- [ ] フロントエンド画面表示OK
- [ ] simple/detailedモード切り替え動作
- [ ] コンテンツが適切に表示

---

## 🔄 継続的改善

### データ最新性維持
```bash
# 3ヶ月ごとに実行
claude code "prompts/policy_update_template.yaml を使用して、
[補助金名]の最新情報を調査し、
backend/[補助金名].yaml を更新してください"
```

### 品質改善
```bash
# ユーザーフィードバック反映
claude code "[補助金名]Guide のユーザビリティを向上させるため、
以下を検討・実装:
1. より直感的なUI改善
2. コンテンツの理解しやすさ向上  
3. 実務での使いやすさ向上"
```

---

## 📋 チェックリスト

### 完了基準
- [ ] データ収集完了（研究ファイル生成）
- [ ] YAML構造化完了（構文エラーなし）
- [ ] API実装完了（エンドポイント動作）
- [ ] UI実装完了（画面表示・操作）
- [ ] 動作確認完了（E2Eテスト）

### 品質基準
- [ ] 2階層構造（simple/detailed）完備
- [ ] 実務的有用性確認
- [ ] 既存機能との整合性
- [ ] エラーハンドリング適切
- [ ] レスポンシブデザイン対応

---

## 🛠️ トラブルシューティング

### よくある問題と解決法

**YAML構文エラー**:
```bash
# 検証実行
cd backend && python -c "import yaml; yaml.safe_load(open('[補助金名].yaml'))"
```

**API 500エラー**:
```bash
# ログ確認
tail -f backend/logs/uvicorn.log
```

**フロントエンド表示エラー**:
```bash
# ブラウザ開発者ツールでConsoleエラー確認
# src/components/[補助金名]Guide.js のimport文確認
```

---

## 📈 成功指標

### 短期（実装完了時）
- [ ] 30分以内で基本実装完了
- [ ] エラーなく画面表示
- [ ] simple/detailed両モード動作

### 中期（1週間後）
- [ ] コンテンツ品質が実用レベル
- [ ] 他の補助金と統一感のあるUX
- [ ] 実際の申請準備で活用可能

### 長期（1ヶ月後）
- [ ] ユーザーからの良好なフィードバック
- [ ] 申請成功事例の創出
- [ ] 継続的な改善サイクル確立

このガイドに従うことで、**効率的で高品質な補助金制度統合**が実現できます！