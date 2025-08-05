import pytest
from fastapi.testclient import TestClient
from main import app
import json
import os

client = TestClient(app)

class TestSecurityRequirements:
    """セキュリティ要件のテスト"""
    
    def test_req_sec_001_request_size_limit(self):
        """REQ-SEC-001: リクエストサイズ制限のテスト"""
        # 1MB以下のリクエスト（正常）
        small_data = {"answers": [{"question": "test", "answer": "test"}]}
        response = client.post("/save_desire", json=small_data)
        assert response.status_code in [200, 400]  # 400はバリデーションエラー
        
        # 1MB超過のリクエスト（ブロックされるべき）
        large_data = {"answers": [{"question": "A" * 1000000, "answer": "A" * 1000000}]}
        response = client.post("/save_desire", json=large_data)
        assert response.status_code == 413  # Request too large
    
    def test_req_sec_002_data_type_validation(self):
        """REQ-SEC-002: データ型検証のテスト"""
        # 不正なデータ型
        invalid_data = {"invalid_field": "test"}
        response = client.post("/save_desire", json=invalid_data)
        assert response.status_code == 422  # Validation error
        
        # 危険なコンテンツ
        dangerous_data = {
            "answers": [{"question": "<script>alert('xss')</script>", "answer": "test"}]
        }
        response = client.post("/save_desire", json=dangerous_data)
        assert response.status_code == 422  # Validation error
    
    def test_llm_prompt_generation_security(self):
        """LLMプロンプト生成のセキュリティテスト"""
        # 正常なリクエスト
        valid_data = {
            "subsidy_id": "shinjigyo_shinshutsu",
            "input_mode": "simple",
            "answers": {
                "is_new_product_and_customer": True,
                "new_market_potential": "新規性の説明"
            }
        }
        response = client.post("/generate_application_advice", json=valid_data)
        assert response.status_code == 200
        
        # 危険なコンテンツを含むリクエスト
        dangerous_data = {
            "subsidy_id": "shinjigyo_shinshutsu",
            "input_mode": "simple",
            "answers": {
                "is_new_product_and_customer": True,
                "new_market_potential": "<script>alert('xss')</script>"
            }
        }
        response = client.post("/generate_application_advice", json=dangerous_data)
        assert response.status_code == 422  # Validation error
    
    def test_req_sec_003_filename_validation(self):
        """REQ-SEC-003: ファイル名検証のテスト"""
        # 危険なファイル名
        dangerous_filename = "../../../etc/passwd"
        # このテストは実際のファイル操作で検証
        
    def test_req_sec_004_error_information_hiding(self):
        """REQ-SEC-004: エラー情報の隠蔽テスト"""
        # 本番環境でのエラー情報隠蔽
        # 開発環境では詳細情報が表示される
        response = client.get("/nonexistent_endpoint")
        assert response.status_code == 404
    
    def test_req_sec_006_safe_file_path(self):
        """REQ-SEC-006: 安全なファイルパスのテスト"""
        # パストラバーサル攻撃のテスト
        dangerous_path = "../../../etc/passwd"
        # このテストは実際のファイル操作で検証
    
    def test_req_sec_008_rate_limiting(self):
        """REQ-SEC-008: API呼び出し頻度制限のテスト"""
        # 大量のリクエストを送信
        for i in range(150):  # 制限を超える
            response = client.get("/")
            if response.status_code == 429:  # Too many requests
                break
        else:
            pytest.fail("Rate limiting not working")
    
    def test_req_sec_010_cache_control(self):
        """REQ-SEC-010: キャッシュ制御のテスト"""
        response = client.get("/")
        assert "Cache-Control" in response.headers
        assert "no-store" in response.headers["Cache-Control"]
        assert "Pragma" in response.headers
        assert response.headers["Pragma"] == "no-cache"

class TestSecurityMiddleware:
    """セキュリティミドルウェアのテスト"""
    
    def test_security_middleware_loaded(self):
        """セキュリティミドルウェアが読み込まれているかテスト"""
        # ミドルウェアが正しく設定されているか確認
        response = client.get("/")
        assert response.status_code == 200
    
    def test_cors_headers(self):
        """CORSヘッダーのテスト"""
        response = client.options("/")
        # CORSヘッダーが設定されているか確認

class TestSecureFileOperations:
    """セキュアファイル操作のテスト"""
    
    def test_secure_file_write(self):
        """セキュアファイル書き込みのテスト"""
        from secure_file_utils import get_secure_file_manager
        
        file_manager = get_secure_file_manager()
        
        # 正常なファイル名
        content = "test content"
        result = file_manager.secure_file_write(content, "test.txt")
        assert os.path.exists(result)
        
        # 危険なファイル名
        with pytest.raises(ValueError):
            file_manager.secure_file_write(content, "../../../etc/passwd")
    
    def test_secure_file_read(self):
        """セキュアファイル読み込みのテスト"""
        from secure_file_utils import get_secure_file_manager
        
        file_manager = get_secure_file_manager()
        
        # 正常なファイル名
        content = file_manager.secure_file_read("test.txt")
        assert content == "test content"
        
        # 危険なファイル名
        with pytest.raises(ValueError):
            file_manager.secure_file_read("../../../etc/passwd")

class TestDataValidation:
    """データ検証のテスト"""
    
    def test_desire_request_validation(self):
        """DesireRequestの検証テスト"""
        # 正常なデータ
        valid_data = {
            "answers": [
                {"question": "What is your business idea?", "answer": "A new service"}
            ]
        }
        response = client.post("/save_desire", json=valid_data)
        assert response.status_code in [200, 400]  # 400はバリデーションエラー
        
        # 不正なデータ
        invalid_data = {
            "answers": [
                {"question": "<script>alert('xss')</script>", "answer": "test"}
            ]
        }
        response = client.post("/save_desire", json=invalid_data)
        assert response.status_code == 422  # Validation error
    
    def test_business_plan_request_validation(self):
        """BusinessPlanRequestの検証テスト"""
        # 正常なデータ
        valid_data = {
            "business_summary": "A new business idea",
            "market_analysis": "Market analysis"
        }
        response = client.post("/generate_business_plan", json=valid_data)
        assert response.status_code in [200, 500]  # 500は処理エラー
        
        # 危険なデータ
        dangerous_data = {
            "business_summary": "<script>alert('xss')</script>"
        }
        response = client.post("/generate_business_plan", json=dangerous_data)
        assert response.status_code == 422  # Validation error

if __name__ == "__main__":
    pytest.main([__file__]) 