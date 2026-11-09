import asyncio
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware  # noqa: E402

from app.core.ratelimit import RateLimiter  # noqa: E402


def test_blocks_over_limit_per_key():
    r = RateLimiter(2)
    assert r.allow("a") and r.allow("a")
    assert not r.allow("a")
    assert r.allow("b")


def test_window_expires():
    r = RateLimiter(1, per_seconds=0)
    assert r.allow("a") and r.allow("a")


def _client_seen(peer: str, forwarded: bytes, trusted: str) -> str:
    """The client IP the app sees, through the same proxy middleware uvicorn uses."""
    seen = {}

    async def app(scope, receive, send):
        seen["ip"] = scope["client"][0]

    scope = {"type": "http", "client": (peer, 1234), "scheme": "http", "headers": [(b"x-forwarded-for", forwarded)]}
    asyncio.run(ProxyHeadersMiddleware(app, trusted_hosts=trusted)(scope, None, None))
    return seen["ip"]


def _trusted_in_dockerfile() -> str:
    text = (Path(__file__).resolve().parents[1] / "docker" / "app.Dockerfile").read_text(encoding="utf-8")
    return re.search(r"--forwarded-allow-ips=([^\"]+)", text).group(1)


def test_visitors_behind_caddy_keep_their_own_ip():
    trusted = _trusted_in_dockerfile()
    assert _client_seen("172.30.0.5", b"203.0.113.7", trusted) == "203.0.113.7"
    assert _client_seen("172.30.0.5", b"203.0.113.8", trusted) == "203.0.113.8"


def test_forged_header_from_outside_the_proxy_network_is_ignored():
    assert _client_seen("198.51.100.9", b"203.0.113.7", _trusted_in_dockerfile()) == "198.51.100.9"
