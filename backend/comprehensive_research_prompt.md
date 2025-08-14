# 補助金情報 包括的調査プロンプト

あなたは補助金情報の定期更新を担当する包括的リサーチアシスタントです。以下の6つの補助金について、**募集期間だけでなく申請要件・項目・手続きの変更も含めて**最新情報を調査し、変更履歴を記録してください。

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

## 包括的調査指示

### A. 募集期間・日程情報
1. **現在の募集回次**（第○回、令和○年度第○期等）
2. **募集期間**（開始日・終了日）
3. **募集終了済み**の場合は次回予定を確認
4. **重要日程**（説明会、質疑応答締切、結果発表日等）

### B. 申請要件・対象者の変更
1. **対象事業者の定義**（従業員数、業種、売上等の要件）
2. **補助対象経費の範囲**（新規追加・除外項目）
3. **補助率・上限額**の変更
4. **必須書類・添付資料**の変更
5. **審査基準・評価項目**の変更

### C. 申請手続き・システムの変更
1. **申請方法**（電子申請システム、郵送等）
2. **申請書類の様式**変更
3. **事前準備**が必要な手続き（GビズID、e-Rad等）
4. **申請時の注意事項**の変更

### D. 制度運用の変更
1. **公募スケジュール**の変更（年間回数、時期等）
2. **審査プロセス**の変更
3. **事業実施期間・報告義務**の変更
4. **返還条件・ペナルティ**の変更

## 出力形式

以下のYAML形式で各補助金の**包括的な変更情報**を出力してください：

```yaml
# 調査実施日: 2025-08-13
# 調査者: Claude AI Assistant
# 調査種別: 包括的調査（期間・要件・項目・手続き）

comprehensive_update:
  monodukuri:
    id: "monodukuri"
    name: "ものづくり・商業・サービス生産性向上促進補助金"
    
    # 募集期間情報
    application_period:
      current_round: "第○次締切分"
      start_date: "YYYY-MM-DD"
      end_date: "YYYY-MM-DD"
      information_date: "2025-08-13"
      notes: "令和○年度補正予算・当初予算"
      important_dates:
        - date: "YYYY-MM-DD"
          event: "説明会"
        - date: "YYYY-MM-DD"
          event: "質疑応答締切"
    
    # 申請要件の変更
    requirement_changes:
      eligibility:
        changes_detected: true/false
        previous: "従来の要件"
        current: "現在の要件"
        change_summary: "変更点の概要"
      
      eligible_expenses:
        changes_detected: true/false
        added_items: ["新規追加された対象経費"]
        removed_items: ["除外された対象経費"]
        modified_items: ["変更された項目"]
      
      subsidy_amount:
        changes_detected: true/false
        previous_rate: "従来の補助率"
        current_rate: "現在の補助率"
        previous_limit: "従来の上限額"
        current_limit: "現在の上限額"
    
    # 申請手続きの変更
    procedure_changes:
      application_method:
        changes_detected: true/false
        previous: "従来の申請方法"
        current: "現在の申請方法"
      
      required_documents:
        changes_detected: true/false
        added_docs: ["新規追加書類"]
        removed_docs: ["不要になった書類"]
        modified_docs: ["様式変更された書類"]
      
      system_changes:
        changes_detected: true/false
        system_name: "申請システム名"
        change_summary: "システム変更の概要"
    
    # 参照元情報
    source_references:
      - url: "https://..."
        title: "参照文書名"
        accessed_date: "2025-08-13"
        document_version: "バージョン・更新日"
        key_sections: ["参照した主要セクション"]
        reliability: "high/medium/low"
      
    status: "募集中/募集終了/次回未定"
    overall_changes: "全体的な変更の重要度と概要"
    
  # 他の補助金も同様の形式で...
  it_dounyuu: { ... }
  chusho_jigyou: { ... }
  shinjigyo_shinshutsu: { ... }
  atotsugi: { ... }
  jigyou_shoukei: { ... }

# 全体的な変更・注意事項
general_updates:
  major_changes:
    - "重要な制度変更や新設制度"
    - "共通する変更パターン"
  
  investigation_notes:
    - "調査時に発見した問題点や注意事項"
    - "公式サイトにアクセスできなかった場合の報告"
    - "情報の信頼性に関する注記"
  
  next_investigation:
    - "次回調査時の重点確認事項"
    - "継続監視が必要な項目"

# 調査メタデータ
investigation_metadata:
  scope: "包括的調査（期間・要件・項目・手続き）"
  reliability_score: "0-100%（全体的な情報の信頼度）"
  time_spent: "調査所要時間（分）"
  sources_accessed: 15  # アクセスした情報源の数
  verification_level: "基本確認/詳細確認/専門家確認"
```

## 重要な確認ポイント

### 1. 情報の正確性確保
- **公式サイトの最新性**: 2025年度の情報が掲載されているか
- **文書バージョン**: 公募要領のバージョン・更新日を必ず記録
- **複数ソース確認**: 可能な限り複数の公式情報源で相互確認

### 2. 変更の検出方法
- **文書比較**: 前回版との相違点を具体的に特定
- **更新履歴**: サイト内の更新履歴・お知らせを確認
- **FAQ変更**: よくある質問の追加・変更も重要な情報源

### 3. 信頼性の評価
- **情報源の権威性**: 政府機関（.go.jp）を最優先
- **情報の新しさ**: 古い情報（2024年度以前）は参考程度
- **一貫性**: 同一サイト内での情報の一貫性をチェック

## 調査時の注意事項

- **アクセス不可時の対応**: WebSearchで代替情報を検索し、その旨を記録
- **類似制度の混同防止**: 正確な制度名を常に確認
- **情報の断片化**: 情報が複数ページに分散している場合は全体を確認
- **変更履歴の保存**: 何がどう変わったかを具体的に記録

**包括的な調査を開始してください。各サイトの最新情報を確認し、上記YAML形式で詳細な結果を出力してください。**