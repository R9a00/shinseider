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
if __name__=='__main__':unittest.main()
