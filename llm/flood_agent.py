"""A small flood-question agent built with Pydantic-AI, running on a local model (Ollama).

Ask it a question in plain words. It decides which tool to call, the tools read our
live forecast API, and it answers from what the tools returned.

Run:  python flood_agent.py "Is Rajapur at risk of flooding?"
Env:  OLLAMA_MODEL (default qwen2.5:3b), FLOODSHIELD_API
"""
import os
import sys

import httpx
from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIChatModel
from pydantic_ai.providers.ollama import OllamaProvider

API = os.environ.get("FLOODSHIELD_API", "https://floodshieldbd.duckdns.org/api/v1").rstrip("/")
MODEL = os.environ.get("OLLAMA_MODEL", "qwen2.5:3b")

model = OpenAIChatModel(MODEL, provider=OllamaProvider(base_url="http://localhost:11434/v1"))
agent = Agent(
    model,
    system_prompt=(
        "You answer questions about flood risk in Bangladesh. Always call a tool first and "
        "answer only from what it returns. Never invent numbers. Keep answers to 2-3 short sentences."
    ),
)


def _forecast() -> dict:
    return httpx.get(f"{API}/flood-forecast", timeout=30).json()


@agent.tool_plain
def get_flood_risk(upazila: str) -> dict:
    """Today's 14-day flood forecast for one upazila (risk level, chance of flooding in %)."""
    f = _forecast()
    rows = [u for u in f["upazilas"] if u["name"].lower() == upazila.strip().lower()]
    if not rows:
        return {"error": f"no upazila named {upazila}"}
    u = rows[0]
    return {"upazila": u["name"], "district": u["district"], "risk": u["risk"],
            "chance_of_flood_percent": round(u["flood_prob"] * 100),
            "valid_until": f["run"]["valid_until"]}


@agent.tool_plain
def list_risky_areas(min_level: str = "medium") -> dict:
    """Upazilas at 'medium' or 'high' risk today, with the top ones by chance of flooding."""
    order = {"low": 0, "medium": 1, "high": 2}
    want = order.get(min_level, 1)
    f = _forecast()
    rows = sorted((u for u in f["upazilas"] if order.get(u["risk"], 0) >= want),
                  key=lambda u: -u["flood_prob"])
    top = sorted(f["upazilas"], key=lambda u: -u["flood_prob"])[:3]
    return {"count_at_or_above": len(rows), "areas": [u["name"] for u in rows[:10]],
            "highest_chance_today": [{"upazila": u["name"], "percent": round(u["flood_prob"] * 100)} for u in top]}


if __name__ == "__main__":
    q = " ".join(sys.argv[1:]) or "Is Rajapur at risk of flooding?"
    r = agent.run_sync(q)
    calls = [p.tool_name for m in r.all_messages() for p in getattr(m, "parts", []) if p.part_kind == "tool-call"]
    print("Q:", q)
    print("tools called:", calls)
    print("A:", r.output)
