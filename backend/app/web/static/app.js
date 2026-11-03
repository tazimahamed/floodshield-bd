/* FloodShield BD — map app */
const T = {
  en: {
    tagline: "Flood early warning · Bangladesh",
    searchPh: "Search an upazila or district…",
    official: "Official warnings come first: follow FFWC (ffwc.gov.bd), BMD and your Upazila Disaster Management Committee. FloodShield supports them and does not replace them.",
    viewRisk: "Flood risk", viewRain: "Rainfall", viewPast: "Past floods",
    dateLabel: "Date", today: "Today", past72: "Last 72h", next24: "Next 24h", next72: "Next 72h",
    allDivisions: "All Bangladesh", rivers: "Rivers", upstream: "Upstream basins (India, Nepal…)",
    loading: "Loading…", runningModel: "Running the model for this date…",
    live: t => `Live · updated ${t}`, pastMode: d => `Past date · ${d}`,
    statusEyebrow: "National flood outlook", statusEyebrowPast: "Model check for a past date",
    headlineNone: "No elevated flood risk", headlineSome: (h, m) => h ? `${h} upazilas at high risk` : `${m} upazilas at medium risk`,
    period: (a, b) => `Next 15 days · ${a} – ${b}`,
    high: "High", medium: "Medium", low: "Low",
    whatMeans: "Chance that at least 5% of an upazila goes under abnormal flood water (beyond normal monsoon water) in the next 15 days.",
    skill: (m, b) => `Tested on years it never saw: <b>${m}</b> AUC, vs ${b} for “places that usually flood”.`,
    modelDetails: "Model & data details",
    hindNote: "The model was run on actual (ERA5-Land) rain for this date, as if the rain forecast had been perfect. Future dates beyond today cannot be forecast.",
    observed: (name, hit, total) => `Satellite (Sentinel-1) saw <b>${total}</b> upazilas flooded in “${name}”. The model had <b>${hit}</b> of them at medium or high risk.`,
    noObserved: "No satellite flood map exists for this date (mapped: 1 Jun – 28 Sep, 2017–2025).",
    atRisk: "Exposed in medium/high-risk upazilas", roadKm: "km major roads",
    powerRipple: "upazilas may lose power", healthRipple: "lose hospital access",
    topRisk: "Highest flood risk", topRain: "Most rain expected", topRainPast: "Most rain, last 72h", topPast: "Most flooded",
    howTitle: "How to use",
    how1: "Search or click an upazila to see its flood risk, rainfall and facilities.",
    how2: "Switch the view to Rainfall or Past floods at the top of the map; pick a past date to check the model.",
    how3: "Open the full report for an upazila's flood history since 2017 and what happens if it floods.",
    backOverview: "← National overview", reportBtn: "Open flood history & impact report",
    riskOf: { low: "Low risk", medium: "Medium risk", high: "High risk" },
    chance: "chance of flooding",
    likelyRange: (f, a, b) => `Expected flooded share ${f}% · likely range ${a}–${b}%`,
    noForecast: "No flood forecast for this upazila yet.",
    rainTitle: "Rainfall", chartPast: "Past", chartFuture: "Forecast",
    upTitle: "Where its water comes from", upArea: "Area draining here", upOut: "Outside Bangladesh",
    upRain: "Rain forecast over that area (72h)", basins: "basins",
    assetsTitle: "Facilities in this upazila", noAssets: "None mapped in OpenStreetMap yet.",
    kinds: { hospital: "Hospitals", clinic: "Clinics", school: "Schools", college: "Colleges",
             shelter: "Shelters", substation: "Substations", power_plant: "Power plants" },
    flooded: "flooded", abnormal: "Abnormal flood water", allWater: "All water incl. seasonal",
    scenes: "Satellite scenes", pastPick: "Choose a past flood", mm: "mm",
    legendRisk: "Flood risk (15 days)", legendRain: h => `Rainfall, ${h}`, legendPast: "Area flooded",
    source: (r, issued) => `Rain: NOAA GFS via Open-Meteo, run #${r} (${issued} BST) · History: ERA5-Land · Floods: Sentinel-1 · Rivers: HydroSHEDS · Boundaries: BBS/OCHA · Facilities: © OpenStreetMap`,
    noResults: "No matching upazila", district: "district", upazila: "upazila",
  },
  bn: {
    tagline: "বন্যার আগাম সতর্কতা · বাংলাদেশ",
    searchPh: "উপজেলা বা জেলার নাম লিখুন…",
    official: "সরকারি সতর্কবার্তা আগে: FFWC (ffwc.gov.bd), আবহাওয়া অধিদপ্তর ও উপজেলা দুর্যোগ ব্যবস্থাপনা কমিটির নির্দেশনা মেনে চলুন। FloodShield এগুলোর সহায়ক, বিকল্প নয়।",
    viewRisk: "বন্যার ঝুঁকি", viewRain: "বৃষ্টি", viewPast: "অতীতের বন্যা",
    dateLabel: "তারিখ", today: "আজ", past72: "গত ৭২ ঘণ্টা", next24: "আগামী ২৪ ঘণ্টা", next72: "আগামী ৭২ ঘণ্টা",
    allDivisions: "সমগ্র বাংলাদেশ", rivers: "নদী", upstream: "উজানের অববাহিকা (ভারত, নেপাল…)",
    loading: "লোড হচ্ছে…", runningModel: "এই তারিখের জন্য মডেল চলছে…",
    live: t => `চলমান · হালনাগাদ ${t}`, pastMode: d => `অতীত তারিখ · ${d}`,
    statusEyebrow: "জাতীয় বন্যা পরিস্থিতি", statusEyebrowPast: "অতীত তারিখে মডেল যাচাই",
    headlineNone: "বন্যার বাড়তি ঝুঁকি নেই", headlineSome: (h, m) => h ? `${h}টি উপজেলায় উচ্চ ঝুঁকি` : `${m}টি উপজেলায় মাঝারি ঝুঁকি`,
    period: (a, b) => `আগামী ১৫ দিন · ${a} – ${b}`,
    high: "উচ্চ", medium: "মাঝারি", low: "নিম্ন",
    whatMeans: "আগামী ১৫ দিনে উপজেলার অন্তত ৫% এলাকা অস্বাভাবিক বন্যার পানিতে (স্বাভাবিক বর্ষার পানির বাইরে) ডোবার সম্ভাবনা।",
    skill: (m, b) => `যে বছরগুলো মডেল দেখেনি সেগুলোতে পরীক্ষা: AUC <b>${m}</b>, "যেখানে সাধারণত বন্যা হয়" পদ্ধতির ${b}।`,
    modelDetails: "মডেল ও ডেটার বিস্তারিত",
    hindNote: "এই তারিখের আসল বৃষ্টি (ERA5-Land) দিয়ে মডেল চালানো হয়েছে, যেন বৃষ্টির পূর্বাভাস নিখুঁত ছিল। আজকের পরের তারিখের পূর্বাভাস দেওয়া যায় না।",
    observed: (name, hit, total) => `স্যাটেলাইট (Sentinel-1) “${name}”-এ <b>${total}</b>টি উপজেলায় বন্যা দেখেছে। মডেল এর <b>${hit}</b>টিকে মাঝারি বা উচ্চ ঝুঁকিতে রেখেছিল।`,
    noObserved: "এই তারিখের কোনো স্যাটেলাইট বন্যা-ম্যাপ নেই (ম্যাপ করা: ২০১৭–২০২৫, ১ জুন – ২৮ সেপ্টেম্বর)।",
    atRisk: "মাঝারি/উচ্চ ঝুঁকির উপজেলায় যা ঝুঁকিতে", roadKm: "কিমি প্রধান সড়ক",
    powerRipple: "উপজেলায় বিদ্যুৎ যেতে পারে", healthRipple: "হাসপাতাল-সুবিধা হারাতে পারে",
    topRisk: "সর্বোচ্চ বন্যার ঝুঁকি", topRain: "সবচেয়ে বেশি বৃষ্টির পূর্বাভাস", topRainPast: "গত ৭২ ঘণ্টায় সবচেয়ে বেশি বৃষ্টি", topPast: "সবচেয়ে বেশি প্লাবিত",
    howTitle: "কীভাবে ব্যবহার করবেন",
    how1: "উপজেলা খুঁজুন বা ম্যাপে ক্লিক করুন — বন্যার ঝুঁকি, বৃষ্টি ও স্থাপনা দেখতে পাবেন।",
    how2: "ম্যাপের উপরে বৃষ্টি বা অতীতের বন্যা দেখুন; অতীত তারিখ বেছে মডেল যাচাই করুন।",
    how3: "পূর্ণ রিপোর্টে ২০১৭ থেকে উপজেলার বন্যার ইতিহাস ও ডুবলে কী হবে তা দেখুন।",
    backOverview: "← জাতীয় পরিস্থিতি", reportBtn: "বন্যার ইতিহাস ও প্রভাবের রিপোর্ট দেখুন",
    riskOf: { low: "নিম্ন ঝুঁকি", medium: "মাঝারি ঝুঁকি", high: "উচ্চ ঝুঁকি" },
    chance: "বন্যার সম্ভাবনা",
    likelyRange: (f, a, b) => `প্রত্যাশিত প্লাবিত অংশ ${f}% · সম্ভাব্য পরিসর ${a}–${b}%`,
    noForecast: "এই উপজেলার জন্য এখনো পূর্বাভাস নেই।",
    rainTitle: "বৃষ্টি", chartPast: "অতীত", chartFuture: "পূর্বাভাস",
    upTitle: "পানি কোথা থেকে আসে", upArea: "যত এলাকার পানি এখানে আসে", upOut: "বাংলাদেশের বাইরে",
    upRain: "ওই এলাকায় বৃষ্টির পূর্বাভাস (৭২ ঘণ্টা)", basins: "টি অববাহিকা",
    assetsTitle: "এই উপজেলার স্থাপনা", noAssets: "OpenStreetMap-এ এখনো কিছু চিহ্নিত নেই।",
    kinds: { hospital: "হাসপাতাল", clinic: "ক্লিনিক", school: "স্কুল", college: "কলেজ",
             shelter: "আশ্রয়কেন্দ্র", substation: "সাবস্টেশন", power_plant: "বিদ্যুৎকেন্দ্র" },
    flooded: "প্লাবিত", abnormal: "অস্বাভাবিক বন্যার পানি", allWater: "মৌসুমি পানিসহ মোট",
    scenes: "স্যাটেলাইট ছবি", pastPick: "একটি অতীতের বন্যা বাছুন", mm: "মিমি",
    legendRisk: "বন্যার ঝুঁকি (১৫ দিন)", legendRain: h => `বৃষ্টি, ${h}`, legendPast: "প্লাবিত এলাকা",
    source: (r, issued) => `বৃষ্টি: NOAA GFS (Open-Meteo), রান #${r} (${issued}) · ইতিহাস: ERA5-Land · বন্যা: Sentinel-1 · নদী: HydroSHEDS · সীমানা: BBS/OCHA · স্থাপনা: © OpenStreetMap`,
    noResults: "কোনো উপজেলা মেলেনি", district: "জেলা", upazila: "উপজেলা",
  },
};

