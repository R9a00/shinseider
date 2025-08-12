# システム高度化のための研究プロンプト集

## 概要
シンセイダーの「シンセイ準備」機能を世界最高水準に高度化するための情報収集プロンプト。
現状システムの分析→ベンチマーク調査→改善設計→実装のサイクルを支援。

---

## Phase 1: 現状システムの深層分析

### 1.1 現在のフォーム構造分析プロンプト
```bash
claude code "シンセイダーの現在のフォームシステムを詳細分析してください：

## 分析対象ファイル
- backend/subsidies.yaml (全補助金定義)
- frontend/client/src/components/SubsidyApplicationSupport.js
- backend/word_generator.py

## 分析観点

### A. フォーム設計の効果性評価
1. **sections構造の妥当性**
   - 各sectionの長さ設定(min/max)の根拠
   - hintの具体性・実用性レベル
   - input_modes (guided/integrated) の使い分け効果
   - 論理的な情報収集フローの設計評価

2. **ユーザビリティ課題の特定**
   - 入力を躊躇しそうな箇所の特定
   - 重複感のある質問項目
   - 初心者には難易度が高すぎる部分
   - 経験者には冗長すぎる部分

### B. 品質保証機能の分析
3. **validation設計の包括性**
   - 現在のvalidation rulesでカバーできていない品質要素
   - 形式チェックvs内容チェックのバランス
   - 見落としがちなエラーパターン
   - 審査員が重視する観点との整合性

4. **checklist効果の評価**
   - 実際の申請ミス予防効果
   - 項目の優先順位付けの妥当性
   - 抜け漏れやすい重要チェック項目
   - チェック実行タイミングの最適化

### C. AI支援機能の分析
5. **llm_prompt_templateの改善点**
   - 現在のプロンプトで生成される回答の質
   - より具体的で実用的な回答を引き出す設計
   - 分野別・経験レベル別のカスタマイズ必要性
   - 反復改善を促すフィードバック機能の不足

## 出力要求
data_input/system_analysis/current_system_deep_analysis.txt に以下の構造で保存：

### 強み（継続すべき設計）
- 効果的に機能している設計要素
- ユーザー価値が高い機能
- 他システムとの差別化要素

### 改善機会（高度化対象）
- 明確に不足している機能
- 使いにくさを生む設計
- 品質向上に直結する改善点

### 高度化の方向性
- 次世代に向けて追加すべき機能
- ユーザビリティの革新的改善案
- 競合を圧倒する差別化戦略"
```

### 1.2 成功パターン・失敗パターン分析プロンプト
```bash
claude code "補助金申請の成功・失敗パターンを分析し、シンセイダーフォームの改善点を特定してください：

## 調査対象
1. **高評価申請書の特徴分析**
   - 経済産業省系補助金の採択事例
   - 厚生労働省系補助金の採択事例
   - 農林水産省系補助金の採択事例
   - 各分野での「満点申請書」の構造パターン

2. **不採択申請書の共通問題**
   - 形式不備による失格パターン
   - 内容不足による低評価パターン
   - 論理構成の問題による減点パターン
   - 根拠不足による信頼性不足パターン

## 重点分析項目

### A. 申請書の構造的特徴
- **成功申請書の論理構成**：導入→課題→解決策→効果→根拠の流れ
- **説得力のある根拠提示方法**：データ、事例、専門知識の活用方法
- **差別化の表現技術**：競合との明確な違いの示し方
- **実現可能性の証明方法**：体制、資金、スケジュールの説得力

### B. 内容の質的分析
- **キーワード使用パターン**：審査で重視される専門用語の活用
- **数値データ活用方法**：定量的根拠の効果的な配置・表現
- **具体例の効果的活用**：抽象的内容を具体化する技術
- **リスク対策の記述方法**：想定リスクと対応策の表現

### C. フォーム設計への示唆
- **入力支援で重視すべき要素**：成功要因をフォームでどう引き出すか
- **品質チェックで検証すべき項目**：失敗パターンをどう予防するか
- **AI支援で強化すべき観点**：専門性をどうサポートするか

## 出力先
data_input/success_patterns/winning_applications_analysis.txt
data_input/success_patterns/common_failure_patterns.txt
data_input/success_patterns/form_improvement_insights.txt

各ファイルに具体的事例と、シンセイダーフォーム改善への具体的示唆を記録してください。"
```

