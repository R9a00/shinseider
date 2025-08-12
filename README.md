# Shinseider (シンセイダー) 🚀

<p align="center">
  <img src="frontend/client/public/shinseider_logo.png" alt="Shinseider Logo" width="200"/>
</p>

<p align="center">
  <strong>AI-Powered Subsidy Application Support System</strong><br/>
  中小企業・事業承継者のための補助金申請支援プラットフォーム
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#demo">Demo</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#contributing">Contributing</a>
</p>

---

## ✨ Features

### 🎯 Smart Recommendation Engine
- **30秒診断**: 7つの質問で最適な補助金を自動推薦
- **マッチ度スコア**: 精度の高いレコメンドシステム
- **事業承継者特化**: アトツギ甲子園への特別ルート

### 📝 Guided Application Support
- **段階的入力支援**: 複雑な申請書を分かりやすいステップで作成
- **複数入力モード**: シンプル・ガイド付き・統合入力から選択
- **状態タグシステム**: 「自信がない」「調査が必要」等の状態を追記可能
- **お好みで選択エリア**: 入力内容を保持しつつ追加情報を選択
- **リアルタイム保存**: ブラウザ内自動保存で安心
- **30秒診断連携**: 診断結果を申請フォームに自動事前入力

### 🔒 Privacy-First Design
- **ゼロサーバーストレージ**: すべての処理がクライアント側で完結
- **セキュアファイル生成**: 一時ファイルは自動削除
- **個人情報保護**: データの外部送信は一切なし

### 📄 Professional Output Generation
- **Word文書出力**: 申請に適した形式で自動生成
- **統合チェックリスト**: 申請前の最終確認ツール
- **タスクスケジュール**: 申請プロセス管理ツール
- **書類一覧**: 必要書類のチェックリスト

### 🔄 Version & Research Management
- **バージョン管理**: 補助金情報の更新履歴とソース管理
- **自動URL検証**: 公式サイトの稼働状況チェック

### 🧠 Structural Understanding Framework (New!)
- **制度DNA分析**: 補助金制度の創設背景から政策意図まで構造的理解
- **4つの分析モデル**: 制度DNA・ステークホルダー・財源フロー・評価ロジック
- **2階層コンテンツ**: 初心者向け5分理解 + 専門家向け詳細分析
- **抽象化フレームワーク**: 全補助金制度に応用可能な概念ツール
- **戦略的差別化**: 一般的な申請ノウハウを超えた本質的理解
- **研究データシステム**: 調査結果の記録・検証・マージ機能
- **更新履歴表示**: ユーザー向け情報更新ページ

### 📧 Contact & Communication
- **お問い合わせフォーム**: Gmail SMTP統合によるメール送信
- **スパム保護**: 入力検証とセキュリティ対策
- **レスポンシブデザイン**: モバイル・デスクトップ対応
- **ハンバーガーメニュー**: スマートフォン表示での直感的ナビゲーション

## 🎬 Demo

```bash
# Quick start with setup script
./scripts/setup.sh
./scripts/start-dev.sh
```

![Shinseider Demo](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=Shinseider+Demo)

## 🛠️ Tech Stack

**Frontend**
- ⚛️ React 18 + Hooks
- 🎨 Tailwind CSS
- 🚦 React Router v6

**Backend**
- ⚡ FastAPI (Python 3.8+)
- 📋 PyYAML Configuration
- 📄 python-docx Document Generation
- 🔐 Security Middleware
- 📅 Version Management System
- 🔍 Research Data Management

**Architecture**
- 🏗️ RESTful API Design
- 🌐 SPA (Single Page Application)
- 📱 Responsive UI/UX
- 🔄 Real-time State Management

## 📦 Installation

### Prerequisites
- 🟢 **Node.js** 16+ 
- 🐍 **Python** 3.8+
- 📁 **Git**

### Quick Setup

```bash
# Clone the repository
git clone https://github.com/R9a00/shinseider.git
cd shinseider

# Auto setup (recommended)
./scripts/setup.sh

# Start development servers
./scripts/start-dev.sh
```

### Manual Setup

<details>
<summary>Click to expand manual installation steps</summary>

```bash
# 1. Environment setup
cp .env.example .env
# Edit .env file as needed

# 2. Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..

# 3. Frontend setup
cd frontend/client
npm install
cd ../..

# 4. Start servers
# Terminal 1 - Backend
cd backend && source venv/bin/activate && python -m uvicorn main:app --reload --port 8888

# Terminal 2 - Frontend  
cd frontend/client && npm start
```
</details>

