#!/bin/bash

# プロジェクトのルートディレクトリを取得
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

# 仮想環境を有効化
source "$SCRIPT_DIR/backend/venv/bin/activate"

# PYTHONPATHにプロジェクトルートを追加
export PYTHONPATH="$SCRIPT_DIR"

# uvicornを起動
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8888 --reload --app-dir "$SCRIPT_DIR/backend"
