/* FloodShield BD — map app (full-screen map, dark HUD) */
const T = {
  en: {
    tagline: "Flood early warning · Bangladesh",
    searchPh: "Search an upazila or district…",
    official: "Official warnings come first: follow FFWC (ffwc.gov.bd), BMD and your Upazila Disaster Management Committee. FloodShield supports them and does not replace them.",
    viewRisk: "Flood risk", viewRain: "Rainfall", viewPast: "Past floods", viewCyc: "Cyclones",
    cycEyebrow: "Cyclone history · NOAA IBTrACS", cycTop: "Closest to the track",
    cycBand: ["≤ 50 km", "50–100 km", "100–150 km"], cycScale: "Distance from the storm centre",
    cycFromTrack: km => `${km} km from the track`, cycWind: kt => `IMD wind nearby ${kt} kt (${Math.round(kt * 1.852)} km/h)`,
    cycPeak: "Peak (IMD)", cycLandfall: "Landfall", cycNoWind: "Wind not recorded in IBTrACS",
    cycJtwc: kt => `US JTWC estimate: ${kt} kt (1-min wind, a different measure)`, cycProvisional: "Provisional track (not yet final)",
    cycNote: "Track: official best track of IMD New Delhi (the WMO regional centre for the Bay of Bengal), from NOAA IBTrACS. Upazilas are coloured by how close the storm centre passed; strong winds reach further than the centre.",
    cycHistTitle: "🌀 Cyclones since 1960",
    cycHist: (n50, n150) => `<b>${n50}</b> storm tracks passed within 50 km, <b>${n150}</b> within 150 km (IBTrACS, IMD best track).`,
    cycStrongest: "Strongest nearby",
    cycNoLand: "Did not make landfall",
    cycFar: km => `Never within 150 km of an upazila (closest ${km} km from Bangladesh)`, cycUpz: n => `${n} upazilas within 150 km`,
    dateLabel: "Date", today: "Today", total24: "Next 24h", total72: "Next 72h",
    past72: "Last 72h", next24: "Next 24h", next72: "Next 72h",
    allDivisions: "All Bangladesh", rivers: "Rivers", upstream: "Upstream basins (India, Nepal…)",
    layersTitle: "Map layers", loading: "Loading…", runningModel: "Running the model for this date…",
    tHome: "Show all Bangladesh", tSearch: "Search", tLayers: "Layers", tTheme: "Dark / light map", tPanel: "Details panel",
    overviewTitle: "National overview", detailTitle: "Upazila details",
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
    topRisk: "Highest flood risk", topRain: "Most rain expected", topRainPast: "Most rain, last 72h", topPast: "Most flooded",
    howTitle: "How to use",
    how1: "Search or click an upazila to see its flood risk, rainfall and facilities.",
    how2: "Switch to Rainfall or Past floods at the top; pick a past date under Flood risk to check the model.",
    how3: "Open the full report for an upazila's flood history since 2017 and the rain behind each flood.",
    backOverview: "← National overview", reportBtn: "Open flood history report",
    riskOf: { low: "Low risk", medium: "Medium risk", high: "High risk" },
    chance: "chance of flooding",
    likelyRange: (f, a, b) => `Expected flooded share ${f}% · likely range ${a}–${b}%`,
    noForecast: "No flood forecast for this upazila yet.",
    rainTitle: "Rainfall", chartPast: "Past", chartFuture: "Forecast",
    hospTitle: "🏥 Government hospitals",
    hospNote: (d) => `Official DGHS Facility Registry (Ministry of Health). Shown only where the registry's location falls inside this upazila. Fetched ${d}.`,
    beds: "beds", call: "Call", profile: "DGHS profile",
    upTitle: "Where its water comes from", upArea: "Area draining here", upOut: "Outside Bangladesh",
    upRain: "Rain forecast over that area (72h)",
    flooded: "flooded", pastPick: "Choose a past flood", mm: "mm", mmh: "mm/h",
    stripRain: v => `Next 72h rain ${v}`, risk: "risk",
    sourcesTitle: "ⓘ Data sources",
    source: (r, issued) => `<b>Rain forecast</b>: NOAA GFS via Open-Meteo, run #${r} (${issued} BST)<br><b>Rain & soil history</b>: ERA5-Land (ECMWF)<br><b>Past floods</b>: Sentinel-1 radar (ESA/Copernicus)<br><b>Rivers & basins</b>: HydroSHEDS<br><b>Boundaries</b>: BBS/OCHA (geoBoundaries)<br><b>Basemap</b>: Esri`,
    noResults: "No matching upazila", now: "Now",
  },
  bn: {
    tagline: "বন্যার আগাম সতর্কতা · বাংলাদেশ",
    searchPh: "উপজেলা বা জেলার নাম লিখুন…",
    official: "সরকারি সতর্কবার্তা আগে: FFWC (ffwc.gov.bd), আবহাওয়া অধিদপ্তর ও উপজেলা দুর্যোগ ব্যবস্থাপনা কমিটির নির্দেশনা মেনে চলুন। FloodShield এগুলোর সহায়ক, বিকল্প নয়।",
    viewRisk: "বন্যার ঝুঁকি", viewRain: "বৃষ্টি", viewPast: "অতীতের বন্যা", viewCyc: "ঘূর্ণিঝড়",
    cycEyebrow: "ঘূর্ণিঝড়ের ইতিহাস · NOAA IBTrACS", cycTop: "ঝড়ের পথের সবচেয়ে কাছে",
    cycBand: ["≤ ৫০ কিমি", "৫০–১০০ কিমি", "১০০–১৫০ কিমি"], cycScale: "ঝড়ের কেন্দ্র থেকে দূরত্ব",
    cycFromTrack: km => `ঝড়ের পথ থেকে ${km} কিমি`, cycWind: kt => `কাছাকাছি IMD বাতাস ${kt} নট (${Math.round(kt * 1.852)} কিমি/ঘণ্টা)`,
    cycPeak: "সর্বোচ্চ (IMD)", cycLandfall: "আঘাত হানে", cycNoWind: "IBTrACS-এ বাতাসের গতি রেকর্ড নেই",
    cycJtwc: kt => `মার্কিন JTWC-এর হিসাব: ${kt} নট (১ মিনিটের বাতাস, ভিন্ন মাপ)`, cycProvisional: "অস্থায়ী পথ (এখনো চূড়ান্ত নয়)",
    cycNote: "পথ: IMD নয়াদিল্লির (বঙ্গোপসাগরের জন্য WMO-র আঞ্চলিক কেন্দ্র) অফিসিয়াল best track, NOAA IBTrACS থেকে। উপজেলার রঙ দেখায় ঝড়ের কেন্দ্র কত কাছ দিয়ে গেছে; জোরালো বাতাস কেন্দ্রের চেয়ে দূর পর্যন্ত যায়।",
    cycHistTitle: "🌀 ১৯৬০ থেকে ঘূর্ণিঝড়",
    cycHist: (n50, n150) => `<b>${n50}</b>টি ঝড়ের পথ ৫০ কিমির মধ্যে, <b>${n150}</b>টি ১৫০ কিমির মধ্যে দিয়ে গেছে (IBTrACS, IMD best track)।`,
    cycStrongest: "কাছ দিয়ে যাওয়া সবচেয়ে শক্তিশালী",
    cycNoLand: "স্থলভাগে আঘাত হানেনি",
    cycFar: km => `কোনো উপজেলার ১৫০ কিমির মধ্যে আসেনি (বাংলাদেশ থেকে সবচেয়ে কাছে ${km} কিমি)`, cycUpz: n => `${n}টি উপজেলা ১৫০ কিমির মধ্যে`,
    dateLabel: "তারিখ", today: "আজ", total24: "আগামী ২৪ ঘণ্টা", total72: "আগামী ৭২ ঘণ্টা",
    past72: "গত ৭২ ঘণ্টা", next24: "আগামী ২৪ ঘণ্টা", next72: "আগামী ৭২ ঘণ্টা",
    allDivisions: "সমগ্র বাংলাদেশ", rivers: "নদী", upstream: "উজানের অববাহিকা (ভারত, নেপাল…)",
    layersTitle: "ম্যাপের স্তর", loading: "লোড হচ্ছে…", runningModel: "এই তারিখের জন্য মডেল চলছে…",
    tHome: "পুরো বাংলাদেশ", tSearch: "খুঁজুন", tLayers: "স্তর", tTheme: "গাঢ় / হালকা ম্যাপ", tPanel: "বিস্তারিত প্যানেল",
    overviewTitle: "জাতীয় পরিস্থিতি", detailTitle: "উপজেলার বিস্তারিত",
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
    topRisk: "সর্বোচ্চ বন্যার ঝুঁকি", topRain: "সবচেয়ে বেশি বৃষ্টির পূর্বাভাস", topRainPast: "গত ৭২ ঘণ্টায় সবচেয়ে বেশি বৃষ্টি", topPast: "সবচেয়ে বেশি প্লাবিত",
    howTitle: "কীভাবে ব্যবহার করবেন",
    how1: "উপজেলা খুঁজুন বা ম্যাপে ক্লিক করুন — বন্যার ঝুঁকি, বৃষ্টি ও স্থাপনা দেখতে পাবেন।",
    how2: "উপরে বৃষ্টি বা অতীতের বন্যা দেখুন; বন্যার ঝুঁকিতে অতীত তারিখ বেছে মডেল যাচাই করুন।",
    how3: "পূর্ণ রিপোর্টে ২০১৭ থেকে উপজেলার বন্যার ইতিহাস ও প্রতিটি বন্যার আগের বৃষ্টি দেখুন।",
    backOverview: "← জাতীয় পরিস্থিতি", reportBtn: "বন্যার ইতিহাসের রিপোর্ট দেখুন",
    riskOf: { low: "নিম্ন ঝুঁকি", medium: "মাঝারি ঝুঁকি", high: "উচ্চ ঝুঁকি" },
    chance: "বন্যার সম্ভাবনা",
    likelyRange: (f, a, b) => `প্রত্যাশিত প্লাবিত অংশ ${f}% · সম্ভাব্য পরিসর ${a}–${b}%`,
    noForecast: "এই উপজেলার জন্য এখনো পূর্বাভাস নেই।",
    rainTitle: "বৃষ্টি", chartPast: "অতীত", chartFuture: "পূর্বাভাস",
    hospTitle: "🏥 সরকারি হাসপাতাল",
    hospNote: (d) => `সরকারি উৎস: স্বাস্থ্য অধিদপ্তরের (DGHS) ফ্যাসিলিটি রেজিস্ট্রি। রেজিস্ট্রির অবস্থান এই উপজেলার ভেতরে পড়লে তবেই দেখানো হয়। সংগ্রহ: ${d}।`,
    beds: "শয্যা", call: "ফোন", profile: "DGHS প্রোফাইল",
    upTitle: "পানি কোথা থেকে আসে", upArea: "যত এলাকার পানি এখানে আসে", upOut: "বাংলাদেশের বাইরে",
    upRain: "ওই এলাকায় বৃষ্টির পূর্বাভাস (৭২ ঘণ্টা)",
    flooded: "প্লাবিত", pastPick: "একটি অতীতের বন্যা বাছুন", mm: "মিমি", mmh: "মিমি/ঘণ্টা",
    stripRain: v => `আগামী ৭২ ঘণ্টায় বৃষ্টি ${v}`, risk: "ঝুঁকি",
    sourcesTitle: "ⓘ ডেটার উৎস",
    source: (r, issued) => `<b>বৃষ্টির পূর্বাভাস</b>: NOAA GFS (Open-Meteo), রান #${r} (${issued})<br><b>বৃষ্টি ও মাটির ইতিহাস</b>: ERA5-Land (ECMWF)<br><b>অতীতের বন্যা</b>: Sentinel-1 রাডার (ESA/Copernicus)<br><b>নদী ও অববাহিকা</b>: HydroSHEDS<br><b>সীমানা</b>: BBS/OCHA (geoBoundaries)<br><b>ম্যাপ</b>: Esri`,
    noResults: "কোনো উপজেলা মেলেনি", now: "এখন",
  },
};

