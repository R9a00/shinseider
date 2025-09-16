# バージョン管理ルール

## 基本原則

### セマンティックバージョニング: MAJOR.MINOR.PATCH

## システム全体バージョン（metadata.version）

### MAJOR版 (X.0.0) - 破壊的変更
**これをしたら MAJOR を上げる:**
- API仕様の非互換変更（エンドポイント削除・形式変更）
- データベーススキーマの非互換変更
- フロントエンドとの連携方式の根本変更
- 既存機能の削除
- 設定ファイル形式の非互換変更

**例:**
- `/subsidies` APIのレスポンス形式を変更
- YAMLからJSONへのデータ形式変更
- 認証方式の変更

### MINOR版 (0.X.0) - 機能追加
**これをしたら MINOR を上げる:**
- 新しいAPIエンドポイントの追加
- 新しい補助金の追加
- 新しい診断機能・システム機能の追加
- 大幅なUI改善
- 新しい設定項目の追加（既存と互換性あり）

**例:**
- 完全性チェック機構の追加
- 稼働状況公開システムの追加
- 新しい補助金制度の追加
- バッチ処理機能の追加

### PATCH版 (0.0.X) - バグ修正・軽微な改善
**これをしたら PATCH を上げる:**
- バグ修正
- 文言修正
- パフォーマンス改善
- セキュリティ修正（非破壊的）
- ログ改善

**例:**
- APIレスポンスの軽微な修正
- エラーメッセージの改善
- 処理速度の最適化

## 個別補助金バージョン（subsidies.*.version）

### MAJOR版 (X.0.0) - 制度の根本的変更
**これをしたら MAJOR を上げる:**
- 補助金制度の廃止・統合
- 申請要件の根本的変更（対象者の変更等）
- 申請方法の大幅変更
- フォーム構造の非互換変更

**例:**
- 個人事業主も対象に変更（法人のみ→個人・法人）
- 申請書の全面刷新

### MINOR版 (0.X.0) - 機能追加・大幅改善
**これをしたら MINOR を上げる:**
- 新しい申請項目の追加
- 新しい診断ロジックの追加
- UI/UXの大幅改善
- 新しいバリデーション機能の追加
- フォームセクションの追加

**例:**
- 状態タグシステムの実装
- 新しい診断質問の追加
- micro_tasksの充実化

### PATCH版 (0.0.X) - 情報更新・軽微な修正
**これをしたら PATCH を上げる:**
- 募集期間の更新
- 金額・条件の軽微な変更
- 参照元URL・資料の更新
- 文言の修正
- 軽微なバグ修正

**例:**
- 募集開始日・終了日の更新
- 公募要領URLの更新
- 文言の表記統一

## 参照日更新ルール

### reference_updated: true の条件
**これをしたら reference_updated: true にする:**
- 公式サイトから最新情報を取得
- 公募要領の新版確認
- 制度内容の変更確認
- 情報の鮮度向上のための調査実行

### reference_updated: false の条件
**これをしたら reference_updated: false にする:**
- システム内部の改善のみ
- UI/UXの改善（情報内容は変更なし）
- バグ修正
- コード整理

## 自動バージョニング基準

### 毎日実行される更新作業
- **情報確認のみで変更なし** → バージョン変更なし
- **軽微な情報更新** → PATCH版を上げる
- **新しい制度情報追加** → MINOR版を上げる

### 定期メンテナンス
- **月次システム改善** → システム全体のMINOR版を上げる
- **緊急修正** → PATCH版を上げる

## 実装ルール

### バージョン更新のタイミング
1. **変更作業の完了時** → 即座にバージョン更新
2. **reference_updated判定** → 情報調査結果に基づく
3. **change_history記録** → バージョン更新と同時に記録

### バージョン計算ロジック
```python
def calculate_new_version(current_version, change_type):
    major, minor, patch = map(int, current_version.split('.'))
    
    if change_type == 'MAJOR':
        return f"{major + 1}.0.0"
    elif change_type == 'MINOR':
        return f"{major}.{minor + 1}.0"
    elif change_type == 'PATCH':
        return f"{major}.{minor}.{patch + 1}"
```

### 自動判定基準
```python
def determine_change_type(changes_description):
    if any(keyword in changes_description for keyword in [
        '制度廃止', '要件変更', 'API変更', '非互換'
    ]):
        return 'MAJOR'
    elif any(keyword in changes_description for keyword in [
        '新機能', '新項目', 'システム追加', '大幅改善'
    ]):
        return 'MINOR'
    else:
        return 'PATCH'
```

## 履歴管理

### change_history の必須項目
- `version`: 新しいバージョン
- `date`: 変更日（YYYY-MM-DD形式）
- `author`: 変更者
- `changes`: 変更内容の説明
- `reference_updated`: 参照元情報の更新有無

### 変更内容の記述基準
- **具体的**: 何を変更したかが明確
- **簡潔**: 1行で要点を表現
- **一貫性**: 同じ種類の変更は同じ表現を使用

**良い例:**
- "募集期間更新: 2025年4月開始"
- "新機能追加: 自動診断ロジック実装"
- "バグ修正: 申請書生成エラー解消"

**悪い例:**
- "いろいろ修正"
- "更新"
- "改善しました"