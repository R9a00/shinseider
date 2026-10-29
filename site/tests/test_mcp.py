import datetime
import importlib.util
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('shinseider_mcp', Path(__file__).resolve().parents[2] / 'mcp/server.py')
server = importlib.util.module_from_spec(spec)
spec.loader.exec_module(server)

class MCPAuditTest(unittest.TestCase):
    def test_deadline_plans_and_invalid_eligibility(self):
        for day in [24, 25]:
            with patch.object(server, '_now', return_value=datetime.datetime(2026,11,day,12,tzinfo=server.JST)):
                plan=server.get_pace_plan()['plan']
                self.assertFalse(any(step[0]=='明日' for step in plan))
                if day==25:self.assertIn('今日18:00まで',str(plan))
        self.assertNotIn('残る確認',server.check_eligibility(True,'successor','unsure')['detail'])
        self.assertNotIn('適合',server.check_eligibility(True,'successor','invalid')['verdict'])
        self.assertIn('他の要件は未判定',server.check_eligibility(True,'successor','yes','yes')['subsidy_outlook'])

    def test_workspace_roundtrip_and_boundaries(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);ws=root/'workspace'
            with patch.object(server,'STATE_FILE',root/'state.json'):
                with self.assertRaises(ValueError):server.workspace_init('relative')
                server.workspace_init(str(ws))
                server.workspace_record('outline','first')
                server.workspace_record('outline','second','append')
                self.assertEqual((ws/'outline.md').read_text(),'first\nsecond')
                with self.assertRaises(ValueError):server.workspace_record('outline','lost','typo')
                outside=root/'outside.md';outside.write_text('preserve')
                (ws/'review'/'link.md').symlink_to(outside)
                with self.assertRaises(ValueError):server.workspace_record('review/link.md','replace outside')
                self.assertEqual(outside.read_text(),'preserve')
                for section in ['../../escape','materials/../../escape']:
                    with self.assertRaises(ValueError):server.workspace_record(section,'x')
                self.assertIn('outline.md',server.workspace_state()['files'])

    def test_read_pages_and_workspace_boundary(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            with patch.object(server, 'STATE_FILE', root / 'state.json'):
                ws = root / 'workspace'
                server.workspace_init(str(ws))
                text = '架空の記録🙂\n' * 8
                server.workspace_record('entry_draft', text)
                pieces = []
                offset = 0
                while offset is not None:
                    page = server.workspace_read('entry_draft', offset, 7)
                    pieces.append(page['content'])
                    offset = page['next_offset']
                self.assertEqual(''.join(pieces), text)
                self.assertEqual(server.workspace_read('entry_draft', 1000)['content'], '')
                for offset, limit in [(-1, 10), (0, 0), (0, 50001)]:
                    with self.assertRaises(ValueError):
                        server.workspace_read('entry_draft', offset, limit)
                for name in ['../outside', 'materials/../../outside', str(root / 'outside')]:
                    with self.assertRaises(ValueError):
                        server.workspace_read(name)
                outside = root / 'outside.md'
                outside.write_text('outside content')
                (ws / 'materials/link.md').symlink_to(outside)
                with self.assertRaises(ValueError):
                    server.workspace_read('materials/link.md')
                with self.assertRaises(FileNotFoundError):
                    server.workspace_read('materials/missing')
