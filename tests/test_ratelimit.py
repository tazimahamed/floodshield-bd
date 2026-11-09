import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from app.core.ratelimit import RateLimiter  # noqa: E402


def test_blocks_over_limit_per_key():
    r = RateLimiter(2)
    assert r.allow("a") and r.allow("a")
    assert not r.allow("a")
    assert r.allow("b")


def test_window_expires():
    r = RateLimiter(1, per_seconds=0)
    assert r.allow("a") and r.allow("a")
