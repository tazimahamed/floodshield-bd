/* FloodShield BD — one upazila as a flood map you can act on: where water has risen in 9 monsoons (our own
   Sentinel-1 analysis), the stretches of main road that went under, land that never flooded, rivers, government
   hospitals with their phone numbers and a "show the way" button, and today's flood chance. Every layer is real
   data and the footer names its source. Bangla labels are HTML: the map library cannot join Bangla letters. */
const $ = id => document.getElementById(id);
let lang = (() => { try { return localStorage.getItem("fs-lang") || "bn"; } catch (e) { return "bn"; } })();
const nodeId = decodeURIComponent(location.pathname.split("/")[2] || "");
const BN_D = "০১২৩৪৫৬৭৮৯";
const nf = (n, d = 0) => { const s = Number(n).toLocaleString("en-IN", { maximumFractionDigits: d, minimumFractionDigits: 0 });
  return lang === "bn" ? s.replace(/\d/g, x => BN_D[x]) : s; };
const RISK_C = { low: "#16a34a", medium: "#d97706", high: "#dc2626" };
const HOSP_BN = { "Upazila Health Complex": "উপজেলা স্বাস্থ্য কমপ্লেক্স", "District Hospital": "জেলা হাসপাতাল",
  "Medical College Hospital": "মেডিকেল কলেজ হাসপাতাল", "General Hospital": "জেনারেল হাসপাতাল", "Specialized Hospital": "বিশেষায়িত হাসপাতাল",
  "Union Health and Family Welfare Centre": "ইউনিয়ন স্বাস্থ্য ও পরিবার কল্যাণ কেন্দ্র", "Mother and Child Welfare Centre": "মা ও শিশু কল্যাণ কেন্দ্র" };
// how often unusual water rose, in 9 monsoons: the colours of the flood frequency tiles (scripts/flood_frequency.py)
const FREQ = [[0, [207, 232, 196]], [1, [253, 230, 138]], [2, [252, 211, 77]], [3, [253, 186, 116]], [4, [251, 146, 60]],
  [5, [249, 115, 22]], [6, [239, 68, 68]], [7, [220, 38, 38]], [8, [185, 28, 28]], [9, [153, 27, 27]]];

