"""P6: Durjog Barta Bangladesh — flood alerts over Telegram, in Bangla and English together,
with a Bangla voice note for people who cannot read.

Levels (from the latest flood forecast):
  none    = low risk: calm "no elevated risk" wording, never "you are safe"
  watch   = medium risk (P(flooded) >= 25 %): get ready
  warning = high risk   (P(flooded) >= 50 %): act now
  severe  = high risk and a hospital or substation lies in the upazila
Pushed alerts go out only for watch and above, when the level rises or once a day while it
stays at warning/severe. Low risk is only ever said in reply to the person (/status, subscribe).

People can just type a place name (old or new spelling, small typos, district, Bangla district);
the bot answers with buttons when it needs them to pick an upazila.
"""

import html
import logging
from datetime import datetime, timedelta, timezone

import httpx
from sqlalchemy import func, select

from app.core.config import settings
from app.db.models import AlertLog, Asset, FloodForecast, FloodForecastRun, Node, RainForecast, Subscriber
from app.db.session import SessionLocal
from app.services.places import find

log = logging.getLogger(__name__)
API = "https://api.telegram.org/bot{token}/{method}"
LEVEL_RANK = {"none": 0, "watch": 1, "warning": 2, "severe": 3}
REPEAT_AFTER = timedelta(hours=24)
BN_DIGITS = str.maketrans("0123456789", "০১২৩৪৫৬৭৮৯")
BN_MONTHS = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর",
             "অক্টোবর", "নভেম্বর", "ডিসেম্বর"]

HEAD = {
    "none": ("🟢 বন্যার বাড়তি ঝুঁকি নেই", "🟢 No elevated flood risk"),
    "watch": ("🟡 বন্যা সতর্কতা — প্রস্তুত থাকুন", "🟡 FLOOD WATCH — get ready"),
    "warning": ("🟠 বন্যা সতর্কবার্তা — এখনই ব্যবস্থা নিন", "🟠 FLOOD WARNING — act now"),
    "severe": ("🔴 তীব্র বন্যার সতর্কবার্তা", "🔴 SEVERE FLOOD WARNING"),
}
ADVICE = {
    "none": ("স্বাভাবিক কাজকর্ম চালিয়ে যান। পরিস্থিতি বদলালে আমরা সঙ্গে সঙ্গে জানাব।",
             "Carry on as usual. We will message you right away if this changes."),
    "watch": ("জরুরি কাগজপত্র ও ওষুধ পানিরোধী ব্যাগে রাখুন, মোবাইল চার্জ রাখুন, নিকটতম আশ্রয়কেন্দ্র কোথায় জেনে নিন।",
              "Keep papers and medicine in a waterproof bag, keep your phone charged, know where your nearest shelter is."),
    "warning": ("খাবার পানি ও শুকনো খাবার মজুত করুন; গবাদিপশু ও মালামাল উঁচু জায়গায় সরান; শিশু ও বয়স্কদের দিকে খেয়াল রাখুন।",
                "Store drinking water and dry food; move livestock and goods to higher ground; look after children and the elderly."),
    "severe": ("পানি বাড়তে শুরু করলে দেরি না করে আশ্রয়কেন্দ্রে যান; খাবার পানি, ওষুধ ও কাগজপত্র সঙ্গে নিন।\n"
               "☎️ জরুরি সাহায্য ৯৯৯ · দুর্যোগের তথ্য ১০৯০",
               "If water starts rising, go to a shelter without delay; take water, medicine and documents.\n"
               "☎️ Emergency 999 · Disaster info 1090"),
}
RISK_WORD = {"low": ("নিম্ন", "low"), "medium": ("মাঝারি", "medium"), "high": ("উচ্চ", "high")}
FOOT = ("সরকারি সতর্কবার্তা (FFWC, আবহাওয়া অধিদপ্তর, উপজেলা প্রশাসন) সবসময় আগে মানুন।",
        "Always follow official warnings (FFWC, BMD, upazila administration) first.")
