"""Start the server over stdio as a real MCP client would, list its tools and call each one."""
import asyncio
import pathlib
import sys

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

SERVER = pathlib.Path(__file__).with_name("floodshield_mcp.py")


async def main():
    params = StdioServerParameters(command=sys.executable, args=[str(SERVER)])
    async with stdio_client(params) as (r, w), ClientSession(r, w) as s:
        await s.initialize()
        tools = await s.list_tools()
        print("tools:", [t.name for t in tools.tools])
        for name, args in [("get_flood_risk", {"upazila": "Rajapur"}),
                           ("get_flood_history", {"upazila": "Rajapur"}),
                           ("list_high_risk_areas", {"level": "medium", "limit": 3})]:
            res = await s.call_tool(name, args)
            print(f"\n== {name}\n", res.content[0].text[:500])


asyncio.run(main())