const T = {
  bn: {
    back: "← ফিরে যান", dl: "⬇ ছবি হিসেবে নামান", dlWait: "ছবি তৈরি হচ্ছে…", lang: "English", loading: "মানচিত্র তৈরি হচ্ছে…",
    sub: (d, v, metro) => `${d} জেলা · ${v} বিভাগ${metro ? " · মহানগর থানা" : ""}`,
    chance: "বন্যার সম্ভাবনা, আগামী ১৫ দিন", risk: { low: "নিম্ন", medium: "মাঝারি", high: "উচ্চ" }, noFc: "এই মুহূর্তে পূর্বাভাস নেই",
    stat: (n, often, never) => `${n}টি বর্ষার ৩টি বা বেশিতে পানি জমেছিল এই এলাকার <b>${often}%</b> জমিতে · একবারও জমেনি <b>${never}%</b> জমিতে`,
    freqT: "কোথায় পানি জমে", freqS: n => `${n}টি বর্ষায় (২০১৭–২০২৫) কত বছর জমিতে পানি জমেছিল; নদী ও স্থায়ী জলাশয় বাদ (Sentinel-1 স্যাটেলাইট, আমাদের হিসাব)`,
    f69: "প্রায় প্রতি বছর (৬+ বছর)", f35: "প্রায়ই (৩–৫ বছর)", f12: "মাঝে মাঝে (১–২ বছর)", f0: n => `${n} বছরে একবারও না`,
    loadingFreq: "এই এলাকার বন্যার মানচিত্র তৈরি হচ্ছে (প্রথমবার ২০–৩০ সেকেন্ড)…",
    fRoad: "প্রধান সড়কের যে অংশে ৩+ বছর পানি জমেছিল", fNone: "পাহাড়ের ঢাল: এই হিসাবের বাইরে",
    freqWait: "এই এলাকার বন্যার মানচিত্র এই মুহূর্তে তৈরি করা গেল না; একটু পরে আবার খুলুন।",
    lifeT: "সাহায্য ও পথ", lifeS: "সরকারি হাসপাতাল (DGHS) আর নদী",
    hosp: n => n ? `সরকারি হাসপাতাল: ${n}টি` : "এই এলাকায় DGHS-এর তালিকায় হাসপাতাল নেই",
    river: "নদী ও খাল", lake: "স্থায়ী জলাশয়, বিল ও হাওর", road: "প্রধান সড়ক", border: "এই এলাকার সীমানা",
    histT: "বন্যার ইতিহাস", histS: "প্রতি বর্ষায় সবচেয়ে বেশি ডোবা অংশ; দাগ = বন্যার সীমা ৫%", histNone: "এই এলাকার বন্যার ইতিহাস নেই",
    foot: "পানি জমার মানচিত্র ও ইতিহাস: Sentinel-1 (ESA), FloodShield BD-র হিসাব · ভূমিরূপ: Terrarium DEM · নদী, সড়ক: © OpenStreetMap অবদানকারী · হাসপাতাল: DGHS · নাম: bangladesh.gov.bd · ঝুঁকি: আমাদের মডেল, সরকারি সতর্কবার্তা নয়",
    note: "যেখানে আগে পানি জমেছে, সেখানে আবারও জমতে পারে, তবে নিশ্চিত নয়। লাল মানে প্রতি বর্ষায় পানি জমা নিচু জমি (বিল, ধানক্ষেতও এর মধ্যে), সবসময় বিপদ নয়। \"একবারও না\" মানে নিরাপদ জায়গা নয়: বন্যা বা ঘূর্ণিঝড়ে কোথায় যাবেন, উপজেলা প্রশাসন ও ইউনিয়ন পরিষদের নির্দেশনা মানুন।",
    actT: "বিপদে কোথায় যাবেন", call: "ফোন", way: "🧭 পথ দেখুন", wayNote: "\"পথ দেখুন\" আপনার ফোনের অবস্থান থেকে Google Maps-এ পথ খুলবে।",
    shelterBtn: "🏠 কাছের আশ্রয়কেন্দ্র Google Maps-এ খুঁজুন", shelterNote: "আশ্রয়কেন্দ্রের কোনো খোলা সরকারি তালিকা নেই, তাই মানচিত্রে দেখানো হয়নি। কোন আশ্রয়কেন্দ্রে যাবেন, ইউনিয়ন বা উপজেলা অফিসে জেনে নিন।",
    sos: "জরুরি সেবা ৯৯৯ · দুর্যোগের তথ্য ১০৯০ · স্বাস্থ্য বাতায়ন ১৬২৬৩", beds: n => `${n} শয্যা`, km: "কিমি",
    raised: "এলাকাটি চোখে পড়ার জন্য একটু উঁচু করে দেখানো",
  },
  en: {
    back: "← Back", dl: "⬇ Download as picture", dlWait: "Making the picture…", lang: "বাংলা", loading: "Drawing the map…",
    sub: (d, v, metro) => `${d} district · ${v} division${metro ? " · metropolitan thana" : ""}`,
    chance: "Chance of flooding, next 15 days", risk: { low: "low", medium: "medium", high: "high" }, noFc: "No forecast right now",
    stat: (n, often, never) => `Water stood in 3 or more of ${n} monsoons on <b>${often}%</b> of this area's land · never on <b>${never}%</b>`,
    freqT: "Where water stands", freqS: n => `In how many of ${n} monsoons (2017–2025) water stood on the land; rivers and permanent water left out (Sentinel-1 satellite, our analysis)`,
    f69: "Almost every year (6+)", f35: "Often (3–5 years)", f12: "Sometimes (1–2 years)", f0: n => `Never in ${n} years`,
    loadingFreq: "Making this area's flood map (20–30 s the first time)…",
    fRoad: "Main road stretches with water in 3+ years", fNone: "Hill slopes: outside this analysis",
    freqWait: "This area's flood map could not be made just now; please open it again later.",
    lifeT: "Help and the way", lifeS: "Government hospitals (DGHS) and rivers",
    hosp: n => n ? `Government hospitals: ${n}` : "No hospital in the DGHS list here",
    river: "Rivers and canals", lake: "Lakes, beels and haors", road: "Main roads", border: "This area's border",
    histT: "Flood history", histS: "Largest flooded share each monsoon; dashes = the 5% flood mark", histNone: "No flood history for this area",
    foot: "Where water stands and history: Sentinel-1 (ESA), FloodShield BD analysis · Terrain: Terrarium DEM · Rivers, roads: © OpenStreetMap contributors · Hospitals: DGHS · Names: bangladesh.gov.bd · Risk: our model, not an official warning",
    note: "Where water stood before, it can stand again, but not for certain. Red is low land that holds water most monsoons (beels and paddy fields too), not always danger. \"Never\" does not mean a safe place: in a flood or cyclone, follow your upazila administration and union council on where to go.",
    actT: "Where to go for help", call: "Call", way: "🧭 Show the way", wayNote: "\"Show the way\" opens Google Maps directions from your phone's location.",
    shelterBtn: "🏠 Find nearby shelters on Google Maps", shelterNote: "There is no open official list of shelters, so none are drawn on the map. Ask your union or upazila office which shelter to use.",
    sos: "Emergency 999 · Disaster information 1090 · Health line 16263", beds: n => `${n} beds`, km: "km",
    raised: "The area is drawn a little raised so it stands out",
  },
};
const t = () => T[lang];
const D = {};
let map = null;

const rings = g => g.type === "Polygon" ? [g.coordinates[0]] : g.coordinates.map(p => p[0]);
const ringArea = r => { let a = 0; for (let i = 0, j = r.length - 1; i < r.length; j = i++) a += (r[j][0] + r[i][0]) * (r[j][1] - r[i][1]); return Math.abs(a / 2); };
function labelPoint(g) {
  const r = rings(g).sort((a, b) => ringArea(b) - ringArea(a))[0];
  let x = 0, y = 0; r.forEach(p => { x += p[0]; y += p[1]; });
  return [x / r.length, y / r.length];
}
function inPoly(x, y, rs) {
  return rs.some(r => { let ins = false;
    for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const [xi, yi] = r[i], [xj, yj] = r[j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) ins = !ins; }
    return ins; });
}
async function getJSON(u) { try { const r = await fetch(u); return r.ok ? r.json() : null; } catch (e) { return null; } }