/* ---------- state ---------- */
let lang = "en", view = "risk", lead = "rain_72h_mm";
let data = null, layer = null, selected = null, selectedLayer = null;
let hind = null, events = [], eventLabels = null, eventInfo = null;
let riverLayer = null, basinLayer = null, basinData = null, hiLayer = null, assetLayer = null;
try { lang = localStorage.getItem("fs-lang") || "en"; } catch (e) {}
const t = () => T[lang];
const $ = id => document.getElementById(id);
const nf = (v, d = 0) => Number(v).toLocaleString(lang === "bn" ? "bn-BD" : "en-GB", { maximumFractionDigits: d, minimumFractionDigits: d });
const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const dateFmt = s => new Date(s).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-GB", { day: "numeric", month: "short", year: "numeric" });

/* ---------- colour scales ---------- */
const RISK = { low: "#cfe9d8", medium: "#f6c453", high: "#e0503e" };
const riskOf = p => p == null ? null : p >= 0.5 ? "high" : p >= 0.25 ? "medium" : "low";
const RAIN_BREAKS = [0, 5, 20, 50, 100, 200];
const RAIN_COLORS = ["#eef5fb", "#c6dff0", "#86bde0", "#3f8fc9", "#1b5f9e", "#0b2f6b"];
const FLOOD_BREAKS = [0, 0.02, 0.05, 0.1, 0.2, 0.4];
const FLOOD_COLORS = ["#fbf3ef", "#fbd0b9", "#f6a582", "#ec6f4f", "#cf3a2b", "#8f1420"];
const step = (v, breaks, colors) => v == null ? "#d5dbe1" : colors[breaks.filter(b => v >= b).length - 1];
const KIND_COLORS = { hospital: "#d4382a", clinic: "#e45f9b", school: "#2f7fc1", college: "#7462c4",
                      shelter: "#2e9e5b", substation: "#e08a00", power_plant: "#8a5a2b" };

