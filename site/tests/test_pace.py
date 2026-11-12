import datetime,importlib.util,unittest
from pathlib import Path
from unittest.mock import patch
p=Path(__file__).resolve().parents[2]/'mcp/server.py'
spec=importlib.util.spec_from_file_location('shinseider_test_server',p)
s=importlib.util.module_from_spec(spec);spec.loader.exec_module(s)
class PaceTest(unittest.TestCase):
 def test_boundary_days(self):
  for stamp in ['2026-11-24T09:00:00+09:00','2026-11-25T17:59:00+09:00']:
   with patch.object(s,'_now',return_value=datetime.datetime.fromisoformat(stamp)):
    plan=s.get_pace_plan();text=str(plan)
    self.assertNotIn('明日',text);self.assertNotIn('11/24まで',text);self.assertIn('11/27 12:00',text)
    self.assertIn('今日18:00まで' if '11-25' in stamp else '今日（推奨）',text)
  for stamp,stage in [('2026-11-25T18:01:00+09:00','docs_only'),('2026-11-27T12:01:00+09:00','closed')]:
   with patch.object(s,'_now',return_value=datetime.datetime.fromisoformat(stamp)):
    result=s.get_pace_plan();self.assertEqual(result['stage'],stage);self.assertNotIn('plan',result)

 def plan_at(self, stamp):
     with patch.object(s, '_now', return_value=datetime.datetime.fromisoformat(stamp)):
         return s.get_pace_plan()

 def test_late_plans_put_registration_before_documents(self):
     # 終盤は「登録が先、応募書類は連休で」の順。日付の切り替わりは日本時間の暦日。
     cases = [('2026-11-12T21:00:00+09:00', 5, '11/19（木）まで', '今からでも間に合います'),
              ('2026-11-19T23:30:00+09:00', 5, '11/19（木）まで', '今からでも間に合います'),
              ('2026-11-20T00:10:00+09:00', 4, '11/21〜23（連休）', 'まだ間に合います'),
              ('2026-11-21T09:00:00+09:00', 4, '連休のうちに（〜11/23）', 'まだ間に合います'),
              ('2026-11-23T23:00:00+09:00', 4, '連休のうちに（〜11/23）', 'まだ間に合います')]
     for stamp, count, label, message in cases:
         with self.subTest(stamp=stamp):
             result = self.plan_at(stamp)
             labels = [step[0] for step in result['plan']]
             text = ''.join(step[1] for step in result['plan'])
             self.assertEqual(len(labels), count)
             self.assertEqual(labels[0], '今日')
             self.assertIn(label, labels)
             self.assertEqual(labels[-1], '11/27 12:00まで')
             self.assertTrue(result['message'].startswith(message))
             self.assertLess(text.index('会員登録'), text.index('つくる'))
             self.assertIn('出し直せ', text)

 def test_every_open_day_has_a_plan_without_past_dates(self):
     day = datetime.date(2026, 11, 5)
     while day <= datetime.date(2026, 11, 25):
         with self.subTest(day=day.isoformat()):
             result = self.plan_at(day.isoformat() + 'T09:00:00+09:00')
             self.assertGreaterEqual(len(result['plan']), 3)
             self.assertTrue(result['message'])
             text = str(result['plan'])
             self.assertIn('11/27 12:00', text)
             self.assertNotIn('明日', text)
             # 「M/Dまで」と書いた日付が今日より前になっていないこと
             import re
             for month, dom in re.findall(r'(\d{1,2})/(\d{1,2})[^\d〜]*まで', text):
                 self.assertGreaterEqual(datetime.date(2026, int(month), int(dom)), day)
             # 「M/D〜D」の期間が、今日より前に終わっていないこと
             for month, _start, end in re.findall(r'(\d{1,2})/(\d{1,2})〜(\d{1,2})', text):
                 self.assertGreaterEqual(datetime.date(2026, int(month), int(end)), day)
         day += datetime.timedelta(days=1)

 def test_before_late_window_keeps_proportional_plan(self):
     result = self.plan_at('2026-09-29T09:00:00+09:00')
     self.assertEqual(len(result['plan']), 4)
     self.assertIn('まで', result['plan'][0][0])


if __name__=='__main__':unittest.main()
