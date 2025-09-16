#!/usr/bin/env python3
"""
本番環境SPA（Single Page Application）ルーティングテスト

Render環境でフロントエンドの各ページが直接アクセス（リロード）でも
404にならずに正しく表示されることを確認するテスト
"""

import requests
import sys
import time
from typing import List, Dict, Any
import json

class SPARoutingTester:
    def __init__(self, base_url: str = "https://shinseider.onrender.com"):
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) SPA-Routing-Test/1.0'
        })
        
    def test_routes(self) -> Dict[str, Any]:
        """全SPAルートをテストする"""
        
        # App.jsから取得したルート一覧
        routes_to_test = [
            "/",
            "/phase1", 
            "/subsidy-selection",
            "/subsidy-application-support/atotsugi",
            "/subsidy-application-support/monodukuri_r7_21th",
            "/knowledge-base",
            "/operator-info", 
            "/update-history",
            "/system-status",
            "/privacy-policy",
            "/disclaimer",
            "/contact"
        ]
        
        results = {
            "test_timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "base_url": self.base_url,
            "total_routes": len(routes_to_test),
            "passed": 0,
            "failed": 0,
            "route_results": [],
            "summary": {}
        }
        
        print(f"🚀 SPA Routing Test Starting - {self.base_url}")
        print(f"📋 Testing {len(routes_to_test)} routes...\n")
        
        for route in routes_to_test:
            print(f"Testing: {route}")
            result = self._test_single_route(route)
            results["route_results"].append(result)
            
            if result["status"] == "PASS":
                results["passed"] += 1
                print(f"✅ {route} - OK ({result['response_code']})")
            else:
                results["failed"] += 1 
                print(f"❌ {route} - FAIL ({result['response_code']}) - {result['error']}")
            
            # レート制限対策
            time.sleep(0.5)
        
        # 結果サマリー
        results["summary"] = {
            "success_rate": (results["passed"] / results["total_routes"]) * 100,
            "all_routes_working": results["failed"] == 0
        }
        
        return results
    
    def _test_single_route(self, route: str) -> Dict[str, Any]:
        """個別ルートのテスト"""
        url = f"{self.base_url}{route}"
        
        try:
            response = self.session.get(url, timeout=10, allow_redirects=True)
            
            result = {
                "route": route,
                "url": url,
                "response_code": response.status_code,
                "final_url": response.url,
                "status": "PASS" if response.status_code == 200 else "FAIL",
                "error": None,
                "checks": {
                    "returns_html": "text/html" in response.headers.get('content-type', '').lower(),
                    "contains_react_root": '<div id="root">' in response.text,
                    "no_404_page": "404" not in response.text.lower() and "not found" not in response.text.lower(),
                    "redirected": url != response.url
                }
            }
            
            # 追加チェック：404ページでないことを確認
            if response.status_code == 200:
                # React app が正しく読み込まれているかチェック
                if not result["checks"]["contains_react_root"]:
                    result["status"] = "FAIL"
                    result["error"] = "React root element not found"
                elif result["checks"]["no_404_page"] == False:
                    result["status"] = "FAIL" 
                    result["error"] = "Contains 404 content"
                    
        except requests.exceptions.RequestException as e:
            result = {
                "route": route,
                "url": url, 
                "response_code": None,
                "final_url": None,
                "status": "FAIL",
                "error": str(e),
                "checks": {
                    "returns_html": False,
                    "contains_react_root": False, 
                    "no_404_page": False,
                    "redirected": False
                }
            }
            
        return result
    
    def print_detailed_results(self, results: Dict[str, Any]):
        """詳細結果を表示"""
        print("\n" + "="*60)
        print("📊 SPA ROUTING TEST RESULTS")
        print("="*60)
        
        print(f"🌐 Base URL: {results['base_url']}")
        print(f"⏰ Test Time: {results['test_timestamp']}")
        print(f"📈 Success Rate: {results['summary']['success_rate']:.1f}%")
        print(f"✅ Passed: {results['passed']}/{results['total_routes']}")
        print(f"❌ Failed: {results['failed']}/{results['total_routes']}")
        
        if results['failed'] > 0:
            print(f"\n🔍 FAILED ROUTES:")
            for result in results['route_results']:
                if result['status'] == 'FAIL':
                    print(f"  ❌ {result['route']}")
                    print(f"     URL: {result['url']}")
                    print(f"     Code: {result['response_code']}")
                    print(f"     Error: {result['error']}")
        
        print(f"\n🎯 RECOMMENDATION:")
        if results['summary']['all_routes_working']:
            print("  🟢 All routes are working correctly!")
            print("  🚀 SPA routing is properly configured for production.")
        else:
            print("  🟡 Some routes are failing. Check _redirects file and route definitions.")
            print("  💡 Missing routes should be added to frontend/client/public/_redirects")
            
        print("\n" + "="*60)

def main():
    # コマンドライン引数でURLを指定可能
    base_url = sys.argv[1] if len(sys.argv) > 1 else "https://shinseider.onrender.com"
    
    tester = SPARoutingTester(base_url)
    
    try:
        results = tester.test_routes()
        tester.print_detailed_results(results)
        
        # 結果をJSONファイルとして保存
        timestamp = time.strftime("%Y%m%d_%H%M%S")
        filename = f"spa_routing_test_results_{timestamp}.json"
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Detailed results saved to: {filename}")
        
        # 終了コード
        sys.exit(0 if results['summary']['all_routes_working'] else 1)
        
    except Exception as e:
        print(f"\n💥 Test execution failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()