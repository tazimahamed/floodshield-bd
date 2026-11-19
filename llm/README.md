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