# BMD rainfall categories, mm per day
RAIN_WORDS = [(0.5, "বৃষ্টি নেই", "no rain"), (10, "হালকা", "light"), (22, "মাঝারি", "moderate"),
              (43, "মাঝারি ধরনের ভারী", "moderately heavy"), (88, "ভারী", "heavy"), (1e9, "অতি ভারী", "very heavy")]
VOICE_RAIN = {"বৃষ্টি নেই": "বৃষ্টির সম্ভাবনা নেই", "হালকা": "হালকা বৃষ্টি হতে পারে", "মাঝারি": "মাঝারি বৃষ্টি হতে পারে",
              "মাঝারি ধরনের ভারী": "মাঝারি ধরনের ভারী বৃষ্টি হতে পারে", "ভারী": "ভারী বৃষ্টি হতে পারে",
              "অতি ভারী": "অতি ভারী বৃষ্টি হতে পারে"}
VOICE = {
    "none": "দুর্যোগ বার্তা। আপনার উপজেলায় আগামী পনেরো দিনে বন্যার বাড়তি ঝুঁকি দেখা যাচ্ছে না। আগামী তিন দিনে {rain}। "
            "স্বাভাবিক কাজকর্ম চালিয়ে যান। পরিস্থিতি বদলালে আমরা জানাব।",
    "watch": "দুর্যোগ বার্তা। আপনার উপজেলায় আগামী পনেরো দিনে বন্যার আশঙ্কা আছে। আগামী তিন দিনে {rain}। প্রস্তুত থাকুন। "
             "জরুরি কাগজপত্র আর ওষুধ পানিরোধী ব্যাগে রাখুন, মোবাইল চার্জ রাখুন, নিকটতম আশ্রয়কেন্দ্র জেনে নিন।",
    "warning": "দুর্যোগ বার্তা। জরুরি। আপনার উপজেলায় বন্যার ঝুঁকি বেশি। আগামী তিন দিনে {rain}। এখনই খাবার পানি আর শুকনো খাবার "
               "মজুত করুন। গবাদিপশু আর মালামাল উঁচু জায়গায় সরান। শিশু আর বয়স্কদের দিকে খেয়াল রাখুন।",
    "severe": "দুর্যোগ বার্তা। খুব জরুরি। আপনার উপজেলায় তীব্র বন্যার ঝুঁকি। আগামী তিন দিনে {rain}। পানি বাড়তে শুরু করলে "
              "দেরি না করে আশ্রয়কেন্দ্রে যান। জরুরি সাহায্যের জন্য নয় নয় নয় নম্বরে ফোন করুন।",
}


def rain_word(mm_per_day: float | None) -> tuple[str, str]:
    v = mm_per_day or 0
    return next((bn, en) for top, bn, en in RAIN_WORDS if v < top)


def level_for(risk: str, has_critical: bool) -> str:
    if risk == "high":
        return "severe" if has_critical else "warning"
    return "watch" if risk == "medium" else "none"


def _bn(x) -> str:
    return str(x).translate(BN_DIGITS)


def _bn_date(d) -> str:
    return f"{_bn(d.day)} {BN_MONTHS[d.month - 1]}"


def _mm(v, bn: bool) -> str:
    if v is None:
        return "–"
    s = f"{v:.0f}" if v >= 10 else f"{v:.1f}"
    return f"{_bn(s)} মিমি" if bn else f"{s} mm"