/* ---------- state ---------- */
let lang = "en", view = "risk", lead = "rain_24h_mm";
let data = null, layer = null, selected = null, selectedLayer = null;
let hind = null, events = [], eventLabels = null;
let cycList = [], cyc = null, cycLayer = null;
let riverLayer = null, basinLayer = null, basinData = null, hiLayer = null, maskLayer = null, hospLayer = null;
let mapDark = true;
try { lang = localStorage.getItem("fs-lang") || "en"; mapDark = localStorage.getItem("fs-map") !== "light"; } catch (e) {}
const t = () => T[lang];
const $ = id => document.getElementById(id);
const loc = () => lang === "bn" ? "bn-BD" : "en-GB";
const nf = (v, d = 0) => Number(v).toLocaleString(loc(), { maximumFractionDigits: d, minimumFractionDigits: d });
const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const dateFmt = s => new Date(s).toLocaleDateString(loc(), { day: "numeric", month: "short", year: "numeric" });

/* ---------- colour scales ---------- */
const RISK = { low: "#5bbf7e", medium: "#f4b740", high: "#e5483a" };
const riskOf = p => p == null ? null : p >= 0.5 ? "high" : p >= 0.25 ? "medium" : "low";
// rain colours tuned for a dark map: dry stays nearly invisible, heavy rain glows
const TOTAL = { breaks: [0, 1, 5, 10, 20, 50, 100, 200], colors: ["rgba(0,0,0,0)", "#3a6ea5", "#2f8fd8", "#33b3a6", "#7dcf3c", "#f2d43a", "#f07c2a", "#d42e5a"] };
const FLOOD = { breaks: [0, 0.02, 0.05, 0.1, 0.2, 0.4], colors: ["rgba(0,0,0,0)", "#f6c9a8", "#f39b6d", "#ea6a45", "#cf3a2b", "#8f1420"] };
const step = (v, s) => v == null ? "rgba(0,0,0,0)" : s.colors[s.breaks.filter(b => v >= b).length - 1];

