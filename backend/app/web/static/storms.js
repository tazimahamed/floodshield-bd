/* FloodShield BD — active tropical cyclones on the home map (GDACS; track forecast from JTWC).
   Not the Met Department's signal: every card links to BMD. With ?stormtest=EVENT:EPISODE in the address, an old
   storm is drawn instead, clearly marked as a test. Loaded after app.js. */
const ST = {
  en: {
    title: "🌀 Storms now", none: t => `No tropical cyclone is active near Bangladesh right now (GDACS, checked ${t}).`,
    fail: "Could not reach GDACS just now, so active storms cannot be shown. Check BMD.",
    test: "TEST: an old storm drawn to check this display, not a storm happening now.",
    alert: { green: "Green alert", orange: "Orange alert", red: "Red alert" },
    now: km => `Now about <b>${km} km</b> from the centre of Bangladesh.`,
    closest: km => `On its forecast path it comes within about <b>${km} km</b>.`,
    note: "Position and forecast path: GDACS (European Commission and UN), using the US JTWC forecast. The Bangladesh Meteorological Department gives the official signals:",
    report: "GDACS report ↗", past: "Path so far", fc: "Forecast path", wind: "Area of strong wind",
  },
  bn: {
    title: "🌀 এখনকার ঝড়", none: t => `এখন বাংলাদেশের কাছে কোনো সক্রিয় ঘূর্ণিঝড় নেই (GDACS, ${t}-এ দেখা)।`,
    fail: "এই মুহূর্তে GDACS-এর সাথে সংযোগ হয়নি, তাই সক্রিয় ঝড় দেখানো যাচ্ছে না। আবহাওয়া অধিদপ্তর দেখুন।",
    test: "পরীক্ষা: এই দেখানোটা যাচাই করতে একটা পুরনো ঝড় আঁকা হয়েছে, এখন চলমান ঝড় নয়।",
    alert: { green: "সবুজ সতর্কতা", orange: "কমলা সতর্কতা", red: "লাল সতর্কতা" },
    now: km => `এখন বাংলাদেশের মাঝখান থেকে প্রায় <b>${km} কিমি</b> দূরে।`,
    closest: km => `পূর্বাভাসের পথে এটি প্রায় <b>${km} কিমি</b> পর্যন্ত কাছে আসে।`,
    note: "অবস্থান ও পূর্বাভাসের পথ: GDACS (ইউরোপীয় কমিশন ও জাতিসংঘ), মার্কিন JTWC-এর পূর্বাভাস থেকে। সরকারি সংকেত দেয় বাংলাদেশ আবহাওয়া অধিদপ্তর:",
    report: "GDACS রিপোর্ট ↗", past: "এ পর্যন্ত পথ", fc: "পূর্বাভাসের পথ", wind: "জোরালো বাতাসের এলাকা",
  },
};
const stt = () => ST[lang];
let STORMS = null, stormLayer = null;
const ALERT_COL = { green: "#3fae6b", orange: "#f39a2b", red: "#e5483a" };
const SPIN = `<svg viewBox="0 0 40 40"><path d="M20 4c-6 0-10 3-12 7 4-3 9-3 12 0 3 3 3 8 0 11a8 8 0 0 1-3 2c6 1 13-3 14-10 0-6-5-10-11-10z" fill="currentColor"/><path d="M20 36c6 0 10-3 12-7-4 3-9 3-12 0-3-3-3-8 0-11a8 8 0 0 1 3-2c-6-1-13 3-14 10 0 6 5 10 11 10z" fill="currentColor" opacity=".75"/><circle cx="20" cy="20" r="3.2" fill="#fff"/></svg>`;

