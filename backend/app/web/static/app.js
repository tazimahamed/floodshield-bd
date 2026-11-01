const T = {
  en: {
    official: "Official warnings first: follow FFWC (ffwc.gov.bd) and BMD bulletins and your Upazila Disaster Management Committee. FloodShield supports, and does not replace, official warnings.",
    tagline: "Upazila-level rainfall and flood early warning for Bangladesh",
    allDivisions: "All Bangladesh", past72: "Past 72h",
    floodTitle: "Flood risk forecast",
    floodEmpty: "No flood forecast run yet. The FloodGraph-ST model has not been trained (Phase P4). Only real rainfall data is shown below — no estimated or demo values.",
    topTitle: "Highest forecast rainfall", sourceTitle: "Data source",
    chartNote: "Hourly precipitation (mm), NOAA GFS via Open-Meteo. Grey = past, blue = forecast.",
    noRain: "No rainfall run yet. Waiting for the first ingest.",
    mm: "mm", rivers: "Rivers", upstream: "Upstream basins",
    upTitle: "Upstream catchment", upArea: "Area draining here", upOut: "of it outside Bangladesh",
    upRain: "Forecast rain over catchment", basins: "basins",
    pastTitle: "Past floods (Sentinel-1 satellite)", pastNone: "Show forecast rainfall",
    pastEmpty: "No past flood mapped yet (run scripts/map_floods.py).", flooded: "flooded",
    scenes: "Sentinel-1 scenes", before: "before", during: "during",
    abnormal: "abnormal flood (beyond normal monsoon water)", total: "all water incl. seasonal",
  },
  bn: {
    official: "সরকারি সতর্কবার্তা আগে: FFWC (ffwc.gov.bd) ও BMD-এর বুলেটিন এবং উপজেলা দুর্যোগ ব্যবস্থাপনা কমিটির নির্দেশনা মেনে চলুন। FloodShield সরকারি সতর্কবার্তার সহায়ক, বিকল্প নয়।",
    tagline: "বাংলাদেশের উপজেলাভিত্তিক বৃষ্টি ও বন্যার আগাম সতর্কতা",
    allDivisions: "সমগ্র বাংলাদেশ", past72: "গত ৭২ ঘণ্টা",
    floodTitle: "বন্যার ঝুঁকির পূর্বাভাস",
    floodEmpty: "এখনো কোনো বন্যার পূর্বাভাস চালানো হয়নি। FloodGraph-ST মডেল এখনো ট্রেন করা হয়নি (ধাপ P4)। নিচে শুধু আসল বৃষ্টির ডেটা দেখানো হচ্ছে — কোনো আনুমানিক বা ডেমো মান নয়।",
    topTitle: "সর্বোচ্চ পূর্বাভাসিত বৃষ্টি", sourceTitle: "ডেটার উৎস",
    chartNote: "ঘণ্টাভিত্তিক বৃষ্টিপাত (মিমি), NOAA GFS (Open-Meteo)। ধূসর = অতীত, নীল = পূর্বাভাস।",
    noRain: "এখনো বৃষ্টির ডেটা আনা হয়নি। প্রথম ইনজেস্টের অপেক্ষায়।",
    mm: "মিমি", rivers: "নদী", upstream: "উজানের অববাহিকা",
    upTitle: "উজানের অববাহিকা", upArea: "যত এলাকার পানি এখানে আসে", upOut: "এর মধ্যে বাংলাদেশের বাইরে",
    upRain: "অববাহিকায় পূর্বাভাসিত বৃষ্টি", basins: "টি অববাহিকা",
    pastTitle: "অতীতের বন্যা (Sentinel-1 স্যাটেলাইট)", pastNone: "পূর্বাভাসিত বৃষ্টি দেখাও",
    pastEmpty: "এখনো কোনো অতীতের বন্যা ম্যাপ করা হয়নি।", flooded: "প্লাবিত",
    scenes: "Sentinel-1 ছবি", before: "আগে", during: "বন্যার সময়",
    abnormal: "অস্বাভাবিক বন্যা (স্বাভাবিক বর্ষার পানির বাইরে)", total: "মৌসুমি পানিসহ মোট",
  },
};
let lang = "en", lead = "rain_72h_mm", data = null, layer = null, selected = null;
let riverLayer = null, basinLayer = null, hiLayer = null;
let events = [], eventLabels = null;
const FLOOD_BREAKS = [0, 0.02, 0.05, 0.1, 0.2, 0.4];
const FLOOD_COLORS = ["#fdf3ee", "#fbd0b9", "#f6a582", "#ec6f4f", "#cf3a2b", "#8f1420"];
const floodColor = v => v == null ? "#d0d4d8" : FLOOD_COLORS[FLOOD_BREAKS.filter(b => v >= b).length - 1];
const fill = p => eventLabels ? floodColor(eventLabels[p.id]?.abnormal_frac) : color(p[lead]);
const pct = v => v == null ? "–" : `${(v * 100).toFixed(1)}% ${T[lang].flooded}`;
const value = p => eventLabels
  ? `${pct(eventLabels[p.id]?.abnormal_frac)}<br><span class="muted">${T[lang].total}: ${((eventLabels[p.id]?.frac ?? 0) * 100).toFixed(1)}%</span>`
  : fmt(p[lead]);