const CYC_BANDS = [[50, "#e5483a"], [100, "#f4914a"], [150, "#f4d35e"]];
const cycOf = p => cyc?.upazilas[p.id];
function fillFor(p) {
  if (view === "cyc") { const e = cycOf(p); return e ? CYC_BANDS.find(([km]) => e.min_km <= km)[1] : "rgba(0,0,0,0)"; }
  if (view === "past") return step(eventLabels?.[p.id]?.abnormal_frac, FLOOD);
  if (view === "rain") return step(p[lead], TOTAL);
  const r = riskOf(p.flood_prob);
  return r ? RISK[r] : "rgba(0,0,0,0)";
}
function valueFor(p) {
  const tt = t();
  if (view === "cyc") {
    const e = cycOf(p);
    return e ? tt.cycFromTrack(nf(e.min_km)) + (e.wind_kt ? `<br>${tt.cycWind(e.wind_kt)}` : "") : "–";
  }
  if (view === "past") { const v = eventLabels?.[p.id]; return v ? `${nf(v.abnormal_frac * 100, 1)}% ${tt.flooded}` : "–"; }
  if (view === "rain") {
    const v = p[lead];
    return v == null ? "–" : `${nf(v, 1)} ${tt.mm}`;
  }
  return p.flood_prob == null ? "–" : `${nf(p.flood_prob * 100)}%`;
}
function sortKey(p) {
  if (view === "cyc") { const e = cycOf(p); return e ? 150 - e.min_km : -1; }
  if (view === "past") return eventLabels?.[p.id]?.abnormal_frac ?? -1;
  if (view === "rain") return p[lead] ?? -1;
  return p.flood_prob ?? -1;
}