🌐 **Access the application**: [http://localhost:3333](http://localhost:3333)

## 🚀 Usage

### 1. 診断フロー (Diagnostic Flow)
```
Home → 30秒診断 → 質問回答 → 補助金推薦 → 申請開始
```

### 2. 申請フロー (Application Flow)
```
補助金選択 → 入力モード選択 → 段階的入力 → 書類生成 → ダウンロード
```

### 3. 対応補助金 (Supported Subsidies)
- ✅ **中小企業新事業進出補助金** (shinjigyo_shinshutsu)
- ✅ **アトツギ甲子園申請サポート** (atotsugi)
- ✅ **ものづくり補助金第21次** (monodukuri_r7_21th)
- ✅ **事業承継・M&A補助金** (jigyou_shoukei_ma)
- ✅ **Go-tech事業研究開発支援** (gotech_rd_support)
- ✅ **中小企業省力化投資補助金** (shoukuritsuka_ippan)

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BACKEND_PORT` | `8888` | Backend server port |
| `CORS_ORIGIN` | `http://localhost:3333` | Frontend URL |
| `REACT_APP_API_BASE_URL` | `http://localhost:8888` | API base URL |
| `DEBUG` | `false` | Debug mode |
| `LOG_LEVEL` | `INFO` | Logging level |

### Subsidy Configuration

Edit `backend/subsidies.yaml` to customize:
- 補助金情報 (Subsidy information)
- 質問項目 (Question items)  
- 入力フィールド (Input fields)
- メタデータ (Metadata)

### Version Management

Edit `backend/version_history.yaml` to track:
- 補助金情報更新履歴 (Subsidy update history)
- 参照情報ソース (Reference sources)
- URLチェック結果 (URL verification results)

### Research Data Management

Use `backend/research_data/` system to manage subsidy updates:
- **Validation Scripts**: `scripts/validate_research_data.py`
- **Merge Scripts**: `scripts/merge_research_data.py`
- **Investigation Templates**: `templates/url_research_template.yaml`
- **Research Results**: `investigations/` directory

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Client  │ ←→ │   FastAPI Server │ ←→ │  Data Layer     │
│                 │    │                  │    │                 │
│ • 30秒診断      │    │ • REST APIs      │    │ • Subsidies     │
│ • 申請支援      │    │ • Word Generation│    │ • Version Mgmt  │
│ • UI/UX         │    │ • Security       │    │ • Research Data │
│ • 更新履歴     │    │ • Version APIs   │    │ • Validation    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Design Principles

1. **🔍 Data Provenance**: すべての情報源を明確に管理
2. **📊 Tiered Input**: ユーザーレベルに応じた入力支援  
3. **🎯 Versatile Outputs**: 目的別の出力形式
4. **🔄 Process Standardization**: 標準化されたワークフロー

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Ways to Contribute
- 🐛 **Bug Reports**: [Create an issue](../../issues/new?template=bug_report.md)
- 💡 **Feature Requests**: [Create an issue](../../issues/new?template=feature_request.md)  
- 📝 **Documentation**: Improve README, add examples
- 🧪 **Testing**: Add test cases, report edge cases
- 🌐 **Translation**: Help translate the interface
- 🔄 **Subsidy Data Updates**: Report outdated URLs or policy changes
- 🔍 **Research Contributions**: Submit URL verification and policy updates

### Development Workflow

```bash
# 1. Fork the repository
# 2. Create your feature branch
git checkout -b feature/amazing-feature

# 3. Make your changes and commit
git commit -m "Add amazing feature"

# 4. Push to the branch
git push origin feature/amazing-feature

# 5. Create a Pull Request
```

### Code Style
- ✅ Follow existing conventions
- ✅ Add comments for complex logic
- ✅ Update documentation
- ✅ Test your changes

## 🛡️ Security & Privacy

- 🔒 **No Data Storage**: すべての処理はクライアントサイド
- 🔐 **Secure File Handling**: 一時ファイルの自動削除
- 🛡️ **Input Validation**: 悪意のある入力からの保護
- 🔍 **Audit Trail**: セキュリティログの管理

## 🗺️ Development Roadmap

### Phase 1: Core Infrastructure ✅ (Complete)
- [x] **基本申請支援システム**: 30秒診断・段階的入力・Word出力
- [x] **プライバシー設計**: クライアントサイド処理・ゼロサーバーストレージ
- [x] **UI/UXデザイン**: レスポンシブ・アクセシブル・直感的操作
- [x] **基本的補助金対応**: 6つの主要補助金制度サポート

### Phase 2: Knowledge Enhancement 🚧 (In Progress - 2025 Q1)
- [x] **構造的理解フレームワーク**: 補助金制度の本質的理解システム
  - [x] **制度DNA分析モデル**: 創設背景→政策目的→制度設計→期待効果
  - [x] **ステークホルダーマップ**: 関係者の役割・権限・利害の構造化
  - [x] **財源フローモデル**: 予算→執行→効果測定の資金循環
  - [x] **評価ロジックツリー**: 審査基準の階層構造と重み付け
- [x] **2階層コンテンツシステム**: 初心者向け（5分理解）・専門家向け（詳細分析）
- [x] **抽象化フレームワーク**: 全補助金制度に応用可能な概念ツール
- [x] **戦略的差別化**: 一般的支援情報との明確な差別化
- [x] **獲得理由の構造分析**: 採択されやすいパターンの体系化
- [x] **新制度解説システム**: 新補助金の迅速な理解・分析フレームワーク
- [x] **利用事例構造分析**: 業種別成功パターンの抽出・体系化
- [x] **ニュース・お知らせ機能**: 動的な情報更新システム

### Phase 3: AI-Powered Insights (2025 Q2)
- [ ] **AI申請書レビュー**: GPT-4活用による申請書品質チェック
- [ ] **スマートサジェスト**: 過去の成功事例に基づく改善提案
- [ ] **予測スコアリング**: 採択可能性の事前評価システム
- [ ] **競合分析機能**: 類似申請の傾向分析とポジショニング支援

### Phase 4: Advanced Analytics (2025 Q3)
- [ ] **申請トレンド分析**: 採択率・競争倍率の時系列分析
- [ ] **業界別成功パターン**: セクター特化の戦略的示唆
- [ ] **地域別補助金マップ**: 自治体・地域特化支援の可視化
- [ ] **ROI予測モデル**: 補助金活用による投資対効果シミュレーション

### Phase 5: Enterprise & Community (2025 Q4)
- [ ] **チーム機能**: 複数ユーザーでの協働申請支援
- [ ] **専門家連携**: 中小企業診断士・税理士との連携プラットフォーム
- [ ] **コミュニティ機能**: 成功事例の共有・相談掲示板
- [ ] **企業版API**: 大規模組織向けのAPIソリューション

### Phase 6: International Expansion (2026 Q1~)
- [ ] **多言語対応**: 英語・中国語・韓国語での補助金情報提供
- [ ] **海外展開支援**: JETRO・海外補助金制度への対応
- [ ] **グローバルパートナーシップ**: 海外政府機関・支援団体との連携

### 継続的改善項目
- 🔄 **補助金制度更新**: 公式情報の継続的な収集・検証・反映
- 🔒 **セキュリティ強化**: 最新の脅威に対応するセキュリティ対策
- 📊 **パフォーマンス最適化**: システム処理速度・ユーザビリティの向上
- 🧪 **ユーザビリティテスト**: 実際のユーザーフィードバックに基づく改善
- 🌟 **新機能実験**: A/Bテストによる機能効果検証

### 最新のマイルストーン達成 🎉
- **2025-01-21**: 構造的理解フレームワーク完成
  - 4つの分析モデル（制度DNA・ステークホルダー・財源フロー・評価ロジック）実装
  - 2階層コンテンツ（初心者5分・専門家詳細）システム構築
  - 洗練されたタグ構造による体系的分類システム
  - 全補助金制度に応用可能な抽象化概念ツール

> **Vision**: 日本の中小企業・事業承継者が補助金を活用して持続的成長を実現できるエコシステムの構築

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

```
Copyright 2025 Shinseider Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
```

## ⚠️ Disclaimer

> **Important**: This tool assists with subsidy applications but does not guarantee approval or accuracy. Always verify information with official sources and consult experts when needed.

- 📋 申請の成否や正確性は保証されません
- 🔍 実際の申請前には公式要項を必ず確認してください  
- 📅 補助金制度は変更される可能性があります
- 👨‍💼 必要に応じて専門家にご相談ください

## 🎯 Mission

**Empowering SMEs and Business Successors**

このプロジェクトは、中小企業の成長と事業承継を支援し、日本経済の持続的発展に貢献することを目指しています。

---

<p align="center">
  <strong>Supporting Japanese SMEs and Business Succession</strong>
</p>

<p align="center">
  <a href="#top">Back to top</a>
</p>