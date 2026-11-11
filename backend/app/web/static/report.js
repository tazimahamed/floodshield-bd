/* FloodShield BD — upazila flood report */
const T = {
  en: {
    back: "← Map", calTitle: "Flood calendar, 2017 to today",
    calSub: "Each box is a 15-day stretch of the year, starting on the date above it. The water in each box and the number show how much of the upazila the satellite saw under unusual flood water. Sand-coloured boxes: almost none (under 0.5%). Striped boxes: no satellite picture for that fortnight. Red boxes were floods.",
    rainTitle: "What brings floods here", monsoonTitle: "Monsoon rain each year", monsoonSub: "June to September, this upazila.",
    cycTitle: "🌀 Cyclones that passed close by",
    navOverview: "Overview", navCalendar: "Flood calendar", navRain: "Rain", navCyc: "Cyclones",
    about: "ⓘ About the data", print: "🖨 Print / PDF", notOfficial: "Supporting information, not an official warning. River levels and local waterlogging are not included in this estimate. Follow FFWC, BMD and your upazila administration first.",
    csv: "⬇ CSV",
    crumb: (d, v) => `${d} district · ${v} division`,
    lead: (n, total, oneIn) => n
      ? `Since 2017, unusual flood water covered part of this upazila in <b>${n} of ${total}</b> fortnights checked by satellite — about <b>1 in ${oneIn}</b>.`
      : `Since 2017 the satellite saw no unusual flooding here in any of ${total} fortnights it checked.`,
    nowTitle: "Next 15 days", risk: { low: "Low risk", medium: "Medium risk", high: "High risk" },
    chance: p => `Estimated ${p}% chance of flooding`,
    tFloods: "Floods since 2017", tFloodsD: (n, total) => `${n} of ${total} fortnights checked`,
    tWorst: "Worst flood seen", tWorstD: (pct, km2) => `${pct}% of the upazila · ${km2} km²`, tNoFlood: "None seen",
    tWater: "Water comes from", tWaterD: o => o > 0 ? `${nf(o)}% of that area is in India / upstream` : "all of it inside Bangladesh",
    before: "Before floods", normal: "Normal times",
    story: (f, n, low, up) => `Floods here have usually come after about <b>${f} mm</b> of rain in two weeks. In normal half-months it was about ${n} mm. The least rain that was still followed by a flood was ${low} mm.${up ? ` Upstream, rain before floods was about ${up} mm.` : ""}`,
    noStory: "There were no floods here in the satellite record, so there is no rain pattern to show.",
    legendLow: "little", legendHigh: "more water", legendDry: "almost none", legendNoImg: "no picture",
    tipRange: (a, b) => `${a} – ${b}`, tipWater: p => `Unusual water: ${p}% of the upazila`,
    tipRain: (b, u) => `Rain in the 2 weeks before: ${b} mm (upstream ${u} mm)`, tipFlood: "Flood",
    cycSummary: (n50, n150) => `Since 1960, <b>${n50}</b> cyclone or depression centres passed within 50 km of this upazila, and ${n150} within 150 km.`,
    cycItem: (km, kmh) => `${km} km away${kmh ? ` · ${kmh} km/h` : ""}`,
    months: ["Jun", "Jul", "Aug", "Sep"], halves: ["1–15", "16–30"], notFound: "Upazila not found", mm: "mm",
    navMap: "Map", mapTitle: "What is where", mapSub: "Roads, place names, rivers and hospitals on real ground.",
    hintClick: "Click the map to move and zoom it", hintTap: "Tap the map to move it", baseSat: "Satellite", baseMap: "Map",
    mapSrc: "Satellite, roads and place names: Esri · Relief: Mapzen Terrain Tiles (AWS), height shown 4× taller · Rivers: HydroSHEDS · Hospitals: DGHS registry · Roads, rivers and canals: OpenStreetMap via OpenFreeMap (small khals may be missing) · Rain and wind: Open-Meteo, right now, checked every 10 minutes. Rain and wind move only when there really is rain or wind; they show how strong and which way, not where each drop falls.",
    tgBtn: "Get flood alerts for this upazila on Telegram", ffwcBtn: "Official river levels (FFWC) ↗", wxBtn: "Rain & wind", lgFlow: "Light moving on rivers and canals shows which way the water flows",
    wxRain: v => `Rain likely now: about ${v} mm/h`, wxDry: "No rain now, the models say", wxWind: (v, d, g) => `Wind ${v} km/h from the ${d}, gusts ${g}`, wxCalm: "Calm, almost no wind",
    wxAt: tm => `updated ${tm} · Open-Meteo`,
    lgRaised: "This upazila is drawn raised so it stands out; it is not really higher",
    wxCloud: p => `Cloud over ${p}% of the sky`, wx24: v => `Last 24 hours: ${v} mm of rain`,
    wxHourRain: v => `Rain likely in that hour: about ${v} mm`, wxHourDry: "No rain in that hour, the models say", wxAtHour: d => `🕒 ${d}`,
    wxAgree: (n, of) => `${n} of ${of} weather models agree`, wxMaybe: of => `Rain not certain: only 1 of ${of} weather models shows any`,
    wxReplay: "Replay the last 24 hours", wxLive: "Now",
    wxNote: "Rain, wind and cloud are estimates from weather models (ECMWF, GFS and ICON, through Open-Meteo), not measurements from a rain gauge here. Rain is shown only when at least two of the three models agree. A short local shower can still be missed, so look outside too.",
    dirs: ["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"],
    lgBoundary: "Upazila boundary", lgRivers: n => `Rivers and streams (${n} stretches)`, lgNoRivers: "No large river mapped inside",
    lgHosp: n => `Government hospitals (${n})`, lgNoHosp: "No government hospital with a checked location here", lgRelief: "Hills and high ground",
    popBeds: b => `${b} beds`, popProfile: "Open in DGHS registry ↗",
    rainNowTitle: "Rain: last 3 days and next 3 days", rainNowSub: "Hour by hour, from the NOAA GFS forecast for this upazila.",
    keyPast: "Already fell", keyNext: "Forecast", keyCum: "Running total", nowMark: "Now",
    sPast: "Last 3 days", sNext: "Next 3 days", sPeak: "Heaviest hour ahead", sPeakNone: "No rain expected", mmh: "mm/h",
    noRain: "No rainfall forecast is available right now.",
    tRainNext: "Rain, next 3 days", tRainNextD: "NOAA GFS forecast", tRainPast: "Rain, last 3 days", tRainPastD: "Same source, already fallen",
    upBefore: "Upstream, before floods", gaugeCap: "Rain that fell in the two weeks before, typical (median) amount",
    cats: ["Depression", "Deep depression", "Cyclone", "Severe cyclone", "Very severe cyclone", "Extremely severe cyclone", "Super cyclone"],
    cycWindAt: v => `wind ${v} km/h`, cycNoWindAt: "wind not recorded", cycReplay: "↻ Replay",
    cycMapSrc: "Real storm paths from NOAA IBTrACS (Indian Meteorological Department best track), one point every 6 hours. The colour shows how strong the storm was at that point. The yellow outline is this upazila.",
  },
  bn: {
    back: "← ম্যাপ", calTitle: "বন্যার ক্যালেন্ডার, ২০১৭ থেকে আজ পর্যন্ত",
    calSub: "প্রতিটি ঘর বছরের ১৫ দিনের একটি সময়, উপরে লেখা তারিখ থেকে শুরু। ঘরের পানি ও সংখ্যাটি দেখায় স্যাটেলাইটে উপজেলার কতটা অংশ অস্বাভাবিক বন্যার পানির নিচে দেখা গেছে। বালু রঙের ঘর: প্রায় নেই (০.৫%-এর কম)। ডোরাকাটা ঘর: ওই পাক্ষিকে স্যাটেলাইটের ছবি নেই। লাল ঘর মানে বন্যা।",
    rainTitle: "এখানে বন্যা কখন হয়", monsoonTitle: "প্রতি বছর বর্ষার বৃষ্টি", monsoonSub: "জুন থেকে সেপ্টেম্বর, এই উপজেলায়।",
    cycTitle: "🌀 কাছ দিয়ে যাওয়া ঘূর্ণিঝড়",
    navOverview: "সারসংক্ষেপ", navCalendar: "বন্যার ক্যালেন্ডার", navRain: "বৃষ্টি", navCyc: "ঘূর্ণিঝড়",
    about: "ⓘ ডেটা সম্পর্কে", print: "🖨 প্রিন্ট / PDF", notOfficial: "এটি সহায়ক তথ্য, সরকারি সতর্কবার্তা নয়। নদীর পানির স্তর ও স্থানীয় জলাবদ্ধতা এই হিসাবে নেই। FFWC, আবহাওয়া অধিদপ্তর ও উপজেলা প্রশাসনের নির্দেশনা আগে মানুন।",
    csv: "⬇ CSV",
    crumb: (d, v) => `${d} জেলা · ${v} বিভাগ`,
    lead: (n, total, oneIn) => n
      ? `২০১৭ থেকে স্যাটেলাইটে দেখা <b>${total}টি পাক্ষিকের ${n}টিতে</b> এই উপজেলার একাংশ অস্বাভাবিক বন্যার পানিতে ডুবেছে — মোটামুটি <b>প্রতি ${oneIn}টিতে ১টি</b>।`
      : `২০১৭ থেকে স্যাটেলাইটে দেখা ${total}টি পাক্ষিকের কোনোটিতেই এখানে অস্বাভাবিক বন্যা দেখা যায়নি।`,
    nowTitle: "আগামী ১৫ দিন", risk: { low: "নিম্ন ঝুঁকি", medium: "মাঝারি ঝুঁকি", high: "উচ্চ ঝুঁকি" },
    chance: p => `বন্যার আনুমানিক সম্ভাবনা ${p}%`,
    tFloods: "২০১৭ থেকে বন্যা", tFloodsD: (n, total) => `দেখা ${total}টি পাক্ষিকের ${n}টিতে`,
    tWorst: "সবচেয়ে বড় বন্যা", tWorstD: (pct, km2) => `উপজেলার ${pct}% · ${km2} বর্গকিমি`, tNoFlood: "দেখা যায়নি",
    tWater: "পানি আসে", tWaterD: o => o > 0 ? `এর ${nf(o)}% এলাকা ভারতে / উজানে` : "পুরোটাই বাংলাদেশের ভেতর থেকে",
    before: "বন্যার আগে", normal: "স্বাভাবিক সময়ে",
    story: (f, n, low, up) => `এখানে সাধারণত দুই সপ্তাহে প্রায় <b>${f} মিমি</b> বৃষ্টির পরে বন্যা হয়েছে। স্বাভাবিক সময়ে তা ছিল প্রায় ${n} মিমি। সবচেয়ে কম যে বৃষ্টির পরেও বন্যা হয়েছে: ${low} মিমি।${up ? ` উজানে বন্যার আগে বৃষ্টি ছিল প্রায় ${up} মিমি।` : ""}`,
    noStory: "স্যাটেলাইটের রেকর্ডে এখানে কোনো বন্যা নেই, তাই বৃষ্টির ধরন দেখানো সম্ভব নয়।",
    legendLow: "কম", legendHigh: "বেশি পানি", legendDry: "প্রায় নেই", legendNoImg: "ছবি নেই",
    tipRange: (a, b) => `${a} – ${b}`, tipWater: p => `অস্বাভাবিক পানি: উপজেলার ${p}%`,
    tipRain: (b, u) => `আগের ২ সপ্তাহে বৃষ্টি: ${b} মিমি (উজানে ${u} মিমি)`, tipFlood: "বন্যা",
    cycSummary: (n50, n150) => `১৯৬০ থেকে <b>${n50}</b>টি ঘূর্ণিঝড় বা নিম্নচাপের কেন্দ্র এই উপজেলার ৫০ কিমির মধ্যে দিয়ে গেছে, আর ${n150}টি ১৫০ কিমির মধ্যে দিয়ে।`,
    cycItem: (km, kmh) => `${km} কিমি দূরে${kmh ? ` · ${kmh} কিমি/ঘণ্টা` : ""}`,
    months: ["জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর"], halves: ["১–১৫", "১৬–৩০"], notFound: "উপজেলা পাওয়া যায়নি", mm: "মিমি",
    navMap: "ম্যাপ", mapTitle: "কোথায় কী আছে", mapSub: "আসল জমির উপর রাস্তা, জায়গার নাম, নদী ও হাসপাতাল।",
    hintClick: "ম্যাপ নাড়াতে ও জুম করতে একবার ক্লিক করুন", hintTap: "ম্যাপ নাড়াতে একবার ট্যাপ করুন", baseSat: "স্যাটেলাইট", baseMap: "ম্যাপ",
    mapSrc: "স্যাটেলাইট, রাস্তা ও জায়গার নাম: Esri · উঁচু-নিচু: Mapzen Terrain Tiles (AWS), উচ্চতা ৪ গুণ বাড়িয়ে দেখানো · নদী: HydroSHEDS · হাসপাতাল: স্বাস্থ্য অধিদপ্তরের রেজিস্ট্রি · রাস্তা, নদী ও খাল: OpenStreetMap (OpenFreeMap-এর মাধ্যমে), ছোট খাল বাদ থাকতে পারে · বৃষ্টি ও বাতাস: Open-Meteo, এই মুহূর্তের, প্রতি ১০ মিনিটে মিলিয়ে নেওয়া হয়। সত্যিই বৃষ্টি বা বাতাস থাকলে তবেই নড়ে; কতটা জোরে ও কোন দিকে তা দেখায়, ঠিক কোথায় ফোঁটা পড়ছে তা নয়।",
    tgBtn: "এই উপজেলার বন্যা সতর্কবার্তা Telegram-এ পান", ffwcBtn: "সরকারি নদীর পানির স্তর (FFWC) ↗", wxBtn: "বৃষ্টি ও বাতাস", lgFlow: "নদী ও খালের উপর চলমান আলো দেখায় পানি কোন দিকে বইছে",
    wxRain: v => `এখন সম্ভবত বৃষ্টি হচ্ছে: প্রায় ${v} মিমি/ঘণ্টা`, wxDry: "মডেল অনুযায়ী এখন বৃষ্টি নেই", wxWind: (v, d, g) => `বাতাস ${v} কিমি/ঘণ্টা, ${d} দিক থেকে, দমকা ${g}`, wxCalm: "বাতাস প্রায় নেই",
    wxAt: tm => `হালনাগাদ ${tm} · Open-Meteo`,
    lgRaised: "চেনার সুবিধার জন্য উপজেলাটি উঁচু করে আঁকা; আসলে এটি উঁচু নয়",
    wxCloud: p => `আকাশের ${p}% মেঘে ঢাকা`, wx24: v => `গত ২৪ ঘণ্টায় বৃষ্টি: ${v} মিমি`,
    wxHourRain: v => `ওই ঘণ্টায় সম্ভবত বৃষ্টি: প্রায় ${v} মিমি`, wxHourDry: "মডেল অনুযায়ী ওই ঘণ্টায় বৃষ্টি হয়নি", wxAtHour: d => `🕒 ${d}`,
    wxAgree: (n, of) => `${of}টি আবহাওয়া মডেলের ${n}টি একমত`, wxMaybe: of => `বৃষ্টি নিশ্চিত নয়: ${of}টি মডেলের মাত্র ১টিতে বৃষ্টি আছে`,
    wxReplay: "গত ২৪ ঘণ্টা আবার দেখুন", wxLive: "এখন",
    wxNote: "বৃষ্টি, বাতাস ও মেঘ আবহাওয়া মডেলের (ECMWF, GFS ও ICON, Open-Meteo-র মাধ্যমে) হিসাব, এখানকার বৃষ্টি মাপার যন্ত্রের মাপ নয়। তিনটি মডেলের অন্তত দুটি একমত হলে তবেই বৃষ্টি দেখানো হয়। তবু অল্প সময়ের স্থানীয় বৃষ্টি বাদ পড়তে পারে, তাই নিজেও বাইরে দেখে নিন।",
    dirs: ["উত্তর", "উত্তর-পূর্ব", "পূর্ব", "দক্ষিণ-পূর্ব", "দক্ষিণ", "দক্ষিণ-পশ্চিম", "পশ্চিম", "উত্তর-পশ্চিম"],
    lgBoundary: "উপজেলার সীমানা", lgRivers: n => `নদী ও খাল (${n}টি অংশ)`, lgNoRivers: "ভেতরে বড় কোনো নদী ম্যাপে নেই",
    lgHosp: n => `সরকারি হাসপাতাল (${n}টি)`, lgNoHosp: "যাচাই করা অবস্থানসহ কোনো সরকারি হাসপাতাল নেই", lgRelief: "পাহাড় ও উঁচু জমি",
    popBeds: b => `${b}টি শয্যা`, popProfile: "স্বাস্থ্য অধিদপ্তরের রেজিস্ট্রিতে দেখুন ↗",
    rainNowTitle: "বৃষ্টি: গত ৩ দিন ও আগামী ৩ দিন", rainNowSub: "ঘণ্টা ধরে, এই উপজেলার জন্য NOAA GFS পূর্বাভাস থেকে।",
    keyPast: "হয়ে গেছে", keyNext: "পূর্বাভাস", keyCum: "মোট জমা", nowMark: "এখন",
    sPast: "গত ৩ দিন", sNext: "আগামী ৩ দিন", sPeak: "সামনে সবচেয়ে ভারী ঘণ্টা", sPeakNone: "বৃষ্টির সম্ভাবনা নেই", mmh: "মিমি/ঘণ্টা",
    noRain: "এই মুহূর্তে বৃষ্টির পূর্বাভাস পাওয়া যাচ্ছে না।",
    tRainNext: "বৃষ্টি, আগামী ৩ দিন", tRainNextD: "NOAA GFS পূর্বাভাস", tRainPast: "বৃষ্টি, গত ৩ দিন", tRainPastD: "একই উৎস, হয়ে গেছে",
    upBefore: "উজানে, বন্যার আগে", gaugeCap: "আগের দুই সপ্তাহে যতটা বৃষ্টি হয়েছিল, সাধারণ (মধ্যমা) পরিমাণ",
    cats: ["নিম্নচাপ", "গভীর নিম্নচাপ", "ঘূর্ণিঝড়", "প্রবল ঘূর্ণিঝড়", "অতি প্রবল ঘূর্ণিঝড়", "অত্যন্ত প্রবল ঘূর্ণিঝড়", "সুপার সাইক্লোন"],
    cycWindAt: v => `বাতাস ${v} কিমি/ঘণ্টা`, cycNoWindAt: "বাতাসের রেকর্ড নেই", cycReplay: "↻ আবার দেখুন",
    cycMapSrc: "ঝড়ের আসল পথ, NOAA IBTrACS (ভারতীয় আবহাওয়া অধিদপ্তরের best track) থেকে, প্রতি ৬ ঘণ্টায় একটি বিন্দু। রঙ দেখায় ওই জায়গায় ঝড় কত শক্তিশালী ছিল। হলুদ রেখা এই উপজেলা।",
  },
};
let lang = "en", R = null, CY = null, nodeId = null, RAIN = null, RS = null, MAPINFO = null, MAP = null;
const svg = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const ICON = {
  wave: svg('<path d="M2 15c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 6 0"/><path d="M2 19c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 6 0"/><path d="M12 3c2.5 3.5 4 5.6 4 7.3a4 4 0 0 1-8 0C8 8.6 9.5 6.5 12 3z"/>'),
  cal: svg('<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/><path d="M8 14h2M14 14h2M8 17h2"/>'),
  drop: svg('<path d="M12 3c3.5 4.6 6 7.9 6 11a6 6 0 0 1-12 0c0-3.1 2.5-6.4 6-11z"/><path d="M9.5 15.5a2.7 2.7 0 0 0 2.5 2"/>'),
  cloud: svg('<path d="M7 16a4.5 4.5 0 1 1 1.2-8.8A5.5 5.5 0 0 1 18.6 9 3.5 3.5 0 0 1 18 16H7z"/><path d="M8 19l-1 2M12 19l-1 2M16 19l-1 2"/>'),
  bars: svg('<path d="M4 20V11M9.3 20V5M14.6 20v-7M20 20V8"/>'),
};
const RISK_COLOR = { low: "#2e9e5b", medium: "#d98a00", high: "#d4382a" };
const esc = s => String(s ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
try { lang = localStorage.getItem("fs-lang") || "en"; } catch (e) {}
const $ = id => document.getElementById(id);
const t = () => T[lang];
const loc = () => lang === "bn" ? "bn-BD" : "en-GB";
const nf = (v, d = 0) => v == null ? "–" : Number(v).toLocaleString(loc(), { maximumFractionDigits: d });
const yearNum = y => String(y).replace(/\d/g, d => lang === "bn" ? "০১২৩৪৫৬৭৮৯"[d] : d);
const monthYear = iso => new Date(iso).toLocaleDateString(loc(), { month: "long", year: "numeric" });
const dayMonth = iso => new Date(iso).toLocaleDateString(loc(), { day: "numeric", month: "short" });
// unusual-water scale for the calendar (share of the upazila, %)
const CAL = [[0.5, "#e8eef3"], [2, "#a9cfee"], [5, "#5fa8de"], [10, "#f08a5d"], [20, "#d9472b"], [101, "#8f1420"]];
const calColor = p => CAL.find(([max]) => p < max)[1];
const CAT_KT = [17, 28, 34, 48, 64, 90, 120];
const CAT_COLORS = ["#7fd0a8", "#3fb6a8", "#f2d43a", "#f39a2b", "#e8562c", "#c41d4a", "#7b1fa2"];
const catColor = kt => kt == null ? "#9aa5ae" : CAT_COLORS[CAT_KT.filter(k => kt >= k).length - 1] || "#9aa5ae";

function renderCalendar() {
  // the monsoon windows are fixed 15-day blocks from 1 June (1 Jun, 16 Jun, 1 Jul, 16 Jul, 31 Jul, ...),
  // so each year has the same eight columns; place them by order, not by calendar half-month
  // windows are 15-day blocks from 2 January; place each by its date, so a fortnight with no satellite
  // picture leaves its own box empty instead of shifting the rest of the year one box to the left
  const tt = t(), byYear = {}, cols = 24;
  const col = iso => { const d = new Date(iso + "T00:00:00Z"), doy = (d - Date.UTC(d.getUTCFullYear(), 0, 1)) / 864e5 + 1; return Math.max(0, Math.min(cols - 1, Math.round((doy - 2) / 15))); };
  R.history.forEach((h, idx) => { (byYear[h.start.slice(0, 4)] ??= [])[col(h.start)] = idx; });
  const years = Object.keys(byYear).sort((a, b) => b - a);
  const today = new Date().toISOString().slice(0, 10);
  const head = `<tr><th></th>${[...Array(cols).keys()].map(k => `<th>${dayMonth(new Date(Date.UTC(2026, 0, 2 + k * 15)).toISOString())}</th>`).join("")}</tr>`;
  $("cal").innerHTML = head + years.map(y => `<tr><th class="yr">${yearNum(y)}</th>${[...Array(cols).keys()].map(k => {
    const idx = byYear[y][k];
    if (idx == null) {  // not yet happened, or no satellite picture for that fortnight
      const startIso = new Date(Date.UTC(+y, 0, 2 + k * 15)).toISOString().slice(0, 10);
      return startIso > today ? `<td class="future"></td>` : `<td class="noimg" title="${tt.legendNoImg}"></td>`;
    }
    const h = R.history[idx], p = h.flooded_pct;
    const d = (years.indexOf(y) * cols + k) * 12;
    if (p < 0.5 && !h.flooded) return `<td class="dry" style="animation-delay:${d}ms" data-i="${idx}"></td>`;
    // each box fills with water to how much of the upazila was under unusual water (full at 20% or more)
    const lvl = h.flooded ? 100 : Math.min(100, 14 + p * 4.3);
    return `<td class="w${h.flooded ? " flood" : ""}" style="--wc:${calColor(p)};--lvl:${lvl.toFixed(0)}%;--d:${d}ms;animation-delay:${d}ms" data-i="${idx}"><span>${nf(p, p < 10 ? 1 : 0)}%</span></td>`;
  }).join("")}</tr>`).join("");
  $("cal-legend").innerHTML = `<span class="lg-k"><i class="dry"></i>${tt.legendDry}</span><span class="lg-k">${tt.legendLow} ${CAL.slice(1).map(([, c]) => `<i style="background:${c}"></i>`).join("")} ${tt.legendHigh}</span><span class="lg-k"><i class="noimg"></i>${tt.legendNoImg}</span>`;
  document.querySelectorAll(".cal td[data-i]").forEach(td => {
    td.onmouseenter = e => showTip(e, R.history[+td.dataset.i]);
    td.onmousemove = moveTip;
    td.onmouseleave = () => $("tip").hidden = true;
  });
}

function showTip(e, h) {
  const tt = t();
  $("tip").innerHTML = `<b>${tt.tipRange(dayMonth(h.start), dayMonth(h.end))} ${yearNum(new Date(h.start).getFullYear())}</b>${h.flooded ? ` · ${tt.tipFlood}` : ""}<br>
    ${tt.tipWater(nf(h.flooded_pct, 1))}<br>${tt.tipRain(nf(h.rain_local_15d_before), nf(h.rain_up_15d_before))}`;
  $("tip").hidden = false;
  moveTip(e);
}
function moveTip(e) {
  const tip = $("tip");
  tip.style.left = Math.min(innerWidth - tip.offsetWidth - 10, e.clientX + 14) + "px";
  tip.style.top = (e.clientY + 16) + "px";
}

function renderRainStory() {
  const tt = t(), s = R.summary;
  if (!s || !s.flooded_windows) { $("rain-story").innerHTML = `<p class="story">${tt.noStory}</p>`; return; }
  const f = s.median_rain_local_15d_before.flooded, n = s.median_rain_local_15d_before.not_flooded;
  const up = R.node.outside_bd_pct > 0 ? s.median_rain_up_15d_before.flooded : null;
  const max = Math.max(f, n, up || 0, 1);
  // rain gauges: each tube fills to the typical two-week rain total, with drops falling into it
  const gauge = (label, v, c, i) => `<div class="rg" style="--c:${c};--h:${Math.max(4, v / max * 86).toFixed(1)}%;--i:${i}">
      <b class="rg-v">${nf(v)} <small>${tt.mm}</small></b>
      <div class="rg-tube"><div class="rg-water"><i class="rg-crest"></i></div><span class="rg-drop"></span><span class="rg-drop"></span><span class="rg-drop"></span></div>
      <small class="rg-l">${label}</small></div>`;
  $("rain-story").innerHTML = `<div class="rgs">${gauge(tt.before, f, "#d9472b", 0)}${gauge(tt.normal, n, "#3b9ad6", 1)}${up ? gauge(tt.upBefore, up, "#7c5cd6", 2) : ""}</div>
    <p class="rg-cap">${tt.gaugeCap}</p>
    <p class="story">${tt.story(nf(f), nf(n), nf(s.lowest_rain_local_15d_before_a_flood), up != null ? nf(up) : null)}</p>`;
}

function renderMonsoon() {
  const max = Math.max(1, ...R.monsoon_rain.map(r => r.local_mm || 0));
  $("monsoon").innerHTML = [...R.monsoon_rain].reverse().map(r => `<div class="row"><span>${yearNum(r.year)}</span>
    <div class="track"><div class="fill" style="width:${((r.local_mm || 0) / max) * 100}%"></div></div>
    <span class="v">${nf(r.local_mm)} ${t().mm}</span></div>`).join("");
}

function renderCyclones() {
  const tt = t();
  const box = $("cyclones");
  box.hidden = !CY || !CY.within_150km;
  $("nav-cyc").hidden = box.hidden;
  if (box.hidden) return;
  const top = topCyclones();
  $("cyc").innerHTML = `<p class="story">${tt.cycSummary(nf(CY.within_50km), nf(CY.within_150km))}</p>` + (top.length ? `<ul class="cyc-list">${top.map((c, i) =>
    `<li style="--c:${catColor(c.max_wind_kt)}" data-k="${i}" tabindex="0" role="button"><span class="cyc-spin" aria-hidden="true">${CYC_SVG}</span>
      <b>${stormName(c)}</b><em>${tt.cats[catIdx(c.max_wind_kt)] || ""}</em><span>${tt.cycItem(nf(c.min_km), nf(Math.round(c.max_wind_kt * 1.852)))}</span></li>`).join("")}</ul>` : "");
  document.querySelectorAll(".cyc-list li").forEach(li => {
    const go = () => CYCM && CYCM.play(+li.dataset.k);
    li.onclick = go; li.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } };
  });
  $("cyc-src").textContent = tt.cycMapSrc;
  $("cyc-replay").textContent = tt.cycReplay;
  if (CYCM) CYCM.relabel();
}
const topCyclones = () => CY.cyclones.filter(c => c.max_wind_kt && c.min_km <= 100).sort((a, b) => b.max_wind_kt - a.max_wind_kt).slice(0, 3);
const catIdx = kt => kt == null ? -1 : CAT_KT.filter(k => kt >= k).length - 1;
const stormName = c => c.name === "Unnamed" ? (lang === "bn" ? `${yearNum(c.season)}-এর ঘূর্ণিঝড়` : `${c.season} cyclone`) : `${c.name} ${yearNum(c.season)}`;
const CYC_SVG = `<svg viewBox="0 0 40 40"><path d="M20 4c-6 0-10 3-12 7 4-3 9-3 12 0 3 3 3 8 0 11a8 8 0 0 1-3 2c6 1 13-3 14-10 0-6-5-10-11-10z" fill="currentColor"/><path d="M20 36c6 0 10-3 12-7-4 3-9 3-12 0-3-3-3-8 0-11a8 8 0 0 1 3-2c-6-1-13 3-14 10 0 6 5 10 11 10z" fill="currentColor" opacity=".75"/><circle cx="20" cy="20" r="3.2" fill="#fff"/></svg>`;