/* ---------- map ---------- */
const BD_BOUNDS = L.latLngBounds([20.55, 88.0], [26.65, 92.7]);
const REGION_BOUNDS = L.latLngBounds([14.5, 76.0], [33.5, 101.0]);
const map = L.map("map", { zoomSnap: 0.25, zoomControl: false, minZoom: 6, maxBounds: REGION_BOUNDS, maxBoundsViscosity: 0.8 });
map.setView([23.7, 90.3], 7);
// fitBounds throws (NaN LatLng) when the padding is larger than the map; fall back to no padding
function safeFit(bounds, opts = {}) {
  try { map.fitBounds(bounds, opts); } catch (e) { try { map.fitBounds(bounds); } catch (e2) { /* map not sized yet */ } }
}
function fitBangladesh() {
  // keep the country clear of the floating panels, but only when the map is wide enough for that
  const { x: w, y: h } = map.getSize();
  if (!w || !h) return;  // not laid out yet; called again after load
  const left = w > 900 ? 360 : 10, bottom = h > 500 ? 90 : 20;
  if (w - left - 70 < 200 || h - bottom - 10 < 200) { safeFit(BD_BOUNDS); return; }
  safeFit(BD_BOUNDS, { paddingTopLeft: [left, 10], paddingBottomRight: [70, bottom] });
}
new ResizeObserver(() => map.invalidateSize()).observe($("map"));
$("map").addEventListener("mouseleave", () => closeTips());
map.on("zoomstart movestart", () => closeTips());
const ESRI = "https://server.arcgisonline.com/ArcGIS/rest/services";
map.createPane("labels").style.zIndex = 640;
map.getPane("labels").style.pointerEvents = "none";
map.createPane("mask").style.zIndex = 460;
map.getPane("mask").style.pointerEvents = "none";
map.createPane("geo").style.zIndex = 650;
map.getPane("geo").style.pointerEvents = "none";
map.createPane("rivers").style.zIndex = 450;
map.createPane("track").style.zIndex = 655;
let baseLayers = [];
function setBasemap() {
  baseLayers.forEach(l => l.remove());
  const base = mapDark ? "Canvas/World_Dark_Gray_Base" : "Ocean/World_Ocean_Base";
  const ref = mapDark ? "Canvas/World_Dark_Gray_Reference" : "Ocean/World_Ocean_Reference";
  baseLayers = [
    L.tileLayer(`${ESRI}/${base}/MapServer/tile/{z}/{y}/{x}`, { maxZoom: 16, maxNativeZoom: mapDark ? 16 : 13,
      attribution: "Basemap © Esri, GEBCO, NOAA, Garmin, HERE, © OpenStreetMap contributors · Boundaries BBS/OCHA · Rivers HydroSHEDS" }),
    L.tileLayer(`${ESRI}/${ref}/MapServer/tile/{z}/{y}/{x}`, { pane: "labels", maxZoom: 16, maxNativeZoom: mapDark ? 16 : 13, opacity: 0.9 }),
  ];
  baseLayers.forEach(l => l.addTo(map));
  $("map").style.background = mapDark ? "#1b232c" : "#cfe0ec";
  $("r-theme").classList.toggle("on", !mapDark);
  if (maskLayer) maskLayer.setStyle({ fillColor: mapDark ? "#0b1015" : "#ffffff", fillOpacity: maskOpacity() });
  restyleRivers();
  if (layer) restyle();
}
const maskOpacity = () => $("show-basins").checked ? 0.15 : (mapDark ? 0.45 : 0.38);

async function drawCountry() {
  const f = await (await fetch("/api/v1/country-outline")).json();
  const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
  const ll = ring => ring.map(([x, y]) => [y, x]);
  maskLayer = L.polygon([[[-89, -179], [-89, 179], [89, 179], [89, -179]], ...polys.map(p => ll(p[0]))], {
    pane: "mask", stroke: false, fillColor: mapDark ? "#0b1015" : "#ffffff", fillOpacity: maskOpacity(), interactive: false }).addTo(map);
  const big = p => { const b = L.latLngBounds(ll(p[0])); return b.getNorth() - b.getSouth() + b.getEast() - b.getWest() > 0.6; };
  const rings = polys.filter(big).map(p => ll(p[0]));
  L.polyline(rings, { pane: "geo", color: "#000", weight: 4, opacity: 0.35, interactive: false }).addTo(map);
  L.polyline(rings, { pane: "geo", color: "#e9eef3", weight: 1.4, opacity: 0.9, interactive: false }).addTo(map);
}

function baseStyle(f) {
  const fill = fillFor(f.properties), empty = fill === "rgba(0,0,0,0)";
  // low risk stays a soft tint so medium/high areas are what the eye catches
  const soft = view === "risk" && riskOf(f.properties.flood_prob) === "low";
  return { fillColor: fill, fillOpacity: empty ? 0 : soft ? 0.3 : 0.82, weight: 0.4, opacity: 0.5,
           color: mapDark ? "#6d7c8a" : "#ffffff" };
}

async function load(reframe = false) {
  const div = $("division").value;
  const res = await fetch("/api/v1/upazilas" + (div ? `?division=${encodeURIComponent(div)}` : ""));
  data = await res.json();
  if (hind) applyHindcast();
  if (layer) { closeTips(); layer.remove(); }
  layer = L.geoJSON(data, {
    style: baseStyle,
    onEachFeature: (f, l) => {
      l.bindTooltip(() => `<div class="tt-name">${f.properties.name}</div><div class="tt-sub">${f.properties.district ?? ""}</div><b>${valueFor(f.properties)}</b>`, { sticky: true, direction: "top", offset: [0, -6] });
      l.on("mouseover", () => { if (l !== selectedLayer) l.setStyle({ weight: 1.6, color: "#ffffff", opacity: 1 }); });
      l.on("mouseout", () => { if (l !== selectedLayer) layer.resetStyle(l); });
      l.on("click", () => select(f.properties.id));
    },
  }).addTo(map);
  if (riverLayer && map.hasLayer(riverLayer)) riverLayer.bringToFront();
  if (div) safeFit(layer.getBounds(), { padding: [30, 30] });
  else if (reframe) fitBangladesh();
  if (selected) highlight(selected.id);
  renderSide();
}

const closeTips = () => layer && layer.eachLayer(l => l.closeTooltip());  // upazila tooltips only

function restyle() {
  closeTips();
  layer && layer.setStyle(baseStyle);
  if (selected) highlight(selected.id);
  basinLayer && basinLayer.setStyle(f => ({ fillColor: step(f.properties.rain_72h_mm, TOTAL) }));
  renderScale();
  renderSide();
}

