# 補助金情報 定期更新プロンプト

## 更新タイミング
**毎月1日・15日** に以下の手順で最新情報を確認・更新してください。

## 1. 募集期間の確認・更新

### 1.1 現在の設定確認
```bash
# 現在設定されている募集期間を確認
grep -A 10 "application_period" /Users/r9a/exp/attg/backend/subsidies.yaml
```

### 1.2 各補助金の公式サイト確認
以下の補助金について、最新の募集期間を公式サイトで確認：

1. **ものづくり補助金**
   - URL: https://portal.monodukuri-hojo.jp/
   - 確認項目: 次回公募スケジュール、現在の公募状況

2. **IT導入補助金** 
   - URL: https://it-shien.smrj.go.jp/
   - 確認項目: 通常枠・インボイス枠・セキュリティ対策推進枠の募集期間

3. **持続化補助金**
   - URL: https://r3.jizokukahojokin.info/
   - 確認項目: 一般型・特別枠の締切分

4. **中小企業新事業進出補助金**
   - URL: 中小企業庁・中小企業基盤整備機構サイト
   - 確認項目: 令和7年度の実施状況

5. **アトツギ甲子園**
   - URL: https://atotsugi-koshien.go.jp/
   - 確認項目: 第6回大会（2025年度）のスケジュール

6. **事業承継・M&A補助金**
   - URL: https://www.chusho.meti.go.jp/zaimu/shoukei/
   - 確認項目: 専門家活用枠の募集状況

### 1.3 募集期間更新手順
```yaml
# subsidies.yamlの各補助金に以下形式で更新
application_period:
  current_round: "第○回締切分 / 令和○年度第○期"
  start_date: "YYYY-MM-DD"
  end_date: "YYYY-MM-DD" 
  information_date: "YYYY-MM-DD"  # 情報収集日
  notes: "備考（予算・特別枠等）"
```

## 2. 制度変更・新制度の確認

### 2.1 確認サイト
- 中小企業庁: https://www.chusho.meti.go.jp/
- ミラサポplus: https://mirasapo-plus.go.jp/
- J-Net21: https://j-net21.smrj.go.jp/

### 2.2 確認項目
- 新規補助金制度の創設
- 既存制度の重要な変更（補助率・上限額・要件等）
- 廃止・統合される制度

## 3. 情報基準日について

**情報基準日** = このシステムが各種情報を収集・確認した日付

### 意味
- 募集期間や制度内容の「確認日」
- ユーザーがその情報の新しさを判断する指標
- 公式サイトから情報を取得した日付

### 更新ルール
- 情報を新しく確認した日付に更新
- 募集期間が変更されなくても、確認した場合は更新
- 毎月の定期チェック時に必ず更新

## 4. 自動チェック機能の提案

### 4.1 期限切れ警告
現在実装済み：
- 募集終了日を過ぎた場合、画面に警告表示
- 背景色を赤色に変更
- 「募集終了」バッジを表示

### 4.2 今後の改善案
```javascript
// 期限切れ近づき警告（7日前）
const daysUntilDeadline = Math.ceil(
  (new Date(end_date) - new Date()) / (1000 * 60 * 60 * 24)
);

if (daysUntilDeadline <= 7 && daysUntilDeadline > 0) {
  // 黄色の警告表示
  showWarning("募集終了まで残り" + daysUntilDeadline + "日");
}
```

## 5. 更新チェックリスト

### 月次チェック（毎月1日・15日）
- [ ] 全補助金の公式サイト確認
- [ ] 募集期間の最新情報収集
- [ ] `subsidies.yaml`の`application_period`更新
- [ ] `information_date`を確認日に更新
- [ ] 新制度・制度変更の確認
- [ ] システム動作確認（ローカル・本番）

### 緊急更新（制度変更時）
- [ ] 制度変更内容の詳細確認
- [ ] 影響範囲の特定
- [ ] 関連ファイルの更新
- [ ] テスト実施
- [ ] ユーザー向け案内の検討

## 6. 更新作業記録

### 記録場所
`/Users/r9a/exp/attg/backend/version_history.yaml`

### 記録形式
```yaml
subsidies:
  補助金ID:
    version: 1.0.X
    last_updated: 'YYYY-MM-DD'
    source_references:
      - title: "公式サイト名"
        url: "https://..."
        accessed_date: 'YYYY-MM-DD'
        version: "確認した情報のバージョン"
    change_history:
      - version: 1.0.X
        date: 'YYYY-MM-DD'
        changes: "募集期間更新 / 制度変更対応"
        author: "更新者名"
        reference_updated: true
```

## 7. エラー対応

### よくある問題
1. **公式サイトURL変更**: `url_research_prompt.md`の手順で再調査
2. **募集期間未発表**: `notes`に「詳細未発表」と記載
3. **制度廃止**: 該当補助金を無効化し、代替制度を調査

### 緊急連絡先
- システム管理者: 羽生田大陸（株式会社羽生田鉄工所）
- 更新作業での疑問点は上記に連絡

---

**重要**: この手順に従って定期的に更新することで、ユーザーに正確で最新の補助金情報を提供できます。情報の正確性は補助金申請の成功に直結するため、細心の注意を払って作業してください。