function fillFor(p) {
  if (view === "past") return step(eventLabels?.[p.id]?.abnormal_frac, FLOOD_BREAKS, FLOOD_COLORS);
  if (view === "rain") return step(p[lead], RAIN_BREAKS, RAIN_COLORS);
  const r = riskOf(p.flood_prob);
  return r ? RISK[r] : "#d5dbe1";
}
function valueFor(p) {
  if (view === "past") {
    const v = eventLabels?.[p.id];
    return v ? `${nf(v.abnormal_frac * 100, 1)}% ${t().flooded}` : "–";
  }
  if (view === "rain") return p[lead] == null ? "–" : `${nf(p[lead], 1)} ${t().mm}`;
  return p.flood_prob == null ? "–" : `${nf(p.flood_prob * 100)}%`;
}
function sortKey(p) {
  if (view === "past") return eventLabels?.[p.id]?.abnormal_frac ?? -1;
  if (view === "rain") return p[lead] ?? -1;
  return p.flood_prob ?? -1;
}

/* ---------- map ---------- */
const dark = matchMedia("(prefers-color-scheme: dark)").matches;
// keep the view on Bangladesh and its upstream region; never let it shrink to a dot
const BD_BOUNDS = L.latLngBounds([20.55, 88.0], [26.65, 92.7]);
const REGION_BOUNDS = L.latLngBounds([14.5, 76.0], [33.5, 101.0]);
const map = L.map("map", { zoomSnap: 0.25, zoomControl: false, minZoom: 6, maxBounds: REGION_BOUNDS,
                           maxBoundsViscosity: 0.8 });
map.fitBounds(BD_BOUNDS, { padding: [12, 12] });
const fitBangladesh = () => map.fitBounds(BD_BOUNDS, { padding: [12, 12] });
new ResizeObserver(() => { map.invalidateSize(); }).observe(document.getElementById("map"));
L.control.zoom({ position: "bottomright" }).addTo(map);
const home = L.control({ position: "bottomright" });
home.onAdd = () => {
  const b = L.DomUtil.create("a", "leaflet-bar home-btn");
  b.href = "#"; b.title = "Show all Bangladesh"; b.innerHTML = "⤢";
  L.DomEvent.on(b, "click", e => { L.DomEvent.preventDefault(e); fitBangladesh(); });
  return b;
};
home.addTo(map);
const ESRI = "https://server.arcgisonline.com/ArcGIS/rest/services";
// light: Ocean basemap (blue sea, soft terrain) — dark: dark grey canvas
L.tileLayer(`${ESRI}/${dark ? "Canvas/World_Dark_Gray_Base" : "Ocean/World_Ocean_Base"}/MapServer/tile/{z}/{y}/{x}`, {
  maxZoom: 16, maxNativeZoom: 13, attribution: "Basemap © Esri, GEBCO, NOAA, Garmin, HERE, © OpenStreetMap contributors · Boundaries BBS/OCHA · Rivers HydroSHEDS",
}).addTo(map);
map.createPane("labels").style.zIndex = 640;
map.getPane("labels").style.pointerEvents = "none";
L.tileLayer(`${ESRI}/${dark ? "Canvas/World_Dark_Gray_Reference" : "Ocean/World_Ocean_Reference"}/MapServer/tile/{z}/{y}/{x}`,
  { pane: "labels", maxZoom: 16, maxNativeZoom: 13, opacity: 0.9 }).addTo(map);