const BREAKS = [0, 5, 20, 50, 100, 200];
const COLORS = ["#eef6fb", "#c6e2f0", "#86c3e0", "#3f97c9", "#1b5f9e", "#0b2f6b"];
const color = v => v == null ? "#d0d4d8" : COLORS[BREAKS.filter(b => v >= b).length - 1];
const fmt = v => v == null ? "–" : `${v.toFixed(1)} ${T[lang].mm}`;

const map = L.map("map", { zoomSnap: 0.25 }).setView([23.7, 90.35], 7);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 13, attribution: "© OpenStreetMap contributors · Boundaries: geoBoundaries (BBS, OCHA) · Rivers/basins: HydroSHEDS",
}).addTo(map);

const legend = L.control({ position: "bottomleft" });
legend.onAdd = () => {
  const d = L.DomUtil.create("div", "legend");
  if (eventLabels) {
    d.innerHTML = FLOOD_BREAKS.map((b, i) => `<i style="background:${FLOOD_COLORS[i]}"></i>${b * 100}${FLOOD_BREAKS[i + 1] ? "–" + FLOOD_BREAKS[i + 1] * 100 : "+"}% ${T[lang].flooded}`).join("<br>");
    return d;
  }
  d.innerHTML = BREAKS.map((b, i) => `<i style="background:${COLORS[i]}"></i>${b}${BREAKS[i + 1] ? "–" + BREAKS[i + 1] : "+"} mm`).join("<br>");
  return d;
};
legend.addTo(map);

function applyLang() {
  document.body.classList.toggle("bn", lang === "bn");
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach(el => el.textContent = T[lang][el.dataset.i18n]);
  document.getElementById("lang").textContent = lang === "en" ? "বাংলা" : "English";
  if (data) { renderSidebar(); if (selected) showDetail(selected); }
}

async function load() {
  const div = document.getElementById("division").value;
  const res = await fetch("/api/v1/upazilas" + (div ? `?division=${encodeURIComponent(div)}` : ""));
  data = await res.json();
  if (layer) layer.remove();
  layer = L.geoJSON(data, {
    style: f => ({ fillColor: fill(f.properties), weight: 0.6, color: "#555", fillOpacity: 0.85 }),
    onEachFeature: (f, l) => {
      l.bindTooltip(() => `<b>${f.properties.name}</b><br>${f.properties.district ?? ""}<br>${value(f.properties)}`, { sticky: true });
      l.on("click", () => showDetail(f.properties));
    },
  }).addTo(map);
  if (riverLayer && map.hasLayer(riverLayer)) riverLayer.bringToFront();
  if (div) map.fitBounds(layer.getBounds());
  renderSidebar();
}

