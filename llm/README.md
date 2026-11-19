# Bangla flood note (local LLM)

`bangla_explainer.py` turns today's forecast for an upazila into a short note in plain Bangla, using a small open model that runs on our own computer through Ollama. No data leaves the machine.

- The numbers come from our LightGBM forecast (live API). The LLM only writes one summary sentence from them.
- The advice ("what to do now") is fixed, checked text per risk level. The LLM never writes advice.
- A guard keeps the LLM sentence only if it has the right risk word and the right percentage and no extra English. Otherwise a plain template sentence is used.

```bash
ollama pull qwen2.5:3b
python bangla_explainer.py Rajapur
```

Tested on an NVIDIA RTX 2050 laptop GPU (4 GB) with `qwen2.5:3b` (Q4, about 1.9 GB).

## Flood question agent (Pydantic-AI)

`flood_agent.py` is a small tool-calling agent built with Pydantic-AI on the same local model. You ask in plain words; it picks a tool (`get_flood_risk` or `list_risky_areas`), the tool reads our live forecast, and it answers only from that.

```bash
pip install "pydantic-ai-slim[openai]"
python flood_agent.py "Is Rajapur at risk of flooding?"
```

Test run: "Is Rajapur at risk of flooding?" → called `get_flood_risk` → "Rajapur is at low risk of flooding, with a 18% chance…" (matches the live forecast).
