"""Small in-memory sliding-window limiter, used for both website visitors and bot chats."""

import time
from collections import defaultdict, deque
from threading import Lock


class RateLimiter:
    def __init__(self, limit: int, per_seconds: float = 60.0):
        self.limit, self.per = limit, per_seconds
        self._hits: dict[object, deque] = defaultdict(deque)
        self._lock = Lock()

    def allow(self, key: object) -> bool:
        now = time.monotonic()
        with self._lock:
            if len(self._hits) > 50_000:  # forget idle keys so memory stays bounded
                self._hits = defaultdict(deque, {k: v for k, v in self._hits.items() if v and now - v[-1] < self.per})
            q = self._hits[key]
            while q and now - q[0] >= self.per:
                q.popleft()
            if len(q) >= self.limit:
                return False
            q.append(now)
            return True