/* ---------- the flood frequency tiles, read pixel by pixel (for the area's numbers and the flooded roads) ---------- */
const FQ = { tiles: [] };
async function loadFreq() {
  // one picture per upazila, made on Earth Engine the first time someone opens it (15-30 s), then kept
  const m = await getJSON(`/api/v1/nodes/${nodeId}/flood-freq`);
  if (!m) return null;
  FQ.meta = m;
  await Promise.all([{ bounds: m.bounds, file: "x" }].map(async tl => {
    const [[s, w], [n, e]] = tl.bounds;
    const img = new Image(); img.crossOrigin = "anonymous"; img.src = `/api/v1/nodes/${nodeId}/flood-freq.png?d=${m.computed_at.slice(0, 16)}`;
    await img.decode().catch(() => null);
    if (!img.naturalWidth) return;
    const c = document.createElement("canvas"); c.width = img.naturalWidth; c.height = img.naturalHeight;
    const x = c.getContext("2d", { willReadFrequently: true }); x.drawImage(img, 0, 0);
    FQ.tiles.push({ s, w, n, e, W: c.width, H: c.height, d: x.getImageData(0, 0, c.width, c.height).data, url: img.src, file: tl.file });
  }));
  return m;
}
function freqAt(lon, lat) {  // years with unusual water (0-9), or null where there is no value (hill slopes, outside)
  const tl = FQ.tiles.find(q => lon >= q.w && lon < q.e && lat >= q.s && lat < q.n);
  if (!tl) return null;
  const px = Math.floor((lon - tl.w) / (tl.e - tl.w) * tl.W), py = Math.floor((tl.n - lat) / (tl.n - tl.s) * tl.H);
  const i = (py * tl.W + px) * 4, d = tl.d;
  if (d[i + 3] < 128) return null;
  let best = null, bd = 1e9;
  for (const [k, [r, g, b]] of FREQ) { const dd = (d[i] - r) ** 2 + (d[i + 1] - g) ** 2 + (d[i + 2] - b) ** 2; if (dd < bd) { bd = dd; best = k; } }
  return bd < 900 ? best : null;
}
function areaStats() {  // share of the area's land by how often it flooded, on a grid of about 3000 points
  const g = D.shape.geometry, rs = rings(g), xs = [], ys = [];
  rs.forEach(r => r.forEach(([x, y]) => { xs.push(x); ys.push(y); }));
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const step = Math.sqrt((x1 - x0) * (y1 - y0) / 3000);
  let n = 0, often = 0, never = 0;
  for (let y = y0 + step / 2; y < y1; y += step) for (let x = x0 + step / 2; x < x1; x += step) {
    if (!inPoly(x, y, rs)) continue;
    const v = freqAt(x, y); if (v == null) continue;
    n++; if (v >= 3) often++; if (v === 0) never++;
  }
  return n > 50 ? { often: Math.round(often / n * 100), never: Math.round(never / n * 100) } : null;
}
// main-road stretches that lay in land with unusual water in 3 or more monsoons
function floodedRoads() {
  const out = [], rs = rings(D.shape.geometry);
  let feats = [];
  try { feats = map.querySourceFeatures("osm", { sourceLayer: "transportation", filter: ["in", ["get", "class"], ["literal", ["motorway", "trunk", "primary", "secondary", "tertiary"]]] }); } catch (e) {}
  const seen = new Set();
  feats.forEach(f => (f.geometry.type === "MultiLineString" ? f.geometry.coordinates : [f.geometry.coordinates]).forEach(cs => {
    const key = cs.length + ":" + cs[0].join(",");
    if (seen.has(key)) return; seen.add(key);
    let run = [];
    const flush = () => { if (run.length > 1) out.push(run); run = []; };
    for (let i = 1; i < cs.length; i++) {
      const [ax, ay] = cs[i - 1], [bx, by] = cs[i], steps = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / 0.0008));
      for (let k = 0; k <= steps; k++) {
        const x = ax + (bx - ax) * k / steps, y = ay + (by - ay) * k / steps;
        const v = inPoly(x, y, rs) ? freqAt(x, y) : null;
        if (v != null && v >= 3) run.push([x, y]); else flush();
      }
    }
    flush();
  }));
  return { type: "FeatureCollection", features: out.map(c => ({ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: c } })) };
}

async function load() {
  const [rep, shape, why, hosp, riv, all] = await Promise.all([
    getJSON(`/api/v1/nodes/${nodeId}/report`), getJSON(`/api/v1/nodes/${nodeId}/shape`), getJSON(`/api/v1/nodes/${nodeId}/why`),
    getJSON(`/api/v1/nodes/${nodeId}/hospitals`), getJSON(`/api/v1/nodes/${nodeId}/rivers?min_upland_km2=500`), getJSON("/api/v1/upazilas")]);
  if (!rep || !shape) { $("pname").textContent = "—"; return; }
  Object.assign(D, { rep, shape, why, hosp: hosp ? hosp.hospitals.filter(h => h.lat != null) : [], riv, all });
  const xs = [], ys = []; rings(shape.geometry).forEach(r => r.forEach(([x, y]) => { xs.push(x); ys.push(y); }));
  D.b = [[Math.min(...xs), Math.min(...ys)], [Math.max(...xs), Math.max(...ys)]];
  $("pload").lastChild.textContent = t().loadingFreq;
  await loadFreq();
  D.stats = FQ.tiles.length ? areaStats() : null;
  $("back").href = `/upazila/${nodeId}`;
  renderText();
  drawMap();
}

function renderText() {
  const tt = t(), n = D.rep.node, c = D.rep.current, metro = n.kind === "metro";
  const name = (lang === "bn" && n.bn) || n.name;
  document.documentElement.lang = lang;
  document.title = `${name} · ${lang === "bn" ? "বন্যার মানচিত্র" : "flood map"} · FloodShield BD`;
  $("back").textContent = tt.back; $("dl").textContent = tt.dl; $("lang").textContent = tt.lang;
  $("pload").lastChild.textContent = tt.loading;
  $("pname").textContent = name;
  $("psub").textContent = tt.sub((lang === "bn" && n.district_bn) || n.district, (lang === "bn" && n.division_bn) || n.division, metro);
  $("prisk").innerHTML = c ? `<i style="background:${RISK_C[c.risk]}"></i><span>${tt.chance}</span><b>${nf(Math.round(c.flood_prob * 100))}%</b><span>${tt.risk[c.risk]}</span>`
    : `<span>${tt.noFc}</span>`;
  const ny = FQ.meta ? nf(FQ.meta.n_years) : "";
  $("pstat").innerHTML = D.stats ? tt.stat(ny, nf(D.stats.often), nf(D.stats.never)) : "";
  const sw = (bg, cls = "") => `<span class="sw ${cls}" style="background:${bg}"></span>`;
  const freq = FQ.tiles.length ? `<div class="lg" style="--c:#ef4444"><h3>${tt.freqT}</h3><p>${tt.freqS(ny)}</p><ul>
      <li>${sw("#dc2626")}${tt.f69}</li><li>${sw("#fb923c")}${tt.f35}</li><li>${sw("#fcd34d")}${tt.f12}</li><li>${sw("#cfe8c4")}${tt.f0(ny)}</li>
      <li>${sw("repeating-linear-gradient(90deg,#111827 0 6px,#fff 6px 9px)", "line")}${tt.fRoad}</li>
      <li>${sw("#d6d3cc")}${tt.fNone}</li></ul></div>`
    : `<div class="lg" style="--c:#ef4444"><h3>${tt.freqT}</h3><p>${tt.freqWait}</p></div>`;
  const life = `<div class="lg" style="--c:#2563eb"><h3>${tt.lifeT}</h3><p>${tt.lifeS}</p><ul>
      <li><span class="sw dot" style="background:#e11d48">+</span>${tt.hosp(D.hosp.length ? nf(D.hosp.length) : 0)}</li>
      <li>${sw("#1557a8", "line")}${tt.river}</li><li>${sw("#7fb8e8")}${tt.lake}</li>
      <li>${sw("#57534e", "line")}${tt.road}</li><li>${sw("#111827", "line")}${tt.border}</li>
      <li>${sw("linear-gradient(#f4f1ea,#a8987f)")}${tt.raised}</li></ul></div>`;
  $("plegend").innerHTML = freq + life + history();
  $("pfoot").textContent = tt.foot;
  $("pnote").textContent = tt.note;
  renderActions();
  if (map && map.loaded()) placeLabels();
}

function history() {
  const tt = t(), rows = (D.rep.history || []).filter(r => !r.named_event), by = {};
  rows.forEach(r => { const y = +r.start.slice(0, 4); by[y] = Math.max(by[y] ?? 0, r.flooded_pct); });
  const years = Object.keys(by).map(Number).sort();
  if (!years.length) return `<div class="lg"><h3>${tt.histT}</h3><p>${tt.histNone}</p></div>`;
  const top = Math.max(10, ...Object.values(by)) * 1.1, rule = D.rep.flood_threshold_pct || 5;
  const yy = y => lang === "bn" ? nf(y % 100).padStart(2, "০") : String(y % 100).padStart(2, "0");
  return `<div class="lg" style="--c:#0ea5e9"><h3>${tt.histT}</h3><p>${tt.histS}</p><div class="bars">
    ${years.map(y => `<div class="b${by[y] >= rule ? " fl" : ""}" title="${nf(by[y], 1)}%"><i style="height:${Math.max(1.5, by[y] / top * 100)}%"></i></div>`).join("")}
    <div class="rule" style="bottom:${rule / top * 100}%"></div></div>
    <div class="yrs">${years.map(y => `<small>${yy(y)}</small>`).join("")}</div></div>`;
}

/* ---------- below the poster: what to do, with phone numbers and directions ---------- */
function renderActions() {
  const tt = t(), n = D.rep.node, [cx, cy] = labelPoint(D.shape.geometry);
  const hosp = D.hosp.map(h => {
    const name = (lang === "bn" && h.name_bn) || h.name, type = lang === "bn" ? (HOSP_BN[h.type] || h.type) : h.type;
    const tel = h.mobile ? String(h.mobile).replace(/[^\d+]/g, "") : "";
    return `<li><div><b>${name}</b><small>${[type, h.beds ? tt.beds(nf(h.beds)) : ""].filter(Boolean).join(" · ")}</small></div>
      <div class="acts">${tel ? `<a class="abtn call" href="tel:${tel}">☎ ${tt.call} ${lang === "bn" ? tel.replace(/\d/g, x => BN_D[x]) : tel}</a>` : ""}
      <a class="abtn" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lon}">${tt.way}</a></div></li>`;
  }).join("");
  const q = encodeURIComponent(`cyclone shelter ${n.name} ${n.district || ""}`);
  $("pact").innerHTML = `<h2>${tt.actT}</h2>
    ${hosp ? `<ul class="hlist">${hosp}</ul><p class="small">${tt.wayNote}</p>` : ""}
    <a class="abtn wide" target="_blank" rel="noopener" href="https://www.google.com/maps/search/${q}/@${cy.toFixed(4)},${cx.toFixed(4)},12z">${tt.shelterBtn}</a>
    <p class="small">${tt.shelterNote}</p><p class="sos">☎ ${tt.sos}</p>`;
}

/* ---------- the upazila raised as a block: its ground is lifted in the elevation tiles (for the eye only) ---------- */
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
    if (px(x1) < -2 || px(x0) > 258 || py(y0) < -2 || py(y1) > 258) return { data: buf };
    try {
      const bmp = await createImageBitmap(new Blob([buf], { type: "image/png" }));
      const c = document.createElement("canvas"), m = document.createElement("canvas");
      c.width = c.height = m.width = m.height = 256;
      const ctx = c.getContext("2d", { willReadFrequently: true }), mx = m.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(bmp, 0, 0);
      mx.beginPath();
      // outer edges only: river channels left out of the boundary rise with the area, so no walls appear along them
      polys.forEach(p => { const ring = p[0]; ring.forEach(([lo, la], i) => i ? mx.lineTo(px(lo), py(la)) : mx.moveTo(px(lo), py(la))); mx.closePath(); });
      mx.fill("nonzero");
      // a big river can split an upazila in two (its channel is not part of either side): a wide stroke along the
      // edges fills gaps up to about 1 km, so the area rises as one block instead of showing walls along the river
      const mPerPx = 40075016.686 * Math.cos((y0 + y1) / 2 * Math.PI / 180) / (256 * n);
      mx.lineWidth = Math.min(40, 1000 / mPerPx); mx.lineJoin = "round"; mx.strokeStyle = "#000"; mx.stroke();
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
  return { type: "raster-dem", tiles: ["updem://{z}/{x}/{y}"], encoding: "terrarium", tileSize: 256, maxzoom: 13 };
}

