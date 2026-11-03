"""Send a clearly marked TEST alert (built from the latest real forecast) to every subscriber.

Usage (from repo root):  .venv\Scripts\python scripts\telegram_test.py
Subscribe first: open your bot in Telegram, press Start, send /subscribe <upazila>.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from sqlalchemy import select  # noqa: E402

from app.db import models  # noqa: E402,F401
from app.db.models import AlertLog, FloodForecast, FloodForecastRun, Node, Subscriber  # noqa: E402
from app.db.session import Base, SessionLocal, engine  # noqa: E402
from app.services.alerts import _rain, level_for, poll_updates, render, send  # noqa: E402

PREFIX = {"bn": "🧪 পরীক্ষামূলক বার্তা — আসল সতর্কতা নয়\n\n", "en": "🧪 TEST MESSAGE — not a real alert\n\n"}

if __name__ == "__main__":
    Base.metadata.create_all(engine)
    poll_updates()  # pick up /start and /subscribe sent before the server was running
    with SessionLocal() as db:
        run = db.scalars(select(FloodForecastRun).order_by(FloodForecastRun.id.desc()).limit(1)).first()
        subs = db.scalars(select(Subscriber).where(Subscriber.active)).all()
        if not subs:
            sys.exit("No subscribers yet: send /subscribe <upazila> to your bot first.")
        for sub in subs:
            for node_id in sub.node_ids:
                fc = db.scalars(select(FloodForecast).where(FloodForecast.run_id == run.id,
                                                            FloodForecast.node_id == node_id)).first()
                text = PREFIX[sub.lang] + render(level_for(fc.risk, fc.flood_prob), db.get(Node, node_id), fc, run,
                                                 _rain(db, node_id))
                send(sub.chat_id, text)
                db.add(AlertLog(forecast_run_id=run.id, chat_id=sub.chat_id, node_id=node_id, level=level_for(fc.risk, fc.flood_prob),
                                message=text, status="test"))
                print("test alert sent to chat", sub.chat_id, "for", node_id)
        db.commit()
