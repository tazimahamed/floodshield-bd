/* FloodShield BD — one upazila as a map poster: dark hillshade, rivers, the satellite's unusual water, hospitals,
   the flood chance and the flood history, with official Bangla names. Every layer is real data, and the footer
   names each source. Bangla labels are HTML on top of the map: the map library cannot join Bangla letters. */
const $ = id => document.getElementById(id);
let lang = (() => { try { return localStorage.getItem("fs-lang") || "bn"; } catch (e) { return "bn"; } })();
const nodeId = decodeURIComponent(location.pathname.split("/")[2] || "");
const BN_D = "০১২৩৪৫৬৭৮৯";
const nf = (n, d = 0) => { const s = Number(n).toLocaleString("en-IN", { maximumFractionDigits: d, minimumFractionDigits: 0 });
  return lang === "bn" ? s.replace(/\d/g, x => BN_D[x]) : s; };
const RISK_C = { low: "#3fbf74", medium: "#f0ad2b", high: "#f06454" };
const HOSP_BN = { "Upazila Health Complex": "উপজেলা স্বাস্থ্য কমপ্লেক্স", "District Hospital": "জেলা হাসপাতাল",
  "Medical College Hospital": "মেডিকেল কলেজ হাসপাতাল", "General Hospital": "জেনারেল হাসপাতাল", "Specialized Hospital": "বিশেষায়িত হাসপাতাল",
  "Union Health and Family Welfare Centre": "ইউনিয়ন স্বাস্থ্য ও পরিবার কল্যাণ কেন্দ্র", "Mother and Child Welfare Centre": "মা ও শিশু কল্যাণ কেন্দ্র" };

const T = {
  bn: {
    back: "← ফিরে যান", dl: "⬇ ছবি হিসেবে নামান", dlWait: "ছবি তৈরি হচ্ছে…", lang: "English",
    sub: (d, v, metro) => `${d} জেলা · ${v} বিভাগ${metro ? " · মহানগর থানা" : ""}`,
    chance: "বন্যার সম্ভাবনা, আগামী ১৫ দিন", risk: { low: "নিম্ন", medium: "মাঝারি", high: "উচ্চ" }, noFc: "এই মুহূর্তে পূর্বাভাস নেই",
    waterT: "পানি", waterS: "নদী, খাল-বিল আর স্যাটেলাইটে দেখা পানি",
    river: "বড় নদী (HydroRIVERS)", stream: "নদী ও খাল (OpenStreetMap)", lake: "স্থায়ী জলাশয়, বিল ও হাওর",
    satW: d => `স্যাটেলাইটে বাড়তি পানি (${d})`, slide: p => `ভূমিধসের সম্ভাবনা, সর্বোচ্চ ${p}% (NASA)`,
    lifeT: "সেবা ও পথ", lifeS: "সরকারি হাসপাতাল আর প্রধান সড়ক",
    hosp: n => n ? `সরকারি হাসপাতাল: ${n}টি (DGHS)` : "এই এলাকায় DGHS-এর তালিকায় হাসপাতাল নেই",
    road: "প্রধান সড়ক", border: "এই এলাকার সীমানা", nbBorder: "পাশের উপজেলা",
    histT: "বন্যার ইতিহাস", histS: "প্রতি বর্ষায় সবচেয়ে বেশি ডোবা অংশ (Sentinel-1)", rule: "বন্যা ধরা হয় ৫%",
    histNone: "এই এলাকার বন্যার ইতিহাস নেই",
    foot: "ভূমিরূপ: Terrarium DEM (Mapzen) · নদী, সড়ক ও জলাশয়: © OpenStreetMap অবদানকারী (OpenFreeMap) · বড় নদী: HydroRIVERS · পানি: Sentinel-1 (ESA) · হাসপাতাল: DGHS · নাম: bangladesh.gov.bd · ঝুঁকি: FloodShield BD-র মডেল, সরকারি সতর্কবার্তা নয়",
    note: "এই মানচিত্রের প্রতিটি স্তর আসল ডেটা থেকে তৈরি, উৎস নিচে লেখা। ঝুঁকির সংখ্যা আমাদের মডেলের হিসাব, সরকারি সতর্কবার্তা নয়: জরুরি অবস্থায় FFWC, আবহাওয়া অধিদপ্তর ও উপজেলা প্রশাসনের নির্দেশনা মানুন।",
    km: "কিমি",
  },
  en: {
    back: "← Back", dl: "⬇ Download as picture", dlWait: "Making the picture…", lang: "বাংলা",
    sub: (d, v, metro) => `${d} district · ${v} division${metro ? " · metropolitan thana" : ""}`,
    chance: "Chance of flooding, next 15 days", risk: { low: "low", medium: "medium", high: "high" }, noFc: "No forecast right now",
    waterT: "Water", waterS: "Rivers, wetlands and the water the satellite saw",
    river: "Big rivers (HydroRIVERS)", stream: "Rivers and canals (OpenStreetMap)", lake: "Lakes, beels and haors",
    satW: d => `Unusual water on the satellite (${d})`, slide: p => `Landslide chance, up to ${p}% (NASA)`,
    lifeT: "Help and roads", lifeS: "Government hospitals and main roads",
    hosp: n => n ? `Government hospitals: ${n} (DGHS)` : "No hospital in the DGHS list here",
    road: "Main roads", border: "This area's border", nbBorder: "Neighbouring upazilas",
    histT: "Flood history", histS: "Largest flooded share each monsoon (Sentinel-1)", rule: "flood = 5%",
    histNone: "No flood history for this area",
    foot: "Terrain: Terrarium DEM (Mapzen) · Rivers, roads, water: © OpenStreetMap contributors (OpenFreeMap) · Big rivers: HydroRIVERS · Water: Sentinel-1 (ESA) · Hospitals: DGHS · Names: bangladesh.gov.bd · Risk: FloodShield BD model, not an official warning",
    note: "Every layer on this map is real data, with its source in the footer. The risk number is our model's estimate, not an official warning: in an emergency follow FFWC, the Met Department and your upazila administration.",
    km: "km",
  },
};
const t = () => T[lang];
const D = {};
let map = null;

