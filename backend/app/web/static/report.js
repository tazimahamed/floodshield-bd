/* FloodShield BD — upazila flood report */
const T = {
  en: {
    back: "← Map", calTitle: "Flood calendar, 2017 to today",
    calSub: "Each box is a 15-day stretch of the year, starting on the date above it. Empty boxes have no satellite data yet. The number is how much of the upazila was under unusual flood water, as seen from satellite. Red boxes were floods.",
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
    legendLow: "none", legendHigh: "more water",
    tipRange: (a, b) => `${a} – ${b}`, tipWater: p => `Unusual water: ${p}% of the upazila`,
    tipRain: (b, u) => `Rain in the 2 weeks before: ${b} mm (upstream ${u} mm)`, tipFlood: "Flood",
    cycSummary: (n50, n150) => `Since 1960, <b>${n50}</b> cyclone or depression centres passed within 50 km of this upazila, and ${n150} within 150 km.`,
    cycItem: (km, kmh) => `${km} km away${kmh ? ` · ${kmh} km/h` : ""}`,
    months: ["Jun", "Jul", "Aug", "Sep"], halves: ["1–15", "16–30"], notFound: "Upazila not found", mm: "mm",
    navMap: "Map", mapTitle: "What is where", mapSub: "Roads, place names, rivers and hospitals on real ground.",
    hintClick: "Click the map to move and zoom it", hintTap: "Tap the map to move it", baseSat: "Satellite", baseMap: "Map",
    mapSrc: "Satellite, roads and place names: Esri · Relief: Mapzen Terrain Tiles (AWS), height shown 4× taller · Rivers: HydroSHEDS · Hospitals: DGHS registry",
    lgBoundary: "Upazila boundary", lgRivers: n => `Rivers and streams (${n} stretches)`, lgNoRivers: "No large river mapped inside",
    lgHosp: n => `Government hospitals (${n})`, lgNoHosp: "No government hospital with a checked location here", lgRelief: "Hills and high ground",
    popBeds: b => `${b} beds`, popProfile: "Open in DGHS registry ↗",
    rainNowTitle: "Rain: last 3 days and next 3 days", rainNowSub: "Hour by hour, from the NOAA GFS forecast for this upazila.",
    keyPast: "Already fell", keyNext: "Forecast", keyCum: "Running total", nowMark: "Now",
    sPast: "Last 3 days", sNext: "Next 3 days", sPeak: "Heaviest hour ahead", sPeakNone: "No rain expected", mmh: "mm/h",
    noRain: "No rainfall forecast is available right now.",
    tRainNext: "Rain, next 3 days", tRainNextD: "NOAA GFS forecast", tRainPast: "Rain, last 3 days", tRainPastD: "Same source, already fallen",
  },
  bn: {
    back: "← ম্যাপ", calTitle: "বন্যার ক্যালেন্ডার, ২০১৭ থেকে আজ পর্যন্ত",
    calSub: "প্রতিটি ঘর বছরের ১৫ দিনের একটি সময়, উপরে লেখা তারিখ থেকে শুরু। ফাঁকা ঘরে এখনো স্যাটেলাইট ডেটা নেই। সংখ্যাটি দেখায় স্যাটেলাইটে উপজেলার কতটা অংশ অস্বাভাবিক বন্যার পানির নিচে দেখা গেছে। লাল ঘর মানে বন্যা।",
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
    legendLow: "নেই", legendHigh: "বেশি পানি",
    tipRange: (a, b) => `${a} – ${b}`, tipWater: p => `অস্বাভাবিক পানি: উপজেলার ${p}%`,
    tipRain: (b, u) => `আগের ২ সপ্তাহে বৃষ্টি: ${b} মিমি (উজানে ${u} মিমি)`, tipFlood: "বন্যা",
    cycSummary: (n50, n150) => `১৯৬০ থেকে <b>${n50}</b>টি ঘূর্ণিঝড় বা নিম্নচাপের কেন্দ্র এই উপজেলার ৫০ কিমির মধ্যে দিয়ে গেছে, আর ${n150}টি ১৫০ কিমির মধ্যে দিয়ে।`,
    cycItem: (km, kmh) => `${km} কিমি দূরে${kmh ? ` · ${kmh} কিমি/ঘণ্টা` : ""}`,
    months: ["জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর"], halves: ["১–১৫", "১৬–৩০"], notFound: "উপজেলা পাওয়া যায়নি", mm: "মিমি",
    navMap: "ম্যাপ", mapTitle: "কোথায় কী আছে", mapSub: "আসল জমির উপর রাস্তা, জায়গার নাম, নদী ও হাসপাতাল।",
    hintClick: "ম্যাপ নাড়াতে ও জুম করতে একবার ক্লিক করুন", hintTap: "ম্যাপ নাড়াতে একবার ট্যাপ করুন", baseSat: "স্যাটেলাইট", baseMap: "ম্যাপ",
    mapSrc: "স্যাটেলাইট, রাস্তা ও জায়গার নাম: Esri · উঁচু-নিচু: Mapzen Terrain Tiles (AWS), উচ্চতা ৪ গুণ বাড়িয়ে দেখানো · নদী: HydroSHEDS · হাসপাতাল: স্বাস্থ্য অধিদপ্তরের রেজিস্ট্রি",
    lgBoundary: "উপজেলার সীমানা", lgRivers: n => `নদী ও খাল (${n}টি অংশ)`, lgNoRivers: "ভেতরে বড় কোনো নদী ম্যাপে নেই",
    lgHosp: n => `সরকারি হাসপাতাল (${n}টি)`, lgNoHosp: "যাচাই করা অবস্থানসহ কোনো সরকারি হাসপাতাল নেই", lgRelief: "পাহাড় ও উঁচু জমি",
    popBeds: b => `${b}টি শয্যা`, popProfile: "স্বাস্থ্য অধিদপ্তরের রেজিস্ট্রিতে দেখুন ↗",
    rainNowTitle: "বৃষ্টি: গত ৩ দিন ও আগামী ৩ দিন", rainNowSub: "ঘণ্টা ধরে, এই উপজেলার জন্য NOAA GFS পূর্বাভাস থেকে।",
    keyPast: "হয়ে গেছে", keyNext: "পূর্বাভাস", keyCum: "মোট জমা", nowMark: "এখন",
    sPast: "গত ৩ দিন", sNext: "আগামী ৩ দিন", sPeak: "সামনে সবচেয়ে ভারী ঘণ্টা", sPeakNone: "বৃষ্টির সম্ভাবনা নেই", mmh: "মিমি/ঘণ্টা",
    noRain: "এই মুহূর্তে বৃষ্টির পূর্বাভাস পাওয়া যাচ্ছে না।",
    tRainNext: "বৃষ্টি, আগামী ৩ দিন", tRainNextD: "NOAA GFS পূর্বাভাস", tRainPast: "বৃষ্টি, গত ৩ দিন", tRainPastD: "একই উৎস, হয়ে গেছে",
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
const CAL = [[0.5, "#e8eef3"], [2, "#cfe3f2"], [5, "#8fc1e3"], [10, "#f08a5d"], [20, "#d9472b"], [101, "#8f1420"]];
const calColor = p => CAL.find(([max]) => p < max)[1];
const CAT_KT = [17, 28, 34, 48, 64, 90, 120];
const CAT_COLORS = ["#7fd0a8", "#3fb6a8", "#f2d43a", "#f39a2b", "#e8562c", "#c41d4a", "#7b1fa2"];
const catColor = kt => kt == null ? "#9aa5ae" : CAT_COLORS[CAT_KT.filter(k => kt >= k).length - 1] || "#9aa5ae";

function renderCalendar() {
  // the monsoon windows are fixed 15-day blocks from 1 June (1 Jun, 16 Jun, 1 Jul, 16 Jul, 31 Jul, ...),
  // so each year has the same eight columns; place them by order, not by calendar half-month
  const tt = t(), byYear = {};
  R.history.forEach((h, idx) => (byYear[h.start.slice(0, 4)] ??= []).push(idx));
  const years = Object.keys(byYear).sort((a, b) => b - a);
  const cols = Math.max(...Object.values(byYear).map(v => v.length));
  const ref = byYear[years[0]].length === cols ? byYear[years[0]] : Object.values(byYear).find(v => v.length === cols);
  const head = `<tr><th></th>${ref.map(i => `<th>${dayMonth(R.history[i].start)}</th>`).join("")}</tr>`;
  $("cal").innerHTML = head + years.map(y => `<tr><th class="yr">${yearNum(y)}</th>${[...Array(cols).keys()].map(k => {
    const idx = byYear[y][k];
    if (idx == null) return `<td class="none">·</td>`;
    const h = R.history[idx], p = h.flooded_pct;
    return `<td class="${h.flooded ? "flood" : p < 0.5 ? "none" : ""}" style="background:${calColor(p)};animation-delay:${(years.indexOf(y) * cols + k) * 12}ms" data-i="${idx}">${p < 0.5 ? "" : nf(p, p < 10 ? 1 : 0) + "%"}</td>`;
  }).join("")}</tr>`).join("");
  $("cal-legend").innerHTML = `${tt.legendLow} ${CAL.map(([, c]) => `<i style="background:${c}"></i>`).join("")} ${tt.legendHigh}`;
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
  const max = Math.max(f, n, 1);
  $("rain-story").innerHTML = `<div class="cmp">
      <div class="row"><span>${tt.before}</span><div class="bar" style="width:${(f / max) * 100}%;background:#d9472b">${nf(f)} ${tt.mm}</div></div>
      <div class="row"><span>${tt.normal}</span><div class="bar" style="width:${(n / max) * 100}%;background:#5aaee3">${nf(n)} ${tt.mm}</div></div>
    </div>
    <p class="story">${tt.story(nf(f), nf(n), nf(s.lowest_rain_local_15d_before_a_flood), R.node.outside_bd_pct > 0 ? nf(s.median_rain_up_15d_before.flooded) : null)}</p>`;
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
  const top = CY.cyclones.filter(c => c.max_wind_kt && c.min_km <= 100).sort((a, b) => b.max_wind_kt - a.max_wind_kt).slice(0, 3);
  $("cyc").innerHTML = `<p class="story">${tt.cycSummary(nf(CY.within_50km), nf(CY.within_150km))}</p>` + (top.length ? `<ul class="cyc-list">${top.map(c =>
    `<li style="--c:${catColor(c.max_wind_kt)}"><b>${c.name === "Unnamed" ? (lang === "bn" ? `${yearNum(c.season)}-এর ঘূর্ণিঝড়` : `${c.season} cyclone`) : `${c.name} ${yearNum(c.season)}`}</b><span>${tt.cycItem(nf(c.min_km), nf(Math.round(c.max_wind_kt * 1.852)))}</span></li>`).join("")}</ul>` : "");
}

function render() {
  const tt = t(), n = R.node, s = R.summary, c = R.current;
  document.documentElement.lang = lang;
  document.body.classList.toggle("bn", lang === "bn");
  document.querySelectorAll("[data-i18n]").forEach(el => el.textContent = tt[el.dataset.i18n]);
  $("lang").textContent = lang === "en" ? "বাংলা" : "English";
  document.title = `${n.name} — ${lang === "bn" ? "বন্যার রিপোর্ট" : "flood report"} · FloodShield BD`;
  $("title").textContent = n.name;
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
function renderRainNow() {
  const tt = t(), box = $("rain-chart");
  if (!RS || !RS.pts.length) { box.innerHTML = `<p class="story">${tt.noRain}</p>`; $("rain-stats").innerHTML = ""; return; }
  const hourLabel = ts => new Date(ts).toLocaleString(loc(), { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: lang === "en" ? true : undefined, timeZone: "Asia/Dhaka" });
  const st = (k, v, d = "") => `<div><small>${k}</small><b>${v}</b>${d ? `<span>${d}</span>` : ""}</div>`;
  $("rain-stats").innerHTML = st(tt.sPast, `${nf(RS.past, 1)} ${tt.mm}`) + st(tt.sNext, `${nf(RS.next, 1)} ${tt.mm}`) +
    (RS.peak && RS.peak.v >= 0.1 ? st(tt.sPeak, `${nf(RS.peak.v, 1)} ${tt.mmh}`, hourLabel(RS.peak.ts)) : st(tt.sPeak, tt.sPeakNone));
  const W = 640, H = 230, L = 36, Rt = 44, Tp = 18, B = 34, pw = W - L - Rt, ph = H - Tp - B;
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
    (MAPINFO.webgl ? item("t", tt.lgRelief) : "");
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
  const dem = { type: "raster-dem", tiles: ["https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"], encoding: "terrarium", tileSize: 256, maxzoom: 14 };
  const map = MAP = new maplibregl.Map({
    container: "map3d", bounds, fitBoundsOptions: { padding: 36 }, pitch: 58, bearing: -18, maxPitch: 75,
    scrollZoom: false, preserveDrawingBuffer: true, attributionControl: { compact: true },
    style: { version: 8, sources: {
        sat: esri("World_Imagery", "Esri, Maxar, Earthstar Geographics"),
        street: esri("World_Street_Map", "Esri, HERE, Garmin, OpenStreetMap contributors"),
        roads: esri("Reference/World_Transportation", "Esri"),
        places: esri("Reference/World_Boundaries_and_Places", "Esri"),
        dem, hs: { ...dem },
      },
      layers: [{ id: "sat", type: "raster", source: "sat", paint: { "raster-contrast": 0.05 } },
        { id: "street", type: "raster", source: "street", layout: { visibility: "none" } },
        { id: "hill", type: "hillshade", source: "hs", paint: { "hillshade-exaggeration": 0.35, "hillshade-shadow-color": "#08131c" } },
        { id: "roads", type: "raster", source: "roads", paint: { "raster-opacity": 0.95 } },
        { id: "places", type: "raster", source: "places" }],
      sky: { "sky-color": "#bfe3ff", "horizon-color": "#eaf6ff", "fog-color": "#eaf6ff", "sky-horizon-blend": 0.6, "horizon-fog-blend": 0.6, "fog-ground-blend": 0.4 } },
  });
  map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
  map.on("load", () => {
    map.setTerrain({ source: "dem", exaggeration: 4 });
    const world = [[-180, -85], [180, -85], [180, 85], [-180, 85], [-180, -85]];
    map.addSource("mask", { type: "geojson", data: { type: "Feature", geometry: { type: "Polygon", coordinates: [world, ...outerRings(shape.geometry)] } } });
    map.addLayer({ id: "mask", type: "fill", source: "mask", paint: { "fill-color": "#0a1722", "fill-opacity": 0.38 } });
    map.addSource("upz", { type: "geojson", data: shape });
    map.addLayer({ id: "upz-fill", type: "fill", source: "upz", paint: { "fill-color": risk, "fill-opacity": 0.06 } });
    map.addLayer({ id: "upz-glow", type: "line", source: "upz", paint: { "line-color": "#7fd3ff", "line-width": 10, "line-blur": 8, "line-opacity": 0.75 } });
    map.addLayer({ id: "upz-line", type: "line", source: "upz", paint: { "line-color": "#ffffff", "line-width": 2.4 } });
    map.addSource("riv", { type: "geojson", data: rivers });
    map.addLayer({ id: "riv-glow", type: "line", source: "riv", layout: { "line-cap": "round" },
      paint: { "line-color": "#38bdf8", "line-opacity": 0.35, "line-blur": 3, "line-width": ["interpolate", ["linear"], ["get", "order"], 3, 4, 9, 14] } });
    map.addLayer({ id: "riv", type: "line", source: "riv", layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": "#7dd3fc", "line-width": ["interpolate", ["linear"], ["get", "order"], 3, 1.4, 9, 5.5] } });
    hosp.hospitals.forEach(h => {
      if (h.lat == null || h.lon == null) return;
      const el = document.createElement("div");
      el.className = "hmk"; el.innerHTML = "<div class=\"hpin\"><span>+</span></div>"; el.title = h.name;
      const m = new maplibregl.Marker({ element: el, anchor: "bottom" }).setLngLat([h.lon, h.lat])
        .setPopup(new maplibregl.Popup({ offset: 26, closeButton: false }).setHTML(hospPopup(h))).addTo(map);
      MAPINFO.markers.push([m, h]);
    });
    // a slow turn until the visitor touches the map
    let spin = !matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stop = () => { spin = false; };
    ["mousedown", "touchstart", "wheel"].forEach(ev => map.getCanvas().addEventListener(ev, stop, { passive: true }));
    const turn = () => { if (!spin || map.getPitch() < 20) return; map.easeTo({ bearing: map.getBearing() + 12, duration: 6000, easing: x => x }); };
    map.on("moveend", turn); setTimeout(turn, 900);
  });
  const view = three => {
    $("v3d").classList.toggle("on", three); $("v2d").classList.toggle("on", !three);
    map.setTerrain(three ? { source: "dem", exaggeration: 4 } : null);
    map.easeTo({ pitch: three ? 58 : 0, bearing: three ? -18 : 0, duration: 900 });
  };
  $("v3d").onclick = () => view(true);
  $("v2d").onclick = () => view(false);
  const base = sat => {
    $("bSat").classList.toggle("on", sat); $("bMap").classList.toggle("on", !sat);
    map.setLayoutProperty("sat", "visibility", sat ? "visible" : "none");
    map.setLayoutProperty("street", "visibility", sat ? "none" : "visible");
    ["roads", "places"].forEach(id => map.setLayoutProperty(id, "visibility", sat ? "visible" : "none"));
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
function esri(path, attribution) {
  return { type: "raster", tileSize: 256, maxzoom: 19, attribution,
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
    RAIN = j.hourly; RS = rainStats(RAIN); renderRainNow();
    const mm = v => `${nf(v, v < 10 ? 1 : 0)} <small>${t().mm}</small>`;
    $("k-next").innerHTML = mm(RS.next); $("k-past").innerHTML = mm(RS.past);
  }).catch(() => {});
  CY =await (await fetch(`/api/v1/nodes/${nodeId}/cyclones`)).json();
  renderCyclones();
  watchReveal();
})();