---

## Phase 2: ベンチマーク・最先端調査

### 2.1 競合システム分析プロンプト
```bash
claude code "補助金申請支援の最先端システムを調査し、シンセイダーの次世代機能設計の参考情報を収集してください：

## 調査対象カテゴリ

### A. 申請支援システム・サービス
1. **国内専門サービス**
   - 補助金ポータルサイトの申請支援機能
   - 士業事務所の申請支援ツール
   - 大手コンサルティング会社のデジタルツール
   - 中小企業支援機関のオンラインサービス

2. **海外先進事例**
   - EU諸国の補助金申請プラットフォーム
   - 米国のSBIR申請支援システム
   - シンガポール・韓国の中小企業支援デジタル化事例

### B. 類似領域の先進システム
3. **フォーム設計の最先端**
   - 複雑な申請を簡単にするUX設計事例
   - 段階的入力支援の効果的実装
   - エラー予防・品質向上の仕組み
   - ユーザー行動分析に基づく最適化事例

4. **AI活用の最前線** 
   - 文書作成支援AIの最新機能
   - 業務特化型AIアシスタントの実装方法
   - パーソナライゼーション技術の活用
   - 品質評価・改善提案の自動化技術

## 重点調査項目

### 機能面での先進性
- **入力支援の革新性**：どんな支援機能で差別化しているか
- **品質保証の仕組み**：どうやって高品質な成果物を保証するか
- **AI活用の巧妙さ**：AIをどう活用してユーザー価値を最大化するか
- **成果測定の方法**：どう効果を測定し改善につなげているか

### 技術面での実装方法
- **リアルタイム支援技術**：入力中の動的サポート実装方法
- **品質評価アルゴリズム**：コンテンツ品質の自動評価技術
- **パーソナライゼーション**：ユーザーに最適化した体験の提供方法
- **継続改善システム**：ユーザーフィードバックによる自動最適化

### ビジネスモデル・運営方法
- **無料サービスの価値提供方法**：どうやって高品質を維持するか
- **継続改善の体制**：どんな組織・プロセスで品質向上するか
- **ユーザーコミュニティ**：利用者の知識共有・相互支援の仕組み

## 出力先
data_input/benchmarks/competitive_analysis.txt
data_input/benchmarks/advanced_technologies.txt  
data_input/benchmarks/implementation_methods.txt

## 重要
単なる機能リストではなく、「なぜその機能が効果的なのか」「シンセイダーでどう応用できるか」の戦略的示唆を含めてください。"
```

### 2.2 最新技術動向調査プロンプト
```bash
claude code "2025年時点での最新技術を調査し、シンセイダー高度化に活用できる技術要素を特定してください：

## 調査対象技術領域

### A. AI・機械学習の最新動向
1. **文書生成・改善AI**
   - GPT-4以降の大規模言語モデルの申請書類特化活用
   - 文章品質評価・改善提案の自動化技術
   - ドメイン特化型モデルのファインチューニング手法
   - RAG (Retrieval-Augmented Generation) の効果的活用

2. **パーソナライゼーションAI**
   - ユーザー行動分析による個別最適化
   - 学習スタイル・経験レベル別のUI/UX動的調整
   - 成功確率予測モデルの構築・運用
   - リアルタイム学習による継続的改善

### B. フロントエンド・UX技術
3. **次世代インタラクションデザイン**
   - 音声入力による申請書作成支援
   - 視覚的なフローチャート・マインドマップ入力
   - AR/VRを活用した直感的な事業計画可視化
   - ジェスチャー・視線追跡による操作性向上

4. **アクセシビリティ・インクルーシブデザイン**
   - 障害者対応の最新技術（音声読み上げ、点字出力等）
   - 多言語対応（外国人経営者の申請支援）
   - 高齢者向けの使いやすさ設計
   - デバイス間シームレス体験（スマホ→PC→タブレット）

### C. バックエンド・データ分析技術
5. **高度分析・予測システム**
   - リアルタイムデータ処理によるトレンド分析
   - 申請成功パターンの機械学習による特定
   - 政策動向分析による新制度予測
   - 競合申請状況の分析・対策提案

6. **セキュリティ・プライバシー技術**
   - ゼロトラスト・セキュリティモデル
   - 機密情報の暗号化・匿名化処理
   - GDPR準拠のデータ管理技術
   - ブロックチェーンによる申請履歴の信頼性担保

## 実装可能性評価観点

### 技術的実現性
- **開発難易度**：現在の技術スタックで実装可能か
- **コスト効率**：投資対効果はどの程度期待できるか
- **メンテナンス性**：継続的な改善・運用は現実的か
- **スケーラビリティ**：ユーザー増加に対応できるか

### ユーザー価値
- **直接的メリット**：申請成功率・作業効率にどう貢献するか
- **差別化効果**：競合に対する明確な優位性はあるか
- **学習コスト**：ユーザーが新機能を習得する負担は適切か
- **アクセシビリティ**：多様なユーザーニーズに対応できるか

## 出力先
data_input/technology_research/ai_ml_advancements.txt
data_input/technology_research/frontend_ux_innovations.txt
data_input/technology_research/backend_infrastructure.txt
data_input/technology_research/implementation_roadmap.txt

## 求める成果物の質
各技術について「概要→具体的活用方法→実装の優先順位→期待される効果」を明記してください。技術のための技術ではなく、ユーザー価値向上に直結する実用的な提案を求めます。"
```

