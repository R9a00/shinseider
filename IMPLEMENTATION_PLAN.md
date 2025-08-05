# アトツギ甲子園用システム - セキュリティ実装計画書

## 1. 実装概要

本ドキュメントは、セキュリティ要件定義書に基づく具体的な実装計画を定義します。

## 2. フェーズ別実装計画

### フェーズ1: 緊急対応（即座に実装）

#### 2.1 REQ-SEC-001: リクエストサイズ制限

**実装内容**:
```python
# main.py に追加
from fastapi import Request
import json

# リクエストサイズ制限ミドルウェア
@app.middleware("http")
async def limit_request_size(request: Request, call_next):
    if request.method == "POST":
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > 1024 * 1024:  # 1MB
            return JSONResponse(
                status_code=413,
                content={"error": "Request too large"}
            )
    return await call_next(request)
```

**テストケース**:
- 1MB以下のリクエスト: 正常処理
- 1MB超過のリクエスト: 413エラー
- 大量データ送信攻撃: ブロック

#### 2.2 REQ-SEC-006: 安全なファイルパス

**実装内容**:
```python
# word_generator.py に追加
import os
from pathlib import Path

def validate_safe_path(file_path: str) -> bool:
    """安全なファイルパスの検証"""
    try:
        path = Path(file_path).resolve()
        base_dir = Path.cwd().resolve()
        return base_dir in path.parents or base_dir == path.parent
    except:
        return False

def generate_word(file_path: str, content: str):
    if not validate_safe_path(file_path):
        raise ValueError("Invalid file path")
    # 既存の処理...
```

**テストケース**:
- 正常なファイル名: 処理継続
- パストラバーサル攻撃: 例外発生
- 絶対パス指定: 拒否

#### 2.3 REQ-SEC-004: エラー情報の隠蔽

**実装内容**:
```python
# main.py に追加
from fastapi import HTTPException
from fastapi.responses import JSONResponse

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # 本番環境では詳細情報を隠す
    if os.getenv("ENVIRONMENT") == "production":
        return JSONResponse(
            status_code=500,
            content={"error": "Internal server error"}
        )
    else:
        # 開発環境では詳細情報を表示
        return JSONResponse(
            status_code=500,
            content={"error": str(exc)}
        )
```

**テストケース**:
- 本番環境: 汎用エラーメッセージ
- 開発環境: 詳細エラー情報
- スタックトレース: ログファイルのみ

### フェーズ2: 高優先度（1週間以内）

#### 2.4 REQ-SEC-002: データ型検証

**実装内容**:
```python
# models.py を新規作成
from pydantic import BaseModel, Field
from typing import List, Optional

class DesireRequest(BaseModel):
    answers: List[dict] = Field(..., max_items=100)
    
class SubsidyRequest(BaseModel):
    purpose: Optional[str] = Field(None, max_length=100)
    # 他のフィールド...

class BusinessPlanRequest(BaseModel):
    business_summary: str = Field(..., max_length=10000)
    market_analysis: str = Field(..., max_length=10000)
    # 他のフィールド...
```

**テストケース**:
- 正常なデータ型: 処理継続
- 不正なデータ型: バリデーションエラー
- 必須フィールド欠如: エラー

#### 2.5 REQ-SEC-005: 入力エラーの適切な処理

**実装内容**:
```python
# main.py に追加
from fastapi import HTTPException

@app.post("/save_desire")
async def save_desire(request: DesireRequest):
    try:
        # 処理...
        return {"message": "Success"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal error")
```

**テストケース**:
- 正常な入力: 200レスポンス
- 不正な入力: 400エラー
- システムエラー: 500エラー

#### 2.6 REQ-SEC-003: ファイル名検証

**実装内容**:
```python
import re

def validate_filename(filename: str) -> bool:
    """安全なファイル名の検証"""
    pattern = r'^[a-zA-Z0-9_-]+\.(docx|pdf)$'
    return bool(re.match(pattern, filename)) and len(filename) <= 50

def generate_word(file_path: str, content: str):
    if not validate_filename(os.path.basename(file_path)):
        raise ValueError("Invalid filename")
    # 既存の処理...
```

**テストケース**:
- 正常なファイル名: 処理継続
- 危険な文字含む: 拒否
- 長すぎるファイル名: 拒否

### フェーズ3: 中優先度（1ヶ月以内）

#### 2.7 REQ-SEC-008: API呼び出し頻度制限

**実装内容**:
```python
# requirements.txt に追加
# fastapi-limiter==0.1.5

# main.py に追加
from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter

@app.post("/save_desire")
@RateLimiter(times=60, seconds=60)  # 1分間に60回
async def save_desire(request: DesireRequest):
    # 処理...
```

**テストケース**:
- 正常な頻度: 処理継続
- 過度な頻度: 429エラー
- IP別制限: 正常動作