function drawMap() {
  const g = D.shape.geometry, b = D.b;
  const W = $("poster").clientWidth, H = $("poster").clientHeight;
  const widthM = Math.hypot((b[1][0] - b[0][0]) * 111320 * Math.cos(b[0][1] * Math.PI / 180), (b[1][1] - b[0][1]) * 110540);
  const dem = raisedDem(D.shape, Math.max(50, Math.min(250, widthM * 0.007)));
  map = new maplibregl.Map({
    container: "pmap", interactive: false, preserveDrawingBuffer: true, attributionControl: false, fadeDuration: 0,
    pixelRatio: Math.max(2, devicePixelRatio || 1), bounds: b, maxPitch: 70,
    fitBoundsOptions: { padding: { top: H * 0.3, bottom: H * 0.4, left: W * 0.08, right: W * 0.08 } },
    style: { version: 8, glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
      sky: { "sky-color": "#f4f1ea", "horizon-color": "#f4f1ea", "fog-color": "#f4f1ea", "sky-horizon-blend": 0.5, "horizon-fog-blend": 0.5, "fog-ground-blend": 0.2 },
      sources: { osm: { type: "vector", url: "https://tiles.openfreemap.org/planet" }, dem, hs: { ...dem } },
      layers: [
        { id: "bg", type: "background", paint: { "background-color": "#f4f1ea" } },
        // sea and wide river water first (coarse at this zoom); the land of the upazilas goes on top in coastal districts
        { id: "sea", type: "fill", source: "osm", "source-layer": "water", filter: ["in", ["get", "class"], ["literal", ["ocean", "river"]]], paint: { "fill-color": "#b9dcf5" } },
        { id: "wood", type: "fill", source: "osm", "source-layer": "landcover", filter: ["in", ["get", "class"], ["literal", ["wood", "forest"]]], paint: { "fill-color": "#dfe9d3", "fill-opacity": 0.8 } },
        { id: "hill", type: "hillshade", source: "hs", paint: { "hillshade-exaggeration": 0.55, "hillshade-shadow-color": "#5b5446", "hillshade-highlight-color": "#ffffff", "hillshade-accent-color": "#8a8170", "hillshade-illumination-direction": 315 } },
        { id: "lake", type: "fill", source: "osm", "source-layer": "water", filter: ["!", ["in", ["get", "class"], ["literal", ["ocean", "river"]]]], paint: { "fill-color": "#7fb8e8" } },
        { id: "stream", type: "line", source: "osm", "source-layer": "waterway", layout: { "line-cap": "round" },
          paint: { "line-color": "#1d6fc4", "line-opacity": 0.95, "line-width": ["match", ["get", "class"], "river", 2.6, "canal", 1.4, 0.8] } },
        { id: "road-minor", type: "line", source: "osm", "source-layer": "transportation", filter: ["in", ["get", "class"], ["literal", ["tertiary", "minor"]]],
          paint: { "line-color": "#b8b1a4", "line-width": 0.6 } },
        { id: "road-case", type: "line", source: "osm", "source-layer": "transportation", filter: ["in", ["get", "class"], ["literal", ["motorway", "trunk", "primary", "secondary"]]],
          layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#ffffff", "line-width": ["match", ["get", "class"], "secondary", 2.6, 3.6] } },
        { id: "road", type: "line", source: "osm", "source-layer": "transportation", filter: ["in", ["get", "class"], ["literal", ["motorway", "trunk", "primary", "secondary"]]],
          layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#57534e", "line-width": ["match", ["get", "class"], "secondary", 1, 1.6] } },
      ] },
  });
  map.on("load", () => {
    const world = [[-180, -85], [180, -85], [180, 85], [-180, 85], [-180, -85]];
    map.addSource("mask", { type: "geojson", data: { type: "Feature", geometry: { type: "Polygon", coordinates: [world, ...rings(g)] } } });
    if (D.all) {
      const dx = (b[1][0] - b[0][0]) * 1.6 + 0.3, dy = (b[1][1] - b[0][1]) * 1.6 + 0.3;
      D.near = D.all.features.filter(f => {
        let x0 = 180, y0 = 90, x1 = -180, y1 = -90;
        rings(f.geometry).forEach(r => r.forEach(([x, y]) => { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }));
        return x1 > b[0][0] - dx && x0 < b[1][0] + dx && y1 > b[0][1] - dy && y0 < b[1][1] + dy;
      });
      // coastal districts: OpenStreetMap's coarse estuary water (marked "lake" at this zoom) covers islands such as
      // Hatiya, so the land of the upazilas goes on top there; inland, real lakes like Kaptai stay visible
      const COAST = ["Noakhali", "Bhola", "Lakshmipur", "Chittagong", "Cox's Bazar", "Patuakhali", "Barguna", "Feni", "Chandpur"];
      map.addSource("land", { type: "geojson", data: { type: "FeatureCollection", features: D.near } });
      map.addLayer({ id: "land", type: "fill", source: "land", paint: { "fill-color": "#f4f1ea" } }, COAST.includes(D.rep.node.district) ? "stream" : "wood");
      map.addSource("nb", { type: "geojson", data: { type: "FeatureCollection", features: D.near.filter(f => f.properties.id !== nodeId) } });
      map.addLayer({ id: "nb", type: "line", source: "nb", paint: { "line-color": "#78716c", "line-width": 0.8, "line-dasharray": [3, 2], "line-opacity": 0.6 } });
    }
    // where water rose in 9 monsoons (our Sentinel-1 analysis), over the land and under the rivers
    FQ.tiles.forEach((tl, i) => {
      map.addSource(`fq${i}`, { type: "image", url: tl.url, coordinates: [[tl.w, tl.n], [tl.e, tl.n], [tl.e, tl.s], [tl.w, tl.s]] });
      map.addLayer({ id: `fq${i}`, type: "raster", source: `fq${i}`, paint: { "raster-opacity": 0.68, "raster-resampling": "nearest" } }, "lake");
    });
    if (D.riv) {
      map.addSource("riv", { type: "geojson", data: D.riv });
      map.addLayer({ id: "riv-glow", type: "line", source: "riv", layout: { "line-cap": "round" },
        paint: { "line-color": "#60a5fa", "line-opacity": 0.45, "line-blur": 3, "line-width": ["interpolate", ["linear"], ["get", "order"], 3, 8, 9, 20] } }, "road-minor");
      map.addLayer({ id: "riv", type: "line", source: "riv", layout: { "line-cap": "round" },
        paint: { "line-color": "#1557a8", "line-width": ["interpolate", ["linear"], ["get", "order"], 3, 2.2, 9, 5] } }, "road-minor");
    }
    // outside the area fades to paper, so this upazila stands out
    map.addLayer({ id: "mask", type: "fill", source: "mask", paint: { "fill-color": "#f4f1ea", "fill-opacity": 0.72 } });
    map.addSource("upz", { type: "geojson", data: { type: "Feature", properties: {}, geometry: { type: "MultiLineString", coordinates: rings(g) } } });
    map.addLayer({ id: "upz-cliff", type: "line", source: "upz", paint: { "line-color": "#a8987f", "line-width": 7, "line-blur": 2, "line-opacity": 0.85 } });
    map.addLayer({ id: "upz-line", type: "line", source: "upz", paint: { "line-color": "#111827", "line-width": 1.6 } });
    const z = map.getZoom();
    map.setTerrain({ source: "dem", exaggeration: z <= 10 ? 2 : z >= 13 ? 1.2 : 2 - (z - 10) * 0.27 });
    map.jumpTo({ pitch: 40, bearing: -10, zoom: z + 0.35 });
    map.once("idle", () => {
      if (FQ.tiles.length) {
        map.addSource("froad", { type: "geojson", data: floodedRoads() });
        map.addLayer({ id: "froad-case", type: "line", source: "froad", layout: { "line-cap": "round" }, paint: { "line-color": "#ffffff", "line-width": 5 } });
        // black and white dashes: they show over the red of low land as well as over green
        map.addLayer({ id: "froad", type: "line", source: "froad", layout: { "line-cap": "butt" }, paint: { "line-color": "#111827", "line-width": 3, "line-dasharray": [2, 1.2] } });
      }
      FLOW = flowLayer(map, D.riv || { features: [] }, b);
      // finish once the new road layer is drawn; the map sends no new "idle" if nothing changed, so ask it to
      // redraw, and finish anyway after a few seconds so the "drawing" note can never stay up
      let done = false;
      const finish = () => { if (done) return; done = true; placeLabels(); drawScale(); $("pload").hidden = true; };
      map.once("idle", finish); map.triggerRepaint(); setTimeout(finish, 4000);
    });
  });
}

/* ---------- moving light on the rivers and canals, in the way the water runs ---------- */
let FLOW = null;
function flowLayer(map, rivers, bounds) {
  const wrap = $("poster");
  const cv = document.createElement("canvas"); cv.className = "pflow"; cv.setAttribute("aria-hidden", "true");
  wrap.insertBefore(cv, $("pmap").nextSibling);
  const ctx = cv.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const R_EARTH = 6371000, rad = Math.PI / 180;
  const pad = 0.08, box = [bounds[0][0] - pad, bounds[0][1] - pad, bounds[1][0] + pad, bounds[1][1] + pad];
  let lines = [], parts = [], W = 0, H = 0, last = 0;
  const dist = (a, b) => { const x = (b[0] - a[0]) * Math.cos((a[1] + b[1]) / 2 * rad), y = b[1] - a[1]; return Math.hypot(x, y) * rad * R_EARTH; };
  function addLine(coords, kind, q) {
    if (coords.length < 2) return;
    const cum = [0];
    for (let i = 1; i < coords.length; i++) cum.push(cum[i - 1] + dist(coords[i - 1], coords[i]));
    if (cum[cum.length - 1] < 30) return;
    // half the channel width in metres: from mean discharge for HydroRIVERS (width ~ 7 x sqrt(Q)), a few metres for OSM lines
    const half = kind === "big" ? Math.max(60, Math.min(1500, 3.5 * Math.sqrt(q || 100))) : kind === "river" ? 25 : kind === "canal" ? 6 : 3;
    // light on waterways outside the area is kept faint, so the eye stays on the raised upazila
    const mid = coords[Math.floor(coords.length / 2)];
    lines.push({ c: coords, cum, len: cum[cum.length - 1], kind, half, inside: kind === "big" || inArea(mid[0], mid[1]) });
  }
  const areaRings = rings(D.shape.geometry);
  function inArea(x, y) {
    return areaRings.some(r => { let ins = false;
      for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const [xi, yi] = r[i], [xj, yj] = r[j];
        if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) ins = !ins; }
      return ins; });
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
    } catch (e) { /* tiles not ready */ }
    const mpp = 156543.03 * Math.cos(map.getCenter().lat * rad) / Math.pow(2, map.getZoom());
    const total = lines.reduce((a, l) => a + l.len, 0), per = Math.max(3 * mpp, total / 1100);
    parts = [];
    lines.forEach((l, li) => {
      const n = Math.max(l.kind === "stream" ? 0 : 1, Math.round(l.len / per * Math.max(1, Math.min(4, l.half * 2 / (8 * mpp))) * (l.inside ? 1 : 0.35)));
      for (let k = 0; k < n; k++) parts.push({ li, d: Math.random() * l.len, off: (Math.random() + Math.random() - 1), tw: Math.random() * 6.3, sp: 0.7 + Math.random() * 0.6, ln: 0.5 + Math.random() * 0.9 });
    });
    if (parts.length > 1100) parts = parts.filter(() => Math.random() < 1100 / parts.length);
  }
  function at(l, d) {
    let i = 1; while (i < l.cum.length - 1 && l.cum[i] < d) i++;
    const a = l.c[i - 1], b = l.c[i], seg = l.cum[i] - l.cum[i - 1] || 1, k = (d - l.cum[i - 1]) / seg;
    return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
  }
  const SPEED = { big: 34, river: 30, canal: 20, stream: 15 }, HALF = { big: 4, river: 2.5, canal: 1.2, stream: 0.6 };
  function draw(ts) {
    const dt = Math.min(0.08, (ts - last) / 1000 || 0); last = ts;
    ctx.clearRect(0, 0, W, H);
    const zoom = map.getZoom(), mpp = 156543.03 * Math.cos(map.getCenter().lat * rad) / Math.pow(2, zoom), t = ts / 1000;
    const zf = Math.max(0.6, Math.min(2.2, (zoom - 9) / 3));
    ctx.lineCap = "round";
    for (const p of parts) {
      const l = lines[p.li];
      if (!reduce) { p.d += SPEED[l.kind] * p.sp * mpp * dt; if (p.d > l.len) p.d -= l.len; }
      const tail = Math.min(p.d, 12 * mpp * zf * p.ln);
      const a = map.project(at(l, p.d)), b = map.project(at(l, p.d - tail));
      if (a.x < -20 || a.y < -20 || a.x > W + 20 || a.y > H + 20) continue;
      if (Math.hypot(a.x - b.x, a.y - b.y) > 40 * zf) continue;  // across the block's edge it would draw as a tall line
      const dx = a.x - b.x, dy = a.y - b.y, n = Math.hypot(dx, dy) || 1, o = p.off * Math.max(HALF[l.kind] * zf, l.half / mpp);
      const alpha = (0.35 + 0.6 * (0.5 + 0.5 * Math.sin(t * 2.2 + p.tw))) * (1 - Math.abs(p.off) * 0.5) * (l.inside ? 1 : 0.3);
      ctx.strokeStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
      ctx.lineWidth = l.kind === "big" ? 2 : l.kind === "stream" ? 1 : 1.5;
      ctx.beginPath(); ctx.moveTo(b.x - dy / n * o, b.y + dx / n * o); ctx.lineTo(a.x - dy / n * o, a.y + dx / n * o); ctx.stroke();
    }
  }
  function frame(ts) { requestAnimationFrame(frame); if (ts - last < 32 || document.hidden) return; draw(ts); }
  const size = () => { const d = Math.min(2, devicePixelRatio || 1); W = wrap.clientWidth; H = wrap.clientHeight; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
  size(); rebuild(); requestAnimationFrame(frame);
  return { count: () => parts.length, lines: () => lines.length, size, rebuild };
}

