"""Official Bangla names for the 544 areas on the map, and what each one is.

Source: the government's list of 502 upazilas (bangladesh.gov.bd/views/upazila-list, read 16 Nov 2026), matched to the
map's areas by name within each district and checked by hand. The map's boundaries are older than that list:
  kind "upazila" = 483 areas that are official upazilas
  kind "metro"   = 61 metropolitan thanas (Dhaka 41, Chattogram 11, Khulna 5, Rajshahi 4); city areas, not upazilas;
                   their Bangla names are from Wikidata, checked by hand
The other 19 official upazilas are newer than the boundaries (e.g. Dasar, Rangabali, Eidgaon) and lie inside older ones.
"""

import json
from functools import lru_cache
from pathlib import Path

FILE = Path(__file__).resolve().parents[1] / "data" / "admin_bn.json"


@lru_cache(maxsize=1)
def table() -> dict:
    return json.loads(FILE.read_text(encoding="utf-8"))


def of(node_id: str) -> dict:
    return table()["areas"].get(node_id, {})


def counts() -> dict:
    a = table()["areas"].values()
    return {"official_upazilas": table()["official_upazilas"], "areas": len(table()["areas"]),
            "upazilas_on_map": sum(1 for v in a if v["kind"] == "upazila"),
            "metro_thanas": sum(1 for v in a if v["kind"] == "metro"),
            "new_upazilas": [{"bn": x["bn"], "district_bn": x["district_bn"]} for x in table()["new_upazilas_without_boundary"]]}


def bn_name(node) -> str:
    """The official Bangla name, or the English one when there is none."""
    return of(node.id).get("bn") or node.name


def place(node) -> str:
    """For messages: 'কলাপাড়া (Kalapara), পটুয়াখালী', so both readers find their upazila."""
    a = of(node.id)
    if not a.get("bn"):
        return f"{node.name}, {node.district or ''}".strip(", ")
    return f"{a['bn']} ({node.name}), {a.get('district_bn') or node.district or ''}".strip(", ")
