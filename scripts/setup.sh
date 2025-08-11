#!/bin/bash

# Shinseider Setup Script
set -e

echo "🚀 Shinseider セットアップを開始します..."

# Check prerequisites
echo "📋 前提条件をチェック中..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js がインストールされていません。Node.js 16+ をインストールしてください。"
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 がインストールされていません。Python 3.8+ をインストールしてください。"
    exit 1
fi

echo "✅ 前提条件OK"

# Setup environment variables
if [ ! -f .env ]; then
    echo "🔧 環境変数を設定中..."
    cp .env.example .env
    echo "✅ .env ファイルを作成しました。必要に応じて編集してください。"
fi

# Backend setup
echo "🐍 バックエンドをセットアップ中..."
cd backend

if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "✅ Python仮想環境を作成しました"
fi

source venv/bin/activate
pip install -r requirements.txt
echo "✅ Python依存関係をインストールしました"

cd ..

# Frontend setup  
echo "⚛️ フロントエンドをセットアップ中..."
cd frontend/client

if [ ! -d "node_modules" ]; then
    npm install
    echo "✅ Node.js依存関係をインストールしました"
fi

cd ../..

echo "🎉 セットアップ完了！"
echo ""
echo "開発サーバーを起動するには："
echo "  バックエンド: cd backend && source venv/bin/activate && python -m uvicorn main:app --reload --port 8888"
echo "  フロントエンド: cd frontend/client && npm start"
echo ""
echo "アプリケーションは http://localhost:3000 でアクセスできます"