/* ---------- labels (HTML), placed so they do not overlap each other, the title or the legend ---------- */
function placeLabels() {
  const box = $("plabels"), P = $("poster").getBoundingClientRect();
  box.innerHTML = "";
  const taken = [".ptitle", ".prisk", ".pbrand", ".plegend", ".pscale", ".pnorth", ".pfoot"].map(s => document.querySelector(s).getBoundingClientRect())
    .map(r => ({ x: r.left - P.left - 14, y: r.top - P.top - 10, w: r.width + 28, h: r.height + 20 }));
  const free = r => r.x > 4 && r.y > 4 && r.x + r.w < P.width - 4 && r.y + r.h < P.height - 4 && !taken.some(o => r.x < o.x + o.w && o.x < r.x + r.w && r.y < o.y + o.h && o.y < r.y + r.h);
  const put = (el, x, y) => {  // centre at x, y if there is room
    box.appendChild(el);
    const w = el.offsetWidth, h = el.offsetHeight, r = { x: x - w / 2, y: y - h / 2, w, h };
    if (!free(r)) { el.remove(); return false; }
    el.style.left = `${x}px`; el.style.top = `${y}px`; taken.push(r); return true;
  };
  const tt = t();
  // hospitals first (the most useful), each with a callout on whichever side has room
  D.hosp.forEach(h => {
    const q = map.project([h.lon, h.lat]);
    const d = document.createElement("div"); d.className = "hdot"; d.textContent = "+"; d.style.left = `${q.x}px`; d.style.top = `${q.y}px`;
    box.appendChild(d);
  });
  D.hosp.slice(0, 8).forEach(h => {
    const p = map.project([h.lon, h.lat]);
    const name = (lang === "bn" && h.name_bn) || h.name;
    let type = lang === "bn" ? (HOSP_BN[h.type] || h.type) : h.type;
    if (type && name.includes(type.split(" ")[0]) && name.length > type.length * 0.6) type = h.beds ? (lang === "bn" ? `${nf(h.beds)} শয্যা` : `${h.beds} beds`) : "";
    const pin = document.createElement("div"); pin.className = "pin"; pin.style.left = `${p.x}px`; pin.style.top = `${p.y}px`;
    for (const [dx, dy, side] of [[1, -1, "right"], [-1, -1, "left"], [1, 1, "right"], [-1, 1, "left"]]) {
      const el = document.createElement("div");
      el.className = `co ${side}`;
      const tel = h.mobile ? String(h.mobile).replace(/[^\d+]/g, "") : "";
      const telS = lang === "bn" ? tel.replace(/\d/g, x => BN_D[x]) : tel;
      el.innerHTML = `<span class="dot" style="background:#e11d48">+</span><div class="box"><b>${name}</b>${type ? `<small>${type}</small>` : ""}${tel ? `<small class="ph">☎ ${telS}</small>` : ""}</div>`;
      box.appendChild(el);
      const w = el.offsetWidth, hgt = el.offsetHeight, off = P.width * 0.06;
      const cx = p.x + dx * (w / 2 + off * 0.3), cy = p.y + dy * (hgt / 2 + off * 0.5);
      el.remove();
      if (put(el, cx, cy)) {
        box.appendChild(pin);
        const ax = cx - dx * (w / 2 - P.width * 0.022), ay = cy;  // the end of the leader at the dot's centre
        const ln = document.createElement("div"); ln.className = "leader";
        const len = Math.hypot(ax - p.x, ay - p.y), ang = Math.atan2(ay - p.y, ax - p.x);
        ln.style.left = `${p.x}px`; ln.style.top = `${p.y}px`; ln.style.width = `${len}px`; ln.style.transform = `rotate(${ang}rad)`;
        box.insertBefore(ln, box.firstChild);
        break;
      }
    }
  });
  // river names from OpenStreetMap (Bangla name when the map has one), at most 4
  const seen = new Set(), vis = map.getBounds();
  const rivs = map.querySourceFeatures("osm", { sourceLayer: "waterway", filter: ["==", ["get", "class"], "river"] })
    // one script per language, so a river is not named twice (OpenStreetMap often has only one of the two)
    .map(f => { const pr = f.properties, cands = [pr["name:bn"], pr["name:en"], pr.name].filter(Boolean);
      return { f, name: cands.find(n => lang === "bn" ? /[ঀ-৿]/.test(n) : !/[ঀ-৿]/.test(n)) }; })
    .filter(r => r.name && r.f.geometry.type === "LineString" && r.f.geometry.coordinates.length > 3)
    .sort((a, b) => b.f.geometry.coordinates.length - a.f.geometry.coordinates.length);
  let nr = 0;
  for (const r of rivs) {
    if (nr >= 4 || seen.has(r.name)) continue;
    const cs = r.f.geometry.coordinates, mid = cs[Math.floor(cs.length / 2)];
    if (!vis.contains(mid)) continue;
    const el = document.createElement("div"); el.className = "lb riv"; el.textContent = r.name;
    const p = map.project(mid);
    if (put(el, p.x, p.y - P.width * 0.015)) { seen.add(r.name); nr++; }
  }
  // neighbouring upazilas, by their official names
  if (D.all) (D.near || D.all.features).forEach(f => {
    if (f.properties.id === nodeId) return;
    const c = labelPoint(f.geometry);
    if (!vis.contains(c)) return;
    const el = document.createElement("div"); el.className = "lb nb";
    el.textContent = (lang === "bn" && f.properties.bn) || f.properties.name;
    const p = map.project(c); put(el, p.x, p.y);
  });
}

