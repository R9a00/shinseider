import sys
import unittest
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
from preparation import interview_prompt, review_prompt, preparation_guide, chapter_prompt, sprint_prompt


class PreparationTests(unittest.TestCase):
    def test_shared_official_guidance_preserves_saved_sections(self):
        data = yaml.safe_load((ROOT / 'data/koshien_entry.yaml').read_text())
        guide = data['official_preparation']
        self.assertEqual([s['id'] for s in data['entry_sections']],
                         ['genba', 'kadai', 'shinkijigyo', 'keieishigen', 'mirai'])
        self.assertEqual(len(guide['items']), 6)
        self.assertEqual(len(guide['review_axes']), 5)
        self.assertNotIn('{theme_elements}', interview_prompt(data))
        self.assertIn('会社の事業と主力製品', interview_prompt(data))
        for axis in guide['review_axes']:
            self.assertIn(axis['title'], review_prompt(data))
        self.assertNotIn('{official_review_axes}', review_prompt(data))
        self.assertIn('{draft}', review_prompt(data))
        self.assertIn('合計8ページ', preparation_guide(data))
        self.assertIn('公式要件ではありません', interview_prompt(data))

    def test_sprint_prompt_asks_official_items_without_inventing_layout(self):
        data = yaml.safe_load((ROOT / 'data/koshien_entry.yaml').read_text())
        guide = data['official_preparation']
        prompt = sprint_prompt(data)
        for item in guide['items']:
            self.assertIn(item['title'], prompt)
            self.assertTrue(item['brief'])
        for axis in guide['review_axes']:
            self.assertIn(axis['title'], prompt)
        self.assertNotIn('{official_items}', prompt)
        self.assertNotIn('{official_axes}', prompt)
        self.assertIn('表紙＋本文7ページ', prompt)
        self.assertIn('サンプルフォーマット', prompt)
        self.assertIn('割付は創作しない', prompt)
        self.assertIn('審査通過は保証しません', prompt)

    def test_invalid_chapters_do_not_select_a_different_chapter(self):
        data = yaml.safe_load((ROOT / 'data/fukabori.yaml').read_text())
        for invalid in ['0', '-1', '5', 'invalid']:
            with self.subTest(chapter=invalid), self.assertRaises(ValueError):
                chapter_prompt(data, invalid)