function highlight(id) {
  if (selectedLayer) layer.resetStyle(selectedLayer);
  selectedLayer = null;
  layer.eachLayer(l => { if (l.feature.properties.id === id) selectedLayer = l; });
  if (selectedLayer) selectedLayer.setStyle({ weight: 3, color: "#f2a90f", opacity: 1 }).bringToFront();
}

/* ---------- bottom colour scale ---------- */
function renderScale() {
  const tt = t();
  let s, labels, unit;
  if (view === "risk") {
    $("scale").innerHTML = [["low", `${tt.low} < 25%`], ["medium", `${tt.medium} 25–50%`], ["high", `${tt.high} ≥ 50%`]]
      .map(([k, l]) => `<span style="background:${RISK[k]}">${l}</span>`).join("") + `<span class="unit">${tt.viewRisk}</span>`;
    return;
  }
  if (view === "cyc") {
    $("scale").innerHTML = CYC_BANDS.map(([, c], i) => `<span style="background:${c}">${tt.cycBand[i]}</span>`).join("")
      + `<span class="unit">${tt.cycScale}</span>`;
    return;
  }
  if (view === "past") { s = FLOOD; labels = ["0", "2%", "5%", "10%", "20%", "40%+"]; unit = tt.flooded; }
  else { s = TOTAL; labels = ["0", "1", "5", "10", "20", "50", "100", "200+"]; unit = tt.mm; }
  $("scale").innerHTML = s.colors.map((c, i) => `<span style="background:${i ? c : "#2a333d"}">${labels[i]}</span>`).join("")
    + `<span class="unit">${unit}</span>`;
}

/* ---------- views ---------- */
function setView(v) {
  view = v;
  document.querySelectorAll("#view button").forEach(b => b.classList.toggle("on", b.dataset.view === v));
  document.querySelectorAll(".top-left .sub").forEach(s => s.hidden = s.dataset.for !== v);
  if (v !== "cyc") cycLayer && cycLayer.remove(); else cycLayer && cycLayer.addTo(map);
  if (v === "cyc" && !cyc) { loadCyclones(); return; }
  if (v === "past" && !eventLabels && events.length) { $("event").value = events[events.length - 1].id; selectEvent(); return; }
  restyle();
}

async function selectEvent() {
  const id = $("event").value;
  eventLabels = id ? await (await fetch(`/api/v1/flood-events/${id}`)).json() : null;
  restyle();
}

/* ---------- cyclones ---------- */
const IMD_COLOR = kt => kt == null ? "#9aa5ae" : kt >= 90 ? "#8f1420" : kt >= 64 ? "#d42e5a" : kt >= 48 ? "#f07c2a"
  : kt >= 34 ? "#f2d43a" : "#7dcf3c";

async function loadCyclones() {
  if (!cycList.length) {
    const r = await (await fetch("/api/v1/cyclones?min_wind_kt=34")).json();
    cycList = r.cyclones;
    $("cyclone").innerHTML = cycList.map(c => `<option value="${c.sid}">${c.name} ${c.season}${c.category ? " · " + c.category : ""}${c.closest_bd_km === 0 ? " 🇧🇩" : ""}</option>`).join("");
  }
  const first = cycList.find(c => c.name !== "Unnamed" && c.closest_bd_km === 0)
    || cycList.find(c => c.name !== "Unnamed") || cycList[0];
  $("cyclone").value = first.sid;
  await selectCyclone();
}

async function selectCyclone() {
  cyc = await (await fetch(`/api/v1/cyclones/${$("cyclone").value}`)).json();
  if (cycLayer) cycLayer.remove();
  const pts = cyc.points, segs = [];
  for (let i = 1; i < pts.length; i++)
    segs.push(L.polyline([[pts[i - 1].lat, pts[i - 1].lon], [pts[i].lat, pts[i].lon]],
      { pane: "track", color: IMD_COLOR(pts[i].wind_kt ?? pts[i - 1].wind_kt), weight: 4, opacity: 0.95, interactive: false }));
  const marks = pts.filter(p => p.wind_kt != null).map(p => L.circleMarker([p.lat, p.lon],
    { pane: "track", radius: 4, color: "#10161d", weight: 1, fillColor: IMD_COLOR(p.wind_kt), fillOpacity: 1 })
    .bindTooltip(`<div class="tt-name">${cyc.name}</div><div class="tt-sub">${new Date(p.time).toLocaleString(loc(), { timeZone: "Asia/Dhaka", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</div>${p.wind_kt} kt · ${Math.round(p.wind_kt * 1.852)} km/h${p.pres_hpa ? ` · ${p.pres_hpa} hPa` : ""}`));
  const extra = [];
  if (cyc.landfall_lat != null) extra.push(L.circleMarker([cyc.landfall_lat, cyc.landfall_lon],
    { pane: "track", radius: 8, color: "#ffffff", weight: 2.5, fillColor: "#f2a90f", fillOpacity: 1 })
    .bindTooltip(`⚑ ${t().cycLandfall} · ${dateFmt(cyc.landfall_time)}`, { permanent: true, direction: "left", className: "lf-tip", offset: [-8, 0] }));
  cycLayer = L.layerGroup([...segs, ...marks, ...extra]).addTo(map);
  safeFit(L.latLngBounds(pts.map(p => [p.lat, p.lon])).extend(BD_BOUNDS), { padding: [40, 40] });
  restyle();
}

function applyHindcast() {
  data.features.forEach(f => Object.assign(f.properties, hind.upazilas[f.properties.id] || {}));
}