/* replay the real paths of the strongest storms that came close, one after another */
let CYCM = null;
async function cycMap() {
  const wrap = $("cyc-map-wrap"), top = CY && CY.within_150km ? topCyclones() : [];
  if (!top.length || !window.maplibregl || !hasWebGL()) { wrap.hidden = true; return; }
  const [shape, ...storms] = await Promise.all([
    fetch(`/api/v1/nodes/${nodeId}/shape`).then(r => r.ok ? r.json() : null),
    ...top.map(c => fetch(`/api/v1/cyclones/${encodeURIComponent(c.sid)}`).then(r => r.ok ? r.json() : null).catch(() => null)),
  ]);
  const S = storms.map((s, i) => s && s.points.length > 1 ? { info: top[i], pts: s.points } : null);
  if (!S.some(Boolean)) { wrap.hidden = true; return; }
  wrap.hidden = false;
  const xs = [], ys = [];
  // frame the Bay of Bengal only: storms born far away (some start in the Pacific) enter from the edge
  S.forEach(s => s && s.pts.forEach(p => { if (p.lon >= 80 && p.lon <= 97.5 && p.lat >= 5 && p.lat <= 28) { xs.push(p.lon); ys.push(p.lat); } }));
  if (shape) outerRings(shape.geometry).forEach(r => r.forEach(([x, y]) => { xs.push(x); ys.push(y); }));
  const bounds = [[Math.min(...xs), Math.min(...ys)], [Math.max(...xs), Math.max(...ys)]];
  const map = new maplibregl.Map({ container: "cyc-map", bounds, fitBoundsOptions: { padding: 40 }, interactive: false,
    attributionControl: { compact: true }, preserveDrawingBuffer: true,
    style: { version: 8, sources: { sat: esri("World_Imagery", "Esri, Maxar, Earthstar Geographics · NOAA IBTrACS"),
      places: esri("Reference/World_Boundaries_and_Places", "Esri") },
      layers: [{ id: "sat", type: "raster", source: "sat", paint: { "raster-brightness-max": 0.8, "raster-saturation": -0.15 } },
        { id: "places", type: "raster", source: "places", paint: { "raster-opacity": 0.8 } }] } });
  const seg = (pts, upto) => {  // coloured pieces of the path up to a fractional point index
    const f = [], n = Math.min(upto, pts.length - 1);
    for (let i = 0; i < Math.ceil(n); i++) {
      const a = pts[i], b = pts[i + 1], k = Math.min(1, n - i);
      f.push({ type: "Feature", properties: { c: catColor(a.wind_kt) },
        geometry: { type: "LineString", coordinates: [[a.lon, a.lat], [a.lon + (b.lon - a.lon) * k, a.lat + (b.lat - a.lat) * k]] } });
    }
    return { type: "FeatureCollection", features: f };
  };
  const el = document.createElement("div"); el.className = "cyc-eye"; el.innerHTML = CYC_SVG;
  const marker = new maplibregl.Marker({ element: el });
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let cur = 0, t0 = 0, seen = true, raf = 0, ready = false, hold = 0;
  const DUR = 6000, HOLD = 1600;
  const chip = $("cyc-now");
  function showAt(i, x) {
    const s = S[i], n = s.pts.length - 1, fi = Math.min(n, x * n), k = Math.floor(fi), a = s.pts[k], b = s.pts[Math.min(n, k + 1)], r = fi - k;
    const lon = a.lon + (b.lon - a.lon) * r, lat = a.lat + (b.lat - a.lat) * r, kt = a.wind_kt;
    map.getSource("run").setData(seg(s.pts, fi));
    marker.setLngLat([lon, lat]);
    const size = 26 + Math.max(0, catIdx(kt)) * 5;
    el.style.width = el.style.height = size + "px"; el.style.color = catColor(kt);
    const tt = t(), when = new Date(a.time).toLocaleDateString(loc(), { day: "numeric", month: "short", year: "numeric" });
    chip.innerHTML = `<b>${esc(stormName(s.info))}</b><span>${when} · ${kt ? `${tt.cats[catIdx(kt)] || ""}, ${tt.cycWindAt(nf(Math.round(kt * 1.852)))}` : tt.cycNoWindAt}</span>`;
    chip.style.setProperty("--c", catColor(kt));
  }
  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (!ready || !seen || document.hidden) { t0 = 0; return; }
    if (!t0) t0 = now - (hold ? 0 : 0);
    const e = now - t0;
    if (e < DUR) showAt(cur, e / DUR);
    else if (e > DUR + HOLD) { next(); }
  }
  function next() {
    for (let j = 1; j <= S.length; j++) { const k = (cur + j) % S.length; if (S[k]) { start(k); return; } }
  }
  function start(i) {
    cur = i; t0 = 0;
    document.querySelectorAll(".cyc-list li").forEach(li => li.classList.toggle("on", +li.dataset.k === i));
    S.forEach((s, j) => s && map.getLayer(`full${j}`) && map.setPaintProperty(`full${j}`, "line-opacity", j === i ? 0.45 : 0.18));
    if (reduce) showAt(i, 1);
  }
  map.on("load", () => {
    if (shape) {
      map.addSource("upz", { type: "geojson", data: shape });
      map.addLayer({ id: "upz", type: "fill", source: "upz", paint: { "fill-color": "#ffd34d", "fill-opacity": 0.25 } });
      map.addLayer({ id: "upz-l", type: "line", source: "upz", paint: { "line-color": "#ffd34d", "line-width": 2 } });
    }
    S.forEach((s, j) => {
      if (!s) return;
      map.addSource(`full${j}`, { type: "geojson", data: seg(s.pts, s.pts.length - 1) });
      map.addLayer({ id: `full${j}`, type: "line", source: `full${j}`, layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": ["get", "c"], "line-width": 2, "line-opacity": 0.18, "line-dasharray": [2, 2] } });
    });
    map.addSource("run", { type: "geojson", data: seg([], 0) });
    map.addLayer({ id: "run-glow", type: "line", source: "run", layout: { "line-cap": "round" },
      paint: { "line-color": ["get", "c"], "line-width": 10, "line-blur": 6, "line-opacity": 0.55 } });
    map.addLayer({ id: "run", type: "line", source: "run", layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": ["get", "c"], "line-width": 3.5 } });
    marker.setLngLat([S.find(Boolean).pts[0].lon, S.find(Boolean).pts[0].lat]).addTo(map);
    ready = true;
    start(S.findIndex(Boolean));
    if (!reduce) raf = requestAnimationFrame(frame);
  });
  new IntersectionObserver(es => { seen = es[0].isIntersecting; }).observe(wrap);
  $("cyc-replay").onclick = () => start(cur);
  $("cyc-legend").innerHTML = CAT_COLORS.map((c, i) => `<span><i style="background:${c}"></i>${t().cats[i]}</span>`).join("");
  CYCM = {
    play: i => { if (S[i] && ready) start(i); },
    relabel: () => { $("cyc-legend").innerHTML = CAT_COLORS.map((c, i) => `<span><i style="background:${c}"></i>${t().cats[i]}</span>`).join("");
      if (ready && reduce) showAt(cur, 1); document.querySelectorAll(".cyc-list li").forEach(li => li.classList.toggle("on", +li.dataset.k === cur)); },
  };
}

function render() {
  const tt = t(), n = R.node, s = R.summary, c = R.current;
  document.documentElement.lang = lang;
  document.body.classList.toggle("bn", lang === "bn");
  document.querySelectorAll("[data-i18n]").forEach(el => el.textContent = tt[el.dataset.i18n]);
  $("lang").textContent = lang === "en" ? "বাংলা" : "English";
  document.title = `${n.name} — ${lang === "bn" ? "বন্যার রিপোর্ট" : "flood report"} · FloodShield BD`;
  $("title").textContent = n.name;
  $("tg").href = `https://t.me/DurjogBartaBangladesh_bot?start=${encodeURIComponent(nodeId)}`;
  $("tg-t").textContent = tt.tgBtn;
  $("ffwc-t").textContent = tt.ffwcBtn;
  $("crumb").textContent = tt.crumb(n.district, n.division);
  const oneIn = s && s.flooded_windows ? Math.max(1, Math.round(s.windows / s.flooded_windows)) : 0;
  $("lead").innerHTML = s ? tt.lead(nf(s.flooded_windows), nf(s.windows), nf(oneIn)) : "";
  const now = $("now");
  now.className = c ? `now ${c.risk}` : "";
  now.innerHTML = c ? `<div class="gauge" style="--p:${Math.round(c.flood_prob * 100)}"><span>${nf(Math.round(c.flood_prob * 100))}%</span></div>
    <div><small>${tt.nowTitle}</small><b>${tt.risk[c.risk]}</b><span>${tt.chance(nf(Math.round(c.flood_prob * 100)))}</span></div>` : "";
  const w = s && s.worst;
  const kpi = (ico, k, v, d, tone = "") => `<div class="tile kpi reveal ${tone}"><div class="chip">${ICON[ico]}</div><div><div class="k">${k}</div><div class="v">${v}</div><div class="d">${d}</div></div></div>`;
  $("tiles").innerHTML =
    kpi("wave", tt.tFloods, `<span class="count" data-to="${s ? s.flooded_windows : 0}">0</span> <small>/ ${s ? nf(s.windows) : "–"}</small>`, s ? tt.tFloodsD(nf(s.flooded_windows), nf(s.windows)) : "") +
    kpi("cal", tt.tWorst, w ? monthYear(w.start) : tt.tNoFlood, w ? `${dayMonth(w.start)} – ${dayMonth(w.end)} · ${tt.tWorstD(nf(w.flooded_pct, 0), nf(w.flooded_km2, w.flooded_km2 < 10 ? 1 : 0))}` : "", "teal") +
    kpi("drop", tt.tWater, `<span class="count" data-to="${n.catchment_km2}">0</span> <small>km²</small>`, tt.tWaterD(n.outside_bd_pct), "amber") +
    kpi("cloud", tt.tRainNext, `<span id="k-next">${RS && RS.pts.length ? `${nf(RS.next, RS.next < 10 ? 1 : 0)} <small>${tt.mm}</small>` : "–"}</span>`, tt.tRainNextD, "blue") +
    kpi("bars", tt.tRainPast, `<span id="k-past">${RS && RS.pts.length ? `${nf(RS.past, RS.past < 10 ? 1 : 0)} <small>${tt.mm}</small>` : "–"}</span>`, tt.tRainPastD, "slate");
  countUp();
  if (RAIN) renderRainNow();
  renderLegend();
  renderCalendar();
  renderRainStory();
  renderMonsoon();
  renderCyclones();
  $("csv").href = `/api/v1/nodes/${nodeId}/report.csv`;
}

$("lang").onclick = () => {
  lang = lang === "en" ? "bn" : "en";
  try { localStorage.setItem("fs-lang", lang); } catch (e) {}
  render();
  watchReveal();
};
$("print").onclick = () => window.print();

function countUp() {
  document.querySelectorAll(".count").forEach(el => {
    const to = +el.dataset.to, t0 = performance.now(), dur = 900;
    const step = now => {
      const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = nf(Math.round(to * e));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

// cards fade up as they scroll into view; the nav highlights the section on screen
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
  { threshold: 0.12 });
const watchReveal = () => {
  document.querySelectorAll(".reveal:not(.in)").forEach(el => io.observe(el));
  // never leave content hidden if the observer does not fire (background tabs, some browsers)
  setTimeout(() => document.querySelectorAll(".reveal:not(.in)").forEach(el => el.classList.add("in")), 1200);
};
const navIo = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) document.querySelectorAll("#secnav a").forEach(a => a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id));
}), { rootMargin: "-40% 0px -55% 0px" });
["overview", "where", "calendar", "rain", "cyclones"].forEach(id => navIo.observe($(id)));

/* ---------- rain: last 72 h and next 72 h, hour by hour ---------- */
const HOUR = 3600e3, DHAKA = 6 * HOUR;
function rainStats(h) {
  const now = Date.now(), pts = h.time.map((x, i) => ({ ts: Date.parse(x + "Z"), v: h.precipitation[i] ?? 0 }))
    .filter(p => p.ts >= now - 72 * HOUR && p.ts < now + 72 * HOUR);
  const past = pts.filter(p => p.ts < now), next = pts.filter(p => p.ts >= now);
  const peak = next.reduce((a, p) => p.v > (a?.v ?? 0) ? p : a, null);
  return { pts, now, past: past.reduce((a, p) => a + p.v, 0), next: next.reduce((a, p) => a + p.v, 0), peak };
}
let rainRO = null;
function renderRainNow() {
  if (!rainRO && window.ResizeObserver) {  // redraw when the card changes size (window resize, layout change)
    let tm = 0, last = "";
    rainRO = new ResizeObserver(es => { const r = es[0].contentRect, k = `${Math.round(r.width)}x${Math.round(r.height)}`;
      if (k !== last) { last = k; clearTimeout(tm); tm = setTimeout(() => RS && RS.pts && RS.pts.length && renderRainNow(), 150); } });
    rainRO.observe($("rain-chart"));
  }
  const tt = t(), box = $("rain-chart");
  if (!RS || !RS.pts.length) { box.innerHTML = `<p class="story">${tt.noRain}</p>`; $("rain-stats").innerHTML = ""; return; }
  const hourLabel = ts => new Date(ts).toLocaleString(loc(), { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: lang === "en" ? true : undefined, timeZone: "Asia/Dhaka" });
  const st = (k, v, d = "") => `<div><small>${k}</small><b>${v}</b>${d ? `<span>${d}</span>` : ""}</div>`;
  $("rain-stats").innerHTML = st(tt.sPast, `${nf(RS.past, 1)} ${tt.mm}`) + st(tt.sNext, `${nf(RS.next, 1)} ${tt.mm}`) +
    (RS.peak && RS.peak.v >= 0.1 ? st(tt.sPeak, `${nf(RS.peak.v, 1)} ${tt.mmh}`, hourLabel(RS.peak.ts)) : st(tt.sPeak, tt.sPeakNone));
  // draw at the box's real size, so the chart fills the card next to the map instead of leaving a gap
  const W = Math.max(320, Math.round(box.clientWidth) || 640), H = Math.max(220, Math.round(box.clientHeight) || 230);
  const L = 36, Rt = 44, Tp = 18, B = 34, pw = W - L - Rt, ph = H - Tp - B;
  const t0 = RS.now - 72 * HOUR, span = 144 * HOUR, X = ts => L + (ts - t0) / span * pw;
  const vmax = Math.max(1, ...RS.pts.map(p => p.v)), Y = v => Tp + ph - v / vmax * ph;
  let cum = 0; const cumPts = RS.pts.map(p => [p.ts, cum += p.v]); const cmax = Math.max(1, cum), Yc = v => Tp + ph - v / cmax * ph;
  const bw = Math.max(1.2, pw / 144 * 0.72);
  const grid = [0, .5, 1].map(f => `<line x1="${L}" x2="${W - Rt}" y1="${Y(vmax * f)}" y2="${Y(vmax * f)}" class="gl"/>
    <text x="${L - 6}" y="${Y(vmax * f) + 4}" class="ax" text-anchor="end">${nf(vmax * f, vmax < 5 ? 1 : 0)}</text>
    <text x="${W - Rt + 6}" y="${Yc(cmax * f) + 4}" class="ax c">${nf(cmax * f, cmax < 10 ? 1 : 0)}</text>`).join("");
  const days = []; for (let d = Math.ceil((t0 + DHAKA) / 864e5) * 864e5 - DHAKA; d < t0 + span; d += 864e5) days.push(d);
  const dayLab = days.map(d => `<line x1="${X(d)}" x2="${X(d)}" y1="${Tp}" y2="${Tp + ph}" class="dl"/>
    <text x="${X(d) + 4}" y="${H - 12}" class="ax">${new Date(d + DHAKA).toLocaleDateString(loc(), { day: "numeric", month: "short", timeZone: "UTC" })}</text>`).join("");
  const bars = RS.pts.map((p, i) => p.v <= 0 ? "" : `<rect class="bar ${p.ts < RS.now ? "past" : "next"}" x="${X(p.ts)}" y="${Y(p.v)}" width="${bw}" height="${Tp + ph - Y(p.v)}" style="animation-delay:${i * 4}ms"><title>${hourLabel(p.ts)} · ${nf(p.v, 1)} ${tt.mmh}</title></rect>`).join("");
  const line = cumPts.map(([ts, v], i) => `${i ? "L" : "M"}${(X(ts) + bw / 2).toFixed(1)},${Yc(v).toFixed(1)}`).join("");
  const nx = X(RS.now);
  box.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${tt.rainNowTitle}">
    ${grid}${dayLab}<rect x="${nx}" y="${Tp}" width="${W - Rt - nx}" height="${ph}" class="futbg"/>${bars}
    <path d="${line}" class="cum" pathLength="1"/>
    <line x1="${nx}" x2="${nx}" y1="${Tp - 6}" y2="${Tp + ph}" class="nowl"/><text x="${nx}" y="${Tp - 8}" class="nowt" text-anchor="middle">${tt.nowMark}</text>
    <text x="${L - 6}" y="${Tp - 6}" class="ax" text-anchor="end">${tt.mmh}</text><text x="${W - Rt + 6}" y="${Tp - 6}" class="ax c">${tt.mm}</text></svg>`;
}

/* ---------- 3D map: satellite, relief, rivers, hospitals ---------- */
const hasWebGL = () => { try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch (e) { return false; } };
function renderLegend() {
  const tt = t(), el = $("map-legend");
  if (!MAPINFO) { el.innerHTML = ""; return; }
  const item = (cls, txt) => `<span class="lg"><i class="${cls}"></i>${txt}</span>`;
  el.innerHTML = item("b", tt.lgBoundary) +
    (MAPINFO.rivers ? item("r", tt.lgRivers(nf(MAPINFO.rivers))) : item("r off", tt.lgNoRivers)) +
    (MAPINFO.hosp ? item("h", tt.lgHosp(nf(MAPINFO.hosp))) : item("h off", tt.lgNoHosp)) +
    (MAPINFO.webgl ? item("t", tt.lgRelief) : "") +
    (MAPINFO.webgl && MAPINFO.rivers ? item("f", tt.lgFlow) : "") +
    (MAPINFO.webgl ? item("u", tt.lgRaised) : "");
  if (WXL) WXL.chip();
  if (MAPINFO.markers) MAPINFO.markers.forEach(([m, h]) => m.getPopup().setHTML(hospPopup(h)));
}
function hospPopup(h) {
  const tt = t(), name = lang === "bn" && h.name_bn ? h.name_bn : h.name;
  return `<b>${esc(name)}</b><br><span>${esc(h.type || "")}${h.beds ? ` · ${tt.popBeds(nf(h.beds))}` : ""}</span><br><a href="${esc(h.profile_url)}" target="_blank" rel="noopener">${tt.popProfile}</a>`;
}
function outerRings(geom) {
  return geom.type === "Polygon" ? [geom.coordinates[0]] : geom.coordinates.map(p => p[0]);
}
async function map3d() {
  const [shape, rivers, hosp] = await Promise.all([
    fetch(`/api/v1/nodes/${nodeId}/shape`).then(r => r.ok ? r.json() : null),
    fetch(`/api/v1/nodes/${nodeId}/rivers`).then(r => r.ok ? r.json() : { features: [] }).catch(() => ({ features: [] })),
    fetch(`/api/v1/nodes/${nodeId}/hospitals`).then(r => r.ok ? r.json() : { hospitals: [] }).catch(() => ({ hospitals: [] })),
  ]);
  if (!shape) return;
  MAPINFO = { rivers: rivers.features.length, hosp: hosp.hospitals.length, webgl: !!window.maplibregl && hasWebGL(), markers: [] };
  renderLegend();
  if (!MAPINFO.webgl) {  // no WebGL: fall back to the flat Leaflet outline
    $("map3d").hidden = true; $("mini-map").hidden = false; document.querySelector(".map-tools").hidden = true;
    return miniMap(shape);
  }
  const xs = [], ys = [];
  outerRings(shape.geometry).forEach(r => r.forEach(([x, y]) => { xs.push(x); ys.push(y); }));
  const bounds = [[Math.min(...xs), Math.min(...ys)], [Math.max(...xs), Math.max(...ys)]];
  const risk = R.current ? RISK_COLOR[R.current.risk] : "#3b9ad6";
  // lift the upazila by about 1.2% of its width (before the height exaggeration), so it stands up as a block
  const widthM = Math.hypot((bounds[1][0] - bounds[0][0]) * 111320 * Math.cos(bounds[0][1] * Math.PI / 180), (bounds[1][1] - bounds[0][1]) * 110540);
  const dem = raisedDem(shape, Math.max(90, Math.min(380, widthM * 0.012)));
  const map = MAP = new maplibregl.Map({
    container: "map3d", bounds, fitBoundsOptions: { padding: 36 }, pitch: 25, bearing: -50, maxPitch: 75, maxZoom: 18,
    scrollZoom: false, preserveDrawingBuffer: true, attributionControl: { compact: true },
    style: { version: 8, sources: {
        sat: esri("World_Imagery", "Esri, Maxar, Earthstar Geographics"),
        // sharp roads, rivers, canals and names drawn as lines from OpenStreetMap (free, no key)
        osm: { type: "vector", url: "https://tiles.openfreemap.org/planet",
          attribution: "<a href=\"https://openfreemap.org\" target=\"_blank\">OpenFreeMap</a> © OpenMapTiles · © OpenStreetMap contributors" },
        dem, hs: { ...dem },
      },
      glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
      layers: [{ id: "osm-base-bg", type: "background", paint: { "background-color": "#eef0e6" } },
        ...osmBaseLayers(),
        { id: "sat", type: "raster", source: "sat", paint: { "raster-contrast": 0.08, "raster-saturation": 0.1 } },
        { id: "hill", type: "hillshade", source: "hs", paint: { "hillshade-exaggeration": 0.35, "hillshade-shadow-color": "#08131c" } },
        ...osmLayers()],
      sky: { "sky-color": "#bfe3ff", "horizon-color": "#eaf6ff", "fog-color": "#eaf6ff", "sky-horizon-blend": 0.6, "horizon-fog-blend": 0.6, "fog-ground-blend": 0.4 } },
  });
  map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
  map.on("load", () => {
    // opening: the camera swings down while the upazila rises out of the ground
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (calm) { map.setTerrain({ source: "dem", exaggeration: exag() }); map.jumpTo({ pitch: 58, bearing: -18 }); }
    else {
      rising = true;
      map.setTerrain({ source: "dem", exaggeration: 0.05 });
      map.easeTo({ pitch: 58, bearing: -18, duration: 2600, easing: x => 1 - Math.pow(1 - x, 3) });
      const t0 = performance.now();
      const rise = now => {
        const k = Math.min(1, (now - t0 - 500) / 1900), e = k <= 0 ? 0 : 1 - Math.pow(1 - k, 3);
        if (three) map.setTerrain({ source: "dem", exaggeration: 0.05 + (exag() - 0.05) * e });
        if (k < 1) requestAnimationFrame(rise); else rising = false;
      };
      requestAnimationFrame(rise);
    }
    const world = [[-180, -85], [180, -85], [180, 85], [-180, 85], [-180, -85]];
    map.addSource("mask", { type: "geojson", data: { type: "Feature", geometry: { type: "Polygon", coordinates: [world, ...outerRings(shape.geometry)] } } });
    map.addLayer({ id: "mask", type: "fill", source: "mask", paint: { "fill-color": "#0a1722", "fill-opacity": 0.5 } }, "osm-place");
    map.addSource("upz", { type: "geojson", data: shape });
    // the cliff of the raised block: a dark earth band along the edge, then a light rim on top
    map.addLayer({ id: "upz-cliff", type: "line", source: "upz", paint: { "line-color": "#2b1d12", "line-width": 7, "line-blur": 1.5, "line-opacity": 0.92 } }, "osm-road-label");
    map.addLayer({ id: "upz-line", type: "line", source: "upz", paint: { "line-color": "#e9f6ff", "line-width": 1, "line-opacity": 0.55 } }, "osm-road-label");
    map.addSource("riv", { type: "geojson", data: rivers });
    map.addLayer({ id: "riv-glow", type: "line", source: "riv", layout: { "line-cap": "round" },
      paint: { "line-color": "#38bdf8", "line-opacity": 0.3, "line-blur": 3, "line-width": ["interpolate", ["linear"], ["get", "order"], 3, 4, 9, 14] } }, "osm-road-casing");
    WXL = wxLayer(map, [(bounds[0][0] + bounds[1][0]) / 2, (bounds[0][1] + bounds[1][1]) / 2]);
    FLOW = flowLayer(map, rivers, bounds);
    hosp.hospitals.forEach(h => {
      if (h.lat == null || h.lon == null) return;
      const el = document.createElement("div");
      el.className = "hmk"; el.innerHTML = "<div class=\"hpin\"><span>+</span></div>"; el.title = h.name;
      const m = new maplibregl.Marker({ element: el, anchor: "bottom", opacityWhenCovered: "1" }).setLngLat([h.lon, h.lat])
        .setPopup(new maplibregl.Popup({ offset: 26, closeButton: false }).setHTML(hospPopup(h))).addTo(map);
      MAPINFO.markers.push([m, h]);
    });
    // a slow turn until the visitor touches the map
    let spin = !matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stop = () => { spin = false; };
    ["mousedown", "touchstart", "wheel"].forEach(ev => map.getCanvas().addEventListener(ev, stop, { passive: true }));
    const turn = () => { if (!spin || map.getPitch() < 20) return; map.easeTo({ bearing: map.getBearing() + 12, duration: 6000, easing: x => x }); };
    map.on("moveend", turn);  // the first turn starts when the opening camera move ends
  });
  // hills are drawn 4x taller when seen from far away (Bangladesh is very flat), nearer their real height up close
  const exag = () => { const z = map.getZoom(); return z <= 10 ? 4 : z >= 15 ? 1.3 : 4 - (z - 10) * 0.54; };
  let three = true, rising = false;
  map.on("zoomend", () => { if (three && !rising && map.getTerrain()) map.setTerrain({ source: "dem", exaggeration: exag() }); });
  const view = on3 => {
    three = on3;
    $("v3d").classList.toggle("on", on3); $("v2d").classList.toggle("on", !on3);
    map.setTerrain(on3 ? { source: "dem", exaggeration: exag() } : null);
    map.easeTo({ pitch: on3 ? 58 : 0, bearing: on3 ? -18 : 0, duration: 900 });
  };
  $("v3d").onclick = () => view(true);
  $("v2d").onclick = () => view(false);
  const base = sat => {
    $("bSat").classList.toggle("on", sat); $("bMap").classList.toggle("on", !sat);
    map.setLayoutProperty("sat", "visibility", sat ? "visible" : "none");
    map.getStyle().layers.filter(l => l.id.startsWith("osm-base-") && l.id !== "osm-base-bg")
      .forEach(l => map.setLayoutProperty(l.id, "visibility", sat ? "none" : "visible"));
    // the same roads, water and names, recoloured for a light map
    map.setPaintProperty("osm-water", "fill-color", sat ? "#3aa6e8" : "#a9d3f0");
    map.setPaintProperty("osm-water", "fill-opacity", sat ? 0.22 : 1);
    map.setPaintProperty("osm-waterway", "line-color", sat ? ["match", ["get", "class"], "river", "#5ec8ff", "canal", "#6fd6ff", "#8adfff"] : "#5aa9e0");
    map.setPaintProperty("osm-road-casing", "line-color", sat ? "#141414" : "#b9a88e");
    map.setPaintProperty("osm-road-casing", "line-opacity", sat ? 0.55 : 0.9);
    map.setPaintProperty("osm-place", "text-color", sat ? "#ffffff" : "#2a2f35");
    map.setPaintProperty("osm-place", "text-halo-color", sat ? "rgba(10,20,30,.85)" : "#ffffff");
    map.setPaintProperty("mask", "fill-opacity", sat ? 0.5 : 0.22);
  };
  let loaded = false; map.once("load", () => { loaded = true; });
  const ready = f => loaded ? f() : map.once("load", f);
  $("bSat").onclick = () => ready(() => base(true));
  $("bMap").onclick = () => ready(() => base(false));
  // the page keeps scrolling over the map until the visitor taps or clicks it; then the map takes wheel and finger drags
  const touch = matchMedia("(pointer: coarse)").matches;
  if (touch) map.dragPan.disable();
  const hint = $("map-hint");
  hint.textContent = t()[touch ? "hintTap" : "hintClick"]; hint.hidden = false;
  const activate = () => { map.scrollZoom.enable(); map.dragPan.enable(); hint.hidden = true; };
  map.on("click", activate);
  map.getContainer().addEventListener("mouseleave", () => { if (!touch) map.scrollZoom.disable(); });
  map.getContainer().addEventListener("mouseenter", () => { if (!touch && hint.hidden) map.scrollZoom.enable(); });
}
/* ---------- the light street map: land cover, towns and 3D buildings from OpenStreetMap ---------- */
function osmBaseLayers() {
  const cls = ["get", "class"], hide = { visibility: "none" };
  return [
    { id: "osm-base-landcover", type: "fill", source: "osm", "source-layer": "landcover", layout: hide,
      paint: { "fill-color": ["match", cls, "wood", "#c9e2b8", "grass", "#dcebc9", "farmland", "#eef2d8", "wetland", "#d3ebe6", "sand", "#f3ead2", "#e4eed6"], "fill-opacity": 0.9 } },
    { id: "osm-base-landuse", type: "fill", source: "osm", "source-layer": "landuse", layout: hide,
      filter: ["match", cls, ["residential", "suburb", "neighbourhood", "commercial", "industrial", "retail", "school", "hospital", "cemetery"], true, false],
      paint: { "fill-color": ["match", cls, ["residential", "suburb", "neighbourhood"], "#ebe5dc", "hospital", "#f6dede", "school", "#f2ead2", ["commercial", "retail"], "#f1e3dc", "industrial", "#e6e0ea", "#e7e4dc"] } },
    { id: "osm-base-park", type: "fill", source: "osm", "source-layer": "park", layout: hide, paint: { "fill-color": "#cfe8bf", "fill-opacity": 0.8 } },
    { id: "osm-base-building", type: "fill-extrusion", source: "osm", "source-layer": "building", minzoom: 14, layout: hide,
      paint: { "fill-extrusion-color": "#ded6ca", "fill-extrusion-height": ["coalesce", ["get", "render_height"], 6],
        "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0], "fill-extrusion-opacity": 0.85 } },
  ];
}

/* ---------- OpenStreetMap roads, rivers, canals and names (vector, from OpenFreeMap) ---------- */
function osmLayers() {
  const cls = ["get", "class"];
  const z = (pairs) => ["interpolate", ["exponential", 1.5], ["zoom"], ...pairs];
  // road widths per class at zoom 8 and zoom 18 (pixels)
  const w = (k) => z([8, ["match", cls, ["motorway", "trunk"], 1.6 * k, "primary", 1.2 * k, "secondary", 0.8 * k, "tertiary", 0.5 * k, 0.3 * k],
                      17, ["match", cls, ["motorway", "trunk"], 12 * k, "primary", 10 * k, "secondary", 8 * k, "tertiary", 6.5 * k, ["minor", "service"], 5 * k, 2.6 * k]]);
  const roads = ["match", cls, ["motorway", "trunk", "primary", "secondary", "tertiary", "minor", "service", "track"], true, false];
  const name = ["coalesce", ["get", "name:latin"], ["get", "name:en"], ["get", "name"]];
  return [
    { id: "osm-water", type: "fill", source: "osm", "source-layer": "water", paint: { "fill-color": "#3aa6e8", "fill-opacity": 0.22 } },
    { id: "osm-waterway", type: "line", source: "osm", "source-layer": "waterway", minzoom: 9,
      filter: ["match", cls, ["river", "canal", "stream", "drain", "ditch"], true, false], layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": ["match", cls, "river", "#5ec8ff", "canal", "#6fd6ff", "#8adfff"], "line-opacity": 0.9,
        "line-width": z([9, ["match", cls, "river", 1.2, 0.5], 17, ["match", cls, "river", 7, "canal", 4, 2]]) } },
    { id: "osm-road-casing", type: "line", source: "osm", "source-layer": "transportation", minzoom: 8, filter: roads,
      layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#141414", "line-opacity": 0.75, "line-width": w(1.7) } },
    { id: "osm-road", type: "line", source: "osm", "source-layer": "transportation", minzoom: 8, filter: roads,
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": ["match", cls, ["motorway", "trunk"], "#ffb547", "primary", "#ffd36b", "secondary", "#fff0a8", "track", "#e8dcc0", "#ffffff"],
        "line-opacity": ["match", cls, ["minor", "service", "track"], 0.95, 1], "line-width": w(1) } },
    { id: "osm-road-label", type: "symbol", source: "osm", "source-layer": "transportation_name", minzoom: 11,
      layout: { "symbol-placement": "line", "text-field": ["coalesce", ["get", "ref"], name], "text-font": ["Noto Sans Bold"],
        "text-size": z([11, 11, 18, 16]), "text-max-angle": 30 },
      paint: { "text-color": "#1d1d1d", "text-halo-color": "#fff7d6", "text-halo-width": 1.6 } },
    { id: "osm-place", type: "symbol", source: "osm", "source-layer": "place", minzoom: 8,
      // villages only once zoomed in, so the wide view is not buried in names
      filter: ["any", ["match", cls, ["city", "town"], true, false], ["all", [">=", ["zoom"], 11], ["match", cls, ["village", "suburb"], true, false]]],
      layout: { "text-field": name, "text-font": ["Noto Sans Bold"], "text-max-width": 8,
        "text-size": ["match", cls, "city", 16, "town", 14, 12], "symbol-sort-key": ["match", cls, "city", 0, "town", 1, 2] },
      paint: { "text-color": "#ffffff", "text-halo-color": "rgba(10,20,30,.85)", "text-halo-width": 1.8 } },
  ];
}

/* ---------- water flowing along the real rivers and canals ---------- */
// Lines from HydroRIVERS and OpenStreetMap are both drawn upstream to downstream, so light moving from the
// start of a line to its end moves the way the water really flows. Speed is for the eye, not measured flow.
let FLOW = null;
function flowLayer(map, rivers, bounds) {
  const wrap = map.getContainer().parentElement;
  const cv = document.createElement("canvas"); cv.className = "flow-canvas"; cv.setAttribute("aria-hidden", "true");
  wrap.insertBefore(cv, wrap.querySelector(".wx-canvas"));
  const ctx = cv.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const R_EARTH = 6371000, rad = Math.PI / 180;
  const pad = 0.08, box = [bounds[0][0] - pad, bounds[0][1] - pad, bounds[1][0] + pad, bounds[1][1] + pad];
  let lines = [], parts = [], W = 0, H = 0, seen = true, last = 0;
  let water = [], segs = [], wparts = [], wTotal = 0;
  const M_LAT = 110540, mLon = lat => 111320 * Math.cos(lat * rad);
  function inRing(x, y, r) {
    let ins = false;
    for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
      const [xi, yi] = r[i], [xj, yj] = r[j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) ins = !ins;
    }
    return ins;
  }
  // flow direction at a point = direction of the nearest river or canal line (within 4 km); none means still water
  function dirAt(x, y) {
    let best = 4000 * 4000, ux = 0, uy = 0;
    const kx = mLon(y);
    for (const [a, b] of segs) {
      const ax = (a[0] - x) * kx, ay = (a[1] - y) * M_LAT, bx = (b[0] - x) * kx, by = (b[1] - y) * M_LAT;
      const vx = bx - ax, vy = by - ay, L2 = vx * vx + vy * vy || 1;
      const k = Math.max(0, Math.min(1, -(ax * vx + ay * vy) / L2)), px = ax + vx * k, py = ay + vy * k, d2 = px * px + py * py;
      if (d2 < best) { best = d2; const n = Math.sqrt(L2); ux = vx / n; uy = vy / n; }
    }
    return best < 4000 * 4000 ? [ux, uy] : null;
  }
  function spawnW() {
    for (let tries = 0; tries < 6; tries++) {
      let r = Math.random() * wTotal, w = water[0];
      for (const q of water) { r -= q.a; if (r <= 0) { w = q; break; } }
      if (!w) return null;
      const x = w.bb[0] + Math.random() * (w.bb[2] - w.bb[0]), y = w.bb[1] + Math.random() * (w.bb[3] - w.bb[1]);
      if (!inRing(x, y, w.r) || w.holes.some(h => inRing(x, y, h))) continue;
      const u = dirAt(x, y);
      if (!u) continue;
      return { x, y, ux: u[0], uy: u[1], life: Math.random(), sp: 0.7 + Math.random() * 0.6, ln: 0.5 + Math.random() * 0.9, tw: Math.random() * 6.3 };
    }
    return null;
  }
  const dist = (a, b) => { const x = (b[0] - a[0]) * Math.cos((a[1] + b[1]) / 2 * rad), y = b[1] - a[1]; return Math.hypot(x, y) * rad * R_EARTH; };
  function addLine(coords, kind, q) {
    if (coords.length < 2) return;
    const cum = [0];
    for (let i = 1; i < coords.length; i++) cum.push(cum[i - 1] + dist(coords[i - 1], coords[i]));
    if (cum[cum.length - 1] < 30) return;
    // half the channel width in metres: from mean discharge for HydroRIVERS (width ~ 7 x sqrt(Q)), a few metres for OSM lines
    const half = kind === "big" ? Math.max(60, Math.min(1500, 3.5 * Math.sqrt(q || 100))) : kind === "river" ? 25 : kind === "canal" ? 6 : 3;
    lines.push({ c: coords, cum, len: cum[cum.length - 1], kind, half });
  }
  const inBox = ([x, y]) => x >= box[0] && x <= box[2] && y >= box[1] && y <= box[3];
  function rebuild() {
    lines = [];
    rivers.features.forEach(f => (f.geometry.type === "MultiLineString" ? f.geometry.coordinates : [f.geometry.coordinates]).forEach(c => addLine(c, "big", f.properties.discharge_m3s)));
    try {
      map.querySourceFeatures("osm", { sourceLayer: "waterway" }).forEach(f => {
        const k = f.properties.class; if (!["river", "canal", "stream"].includes(k)) return;
        (f.geometry.type === "MultiLineString" ? f.geometry.coordinates : [f.geometry.coordinates]).forEach(c => { if (c.some(inBox)) addLine(c, k); });
      });
    } catch (e) { /* source not ready yet */ }
    // only the waterways on screen get glints, so a close-up view is as lively as the wide one
    const vb = map.getBounds(), mx = (vb.getEast() - vb.getWest()) * 0.15, my = (vb.getNorth() - vb.getSouth()) * 0.15;
    const vbox = [vb.getWest() - mx, vb.getSouth() - my, vb.getEast() + mx, vb.getNorth() + my];
    lines = lines.filter(l => {
      let x0 = 180, y0 = 90, x1 = -180, y1 = -90;
      l.c.forEach(([x, y]) => { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; });
      return x1 >= vbox[0] && x0 <= vbox[2] && y1 >= vbox[1] && y0 <= vbox[3];
    });
    // about one moving glint per 9 screen pixels of waterway, at most ~2600 in all
    const mpp = 156543.03 * Math.cos(map.getCenter().lat * rad) / Math.pow(2, map.getZoom());
    const onScreen = l => { let n = 0; for (let i = 1; i < l.c.length; i++) { const [x, y] = l.c[i]; if (x >= vbox[0] && x <= vbox[2] && y >= vbox[1] && y <= vbox[3]) n += l.cum[i] - l.cum[i - 1]; } return n; };
    const total = lines.reduce((a, l) => a + onScreen(l), 0), per = Math.max(9 * mpp, total / 1800);
    parts = [];
    // wide rivers carry more glints (spread across the channel); random spots, speeds and lengths, so no dash pattern
    lines.forEach((l, li) => {
      const n = Math.round(l.len / per * Math.max(1, Math.min(10, l.half * 2 / (8 * mpp))));
      for (let k = 0; k < n; k++) parts.push({ li, d: Math.random() * l.len, off: (Math.random() + Math.random() - 1), tw: Math.random() * 6.3,
        sp: 0.7 + Math.random() * 0.6, ln: 0.5 + Math.random() * 0.9 });
    });
    if (parts.length > 2600) parts = parts.filter(() => Math.random() < 2600 / parts.length);
    // glints across the real water surface (OpenStreetMap water areas), drifting the way the nearest river runs
    segs = []; lines.forEach(l => { for (let i = 1; i < l.c.length; i++) segs.push([l.c[i - 1], l.c[i]]); });
    water = []; wTotal = 0;
    try {
      map.querySourceFeatures("osm", { sourceLayer: "water" }).forEach(f => {
        const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.type === "MultiPolygon" ? f.geometry.coordinates : [];
        polys.forEach(pl => {
          const r = pl[0]; let x0 = 180, y0 = 90, x1 = -180, y1 = -90, a = 0;
          for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
            const [x, y] = r[i]; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
            a += (r[j][0] - x) * (r[j][1] + y);
          }
          if (x1 < vbox[0] || x0 > vbox[2] || y1 < vbox[1] || y0 > vbox[3]) return;
          const px2 = Math.abs(a / 2) * mLon((y0 + y1) / 2) * M_LAT / (mpp * mpp);  // area in screen pixels
          if (px2 < 40) return;
          water.push({ r, holes: pl.slice(1), bb: [x0, y0, x1, y1], a: px2 }); wTotal += px2;
        });
      });
    } catch (e) { /* tiles not ready */ }
    const nw = segs.length ? Math.min(1600, Math.round(wTotal / 140)) : 0;
    wparts = []; for (let i = 0; i < nw; i++) { const q = spawnW(); if (q) wparts.push(q); }
  }
  function at(l, d) {
    let i = 1; while (i < l.cum.length - 1 && l.cum[i] < d) i++;
    const a = l.c[i - 1], b = l.c[i], seg = l.cum[i] - l.cum[i - 1] || 1, k = (d - l.cum[i - 1]) / seg;
    return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
  }
  const SPEED = { big: 34, river: 30, canal: 20, stream: 15 }, HALF = { big: 4, river: 2.5, canal: 1.2, stream: 0.6 };
  function frame(ts) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (ts - last) / 1000 || 0); last = ts;
    if (!seen || document.hidden || (!parts.length && !wparts.length)) return;
    ctx.clearRect(0, 0, W, H);
    const zoom = map.getZoom(), mpp = 156543.03 * Math.cos(map.getCenter().lat * rad) / Math.pow(2, zoom), t = ts / 1000;
    const zf = Math.max(0.5, Math.min(2.2, (zoom - 9) / 3));
    ctx.lineCap = "round";
    for (const p of parts) {
      const l = lines[p.li];
      if (!reduce) { p.d += SPEED[l.kind] * p.sp * mpp * dt; if (p.d > l.len) p.d -= l.len; }
      const tail = Math.min(p.d, 12 * mpp * zf * p.ln);
      const a = map.project(at(l, p.d)), b = map.project(at(l, p.d - tail));
      if (a.x < -20 || a.y < -20 || a.x > W + 20 || a.y > H + 20) continue;
      const dx = a.x - b.x, dy = a.y - b.y, n = Math.hypot(dx, dy) || 1, o = p.off * Math.max(HALF[l.kind] * zf, l.half / mpp);
      const ox = -dy / n * o, oy = dx / n * o;
      const alpha = (0.3 + 0.6 * (0.5 + 0.5 * Math.sin(t * 2.2 + p.tw))) * (1 - Math.abs(p.off) * 0.5);
      ctx.strokeStyle = `rgba(225,247,255,${alpha.toFixed(2)})`;
      ctx.lineWidth = l.kind === "big" ? 1.8 : l.kind === "stream" ? 1 : 1.4;
      ctx.beginPath(); ctx.moveTo(b.x + ox, b.y + oy); ctx.lineTo(a.x + ox, a.y + oy); ctx.stroke();
    }
    ctx.lineWidth = 1;
    for (let i = 0; i < wparts.length; i++) {
      const p = wparts[i];
      if (!reduce) {
        const m = 26 * p.sp * mpp * dt;
        p.x += p.ux * m / mLon(p.y); p.y += p.uy * m / M_LAT; p.life += dt * 0.45;
        if (p.life > 1) { const q = spawnW(); if (q) { q.life = 0; wparts[i] = q; } else p.life = 0; continue; }
      }
      const tl = 6 * mpp * zf * p.ln;
      const a = map.project([p.x, p.y]), b = map.project([p.x - p.ux * tl / mLon(p.y), p.y - p.uy * tl / M_LAT]);
      if (a.x < -20 || a.y < -20 || a.x > W + 20 || a.y > H + 20) continue;
      const alpha = Math.sin(p.life * Math.PI) * (0.22 + 0.38 * (0.5 + 0.5 * Math.sin(t * 2.6 + p.tw)));
      ctx.strokeStyle = `rgba(235,250,255,${alpha.toFixed(2)})`;
      ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(a.x, a.y); ctx.stroke();
    }
  }
  const size = () => { const d = Math.min(2, devicePixelRatio || 1); W = wrap.clientWidth; H = wrap.clientHeight; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
  let tm = 0; const later = () => { clearTimeout(tm); tm = setTimeout(rebuild, 400); };
  map.on("idle", later); map.on("moveend", later);
  new ResizeObserver(size).observe(wrap);
  new IntersectionObserver(es => { seen = es[0].isIntersecting; }).observe(wrap);
  size(); rebuild(); requestAnimationFrame(frame);
  return { count: () => parts.length, lines: () => lines.length, water: () => [water.length, wparts.length] };
}

/* ---------- the chosen upazila raised as a block: its ground is lifted in the elevation tiles ---------- */
// The lift is for the eye only (the upazila is not really higher); the legend says so.
function raisedDem(shape, lift) {
  const polys = shape.geometry.type === "Polygon" ? [shape.geometry.coordinates] : shape.geometry.coordinates;
  let x0 = 180, y0 = 90, x1 = -180, y1 = -90;
  polys.forEach(p => p[0].forEach(([x, y]) => { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }));
  const SRC = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium";
  const merc = lat => { const s = Math.sin(lat * Math.PI / 180); return 0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI); };
  maplibregl.addProtocol("updem", async (params, abort) => {
    const [z, x, y] = params.url.slice(8).split("/").map(Number);
    const buf = await (await fetch(`${SRC}/${z}/${x}/${y}.png`, { signal: abort.signal })).arrayBuffer();
    const n = 2 ** z, px = lon => ((lon + 180) / 360 * n - x) * 256, py = lat => (merc(lat) * n - y) * 256;
    if (px(x1) < -2 || px(x0) > 258 || py(y0) < -2 || py(y1) > 258) return { data: buf };  // tile does not touch the upazila
    try {
      const bmp = await createImageBitmap(new Blob([buf], { type: "image/png" }));
      const c = document.createElement("canvas"), m = document.createElement("canvas");
      c.width = c.height = m.width = m.height = 256;
      const ctx = c.getContext("2d", { willReadFrequently: true }), mx = m.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(bmp, 0, 0);
      mx.beginPath();
      polys.forEach(p => p.forEach(ring => { ring.forEach(([lo, la], i) => i ? mx.lineTo(px(lo), py(la)) : mx.moveTo(px(lo), py(la))); mx.closePath(); }));
      mx.fill("evenodd");
      const im = ctx.getImageData(0, 0, 256, 256), d = im.data, k = mx.getImageData(0, 0, 256, 256).data;
      for (let i = 0; i < d.length; i += 4) {
        if (k[i + 3] < 128) continue;
        const v = d[i] * 256 + d[i + 1] + d[i + 2] / 256 + lift;   // terrarium: height = R*256 + G + B/256 - 32768
        d[i] = Math.floor(v / 256); d[i + 1] = Math.floor(v % 256); d[i + 2] = Math.floor((v - Math.floor(v)) * 256);
      }
      ctx.putImageData(im, 0, 0);
      const blob = await new Promise(r => c.toBlob(r, "image/png"));
      return { data: await blob.arrayBuffer() };
    } catch (e) { return { data: buf }; }
  });
  return { type: "raster-dem", tiles: ["updem://{z}/{x}/{y}"], encoding: "terrarium", tileSize: 256, maxzoom: 14 };
}

/* ---------- live rain, wind and cloud over the map (Open-Meteo), with a replay of the last 24 hours ---------- */
let WXL = null;
function wxLayer(map, [lon, lat]) {
  const wrap = map.getContainer().parentElement, btn = $("bWx");
  const cv = document.createElement("canvas"); cv.className = "wx-canvas"; cv.setAttribute("aria-hidden", "true");
  const chip = document.createElement("div"); chip.className = "wx-chip";
  wrap.append(cv, chip);
  const ctx = cv.getContext("2d");
  let W = 0, H = 0, on = !matchMedia("(prefers-reduced-motion: reduce)").matches, seen = true;
  let live = null, hours = [], view = null, timer = 0;   // view: index into hours while replaying, null = now
  let drops = [], gusts = [], splashes = [], clouds = [];
  const cur = () => view == null ? live : hours[view];
  const rate = () => cur() ? cur().rate : 0, kmh = () => cur() ? cur().kmh : 0;
  // a soft cloud, drawn once and reused
  const puff = (() => {
    const c = document.createElement("canvas"); c.width = 260; c.height = 170;
    const x = c.getContext("2d");
    [[70, 100, 58], [120, 78, 66], [172, 96, 60], [100, 112, 52], [150, 116, 50], [205, 110, 40], [45, 112, 36]].forEach(([cx, cy, r]) => {
      const g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, "rgba(255,255,255,.75)"); g.addColorStop(0.6, "rgba(255,255,255,.35)"); g.addColorStop(1, "rgba(255,255,255,0)");
      x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r, 0, 6.283); x.fill();
    });
    return c;
  })();
  const size = () => {
    const d = Math.min(2, devicePixelRatio || 1); W = wrap.clientWidth; H = wrap.clientHeight;
    cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); seed();
  };
  // direction on screen: wind blows toward (from + 180), turned by the map bearing and squashed by the tilt
  const dirVec = () => {
    const c = cur(); if (!c) return { x: 0, y: 0 };
    const a = (c.from + 180 - map.getBearing()) * Math.PI / 180, squash = Math.max(0.35, Math.cos(map.getPitch() * Math.PI / 180));
    return { x: Math.sin(a), y: -Math.cos(a) * squash };
  };
  const drop = () => {
    const big = Math.log2(1 + rate());  // heavier rain: bigger, longer, faster drops
    return { x: Math.random() * W, y: -Math.random() * H * 0.3, l: 6 + big * 5 + Math.random() * 7, v: 320 + big * 150 + Math.random() * 140,
      g: H * (0.35 + Math.random() * 0.65), a: 0.3 + Math.random() * 0.45 };
  };
  function seed() {
    const area = W * H / (640 * 460), r = rate(), k = kmh(), cc = cur() ? cur().cloud || 0 : 0;
    const nd = r < 0.05 ? 0 : Math.round(Math.min(480, 30 + r * 70) * area);
    drops = Array.from({ length: nd }, () => { const d = drop(); d.y = Math.random() * d.g; return d; });
    const ng = k < 3 ? 0 : Math.round(Math.min(150, (k - 2) * 6) * area);
    gusts = Array.from({ length: ng }, () => ({ x: Math.random() * W, y: Math.random() * H, ph: Math.random() * 6.3, life: Math.random() }));
    const nc = Math.round(cc / 100 * 9 * Math.max(0.6, area));
    clouds = Array.from({ length: nc }, () => ({ x: Math.random() * (W + 260) - 130, y: Math.random() * H * 0.8 - 40, s: 0.7 + Math.random() * 0.9, a: 0.3 + Math.random() * 0.3 }));
    splashes = [];
  }
  let last = 0;
  function frame(ts) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (ts - last) / 1000 || 0); last = ts;
    if (!on || !seen || document.hidden) return;
    ctx.clearRect(0, 0, W, H);
    const v = dirVec(), k = kmh(), s = k < 3 ? 0 : 8 + k * 3.2, t = ts / 1000, r = rate();
    if (r >= 0.05) { ctx.fillStyle = `rgba(20,32,48,${Math.min(0.28, 0.06 + r * 0.02)})`; ctx.fillRect(0, 0, W, H); }  // rain dims the light
    ctx.lineCap = "round";
    const wa = Math.min(1, k / 18) * 0.7;
    for (const g of gusts) {
      const wob = Math.sin(t * 1.3 + g.ph) * 0.22, cx = v.x * Math.cos(wob) - v.y * Math.sin(wob), cy = v.x * Math.sin(wob) + v.y * Math.cos(wob);
      g.x += cx * s * dt; g.y += cy * s * dt; g.life += dt * 0.35;
      if (g.life > 1 || g.x < -40 || g.x > W + 40 || g.y < -40 || g.y > H + 40) { g.x = Math.random() * W; g.y = Math.random() * H; g.life = 0; }
      const a = Math.sin(g.life * Math.PI) * wa, len = 18 + s * 0.5;
      const grd = ctx.createLinearGradient(g.x - cx * len, g.y - cy * len, g.x, g.y);
      grd.addColorStop(0, "rgba(255,255,255,0)"); grd.addColorStop(1, `rgba(255,255,255,${a.toFixed(2)})`);
      ctx.strokeStyle = grd; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(g.x - cx * len, g.y - cy * len); ctx.lineTo(g.x, g.y); ctx.stroke();
    }
    const slant = v.x * Math.min(0.55, s / 170);
    for (const d of drops) {
      d.y += d.v * dt; d.x += slant * d.v * dt;
      if (d.y > d.g) {
        if (splashes.length < 200) splashes.push({ x: d.x, y: d.y, life: 0, r: 2 + Math.random() * 3 + Math.log2(1 + r) });
        Object.assign(d, drop());
      }
      if (d.x > W) d.x -= W; else if (d.x < 0) d.x += W;
      ctx.strokeStyle = `rgba(205,232,255,${d.a.toFixed(2)})`; ctx.lineWidth = 1.1;
      ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - slant * d.l, d.y - d.l); ctx.stroke();
    }
    for (let i = splashes.length - 1; i >= 0; i--) {
      const p = splashes[i]; p.life += dt * 3;
      if (p.life >= 1) { splashes.splice(i, 1); continue; }
      ctx.strokeStyle = `rgba(220,240,255,${(0.55 * (1 - p.life)).toFixed(2)})`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(p.x, p.y, p.r * (0.4 + p.life), p.r * 0.35 * (0.4 + p.life), 0, 0, 6.283); ctx.stroke();
    }
    // clouds: as many as the sky is covered, drifting with the wind, with a soft shadow on the ground
    const cs = 5 + k * 0.9;
    for (const c of clouds) {
      c.x += v.x * cs * dt; c.y += v.y * cs * dt;
      const w = 260 * c.s, h = 170 * c.s;
      if (c.x < -w) c.x = W + 10; else if (c.x > W + 10) c.x = -w;
      if (c.y < -h) c.y = H * 0.85; else if (c.y > H * 0.9) c.y = -h;
      ctx.globalAlpha = c.a * 0.35; ctx.filter = "brightness(0)";
      ctx.drawImage(puff, c.x + 26, c.y + 60, w, h * 0.8);
      ctx.filter = "none"; ctx.globalAlpha = c.a * (r >= 0.05 ? 0.8 : 1);
      ctx.drawImage(puff, c.x, c.y, w, h);
    }
    ctx.globalAlpha = 1;
  }
  const hm = ts => new Date(ts).toLocaleTimeString(loc(), { hour: "numeric", minute: "2-digit", timeZone: "Asia/Dhaka" });
  const dhm = ts => new Date(ts).toLocaleString(loc(), { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Dhaka" });
  function renderChip() {
    const tt = t(), c = cur();
    btn.textContent = tt.wxBtn;
    if (!c) { chip.innerHTML = ""; chip.hidden = true; return; }
    const replay = view != null, r1 = nf(c.rate, c.rate < 10 ? 1 : 0);
    const how = c.n == null ? "" : ` (${tt.wxAgree(nf(c.n), nf(c.of))})`;
    const rain = `<span class="wr${c.rate < 0.05 && c.n === 1 ? " maybe" : ""}">${c.rate >= 0.05 ? (replay ? tt.wxHourRain(r1) : tt.wxRain(r1)) + how
      : c.n === 1 ? tt.wxMaybe(nf(c.of)) : (replay ? tt.wxHourDry : tt.wxDry)}</span>`;
    const wd = `<span class="ww">${c.kmh < 3 ? tt.wxCalm : tt.wxWind(nf(Math.round(c.kmh)), tt.dirs[Math.round(c.from / 45) % 8], nf(Math.round(c.gust)))}</span>`;
    const cl = c.cloud == null ? "" : `<span class="wc">${tt.wxCloud(nf(Math.round(c.cloud)))}</span>`;
    const sum = hours.reduce((a, h) => a + h.rate, 0);
    chip.innerHTML = (replay ? `<span class="wh">${tt.wxAtHour(dhm(c.time))}</span>` : "") + rain + wd + cl +
      (replay ? "" : `<small class="wt">${tt.wx24(nf(sum, 1))} · ${tt.wxAt(hm(c.time))}</small>`);
    chip.hidden = false;
    $("wxPlay").title = tt.wxReplay; $("wxLive").textContent = tt.wxLive; $("wxNote").textContent = tt.wxNote;
    $("wxTime").textContent = replay ? dhm(c.time) : tt.wxLive;
  }
  function renderBars() {
    const max = Math.max(0.5, ...hours.map(h => h.rate));
    $("wxBars").innerHTML = hours.map((h, i) => `<i class="${i === view ? "on" : ""}" style="height:${Math.max(4, h.rate / max * 100)}%;${h.rate >= 0.05 ? "" : "opacity:.25"}" title="${dhm(h.time)} · ${nf(h.rate, 1)} mm"></i>`).join("");
  }
  function show(i) {  // i = hour index, or null for now
    view = i == null || i >= hours.length ? null : i;
    $("wxRange").value = view == null ? hours.length : view;
    $("wxLive").classList.toggle("on", view == null);
    seed(); renderChip(); renderBars();
  }
  function stop() { clearInterval(timer); timer = 0; $("wxPlay").textContent = "▶"; }
  function play() {
    if (timer) { stop(); return; }
    if (!hours.length) return;
    if (!on) setOn(true);
    let i = view == null ? 0 : view;
    show(i); $("wxPlay").textContent = "❚❚";
    timer = setInterval(() => { i += 1; if (i >= hours.length) { stop(); show(null); } else show(i); }, 1100);
  }
  const setOn = v => { on = v; btn.classList.toggle("on", on); cv.hidden = !on; };
  btn.hidden = false; btn.onclick = () => setOn(!on); setOn(on);
  $("wxPlay").onclick = play;
  $("wxLive").onclick = () => { stop(); show(null); };
  $("wxRange").oninput = e => { stop(); show(+e.target.value); };
  async function check() {
    try {
      const j = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(3)}&longitude=${lon.toFixed(3)}` +
        `&current=precipitation,wind_speed_10m,wind_direction_10m,wind_gusts_10m,cloud_cover` +
        `&hourly=precipitation,wind_speed_10m,wind_direction_10m,wind_gusts_10m,cloud_cover&past_days=1&forecast_days=1&wind_speed_unit=kmh&timezone=GMT`)
        .then(r => r.ok ? r.json() : null);
      const c = j && j.current;
      if (!c || c.wind_speed_10m == null) return;
      // "current" precipitation is the total of the last interval (15 min); show it as a rate per hour
      const per = 3600 / (c.interval || 900);
      live = { rate: (c.precipitation || 0) * per, kmh: c.wind_speed_10m, from: c.wind_direction_10m || 0, gust: c.wind_gusts_10m || c.wind_speed_10m,
               cloud: c.cloud_cover, time: Date.parse(c.time + "Z") };
      const h = j.hourly, nowMs = Date.now();
      // rain: three independent weather models (Europe's ECMWF, the US GFS, Germany's ICON). It counts as rain only when
      // at least two of them give 0.2 mm or more for the hour; one model's trace drizzle is not shown as rain.
      const MODELS = ["ecmwf_ifs025", "gfs_seamless", "icon_seamless"], agree = {};
      try {
        const m = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(3)}&longitude=${lon.toFixed(3)}` +
          `&hourly=precipitation&models=${MODELS.join(",")}&past_days=1&forecast_days=1&timezone=GMT`).then(r => r.ok ? r.json() : null);
        if (m && m.hourly) m.hourly.time.forEach((x, i) => {
          const v = MODELS.map(k => m.hourly[`precipitation_${k}`]?.[i]).filter(q => q != null).sort((a, b) => a - b);
          if (v.length >= 2) agree[x] = { n: v.filter(q => q >= 0.2).length, of: v.length, med: v[Math.floor(v.length / 2)] };
        });
      } catch (e) { /* fall back to the single best-match model below */ }
      const rainAt = (iso, single) => {
        const a = agree[iso];
        if (!a) return { rate: single >= 0.2 ? single : 0, n: null, of: null };
        return { rate: a.n >= 2 ? Math.max(a.med, 0.2) : 0, n: a.n, of: a.of };
      };
      const hourIso = new Date(Math.floor(nowMs / 3600e3) * 3600e3).toISOString().slice(0, 16);
      Object.assign(live, rainAt(hourIso, live.rate));
      hours = h.time.map((x, i) => ({ time: Date.parse(x + "Z"), ...rainAt(x, h.precipitation[i] || 0), kmh: h.wind_speed_10m[i] || 0, from: h.wind_direction_10m[i] || 0,
        gust: h.wind_gusts_10m[i] || 0, cloud: h.cloud_cover[i] })).filter(x => x.time <= nowMs && x.time > nowMs - 24 * 3600e3);
      $("wxRange").max = hours.length;
      $("wx-replay").hidden = false;
      if (!timer) show(view);
    } catch (e) { /* keep the last reading */ }
  }
  new ResizeObserver(size).observe(wrap);
  new IntersectionObserver(es => { seen = es[0].isIntersecting; }).observe(wrap);
  size(); renderChip(); requestAnimationFrame(frame);
  check(); setInterval(() => { if (!document.hidden) check(); }, 10 * 60e3);
  return { chip: () => { renderChip(); renderBars(); }, rain: () => {}, now: () => live, hours: () => hours, show };
}

function esri(path, attribution) {
  // Esri has real imagery to zoom 18 across Bangladesh (checked at 18 spots); past that it serves grey "Map data not yet
  // available" tiles, so stop there and let MapLibre enlarge the zoom-18 picture instead
  return { type: "raster", tileSize: 256, maxzoom: 18, attribution,
    tiles: [`https://server.arcgisonline.com/ArcGIS/rest/services/${path}/MapServer/tile/{z}/{y}/{x}`] };
}

