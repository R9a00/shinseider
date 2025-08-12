# 2階層コンテンツ設計テンプレート

## 必須出力フォーマット

### YAML構造設計

```yaml
# 各記事の基本構造
article_id:
  # メタデータ
  meta:
    title: "記事タイトル"
    created_date: "YYYY-MM-DD"
    last_updated: "YYYY-MM-DD"
    version: "1.0"
    
  # タグ構造（洗練された分類システム）
  tags:
    # メタタグ
    content_type: "fundamental" # [fundamental|analysis|application|case_study]
    complexity_level: "beginner" # [beginner|intermediate|advanced|expert]
    reading_time: 5 # 分
    update_frequency: "static" # [static|dynamic|seasonal]
    
    # 概念タグ
    concept_category: "structure" # [structure|process|strategy|evaluation]
    abstraction_level: "universal" # [universal|sector_specific|scheme_specific]
    reusability_score: 5 # 1-5
    
    # 制度関連タグ
    applicable_schemes: ["all"] # 適用可能な補助金制度ID
    sector_relevance: ["any"] # [manufacturing|it|service|research|startup|any]
    business_size: ["any"] # [micro|small|medium|large|any]
    application_phase: ["planning"] # [planning|preparation|submission|execution|reporting]
    
    # 関連性タグ
    prerequisite_concepts: [] # 前提となる概念ID
    related_articles: [] # 関連記事ID
    cross_references: ["internal"] # [internal|external]

  # 2階層コンテンツ構造
  content:
    # 【簡単版】初心者向け（必須）
    simple:
      overview: |
        5分で理解できる概要説明
        - 図解・比喩を多用
        - 専門用語は最小限
        - 「なぜ」を重視
      
      key_points:
        point_1:
          title: "ポイント1"
          explanation: "平易な説明"
          example: "具体例・比喩"
          visual_aid: "図解の説明"
        
        point_2:
          title: "ポイント2"
          explanation: "平易な説明"
          example: "具体例・比喩"
          visual_aid: "図解の説明"
      
      quick_takeaway: |
        この記事の要点まとめ（3行以内）
      
      next_steps: |
        次に読むべき記事・取るべき行動
    
    # 【複雑版】上級者向け（必須）
    detailed:
      abstract: |
        専門的な要約・分析観点
      
      comprehensive_analysis:
        theoretical_framework: |
          理論的フレームワークの詳細
        
        empirical_evidence: |
          実証データ・事例分析
        
        policy_implications: |
          政策的含意・制度設計への示唆
        
        practical_applications: |
          実務での具体的活用方法
      
      advanced_insights:
        expert_perspectives: |
          専門家の視点・深い洞察
        
        system_interactions: |
          他制度・システムとの相互作用
        
        future_trends: |
          将来的な発展・変化の予測
      
      technical_details:
        methodology: |
          分析手法・アプローチの詳細
        
        data_sources: |
          データソース・根拠資料
        
        limitations: |
          分析の限界・注意点

  # 抽象化フレームワーク（再利用可能な概念モデル）
  framework:
    # 制度DNA分析モデル
    dna_model:
      origin: "制度創設の背景・契機"
      purpose: "政策目的・解決したい課題"
      design: "制度設計の特徴・仕組み"
      evolution: "制度の発展・変化"
    
    # ステークホルダーマップ
    stakeholder_map:
      primary: "主要関係者（予算元、執行機関等）"
      secondary: "二次関係者（審査委員、支援機関等）"
      beneficiaries: "受益者（申請者、社会等）"
      influences: "影響力の構造・関係性"
    
    # 財源フローモデル
    financial_flow:
      source: "財源の種類・確保方法"
      allocation: "予算配分の仕組み"
      execution: "執行プロセス・管理体制"
      evaluation: "効果測定・フィードバック"
    
    # 評価ロジックツリー
    evaluation_logic:
      criteria_hierarchy: "審査基準の階層構造"
      weight_distribution: "評価項目の重み付け"
      decision_flow: "採択決定のプロセス"
      success_factors: "成功要因の構造"

  # 品質保証
  quality_assurance:
    fact_check: "事実確認済み項目"
    source_verification: "情報源の検証状況"
    expert_review: "専門家レビューの有無"
    update_triggers: "更新が必要となる条件"
```

## コンテンツ作成指針

### 1. 2階層設計の原則
- **簡単版**: 5分で読める、図解重視、専門用語最小限
- **複雑版**: 専門性重視、実務活用可能、理論的裏付けあり
- **相互補完**: 簡単版で興味を持った読者が複雑版で深く学習

### 2. 抽象化の要件
- **普遍性**: 複数制度に適用可能な概念
- **具体性**: 実際の制度で検証可能
- **発展性**: 新制度解説時に活用可能
- **体系性**: 他概念との論理的関係

### 3. タグ構造の活用
- **動的分類**: 読者のレベル・目的に応じた表示
- **関連性表示**: 前提知識・関連記事の自動案内
- **学習パス**: 段階的な知識習得の支援
- **検索最適化**: 多角的な検索・フィルタリング

## 品質チェックリスト

### 内容品質
- [ ] 2階層とも完全に作成されている
- [ ] 抽象化フレームワークが明確
- [ ] 具体例・実証データが豊富
- [ ] 専門性と分かりやすさのバランス

### 構造品質
- [ ] YAML構造に準拠している
- [ ] タグが適切に設定されている
- [ ] 関連性が正しく定義されている
- [ ] 再利用可能性が考慮されている

### 技術品質
- [ ] 情報源が明確で検証可能
- [ ] 更新頻度が適切に設定
- [ ] 読了時間が正確
- [ ] クロスリファレンスが機能する