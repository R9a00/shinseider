# 補助金情報 自動更新調査プロンプト

あなたは補助金情報の定期更新を担当するリサーチアシスタントです。以下の6つの補助金について、最新の募集期間と制度情報を調査し、YAML形式で結果を出力してください。

## 調査対象補助金

### 1. ものづくり・商業・サービス生産性向上促進補助金
- **公式サイト**: https://portal.monodukuri-hojo.jp/
- **運営機関**: 全国中小企業団体中央会
- **前回確認日**: 2025-01-11
- **前回確認時情報**: 令和7年度第21次公募版

### 2. IT導入補助金
- **運営機関**: 一般社団法人サービスデザイン推進協議会
- **参照元**: version_history.yamlに未登録

### 3. 小規模事業者持続化補助金
- **運営機関**: 全国商工会連合会・日本商工会議所
- **参照元**: version_history.yamlに未登録

### 4. 中小企業新事業進出補助金
- **公式サイト**: https://shinjigyou-shinshutsu.smrj.go.jp/
- **運営機関**: 中小企業庁・中小企業基盤整備機構
- **前回確認日**: 2025-01-11
- **前回確認時情報**: 令和7年度版

### 5. アトツギ甲子園
- **公式サイト**: https://atotsugi-koshien.go.jp/
- **運営機関**: 経済産業省・中小企業庁
- **前回確認日**: 2025-01-11
- **前回確認時情報**: 最新版

### 6. 事業承継・M&A補助金（専門家活用枠）
- **公式サイト**: https://shoukei-mahojokin.go.jp/
- **運営機関**: 中小企業庁
- **前回確認日**: 2025-01-11
- **前回確認時情報**: 令和7年度版

## 調査指示

1. **各公式サイトにアクセス**して最新情報を確認
2. **募集期間**（開始日・終了日）
3. **現在の募集回次**（第○回、令和○年度第○期等）
4. **重要な制度変更**があれば特記
5. **募集終了済み**の場合は次回予定を確認

## 出力形式

以下のYAML形式で各補助金の情報を出力してください：

```yaml
# 調査実施日: 2025-08-14
# 調査者: Claude AI Assistant

subsidies_update:
  monodukuri:
    id: "monodukuri"
    name: "ものづくり・商業・サービス生産性向上促進補助金"
    application_period:
      current_round: "第○次締切分"
      start_date: "YYYY-MM-DD"
      end_date: "YYYY-MM-DD"
      information_date: "2025-08-14"
      notes: "令和○年度補正予算・当初予算"
    status: "募集中/募集終了/次回未定"
    changes: "制度変更があれば記載"
    
  it_dounyuu:
    id: "it_dounyuu"
    name: "IT導入補助金"
    application_period:
      current_round: "令和○年度○期"
      start_date: "YYYY-MM-DD"
      end_date: "YYYY-MM-DD"
      information_date: "2025-08-14"
      notes: "通常枠・インボイス枠・セキュリティ対策推進枠"
    status: "募集中/募集終了/次回未定"
    changes: "制度変更があれば記載"
    
  chusho_jigyou:
    id: "chusho_jigyou"
    name: "小規模事業者持続化補助金"
    application_period:
      current_round: "第○回締切分"
      start_date: "YYYY-MM-DD"
      end_date: "YYYY-MM-DD"
      information_date: "2025-08-14"
      notes: "一般型・特別枠（賃金引上げ枠・卒業枠・後継者支援枠・創業枠）"
    status: "募集中/募集終了/次回未定"
    changes: "制度変更があれば記載"
    
  shinjigyo_shinshutsu:
    id: "shinjigyo_shinshutsu"
    name: "中小企業新事業進出補助金"
    application_period:
      current_round: "令和○年度第○期"
      start_date: "YYYY-MM-DD"
      end_date: "YYYY-MM-DD"
      information_date: "2025-08-14"
      notes: "新規事業進出支援枠"
    status: "募集中/募集終了/次回未定"
    changes: "制度変更があれば記載"
    
  atotsugi:
    id: "atotsugi"
    name: "アトツギ甲子園"
    application_period:
      current_round: "第○回大会"
      start_date: "YYYY-MM-DD"
      end_date: "YYYY-MM-DD"
      information_date: "2025-08-14"
      notes: "エントリー・地方予選・全国大会"
    status: "エントリー受付中/地方予選中/全国大会開催済み"
    changes: "制度変更があれば記載"
    
  jigyou_shoukei:
    id: "jigyou_shoukei"
    name: "事業承継・M&A補助金（専門家活用枠）"
    application_period:
      current_round: "令和○年度"
      start_date: "YYYY-MM-DD"
      end_date: "YYYY-MM-DD"
      information_date: "2025-08-14"
      notes: "専門家活用枠"
    status: "募集中/募集終了/次回未定"
    changes: "制度変更があれば記載"

# 全体的な変更・注意事項
general_updates:
  - "重要な制度変更や新設制度があれば記載"
  - "調査時に発見した問題点や注意事項"
  - "公式サイトにアクセスできなかった場合の報告"
```

## 重要な確認ポイント

1. **URL有効性**: 実際にサイトにアクセスできるか（アクセスできない場合はWebSearchで代替情報を検索）
2. **最新性**: 2025年度の情報が掲載されているか
3. **募集状況**: 現在募集中か、終了しているか
4. **次回予定**: 募集終了の場合、次回のスケジュール
5. **制度変更**: 補助率、上限額、要件等の重要な変更

## 調査時の注意事項

- 政府機関（.go.jp）の情報を優先
- 古い情報（2024年度以前）は参考程度に
- 類似名称の別制度と混同しないよう注意
- アクセスできないサイトがあればWebSearchで代替情報を検索
- アトツギ甲子園は第6回が最新（第7回は存在しない）

**調査開始してください。各サイトの最新情報を確認し、上記YAML形式で結果を出力してください。**