async function miniMap(shapeIn) {
  const shape = shapeIn;
  const m = L.map("mini-map", { zoomControl: false, attributionControl: false, dragging: false, scrollWheelZoom: false,
    doubleClickZoom: false, boxZoom: false, keyboard: false, touchZoom: false });
  // Light Gray canvas has detail down to street level; the Ocean basemap stops around zoom 10 on land
  // and shows "Map data not yet available" for small (city) upazilas
  L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}", { maxNativeZoom: 16 }).addTo(m);
  L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}", { maxNativeZoom: 16, opacity: .9 }).addTo(m);
  const g = L.geoJSON(shape, { style: { color: "#0e5a8a", weight: 2.5, fillColor: "#3b9ad6", fillOpacity: 0.25 } }).addTo(m);
  m.fitBounds(g.getBounds(), { padding: [18, 18] });
  m.setZoom(Math.min(m.getZoom(), 11));
  setTimeout(() => m.flyTo(g.getBounds().getCenter(), Math.min(m.getZoom() + 0.6, 12), { duration: 1.6 }), 300);
}

(async () => {
  document.querySelectorAll("[data-i18n]").forEach(el => el.textContent = t()[el.dataset.i18n]);
  const parts = location.pathname.split("/").filter(Boolean);  // ["upazila", district, name] or ["upazila", id]
  if (parts.length === 3) {
    const r = await fetch(`/api/v1/upazila-slug/${parts[1]}/${parts[2]}`);
    if (r.ok) nodeId = (await r.json()).id;
  } else nodeId = parts[1];
  const res = nodeId && await fetch(`/api/v1/nodes/${nodeId}/report`);
  if (!res || !res.ok) { $("title").textContent = t().notFound; return; }
  R = await res.json();
  if (parts.length !== 3) history.replaceState(null, "", `/upazila/${R.slug}`);  // old id links get the readable URL
  render();
  watchReveal();
  map3d().catch(e => console.warn("map", e));
  fetch(`/api/v1/nodes/${nodeId}/rain`).then(r => r.ok ? r.json() : null).then(j => {
    if (!j) { RS = { pts: [] }; renderRainNow(); return; }
    RAIN = j.hourly; RS = rainStats(RAIN); renderRainNow(); if (WXL) WXL.rain();
    const mm = v => `${nf(v, v < 10 ? 1 : 0)} <small>${t().mm}</small>`;
    $("k-next").innerHTML = mm(RS.next); $("k-past").innerHTML = mm(RS.past);
  }).catch(() => {});
  CY =await (await fetch(`/api/v1/nodes/${nodeId}/cyclones`)).json();
  renderCyclones();
  cycMap().catch(e => console.warn("cyclone map", e));
  watchReveal();
})();