def render(level: str, node: Node, fc: FloodForecast, run: FloodForecastRun, facilities: dict,
           rain: dict | None = None) -> str:
    """One organised message (HTML): Bangla first, then English, worded for the risk level."""
    rain = rain or {}
    start, end = run.reference_day, run.valid_until
    pct = round((fc.flood_prob or 0) * 100)
    frac, p10, p90 = (round((v or 0) * 100) for v in (fc.flood_frac, fc.frac_p10, fc.frac_p90))
    risk_bn, risk_en = RISK_WORD[fc.risk]
    w_bn, w_en = rain_word((rain.get("next72") or 0) / 3)
    name = html.escape(f"{node.name}, {node.district}")
    kinds = [("hospital", "হাসপাতাল", "hospitals"), ("shelter", "আশ্রয়কেন্দ্র", "shelters"),
             ("school", "স্কুল", "schools"), ("substation", "সাবস্টেশন", "substations")]
    fac_bn = " · ".join(f"{_bn(facilities[k])} {bn}" for k, bn, _ in kinds if facilities.get(k))
    fac_en = " · ".join(f"{facilities[k]} {en if facilities[k] > 1 else en[:-1]}" for k, _, en in kinds if facilities.get(k))

    bn = [f"<b>{HEAD[level][0]}</b>", f"📍 {name}", f"📅 আগামী ১৫ দিন: {_bn_date(start)} – {_bn_date(end)}", "",
          "<b>🌧️ বৃষ্টির পূর্বাভাস</b>",
          f"• আগামী ২৪ ঘণ্টা: {_mm(rain.get('next24'), True)}",
          f"• আগামী ৩ দিন: {_mm(rain.get('next72'), True)} ({w_bn})",
          f"• উজানে (ভারতসহ), আগামী ৩ দিন: {_mm(rain.get('up72'), True)}",
          f"• গত ৩ দিন: {_mm(rain.get('past72'), True)}", "",
          "<b>🌊 বন্যার ঝুঁকি</b>",
          f"• সম্ভাবনা: {_bn(pct)}% ({risk_bn})"]
    en = [f"<b>{HEAD[level][1]}</b>", f"📅 Next 15 days: {start:%d %b} – {end:%d %b}", "",
          "<b>🌧️ Rain forecast</b>",
          f"• Next 24 h: {_mm(rain.get('next24'), False)}",
          f"• Next 3 days: {_mm(rain.get('next72'), False)} ({w_en})",
          f"• Upstream (incl. India), next 3 days: {_mm(rain.get('up72'), False)}",
          f"• Last 3 days: {_mm(rain.get('past72'), False)}", "",
          "<b>🌊 Flood risk</b>",
          f"• Chance: {pct}% ({risk_en})"]
    if level != "none":
        bn.append(f"• ডুবতে পারে: উপজেলার প্রায় {_bn(frac)}% (সম্ভাব্য {_bn(p10)}–{_bn(p90)}%)")
        en.append(f"• May flood: about {frac}% of the upazila (likely {p10}–{p90}%)")
    if fac_bn:
        bn += ["", f"<b>🏥 এই উপজেলায়</b>: {fac_bn}"]
        en += ["", f"<b>🏥 In this upazila</b>: {fac_en}"]
    bn += ["", f"<b>✅ করণীয়</b>: {ADVICE[level][0]}"]
    en += ["", f"<b>✅ What to do</b>: {ADVICE[level][1]}"]
    return ("\n".join(bn) + "\n\n━━━━━━━━━━ English ━━━━━━━━━━\n" + "\n".join(en) +
            f"\n\n<i>ℹ️ {FOOT[0]}\n{FOOT[1]}</i>")


def voice_script(level: str, node: Node, rain: dict | None = None) -> str:
    # the Bangla voice model cannot read Latin letters, so the place name is in the text above it
    words = rain_word(((rain or {}).get("next72") or 0) / 3)[0]
    return VOICE[level].format(rain=VOICE_RAIN[words])


