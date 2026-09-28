import datetime
import importlib.util
import unittest
from pathlib import Path
from unittest.mock import patch

path = Path(__file__).resolve().parents[1] / 'build.py'
spec = importlib.util.spec_from_file_location('builder', path)
builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)


class FixedDate(datetime.date):
    @classmethod
    def today(cls):
        return cls(2026, 9, 29)


class CalendarTest(unittest.TestCase):
    def test_build_date_excludes_ended_events_but_keeps_ongoing_and_today(self):
        def event(id, start, end=None):
            return dict(id=id, start=start, end=end or start, title=id,
                        source_url='https://example.com/source')
        data = {'events': [event('past', '2026-09-16'), event('today', '2026-09-29'),
                           event('ongoing', '2026-09-28', '2026-09-30'),
                           event('future', '2026-11-25')]}
        with patch.object(builder.dt, 'date', FixedDate):
            result = builder.build_ics(data)
        self.assertNotIn('UID:past-', result)
        for id in ['today', 'ongoing', 'future']:
            self.assertIn(f'UID:{id}-', result)
        self.assertIn('DTEND;VALUE=DATE:20261001', result)
        self.assertIn('\r\nEND:VCALENDAR\r\n', result)


if __name__ == '__main__':
    unittest.main()