---

## Phase 3: 改善設計プロンプト

### 3.1 次世代フォーム設計プロンプト
```bash
claude code "収集した分析結果とベンチマーク情報を基に、シンセイダーの次世代フォームシステムを設計してください：

## 設計目標
- 申請成功率: 現在の60-70% → 90%以上
- ユーザー満足度: 85% → 95%以上  
- 作業時間短縮: 40%短縮
- エラー発生率: 70%削減

## 設計対象

### A. 高度化されたYAML構造設計
現在のsubsidies.yamlを進化させ、次の機能を組み込んだ構造を設計：

1. **段階的開示システム**
   ```yaml
   progressive_disclosure:
     beginner_mode: # 初心者向け簡単入力
       - step1: "基本情報（3問）"
       - step2: "事業概要（簡易版）"
       - step3: "AI拡充→詳細版"
     expert_mode: # 専門家向け直接入力
       sections: ["全項目を一覧表示"]
   ```

2. **リアルタイム品質評価**
   ```yaml
   quality_assessment:
     real_time_scoring:
       content_quality: "0.0-1.0のスコアリング"
       compliance_check: "要件適合度チェック"
       success_probability: "成功確率予測"
     improvement_triggers:
       - score_threshold: 0.6
         suggestion_type: "具体的改善提案"
   ```

3. **動的AI支援システム**
   ```yaml
   adaptive_ai_assistance:
     context_awareness:
       user_profiling: ["経験レベル", "業界", "文章特性"]
       content_analysis: ["現在の品質", "不足要素", "改善方向性"]
     personalized_prompts:
       - profile: "初心者×製造業"
         template: "業界特化＋基礎説明重視"
       - profile: "経験者×IT業"  
         template: "高度な戦略提案重視"
   ```

### B. 革新的UX設計
4. **スマート入力支援**
   - 音声入力→自動文字起こし→構造化
   - 既存資料（会社案内、過去申請書）のAI解析→自動入力
   - 類似成功事例の参考表示→カスタマイズ支援

5. **視覚的フィードバック**
   - 品質スコアのリアルタイム表示（レーダーチャート）
   - 不足要素の視覚的ハイライト
   - 成功事例との比較表示

### C. 高度品質保証システム  
6. **多層検証システム**
   ```yaml
   multi_layer_validation:
     layer1: "形式・文字数チェック"
     layer2: "内容品質・論理性チェック" 
     layer3: "審査員視点シミュレーション"
     layer4: "成功事例との比較評価"
   ```

7. **予測・推奨機能**
   - 成功確率の数値予測（%表示）
   - 類似申請者の成功パターン分析
   - 最適な申請タイミング推奨
   - 追加で有効な補助金制度の提案

## 技術仕様要求

### フロントエンド設計
- **レスポンシブ対応**: スマホ→PC→タブレット完全対応
- **オフライン機能**: ネット接続なしでも作業継続可能
- **自動保存**: 入力内容の自動バックアップ・復元
- **マルチデバイス同期**: 異なるデバイス間での作業継続

### バックエンド設計  
- **リアルタイム処理**: 入力と同時の品質評価・提案生成
- **スケーラブル構成**: ユーザー増加に対応できるアーキテクチャ
- **AI統合**: 外部AI API（GPT等）との効率的連携
- **分析基盤**: ユーザー行動・成果データの蓄積・分析

## 出力要求
data_input/design_specs/next_generation_form_design.yaml
data_input/design_specs/advanced_features_specification.md
data_input/design_specs/technical_architecture.md

## 設計品質基準
- **実装可能性**: 現在の技術・リソースで6ヶ月以内に実装可能
- **ユーザー中心**: 技術的複雑さをユーザーに負担させない設計
- **拡張性**: 新しい補助金制度への対応が容易
- **保守性**: 継続的改善・アップデートが効率的に実行可能"
```