function restyle() {
  layer && layer.setStyle(f => ({ fillColor: fill(f.properties) }));
  basinLayer && basinLayer.setStyle(f => ({ fillColor: color(f.properties[lead]) }));
  renderSidebar();
}

function renderSidebar() {
  const run = data.rain_run;
  const src = document.getElementById("source");
  if (!run) { src.textContent = T[lang].noRain; document.getElementById("top").innerHTML = ""; return; }
  const issued = new Date(run.issued_at).toLocaleString(lang === "bn" ? "bn-BD" : "en-GB", { timeZone: "Asia/Dhaka" });
  src.innerHTML = `${run.source}<br>Run #${run.id} · ${issued} (BST)<br><span class="muted">SHA-256 ${run.sha256.slice(0, 16)}…</span>`;
  const top = [...data.features].filter(f => f.properties[lead] != null)
    .sort((a, b) => b.properties[lead] - a.properties[lead]).slice(0, 10);
  document.getElementById("top").innerHTML = top.map(f =>
    `<li data-id="${f.properties.id}">${f.properties.name} <span class="muted">(${f.properties.district ?? ""})</span><b>${fmt(f.properties[lead])}</b></li>`).join("");
  document.querySelectorAll("#top li").forEach(li => li.onclick = () =>
    showDetail(data.features.find(f => f.properties.id === li.dataset.id).properties));
}

async function showDetail(p) {
  selected = p;
  const box = document.getElementById("detail");
  box.hidden = false;
  document.getElementById("d-name").textContent = p.name;
  document.getElementById("d-where").textContent = [p.district, p.division].filter(Boolean).join(", ");
  document.getElementById("d-past").textContent = fmt(p.rain_past_72h_mm);
  document.getElementById("d-24").textContent = fmt(p.rain_24h_mm);
  document.getElementById("d-72").textContent = fmt(p.rain_72h_mm);
  showUpstream(p.id);
  const res = await fetch(`/api/v1/nodes/${p.id}/rain`);
  if (!res.ok) return;
  drawChart((await res.json()).hourly);
}

const km2 = v => `${Math.round(v).toLocaleString(lang === "bn" ? "bn-BD" : "en-GB")} km²`;

async function showUpstream(id) {
  const box = document.getElementById("d-up");
  const res = await fetch(`/api/v1/nodes/${id}/upstream`);
  if (!res.ok) { box.innerHTML = ""; return; }
  const u = await res.json(), t = T[lang];
  box.innerHTML = `<h3>${t.upTitle}</h3>
    ${t.upArea}: <b>${km2(u.catchment_km2)}</b> (${u.n_basins} ${t.basins})<br>
    ${u.outside_bd_km2 ? `${t.upOut}: <b>${km2(u.outside_bd_km2)}</b><br>` : ""}
    ${t.upRain} (72h): <b>${fmt(u.rain_72h_mm)}</b>`;
  if (hiLayer) hiLayer.remove();
  if (!basinData) basinData = await (await fetch("/api/v1/basins")).json();
  const ids = new Set(u.basins);
  hiLayer = L.geoJSON({ type: "FeatureCollection", features: basinData.features.filter(f => ids.has(f.properties.id)) },
    { style: { color: "#e07b00", weight: 1.2, fillColor: "#f5a623", fillOpacity: 0.12 }, interactive: false }).addTo(map);
  hiLayer.bringToBack();
}

let basinData = null;

async function toggleRivers() {
  if (!document.getElementById("show-rivers").checked) { riverLayer && riverLayer.remove(); return; }
  if (!riverLayer) {
    const r = await (await fetch("/api/v1/rivers")).json();
    riverLayer = L.geoJSON(r, { interactive: false, style: f => ({
      color: "#1f78d1", opacity: 0.9, weight: Math.max(1, Math.log10(f.properties.upland_km2) - 2.6) }) });
  }
  riverLayer.addTo(map);
}

