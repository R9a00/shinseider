#!/usr/bin/env python3
"""
SPAルーティング デバッグ用テスト

Render環境での_redirectsファイル動作を詳しく調査するためのテスト
"""

import requests
import sys
import time
from typing import Dict, Any

def debug_render_configuration(base_url: str = "https://shinseider.onrender.com"):
    """Render環境の設定をデバッグ"""
    
    print(f"🔍 RENDER SPA CONFIGURATION DEBUG")
    print(f"Base URL: {base_url}")
    print("=" * 60)
    
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Debug-Agent/1.0'
    })
    
    # 1. ホームページの詳細チェック
    print("\n1️⃣ ROOT PAGE ANALYSIS")
    try:
        response = session.get(base_url, timeout=10)
        print(f"   Status: {response.status_code}")
        print(f"   Content-Type: {response.headers.get('content-type', 'N/A')}")
        print(f"   Final URL: {response.url}")
        print(f"   Response Headers:")
        for key, value in response.headers.items():
            if key.lower() in ['server', 'x-served-by', 'x-cache', 'content-type', 'cache-control']:
                print(f"     {key}: {value}")
        
        # HTMLコンテンツの確認
        contains_root = '<div id="root">' in response.text
        contains_react = 'react' in response.text.lower()
        print(f"   Contains React Root: {contains_root}")
        print(f"   Contains React References: {contains_react}")
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # 2. 404ページのテスト
    print("\n2️⃣ 404 PAGE TEST")
    test_404_url = f"{base_url}/nonexistent-page-test-404"
    try:
        response = session.get(test_404_url, timeout=10)
        print(f"   URL: {test_404_url}")
        print(f"   Status: {response.status_code}")
        print(f"   Final URL: {response.url}")
        
        # 404ページの内容確認
        if response.status_code == 404:
            print("   ✅ Proper 404 response")
            print(f"   Content snippet: {response.text[:200]}...")
        else:
            print(f"   🤔 Non-404 response: {response.status_code}")
            contains_root = '<div id="root">' in response.text
            print(f"   Contains React Root: {contains_root}")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # 3. 既知のルートのテスト
    print("\n3️⃣ KNOWN ROUTE TESTS")
    test_routes = ["/phase1", "/subsidy-selection", "/knowledge-base"]
    
    for route in test_routes:
        print(f"\n   Testing: {route}")
        try:
            url = f"{base_url}{route}"
            response = session.get(url, timeout=10, allow_redirects=True)
            
            print(f"     Status: {response.status_code}")
            print(f"     Final URL: {response.url}")
            print(f"     Redirected: {url != response.url}")
            
            if response.status_code == 200:
                contains_root = '<div id="root">' in response.text
                contains_404 = "404" in response.text.lower() or "not found" in response.text.lower()
                print(f"     Contains React Root: {contains_root}")
                print(f"     Contains 404 content: {contains_404}")
                
                # タイトルの確認
                import re
                title_match = re.search(r'<title[^>]*>(.*?)</title>', response.text, re.IGNORECASE)
                if title_match:
                    print(f"     Page Title: {title_match.group(1)}")
            
        except Exception as e:
            print(f"     ❌ Error: {e}")
            
        time.sleep(0.5)
    
    # 4. _redirectsファイルの存在確認
    print("\n4️⃣ REDIRECTS FILE CHECK")
    redirects_url = f"{base_url}/_redirects"
    try:
        response = session.get(redirects_url, timeout=10)
        print(f"   URL: {redirects_url}")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print("   ✅ _redirects file is accessible")
            print(f"   Content: {response.text}")
        else:
            print(f"   🤔 _redirects file status: {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # 5. 推奨事項
    print("\n5️⃣ RECOMMENDATIONS")
    print("   Based on the analysis above:")
    print("   • Check if _redirects file is properly deployed")
    print("   • Verify build process includes public/_redirects")
    print("   • Consider if Render requires specific configuration")
    print("   • Check Render deployment logs for any errors")

def main():
    base_url = sys.argv[1] if len(sys.argv) > 1 else "https://shinseider.onrender.com"
    debug_render_configuration(base_url)
    
    print("\n" + "=" * 60)
    print("✅ Debug analysis complete")
    print("💡 Next steps: Check Render dashboard and build logs")

if __name__ == "__main__":
    main()