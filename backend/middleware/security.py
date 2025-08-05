import os
import json
import re
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Optional
import logging
import time

# セキュリティログの設定
security_logger = logging.getLogger("security")
security_logger.setLevel(logging.INFO)

class SecurityMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_request_size: int = 1024 * 1024):  # 1MB
        super().__init__(app)
        self.max_request_size = max_request_size

    async def dispatch(self, request: Request, call_next):
        # リクエストサイズ制限（REQ-SEC-001）
        if request.method in ["POST", "PUT", "PATCH"]:
            content_length = request.headers.get("content-length")
            if content_length and int(content_length) > self.max_request_size:
                security_logger.warning(f"Large request blocked: {content_length} bytes from {request.client.host}")
                return JSONResponse(
                    status_code=413,
                    content={"error": "Request too large"}
                )

        # ファイルパス検証（REQ-SEC-006）
        if "file_path" in request.query_params:
            file_path = request.query_params["file_path"]
            if not self._validate_safe_path(file_path):
                security_logger.warning(f"Path traversal attempt blocked: {file_path} from {request.client.host}")
                return JSONResponse(
                    status_code=400,
                    content={"error": "Invalid file path"}
                )

        response = await call_next(request)
        
        # キャッシュ制御ヘッダーの追加（REQ-SEC-010）
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
        
        return response

    def _validate_safe_path(self, file_path: str) -> bool:
        """安全なファイルパスの検証"""
        try:
            # 危険な文字を含むパスを拒否
            dangerous_patterns = [
                r'\.\.',  # パストラバーサル
                r'/',     # 絶対パス
                r'\\',    # Windows絶対パス
                r'[<>:"|?*]',  # 危険な文字
            ]
            
            for pattern in dangerous_patterns:
                if re.search(pattern, file_path):
                    return False
            
            # ファイル名長制限（50文字）
            if len(os.path.basename(file_path)) > 50:
                return False
                
            return True
        except:
            return False

class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, is_production: bool = False):
        super().__init__(app)
        self.is_production = is_production

    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
            return response
        except Exception as exc:
            # エラー情報の隠蔽（REQ-SEC-004）
            if self.is_production:
                security_logger.error(f"Internal error: {str(exc)} from {request.client.host}")
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

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_requests: int = 100, window_seconds: int = 60):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests = {}  # 簡易的な実装

    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host
        
        # 簡易的なレート制限（REQ-SEC-008）
        current_time = int(time.time())
        if client_ip in self.requests:
            # 古いリクエストを削除
            self.requests[client_ip] = [t for t in self.requests[client_ip] 
                                       if current_time - t < self.window_seconds]
            
            if len(self.requests[client_ip]) >= self.max_requests:
                security_logger.warning(f"Rate limit exceeded for {client_ip}")
                return JSONResponse(
                    status_code=429,
                    content={"error": "Too many requests"}
                )
        
        if client_ip not in self.requests:
            self.requests[client_ip] = []
        self.requests[client_ip].append(current_time)
        
        response = await call_next(request)
        return response 