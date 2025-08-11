#!/bin/bash

# Shinseider Development Server Startup Script
set -e

echo "🚀 Shinseider 開発サーバーを起動中..."

# Check if setup was completed
if [ ! -f backend/venv/bin/activate ]; then
    echo "❌ バックエンドの仮想環境が見つかりません。まず scripts/setup.sh を実行してください。"
    exit 1
fi

if [ ! -d frontend/client/node_modules ]; then
    echo "❌ フロントエンドの依存関係がインストールされていません。まず scripts/setup.sh を実行してください。"
    exit 1
fi

# Start backend in background
echo "🐍 バックエンドサーバーを起動中..."
cd backend
source venv/bin/activate
python -m uvicorn main:app --reload --port 8888 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend
echo "⚛️ フロントエンドサーバーを起動中..."
cd frontend/client
npm start &
FRONTEND_PID=$!
cd ../..

echo "✅ 両方のサーバーが起動しました！"
echo "📱 アプリケーションは http://localhost:3000 でアクセスできます"
echo "🔧 APIは http://localhost:8888 で動作しています"
echo ""
echo "停止するには Ctrl+C を押してください"

# Wait for interrupt
trap "echo ''; echo '🛑 サーバーを停止中...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait