/* FloodShield BD — upazila report extras: where upstream rain is and the rivers that carry it here, relatively higher
   land inside the upazila, and the directions past cyclones came from. Everything is drawn from data we hold; none of
   it is a forecast of a flood's chance or of a storm's future path, and the page says so. Loaded after report.js. */
const XT = {
  en: {
    upT: "🌧️ Rain upstream, and the rivers that bring it here",
    upSub: (km2, pct) => `Rain falling on ${km2} km² of land drains through this upazila${pct > 0 ? `; ${pct}% of that land is outside Bangladesh` : ""}. Colours show the rain forecast for the next 3 days; the moving lines are rivers flowing this way.`,
    upAvg: v => `Average over all that land, next 3 days: <b>${v} mm</b>`,
    upItem: (km, dir, mm) => `<b>${mm} mm</b> expected about <b>${km} km to the ${dir}</b>`,
    upNone: "No heavy rain (20 mm or more in 3 days) is forecast anywhere upstream.",
    upHeavy: n => `Heaviest rain forecast upstream (${n} place${n > 1 ? "s" : ""} marked on the map):`,
    upHere: "This upazila",
    upSrc: "Rain: NOAA GFS forecast, per river basin (HydroBASINS). Rivers: HydroRIVERS. This shows where rain is expected and the way water travels. It does not give the chance of a flood or when water would arrive: we have no river model that passed our tests for that. For river levels, see FFWC.",
    upKey: "mm of rain in 3 days",
    dirs: ["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"],
    highBtn: "Higher land", highWait: "Reading the height data…",
    highSay: (hi, lo) => `Yellow: the highest 15% of land in this upazila, about <b>${hi} m</b> or more above sea level (the lowest land is about ${lo} m).`,
    highFlat: (d) => `This upazila is almost flat in the height data (about ${d} m between low and high land), which is less than the data's own error, so no higher land is marked.`,
    highNote: "From satellite height data (Mapzen terrain tiles, about 30 m squares). It can be wrong by a few metres, and trees and buildings count as height. It is not a list of safe places: in a flood or cyclone, go where your upazila administration says.",
    highFail: "The height data could not be loaded just now.",
    roseT: "Which way past storms came from",
    roseSay: (n, dir, k) => `Of <b>${n}</b> storms that passed within 150 km since 1960, most (<b>${k}</b>) came from the <b>${dir}</b>.`,
    roseNote: "This is history, not a forecast. For a storm that is active now, follow the Met Department's bulletins:",
    short: ["N", "NE", "E", "SE", "S", "SW", "W", "NW"],
  },
  bn: {
    upT: "🌧️ উজানের বৃষ্টি, আর যে নদীপথে পানি এখানে আসে",
    upSub: (km2, pct) => `${km2} বর্গকিমি জমিতে পড়া বৃষ্টির পানি এই উপজেলা দিয়ে বয়ে যায়${pct > 0 ? `; ওই জমির ${pct}% বাংলাদেশের বাইরে` : ""}। রঙ দেখায় আগামী ৩ দিনের বৃষ্টির পূর্বাভাস; চলমান রেখাগুলো এদিকে বয়ে আসা নদী।`,
    upAvg: v => `পুরো এলাকার গড়, আগামী ৩ দিনে: <b>${v} মিমি</b>`,
    upItem: (km, dir, mm) => `প্রায় <b>${km} কিমি ${dir} দিকে</b> <b>${mm} মিমি</b> বৃষ্টির পূর্বাভাস`,
    upNone: "উজানের কোথাও ভারী বৃষ্টির (৩ দিনে ২০ মিমি বা বেশি) পূর্বাভাস নেই।",
    upHeavy: n => `উজানে সবচেয়ে বেশি বৃষ্টির পূর্বাভাস (ম্যাপে ${n}টি জায়গা চিহ্নিত):`,
    upHere: "এই উপজেলা",
    upSrc: "বৃষ্টি: NOAA GFS পূর্বাভাস, প্রতিটি নদী অববাহিকার জন্য (HydroBASINS)। নদী: HydroRIVERS। এটি দেখায় কোথায় বৃষ্টি হতে পারে আর পানি কোন পথে আসে। বন্যার সম্ভাবনা বা পানি কখন পৌঁছাবে তা বলে না: এর জন্য আমাদের পরীক্ষায় পাস করা কোনো নদী-মডেল নেই। নদীর পানির স্তরের জন্য FFWC দেখুন।",
    upKey: "৩ দিনে বৃষ্টি, মিমি",
    dirs: ["উত্তর", "উত্তর-পূর্ব", "পূর্ব", "দক্ষিণ-পূর্ব", "দক্ষিণ", "দক্ষিণ-পশ্চিম", "পশ্চিম", "উত্তর-পশ্চিম"],
    highBtn: "উঁচু জমি", highWait: "উচ্চতার ডেটা পড়া হচ্ছে…",
    highSay: (hi, lo) => `হলুদ: এই উপজেলার সবচেয়ে উঁচু ১৫% জমি, সমুদ্রপৃষ্ঠ থেকে প্রায় <b>${hi} মিটার</b> বা বেশি (সবচেয়ে নিচু জমি প্রায় ${lo} মিটার)।`,
    highFlat: (d) => `উচ্চতার ডেটায় এই উপজেলা প্রায় সমতল (নিচু ও উঁচু জমির পার্থক্য প্রায় ${d} মিটার), যা ডেটার নিজের ভুলের চেয়েও কম। তাই উঁচু জমি চিহ্নিত করা হয়নি।`,
    highNote: "স্যাটেলাইটের উচ্চতা-ডেটা থেকে (Mapzen terrain tiles, প্রায় ৩০ মিটারের ঘর)। এতে কয়েক মিটার ভুল থাকতে পারে, আর গাছ ও দালানও উচ্চতা হিসেবে ধরা পড়ে। এটি নিরাপদ জায়গার তালিকা নয়: বন্যা বা ঘূর্ণিঝড়ে উপজেলা প্রশাসন যেখানে বলে সেখানে যান।",
    highFail: "উচ্চতার ডেটা এই মুহূর্তে আনা যায়নি।",
    roseT: "আগের ঝড়গুলো কোন দিক থেকে এসেছিল",
    roseSay: (n, dir, k) => `১৯৬০ থেকে ১৫০ কিমির মধ্যে দিয়ে যাওয়া <b>${n}</b>টি ঝড়ের বেশিরভাগ (<b>${k}</b>টি) এসেছিল <b>${dir}</b> দিক থেকে।`,
    roseNote: "এটি ইতিহাস, পূর্বাভাস নয়। এখন চলমান কোনো ঝড়ের জন্য আবহাওয়া অধিদপ্তরের বুলেটিন দেখুন:",
    short: ["উ", "উ-পূ", "পূ", "দ-পূ", "দ", "দ-প", "প", "উ-প"],
  },
};
const xt = () => XT[lang];
const RAIN_STEPS = [[0, "rgba(0,0,0,0)"], [1, "#3a6ea5"], [5, "#2f8fd8"], [10, "#33b3a6"], [20, "#7dcf3c"], [50, "#f2d43a"], [100, "#f07c2a"], [200, "#d42e5a"]];
const X = { up: null, rose: null, high: null, shape: null };

/* ---------- which way past storms came from ---------- */
function drawRose() {
  const d = X.rose, box = $("cyc-rose-wrap");
  if (!d || !d.storms) { box.hidden = true; return; }
  const tt = xt(), keys = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"], v = keys.map(k => d.from[k]), max = Math.max(...v, 1), top = v.indexOf(Math.max(...v));
  const petal = (i) => {
    const a = i * 45 * Math.PI / 180, len = 18 + v[i] / max * 62, w = 13;
    const tx = 110 + Math.sin(a) * len, ty = 110 - Math.cos(a) * len, px = Math.cos(a) * w, py = Math.sin(a) * w;
    const lx = 110 + Math.sin(a) * 98, ly = 110 - Math.cos(a) * 98;
    return `<path class="petal${i === top ? " top" : ""}" style="animation-delay:${i * 70}ms" d="M110 110 L${(110 + Math.sin(a) * 14 + px).toFixed(1)} ${(110 - Math.cos(a) * 14 + py).toFixed(1)} L${tx.toFixed(1)} ${ty.toFixed(1)} L${(110 + Math.sin(a) * 14 - px).toFixed(1)} ${(110 - Math.cos(a) * 14 - py).toFixed(1)} Z"/>
      <text x="${lx.toFixed(1)}" y="${(ly + 4).toFixed(1)}" text-anchor="middle" class="rl${i === top ? " top" : ""}">${tt.short[i]} ${nf(v[i])}</text>`;
  };
  box.hidden = false;
  $("cyc-rose-t").textContent = tt.roseT;
  $("cyc-rose").innerHTML = `<svg viewBox="0 0 220 220" role="img" aria-label="${tt.roseT}"><circle cx="110" cy="110" r="80" class="ring"/><circle cx="110" cy="110" r="45" class="ring"/>${keys.map((_, i) => petal(i)).join("")}<circle cx="110" cy="110" r="5" class="hub"/></svg>`;
  $("cyc-rose-say").innerHTML = `${tt.roseSay(nf(d.storms), tt.dirs[top], nf(v[top]))}<small>${tt.roseNote} <a href="https://www.bmd.gov.bd" target="_blank" rel="noopener">bmd.gov.bd</a></small>`;
}

