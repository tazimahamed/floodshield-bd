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

## Two clients, two transports

- `python floodshield_mcp.py` serves over **stdio**; `python floodshield_mcp.py --http` serves over **Streamable HTTP** at `http://127.0.0.1:8765/mcp`.
- Client 1: `test_client.py` (official MCP SDK client, stdio).
- Client 2: `llm/mcp_agent.py`, a Pydantic-AI agent on a local qwen2.5 model that gets its tools from this server, over stdio or `--http`.
- Works with MCP Python SDK 1.x and 2.x.

## Reaching it from the internet (Cloudflare Tunnel)

For demos we expose the HTTP server for a short time with a free Cloudflare quick tunnel (no account, random `*.trycloudflare.com` address):

```bash
FLOODSHIELD_ALLOWED_HOST=<name>.trycloudflare.com python floodshield_mcp.py --http
cloudflared tunnel --url http://127.0.0.1:8765
```

The server only accepts requests addressed to localhost or that one tunnel host (DNS-rebinding protection stays on; any other host gets HTTP 400/421). Tested: our Pydantic-AI agent called `get_flood_risk` through the public tunnel URL and got the live forecast. The tunnel is closed after each demo; the server is read-only.
