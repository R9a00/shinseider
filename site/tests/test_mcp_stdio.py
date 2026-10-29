"""Exercise the shipped STDIO entry point without changing a user's MCP config."""
import json
import shutil
import sys
import tempfile
import unittest
from pathlib import Path

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

ROOT = Path(__file__).resolve().parents[2]


class MCPStdioTest(unittest.IsolatedAsyncioTestCase):
    async def test_prompts_resources_and_record_survive_restart(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / 'mcp').mkdir()
            shutil.copy(ROOT / 'mcp/server.py', root / 'mcp/server.py')
            shutil.copy(ROOT / 'preparation.py', root / 'preparation.py')
            shutil.copytree(ROOT / 'data', root / 'data')
            params = StdioServerParameters(command=sys.executable,
                                           args=[str(root / 'mcp/server.py')])
            for restart in (False, True):
                async with stdio_client(params) as (read, write):
                    async with ClientSession(read, write, read_timeout_seconds=20) as client:
                        await client.initialize()
                        if not restart:
                            tools = await client.list_tools()
                            self.assertEqual(len(tools.tools), 10)
                            prompts = await client.list_prompts()
                            self.assertEqual(len(prompts.prompts), 4)
                            resources = await client.list_resources()
                            self.assertEqual(len(resources.resources), 5)
                            interview = await client.get_prompt('entry_interview')
                            text = '\n'.join(m.content.text for m in interview.messages)
                            self.assertNotIn('{theme_elements}', text)
                            self.assertIn('会社の事業と主力製品', text)
                            self.assertIn('合計8ページ', text)
                            review = await client.get_prompt('mock_review', {'draft': '試験用の骨子'})
                            text = '\n'.join(m.content.text for m in review.messages)
                            self.assertIn('試験用の骨子', text)
                            self.assertIn('承継予定の会社の経営資源活用', text)
                            self.assertNotIn('{official_review_axes}', text)
                            for number in range(1, 5):
                                chapter = await client.get_prompt('fukabori_chapter', {'chapter_no': str(number)})
                                text = '\n'.join(m.content.text for m in chapter.messages)
                                self.assertNotIn('{structure}', text)
                                # Each chapter must provide real import keys, not titles alone.
                                self.assertIn(['roots「', 'pest_p「', 'ff_new「', 'q1_whyus「'][number - 1], text)
                                self.assertIn(['when=', 'facts=', 'strength=', 'story='][number - 1], text)
                            for resource in resources.resources:
                                result = await client.read_resource(resource.uri)
                                self.assertTrue(result.contents)
                            result = await client.call_tool('workspace_init', {'path': str(root / 'workspace')})
                            self.assertFalse(result.is_error)
                            result = await client.call_tool('workspace_record', {'section': 'outline', 'content': 'isolated test record'})
                            self.assertFalse(result.is_error)
                        result = await client.call_tool('workspace_state')
                        self.assertFalse(result.is_error)
                        restored = await client.call_tool('workspace_read', {'section': 'outline'})
                        self.assertFalse(restored.is_error)
                        payload = json.loads(restored.content[0].text)
                        self.assertEqual(payload['content'], 'isolated test record')
                        self.assertIsNone(payload['next_offset'])