UI = {
    "start": ("দুর্যোগ বার্তা বাংলাদেশে স্বাগতম! 🙏\nআপনার উপজেলা বা জেলার নাম লিখে পাঠান — যেমন Chhatak, Jessore বা যশোর। "
              "বানান একটু ভুল হলেও চলবে।\n\nWelcome to Durjog Barta Bangladesh! Just send the name of your upazila or "
              "district — e.g. Chhatak or Jessore. Small spelling mistakes are fine."),
    "pick_district": "📍 {district} জেলার কোন উপজেলা? নিচ থেকে বেছে নিন।\nWhich upazila in {district}? Tap one below.",
    "pick": "🔎 আপনি কি এগুলোর কোনোটি বোঝাতে চেয়েছেন?\nDid you mean one of these?",
    "not_found": ("😕 “{q}” নামে কিছু পাইনি। জেলার নাম লিখে দেখুন (যেমন Sylhet বা সিলেট), তারপর তালিকা থেকে উপজেলা বেছে নিন।\n"
                  "Couldn't find “{q}”. Try your district name (e.g. Sylhet), then pick your upazila."),
    "subscribed": "✅ যুক্ত হয়েছে: {name} ({district})\nSubscribed: {name} ({district})",
    "none": "এখনো কোনো উপজেলা যুক্ত করেননি। উপজেলার নাম লিখে পাঠান।\nNo upazila yet — just send its name.",
    "list": "📋 আপনার উপজেলা / Your upazilas:\n{names}",
    "removed": "❎ বাদ দেওয়া হয়েছে / Removed: {names}",
    "no_forecast": "এখনো কোনো পূর্বাভাস নেই। / No forecast yet.",
    "voice_on": "🔊 ভয়েস বার্তা চালু। / Voice messages on.", "voice_off": "🔇 ভয়েস বার্তা বন্ধ। / Voice messages off.",
}



# ---------- Telegram API ----------

def _call(method: str, files: dict | None = None, **params) -> dict:
    if not settings.telegram_bot_token:
        raise RuntimeError("TELEGRAM_BOT_TOKEN is not set in .env")
    url = API.format(token=settings.telegram_bot_token, method=method)
    r = httpx.post(url, data=params, files=files, timeout=60) if files else httpx.post(url, json=params, timeout=40)
    data = r.json()
    if not data.get("ok"):
        raise RuntimeError(f"Telegram {method} failed: {data.get('description')}")
    return data["result"]


def send(chat_id: int, text: str, buttons: list[list[dict]] | None = None) -> None:
    params = {"chat_id": chat_id, "text": text, "parse_mode": "HTML", "disable_web_page_preview": True}
    if buttons:
        params["reply_markup"] = {"inline_keyboard": buttons}
    _call("sendMessage", **params)


def send_voice(chat_id: int, script: str) -> None:
    """Bangla voice note; a failure here never blocks the text alert."""
    try:
        from app.services.tts import bangla_voice_ogg
        _call("sendVoice", files={"voice": ("durjog-barta.ogg", bangla_voice_ogg(script), "audio/ogg")},
              chat_id=str(chat_id))
    except Exception:
        log.exception("Voice message failed")


def _facilities(db, node_id: str) -> dict:
    return dict(db.execute(select(Asset.kind, func.count()).where(Asset.node_id == node_id)
                           .group_by(Asset.kind)).all())


def _rain(db, node_id: str) -> dict:
    """Latest GFS rain for the upazila and the area-weighted rain over its upstream basins."""
    from app.api.routes import UPSTREAM_SQL, _latest_run as latest_rain_run
    run = latest_rain_run(db)
    if not run:
        return {}
    rf = db.scalars(select(RainForecast).where(RainForecast.ingest_run_id == run.id,
                                               RainForecast.node_id == node_id)).first()
    up = db.execute(UPSTREAM_SQL, {"node": node_id, "run": run.id}).all()
    got = [(r.rain_72h_mm, r.km2) for r in up if r.rain_72h_mm is not None]
    area = sum(a for _, a in got)
    return {"past72": rf and rf.rain_past_72h_mm, "next24": rf and rf.rain_24h_mm, "next72": rf and rf.rain_72h_mm,
            "up72": sum(v * a for v, a in got) / area if area else None}


def _latest_run(db) -> FloodForecastRun | None:
    return db.scalars(select(FloodForecastRun).order_by(FloodForecastRun.id.desc()).limit(1)).first()


def _forecast(db, run, node_id) -> FloodForecast | None:
    return db.scalars(select(FloodForecast).where(FloodForecast.run_id == run.id,
                                                  FloodForecast.node_id == node_id)).first()