async function selectDay() {
  const day = $("day").value;
  const live = !day || day >= new Date().toISOString().slice(0, 10);
  $("day-clear").hidden = live;
  if (live) { hind = null; $("day").value = ""; await load(); return; }
  $("map-loading").hidden = false;
  $("map-loading").lastElementChild.textContent = t().runningModel;
  try {
    const res = await fetch(`/api/v1/hindcast?day=${day}`);
    if (!res.ok) { alert((await res.json()).detail); return; }
    hind = await res.json();
    applyHindcast();
    if (view !== "risk") setView("risk"); else restyle();
    openDrawer();
  } finally { $("map-loading").hidden = true; }
}

/* ---------- drawer ---------- */
const openDrawer = () => { document.body.classList.add("drawer-open"); $("r-panel").classList.add("on"); };
const closeDrawer = () => { document.body.classList.remove("drawer-open"); $("r-panel").classList.remove("on"); };

function counts() {
  const c = { high: 0, medium: 0, low: 0 };
  data.features.forEach(f => { const r = riskOf(f.properties.flood_prob); if (r) c[r]++; });
  return c;
}

function renderCycStatus(el, tt) {
  el.className = "panel status high";
  if (!cyc) { el.innerHTML = `<div class="eyebrow">${tt.cycEyebrow}</div><p class="note">${tt.loading}</p>`; return; }
  const kmh = kt => Math.round(kt * 1.852);
  const lf = cyc.landfall_time ? `${dateFmt(cyc.landfall_time)} · ${cyc.landfall_lat}°N ${cyc.landfall_lon}°E` : tt.cycNoLand;
  el.innerHTML = `<div class="eyebrow">${tt.cycEyebrow}</div>
    <div class="headline">${cyc.name} (${cyc.season})</div>
    <div class="period">${dateFmt(cyc.start)} – ${dateFmt(cyc.end)}</div>
    <dl class="kv" style="margin-top:12px">
      <dt>${tt.cycPeak}</dt><dd>${cyc.max_wind_kt ? `${cyc.max_wind_kt} kt · ${kmh(cyc.max_wind_kt)} km/h` : tt.cycNoWind}</dd>
      ${cyc.category ? `<dt></dt><dd>${cyc.category}</dd>` : ""}
      ${cyc.min_pres_hpa ? `<dt>hPa</dt><dd>${cyc.min_pres_hpa}</dd>` : ""}
      <dt>${tt.cycLandfall}</dt><dd>${lf}</dd>
      <dt></dt><dd>${Object.keys(cyc.upazilas).length ? tt.cycUpz(nf(Object.keys(cyc.upazilas).length)) : tt.cycFar(nf(cyc.closest_bd_km))}</dd>
    </dl>
    ${!cyc.max_wind_kt && cyc.max_wind_jtwc_kt ? `<p class="note" style="margin-top:8px">${tt.cycJtwc(cyc.max_wind_jtwc_kt)}</p>` : ""}
    ${cyc.provisional ? `<p class="note">${tt.cycProvisional}</p>` : ""}
    <p class="note" style="margin-top:8px">${tt.cycNote}</p>`;
}

function renderStatus() {
  const el = $("status"), tt = t(), r = data.flood_forecast_run, c = counts();
  if (view === "cyc") { renderCycStatus(el, tt); return; }
  el.className = `panel status ${c.high ? "high" : c.medium ? "medium" : "low"}`;
  if (!r && !hind) { el.innerHTML = `<div class="eyebrow">${tt.statusEyebrow}</div><p class="note">${tt.noForecast}</p>`; return; }
  let extra;
  if (hind) {
    const obs = Object.values(hind.upazilas).filter(v => v.observed_frac != null && v.observed_frac >= 0.05);
    const hit = obs.filter(v => v.flood_risk !== "low").length;
    extra = `<p class="note">${hind.observed_event ? tt.observed(hind.observed_event.name, hit, obs.length) : tt.noObserved}</p>
      <p class="note">${tt.hindNote}</p>`;
  } else {
    const m = r.metrics || {}, b = r.baseline || {};
    extra = `<p class="note">${tt.whatMeans}</p><div class="skill">${tt.skill(m.auc ?? "–", b.auc ?? "–")}</div>
      <details class="more"><summary>${tt.modelDetails}</summary>${r.model_version}<br>GFS run #${r.rain_run_id} · ERA5-Land → ${r.era5_last_day}</details>`;
  }
  el.innerHTML = `<div class="eyebrow">${hind ? tt.statusEyebrowPast : tt.statusEyebrow}</div>
    <div class="headline">${c.high + c.medium ? tt.headlineSome(c.high, c.medium) : tt.headlineNone}</div>
    <div class="period">${hind ? dateFmt(hind.day) : tt.period(dateFmt(r.reference_day), dateFmt(r.valid_until))}</div>
    <div class="counts"><div class="h"><b>${nf(c.high)}</b><small>${tt.high}</small></div>
      <div class="m"><b>${nf(c.medium)}</b><small>${tt.medium}</small></div>
      <div class="l"><b>${nf(c.low)}</b><small>${tt.low}</small></div></div>${extra}`;
}

function renderTop() {
  const tt = t();
  $("top-title").textContent = view === "cyc" ? tt.cycTop : view === "past" ? tt.topPast : view === "rain"
    ? (lead === "rain_past_72h_mm" ? tt.topRainPast : tt.topRain) : tt.topRisk;
  const rows = [...data.features].filter(f => sortKey(f.properties) > 0 || view === "risk")
    .sort((a, b) => sortKey(b.properties) - sortKey(a.properties)).slice(0, 10);
  const max = Math.max(1e-9, ...rows.map(f => sortKey(f.properties)));
  $("top").innerHTML = rows.map(f => {
    const p = f.properties, fill = fillFor(p);
    return `<li data-id="${p.id}"><span class="nm">${p.name} <small>${p.district ?? ""}</small></span>
      <span class="val">${valueFor(p)}</span>
      <span class="bar"><span style="width:${(sortKey(p) / max) * 100}%;background:${fill === "rgba(0,0,0,0)" ? "#9aa5ae" : fill}"></span></span></li>`;
  }).join("") || `<li class="empty">–</li>`;
  document.querySelectorAll("#top li[data-id]").forEach(li => li.onclick = () => select(li.dataset.id, true));
}