### 3.2 AI支援高度化設計プロンプト
```bash
claude code "シンセイダーのAI支援機能を次世代レベルまで高度化する設計を行ってください：

## 現状のAI活用分析
- llm_prompt_templateの効果・限界
- 単発的な支援 vs 継続的な改善支援の違い
- パーソナライゼーションの不足
- ドメイン知識の活用不足

## 高度化目標
- **的確性**: ユーザーの状況に完全に適合した提案
- **継続性**: 申請完了まで継続的にサポート
- **学習性**: 利用するほど賢くなるシステム
- **専門性**: 分野特化の深い知識を活用

## 設計対象

### A. 動的プロンプト生成システム
1. **ユーザープロファイリング**
   ```python
   user_profile = {
       'experience_level': ['初心者', '経験者', '専門家'],
       'industry_domain': '17業界分類', 
       'company_stage': ['起業準備', '成長期', '成熟期', '事業転換期'],
       'writing_style': '文章特性AI分析結果',
       'success_history': '過去の申請成功・失敗履歴',
       'learning_preference': '学習スタイル（視覚的、論理的、事例重視等）'
   }
   ```

2. **コンテキスト適応型プロンプト**
   ```python
   adaptive_prompt_generation = {
       'base_template': '補助金制度・セクション固有の基本プロンプト',
       'user_adaptation': 'プロファイルに基づくカスタマイゼーション',
       'content_analysis': '現在の入力内容の品質・不足分析',
       'improvement_focus': '最も効果的な改善方向の特定',
       'success_pattern_matching': '類似成功事例からの学習'
   }
   ```

### B. 継続的改善支援システム
3. **多段階支援フロー**
   - **Stage 1**: 初期入力支援（アイデア整理・構造化）
   - **Stage 2**: 内容深化支援（根拠強化・具体化）
   - **Stage 3**: 品質向上支援（論理性・説得力向上）  
   - **Stage 4**: 最終調整支援（完成度・競争力最大化）

4. **反復学習機能**
   ```python
   iterative_learning = {
       'user_feedback_integration': 'ユーザーの採用・拒否フィードバック学習',
       'success_outcome_learning': '申請結果からの逆算学習',
       'comparative_analysis': '他ユーザー成功パターンの活用',
       'domain_knowledge_update': '最新の補助金動向・成功事例の継続学習'
   }
   ```

### C. 専門知識統合システム
5. **ドメイン特化知識ベース**
   ```yaml
   domain_knowledge:
     subsidy_specific:
       - eligibility_nuances: "制度固有の細かな要件解釈"
       - evaluation_criteria_insights: "審査員が重視する隠れた観点"
       - success_pattern_database: "過去の成功申請の構造分析結果"
       - failure_prevention_knowledge: "よくある失敗パターンと予防方法"
     
     industry_specific:
       - sector_challenges: "業界固有の課題・トレンド"
       - technical_terminology: "専門用語の適切な使用方法"
       - market_dynamics: "市場環境・競合状況の理解"
       - regulatory_compliance: "業界特有の法規制・基準"
   ```

6. **リアルタイム知識活用**
   - **補助金制度の最新動向**: 政策変更、新制度情報の即時反映
   - **成功事例の継続学習**: 新たな採択事例の分析・パターン抽出
   - **審査傾向の分析**: 審査結果からの評価基準変化の検出
   - **競合状況の把握**: 同時期申請者の動向分析

### D. 品質評価・予測システム
7. **多次元品質評価**
   ```python
   quality_assessment = {
       'content_dimensions': {
           'logical_structure': '論理構成の明確性',
           'evidence_strength': '根拠・データの説得力', 
           'innovation_level': '新規性・革新性の程度',
           'feasibility_credibility': '実現可能性の信頼性',
           'competitive_advantage': '差別化・競争優位性'
       },
       'compliance_check': {
           'formal_requirements': '形式要件への適合性',
           'content_requirements': '内容要件への適合性', 
           'policy_alignment': '政策目的との整合性'
       },
       'success_prediction': {
           'probability_scoring': '成功確率の数値化',
           'confidence_intervals': '予測精度の信頼区間',
           'improvement_impact': '改善による効果予測'
       }
   }
   ```

## 実装アーキテクチャ

### AI統合基盤
```python
class AdvancedAIAssistant:
    def __init__(self):
        self.profile_analyzer = UserProfileAnalyzer()
        self.content_analyzer = ContentQualityAnalyzer()
        self.knowledge_base = DomainKnowledgeBase()
        self.prompt_generator = AdaptivePromptGenerator()
        self.learning_engine = ContinuousLearningEngine()
    
    async def provide_contextual_assistance(self, user_id, content, section_id):
        # ユーザープロファイル取得・更新
        profile = await self.profile_analyzer.get_updated_profile(user_id)
        
        # コンテンツ品質分析
        quality_analysis = self.content_analyzer.analyze(content, section_id)
        
        # 最適なプロンプト生成
        prompt = self.prompt_generator.generate_adaptive_prompt(
            profile, quality_analysis, section_id
        )
        
        # AI応答生成
        response = await self.generate_ai_response(prompt)
        
        # 学習データとして記録
        await self.learning_engine.record_interaction(
            user_id, content, response, section_id
        )
        
        return response
