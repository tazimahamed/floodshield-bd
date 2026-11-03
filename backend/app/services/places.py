"""Find the upazila a person means, the way people actually type it: old or new spellings
(Jessore/Jashore), small typos, district names, or Bangla district names."""

import difflib
import re

from sqlalchemy import select

from app.db.models import Node

# official spelling changes (2018) and common variants -> the names used in our boundary data
ALIASES = {
    "jashore": "jessore", "cumilla": "comilla", "barishal": "barisal", "chattogram": "chittagong",
    "bogura": "bogra", "moulvibazar": "maulvibazar", "brahmanbaria": "brahamanbaria",
    "chapainawabganj": "nawabganj", "chapai nawabganj": "nawabganj", "jhalakathi": "jhalokati",
    "jhalokathi": "jhalokati", "netrokona": "netrakona", "coxsbazar": "cox's bazar", "cox bazar": "cox's bazar",
    "coxs bazar": "cox's bazar", "laxmipur": "lakshmipur", "khagrachari": "khagrachhari",
    "rangamati": "rangamati", "joypurhat": "joypurhat", "jaipurhat": "joypurhat",
}

BANGLA_DISTRICTS = {
    "ঢাকা": "Dhaka", "গাজীপুর": "Gazipur", "নারায়ণগঞ্জ": "Narayanganj", "নরসিংদী": "Narsingdi",
    "মুন্সীগঞ্জ": "Munshiganj", "মানিকগঞ্জ": "Manikganj", "টাঙ্গাইল": "Tangail", "কিশোরগঞ্জ": "Kishoreganj",
    "ফরিদপুর": "Faridpur", "মাদারীপুর": "Madaripur", "শরীয়তপুর": "Shariatpur", "রাজবাড়ী": "Rajbari",
    "গোপালগঞ্জ": "Gopalganj", "ময়মনসিংহ": "Mymensingh", "জামালপুর": "Jamalpur", "শেরপুর": "Sherpur",
    "নেত্রকোনা": "Netrakona", "চট্টগ্রাম": "Chittagong", "কক্সবাজার": "Cox's Bazar", "রাঙ্গামাটি": "Rangamati",
    "বান্দরবান": "Bandarban", "খাগড়াছড়ি": "Khagrachhari", "কুমিল্লা": "Comilla",
    "ব্রাহ্মণবাড়িয়া": "Brahamanbaria", "চাঁদপুর": "Chandpur", "ফেনী": "Feni", "নোয়াখালী": "Noakhali",
    "লক্ষ্মীপুর": "Lakshmipur", "সিলেট": "Sylhet", "সুনামগঞ্জ": "Sunamganj", "হবিগঞ্জ": "Habiganj",
    "মৌলভীবাজার": "Maulvibazar", "রাজশাহী": "Rajshahi", "নাটোর": "Natore", "নওগাঁ": "Naogaon",
    "চাঁপাইনবাবগঞ্জ": "Nawabganj", "পাবনা": "Pabna", "সিরাজগঞ্জ": "Sirajganj", "বগুড়া": "Bogra",
    "জয়পুরহাট": "Joypurhat", "রংপুর": "Rangpur", "দিনাজপুর": "Dinajpur", "ঠাকুরগাঁও": "Thakurgaon",
    "পঞ্চগড়": "Panchagarh", "নীলফামারী": "Nilphamari", "লালমনিরহাট": "Lalmonirhat", "কুড়িগ্রাম": "Kurigram",
    "গাইবান্ধা": "Gaibandha", "খুলনা": "Khulna", "বাগেরহাট": "Bagerhat", "সাতক্ষীরা": "Satkhira",
    "যশোর": "Jessore", "নড়াইল": "Narail", "মাগুরা": "Magura", "ঝিনাইদহ": "Jhenaidah", "কুষ্টিয়া": "Kushtia",
    "চুয়াডাঙ্গা": "Chuadanga", "মেহেরপুর": "Meherpur", "বরিশাল": "Barisal", "ভোলা": "Bhola",
    "পটুয়াখালী": "Patuakhali", "বরগুনা": "Barguna", "পিরোজপুর": "Pirojpur", "ঝালকাঠি": "Jhalokati",
}


def norm(s: str) -> str:
    s = re.sub(r"\b(upazila|upozila|thana|zila|zilla|district|sadar)\b", " ", s.lower())
    s = re.sub(r"[^a-zঀ-৿' ]", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return ALIASES.get(s, ALIASES.get(s.replace(" ", ""), s))


def find(db, query: str) -> dict:
    """Returns {"kind": "exact"|"district"|"suggest"|"none", "nodes": [...], "district": str|None}."""
    raw = query.strip()
    upz = db.scalars(select(Node).where(Node.node_type == "upazila").order_by(Node.district, Node.name)).all()
    bangla_district = next((en for bn, en in BANGLA_DISTRICTS.items() if bn in raw), None)
    q = norm(raw)
    if bangla_district:
        q = bangla_district.lower()
    if not q:
        return {"kind": "none", "nodes": [], "district": None}

    districts = {n.district.lower(): n.district for n in upz if n.district}
    wants_sadar = "sadar" in raw.lower()
    if q in districts and not wants_sadar:  # a district: let the person pick its upazila
        d = districts[q]
        return {"kind": "district", "nodes": [n for n in upz if n.district == d], "district": d}
    by_name = [n for n in upz if norm(n.name) == q or n.name.lower() == raw.lower()]
    if len(by_name) == 1:
        return {"kind": "exact", "nodes": by_name, "district": None}
    if by_name:  # same upazila name in several districts (e.g. Kotwali)
        return {"kind": "suggest", "nodes": by_name, "district": None}

    contains = [n for n in upz if len(q) >= 4 and q in norm(n.name)]
    if len(contains) == 1:
        return {"kind": "exact", "nodes": contains, "district": None}
    if contains:
        return {"kind": "suggest", "nodes": contains[:12], "district": None}

    # spelling mistakes: closest upazila or district names
    names = {norm(n.name): n for n in upz}
    close = difflib.get_close_matches(q, list(dict.fromkeys(list(districts) + list(names))), n=6, cutoff=0.72)
    if close and close[0] in districts:
        d = districts[close[0]]
        return {"kind": "district", "nodes": [n for n in upz if n.district == d], "district": d}
    nodes = list(dict.fromkeys(names[c] for c in close if c in names))
    return {"kind": "suggest" if nodes else "none", "nodes": nodes, "district": None}
