"""FloodShield BD MCP server.

Lets any MCP client (an AI assistant, an agent, an IDE) ask our live API
about flood risk in Bangladesh, upazila by upazila. Read-only.

Run:  python floodshield_mcp.py          (stdio)
Env:  FLOODSHIELD_API  (default https://floodshieldbd.duckdns.org/api/v1)
"""
import os

import httpx
from mcp.server.fastmcp import FastMCP

API = os.environ.get("FLOODSHIELD_API", "https://floodshieldbd.duckdns.org/api/v1").rstrip("/")
mcp = FastMCP("floodshield-mcp")


def _get(path: str) -> dict:
    r = httpx.get(f"{API}{path}", timeout=30)
    r.raise_for_status()
    return r.json()


def _forecast() -> dict:
    return _get("/flood-forecast")


def _find(name: str, district: str | None = None) -> list[dict]:
    q = name.strip().lower()
    rows = [u for u in _forecast()["upazilas"] if u["name"].lower() == q]
    if not rows:
        rows = [u for u in _forecast()["upazilas"] if q in u["name"].lower()]
    if district:
        rows = [u for u in rows if u["district"].lower() == district.strip().lower()]
    return rows


@mcp.tool()
def get_flood_risk(upazila: str, district: str | None = None) -> dict:
    """Today's 14-day flood forecast for one upazila: risk level (low/medium/high),
    chance of flooding, and expected flooded share of the area with a P10-P90 range."""
    rows = _find(upazila, district)
    if not rows:
        return {"error": f"No upazila named '{upazila}'. Try list_high_risk_areas or check spelling."}
    run = _forecast()["run"]
    return {
        "issued_at": run["issued_at"],
        "valid_until": run["valid_until"],
        "model_version": run["model_version"],
        "matches": rows,
    }


@mcp.tool()
def get_flood_history(upazila: str, district: str | None = None) -> dict:
    """Which monsoon years are covered by our Sentinel-1 satellite flood-frequency
    map for an upazila, how it was made, and a link to the map picture."""
    rows = _find(upazila, district)
    if not rows:
        return {"error": f"No upazila named '{upazila}'."}
    u = rows[0]
    d = _get(f"/nodes/{u['id']}/flood-freq")
    return {
        "upazila": u["name"],
        "district": u["district"],
        "years": d.get("years"),
        "n_years": d.get("n_years"),
        "method": d.get("method"),
        "map_png": f"{API}/nodes/{u['id']}/flood-freq.png",
    }


@mcp.tool()
def list_high_risk_areas(level: str = "high", limit: int = 20) -> dict:
    """Upazilas at the given risk level or above ('high' or 'medium') in today's
    forecast, sorted by chance of flooding."""
    order = {"low": 0, "medium": 1, "high": 2}
    want = order.get(level.lower(), 2)
    f = _forecast()
    rows = [u for u in f["upazilas"] if order.get(u.get("risk"), 0) >= want]
    rows.sort(key=lambda u: u.get("flood_prob", 0), reverse=True)
    return {"issued_at": f["run"]["issued_at"], "count": len(rows), "areas": rows[: max(1, min(limit, 100))]}


if __name__ == "__main__":
    mcp.run()
