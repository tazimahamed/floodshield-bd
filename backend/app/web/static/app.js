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
    mm: "mm",
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
    mm: "মিমি",
  },
};
let lang = "en", lead = "rain_72h_mm", data = null, layer = null, selected = null;

const BREAKS = [0, 5, 20, 50, 100, 200];
const COLORS = ["#eef6fb", "#c6e2f0", "#86c3e0", "#3f97c9", "#1b5f9e", "#0b2f6b"];
const color = v => v == null ? "#d0d4d8" : COLORS[BREAKS.filter(b => v >= b).length - 1];
const fmt = v => v == null ? "–" : `${v.toFixed(1)} ${T[lang].mm}`;

const map = L.map("map", { zoomSnap: 0.25 }).setView([23.7, 90.35], 7);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 13, attribution: "© OpenStreetMap contributors · Boundaries: geoBoundaries (BBS, OCHA)",
}).addTo(map);

const legend = L.control({ position: "bottomleft" });
legend.onAdd = () => {
  const d = L.DomUtil.create("div", "legend");
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
    style: f => ({ fillColor: color(f.properties[lead]), weight: 0.6, color: "#555", fillOpacity: 0.85 }),
    onEachFeature: (f, l) => {
      l.bindTooltip(() => `<b>${f.properties.name}</b><br>${f.properties.district ?? ""}<br>${fmt(f.properties[lead])}`, { sticky: true });
      l.on("click", () => showDetail(f.properties));
    },
  }).addTo(map);
  if (div) map.fitBounds(layer.getBounds());
  renderSidebar();
}

function restyle() { layer && layer.setStyle(f => ({ fillColor: color(f.properties[lead]) })); renderSidebar(); }

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
  const res = await fetch(`/api/v1/nodes/${p.id}/rain`);
  if (!res.ok) return;
  drawChart((await res.json()).hourly);
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

(async () => {
  applyLang();
  const divs = await (await fetch("/api/v1/divisions")).json();
  const sel = document.getElementById("division");
  divs.forEach(d => sel.insertAdjacentHTML("beforeend", `<option value="${d.name}">${d.name} (${d.upazilas})</option>`));
  load();
})();
