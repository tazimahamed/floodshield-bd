"""P6: flood alerts in Bangla and English over Telegram.

Levels (from the latest flood forecast):
  watch   = medium risk (P(flooded) >= 25 %)
  warning = high risk   (P(flooded) >= 50 %)
  severe  = high risk and a hospital or substation lies in the upazila
A chat gets an alert for an upazila only when its level rises, or once a day while it stays
at warning/severe, so people are not spammed every 6 hours.

Bot commands (long polling, no public URL needed):
  /start, /subscribe <upazila>, /unsubscribe [upazila], /list, /status, /lang bn|en
"""

import logging
from datetime import datetime, timedelta, timezone

import httpx
from sqlalchemy import func, select

from app.core.config import settings
from app.db.models import AlertLog, Asset, FloodForecast, FloodForecastRun, Node, Subscriber
from app.db.session import SessionLocal

log = logging.getLogger(__name__)
API = "https://api.telegram.org/bot{token}/{method}"
LEVEL_RANK = {"none": 0, "watch": 1, "warning": 2, "severe": 3}
REPEAT_AFTER = timedelta(hours=24)

TEXT = {
    "en": {
        "level": {"watch": "🟡 FLOOD WATCH", "warning": "🟠 FLOOD WARNING", "severe": "🔴 SEVERE FLOOD WARNING"},
        "body": ("{level}: {name} ({district})\n"
                 "Chance of abnormal flooding (≥5% of the area) in the next 15 days: {prob}%\n"
                 "Expected flooded share: {frac}% (likely range {p10}–{p90}%)\n"
                 "Period: {start} → {end}\n{facilities}"
                 "\nWhat to do: keep documents, medicine and drinking water ready; know your nearest shelter; "
                 "move livestock and stored food to higher ground.\n"
                 "Follow FFWC (ffwc.gov.bd), BMD and your Upazila Disaster Management Committee — "
                 "Durjog Barta supports, and does not replace, official warnings."),
        "facilities": "In this upazila: {items}\n",
        "kinds": {"hospital": "hospitals", "clinic": "clinics", "school": "schools", "shelter": "shelters",
                  "substation": "substations"},
        "start": ("Durjog Barta Bangladesh — upazila flood early warning (FloodShield BD).\n"
                  "Send /subscribe <upazila name> (e.g. /subscribe Sylhet Sadar) to get alerts.\n"
                  "/list your upazilas · /status current risk · /unsubscribe · /lang bn"),
        "subscribed": "✅ Subscribed: {name} ({district}). You will get an alert when the flood risk rises.",
        "unsubscribed": "Removed: {names}", "none": "You have no upazilas yet. Send /subscribe <upazila>.",
        "not_found": "No upazila called “{q}”. Try the English name as on the map, e.g. Sunamganj Sadar.",
        "many": "Several upazilas match “{q}”: {names}. Please send the exact name.",
        "list": "Your upazilas: {names}", "lang": "Language set to English.",
        "status_line": "{name}: {risk} risk, {prob}% chance (until {end})", "no_forecast": "No forecast yet.",
        "risk": {"low": "low", "medium": "medium", "high": "high"},
    },
    "bn": {
        "level": {"watch": "🟡 বন্যা সতর্কতা", "warning": "🟠 বন্যা সতর্কবার্তা", "severe": "🔴 তীব্র বন্যার সতর্কবার্তা"},
        "body": ("{level}: {name} ({district})\n"
                 "আগামী ১৫ দিনে অস্বাভাবিক বন্যার (এলাকার ≥৫%) সম্ভাবনা: {prob}%\n"
                 "প্রত্যাশিত প্লাবিত এলাকা: {frac}% (সম্ভাব্য পরিসর {p10}–{p90}%)\n"
                 "সময়: {start} → {end}\n{facilities}"
                 "\nকরণীয়: কাগজপত্র, ওষুধ ও খাবার পানি প্রস্তুত রাখুন; নিকটতম আশ্রয়কেন্দ্র জেনে নিন; "
                 "গবাদিপশু ও মজুত খাবার উঁচু জায়গায় সরান।\n"
                 "FFWC (ffwc.gov.bd), আবহাওয়া অধিদপ্তর ও উপজেলা দুর্যোগ ব্যবস্থাপনা কমিটির নির্দেশনা মেনে চলুন — "
                 "দুর্যোগ বার্তা সরকারি সতর্কবার্তার সহায়ক, বিকল্প নয়।"),
        "facilities": "এই উপজেলায়: {items}\n",
        "kinds": {"hospital": "হাসপাতাল", "clinic": "ক্লিনিক", "school": "স্কুল", "shelter": "আশ্রয়কেন্দ্র",
                  "substation": "সাবস্টেশন"},
        "start": ("দুর্যোগ বার্তা বাংলাদেশ — উপজেলাভিত্তিক বন্যার আগাম সতর্কতা (FloodShield BD)।\n"
                  "সতর্কবার্তা পেতে লিখুন /subscribe <উপজেলার নাম> (যেমন /subscribe Sylhet Sadar)।\n"
                  "/list আপনার উপজেলা · /status এখনকার ঝুঁকি · /unsubscribe · /lang en"),
        "subscribed": "✅ যুক্ত হয়েছে: {name} ({district})। বন্যার ঝুঁকি বাড়লে আপনাকে জানানো হবে।",
        "unsubscribed": "বাদ দেওয়া হয়েছে: {names}", "none": "এখনো কোনো উপজেলা নেই। লিখুন /subscribe <উপজেলা>।",
        "not_found": "“{q}” নামে কোনো উপজেলা পাওয়া যায়নি। ম্যাপের মতো ইংরেজি নাম লিখুন, যেমন Sunamganj Sadar।",
        "many": "“{q}” এর সাথে একাধিক উপজেলা মেলে: {names}। সঠিক নামটি লিখুন।",
        "list": "আপনার উপজেলা: {names}", "lang": "ভাষা বাংলা করা হয়েছে।",
        "status_line": "{name}: {risk} ঝুঁকি, {prob}% সম্ভাবনা ({end} পর্যন্ত)", "no_forecast": "এখনো কোনো পূর্বাভাস নেই।",
        "risk": {"low": "নিম্ন", "medium": "মাঝারি", "high": "উচ্চ"},
    },
}


