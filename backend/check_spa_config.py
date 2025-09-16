#!/usr/bin/env python3
"""
SPA設定確認ツール

デプロイ前にSPA設定ファイルが正しく配置されているかチェックする
"""

import os
import sys

def check_spa_configuration():
    """SPA設定の完全性をチェック"""
    
    base_path = "/Users/r9a/exp/attg"
    client_path = f"{base_path}/frontend/client"
    
    print("🔍 SPA Configuration Check")
    print("=" * 50)
    
    checks = {
        "✅ App.js (Routes)": f"{client_path}/src/App.js",
        "✅ _redirects (Public)": f"{client_path}/public/_redirects", 
        "✅ .htaccess (Public)": f"{client_path}/public/.htaccess",
        "✅ render.yaml (Root)": f"{base_path}/render.yaml",
        "✅ vercel.json (Root)": f"{base_path}/vercel.json",
        "✅ package.json (Build)": f"{client_path}/package.json",
    }
    
    build_checks = {
        "📦 _redirects (Build)": f"{client_path}/build/_redirects",
        "📦 .htaccess (Build)": f"{client_path}/build/.htaccess", 
        "📦 200.html (Build)": f"{client_path}/build/200.html",
    }
    
    all_good = True
    
    # 基本設定ファイルチェック
    print("\n📋 Configuration Files:")
    for check, path in checks.items():
        if os.path.exists(path):
            print(f"  {check}")
            if "package.json" in path:
                # buildスクリプトの確認
                with open(path, 'r') as f:
                    content = f.read()
                    if "_redirects" in content and ".htaccess" in content:
                        print("    ✓ Build script includes SPA files")
                    else:
                        print("    ⚠️  Build script missing SPA files")
                        all_good = False
        else:
            print(f"  ❌ {check.replace('✅', '')} - Missing: {path}")
            all_good = False
    
    # ビルド出力チェック
    print("\n📦 Build Output:")
    build_exists = os.path.exists(f"{client_path}/build")
    if build_exists:
        for check, path in build_checks.items():
            if os.path.exists(path):
                print(f"  {check}")
            else:
                print(f"  ❌ {check.replace('📦', '')} - Missing: {path}")
                all_good = False
    else:
        print("  ⚠️  Build folder not found - run 'npm run build' first")
    
    # ルート定義チェック
    print("\n🛣️  Route Analysis:")
    routes_file = f"{client_path}/src/App.js"
    redirects_file = f"{client_path}/public/_redirects"
    
    if os.path.exists(routes_file) and os.path.exists(redirects_file):
        with open(routes_file, 'r') as f:
            app_content = f.read()
        with open(redirects_file, 'r') as f:
            redirects_content = f.read()
        
        # App.jsからルートを抽出
        import re
        routes = re.findall(r'path="([^"]+)"', app_content)
        
        # 動的ルートは除外
        static_routes = [r for r in routes if ':' not in r and r != '/']
        
        missing_redirects = []
        for route in static_routes:
            if route not in redirects_content:
                missing_redirects.append(route)
        
        print(f"    Routes in App.js: {len(static_routes)}")
        print(f"    Routes in _redirects: {redirects_content.count('/index.html')}")
        
        if missing_redirects:
            print(f"    ❌ Missing redirects: {missing_redirects}")
            all_good = False
        else:
            print(f"    ✅ All routes covered")
    
    # 最終結果
    print("\n🎯 Final Status:")
    if all_good:
        print("  ✅ All SPA configurations are correct!")
        print("  🚀 Ready for deployment")
    else:
        print("  ❌ Some configurations need attention")
        print("  💡 Fix the issues above before deploying")
    
    return all_good

if __name__ == "__main__":
    success = check_spa_configuration()
    sys.exit(0 if success else 1)