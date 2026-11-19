"""The same Pydantic-AI flood agent, but its tools come from our own floodshield-mcp server.

This is the second client of floodshield-mcp (the first is mcp/test_client.py), so one
MCP server serves two different clients.

Run:  python mcp_agent.py "Is Rajapur at risk of flooding?"          (starts the server over stdio)
      python mcp_agent.py --http "..."   (connects to a server started with --http)
"""
import asyncio
import pathlib
import sys

from pydantic_ai import Agent
from pydantic_ai.mcp import MCPToolset
from pydantic_ai.models.openai import OpenAIChatModel
from pydantic_ai.providers.ollama import OllamaProvider

SERVER = pathlib.Path(__file__).resolve().parent.parent / "mcp" / "floodshield_mcp.py"


async def main(question: str, http: bool):
    # a script path -> stdio, a URL -> streamable HTTP
    server = MCPToolset("http://127.0.0.1:8765/mcp" if http else SERVER)
    model = OpenAIChatModel("qwen2.5:3b", provider=OllamaProvider(base_url="http://localhost:11434/v1"))
    agent = Agent(model, toolsets=[server], system_prompt=(
        "You answer questions about flood risk in Bangladesh. Always call a tool first and answer "
        "only from what it returns. Never invent numbers. Keep answers to 2-3 short sentences."))
    async with agent:
        r = await agent.run(question)
    calls = [p.tool_name for m in r.all_messages() for p in getattr(m, "parts", []) if p.part_kind == "tool-call"]
    print("transport:", "streamable-http" if http else "stdio")
    print("tools called (via MCP):", calls)
    print("A:", r.output)


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if a != "--http"]
    asyncio.run(main(" ".join(args) or "Is Rajapur at risk of flooding?", "--http" in sys.argv))
