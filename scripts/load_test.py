"""Load test: N simulated visitors opening the map at once.
Usage: python scripts/load_test.py [base_url] [visitors]. The server's rate limit is per IP, so start it
with RATE_LIMIT_PER_MINUTE=0 for this test, or every simulated visitor will share one allowance."""

import asyncio
import statistics
import sys
import time

import httpx

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8000"
VISITORS = int(sys.argv[2]) if len(sys.argv) > 2 else 1000
PATHS = ["/", "/static/app.js", "/api/v1/flood-forecast", "/api/v1/upazilas", "/api/v1/country-outline"]


async def visitor(client: httpx.AsyncClient, gate: asyncio.Semaphore, out: list, codes: dict) -> None:
    async with gate:
        for p in PATHS:
            t = time.perf_counter()
            try:
                r = await client.get(BASE + p)
                codes[r.status_code] = codes.get(r.status_code, 0) + 1
            except httpx.HTTPError as e:
                codes[type(e).__name__] = codes.get(type(e).__name__, 0) + 1
            out.append(time.perf_counter() - t)


async def main() -> None:
    out, codes, gate = [], {}, asyncio.Semaphore(200)
    async with httpx.AsyncClient(timeout=60) as client:
        t = time.perf_counter()
        await asyncio.gather(*(visitor(client, gate, out, codes) for _ in range(VISITORS)))
    q = statistics.quantiles(out, n=100)
    print(f"{VISITORS} visitors, {len(out)} requests in {time.perf_counter() - t:.0f}s")
    print(f"median {q[49]:.2f}s  p95 {q[94]:.2f}s  max {max(out):.2f}s  responses {codes}")


asyncio.run(main())
