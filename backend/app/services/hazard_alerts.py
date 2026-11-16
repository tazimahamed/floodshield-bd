"""Heatwave and cyclone alerts on Telegram, for people already subscribed to an upazila.

HEAT (checked after each daily outlook):
  The GFS forecast of the day's highest temperature for the next 3 days, sorted into the Bangladesh Meteorological
  Department's heatwave classes (36 / 38 / 40 / 42 degrees C). An alert goes out only from moderate (38 C) up: mild
  heat is common in April-May and would make people stop reading. Wording says it is a weather-model forecast in
  BMD's classes, not a BMD declaration. Sent again only if the class rises, or after 24 hours.

CYCLONE (checked every 30 minutes):
  Active storms near Bangladesh from GDACS (EC JRC / UN OCHA; track forecast from JTWC). For each subscribed upazila
  the distance to the storm's current position and to its forecast track is worked out.
    storm1 = the forecast track passes within 500 km of the upazila, or the storm is within 500 km now
    storm2 = the storm itself is within 200 km now
  Each stage goes out once per storm per subscriber. No signal number, surge height or "safe" wording: the official
  signal is BMD's, and the message sends people there.
"""

import html
import logging
import math
from datetime import datetime, timedelta, timezone

from sqlalchemy import select

from app.db.models import AlertLog, Node, Subscriber
from app.db.session import SessionLocal
from app.services import active_storms, admin_names
from app.services.alerts import _bn, _bn_date, send, send_voice
from app.services.outlook import HEAT_LEVELS, heat_level, node_outlook

log = logging.getLogger(__name__)
HEAT_MIN = 38            # BMD "moderate heatwave" and above
HEAT_RANK = {38: 1, 40: 2, 42: 3}
TRACK_KM, NEAR_KM = 500, 200
REPEAT_AFTER = timedelta(hours=24)
BMD = "https://bmd.gov.bd/"
FOOT = ("এটি সহায়ক তথ্য, সরকারি সতর্কবার্তা নয়। আবহাওয়া অধিদপ্তর (BMD) ও উপজেলা প্রশাসনের নির্দেশনা আগে মানুন।",
        "Supporting information, not an official warning. Follow BMD and your upazila administration first.")
HEAT_ADVICE = ("দুপুর ১২টা থেকে ৩টা রোদে কম থাকুন, বারবার পানি পান করুন, শিশু-বয়স্ক-অসুস্থদের খেয়াল রাখুন; মাথা ঘোরা বা "
               "অজ্ঞান হলে ছায়ায় নিয়ে শরীর ভিজিয়ে দিন এবং চিকিৎসা নিন। ☎️ জরুরি ৯৯৯",
               "Stay out of the sun from 12 to 3 pm, drink water often, look after children, elderly and sick people; if "
               "someone feels dizzy or faints, move them to shade, wet their skin and get medical help. ☎️ Emergency 999")
STORM_ADVICE = ("রেডিও/টিভি ও আবহাওয়া অধিদপ্তরের সংকেত শুনুন; কাগজপত্র, ওষুধ, খাবার পানি ও শুকনো খাবার গুছিয়ে রাখুন; "
                "নিকটতম আশ্রয়কেন্দ্র জেনে নিন; প্রশাসন বললে দেরি না করে আশ্রয়কেন্দ্রে যান। ☎️ ৯৯৯ · ১০৯০",
                "Listen to radio/TV and the Met Department's signal; pack papers, medicine, drinking water and dry food; "
                "know your nearest shelter; go to it without delay when the administration says so. ☎️ 999 · 1090")


def _km(a, b) -> float:
    k = math.cos(math.radians((a[1] + b[1]) / 2))
    return math.hypot((a[0] - b[0]) * k * 111.32, (a[1] - b[1]) * 110.57)


def _last(db, chat_id: int, node_id: str, prefix: str) -> AlertLog | None:
    return db.scalars(select(AlertLog).where(AlertLog.chat_id == chat_id, AlertLog.node_id == node_id,
                                             AlertLog.level.like(f"{prefix}%"), AlertLog.status == "sent")
                      .order_by(AlertLog.sent_at.desc()).limit(1)).first()