/* ---------- rain upstream and the rivers that bring it here ---------- */
const ringsOf = g => g.type === "Polygon" ? [g.coordinates[0]] : g.coordinates.map(p => p[0]);
function pip(x, y, r) { let ins = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const [xi, yi] = r[i], [xj, yj] = r[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) ins = !ins; } return ins; }
function upText() {
  const u = X.up; if (!u) return;
  const tt = xt();
  $("up-t").textContent = tt.upT;
  $("up-sub").textContent = tt.upSub(nf(u.info.catchment_km2), nf(u.pctOut));
  $("up-key").innerHTML = `<span>${tt.upKey}</span>` + RAIN_STEPS.slice(1).map(([b, c]) => `<i style="background:${c}"></i><em>${nf(b)}+</em>`).join("");
  $("up-list").innerHTML = `<li class="avg">${tt.upAvg(nf(u.info.rain_72h_mm ?? 0, 1))}</li>` +
    (u.top.length ? `<li class="h">${tt.upHeavy(nf(u.top.length))}</li>` + u.top.map((b, i) => `<li><span class="n">${nf(i + 1)}</span>${tt.upItem(nf(b.km), tt.dirs[b.dir], nf(b.mm))}</li>`).join("")
      : `<li>${tt.upNone}</li>`);
  $("up-src").innerHTML = `${tt.upSrc} <a href="https://www.ffwc.gov.bd/" target="_blank" rel="noopener">ffwc.gov.bd ↗</a>`;
  if (u.here) u.here.textContent = tt.upHere;
}
async function upstreamMap() {
  const sec = $("upstream");
  const [info, basins, rivers] = await Promise.all([
    fetch(`/api/v1/nodes/${nodeId}/upstream`).then(r => r.ok ? r.json() : null),
    fetch("/api/v1/basins").then(r => r.ok ? r.json() : null),
    fetch("/api/v1/rivers").then(r => r.ok ? r.json() : null),
  ]);
  if (!info || !basins || !info.basins || !info.basins.length || !window.maplibregl || !hasWebGL()) return;
  const ids = new Set(info.basins), mine = basins.features.filter(f => ids.has(f.properties.id));
  if (!mine.length) return;
  let x0 = 180, y0 = 90, x1 = -180, y1 = -90;
  const boxes = mine.map(f => {
    let a = 180, b = 90, c = -180, d = -90;
    ringsOf(f.geometry).forEach(r => r.forEach(([x, y]) => { if (x < a) a = x; if (x > c) c = x; if (y < b) b = y; if (y > d) d = y; }));
    x0 = Math.min(x0, a); y0 = Math.min(y0, b); x1 = Math.max(x1, c); y1 = Math.max(y1, d);
    return { f, a, b, c, d, cx: (a + c) / 2, cy: (b + d) / 2 };
  });
  const sh = X.shape, sr = ringsOf(sh.geometry);
  let hx = 0, hy = 0, hn = 0; sr[0].forEach(([x, y]) => { hx += x; hy += y; hn++; }); hx /= hn; hy /= hn;
  x0 = Math.min(x0, hx); x1 = Math.max(x1, hx); y0 = Math.min(y0, hy); y1 = Math.max(y1, hy);
  // rivers whose middle point lies in the upstream land (or in the upazila itself)
  const inMine = (x, y) => boxes.some(q => x >= q.a && x <= q.c && y >= q.b && y <= q.d && ringsOf(q.f.geometry).some(r => pip(x, y, r))) || sr.some(r => pip(x, y, r));
  const riv = { type: "FeatureCollection", features: (rivers ? rivers.features : []).filter(f => {
    const c = f.geometry.type === "LineString" ? f.geometry.coordinates : f.geometry.coordinates[0], m = c[Math.floor(c.length / 2)];
    return m[0] >= x0 && m[0] <= x1 && m[1] >= y0 && m[1] <= y1 && inMine(m[0], m[1]);
  }) };
  const k = Math.cos(hy * Math.PI / 180);
  const top = boxes.filter(q => (q.f.properties.rain_72h_mm || 0) >= 20).sort((p, q) => q.f.properties.rain_72h_mm - p.f.properties.rain_72h_mm).slice(0, 3).map(q => {
    const dx = (q.cx - hx) * k * 111.32, dy = (q.cy - hy) * 110.57;
    return { lon: q.cx, lat: q.cy, mm: Math.round(q.f.properties.rain_72h_mm), km: Math.round(Math.hypot(dx, dy) / 10) * 10, dir: Math.round(((Math.atan2(dx, dy) * 180 / Math.PI + 360) % 360) / 45) % 8 };
  });
  X.up = { info, top, pctOut: info.catchment_km2 ? Math.round(100 * info.outside_bd_km2 / info.catchment_km2) : 0 };
  sec.hidden = false;
  const step = ["step", ["coalesce", ["get", "rain_72h_mm"], 0], RAIN_STEPS[0][1], ...RAIN_STEPS.slice(1).flatMap(([b, c]) => [b, c])];
  const map = new maplibregl.Map({ container: "up-map", bounds: [[x0, y0], [x1, y1]], fitBoundsOptions: { padding: 30 }, interactive: false,
    attributionControl: { compact: true },
    style: { version: 8, sources: { sat: esri("World_Imagery", "Esri, Maxar, Earthstar Geographics · HydroSHEDS · NOAA GFS"), places: esri("Reference/World_Boundaries_and_Places", "Esri") },
      layers: [{ id: "sat", type: "raster", source: "sat", paint: { "raster-brightness-max": 0.55, "raster-saturation": -0.4 } }] } });
  map.on("load", () => {
    map.addSource("b", { type: "geojson", data: { type: "FeatureCollection", features: mine } });
    map.addLayer({ id: "b-fill", type: "fill", source: "b", paint: { "fill-color": step, "fill-opacity": 0.72 } });
    map.addLayer({ id: "b-line", type: "line", source: "b", paint: { "line-color": "#ffffff", "line-opacity": 0.14, "line-width": 0.6 } });
    map.addSource("r", { type: "geojson", data: riv });
    const w = ["interpolate", ["linear"], ["log10", ["max", ["get", "upland_km2"], 1]], 3.7, 0.8, 6.2, 4.5];
    map.addLayer({ id: "r", type: "line", source: "r", layout: { "line-cap": "round" }, paint: { "line-color": "#1d6fd1", "line-width": w, "line-opacity": 0.9 } });
    map.addLayer({ id: "r-flow", type: "line", source: "r", paint: { "line-color": "#e8f7ff", "line-width": w, "line-dasharray": [0, 4, 3] } });
    map.addLayer({ id: "places", type: "raster", source: "places", paint: { "raster-opacity": 0.85 } });
    map.addSource("u", { type: "geojson", data: sh });
    map.addLayer({ id: "u", type: "line", source: "u", paint: { "line-color": "#ffd34d", "line-width": 2.5 } });
    const el = document.createElement("div"); el.className = "up-here"; el.innerHTML = "<i></i><span></span>";
    X.up.here = el.querySelector("span");
    new maplibregl.Marker({ element: el, anchor: "left", offset: [-9, 0] }).setLngLat([hx, hy]).addTo(map);
    top.forEach((b, i) => { const m = document.createElement("div"); m.className = "up-pin"; m.textContent = nf(i + 1); new maplibregl.Marker({ element: m }).setLngLat([b.lon, b.lat]).addTo(map); });
    upText();
    // water moving downstream: HydroRIVERS lines are drawn from upstream to downstream
    const seq = [[0, 4, 3], [0.5, 4, 2.5], [1, 4, 2], [1.5, 4, 1.5], [2, 4, 1], [2.5, 4, 0.5], [3, 4, 0], [0, 0.5, 3, 3.5], [0, 1, 3, 3], [0, 1.5, 3, 2.5], [0, 2, 3, 2], [0, 2.5, 3, 1.5], [0, 3, 3, 1], [0, 3.5, 3, 0.5]];
    let i = 0, seen = true;
    new IntersectionObserver(es => { seen = es[0].isIntersecting; }).observe(sec);
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) setInterval(() => { if (seen && !document.hidden) { i = (i + 1) % seq.length; map.setPaintProperty("r-flow", "line-dasharray", seq[i]); } }, 90);
  });
  upText();
}