function drawStorms() {
  if (stormLayer) stormLayer.remove();
  if (!STORMS || !STORMS.storms.length) return;
  stormLayer = L.layerGroup();
  STORMS.storms.forEach(s => {
    const col = ALERT_COL[s.alert] || "#f39a2b";
    L.geoJSON(s.wind_areas, { pane: "track", interactive: false,
      style: f => ({ color: ALERT_COL[f.properties.level] || col, weight: 1, opacity: 0.7, fillColor: ALERT_COL[f.properties.level] || col, fillOpacity: 0.16 }) }).addTo(stormLayer);
    L.geoJSON(s.track, { pane: "track", interactive: false,
      style: f => f.properties.forecast ? { color: "#ffffff", weight: 2.5, dashArray: "6 6", opacity: 0.95 } : { color: col, weight: 3.5, opacity: 0.95 } }).addTo(stormLayer);
    L.marker([s.position[1], s.position[0]], { pane: "track", interactive: false, keyboard: false,
      icon: L.divIcon({ className: "storm-eye", iconSize: [44, 44], iconAnchor: [22, 22], html: `<span style="color:${col}">${SPIN}</span><b>${s.name}</b>` }) }).addTo(stormLayer);
  });
  stormLayer.addTo(map);
}

function renderStorms() {
  const box = $("storm-panel");
  if (!box || !STORMS) return;
  const tt = stt(), t = new Date(STORMS.checked * 1000).toLocaleTimeString(loc(), { hour: "numeric", minute: "2-digit", timeZone: "Asia/Dhaka" });
  box.hidden = false;
  if (STORMS.error && !STORMS.storms.length) { box.className = "panel storm-panel"; box.innerHTML = `<p class="st-none">⚠ ${tt.fail} <a href="https://www.bmd.gov.bd" target="_blank" rel="noopener">bmd.gov.bd</a></p>`; return; }
  if (!STORMS.storms.length) { box.className = "panel storm-panel quiet"; box.innerHTML = `<p class="st-none">🌀 ${tt.none(t)}</p>`; return; }
  box.className = "panel storm-panel live";
  box.innerHTML = `<div class="panel-head"><h2>${tt.title}</h2></div>` + STORMS.storms.map(s => `
    <div class="st-card" style="--c:${ALERT_COL[s.alert] || "#f39a2b"}" data-lat="${s.position[1]}" data-lon="${s.position[0]}">
      ${s.test ? `<p class="st-test">${tt.test}</p>` : ""}
      <div class="st-top"><span class="st-spin">${SPIN}</span><div><b>${s.name}</b><span class="st-alert">${tt.alert[s.alert] || s.alert}</span></div></div>
      <p>${tt.now(nf(s.now_km_from_bd))} ${s.closest_km_from_bd != null ? tt.closest(nf(s.closest_km_from_bd)) : ""}</p>
      <div class="st-key"><span><i class="past"></i>${tt.past}</span><span><i class="fc"></i>${tt.fc}</span><span><i class="wind"></i>${tt.wind}</span></div>
      <p class="st-src">${tt.note} <a href="https://www.bmd.gov.bd" target="_blank" rel="noopener">bmd.gov.bd</a>${s.report ? ` · <a href="${s.report}" target="_blank" rel="noopener">${tt.report}</a>` : ""}</p>
    </div>`).join("");
  box.querySelectorAll(".st-card").forEach(c => c.onclick = e => { if (e.target.closest("a")) return; map.flyTo([+c.dataset.lat, +c.dataset.lon], 6, { duration: 1.2 }); });
}

async function loadStorms() {
  const q = new URLSearchParams(location.search).get("stormtest");
  const [ev, ep] = (q || "").split(":");
  const url = q ? `/api/v1/cyclones/active?event=${encodeURIComponent(ev)}&episode=${encodeURIComponent(ep || "")}` : "/api/v1/cyclones/active";
  try { STORMS = await fetch(url).then(r => r.ok ? r.json() : null); } catch (e) { STORMS = null; }
  if (!STORMS) STORMS = { storms: [], error: "unreachable", checked: Date.now() / 1000 };
  drawStorms(); renderStorms();
}

loadStorms();
setInterval(() => { if (!document.hidden) loadStorms(); }, 30 * 60e3);
const _applyLangStorm = applyLang;
applyLang = function () { _applyLangStorm(); renderStorms(); };
