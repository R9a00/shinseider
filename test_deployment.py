#!/usr/bin/env python3
"""
デプロイ後のメール送信機能テストスクリプト
使用方法: python test_deployment.py [API_BASE_URL]
"""

import requests
import sys
import time
from datetime import datetime

def test_email_functionality(api_base_url="https://shinseider-api.onrender.com"):
    """デプロイ後のメール送信機能をテスト"""
    print(f"🚀 Testing email functionality at: {api_base_url}")
    print(f"⏰ Test started at: {datetime.now().isoformat()}")
    print("-" * 50)
    
    try:
        # 1. ヘルスチェック
        print("1️⃣ Health check...")
        health_response = requests.get(f"{api_base_url}/health", timeout=30)
        if health_response.status_code == 200:
            print("✅ Health check passed")
        else:
            print(f"❌ Health check failed: {health_response.status_code}")
            return False
        
        # 2. メール送信テスト
        print("2️⃣ Testing email functionality...")
        email_test_response = requests.post(f"{api_base_url}/test-email", timeout=60)
        
        if email_test_response.status_code == 200:
            result = email_test_response.json()
            if result.get("status") == "success":
                print("✅ Email test passed!")
                print(f"   📧 Gmail user: {result.get('gmail_user')}")
                print(f"   ⏰ Timestamp: {result.get('timestamp')}")
                return True
            else:
                print(f"❌ Email test failed: {result.get('message')}")
                print(f"   Gmail user set: {result.get('gmail_user_set')}")
                print(f"   Gmail password set: {result.get('gmail_password_set')}")
                return False
        else:
            print(f"❌ Email test request failed: {email_test_response.status_code}")
            try:
                error_detail = email_test_response.json()
                print(f"   Error details: {error_detail}")
            except:
                print(f"   Response text: {email_test_response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ Request timeout - server may be starting up")
        return False
    except requests.exceptions.ConnectionError:
        print("❌ Connection error - server may not be running")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def wait_for_deployment(api_base_url, max_wait_minutes=5):
    """デプロイ完了まで待機"""
    print(f"⏳ Waiting for deployment to complete...")
    max_attempts = max_wait_minutes * 6  # 10秒間隔でチェック
    
    for attempt in range(max_attempts):
        try:
            response = requests.get(f"{api_base_url}/health", timeout=10)
            if response.status_code == 200:
                print(f"✅ Deployment ready after {attempt * 10} seconds")
                return True
        except:
            pass
        
        print(f"   Attempt {attempt + 1}/{max_attempts} - waiting...")
        time.sleep(10)
    
    print(f"❌ Deployment not ready after {max_wait_minutes} minutes")
    return False

if __name__ == "__main__":
    # コマンドライン引数からAPI URLを取得
    api_url = sys.argv[1] if len(sys.argv) > 1 else "https://shinseider-api.onrender.com"
    
    print("🎯 Shinseider Deployment Test")
    print("=" * 50)
    
    # デプロイ完了まで待機
    if not wait_for_deployment(api_url):
        sys.exit(1)
    
    # メール機能テスト実行
    success = test_email_functionality(api_url)
    
    print("-" * 50)
    if success:
        print("🎉 All tests passed! Deployment successful.")
        sys.exit(0)
    else:
        print("💥 Tests failed! Check deployment configuration.")
        sys.exit(1)