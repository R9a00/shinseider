import os
import tempfile
import shutil
import uuid
from pathlib import Path
from typing import Optional
import logging
import re

security_logger = logging.getLogger("security")

class SecureFileManager:
    """セキュアなファイル管理クラス"""
    
    def __init__(self, base_dir: str = None):
        self.base_dir = base_dir or os.path.dirname(os.path.abspath(__file__))
        self.temp_dir = os.path.join(self.base_dir, "temp_files")
        self._ensure_temp_dir()
    
    def _ensure_temp_dir(self):
        """一時ディレクトリの作成"""
        if not os.path.exists(self.temp_dir):
            os.makedirs(self.temp_dir, exist_ok=True)
    
    def validate_safe_filename(self, filename: str) -> bool:
        """安全なファイル名の検証（REQ-SEC-003）"""
        try:
            # 危険な文字を含むファイル名を拒否
            dangerous_patterns = [
                r'[<>:"|?*]',  # Windows危険文字
                r'\.\.',       # パストラバーサル
                r'^\.',        # 隠しファイル
                r'\.$',        # 末尾のドット
            ]
            
            for pattern in dangerous_patterns:
                if re.search(pattern, filename):
                    return False
            
            # ファイル名長制限（50文字）
            if len(filename) > 50:
                return False
            
            # 許可される文字のみ
            allowed_chars = r'^[a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBF\u20000-\u2A6DF\u2A700-\u2B73F\u2B740-\u2B81F\u2B820-\u2CEAF\uF900-\uFAFF\u2F800-\u2FA1F\u3000-\u303F\uFF00-\uFFEF\u0020\u002E\u002D\u005F]+$'
            if not re.match(allowed_chars, filename):
                return False
                
            return True
        except:
            return False
    
    def create_secure_temp_file(self, suffix: str = ".tmp") -> str:
        """セキュアな一時ファイルの作成（REQ-SEC-007）"""
        try:
            # UUIDを使用してランダムなファイル名を生成
            unique_filename = f"{uuid.uuid4().hex}{suffix}"
            temp_file_path = os.path.join(self.temp_dir, unique_filename)
            
            # ファイルを作成
            with open(temp_file_path, 'w') as f:
                pass
            
            security_logger.info(f"Secure temp file created: {temp_file_path}")
            return temp_file_path
        except Exception as e:
            security_logger.error(f"Failed to create secure temp file: {e}")
            raise
    
    def cleanup_temp_files(self, max_age_hours: int = 24):
        """古い一時ファイルの削除（REQ-SEC-007）"""
        try:
            import time
            current_time = time.time()
            max_age_seconds = max_age_hours * 3600
            
            for filename in os.listdir(self.temp_dir):
                file_path = os.path.join(self.temp_dir, filename)
                if os.path.isfile(file_path):
                    file_age = current_time - os.path.getmtime(file_path)
                    if file_age > max_age_seconds:
                        os.remove(file_path)
                        security_logger.info(f"Cleaned up old temp file: {file_path}")
        except Exception as e:
            security_logger.error(f"Failed to cleanup temp files: {e}")
    
    def secure_file_write(self, content: str, filename: str) -> str:
        """セキュアなファイル書き込み（REQ-SEC-006）"""
        try:
            # ファイル名の安全性検証
            if not self.validate_safe_filename(filename):
                raise ValueError("Invalid filename")
            
            # 安全なパスに書き込み
            safe_path = os.path.join(self.base_dir, filename)
            
            # パストラバーサル攻撃の防止
            if not self._is_safe_path(safe_path):
                raise ValueError("Path traversal detected")
            
            # ファイルサイズ制限（10MB）
            if len(content.encode('utf-8')) > 10 * 1024 * 1024:
                raise ValueError("Content too large")
            
            with open(safe_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            security_logger.info(f"Secure file write completed: {safe_path}")
            return safe_path
        except Exception as e:
            security_logger.error(f"Secure file write failed: {e}")
            raise
    
    def _is_safe_path(self, file_path: str) -> bool:
        """安全なパスの検証（REQ-SEC-006）"""
        try:
            path = Path(file_path).resolve()
            base_dir = Path(self.base_dir).resolve()
            return base_dir in path.parents or base_dir == path.parent
        except:
            return False
    
    def secure_file_read(self, filename: str) -> str:
        """セキュアなファイル読み込み（REQ-SEC-006）"""
        try:
            # ファイル名の安全性検証
            if not self.validate_safe_filename(filename):
                raise ValueError("Invalid filename")
            
            file_path = os.path.join(self.base_dir, filename)
            
            # パストラバーサル攻撃の防止
            if not self._is_safe_path(file_path):
                raise ValueError("Path traversal detected")
            
            # ファイルサイズ制限（10MB）
            if os.path.getsize(file_path) > 10 * 1024 * 1024:
                raise ValueError("File too large")
            
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            security_logger.info(f"Secure file read completed: {file_path}")
            return content
        except Exception as e:
            security_logger.error(f"Secure file read failed: {e}")
            raise

# グローバルインスタンス
secure_file_manager = SecureFileManager()

def get_secure_file_manager() -> SecureFileManager:
    """セキュアファイルマネージャーの取得"""
    return secure_file_manager 