def _deliver(db, sub: Subscriber, node_id: str, level: str, text: str, voice: str) -> bool:
    entry = AlertLog(chat_id=sub.chat_id, node_id=node_id, level=level, message=text[:4096], status="sent")
    ok = False
    try:
        send(sub.chat_id, text)
        ok = True
        if sub.voice is not False and voice:
            try:
                send_voice(sub.chat_id, voice)
            except Exception as e:
                entry.error = f"voice: {str(e)[:900]}"
    except Exception as e:
        entry.status, entry.error = "failed", str(e)[:1000]
        if "blocked" in str(e) or "chat not found" in str(e):
            sub.active = False
    db.add(entry)
    db.commit()
    return ok


# ---------- heat ----------

def heat_message(node: Node, rows) -> tuple[str, str, int] | None:
    """(text, voice, class lower bound) for the hottest day at or above HEAT_MIN in the next 3 days, else None."""
    hot = [r for r in rows if r.tmax_c is not None and r.tmax_c >= HEAT_MIN]
    if not hot:
        return None
    top = max(hot, key=lambda r: r.tmax_c)
    low = next(lo for lo, _, _ in HEAT_LEVELS if top.tmax_c >= lo)
    bn_word, en_word = heat_level(top.tmax_c)
    t = round(top.tmax_c)
    days_bn = ", ".join(f"{_bn_date(r.day)} ({_bn(round(r.tmax_c))}°)" for r in hot)
    days_en = ", ".join(f"{r.day:%d %b} ({round(r.tmax_c)}°)" for r in hot)
    name = html.escape(admin_names.place(node))
    text = "\n".join([
        f"<b>🌡️ তাপপ্রবাহের আশঙ্কা: {bn_word}</b>", f"📍 {name}",
        f"আবহাওয়া মডেলের (NOAA GFS) পূর্বাভাসে সর্বোচ্চ তাপমাত্রা প্রায় <b>{_bn(t)}°C</b>, যা আবহাওয়া অধিদপ্তরের "
        f"শ্রেণিতে <b>{bn_word}</b>। দিনগুলো: {days_bn}", "", f"<b>✅ করণীয়</b>: {HEAT_ADVICE[0]}", "", f"<i>{FOOT[0]}</i>",
        "", "────────────", "",
        f"<b>🌡️ Heat expected: {en_word}</b>",
        f"The weather model (NOAA GFS) forecasts a high of about <b>{t}°C</b>, which is a <b>{en_word}</b> in the Met "
        f"Department's classes. Days: {days_en}", "", f"<b>✅ What to do</b>: {HEAT_ADVICE[1]}", "", f"<i>{FOOT[1]}</i>",
        f'<a href="{BMD}">BMD</a>'])
    voice = (f"দুর্যোগ বার্তা। {admin_names.bn_name(node)} এলাকায় আগামী কয়েক দিনে তাপমাত্রা প্রায় {t} ডিগ্রি হতে পারে, যা {bn_word}। "
             "দুপুরে রোদে কম থাকুন, বারবার পানি পান করুন, শিশু আর বয়স্কদের খেয়াল রাখুন।")
    return text, voice, low


def dispatch_heat() -> int:
    sent = 0
    now = datetime.now(timezone.utc)
    with SessionLocal() as db:
        for sub in db.scalars(select(Subscriber).where(Subscriber.active)).all():
            for node_id in sub.node_ids:
                node = db.get(Node, node_id)
                msg = node and heat_message(node, node_outlook(db, node_id))
                if not msg:
                    continue
                text, voice, low = msg
                level = f"heat{low}"
                last = _last(db, sub.chat_id, node_id, "heat")
                if last and int(last.level[4:]) >= low and now - last.sent_at < REPEAT_AFTER:
                    continue
                sent += _deliver(db, sub, node_id, level, text, voice)
    log.info("heat alerts sent: %d", sent)
    return sent


# ---------- cyclone ----------

def storm_distances(storm: dict, point: tuple[float, float]) -> tuple[float, float | None]:
    """(km from the storm now, km from the closest point of its forecast track or None)."""
    now = _km(storm["position"][:2], point)
    pts = [c[:2] for f in storm["track"]["features"] if f["properties"].get("forecast")
           for c in f["geometry"]["coordinates"]]
    return now, (min(_km(c, point) for c in pts) if pts else None)