def dispatch_alerts() -> int:
    """Push alerts (watch and above) for the latest forecast run. Returns messages sent."""
    if not settings.telegram_bot_token:
        log.info("No Telegram token; alerts not sent")
        return 0
    sent = 0
    now = datetime.now(timezone.utc)
    with SessionLocal() as db:
        run = _latest_run(db)
        if not run:
            return 0
        for sub in db.scalars(select(Subscriber).where(Subscriber.active)).all():
            for node_id in sub.node_ids:
                fc = _forecast(db, run, node_id)
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
                node, rain = db.get(Node, node_id), _rain(db, node_id)
                text = render(level, node, fc, run, fac, rain)
                entry = AlertLog(forecast_run_id=run.id, chat_id=sub.chat_id, node_id=node_id, level=level,
                                 message=text, status="sent")
                try:
                    send(sub.chat_id, text)
                    if sub.voice is not False:
                        send_voice(sub.chat_id, voice_script(level, node, rain))
                    sent += 1
                except Exception as e:
                    entry.status, entry.error = "failed", str(e)[:1000]
                    if "blocked" in str(e) or "chat not found" in str(e):
                        sub.active = False
                db.add(entry)
                db.commit()
    log.info("alerts sent: %d", sent)
    return sent


# ---------- conversation ----------

def _buttons(nodes: list[Node], with_district: bool) -> list[list[dict]]:
    btns = [{"text": f"{n.name} ({n.district})" if with_district else n.name, "callback_data": f"s:{n.id}"}
            for n in nodes[:40]]
    return [btns[i:i + 2] for i in range(0, len(btns), 2)]


def _status_messages(db, sub: Subscriber, node_ids: list[str]) -> list[tuple[str, str]]:
    """(text, voice script) for each upazila, worded for its current level."""
    run = _latest_run(db)
    if not run:
        return [(UI["no_forecast"], "")]
    out = []
    for i in node_ids:
        fc, node = _forecast(db, run, i), db.get(Node, i)
        if fc and node:
            fac = _facilities(db, i)
            level = level_for(fc.risk, bool(fac.get("hospital") or fac.get("substation")))
            rain = _rain(db, i)
            out.append((render(level, node, fc, run, fac, rain), voice_script(level, node, rain)))
    return out


def handle_message(chat_id: int, text: str) -> list[dict]:
    """Returns the replies to send: [{"text", "buttons"?, "voice"?}]."""
    raw = text.strip()
    cmd, _, arg = raw.partition(" ")
    cmd = cmd.split("@")[0].lower()
    with SessionLocal() as db:
        sub = db.get(Subscriber, chat_id) or Subscriber(chat_id=chat_id, lang="bn", node_ids=[], active=True, voice=True)
        db.add(sub)
        replies: list[dict] = []
        if cmd == "/start" or (cmd.startswith("/") and cmd not in ("/subscribe", "/unsubscribe", "/list", "/status",
                                                                    "/voice", "/lang")):
            replies.append({"text": UI["start"]})
        elif cmd == "/voice":
            sub.voice = sub.voice is False
            replies.append({"text": UI["voice_on" if sub.voice else "voice_off"]})
        elif cmd == "/lang":  # both languages are always sent now; kept so old habits still work
            replies.append({"text": UI["start"]})
        elif cmd == "/list":
            names = [f"• {db.get(Node, i).name} ({db.get(Node, i).district})" for i in sub.node_ids]
            replies.append({"text": UI["list"].format(names="\n".join(names)) if names else UI["none"]})
        elif cmd == "/status":
            if not sub.node_ids:
                replies.append({"text": UI["none"]})
            for t, v in _status_messages(db, sub, sub.node_ids):
                replies.append({"text": t, "voice": v if sub.voice is not False else ""})
        elif cmd == "/unsubscribe":
            drop = [n.id for n in find(db, arg)["nodes"]] if arg.strip() else list(sub.node_ids)
            names = [db.get(Node, i).name for i in sub.node_ids if i in drop]
            sub.node_ids = [i for i in sub.node_ids if i not in drop]
            replies.append({"text": UI["removed"].format(names=", ".join(names) or "—")})
        else:  # "/subscribe X" or just "X"
            q = arg if cmd == "/subscribe" else raw
            if not q.strip():
                replies.append({"text": UI["start"]})
            else:
                r = find(db, q)
                if r["kind"] == "exact":
                    replies += _subscribe(db, sub, r["nodes"][0].id)
                elif r["kind"] == "district":
                    replies.append({"text": UI["pick_district"].format(district=r["district"]),
                                    "buttons": _buttons(r["nodes"], with_district=False)})
                elif r["kind"] == "suggest":
                    replies.append({"text": UI["pick"], "buttons": _buttons(r["nodes"], with_district=True)})
                else:
                    replies.append({"text": UI["not_found"].format(q=html.escape(q.strip()))})
        db.commit()
        return replies