def level_for(risk: str, has_critical: bool) -> str:
    if risk == "high":
        return "severe" if has_critical else "warning"
    return "watch" if risk == "medium" else "none"


def render(lang: str, level: str, node: Node, fc: FloodForecast, run: FloodForecastRun, facilities: dict) -> str:
    t = TEXT[lang]
    items = ", ".join(f"{n} {t['kinds'][k]}" for k, n in facilities.items() if k in t["kinds"] and n)
    pct = lambda v: round((v or 0) * 100)  # noqa: E731
    return t["body"].format(level=t["level"][level], name=node.name, district=node.district or "",
                            prob=pct(fc.flood_prob), frac=pct(fc.flood_frac), p10=pct(fc.frac_p10),
                            p90=pct(fc.frac_p90), start=run.reference_day, end=run.valid_until,
                            facilities=t["facilities"].format(items=items) if items else "")


def _call(method: str, **params) -> dict:
    if not settings.telegram_bot_token:
        raise RuntimeError("TELEGRAM_BOT_TOKEN is not set in .env")
    r = httpx.post(API.format(token=settings.telegram_bot_token, method=method), json=params, timeout=40)
    data = r.json()
    if not data.get("ok"):
        raise RuntimeError(f"Telegram {method} failed: {data.get('description')}")
    return data["result"]


def send(chat_id: int, text: str) -> None:
    _call("sendMessage", chat_id=chat_id, text=text, disable_web_page_preview=True)


def _facilities(db, node_id: str) -> dict:
    return dict(db.execute(select(Asset.kind, func.count()).where(Asset.node_id == node_id)
                           .group_by(Asset.kind)).all())


def dispatch_alerts() -> int:
    """Send alerts for the latest forecast run. Returns the number of messages sent."""
    if not settings.telegram_bot_token:
        log.info("No Telegram token; alerts not sent")
        return 0
    sent = 0
    now = datetime.now(timezone.utc)
    with SessionLocal() as db:
        run = db.scalars(select(FloodForecastRun).order_by(FloodForecastRun.id.desc()).limit(1)).first()
        if not run:
            return 0
        for sub in db.scalars(select(Subscriber).where(Subscriber.active)).all():
            for node_id in sub.node_ids:
                fc = db.scalars(select(FloodForecast).where(FloodForecast.run_id == run.id,
                                                            FloodForecast.node_id == node_id)).first()
                if not fc:
                    continue
                fac = _facilities(db, node_id)
                level = level_for(fc.risk, bool(fac.get("hospital") or fac.get("substation")))
                if level == "none":
                    continue
                last = db.scalars(select(AlertLog).where(AlertLog.chat_id == sub.chat_id, AlertLog.node_id == node_id,
                                                         AlertLog.status == "sent")
                                  .order_by(AlertLog.sent_at.desc()).limit(1)).first()
                if last and LEVEL_RANK[last.level] >= LEVEL_RANK[level] and now - last.sent_at < REPEAT_AFTER:
                    continue
                text = render(sub.lang, level, db.get(Node, node_id), fc, run, fac)
                entry = AlertLog(forecast_run_id=run.id, chat_id=sub.chat_id, node_id=node_id, level=level,
                                 message=text, status="sent")
                try:
                    send(sub.chat_id, text)
                    sent += 1
                except Exception as e:
                    entry.status, entry.error = "failed", str(e)[:1000]
                    if "blocked" in str(e) or "chat not found" in str(e):
                        sub.active = False
                db.add(entry)
                db.commit()
    log.info("alerts sent: %d", sent)
    return sent


# ---------- bot commands ----------

def _find_upazila(db, q: str) -> list[Node]:
    q = q.strip()
    exact = db.scalars(select(Node).where(Node.node_type == "upazila", func.lower(Node.name) == q.lower())).all()
    return exact or db.scalars(select(Node).where(Node.node_type == "upazila", Node.name.ilike(f"%{q}%"))
                               .limit(6)).all()