/* ---------- relatively higher land inside the upazila (terrain tiles read in the browser) ---------- */
async function highLand() {
  const sh = X.shape, polys = sh.geometry.type === "Polygon" ? [sh.geometry.coordinates] : sh.geometry.coordinates;
  let x0 = 180, y0 = 90, x1 = -180, y1 = -90;
  polys.forEach(p => p[0].forEach(([x, y]) => { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }));
  const merc = lat => { const s = Math.sin(lat * Math.PI / 180); return 0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI); };
  const unmerc = v => 180 / Math.PI * Math.atan(Math.sinh(Math.PI * (1 - 2 * v)));
  let z = 13, tx0, tx1, ty0, ty1;
  for (; z >= 8; z--) {
    const n = 2 ** z; tx0 = Math.floor((x0 + 180) / 360 * n); tx1 = Math.floor((x1 + 180) / 360 * n); ty0 = Math.floor(merc(y1) * n); ty1 = Math.floor(merc(y0) * n);
    if ((tx1 - tx0 + 1) * (ty1 - ty0 + 1) <= 12) break;
  }
  const n = 2 ** z, nx = tx1 - tx0 + 1, ny = ty1 - ty0 + 1, W = nx * 256, H = ny * 256;
  const c = document.createElement("canvas"), m = document.createElement("canvas"); c.width = m.width = W; c.height = m.height = H;
  const ctx = c.getContext("2d", { willReadFrequently: true }), mx = m.getContext("2d", { willReadFrequently: true });
  await Promise.all(Array.from({ length: nx * ny }, async (_, i) => {
    const tx = tx0 + i % nx, ty = ty0 + Math.floor(i / nx);
    const bmp = await createImageBitmap(await (await fetch(`https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${tx}/${ty}.png`)).blob());
    ctx.drawImage(bmp, (tx - tx0) * 256, (ty - ty0) * 256);
  }));
  const px = lon => ((lon + 180) / 360 * n - tx0) * 256, py = lat => (merc(lat) * n - ty0) * 256;
  mx.beginPath();
  polys.forEach(p => p.forEach(r => { r.forEach(([lo, la], i) => i ? mx.lineTo(px(lo), py(la)) : mx.moveTo(px(lo), py(la))); mx.closePath(); }));
  mx.fill("evenodd");
  const im = ctx.getImageData(0, 0, W, H), d = im.data, k = mx.getImageData(0, 0, W, H).data, hs = [];
  for (let i = 0; i < d.length; i += 4) if (k[i + 3] >= 128) hs.push(d[i] * 256 + d[i + 1] + d[i + 2] / 256 - 32768);
  if (hs.length < 50) throw new Error("too few height cells");
  const sorted = Float32Array.from(hs).sort(), q = f => sorted[Math.min(sorted.length - 1, Math.floor(f * sorted.length))];
  const lo = q(0.05), hi = q(0.85), spread = q(0.95) - lo;
  if (spread < 3) return { flat: true, spread };
  const out = ctx.createImageData(W, H), o = out.data;
  for (let i = 0; i < d.length; i += 4) {
    if (k[i + 3] < 128) continue;
    const h = d[i] * 256 + d[i + 1] + d[i + 2] / 256 - 32768;
    if (h >= hi) { o[i] = 255; o[i + 1] = 214; o[i + 2] = 10; o[i + 3] = 175; }
  }
  ctx.putImageData(out, 0, 0);
  const w = tx0 / n * 360 - 180, e = (tx1 + 1) / n * 360 - 180, nn = unmerc(ty0 / n), s = unmerc((ty1 + 1) / n);
  return { url: c.toDataURL("image/png"), coords: [[w, nn], [e, nn], [e, s], [w, s]], hi, lo };
}
function highText() {
  const btn = $("bHigh"), note = $("high-note"), tt = xt(), r = X.high;
  btn.textContent = tt.highBtn;
  if (!r || !btn.classList.contains("on")) { note.hidden = true; return; }
  note.hidden = false;
  note.innerHTML = r === "wait" ? tt.highWait : r === "fail" ? tt.highFail
    : (r.flat ? tt.highFlat(nf(r.spread, 1)) : tt.highSay(nf(r.hi, r.hi < 20 ? 1 : 0), nf(r.lo, r.lo < 20 ? 1 : 0))) + " " + tt.highNote;
}
function highButton() {
  const btn = $("bHigh");
  btn.hidden = false; highText();
  btn.onclick = async () => {
    const onNow = btn.classList.toggle("on");
    if (MAP.getLayer("high")) MAP.setLayoutProperty("high", "visibility", onNow ? "visible" : "none");
    if (onNow && !X.high) {
      X.high = "wait"; highText();
      try {
        const r = await highLand(); X.high = r;
        if (!r.flat) {
          MAP.addSource("high", { type: "image", url: r.url, coordinates: r.coords });
          MAP.addLayer({ id: "high", type: "raster", source: "high", paint: { "raster-opacity": 0.75, "raster-fade-duration": 300 },
            layout: { visibility: btn.classList.contains("on") ? "visible" : "none" } }, MAP.getLayer("osm-road-casing") ? "osm-road-casing" : undefined);
        }
      } catch (e) { X.high = "fail"; }
    }
    highText();
  };
}

/* ---------- start, and follow the language switch ---------- */
(async () => {
  for (let i = 0; i < 120 && !(nodeId && R); i++) await new Promise(r => setTimeout(r, 250));
  if (!nodeId || !R) return;
  const base = render;
  render = function () { base(); drawRose(); upText(); highText(); };
  X.shape = await fetch(`/api/v1/nodes/${nodeId}/shape`).then(r => r.ok ? r.json() : null).catch(() => null);
  fetch(`/api/v1/nodes/${nodeId}/cyclone-directions`).then(r => r.ok ? r.json() : null).then(j => { X.rose = j; drawRose(); }).catch(() => {});
  if (!X.shape) return;
  upstreamMap().catch(e => console.warn("upstream map", e));
  for (let i = 0; i < 120 && !(MAP && MAP.loaded()); i++) await new Promise(r => setTimeout(r, 250));
  if (MAP) highButton();
})();
