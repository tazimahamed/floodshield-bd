import sys
from datetime import date
from pathlib import Path
from types import SimpleNamespace as NS

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from app.services import hazard_alerts as ha  # noqa: E402

NODE = NS(id="upz_test", name="Patuakhali Sadar", district="Patuakhali", point_lon=90.35, point_lat=22.35)


def _day(d, t):
    return NS(day=date(2026, 4, d), tmax_c=t)


def test_no_heat_alert_below_moderate():
    assert ha.heat_message(NODE, [_day(20, 36.5), _day(21, 37.9), _day(22, None)]) is None


def test_heat_alert_uses_hottest_day_and_bmd_class():
    text, voice, low = ha.heat_message(NODE, [_day(20, 37.0), _day(21, 40.4), _day(22, 38.2)])
    assert low == 40
    assert "তীব্র তাপপ্রবাহ" in text and "severe heatwave" in text
    assert "৪০°C" in text and "40°C" in text
    assert "সরকারি সতর্কবার্তা নয়" in text  # never sounds like a BMD declaration
    assert "৩৭" not in text.split("দিনগুলো:")[1].split("\n")[0]  # the 37 C day is not listed as a heat day


def _storm(pos, track):
    return {"id": 1, "name": "TEST", "position": pos,
            "track": {"features": [{"properties": {"forecast": True}, "geometry": {"coordinates": track}}]}}


def test_storm_stages():
    far = _storm([88.0, 12.0], [[88.5, 14.0], [89.0, 16.0]])          # far away, track stays far
    assert ha.storm_stage(*ha.storm_distances(far, (NODE.point_lon, NODE.point_lat))) is None
    coming = _storm([88.0, 14.0], [[89.0, 18.0], [90.0, 21.0]])       # track comes within 500 km
    now_km, track_km = ha.storm_distances(coming, (NODE.point_lon, NODE.point_lat))
    assert now_km > 500 and track_km < 500
    assert ha.storm_stage(now_km, track_km) == "storm1"
    close = _storm([90.2, 21.5], [[90.4, 22.5]])                      # within 200 km now
    assert ha.storm_stage(*ha.storm_distances(close, (NODE.point_lon, NODE.point_lat))) == "storm2"


def test_storm_message_is_honest():
    s = _storm([88.0, 14.0], [[89.0, 18.0], [90.0, 21.0]])
    now_km, track_km = ha.storm_distances(s, (NODE.point_lon, NODE.point_lat))
    text, voice = ha.storm_message(s, NODE, "storm1", now_km, track_km)
    for banned in ("নিরাপদ", "safe", "ফুট", "feet", "সংকেত নম্বর"):
        assert banned not in text
    assert "আবহাওয়া অধিদপ্তর" in text and "GDACS" in text and "পথ পরে বদলে যেতে পারে" in text


def test_official_names_table_matches_government_counts():
    from app.services import admin_names
    c = admin_names.counts()
    assert c["official_upazilas"] == 502 and c["areas"] == 544
    assert c["upazilas_on_map"] + len(c["new_upazilas"]) == 502
    assert c["upazilas_on_map"] + c["metro_thanas"] == 544
    sites = [v["gov_site"] for v in admin_names.table()["areas"].values() if v["kind"] == "upazila"]
    assert len(sites) == len(set(sites))  # no official upazila used twice
