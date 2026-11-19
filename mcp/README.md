# floodshield-mcp

A small MCP server that lets AI assistants and agents ask FloodShield BD about flood risk in Bangladesh. It reads our live public API and changes nothing.

| Tool | What it gives |
|---|---|
| `get_flood_risk(upazila, district?)` | today's 14-day forecast: risk level, chance of flooding, expected flooded share with P10–P90 |
| `get_flood_history(upazila, district?)` | the monsoon years in our Sentinel-1 flood-frequency map, the method, and a link to the map picture |
| `list_high_risk_areas(level, limit)` | upazilas at `high` (or `medium` and above) risk, sorted by chance of flooding |

## Run

```bash
pip install -r requirements.txt
python floodshield_mcp.py
```

It talks over stdio. To use it in an MCP client, add:

```json
{ "mcpServers": { "floodshield": { "command": "python", "args": ["path/to/mcp/floodshield_mcp.py"] } } }
```

`FLOODSHIELD_API` points it at another server (default `https://floodshieldbd.duckdns.org/api/v1`).

## Test

`python test_client.py` starts the server as a real MCP client would, lists the tools and calls each one.
