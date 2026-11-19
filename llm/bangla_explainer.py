"""Turn today's flood forecast for an upazila into a short, plain Bangla note,
using a small open model running locally through Ollama.

The numbers come from our LightGBM forecast (live API). The model only rewrites
them in simple words; it is told not to add anything else, and the numbers are
printed next to its text so a reader can check them.

Run:  python bangla_explainer.py Rajapur [district]
Env:  FLOODSHIELD_API (default https://floodshieldbd.duckdns.org/api/v1)
      OLLAMA_MODEL    (default qwen2.5:3b)
"""
import os
import sys

import httpx

API = os.environ.get("FLOODSHIELD_API", "https://floodshieldbd.duckdns.org/api/v1").rstrip("/")
MODEL = os.environ.get("OLLAMA_MODEL", "qwen2.5:3b")
OLLAMA = os.environ.get("OLLAMA_HOST", "http://localhost:11434")
RISK_BN = {"low": "কম", "medium": "মাঝারি", "high": "বেশি"}

ADVICE = {  # fixed, checked advice per risk level; the model never writes advice
    "low": "এখন সরে যাওয়ার দরকার নেই। খবর আর নদীর পানির দিকে নজর রাখুন।",
    "medium": "শুকনো খাবার, পানি, ওষুধ আর জরুরি কাগজ একটি ব্যাগে গুছিয়ে রাখুন। কাছের আশ্রয়কেন্দ্রের পথ জেনে নিন।",
    "high": "দেরি না করে শিশু, বয়স্ক ও গবাদিপশু নিয়ে উঁচু জায়গা বা আশ্রয়কেন্দ্রে চলে যান।",
}
SYSTEM = (
    "তুমি বাংলাদেশের গ্রামের মানুষের জন্য বন্যার খবর এক বাক্যে সহজ বাংলায় লেখো। "
    "শুধু দেওয়া তথ্য ব্যবহার করবে; নতুন কোনো সংখ্যা, তারিখ, জায়গা বা পরামর্শ যোগ করবে না।"
)
EXAMPLE = [
    {"role": "user", "content": "উপজেলা: সুনামগঞ্জ সদর\nঝুঁকির মাত্রা: বেশি\nবন্যার সম্ভাবনা: ৭২%"},
    {"role": "assistant", "content": "সুনামগঞ্জ সদরে আগামী ১৪ দিনে বন্যার ঝুঁকি বেশি, সম্ভাবনা প্রায় ৭২%।"},
]
BN = str.maketrans("0123456789", "০১২৩৪৫৬৭৮৯")


def forecast(name: str, district: str | None):
    d = httpx.get(f"{API}/flood-forecast", timeout=30).json()
    rows = [u for u in d["upazilas"] if u["name"].lower() == name.lower()
            and (not district or u["district"].lower() == district.lower())]
    return (rows[0] if rows else None), d["run"]


def explain(u: dict, run: dict):
    risk = RISK_BN.get(u["risk"], u["risk"])
    pct = str(round(u["flood_prob"] * 100)).translate(BN)
    facts = f"উপজেলা: {u['name']}\nঝুঁকির মাত্রা: {risk}\nবন্যার সম্ভাবনা: {pct}%"
    fallback = f"{u['name']} উপজেলায় আগামী ১৪ দিনে বন্যার ঝুঁকি {risk}, সম্ভাবনা প্রায় {pct}%।"
    try:
        r = httpx.post(f"{OLLAMA}/api/chat", timeout=180, json={
            "model": MODEL, "stream": False, "options": {"temperature": 0},
            "messages": [{"role": "system", "content": SYSTEM}, *EXAMPLE, {"role": "user", "content": facts}],
        })
        r.raise_for_status()
        line = r.json()["message"]["content"].strip().split("\n")[0]
    except Exception:
        line = ""
    # guard: keep the model's sentence only if it has the right risk word and number, and nothing extra
    digits = line.translate(BN)
    ok = risk in line and pct in digits and len(line) < 160 and not any(c.isascii() and c.isalpha() for c in line.replace(u["name"], ""))
    summary = line if ok else fallback
    source = MODEL if ok else "template (model text failed the check)"
    return facts, f"{summary} {ADVICE.get(u['risk'], '')}", source


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    name = sys.argv[1] if len(sys.argv) > 1 else "Rajapur"
    u, run = forecast(name, sys.argv[2] if len(sys.argv) > 2 else None)
    if not u:
        sys.exit(f"No upazila named {name}")
    facts, text, source = explain(u, run)
    print("== তথ্য (পূর্বাভাস মডেল থেকে)\n" + facts + "\n\n== সহজ বাংলায় [" + source + "]\n" + text)