async function toggleBasins() {
  if (!document.getElementById("show-basins").checked) { basinLayer && basinLayer.remove(); return; }
  if (!basinData) basinData = await (await fetch("/api/v1/basins")).json();
  if (!basinLayer) basinLayer = L.geoJSON(basinData, {
    style: f => ({ fillColor: color(f.properties[lead]), weight: 0.4, color: "#777", fillOpacity: 0.6 }),
    onEachFeature: (f, l) => l.bindTooltip(() => `<b>${f.properties.name}</b><br>${f.properties.region}<br>${fmt(f.properties[lead])}`, { sticky: true }),
  });
  basinLayer.addTo(map).bringToBack();
  map.fitBounds(basinLayer.getBounds());
}

function drawChart(h) {
  const c = document.getElementById("chart"), ctx = c.getContext("2d");
  c.width = c.clientWidth * devicePixelRatio; c.height = 140 * devicePixelRatio;
  ctx.scale(devicePixelRatio, devicePixelRatio);
  const w = c.clientWidth, H = 140, n = h.precipitation.length;
  const max = Math.max(1, ...h.precipitation.map(v => v ?? 0));
  const now = Date.now(), bw = w / n;
  ctx.clearRect(0, 0, w, H);
  h.precipitation.forEach((v, i) => {
    const t = Date.parse(h.time[i] + "Z");
    ctx.fillStyle = t < now ? "#9aa5ae" : "#1b6fb3";
    const bh = ((v ?? 0) / max) * (H - 16);
    ctx.fillRect(i * bw, H - bh, Math.max(1, bw - 0.5), bh);
  });
  ctx.fillStyle = getComputedStyle(document.body).color;
  ctx.font = "11px Inter, sans-serif";
  ctx.fillText(`max ${max.toFixed(1)} mm/h`, 4, 12);
}

document.querySelectorAll("#lead button").forEach(b => b.onclick = () => {
  document.querySelectorAll("#lead button").forEach(x => x.classList.remove("on"));
  b.classList.add("on"); lead = b.dataset.lead; restyle();
});
document.getElementById("lang").onclick = () => { lang = lang === "en" ? "bn" : "en"; applyLang(); };
document.getElementById("division").onchange = load;
async function selectEvent() {
  const id = document.getElementById("event").value, info = document.getElementById("event-info"), t = T[lang];
  eventLabels = id ? await (await fetch(`/api/v1/flood-events/${id}`)).json() : null;
  const e = events.find(x => x.id === id);
  info.innerHTML = e ? `${e.post_start} → ${e.post_end}<br>${t.abnormal}: <b>${km2(e.abnormal_km2)}</b><br>
    ${t.total}: ${km2(e.flooded_km2)}<br>
    ${t.scenes}: ${e.n_pre_scenes} ${t.before}, ${e.n_post_scenes} ${t.during}<br>${e.method}` : (events.length ? "" : t.pastEmpty);
  legend.remove(); legend.addTo(map);
  restyle();
}

document.getElementById("event").onchange = selectEvent;
document.getElementById("show-rivers").onchange = toggleRivers;
document.getElementById("show-basins").onchange = toggleBasins;

(async () => {
  applyLang();
  const divs = await (await fetch("/api/v1/divisions")).json();
  const sel = document.getElementById("division");
  divs.forEach(d => sel.insertAdjacentHTML("beforeend", `<option value="${d.name}">${d.name} (${d.upazilas})</option>`));
  events = await (await fetch("/api/v1/flood-events")).json();
  const es = document.getElementById("event");
  events.forEach(e => es.insertAdjacentHTML("beforeend", `<option value="${e.id}">${e.name}</option>`));
  if (!events.length) document.getElementById("event-info").textContent = T[lang].pastEmpty;
  await load();
  toggleRivers();
})();