map.createPane("mask").style.zIndex = 460;
map.getPane("mask").style.pointerEvents = "none";
map.createPane("geo").style.zIndex = 650;
map.getPane("geo").style.pointerEvents = "none";
map.createPane("rivers").style.zIndex = 450;
let maskLayer = null;
const MASK = dark ? 0.5 : 0.38;  // neighbours stay readable, Bangladesh stands out

/* soften everything outside Bangladesh and draw a crisp national border */
async function drawCountry() {
  const f = await (await fetch("/api/v1/country-outline")).json();
  const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
  const ll = ring => ring.map(([x, y]) => [y, x]);
  const world = [[-89, -179], [-89, 179], [89, 179], [89, -179]];
  maskLayer = L.polygon([world, ...polys.map(p => ll(p[0]))], {
    pane: "mask", stroke: false, fillColor: dark ? "#0b1218" : "#ffffff", fillOpacity: MASK, interactive: false,
  }).addTo(map);
  // border only for the mainland and larger islands: hundreds of tiny Sundarbans islets
  // drawn with a thick line turn the coast into a dark blob at country zoom
  const big = p => { const b = L.latLngBounds(ll(p[0])); return b.getNorth() - b.getSouth() + b.getEast() - b.getWest() > 0.6; };
  const rings = polys.filter(big).map(p => ll(p[0]));
  L.polyline(rings, { pane: "geo", color: dark ? "#0b1218" : "#ffffff", weight: 4, opacity: 0.85, interactive: false }).addTo(map);
  L.polyline(rings, { pane: "geo", color: dark ? "#9fb3c6" : "#3d5266", weight: 1.3, opacity: 0.95, interactive: false }).addTo(map);
}
map.createPane("assets").style.zIndex = 620;

function baseStyle(f) {
  return { fillColor: fillFor(f.properties), fillOpacity: 0.85, weight: 0.6, color: dark ? "#0d141b" : "#ffffff", opacity: 1 };
}

function renderLegend() {
  const el = $("legend"), tt = t();
  if (view === "risk") {
    el.innerHTML = `<h4>${tt.legendRisk}</h4>` + [["high", "≥ 50%"], ["medium", "25–50%"], ["low", "< 25%"]]
      .map(([k, r]) => `<div class="row"><i style="background:${RISK[k]}"></i>${tt[k]} <span class="muted">${r}</span></div>`).join("");
  } else if (view === "rain") {
    const label = { rain_24h_mm: tt.next24, rain_48h_mm: "48h", rain_72h_mm: tt.next72, rain_past_72h_mm: tt.past72 }[lead];
    el.innerHTML = `<h4>${tt.legendRain(label)}</h4><div class="ramp">${RAIN_COLORS.map(c => `<span style="background:${c}"></span>`).join("")}</div>
      <div class="ramp-labels"><span>0</span><span>20</span><span>100</span><span>200+ ${tt.mm}</span></div>`;
  } else {
    el.innerHTML = `<h4>${tt.legendPast}</h4><div class="ramp">${FLOOD_COLORS.map(c => `<span style="background:${c}"></span>`).join("")}</div>
      <div class="ramp-labels"><span>0%</span><span>5%</span><span>20%</span><span>40%+</span></div>`;
  }
}

async function load(reframe = false) {
  const div = $("division").value;
  const res = await fetch("/api/v1/upazilas" + (div ? `?division=${encodeURIComponent(div)}` : ""));
  data = await res.json();
  if (hind) applyHindcast();
  if (layer) layer.remove();
  layer = L.geoJSON(data, {
    style: baseStyle,
    onEachFeature: (f, l) => {
      l.bindTooltip(() => `<div class="tt-name">${f.properties.name}</div><div class="tt-sub">${f.properties.district ?? ""}</div><b>${valueFor(f.properties)}</b>`, { sticky: true, direction: "top", offset: [0, -6] });
      l.on("mouseover", () => { if (l !== selectedLayer) l.setStyle({ weight: 2, color: css("--text") }); });
      l.on("mouseout", () => { if (l !== selectedLayer) layer.resetStyle(l); });
      l.on("click", () => select(f.properties.id));
    },
  }).addTo(map);
  if (riverLayer && map.hasLayer(riverLayer)) riverLayer.bringToFront();
  if (div) map.fitBounds(layer.getBounds(), { padding: [20, 20] });
  else if (reframe) fitBangladesh();
  if (selected) highlight(selected.id);
  renderSide();
}

