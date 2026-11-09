/* FloodShield BD — upazila flood report */
const T = {
  en: {
    back: "← Map", calTitle: "Flood calendar, 2017–2025",
    calSub: "Each box is a 15-day stretch of the monsoon, starting on the date above it. The number is how much of the upazila was under unusual flood water, as seen from satellite. Red boxes were floods.",
    rainTitle: "What brings floods here", monsoonTitle: "Monsoon rain each year", monsoonSub: "June to September, this upazila.",
    cycTitle: "🌀 Cyclones that passed close by",
    navOverview: "Overview", navCalendar: "Flood calendar", navRain: "Rain", navCyc: "Cyclones",
    about: "ⓘ About the data", print: "🖨 Print / PDF", notOfficial: "Supporting information, not an official warning. River levels and local waterlogging are not included in this estimate. Follow FFWC, BMD and your upazila administration first.",
    csv: "⬇ CSV",
    crumb: (d, v) => `${d} district · ${v} division`,
    lead: (n, total, oneIn) => n
      ? `Over the last nine monsoons, unusual flood water covered part of this upazila in <b>${n} of ${total}</b> half-months — about <b>1 in ${oneIn}</b>.`
      : `Over the last nine monsoons the satellite saw no unusual flooding here in any of ${total} half-months.`,
    nowTitle: "Next 15 days", risk: { low: "Low risk", medium: "Medium risk", high: "High risk" },
    chance: p => `Estimated ${p}% chance of flooding`,
    tFloods: "Floods since 2017", tFloodsD: (n, total) => `${n} of ${total} monsoon half-months`,
    tWorst: "Worst flood seen", tWorstD: (pct, km2) => `${pct}% of the upazila · ${km2} km²`, tNoFlood: "None seen",
    tWater: "Water comes from", tWaterD: o => o > 0 ? `${o}% of that area is in India / upstream` : "all of it inside Bangladesh",
    before: "Before floods", normal: "Normal times",
    story: (f, n, low, up) => `Floods here have usually come after about <b>${f} mm</b> of rain in two weeks. In normal half-months it was about ${n} mm. The least rain that was still followed by a flood was ${low} mm.${up ? ` Upstream, rain before floods was about ${up} mm.` : ""}`,
    noStory: "There were no floods here in the satellite record, so there is no rain pattern to show.",
    legendLow: "none", legendHigh: "more water",
    tipRange: (a, b) => `${a} – ${b}`, tipWater: p => `Unusual water: ${p}% of the upazila`,
    tipRain: (b, u) => `Rain in the 2 weeks before: ${b} mm (upstream ${u} mm)`, tipFlood: "Flood",
    cycSummary: (n50, n150) => `Since 1960, <b>${n50}</b> cyclone or depression centres passed within 50 km of this upazila, and ${n150} within 150 km.`,
    cycItem: (km, kmh) => `${km} km away${kmh ? ` · ${kmh} km/h` : ""}`,
    months: ["Jun", "Jul", "Aug", "Sep"], halves: ["1–15", "16–30"], notFound: "Upazila not found", mm: "mm",
  },
  bn: {
    back: "← ম্যাপ", calTitle: "বন্যার ক্যালেন্ডার, ২০১৭–২০২৫",
    calSub: "প্রতিটি ঘর বর্ষার ১৫ দিনের একটি সময়, উপরে লেখা তারিখ থেকে শুরু। সংখ্যাটি দেখায় স্যাটেলাইটে উপজেলার কতটা অংশ অস্বাভাবিক বন্যার পানির নিচে দেখা গেছে। লাল ঘর মানে বন্যা।",
    rainTitle: "এখানে বন্যা কখন হয়", monsoonTitle: "প্রতি বছর বর্ষার বৃষ্টি", monsoonSub: "জুন থেকে সেপ্টেম্বর, এই উপজেলায়।",
    cycTitle: "🌀 কাছ দিয়ে যাওয়া ঘূর্ণিঝড়",
    navOverview: "সারসংক্ষেপ", navCalendar: "বন্যার ক্যালেন্ডার", navRain: "বৃষ্টি", navCyc: "ঘূর্ণিঝড়",
    about: "ⓘ ডেটা সম্পর্কে", print: "🖨 প্রিন্ট / PDF", notOfficial: "এটি সহায়ক তথ্য, সরকারি সতর্কবার্তা নয়। নদীর পানির স্তর ও স্থানীয় জলাবদ্ধতা এই হিসাবে নেই। FFWC, আবহাওয়া অধিদপ্তর ও উপজেলা প্রশাসনের নির্দেশনা আগে মানুন।",
    csv: "⬇ CSV",
    crumb: (d, v) => `${d} জেলা · ${v} বিভাগ`,
    lead: (n, total, oneIn) => n
      ? `গত নয় বর্ষায় এই উপজেলার একাংশ <b>${total}টি অর্ধমাসের ${n}টিতে</b> অস্বাভাবিক বন্যার পানিতে ডুবেছে — মোটামুটি <b>প্রতি ${oneIn}টিতে ১টি</b>।`
      : `গত নয় বর্ষার ${total}টি অর্ধমাসে স্যাটেলাইট এখানে কোনো অস্বাভাবিক বন্যা দেখেনি।`,
    nowTitle: "আগামী ১৫ দিন", risk: { low: "নিম্ন ঝুঁকি", medium: "মাঝারি ঝুঁকি", high: "উচ্চ ঝুঁকি" },
    chance: p => `বন্যার আনুমানিক সম্ভাবনা ${p}%`,
    tFloods: "২০১৭ থেকে বন্যা", tFloodsD: (n, total) => `বর্ষার ${total}টি অর্ধমাসের ${n}টিতে`,
    tWorst: "সবচেয়ে বড় বন্যা", tWorstD: (pct, km2) => `উপজেলার ${pct}% · ${km2} বর্গকিমি`, tNoFlood: "দেখা যায়নি",
    tWater: "পানি আসে", tWaterD: o => o > 0 ? `এর ${o}% এলাকা ভারতে / উজানে` : "পুরোটাই বাংলাদেশের ভেতর থেকে",
    before: "বন্যার আগে", normal: "স্বাভাবিক সময়ে",
    story: (f, n, low, up) => `এখানে সাধারণত দুই সপ্তাহে প্রায় <b>${f} মিমি</b> বৃষ্টির পরে বন্যা হয়েছে। স্বাভাবিক সময়ে তা ছিল প্রায় ${n} মিমি। সবচেয়ে কম যে বৃষ্টির পরেও বন্যা হয়েছে: ${low} মিমি।${up ? ` উজানে বন্যার আগে বৃষ্টি ছিল প্রায় ${up} মিমি।` : ""}`,
    noStory: "স্যাটেলাইটের রেকর্ডে এখানে কোনো বন্যা নেই, তাই বৃষ্টির ধরন দেখানো সম্ভব নয়।",
    legendLow: "নেই", legendHigh: "বেশি পানি",
    tipRange: (a, b) => `${a} – ${b}`, tipWater: p => `অস্বাভাবিক পানি: উপজেলার ${p}%`,
    tipRain: (b, u) => `আগের ২ সপ্তাহে বৃষ্টি: ${b} মিমি (উজানে ${u} মিমি)`, tipFlood: "বন্যা",
    cycSummary: (n50, n150) => `১৯৬০ থেকে <b>${n50}</b>টি ঘূর্ণিঝড় বা নিম্নচাপের কেন্দ্র এই উপজেলার ৫০ কিমির মধ্যে দিয়ে গেছে, আর ${n150}টি ১৫০ কিমির মধ্যে দিয়ে।`,
    cycItem: (km, kmh) => `${km} কিমি দূরে${kmh ? ` · ${kmh} কিমি/ঘণ্টা` : ""}`,
    months: ["জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর"], halves: ["১–১৫", "১৬–৩০"], notFound: "উপজেলা পাওয়া যায়নি", mm: "মিমি",
  },
};
let lang = "en", R = null, CY = null, nodeId = null;
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
  now.innerHTML = c ? `<small>${tt.nowTitle}</small><b>${tt.risk[c.risk]}</b><span>${tt.chance(nf(Math.round(c.flood_prob * 100)))}</span>` : "";
  const w = s && s.worst;
  $("tiles").innerHTML = `
    <div class="tile reveal"><div class="ti">🌊</div><div class="k">${tt.tFloods}</div><div class="v"><span class="count" data-to="${s ? s.flooded_windows : 0}">0</span> <small>/ ${s ? nf(s.windows) : "–"}</small></div><div class="d">${s ? tt.tFloodsD(nf(s.flooded_windows), nf(s.windows)) : ""}</div></div>
    <div class="tile reveal"><div class="ti">📅</div><div class="k">${tt.tWorst}</div><div class="v">${w ? monthYear(w.start) : tt.tNoFlood}</div><div class="d">${w ? `${dayMonth(w.start)} – ${dayMonth(w.end)} · ${tt.tWorstD(nf(w.flooded_pct, 0), nf(w.flooded_km2, w.flooded_km2 < 10 ? 1 : 0))}` : ""}</div></div>
    <div class="tile reveal"><div class="ti">💧</div><div class="k">${tt.tWater}</div><div class="v"><span class="count" data-to="${n.catchment_km2}">0</span> <small>km²</small></div><div class="d">${tt.tWaterD(n.outside_bd_pct)}</div></div>`;
  countUp();
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
["overview", "calendar", "rain", "cyclones"].forEach(id => navIo.observe($(id)));

async function miniMap() {
  const res = await fetch(`/api/v1/nodes/${nodeId}/shape`);
  if (!res.ok) return;
  const shape = await res.json();
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
  miniMap();
  CY = await (await fetch(`/api/v1/nodes/${nodeId}/cyclones`)).json();
  renderCyclones();
  watchReveal();
})();
