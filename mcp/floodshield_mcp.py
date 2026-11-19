"""FloodShield BD MCP server.

Lets any MCP client (an AI assistant, an agent, an IDE) ask our live API
about flood risk in Bangladesh, upazila by upazila. Read-only.

Run:  python floodshield_mcp.py          (stdio)
Env:  FLOODSHIELD_API  (default https://floodshieldbd.duckdns.org/api/v1)
"""
import os

import httpx
try:                                    # MCP Python SDK 2.x
    from mcp.server.mcpserver import MCPServer as _Server
    SDK2 = True
except ImportError:                     # MCP Python SDK 1.x
    from mcp.server.fastmcp import FastMCP as _Server
    SDK2 = False

API = os.environ.get("FLOODSHIELD_API", "https://floodshieldbd.duckdns.org/api/v1").rstrip("/")
mcp = _Server("floodshield-mcp")


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
    import sys
    if "--http" in sys.argv:          # Streamable HTTP on http://127.0.0.1:8765/mcp
        if SDK2:
            kw = {}
            extra = os.environ.get("FLOODSHIELD_ALLOWED_HOST")  # e.g. a tunnel host; others stay blocked
            if extra:
                from mcp.server.transport_security import TransportSecuritySettings
                kw["transport_security"] = TransportSecuritySettings(
                    enable_dns_rebinding_protection=True,
                    allowed_hosts=["127.0.0.1:*", "localhost:*", extra],
                    allowed_origins=["http://127.0.0.1:*", "http://localhost:*", f"https://{extra}"])
            mcp.run(transport="streamable-http", host="127.0.0.1", port=8765, **kw)
        else:
            mcp.settings.host, mcp.settings.port = "127.0.0.1", 8765
            mcp.run(transport="streamable-http")
    else:                              # stdio (default)
        mcp.run()