function restyle() {
  layer && layer.setStyle(baseStyle);
  if (selected) highlight(selected.id);
  basinLayer && basinLayer.setStyle(f => ({ fillColor: step(f.properties[view === "rain" ? lead : "rain_72h_mm"], RAIN_BREAKS, RAIN_COLORS) }));
  renderLegend();
  renderSide();
}

function highlight(id) {
  if (selectedLayer) layer.resetStyle(selectedLayer);
  selectedLayer = null;
  layer.eachLayer(l => { if (l.feature.properties.id === id) selectedLayer = l; });
  if (selectedLayer) selectedLayer.setStyle({ weight: 3, color: css("--brand") }).bringToFront();
}

/* ---------- views ---------- */
function setView(v) {
  view = v;
  document.querySelectorAll("#view button").forEach(b => b.classList.toggle("on", b.dataset.view === v));
  document.querySelectorAll(".view-panel .sub").forEach(s => s.hidden = s.dataset.for !== v);
  if (v === "past" && !eventLabels && events.length) { $("event").value = events[events.length - 1].id; selectEvent(); return; }
  restyle();
}

async function selectEvent() {
  const id = $("event").value;
  eventInfo = events.find(e => e.id === id) || null;
  eventLabels = id ? await (await fetch(`/api/v1/flood-events/${id}`)).json() : null;
  restyle();
}

function applyHindcast() {
  data.features.forEach(f => Object.assign(f.properties, hind.upazilas[f.properties.id] || {}));
}

async function selectDay() {
  const day = $("day").value;
  const live = !day || day >= new Date().toISOString().slice(0, 10);
  $("day-clear").hidden = live;
  if (live) { hind = null; $("day").value = ""; await load(); renderFreshness(); return; }
  $("map-loading").hidden = false;
  $("map-loading").lastElementChild.textContent = t().runningModel;
  try {
    const res = await fetch(`/api/v1/hindcast?day=${day}`);
    if (!res.ok) { alert((await res.json()).detail); return; }
    hind = await res.json();
    applyHindcast();
    if (view !== "risk") setView("risk"); else restyle();
    renderFreshness();
  } finally { $("map-loading").hidden = true; }
}

/* ---------- side panel ---------- */
function counts() {
  const c = { high: 0, medium: 0, low: 0 };
  data.features.forEach(f => { const r = riskOf(f.properties.flood_prob); if (r) c[r]++; });
  return c;
}

function renderStatus() {
  const el = $("status"), tt = t(), r = data.flood_forecast_run, c = counts();
  const lvl = c.high ? "high" : c.medium ? "medium" : "low";
  el.className = `panel status ${lvl}`;
  if (!r && !hind) { el.innerHTML = `<div class="eyebrow">${tt.statusEyebrow}</div><p class="note">${tt.noForecast}</p>`; return; }
  let extra;
  if (hind) {
    const obs = Object.values(hind.upazilas).filter(v => v.observed_frac != null && v.observed_frac >= 0.05);
    const hit = obs.filter(v => v.flood_risk !== "low").length;
    extra = `<p class="note">${hind.observed_event ? tt.observed(hind.observed_event.name, hit, obs.length) : tt.noObserved}</p>
      <p class="note">${tt.hindNote}</p>`;
  } else {
    const m = r.metrics || {}, b = r.baseline || {};
    extra = `<p class="note">${tt.whatMeans}</p>
      <div class="skill">${tt.skill(m.auc ?? "–", b.auc ?? "–")}</div>
      <details class="more"><summary>${tt.modelDetails}</summary>
        ${r.model_version}<br>GFS run #${r.rain_run_id} · ERA5-Land → ${r.era5_last_day}<br>
        P(≥5% abnormal flood) · ${(r.thresholds && `medium ≥ ${r.thresholds.medium * 100}%, high ≥ ${r.thresholds.high * 100}%`) || ""}</details>`;
  }
  el.innerHTML = `<div class="eyebrow">${hind ? tt.statusEyebrowPast : tt.statusEyebrow}</div>
    <div class="headline">${c.high + c.medium ? tt.headlineSome(c.high, c.medium) : tt.headlineNone}</div>
    <div class="period">${hind ? dateFmt(hind.day) : tt.period(dateFmt(r.reference_day), dateFmt(r.valid_until))}</div>
    <div class="counts">
      <div class="h"><b>${nf(c.high)}</b><small>${tt.high}</small></div>
      <div class="m"><b>${nf(c.medium)}</b><small>${tt.medium}</small></div>
      <div class="l"><b>${nf(c.low)}</b><small>${tt.low}</small></div>
    </div>${extra}`;
  const box = $("at-risk");
  box.hidden = hind || !(c.high + c.medium);
  if (!box.hidden) showAtRisk();
}

async function showAtRisk() {
  const res = await fetch("/api/v1/assets/at-risk?min_risk=medium");
  if (!res.ok) return;
  const r = await res.json(), tt = t();
  const road = Object.values(r.road_km).reduce((a, b) => a + b, 0);
  $("at-risk").innerHTML = `<div class="panel-head"><h2>${tt.atRisk}</h2></div><div class="chips">
    ${Object.entries(r.direct).map(([k, v]) => `<span><i style="background:${KIND_COLORS[k]}"></i>${nf(v)} ${tt.kinds[k] ?? k}</span>`).join("")}
    <span>${nf(road)} ${tt.roadKm}</span>
    <span>${nf(r.power_ripple.length)} ${tt.powerRipple}</span>
    <span>${nf(r.health_ripple.length)} ${tt.healthRipple}</span></div>`;
}

