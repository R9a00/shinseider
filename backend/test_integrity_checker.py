#!/usr/bin/env python3
"""
完全性チェッカーのテストケース
時間情報の正確性を含む5次元の完全性チェック機能をテスト
"""

import unittest
import tempfile
import os
import yaml
import shutil
from datetime import datetime, timedelta
from minimal_integrity_checker import MinimalIntegrityChecker

class TestIntegrityChecker(unittest.TestCase):
    """完全性チェッカーのテストクラス"""
    
    def setUp(self):
        """テスト環境のセットアップ"""
        self.test_dir = tempfile.mkdtemp()
        self.checker = MinimalIntegrityChecker(self.test_dir)
        
    def tearDown(self):
        """テスト環境のクリーンアップ"""
        shutil.rmtree(self.test_dir)
    
    def create_test_data(self, info_date_offset_days=0, end_date_offset_days=30):
        """テスト用データを作成"""
        current_date = datetime.now()
        info_date = current_date - timedelta(days=info_date_offset_days)
        end_date = current_date + timedelta(days=end_date_offset_days)
        
        # system_integrity_framework.yaml
        framework_data = {
            'metadata': {'framework_version': '1.0.0'},
            'integrity_dimensions': {
                'temporal_accuracy': {
                    'definition': 'テスト用時間情報の正確性'
                }
            }
        }
        
        # subsidy_master.yaml
        master_data = {
            'metadata': {
                'last_updated': current_date.strftime('%Y-%m-%d'),
                'version': '1.0.0'
            },
            'subsidies': {
                'test_subsidy': {
                    'id': 'test_subsidy',
                    'name': 'テスト補助金',
                    'application_period': {
                        'start_date': (current_date - timedelta(days=10)).strftime('%Y-%m-%d'),
                        'end_date': end_date.strftime('%Y-%m-%d'),
                        'information_date': info_date.strftime('%Y-%m-%d'),
                        'current_round': 'テスト回次'
                    }
                }
            }
        }
        
        # subsidies.yaml (API用)
        api_data = [{
            'id': 'test_subsidy',
            'name': 'テスト補助金',
            'application_period': master_data['subsidies']['test_subsidy']['application_period']
        }]
        
        # version_history.yaml
        version_data = {
            'metadata': {'last_updated': current_date.strftime('%Y-%m-%d')},
            'subsidies': {
                'test_subsidy': {
                    'version': '1.0.0',
                    'last_updated': current_date.strftime('%Y-%m-%d')
                }
            }
        }
        
        # ファイル作成
        with open(os.path.join(self.test_dir, 'system_integrity_framework.yaml'), 'w', encoding='utf-8') as f:
            yaml.dump(framework_data, f, allow_unicode=True)
        
        with open(os.path.join(self.test_dir, 'subsidy_master.yaml'), 'w', encoding='utf-8') as f:
            yaml.dump(master_data, f, allow_unicode=True)
        
        with open(os.path.join(self.test_dir, 'subsidies.yaml'), 'w', encoding='utf-8') as f:
            yaml.dump(api_data, f, allow_unicode=True)
        
        with open(os.path.join(self.test_dir, 'version_history.yaml'), 'w', encoding='utf-8') as f:
            yaml.dump(version_data, f, allow_unicode=True)
    
    def test_fresh_data_should_pass(self):
        """新鮮なデータは高スコアを取得すること"""
        self.create_test_data(info_date_offset_days=1)  # 1日前の情報
        
        results = self.checker.run_complete_check()
        
        # 時間情報の正確性は満点のはず
        self.assertEqual(results['dimension_scores']['temporal_accuracy'], 1.0)
        
        # 総合スコアは高い値のはず（information_source問題を考慮）
        self.assertGreater(results['overall_score'], 0.7)
        
        # 時間関係の違反はないはず
        temporal_violations = [v for v in results['violations'] if v['type'] == 'temporal_accuracy']
        self.assertEqual(len(temporal_violations), 0)
    
    def test_slightly_old_data_should_warn(self):
        """やや古いデータ（30-90日）は警告を出すこと"""
        self.create_test_data(info_date_offset_days=45)  # 45日前の情報
        
        results = self.checker.run_complete_check()
        
        # 時間情報の正確性は減点されるはず
        self.assertLess(results['dimension_scores']['temporal_accuracy'], 1.0)
        
        # 総合スコアは中程度の値のはず
        self.assertLess(results['overall_score'], 0.9)
        
        # 時間関係の違反があるはず
        temporal_violations = [v for v in results['violations'] if v['type'] == 'temporal_accuracy']
        self.assertGreater(len(temporal_violations), 0)
        self.assertEqual(temporal_violations[0]['severity'], 'medium')
        self.assertIn('やや古い情報日付', temporal_violations[0]['issue'])
    
    def test_very_old_data_should_fail(self):
        """非常に古いデータ（90日超）は重大な問題として検出すること"""
        self.create_test_data(info_date_offset_days=120)  # 120日前の情報
        
        results = self.checker.run_complete_check()
        
        # 時間情報の正確性は大幅減点されるはず
        self.assertLess(results['dimension_scores']['temporal_accuracy'], 0.9)
        
        # 総合スコアは低い値のはず（時間情報の重みが30%）
        self.assertLess(results['overall_score'], 0.8)
        
        # 重大な時間関係の違反があるはず
        temporal_violations = [v for v in results['violations'] if v['type'] == 'temporal_accuracy']
        self.assertGreater(len(temporal_violations), 0)
        self.assertEqual(temporal_violations[0]['severity'], 'high')
        self.assertIn('古い情報日付（90日以上前）', temporal_violations[0]['issue'])
    
    def test_expired_subsidy_should_be_detected(self):
        """期限切れ補助金は情報として適切に検出されること"""
        self.create_test_data(info_date_offset_days=1, end_date_offset_days=-30)  # 30日前終了
        
        results = self.checker.run_complete_check()
        
        # 期限切れは情報として記録され、違反としては扱わない
        all_items = results.get('violations', [])
        expired_info = [v for v in all_items if '募集終了済み' in v.get('issue', '')]
        
        # 期限切れ情報が検出されることを確認
        self.assertGreater(len(expired_info), 0)
        self.assertEqual(expired_info[0]['severity'], 'info')
        self.assertEqual(expired_info[0]['type'], 'information')
    
    def test_future_date_should_fail(self):
        """未来の情報日付は問題として検出すること"""
        self.create_test_data(info_date_offset_days=-10)  # 10日後の情報（未来）
        
        results = self.checker.run_complete_check()
        
        # 時間情報の正確性は減点されるはず
        self.assertLess(results['dimension_scores']['temporal_accuracy'], 1.0)
        
        # 未来の日付の違反があるはず
        temporal_violations = [v for v in results['violations'] if v['type'] == 'temporal_accuracy']
        self.assertGreater(len(temporal_violations), 0)
        
        future_violations = [v for v in temporal_violations if '未来の情報日付' in v['issue']]
        self.assertGreater(len(future_violations), 0)
        self.assertEqual(future_violations[0]['severity'], 'medium')
    
    def test_expired_application_period(self):
        """募集期間が終了している場合の検出"""
        self.create_test_data(info_date_offset_days=1, end_date_offset_days=-10)  # 10日前に終了
        
        results = self.checker.run_complete_check()
        
        # 期間関係の違反があるかもしれないが、主要な検証は他のテストで行う
        self.assertIsInstance(results['overall_score'], float)
        self.assertGreaterEqual(results['overall_score'], 0.0)
        self.assertLessEqual(results['overall_score'], 1.0)
    
    def test_invalid_date_format(self):
        """無効な日付フォーマットの検出"""
        # 無効な日付を含むテストデータを直接作成
        invalid_data = {
            'metadata': {'last_updated': '2025-08-14'},
            'subsidies': {
                'invalid_subsidy': {
                    'id': 'invalid_subsidy',
                    'name': '無効な日付の補助金',
                    'application_period': {
                        'start_date': '2025-13-01',  # 無効な月
                        'end_date': '2025-12-32',    # 無効な日
                        'information_date': 'invalid-date'  # 完全に無効
                    }
                }
            }
        }
        
        with open(os.path.join(self.test_dir, 'subsidy_master.yaml'), 'w', encoding='utf-8') as f:
            yaml.dump(invalid_data, f, allow_unicode=True)
        
        # その他の必要ファイルを作成
        self.create_test_data()
        
        results = self.checker.run_complete_check()
        
        # 無効な日付フォーマットの違反があるはず
        temporal_violations = [v for v in results['violations'] if v['type'] == 'temporal_accuracy']
        format_violations = [v for v in temporal_violations if '無効な日付フォーマット' in v['issue']]
        
        self.assertGreater(len(format_violations), 0)
        
        # 少なくとも1つは高重要度のはず
        high_severity_violations = [v for v in format_violations if v['severity'] == 'high']
        self.assertGreater(len(high_severity_violations), 0)
    
    def test_weighted_score_calculation(self):
        """重み付きスコア計算の検証"""
        self.create_test_data(info_date_offset_days=120)  # 古いデータで時間スコアを下げる
        
        results = self.checker.run_complete_check()
        
        # 時間情報の正確性が30%の重みを持つことを確認
        scores = results['dimension_scores']
        expected_weighted_score = (
            scores.get('temporal_accuracy', 0) * 0.30 +
            scores.get('information_source', 0) * 0.25 +
            scores.get('reflection_logic', 0) * 0.25 +
            scores.get('ui_representation', 0) * 0.10 +
            scores.get('expression_method', 0) * 0.10
        )
        
        self.assertAlmostEqual(results['overall_score'], expected_weighted_score, places=6)

def run_specific_test():
    """特定のテストケースのみ実行（デバッグ用）"""
    suite = unittest.TestSuite()
    suite.addTest(TestIntegrityChecker('test_very_old_data_should_fail'))
    runner = unittest.TextTestRunner(verbosity=2)
    return runner.run(suite)

if __name__ == '__main__':
    # 全テスト実行
    unittest.main(verbosity=2)