def storm_stage(now_km: float, track_km: float | None) -> str | None:
    if now_km <= NEAR_KM:
        return "storm2"
    if now_km <= TRACK_KM or (track_km is not None and track_km <= TRACK_KM):
        return "storm1"
    return None


def storm_message(storm: dict, node: Node, stage: str, now_km: float, track_km: float | None) -> tuple[str, str]:
    name = html.escape(storm.get("name") or "")
    place = html.escape(admin_names.place(node))
    near = stage == "storm2"
    head_bn = "🌀 ঘূর্ণিঝড় কাছে চলে এসেছে" if near else "🌀 ঘূর্ণিঝড়ের সতর্কতা"
    head_en = "🌀 Cyclone close by" if near else "🌀 Cyclone watch"
    track_bn = f"পূর্বাভাসিত পথ এই উপজেলার সবচেয়ে কাছে প্রায় <b>{_bn(int(round(track_km, -1)))} কিমি</b> দিয়ে যেতে পারে।" if track_km is not None else ""
    track_en = f"Its forecast track passes about <b>{round(track_km, -1):.0f} km</b> from this upazila at its closest." if track_km is not None else ""
    text = "\n".join([
        f"<b>{head_bn}: {name}</b>", f"📍 {place}",
        f"ঝড়টি এখন এই উপজেলা থেকে প্রায় <b>{_bn(int(round(now_km, -1)))} কিমি</b> দূরে। {track_bn}",
        "ঝড়ের পথ পরে বদলে যেতে পারে। কোন সংকেত চলছে, তা আবহাওয়া অধিদপ্তর জানায়।", "",
        f"<b>✅ করণীয়</b>: {STORM_ADVICE[0]}", "", f"<i>{FOOT[0]} তথ্যসূত্র: GDACS, পথের পূর্বাভাস JTWC।</i>",
        "", "────────────", "",
        f"<b>{head_en}: {name}</b>",
        f"The storm is now about <b>{round(now_km, -1):.0f} km</b> from this upazila. {track_en}",
        "Storm tracks can change. The Met Department announces the official signal.", "",
        f"<b>✅ What to do</b>: {STORM_ADVICE[1]}", "", f"<i>{FOOT[1]} Source: GDACS, track forecast by JTWC.</i>",
        f'<a href="{BMD}">BMD</a>'])
    voice = (f"দুর্যোগ বার্তা। ঘূর্ণিঝড় {storm.get('name') or ''} এখন {admin_names.bn_name(node)} থেকে প্রায় {round(now_km, -1):.0f} কিলোমিটার দূরে। "
             "রেডিও আর টিভিতে আবহাওয়া অধিদপ্তরের সংকেত শুনুন। প্রশাসন বললে দেরি না করে আশ্রয়কেন্দ্রে যান।")
    return text, voice


def dispatch_storms(storms: list[dict] | None = None) -> int:
    storms = storms if storms is not None else [s for s in active_storms.active().get("storms", []) if not s.get("test")]
    if not storms:
        return 0
    sent = 0
    with SessionLocal() as db:
        for sub in db.scalars(select(Subscriber).where(Subscriber.active)).all():
            for storm in storms:
                key = f"storm:{storm['id']}"
                # the closest of the person's upazilas decides the stage; one message per stage per storm
                best = None
                for node_id in sub.node_ids:
                    node = db.get(Node, node_id)
                    if not node:
                        continue
                    now_km, track_km = storm_distances(storm, (node.point_lon, node.point_lat))
                    stage = storm_stage(now_km, track_km)
                    if stage and (best is None or now_km < best[2]):
                        best = (node, stage, now_km, track_km)
                if not best:
                    continue
                node, stage, now_km, track_km = best
                done = {r for r in db.scalars(select(AlertLog.level).where(
                    AlertLog.chat_id == sub.chat_id, AlertLog.node_id == key, AlertLog.status == "sent")).all()}
                if stage in done or (stage == "storm1" and "storm2" in done):
                    continue
                text, voice = storm_message(storm, node, stage, now_km, track_km)
                sent += _deliver(db, sub, key, stage, text, voice)
    log.info("storm alerts sent: %d", sent)
    return sent


def safe(fn):
    def run():
        try:
            fn()
        except Exception:
            log.exception("%s failed", fn.__name__)
    run.__name__ = fn.__name__
    return run