#### 2.8 REQ-SEC-009: セキュリティログ

**実装内容**:
```python
import logging
import json
from datetime import datetime

# セキュリティログ設定
security_logger = logging.getLogger("security")
security_logger.setLevel(logging.INFO)

def log_security_event(event_type: str, details: dict):
    """セキュリティイベントの記録"""
    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "event_type": event_type,
        "details": details
    }
    security_logger.info(json.dumps(log_entry))

@app.middleware("http")
async def security_logging_middleware(request: Request, call_next):
    # リクエスト記録
    log_security_event("request", {
        "method": request.method,
        "path": request.url.path,
        "client_ip": request.client.host
    })
    
    response = await call_next(request)
    
    # エラー記録
    if response.status_code >= 400:
        log_security_event("error", {
            "status_code": response.status_code,
            "path": request.url.path
        })
    
    return response
```

**テストケース**:
- 正常リクエスト: ログ記録
- エラー発生: 詳細ログ
- 不正アクセス: セキュリティログ

#### 2.9 REQ-SEC-007: 一時ファイルの管理

**実装内容**:
```python
import tempfile
import shutil
from pathlib import Path

def create_temp_file(content: str, suffix: str = ".docx") -> str:
    """一時ファイルの作成"""
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as f:
        f.write(content.encode())
        return f.name

def cleanup_temp_files():
    """一時ファイルのクリーンアップ"""
    temp_dir = Path(tempfile.gettempdir())
    for file in temp_dir.glob("attg_*"):
        if file.stat().st_mtime < (time.time() - 3600):  # 1時間以上古い
            file.unlink()
```

**テストケース**:
- ファイル生成: 一時ディレクトリ使用
- 自動削除: 定期的なクリーンアップ
- サイズ制限: ファイルサイズチェック

## 3. 実装スケジュール

### 週1: 緊急対応
- [ ] REQ-SEC-001: リクエストサイズ制限
- [ ] REQ-SEC-006: 安全なファイルパス
- [ ] REQ-SEC-004: エラー情報の隠蔽

### 週2: 高優先度
- [ ] REQ-SEC-002: データ型検証
- [ ] REQ-SEC-005: 入力エラーの適切な処理
- [ ] REQ-SEC-003: ファイル名検証

### 週3-4: 中優先度
- [ ] REQ-SEC-008: API呼び出し頻度制限
- [ ] REQ-SEC-009: セキュリティログ
- [ ] REQ-SEC-007: 一時ファイルの管理

## 4. テスト計画

### 4.1 単体テスト
```python
# test_security.py
import pytest
from fastapi.testclient import TestClient

def test_request_size_limit():
    """リクエストサイズ制限のテスト"""
    client = TestClient(app)
    large_data = {"data": "A" * 1024 * 1024}  # 1MB
    response = client.post("/save_desire", json=large_data)
    assert response.status_code == 413

def test_file_path_validation():
    """ファイルパス検証のテスト"""
    with pytest.raises(ValueError):
        generate_word("../../../etc/passwd", "content")
```

### 4.2 統合テスト
```python
# test_integration.py
def test_security_workflow():
    """セキュリティ機能の統合テスト"""
    # 正常なワークフロー
    # 攻撃シナリオ
    # エラーハンドリング
```

### 4.3 ペネトレーションテスト
```bash
# 攻撃シナリオのテスト
curl -X POST http://localhost:8888/save_desire \
  -H "Content-Type: application/json" \
  -d '{"answers": ["A" * 1000000] * 100}'
```

## 5. 運用準備

### 5.1 監視設定
- **ログ監視**: ELK Stack または Splunk
- **メトリクス監視**: Prometheus + Grafana
- **アラート設定**: 異常検知の自動通知

### 5.2 インシデント対応
- **エスカレーション手順**: 24時間体制
- **対応マニュアル**: 攻撃パターン別対応
- **復旧手順**: システム復旧の手順

### 5.3 教育・訓練
- **開発者研修**: セキュリティコーディング
- **運用研修**: インシデント対応訓練
- **定期的なレビュー**: セキュリティ状況の確認

## 6. 成功指標

### 6.1 技術指標
- **脆弱性数**: 0件
- **セキュリティインシデント**: 0件/月
- **ペネトレーションテスト**: 100%通過

### 6.2 運用指標
- **平均応答時間**: 200ms以下
- **エラー率**: 1%以下
- **可用性**: 99.9%以上

### 6.3 コンプライアンス指標
- **法的要件**: 100%準拠
- **業界標準**: OWASP Top 10準拠
- **監査結果**: 合格

---

**注意**: 本実装計画は攻撃者の視点での分析結果に基づいて作成されています。実装時は段階的な導入と継続的な検証が必要です。 