def handle_message(chat_id: int, text: str) -> str:
    cmd, _, arg = text.strip().partition(" ")
    cmd = cmd.split("@")[0].lower()
    with SessionLocal() as db:
        sub = db.get(Subscriber, chat_id) or Subscriber(chat_id=chat_id, lang="bn", node_ids=[], active=True)
        db.add(sub)
        t = TEXT[sub.lang]
        reply = t["start"]
        if cmd == "/lang" and arg.strip() in TEXT:
            sub.lang = arg.strip()
            reply = TEXT[sub.lang]["lang"]
        elif cmd == "/subscribe" and arg.strip():
            found = _find_upazila(db, arg)
            if not found:
                reply = t["not_found"].format(q=arg.strip())
            elif len(found) > 1:
                reply = t["many"].format(q=arg.strip(), names=", ".join(f"{n.name} ({n.district})" for n in found))
            else:
                n = found[0]
                sub.node_ids = sorted(set(sub.node_ids) | {n.id})
                sub.active = True
                reply = t["subscribed"].format(name=n.name, district=n.district)
        elif cmd == "/unsubscribe":
            drop = [n.id for n in _find_upazila(db, arg)] if arg.strip() else list(sub.node_ids)
            names = [db.get(Node, i).name for i in sub.node_ids if i in drop]
            sub.node_ids = [i for i in sub.node_ids if i not in drop]
            reply = t["unsubscribed"].format(names=", ".join(names) or "—")
        elif cmd in ("/list", "/status"):
            if not sub.node_ids:
                reply = t["none"]
            elif cmd == "/list":
                reply = t["list"].format(names=", ".join(db.get(Node, i).name for i in sub.node_ids))
            else:
                run = db.scalars(select(FloodForecastRun).order_by(FloodForecastRun.id.desc()).limit(1)).first()
                if not run:
                    reply = t["no_forecast"]
                else:
                    lines = []
                    for i in sub.node_ids:
                        fc = db.scalars(select(FloodForecast).where(FloodForecast.run_id == run.id,
                                                                    FloodForecast.node_id == i)).first()
                        if fc:
                            lines.append(t["status_line"].format(name=db.get(Node, i).name, risk=t["risk"][fc.risk],
                                                                 prob=round(fc.flood_prob * 100), end=run.valid_until))
                    reply = "\n".join(lines) or t["no_forecast"]
        db.commit()
        return reply


_offset = 0


def poll_updates() -> int:
    """Scheduler job: read new bot messages (long polling) and answer them."""
    global _offset
    if not settings.telegram_bot_token:
        return 0
    updates = _call("getUpdates", offset=_offset, timeout=25, allowed_updates=["message"])
    for u in updates:
        _offset = u["update_id"] + 1
        msg = u.get("message") or {}
        if "text" in msg:
            try:
                send(msg["chat"]["id"], handle_message(msg["chat"]["id"], msg["text"]))
            except Exception:
                log.exception("Telegram reply failed")
    return len(updates)


def setup_bot_profile() -> None:
    """Commands menu and descriptions shown in Telegram (Bangla default, English for English users)."""
    cmds = {
        "bn": [("subscribe", "উপজেলা যোগ করুন, যেমন /subscribe Chhatak"), ("status", "এখনকার বন্যার ঝুঁকি"),
               ("list", "আপনার উপজেলাগুলো"), ("unsubscribe", "উপজেলা বাদ দিন"), ("lang", "ভাষা: /lang en বা /lang bn")],
        "en": [("subscribe", "Add an upazila, e.g. /subscribe Chhatak"), ("status", "Current flood risk"),
               ("list", "Your upazilas"), ("unsubscribe", "Remove upazilas"), ("lang", "Language: /lang bn or /lang en")],
    }
    desc = {
        "bn": ("দুর্যোগ বার্তা বাংলাদেশ: আপনার উপজেলায় বন্যার ঝুঁকি বাড়লে বাংলায় আগাম সতর্কবার্তা পাবেন। "
               "স্যাটেলাইট, আবহাওয়ার পূর্বাভাস ও নদীর উজানের তথ্য থেকে তৈরি। সরকারি সতর্কবার্তা (FFWC, BMD) আগে মানুন।"),
        "en": ("Durjog Barta Bangladesh: early flood warnings for your upazila, in Bangla or English, from satellite, "
               "weather forecasts and upstream river data. Always follow official FFWC/BMD warnings first."),
    }
    short = {"bn": "উপজেলাভিত্তিক বন্যার আগাম সতর্কবার্তা। Start চেপে /subscribe <উপজেলা> লিখুন।",
             "en": "Upazila flood early warnings. Press Start, then /subscribe <upazila>."}
    for lang in ("bn", "en"):
        code = {} if lang == "bn" else {"language_code": "en"}
        _call("setMyCommands", commands=[{"command": c, "description": d} for c, d in cmds[lang]], **code)
        _call("setMyDescription", description=desc[lang], **code)
        _call("setMyShortDescription", short_description=short[lang], **code)
