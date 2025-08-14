#!/usr/bin/env python3
"""
補助金システム 定期保守自動実行スクリプト
maintenance_checklist.mdに従って自動実行し、結果をレポート出力します。
"""

import subprocess
import requests
import yaml
import json
import os
from datetime import datetime, timedelta
import sys

class MaintenanceRunner:
    def __init__(self):
        self.base_path = '/Users/r9a/exp/attg/backend'
        self.report = {
            'execution_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'phases': {},
            'errors': [],
            'warnings': [],
            'summary': {}
        }
        
    def log_success(self, phase, message):
        """成功ログを記録"""
        if phase not in self.report['phases']:
            self.report['phases'][phase] = {'status': 'success', 'details': []}
        self.report['phases'][phase]['details'].append(f"✅ {message}")
        print(f"✅ {message}")
    
    def log_error(self, phase, message):
        """エラーログを記録"""
        if phase not in self.report['phases']:
            self.report['phases'][phase] = {'status': 'error', 'details': []}
        self.report['phases'][phase]['status'] = 'error'
        self.report['phases'][phase]['details'].append(f"❌ {message}")
        self.report['errors'].append(f"{phase}: {message}")
        print(f"❌ {message}")
    
    def log_warning(self, phase, message):
        """警告ログを記録"""
        if phase not in self.report['phases']:
            self.report['phases'][phase] = {'status': 'warning', 'details': []}
        if self.report['phases'][phase]['status'] != 'error':
            self.report['phases'][phase]['status'] = 'warning'
        self.report['phases'][phase]['details'].append(f"⚠️ {message}")
        self.report['warnings'].append(f"{phase}: {message}")
        print(f"⚠️ {message}")

    def phase1_system_check(self):
        """Phase 1: システム状態確認"""
        phase = "Phase1_システム状態確認"
        print(f"\n🔄 {phase} 開始...")
        
        try:
            # フロントエンド稼働確認
            try:
                response = requests.get('http://localhost:3000', timeout=5)
                if response.status_code == 200:
                    self.log_success(phase, "フロントエンドサーバー稼働確認: 正常")
                else:
                    self.log_warning(phase, f"フロントエンドサーバー応答異常: {response.status_code}")
            except Exception as e:
                self.log_error(phase, f"フロントエンドサーバー接続失敗: {e}")
            
            # バックエンド稼働確認
            try:
                response = requests.get('http://localhost:8000/docs', timeout=5)
                if response.status_code == 200:
                    self.log_success(phase, "バックエンドAPI稼働確認: 正常")
                else:
                    self.log_warning(phase, f"バックエンドAPI応答異常: {response.status_code}")
            except Exception as e:
                self.log_error(phase, f"バックエンドAPI接続失敗: {e}")
            
            # バックアップ確認
            backup_files = [f for f in os.listdir(self.base_path) if '.backup.' in f]
            if backup_files:
                latest_backup = max(backup_files, key=lambda x: os.path.getmtime(os.path.join(self.base_path, x)))
                self.log_success(phase, f"最新バックアップ確認: {latest_backup}")
            else:
                self.log_warning(phase, "バックアップファイルが見つかりません")
                
        except Exception as e:
            self.log_error(phase, f"予期しないエラー: {e}")

    def phase2_update_execution(self):
        """Phase 2: 情報更新実行"""
        phase = "Phase2_情報更新実行"
        print(f"\n🔍 {phase} 開始...")
        
        try:
            # LLM更新プロンプト生成
            os.chdir(self.base_path)
            result = subprocess.run(['python3', 'update_prompt_generator.py'], 
                                  capture_output=True, text=True)
            
            if result.returncode == 0:
                self.log_success(phase, "LLM更新プロンプト生成: 完了")
            else:
                self.log_error(phase, f"プロンプト生成失敗: {result.stderr}")
                return False
            
            # LLM調査は手動実行が必要であることを記録
            self.log_warning(phase, "LLM調査実行: 手動実行が必要 - llm_update_prompt.mdをLLMに投入してください")
            
            return True
            
        except Exception as e:
            self.log_error(phase, f"予期しないエラー: {e}")
            return False

    def phase3_verification(self):
        """Phase 3: 動作検証"""
        phase = "Phase3_動作検証"
        print(f"\n🎯 {phase} 開始...")
        
        try:
            # 各補助金のAPI確認
            test_endpoints = [
                'shinjigyo_shinshutsu',
                'atotsugi', 
                'monodukuri_r7_21th'
            ]
            
            for endpoint in test_endpoints:
                try:
                    response = requests.get(f'http://localhost:8000/subsidies/{endpoint}/metadata', timeout=5)
                    if response.status_code == 200:
                        data = response.json()
                        if 'application_period' in data:
                            self.log_success(phase, f"{endpoint} API: 正常応答 (application_period含む)")
                        else:
                            self.log_warning(phase, f"{endpoint} API: application_period情報なし")
                    else:
                        self.log_error(phase, f"{endpoint} API: 応答異常 {response.status_code}")
                except Exception as e:
                    self.log_error(phase, f"{endpoint} API: 接続失敗 {e}")
            
        except Exception as e:
            self.log_error(phase, f"予期しないエラー: {e}")

    def phase4_log_check(self):
        """Phase 4: ログ・履歴確認"""
        phase = "Phase4_ログ履歴確認"
        print(f"\n📊 {phase} 開始...")
        
        try:
            # version_history.yaml確認
            version_file = os.path.join(self.base_path, 'version_history.yaml')
            if os.path.exists(version_file):
                with open(version_file, 'r', encoding='utf-8') as f:
                    version_data = yaml.safe_load(f)
                
                last_updated = version_data.get('metadata', {}).get('last_updated', 'Unknown')
                self.log_success(phase, f"version_history.yaml確認: 最終更新 {last_updated}")
                
                # 各補助金の更新状況確認
                subsidies_count = len(version_data.get('subsidies', {}))
                self.log_success(phase, f"管理中補助金数: {subsidies_count}件")
                
            else:
                self.log_error(phase, "version_history.yamlが見つかりません")
                
        except Exception as e:
            self.log_error(phase, f"予期しないエラー: {e}")

    def phase5_preparation(self):
        """Phase 5: 次回準備"""
        phase = "Phase5_次回準備"
        print(f"\n🔧 {phase} 開始...")
        
        try:
            # 次回更新予定日を計算
            next_date = datetime.now() + timedelta(days=14)
            next_date_str = next_date.strftime('%Y-%m-%d')
            
            # メンテナンスログに記録
            log_entry = f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}: 次回定期更新予定 {next_date_str}\n"
            with open(os.path.join(self.base_path, 'maintenance_log.txt'), 'a', encoding='utf-8') as f:
                f.write(log_entry)
            
            self.log_success(phase, f"次回更新予定日記録: {next_date_str}")
            
        except Exception as e:
            self.log_error(phase, f"予期しないエラー: {e}")

    def generate_report(self):
        """実行レポート生成"""
        print(f"\n📋 実行レポート生成中...")
        
        # サマリー作成
        total_phases = len(self.report['phases'])
        success_phases = len([p for p in self.report['phases'].values() if p['status'] == 'success'])
        error_phases = len([p for p in self.report['phases'].values() if p['status'] == 'error'])
        warning_phases = len([p for p in self.report['phases'].values() if p['status'] == 'warning'])
        
        self.report['summary'] = {
            'total_phases': total_phases,
            'success_phases': success_phases,
            'error_phases': error_phases,
            'warning_phases': warning_phases,
            'overall_status': 'ERROR' if error_phases > 0 else 'WARNING' if warning_phases > 0 else 'SUCCESS'
        }
        
        # レポートファイル保存
        report_filename = f"maintenance_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        report_path = os.path.join(self.base_path, report_filename)
        
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(self.report, f, ensure_ascii=False, indent=2)
        
        print(f"📄 レポート保存: {report_filename}")
        
        # コンソール出力
        self.print_summary()

    def print_summary(self):
        """実行サマリー表示"""
        print(f"\n" + "="*60)
        print(f"📋 定期保守実行サマリー - {self.report['execution_date']}")
        print(f"="*60)
        
        for phase_name, phase_data in self.report['phases'].items():
            status_icon = "✅" if phase_data['status'] == 'success' else "⚠️" if phase_data['status'] == 'warning' else "❌"
            print(f"{status_icon} {phase_name}: {phase_data['status'].upper()}")
        
        print(f"\n📊 実行結果:")
        print(f"   成功: {self.report['summary']['success_phases']}/{self.report['summary']['total_phases']} Phase")
        print(f"   警告: {self.report['summary']['warning_phases']} Phase")  
        print(f"   エラー: {self.report['summary']['error_phases']} Phase")
        print(f"   総合状態: {self.report['summary']['overall_status']}")
        
        if self.report['errors']:
            print(f"\n❌ エラー詳細:")
            for error in self.report['errors']:
                print(f"   - {error}")
        
        if self.report['warnings']:
            print(f"\n⚠️ 警告詳細:")
            for warning in self.report['warnings']:
                print(f"   - {warning}")

    def run_full_maintenance(self):
        """フル保守実行"""
        print("🚀 補助金システム定期保守を開始します...")
        print(f"実行日時: {self.report['execution_date']}")
        
        # 各フェーズを順次実行
        self.phase1_system_check()
        
        if not self.report['errors']:  # エラーがなければ続行
            self.phase2_update_execution()
        
        self.phase3_verification()
        self.phase4_log_check()
        self.phase5_preparation()
        
        # レポート生成
        self.generate_report()
        
        # 最終メッセージ
        if self.report['summary']['overall_status'] == 'SUCCESS':
            print(f"\n🎉 定期保守完了: 全システム正常稼働中")
        elif self.report['summary']['overall_status'] == 'WARNING':
            print(f"\n⚠️ 定期保守完了: 一部警告あり、動作に影響なし")
        else:
            print(f"\n🚨 定期保守完了: エラーあり、要対応")
        
        return self.report['summary']['overall_status']

def main():
    """メイン関数"""
    if len(sys.argv) > 1 and sys.argv[1] == '--auto':
        print("🤖 自動実行モード")
    else:
        print("📋 対話実行モード")
        confirm = input("定期保守を実行しますか？ (y/N): ")
        if confirm.lower() != 'y':
            print("❌ 保守実行をキャンセルしました")
            return
    
    runner = MaintenanceRunner()
    status = runner.run_full_maintenance()
    
    # 終了コード設定
    exit_codes = {'SUCCESS': 0, 'WARNING': 1, 'ERROR': 2}
    sys.exit(exit_codes.get(status, 2))

if __name__ == "__main__":
    main()