function renderTop() {
  const tt = t();
  $("top-title").textContent = view === "past" ? tt.topPast : view === "rain"
    ? (lead === "rain_past_72h_mm" ? tt.topRainPast : tt.topRain) : tt.topRisk;
  const rows = [...data.features].filter(f => sortKey(f.properties) >= 0)
    .sort((a, b) => sortKey(b.properties) - sortKey(a.properties)).slice(0, 10);
  const max = Math.max(1e-9, ...rows.map(f => sortKey(f.properties)));
  $("top").innerHTML = rows.map(f => {
    const p = f.properties;
    return `<li data-id="${p.id}"><span class="nm">${p.name} <small>${p.district ?? ""}</small></span>
      <span class="val">${valueFor(p)}</span>
      <span class="bar"><span style="width:${(sortKey(p) / max) * 100}%;background:${fillFor(p)}"></span></span></li>`;
  }).join("") || `<li class="empty">–</li>`;
  document.querySelectorAll("#top li[data-id]").forEach(li => li.onclick = () => select(li.dataset.id, true));
}

function renderSide() {
  if (!data) return;
  renderStatus();
  renderTop();
  const run = data.rain_run;
  if (run) {
    const issued = new Date(run.issued_at).toLocaleString(lang === "bn" ? "bn-BD" : "en-GB",
      { timeZone: "Asia/Dhaka", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    $("source").innerHTML = t().source(run.id, issued);
  }
  if (selected) renderDetail();
}

function renderFreshness() {
  const el = $("freshness"), run = data?.rain_run;
  if (hind) { el.className = "chip live past"; el.textContent = t().pastMode(dateFmt(hind.day)); return; }
  el.className = "chip live";
  el.textContent = run ? t().live(new Date(run.issued_at).toLocaleTimeString(lang === "bn" ? "bn-BD" : "en-GB",
    { timeZone: "Asia/Dhaka", hour: "2-digit", minute: "2-digit" })) : "";
}

/* ---------- selected upazila ---------- */
function select(id, zoom = false) {
  const f = data.features.find(x => x.properties.id === id);
  if (!f) return;
  selected = f.properties;
  highlight(id);
  if (zoom) map.fitBounds(L.geoJSON(f).getBounds(), { maxZoom: 10, padding: [40, 40] });
  $("overview").hidden = true;
  $("detail").hidden = false;
  $("side").scrollTop = 0;
  $("report-link").href = `/upazila/${id}`;
  renderDetail();
  loadRain(id);
  showUpstream(id);
  showAssets(id);
}

function closeDetail() {
  selected = null;
  if (selectedLayer) layer.resetStyle(selectedLayer);
  selectedLayer = null;
  [hiLayer, assetLayer].forEach(l => l && l.remove());
  $("detail").hidden = true;
  $("overview").hidden = false;
}

function renderDetail() {
  const p = selected, tt = t();
  $("d-name").textContent = p.name;
  $("d-where").textContent = [p.district, p.division].filter(Boolean).join(" · ");
  const r = riskOf(p.flood_prob), box = $("d-risk");
  if (!r) { box.className = "risk-card"; box.innerHTML = `<p>${tt.noForecast}</p>`; }
  else {
    const pct = Math.round(p.flood_prob * 100);
    box.className = `risk-card ${r}`;
    box.innerHTML = `<span class="lvl">${tt.riskOf[r]}</span>
      <div class="prob">${nf(pct)}% <small>${tt.chance}</small></div>
      <div class="meter"><span style="width:${pct}%;background:var(--${r === "medium" ? "med" : r})"></span></div>
      ${p.flood_frac != null ? `<p>${tt.likelyRange(nf(p.flood_frac * 100), nf((p.frac_p10 ?? p.flood_frac) * 100), nf((p.frac_p90 ?? p.flood_frac) * 100))}</p>` : ""}
      ${hind ? `<p>${dateFmt(hind.day)}${p.observed_frac != null ? ` · Sentinel-1: ${nf(p.observed_frac * 100, 1)}% ${tt.flooded}` : ""}</p>` : ""}`;
  }
  const v = x => x == null ? "–" : `${nf(x, 1)}`;
  $("d-past").textContent = v(p.rain_past_72h_mm); $("d-24").textContent = v(p.rain_24h_mm); $("d-72").textContent = v(p.rain_72h_mm);
}

async function loadRain(id) {
  const res = await fetch(`/api/v1/nodes/${id}/rain`);
  if (res.ok && selected?.id === id) drawChart((await res.json()).hourly);
}

function drawChart(h) {
  const c = $("chart"), ctx = c.getContext("2d"), H = 150;
  c.width = c.clientWidth * devicePixelRatio; c.height = H * devicePixelRatio;
  ctx.scale(devicePixelRatio, devicePixelRatio);
  const w = c.clientWidth, n = h.precipitation.length, padL = 28, padB = 18;
  const max = Math.max(1, ...h.precipitation.map(v => v ?? 0));
  const bw = (w - padL) / n, now = Date.now();
  ctx.clearRect(0, 0, w, H);
  ctx.font = "11px Inter, sans-serif"; ctx.fillStyle = css("--muted"); ctx.strokeStyle = css("--line");
  [0, 0.5, 1].forEach(k => {
    const y = H - padB - k * (H - padB - 8);
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w, y); ctx.stroke();
    ctx.fillText((max * k).toFixed(k ? 1 : 0), 0, y + 4);
  });
  let nowX = null;
  const labelEvery = Math.max(1, Math.ceil(52 / (bw * 24)));  // ~52 px per date label
  h.precipitation.forEach((v, i) => {
    const ts = Date.parse(h.time[i] + "Z"), x = padL + i * bw;
    if (nowX == null && ts >= now) nowX = x;
    ctx.fillStyle = ts < now ? "#9aa5ae" : css("--rain");
    const bh = ((v ?? 0) / max) * (H - padB - 8);
    ctx.fillRect(x, H - padB - bh, Math.max(1, bw - 0.6), bh);
    if (h.time[i].endsWith("T00:00") && Math.round(i / 24) % labelEvery === 0) {
      ctx.fillStyle = css("--muted");
      ctx.fillText(new Date(ts).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-GB", { day: "numeric", month: "short" }), x + 2, H - 4);
    }
  });
  if (nowX != null) {
    ctx.strokeStyle = css("--text"); ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(nowX, 4); ctx.lineTo(nowX, H - padB); ctx.stroke(); ctx.setLineDash([]);
  }
  ctx.fillStyle = css("--muted"); ctx.fillText("mm/h", w - 30, 10);
}

async function showUpstream(id) {
  const res = await fetch(`/api/v1/nodes/${id}/upstream`), tt = t();
  if (!res.ok || selected?.id !== id) return;
  const u = await res.json();
  $("d-up").innerHTML = `<dl class="kv">
    <dt>${tt.upArea}</dt><dd>${nf(u.catchment_km2)} km²</dd>
    <dt>${tt.upOut}</dt><dd>${nf(u.outside_bd_km2)} km² (${nf(u.catchment_km2 ? 100 * u.outside_bd_km2 / u.catchment_km2 : 0)}%)</dd>
    <dt>${tt.upRain}</dt><dd>${u.rain_72h_mm == null ? "–" : `${nf(u.rain_72h_mm, 1)} ${tt.mm}`}</dd></dl>`;
  if (hiLayer) hiLayer.remove();
  if (!basinData) basinData = await (await fetch("/api/v1/basins")).json();
  const ids = new Set(u.basins);
  hiLayer = L.geoJSON({ type: "FeatureCollection", features: basinData.features.filter(f => ids.has(f.properties.id)) },
    { style: { color: "#e08a00", weight: 1.2, dashArray: "4 3", fillColor: "#f5a623", fillOpacity: 0.08 }, interactive: false }).addTo(map);
  hiLayer.bringToBack();
}

async function showAssets(id) {
  const res = await fetch(`/api/v1/nodes/${id}/assets`), tt = t();
  if (assetLayer) assetLayer.remove();
  if (!res.ok || selected?.id !== id) return;
  const fc = await res.json(), n = {};
  fc.features.forEach(f => n[f.properties.kind] = (n[f.properties.kind] || 0) + 1);
  $("d-assets").innerHTML = fc.features.length
    ? `<div class="chips">${Object.entries(n).sort((a, b) => b[1] - a[1]).map(([k, c]) =>
        `<span><i style="background:${KIND_COLORS[k]}"></i>${nf(c)} ${tt.kinds[k] ?? k}</span>`).join("")}</div>`
    : `<p class="empty">${tt.noAssets}</p>`;
  assetLayer = L.geoJSON(fc, {
    pointToLayer: (f, ll) => L.circleMarker(ll, { pane: "assets", radius: 5, color: "#fff", weight: 1.5, fillOpacity: 1,
                                                  fillColor: KIND_COLORS[f.properties.kind] }),
    onEachFeature: (f, l) => l.bindTooltip(`<div class="tt-name">${(lang === "bn" && f.properties.name_bn) || f.properties.name || "—"}</div><div class="tt-sub">${tt.kinds[f.properties.kind]}</div>`),
  }).addTo(map);
}

/* ---------- layers ---------- */
async function toggleRivers() {
  if (!$("show-rivers").checked) { riverLayer && riverLayer.remove(); return; }
  if (!riverLayer) {
    const r = await (await fetch("/api/v1/rivers")).json();
    riverLayer = L.geoJSON(r, { pane: "rivers", interactive: false, style: f => ({
      color: dark ? "#5aaee3" : "#2b7bbf", opacity: 0.85, weight: Math.max(0.8, Math.log10(f.properties.upland_km2) - 2.8) }) });
  }
  riverLayer.addTo(map);
}

async function toggleBasins() {
  if (!$("show-basins").checked) {
    basinLayer && basinLayer.remove();
    maskLayer && maskLayer.setStyle({ fillOpacity: MASK });
    return;
  }
  if (!basinData) basinData = await (await fetch("/api/v1/basins")).json();
  if (!basinLayer) basinLayer = L.geoJSON(basinData, {
    style: f => ({ fillColor: step(f.properties.rain_72h_mm, RAIN_BREAKS, RAIN_COLORS), weight: 0.4, color: "#8a96a3", fillOpacity: 0.55 }),
    onEachFeature: (f, l) => l.bindTooltip(() => `<div class="tt-name">${f.properties.name}</div><div class="tt-sub">${f.properties.region}</div>${t().next72}: <b>${f.properties.rain_72h_mm == null ? "–" : nf(f.properties.rain_72h_mm, 1) + " " + t().mm}</b>`, { sticky: true }),
  });
  basinLayer.addTo(map).bringToBack();
  maskLayer && maskLayer.setStyle({ fillOpacity: 0.15 });
  map.fitBounds(basinLayer.getBounds());
}

/* ---------- search ---------- */
let hits = [], active = -1;
function search(q) {
  const box = $("search-results");
  q = q.trim().toLowerCase();
  if (!q || !data) { box.hidden = true; return; }
  hits = data.features.map(f => f.properties)
    .filter(p => p.name.toLowerCase().includes(q) || (p.district || "").toLowerCase().includes(q))
    .sort((a, b) => (b.name.toLowerCase().startsWith(q) - a.name.toLowerCase().startsWith(q)) || a.name.localeCompare(b.name))
    .slice(0, 8);
  active = -1;
  box.innerHTML = hits.length
    ? hits.map((p, i) => `<li role="option" data-i="${i}"><span>${p.name}</span><span class="tag">${p.district ?? ""}, ${p.division ?? ""}</span></li>`).join("")
    : `<li class="empty">${t().noResults}</li>`;
  box.hidden = false;
  box.querySelectorAll("li[data-i]").forEach(li => li.onmousedown = () => pick(+li.dataset.i));
}
function pick(i) {
  const p = hits[i];
  if (!p) return;
  $("search").value = p.name;
  $("search-results").hidden = true;
  select(p.id, true);
}
$("search").addEventListener("input", e => search(e.target.value));
$("search").addEventListener("blur", () => setTimeout(() => $("search-results").hidden = true, 150));
$("search").addEventListener("keydown", e => {
  const items = [...$("search-results").querySelectorAll("li[data-i]")];
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    e.preventDefault();
    active = (active + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
    items.forEach((li, i) => li.classList.toggle("active", i === active));
  } else if (e.key === "Enter") pick(active >= 0 ? active : 0);
  else if (e.key === "Escape") $("search-results").hidden = true;
});

/* ---------- language ---------- */
function applyLang() {
  const tt = t();
  document.body.classList.toggle("bn", lang === "bn");
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach(el => el.textContent = tt[el.dataset.i18n]);
  document.querySelectorAll("[data-i18n-ph]").forEach(el => el.placeholder = tt[el.dataset.i18nPh]);
  $("lang").textContent = lang === "en" ? "বাংলা" : "English";
  $("event").firstElementChild && ($("event").firstElementChild.textContent = tt.pastPick);
  renderLegend();
  if (data) { renderSide(); renderFreshness(); }
}

/* ---------- wiring ---------- */
document.querySelectorAll("#view button").forEach(b => b.onclick = () => setView(b.dataset.view));
document.querySelectorAll("#lead button").forEach(b => b.onclick = () => {
  document.querySelectorAll("#lead button").forEach(x => x.classList.toggle("on", x === b));
  lead = b.dataset.lead; restyle();
});
$("event").onchange = selectEvent;
$("day").onchange = selectDay;
$("day").max = new Date().toISOString().slice(0, 10);
$("day-clear").onclick = () => { $("day").value = ""; selectDay(); };
$("division").onchange = () => load(true);
$("show-rivers").onchange = toggleRivers;
$("show-basins").onchange = toggleBasins;
$("detail-close").onclick = closeDetail;
$("lang").onclick = () => {
  lang = lang === "en" ? "bn" : "en";
  try { localStorage.setItem("fs-lang", lang); } catch (e) {}
  applyLang();
};
$("notice-close").onclick = () => {
  $("notice").hidden = true;
  try { sessionStorage.setItem("fs-notice", "off"); } catch (e) {}
  map.invalidateSize();
};
try { if (sessionStorage.getItem("fs-notice") === "off") $("notice").hidden = true; } catch (e) {}
document.addEventListener("keydown", e => { if (e.key === "Escape" && selected) closeDetail(); });

(async () => {
  $("event").innerHTML = `<option value=""></option>`;
  applyLang();
  $("map-loading").hidden = false;
  const [divs, evs] = await Promise.all([
    fetch("/api/v1/divisions").then(r => r.json()),
    fetch("/api/v1/flood-events").then(r => r.json()),
  ]);
  divs.forEach(d => $("division").insertAdjacentHTML("beforeend", `<option value="${d.name}">${d.name}</option>`));
  events = evs.filter(e => !e.id.startsWith("auto_"));  // monsoon windows are training labels only
  events.forEach(e => $("event").insertAdjacentHTML("beforeend",
    `<option value="${e.id}">${e.name}</option>`));
  drawCountry();
  await load();
  $("map-loading").hidden = true;
  renderFreshness();
  toggleRivers();
})();
