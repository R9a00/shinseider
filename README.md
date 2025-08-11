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
- **3分診断**: 7つの質問で最適な補助金を自動推薦
- **マッチ度スコア**: 精度の高いレコメンドシステム
- **事業承継者特化**: アトツギ甲子園への特別ルート

### 📝 Guided Application Support
- **段階的入力支援**: 複雑な申請書を分かりやすいステップで作成
- **複数入力モード**: シンプル・ガイド付き・統合入力から選択
- **リアルタイム保存**: ブラウザ内自動保存で安心

### 🔒 Privacy-First Design
- **ゼロサーバーストレージ**: すべての処理がクライアント側で完結
- **セキュアファイル生成**: 一時ファイルは自動削除
- **個人情報保護**: データの外部送信は一切なし

### 📄 Professional Output Generation
- **Word文書出力**: 申請に適した形式で自動生成
- **専門家相談資料**: 第三者レビュー用サマリー作成
- **自己チェックリスト**: 申請前の最終確認ツール

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
git clone https://github.com/your-username/shinseider.git
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

🌐 **Access the application**: [http://localhost:3000](http://localhost:3000)

## 🚀 Usage

### 1. 診断フロー (Diagnostic Flow)
```
Home → 3分診断 → 質問回答 → 補助金推薦 → 申請開始
```

### 2. 申請フロー (Application Flow)
```
補助金選択 → 入力モード選択 → 段階的入力 → 書類生成 → ダウンロード
```

### 3. 対応補助金 (Supported Subsidies)
- ✅ ものづくり・商業・サービス生産性向上促進補助金
- ✅ 中小企業省力化投資補助金
- ✅ Go-tech事業（成長型中小企業等研究開発支援事業）
- ✅ 事業承継・M&A補助金
- ✅ アトツギ甲子園申請サポート
- ✅ その他中小企業向け補助金

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

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Client  │ ←→ │   FastAPI Server │ ←→ │  YAML Configs   │
│                 │    │                  │    │                 │
│ • 3分診断       │    │ • REST APIs      │    │ • Subsidies     │
│ • 申請支援      │    │ • Word Generation│    │ • Questions     │
│ • UI/UX         │    │ • Security       │    │ • Metadata      │
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
  <strong>Made with ❤️ for Japanese SMEs and Business Successors</strong>
</p>

<p align="center">
  <a href="#top">Back to top ⬆️</a>
</p>