```

## 成功指標
- **回答的確性**: ユーザーの90%以上が「有用」と評価
- **継続利用率**: 80%以上のユーザーが複数回AI支援を利用
- **品質向上効果**: AI支援利用により申請書品質が平均30%向上
- **成功率向上**: AI支援利用者の申請成功率が非利用者より20%高い

## 出力要求
data_input/ai_design/advanced_ai_architecture.py
data_input/ai_design/prompt_engineering_system.md
data_input/ai_design/knowledge_integration_design.yaml

実装の優先順位と段階的展開計画も含めて設計してください。"
```

---

## 実行準備完了

以上で、**シンセイ準備機能の設計高度化**のための完全なワークフローが確立されました：

### 🚀 確立された体系
1. **情報収集**: 現状分析→ベンチマーク→技術調査の体系的プロンプト
2. **設計**: 次世代フォーム→AI高度化→品質保証の包括的設計
3. **実装**: 段階的実装とテスト検証の計画
4. **改善**: 効果測定と継続改善の自動化

### 💡 実現される価値
- **申請成功率90%以上**の世界最高水準システム
- **AI支援による専門知識の民主化**
- **継続学習による進化し続けるシステム**
- **ユーザー体験の革新的向上**

次のステップとして、これらのプロンプトを実行して具体的な高度化設計に取り掛かることができます！

<function_calls>
<invoke name="TodoWrite">
<parameter name="todos">[{"content": "\u30b7\u30f3\u30bb\u30a4\u30c0\u30fc\u88dc\u52a9\u91d1\u5bfe\u5fdc\u30ef\u30fc\u30af\u30d5\u30ed\u30fc\u306e\u4f53\u7cfb\u5316\u30fb\u624b\u9806\u66f8\u4f5c\u6210", "status": "completed", "id": "120"}, {"content": "\u30b7\u30f3\u30bb\u30a4\u6e96\u5099\u6a5f\u80fd\u306e\u8a2d\u8a08\u9ad8\u5ea6\u5316\u30ef\u30fc\u30af\u30d5\u30ed\u30fc\u306e\u78ba\u7acb", "status": "completed", "id": "121"}]