function renderSide() {
  if (!data) return;
  renderStatus();
  renderTop();
  const run = data.rain_run;
  if (run) {
    const issued = new Date(run.issued_at).toLocaleString(loc(), { timeZone: "Asia/Dhaka", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    $("source").innerHTML = t().source(run.id, issued);
  }
  if (selected) renderDetail();
  $("drawer-title").textContent = selected ? t().detailTitle : t().overviewTitle;
}

/* ---------- selected upazila ---------- */
function select(id, zoom = false) {
  const f = data.features.find(x => x.properties.id === id);
  if (!f) return;
  selected = f.properties;
  highlight(id);
  if (zoom) safeFit(L.geoJSON(f).getBounds(), { maxZoom: 10, padding: [60, 60] });
  $("overview").hidden = true;
  $("detail").hidden = false;
  $("report-link").href = `/upazila/${id}`;
  $("drawer-title").textContent = t().detailTitle;
  openDrawer();
  $("side").querySelector(".drawer-body").scrollTop = 0;
  renderDetail();
  renderStrip();
  loadRain(id);
  showUpstream(id);
  showHospitals(id);
  showCycloneHistory(id);
}

function closeDetail() {
  selected = null;
  if (selectedLayer) layer.resetStyle(selectedLayer);
  selectedLayer = null;
  [hiLayer, hospLayer].forEach(l => l && l.remove());
  $("detail").hidden = true;
  $("overview").hidden = false;
  $("strip").hidden = true;
  $("drawer-title").textContent = t().overviewTitle;
}

function renderStrip() {
  const p = selected, tt = t(), r = riskOf(p.flood_prob);
  $("strip").hidden = false;
  $("s-name").textContent = p.name;
  $("s-where").textContent = [p.district, p.division].filter(Boolean).join(" · ");
  $("s-risk").innerHTML = (r ? `<span class="dot" style="background:${RISK[r]}"></span>${tt.riskOf[r]} · ${nf(p.flood_prob * 100)}%` : "")
    + (p.rain_72h_mm != null ? ` <span style="opacity:.7">· ${tt.stripRain(`${nf(p.rain_72h_mm, 1)} ${tt.mm}`)}</span>` : "");
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
  const labelEvery = Math.max(1, Math.ceil(52 / (bw * 24)));
  h.precipitation.forEach((v, i) => {
    const ts = Date.parse(h.time[i] + "Z"), x = padL + i * bw;
    if (nowX == null && ts >= now) nowX = x;
    ctx.fillStyle = ts < now ? "#9aa5ae" : css("--rain");
    const bh = ((v ?? 0) / max) * (H - padB - 8);
    ctx.fillRect(x, H - padB - bh, Math.max(1, bw - 0.6), bh);
    if (h.time[i].endsWith("T00:00") && Math.round(i / 24) % labelEvery === 0) {
      ctx.fillStyle = css("--muted");
      ctx.fillText(new Date(ts).toLocaleDateString(loc(), { day: "numeric", month: "short" }), x + 2, H - 4);
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
    { style: { color: "#f2a90f", weight: 1.2, dashArray: "4 3", fillColor: "#f2a90f", fillOpacity: 0.06 }, interactive: false }).addTo(map);
  hiLayer.bringToBack();
}

async function showCycloneHistory(id) {
  const res = await fetch(`/api/v1/nodes/${id}/cyclones`), tt = t();
  if (!res.ok || selected?.id !== id) return;
  const r = await res.json();
  $("cyc-panel").hidden = !r.within_150km;
  if (!r.within_150km) return;
  const strong = r.cyclones.filter(c => c.max_wind_kt && c.min_km <= 100)
    .sort((a, b) => b.max_wind_kt - a.max_wind_kt).slice(0, 3);
  $("d-cyc").innerHTML = `<p class="note">${tt.cycHist(nf(r.within_50km), nf(r.within_150km))}</p>` + (strong.length
    ? `<dl class="kv"><dt style="grid-column:1/3;font-weight:600;color:var(--text)">${tt.cycStrongest}</dt>${strong.map(c =>
        `<dt>${c.name} ${c.season} · ${nf(c.min_km)} km</dt><dd>${c.max_wind_kt} kt · ${Math.round(c.max_wind_kt * 1.852)} km/h</dd>`).join("")}</dl>`
    : "");
}

async function showHospitals(id) {
  if (hospLayer) hospLayer.remove();
  const res = await fetch(`/api/v1/nodes/${id}/hospitals`), tt = t();
  if (!res.ok || selected?.id !== id) return;
  const r = await res.json();
  // no verified record: the section stays hidden rather than implying there is no hospital
  $("hosp-panel").hidden = !r.hospitals.length;
  if (!r.hospitals.length) return;
  $("d-hosp").innerHTML = r.hospitals.map(h => `<li><b>${(lang === "bn" && h.name_bn) || h.name}</b>
    <span class="meta">${h.type}${h.beds ? ` · ${nf(h.beds)} ${tt.beds}` : ""}</span><br>
    ${h.mobile ? `<a href="tel:${h.mobile}">📞 ${tt.call} ${h.mobile}</a> · ` : ""}<a href="${h.profile_url}" target="_blank" rel="noopener">${tt.profile}</a></li>`).join("");
  $("hosp-note").textContent = tt.hospNote(r.fetched_at ? dateFmt(r.fetched_at) : "–");
  hospLayer = L.layerGroup(r.hospitals.map(h => L.marker([h.lat, h.lon], {
    icon: L.divIcon({ className: "hosp-pin", html: "🏥", iconSize: [26, 26], iconAnchor: [13, 13] }) })
    .bindTooltip(`<div class="tt-name">${(lang === "bn" && h.name_bn) || h.name}</div><div class="tt-sub">${h.type}</div>`))).addTo(map);
}

/* ---------- layers ---------- */
function restyleRivers() {
  riverLayer && riverLayer.setStyle(f => ({ color: mapDark ? "#5fb3ff" : "#2b7bbf", opacity: mapDark ? 0.75 : 0.85,
    weight: Math.max(0.8, Math.log10(f.properties.upland_km2) - 2.8) }));
}
async function toggleRivers() {
  if (!$("show-rivers").checked) { riverLayer && riverLayer.remove(); return; }
  if (!riverLayer) {
    const r = await (await fetch("/api/v1/rivers")).json();
    riverLayer = L.geoJSON(r, { pane: "rivers", interactive: false });
    restyleRivers();
  }
  riverLayer.addTo(map);
}

async function toggleBasins() {
  if (!$("show-basins").checked) {
    basinLayer && basinLayer.remove();
    maskLayer && maskLayer.setStyle({ fillOpacity: maskOpacity() });
    return;
  }
  if (!basinData) basinData = await (await fetch("/api/v1/basins")).json();
  if (!basinLayer) basinLayer = L.geoJSON(basinData, {
    style: f => ({ fillColor: step(f.properties.rain_72h_mm, TOTAL), weight: 0.4, color: "#8a96a3", fillOpacity: 0.55 }),
    onEachFeature: (f, l) => l.bindTooltip(() => `<div class="tt-name">${f.properties.name}</div><div class="tt-sub">${f.properties.region}</div>${t().next72}: <b>${f.properties.rain_72h_mm == null ? "–" : nf(f.properties.rain_72h_mm, 1) + " " + t().mm}</b>`, { sticky: true }),
  });
  basinLayer.addTo(map).bringToBack();
  maskLayer && maskLayer.setStyle({ fillOpacity: maskOpacity() });
  safeFit(basinLayer.getBounds());
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
  document.querySelectorAll("[data-i18n-title]").forEach(el => { el.title = tt[el.dataset.i18nTitle]; el.setAttribute("aria-label", el.title); });
  $("lang").textContent = lang === "en" ? "বাং" : "EN";
  if ($("event").firstElementChild) $("event").firstElementChild.textContent = tt.pastPick;
  renderScale();
  if (data) { renderSide(); if (selected) renderStrip(); }
}

/* ---------- wiring ---------- */
document.querySelectorAll("#view button").forEach(b => b.onclick = () => setView(b.dataset.view));
document.querySelectorAll("#lead button").forEach(b => b.onclick = () => {
  document.querySelectorAll("#lead button").forEach(x => x.classList.toggle("on", x === b));
  lead = b.dataset.lead;
  restyle();
});
$("event").onchange = selectEvent;
$("cyclone").onchange = selectCyclone;
$("day").onchange = selectDay;
$("day").max = new Date().toISOString().slice(0, 10);
$("day-clear").onclick = () => { $("day").value = ""; selectDay(); };
$("division").onchange = () => load(true);
$("show-rivers").onchange = toggleRivers;
$("show-basins").onchange = toggleBasins;
$("detail-close").onclick = closeDetail;
$("strip-close").onclick = closeDetail;
$("drawer-close").onclick = closeDrawer;
$("r-panel").onclick = () => document.body.classList.contains("drawer-open") ? closeDrawer() : openDrawer();
$("r-home").onclick = fitBangladesh;
$("r-search").onclick = () => $("search").focus();
$("r-layers").onclick = () => { $("layers").hidden = !$("layers").hidden; $("r-layers").classList.toggle("on", !$("layers").hidden); };
$("r-theme").onclick = () => {
  mapDark = !mapDark;
  try { localStorage.setItem("fs-map", mapDark ? "dark" : "light"); } catch (e) {}
  setBasemap();
};
$("lang").onclick = () => {
  lang = lang === "en" ? "bn" : "en";
  try { localStorage.setItem("fs-lang", lang); } catch (e) {}
  applyLang();
};
document.addEventListener("keydown", e => {
  if (e.key !== "Escape") return;
  if (selected) closeDetail(); else closeDrawer();
});

(async () => {
  $("event").innerHTML = `<option value=""></option>`;
  setBasemap();
  applyLang();
  $("map-loading").hidden = false;
  const [divs, evs] = await Promise.all([
    fetch("/api/v1/divisions").then(r => r.json()),
    fetch("/api/v1/flood-events").then(r => r.json()),
  ]);
  divs.forEach(d => $("division").insertAdjacentHTML("beforeend", `<option value="${d.name}">${d.name}</option>`));
  // monsoon windows are training labels only; post-cyclone maps miss surge flooding in tidal areas
  events = evs.filter(e => !e.id.startsWith("auto_") && !e.id.startsWith("cyclone_"));
  events.forEach(e => $("event").insertAdjacentHTML("beforeend", `<option value="${e.id}">${e.name}</option>`));
  map.invalidateSize();
  fitBangladesh();
  drawCountry();
  await load();
  $("map-loading").hidden = true;
  toggleRivers();
  if (innerWidth > 1100) openDrawer();
})();