const rings = g => g.type === "Polygon" ? [g.coordinates[0]] : g.coordinates.map(p => p[0]);
const ringArea = r => { let a = 0; for (let i = 0, j = r.length - 1; i < r.length; j = i++) a += (r[j][0] + r[i][0]) * (r[j][1] - r[i][1]); return Math.abs(a / 2); };
function labelPoint(g) {  // the centre of the largest ring, nudged inside if the centre falls outside it
  const r = rings(g).sort((a, b) => ringArea(b) - ringArea(a))[0];
  let x = 0, y = 0; r.forEach(p => { x += p[0]; y += p[1]; });
  return [x / r.length, y / r.length];
}
const dShort = iso => new Date(iso + "T00:00:00Z").toLocaleDateString(lang === "bn" ? "bn-BD" : "en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

async function getJSON(u) { try { const r = await fetch(u); return r.ok ? r.json() : null; } catch (e) { return null; } }

async function load() {
  const [rep, shape, why, hosp, riv, all, wn, ls] = await Promise.all([
    getJSON(`/api/v1/nodes/${nodeId}/report`), getJSON(`/api/v1/nodes/${nodeId}/shape`), getJSON(`/api/v1/nodes/${nodeId}/why`),
    getJSON(`/api/v1/nodes/${nodeId}/hospitals`), getJSON(`/api/v1/nodes/${nodeId}/rivers?min_upland_km2=500`),
    getJSON("/api/v1/upazilas"), getJSON("/api/v1/water-now"), getJSON("/api/v1/landslide-now")]);
  if (!rep || !shape) { $("pname").textContent = "—"; return; }
  Object.assign(D, { rep, shape, why, hosp: hosp ? hosp.hospitals.filter(h => h.lat != null) : [], riv, all, wn, ls });
  $("back").href = `/upazila/${nodeId}`;
  renderText();
  drawMap();
}

function renderText() {
  const tt = t(), n = D.rep.node, c = D.rep.current, metro = n.kind === "metro";
  const name = (lang === "bn" && n.bn) || n.name;
  document.documentElement.lang = lang;
  document.title = `${name} · ${lang === "bn" ? "মানচিত্র" : "map"} · FloodShield BD`;
  $("back").textContent = tt.back; $("dl").textContent = tt.dl; $("lang").textContent = tt.lang;
  $("pname").textContent = name;
  $("psub").textContent = tt.sub((lang === "bn" && n.district_bn) || n.district, (lang === "bn" && n.division_bn) || n.division, metro);
  $("prisk").innerHTML = c ? `<i style="background:${RISK_C[c.risk]}"></i><span>${tt.chance}</span><b>${nf(Math.round(c.flood_prob * 100))}%</b><span>${tt.risk[c.risk]}</span>`
    : `<span>${tt.noFc}</span>`;
  // legend: water, help and roads, flood history
  const s = D.ls && D.ls.upazilas[nodeId] && D.ls.upazilas[nodeId].max >= 0.005 ? D.ls.upazilas[nodeId] : null;
  const water = `<div class="lg" style="--c:var(--water)"><h3>${tt.waterT}</h3><p>${tt.waterS}</p><ul>
      <li><span class="sw line" style="background:#38bdf8;box-shadow:0 0 1cqw #38bdf8"></span>${tt.river}</li>
      <li><span class="sw line" style="background:#5aa9d6"></span>${tt.stream}</li>
      <li><span class="sw" style="background:#1d5f8f"></span>${tt.lake}</li>
      ${D.wn ? `<li><span class="sw" style="background:#4fd1ff"></span>${tt.satW(dShort(D.wn.latest_picture || D.wn.window[1]))}</li>` : ""}
      ${s ? `<li><span class="sw" style="background:#f58c1e"></span>${tt.slide(nf(s.max * 100, 1))}</li>` : ""}</ul></div>`;
  const life = `<div class="lg" style="--c:#f472b6"><h3>${tt.lifeT}</h3><p>${tt.lifeS}</p><ul>
      <li><span class="sw dot" style="background:#e5486b">+</span>${tt.hosp(D.hosp.length ? nf(D.hosp.length) : 0)}</li>
      <li><span class="sw line" style="background:rgba(255,255,255,.75)"></span>${tt.road}</li>
      <li><span class="sw line" style="background:#e9f6ff;box-shadow:0 0 1cqw #7dd3fc"></span>${tt.border}</li>
      <li><span class="sw line" style="background:rgba(255,255,255,.3)"></span>${tt.nbBorder}</li></ul></div>`;
  $("plegend").innerHTML = water + life + history();
  $("pfoot").textContent = tt.foot;
  $("pnote").textContent = tt.note;
  if (map && map.loaded()) placeLabels();
}

function history() {
  const tt = t(), rows = (D.rep.history || []).filter(r => !r.named_event);
  const by = {};
  rows.forEach(r => { const y = +r.start.slice(0, 4); by[y] = Math.max(by[y] ?? 0, r.flooded_pct); });
  const years = Object.keys(by).map(Number).sort();
  if (!years.length) return `<div class="lg"><h3>${tt.histT}</h3><p>${tt.histNone}</p></div>`;
  const top = Math.max(10, ...Object.values(by)) * 1.1, rule = D.rep.flood_threshold_pct || 5;
  const yy = y => lang === "bn" ? nf(y % 100).padStart(2, "০") : String(y % 100).padStart(2, "0");
  return `<div class="lg"><h3>${tt.histT}</h3><p>${tt.histS}</p><div class="bars">
    ${years.map(y => `<div class="b${by[y] >= rule ? " fl" : ""}" title="${nf(by[y], 1)}%"><i style="height:${Math.max(1.5, by[y] / top * 100)}%"></i></div>`).join("")}
    <div class="rule" style="bottom:${rule / top * 100}%"><span>${tt.rule}</span></div></div>
    <div class="yrs">${years.map(y => `<small>${yy(y)}</small>`).join("")}</div></div>`;
}

function drawMap() {
  const g = D.shape.geometry, xs = [], ys = [];
  rings(g).forEach(r => r.forEach(([x, y]) => { xs.push(x); ys.push(y); }));
  const b = [[Math.min(...xs), Math.min(...ys)], [Math.max(...xs), Math.max(...ys)]];
  const W = $("poster").clientWidth, H = $("poster").clientHeight;
  map = new maplibregl.Map({
    container: "pmap", interactive: false, preserveDrawingBuffer: true, attributionControl: false, fadeDuration: 0,
    pixelRatio: Math.max(2, devicePixelRatio || 1), bounds: b,
    fitBoundsOptions: { padding: { top: H * 0.27, bottom: H * 0.42, left: W * 0.08, right: W * 0.08 } },
    style: { version: 8, glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
      sources: {
        osm: { type: "vector", url: "https://tiles.openfreemap.org/planet" },
        dem: { type: "raster-dem", tiles: ["https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"], encoding: "terrarium", tileSize: 256, maxzoom: 13 },
      },
      layers: [
        { id: "bg", type: "background", paint: { "background-color": "#11171c" } },
        { id: "wood", type: "fill", source: "osm", "source-layer": "landcover", filter: ["in", ["get", "class"], ["literal", ["wood", "forest"]]], paint: { "fill-color": "#1f3a29", "fill-opacity": 0.35 } },
        { id: "wet", type: "fill", source: "osm", "source-layer": "landcover", filter: ["==", ["get", "class"], "wetland"], paint: { "fill-color": "#1f4d55", "fill-opacity": 0.55 } },
        { id: "hill", type: "hillshade", source: "dem", paint: { "hillshade-exaggeration": 0.9, "hillshade-shadow-color": "#020405", "hillshade-highlight-color": "#86b88a", "hillshade-accent-color": "#0f1a14", "hillshade-illumination-direction": 315 } },
        { id: "lake", type: "fill", source: "osm", "source-layer": "water", paint: { "fill-color": "#1d5f8f", "fill-opacity": 0.92 } },
        { id: "stream", type: "line", source: "osm", "source-layer": "waterway", layout: { "line-cap": "round" },
          paint: { "line-color": "#5aa9d6", "line-opacity": 0.75, "line-width": ["match", ["get", "class"], "river", 1.6, "canal", 1.1, 0.6] } },
        { id: "road-minor", type: "line", source: "osm", "source-layer": "transportation", filter: ["in", ["get", "class"], ["literal", ["tertiary", "minor"]]],
          paint: { "line-color": "rgba(255,255,255,.16)", "line-width": 0.6 } },
        { id: "road", type: "line", source: "osm", "source-layer": "transportation", filter: ["in", ["get", "class"], ["literal", ["motorway", "trunk", "primary", "secondary"]]],
          layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "rgba(255,255,255,.72)", "line-width": ["match", ["get", "class"], "secondary", 0.9, 1.5] } },
      ] },
  });
  map.on("load", () => {
    const world = [[-180, -85], [180, -85], [180, 85], [-180, 85], [-180, -85]];
    map.addSource("mask", { type: "geojson", data: { type: "Feature", geometry: { type: "Polygon", coordinates: [world, ...rings(g)] } } });
    if (D.all) {
      map.addSource("nb", { type: "geojson", data: { type: "FeatureCollection", features: D.all.features.filter(f => f.properties.id !== nodeId) } });
      map.addLayer({ id: "nb", type: "line", source: "nb", paint: { "line-color": "rgba(255,255,255,.3)", "line-width": 0.8, "line-dasharray": [2, 2] } });
    }
    // the satellite's unusual water and NASA's landslide chance, as pictures
    if (D.wn) D.wn.tiles.forEach((tl, i) => {
      const [[s, w], [n, e]] = tl.bounds;
      if (e < b[0][0] || w > b[1][0] || n < b[0][1] || s > b[1][1]) return;
      map.addSource(`wn${i}`, { type: "image", url: `/api/v1/water-now/${tl.file}?d=${D.wn.computed_at.slice(0, 10)}`, coordinates: [[w, n], [e, n], [e, s], [w, s]] });
      map.addLayer({ id: `wn${i}`, type: "raster", source: `wn${i}`, paint: { "raster-opacity": 0.95, "raster-hue-rotate": -12, "raster-brightness-min": 0.25 } });
    });
    if (D.ls && D.ls.upazilas[nodeId]) {
      const [[s, w], [n, e]] = D.ls.bounds;
      map.addSource("ls", { type: "image", url: `/api/v1/landslide-now.png?d=${D.ls.file}`, coordinates: [[w, n], [e, n], [e, s], [w, s]] });
      map.addLayer({ id: "ls", type: "raster", source: "ls", paint: { "raster-opacity": 0.8 } });
    }
    if (D.riv) {
      map.addSource("riv", { type: "geojson", data: D.riv });
      map.addLayer({ id: "riv-glow", type: "line", source: "riv", layout: { "line-cap": "round" },
        paint: { "line-color": "#38bdf8", "line-opacity": 0.35, "line-blur": 4, "line-width": ["interpolate", ["linear"], ["get", "order"], 3, 5, 9, 16] } });
      map.addLayer({ id: "riv", type: "line", source: "riv", layout: { "line-cap": "round" },
        paint: { "line-color": "#7dd3fc", "line-width": ["interpolate", ["linear"], ["get", "order"], 3, 1.2, 9, 3.4] } });
    }
    // outside the area goes dark, over the satellite water too, so this upazila stands out
    map.addLayer({ id: "mask", type: "fill", source: "mask", paint: { "fill-color": "#05080b", "fill-opacity": 0.62 } }, D.riv ? "riv-glow" : undefined);
    map.addSource("upz", { type: "geojson", data: D.shape });
    map.addLayer({ id: "upz-glow", type: "line", source: "upz", paint: { "line-color": "#7dd3fc", "line-width": 9, "line-blur": 6, "line-opacity": 0.55 } });
    map.addLayer({ id: "upz-line", type: "line", source: "upz", paint: { "line-color": "#eaf7ff", "line-width": 1.8 } });
    map.once("idle", () => { placeLabels(); drawScale(); });
  });
}

/* ---------- labels (HTML), placed so they do not overlap each other, the title or the legend ---------- */
function placeLabels() {
  const box = $("plabels"), P = $("poster").getBoundingClientRect();
  box.innerHTML = "";
  const taken = [".ptitle", ".pbrand", ".plegend", ".pscale", ".pnorth", ".pfoot"].map(s => document.querySelector(s).getBoundingClientRect())
    .map(r => ({ x: r.left - P.left - 6, y: r.top - P.top - 6, w: r.width + 12, h: r.height + 12 }));
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
      el.innerHTML = `<span class="dot" style="background:#e5486b">+</span><div class="box"><b>${name}</b>${type ? `<small>${type}</small>` : ""}</div>`;
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
  if (D.all) D.all.features.forEach(f => {
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
let rz; addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(() => { if (map) { map.resize(); placeLabels(); drawScale(); } }, 250); });
load();