def _subscribe(db, sub: Subscriber, node_id: str) -> list[dict]:
    node = db.get(Node, node_id)
    sub.node_ids = sorted(set(sub.node_ids) | {node_id})
    sub.active = True
    out = [{"text": UI["subscribed"].format(name=html.escape(node.name), district=html.escape(node.district or ""))}]
    for t, v in _status_messages(db, sub, [node_id]):
        out.append({"text": t, "voice": v if sub.voice is not False else ""})
    return out


def handle_callback(chat_id: int, data: str) -> list[dict]:
    if not data.startswith("s:"):
        return []
    with SessionLocal() as db:
        sub = db.get(Subscriber, chat_id) or Subscriber(chat_id=chat_id, lang="bn", node_ids=[], active=True, voice=True)
        db.add(sub)
        if not db.get(Node, data[2:]):
            return []
        out = _subscribe(db, sub, data[2:])
        db.commit()
        return out


def _deliver(chat_id: int, replies: list[dict]) -> None:
    for r in replies:
        send(chat_id, r["text"], r.get("buttons"))
        if r.get("voice"):
            send_voice(chat_id, r["voice"])


_offset = 0


def poll_updates() -> int:
    """Scheduler job: read new bot messages and button taps (long polling) and answer them."""
    global _offset
    if not settings.telegram_bot_token:
        return 0
    updates = _call("getUpdates", offset=_offset, timeout=25, allowed_updates=["message", "callback_query"])
    for u in updates:
        _offset = u["update_id"] + 1
        try:
            if "callback_query" in u:
                cq = u["callback_query"]
                _call("answerCallbackQuery", callback_query_id=cq["id"])
                _deliver(cq["message"]["chat"]["id"], handle_callback(cq["message"]["chat"]["id"], cq.get("data", "")))
            elif "text" in (msg := u.get("message") or {}):
                _deliver(msg["chat"]["id"], handle_message(msg["chat"]["id"], msg["text"]))
        except Exception:
            log.exception("Telegram reply failed")
    return len(updates)


def setup_bot_profile() -> None:
    """Command menu and descriptions shown in Telegram."""
    cmds = [("status", "এখনকার বন্যার ঝুঁকি / Current flood risk"), ("list", "আপনার উপজেলা / Your upazilas"),
            ("unsubscribe", "উপজেলা বাদ দিন / Remove upazilas"), ("voice", "ভয়েস চালু/বন্ধ / Voice on/off")]
    _call("setMyCommands", commands=[{"command": c, "description": d} for c, d in cmds])
    _call("setMyDescription", description=(
        "দুর্যোগ বার্তা বাংলাদেশ: আপনার উপজেলায় বন্যার ঝুঁকি বাড়লে বাংলা ও ইংরেজিতে লেখা ও ভয়েস বার্তা পাবেন। "
        "Start চেপে শুধু উপজেলা বা জেলার নাম লিখুন।\n\nDurjog Barta Bangladesh: flood early warnings for your upazila "
        "in Bangla and English, with a Bangla voice note. Press Start and send your upazila or district name."))
    _call("setMyShortDescription", short_description="বন্যার আগাম সতর্কবার্তা, বাংলা ও ইংরেজিতে, ভয়েসসহ। Flood early warnings.")