function drawScale() {
  const P = $("poster").clientWidth, c = map.getCenter(), z = map.getZoom();
  const mpp = 40075016.686 * Math.cos(c.lat * Math.PI / 180) / (512 * Math.pow(2, z));
  const want = P * 0.16 * mpp / 1000;  // km in about 16% of the width
  const nice = [0.5, 1, 2, 5, 10, 20, 50].find(v => v >= want * 0.6) || 50;
  const px = nice * 1000 / mpp;
  $("pscale").innerHTML = `<div class="bar" style="width:${px}px"></div>${nf(0)} — ${nf(nice, 1)} ${t().km}`;
}

$("lang").onclick = () => { lang = lang === "bn" ? "en" : "bn"; try { localStorage.setItem("fs-lang", lang); } catch (e) {} renderText(); drawScale(); };
$("dl").onclick = async () => {
  const b = $("dl"); b.disabled = true; b.textContent = t().dlWait;
  try {
    await document.fonts.ready;
    const c = await html2canvas($("poster"), { scale: 2, useCORS: true, backgroundColor: "#0a0f14", logging: false });
    const a = document.createElement("a");
    a.download = `${(D.rep && D.rep.node.name) || "upazila"}-floodshield.png`.replace(/\s+/g, "-");
    a.href = c.toDataURL("image/png"); a.click();
  } catch (e) { console.warn(e); }
  b.disabled = false; b.textContent = t().dl;
};
let rz; addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(() => { if (map) { map.resize(); if (FLOW) { FLOW.size(); FLOW.rebuild(); } placeLabels(); drawScale(); } }, 250); });
load();
