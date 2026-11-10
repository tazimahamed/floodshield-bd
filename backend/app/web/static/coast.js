/* FloodShield BD — the coast: ports and places, live sea waves and wind, moving swell on the Bay of Bengal.
   Sea and wind numbers come straight from Open-Meteo (marine model + NOAA GFS). Port danger signals are BMD's,
   so this file never shows a signal number or a "safe" verdict; it links to BMD instead. */
const COAST_T = {
  en: {
    port: "Seaport", forest: "Mangrove forest", beach: "Sea beach", bay: "Bay of Bengal", island: "Island", wetland: "Haor (wetland)",
    swamp: "Swamp forest", dam: "Lake and dam", barrage: "Barrage", bridge: "Bridge", meet: "Where rivers meet",
    rainNow: "Rain now", rainNone: "No rain", mmh: "mm/h",
    waveNow: "Waves now", waveMax: "Highest wave, next 3 days", windNow: "Wind now", gust: "Gusts up to",
    m: "m", kmh: "km/h", from: d => `from the ${d}`, period: s => `a wave every ${s} s`,
    bayLine: (h, d) => `Waves ${h} m ${d}`,
    src: "Sea just off this place, from the Open-Meteo marine model and the NOAA GFS forecast. Not an official warning.",
    srcLand: "Weather right now at this place, from Open-Meteo. Not an official warning.",
    signals: "Port danger signals are issued only by the Bangladesh Meteorological Department:",
    openUpz: "Open this upazila", noSea: "No sea forecast for this spot right now.",
    dirs: ["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"],
  },
  bn: {
    port: "সমুদ্রবন্দর", forest: "ম্যানগ্রোভ বন", beach: "সমুদ্রসৈকত", bay: "বঙ্গোপসাগর", island: "দ্বীপ", wetland: "হাওর",
    swamp: "জলাবন", dam: "হ্রদ ও বাঁধ", barrage: "ব্যারাজ", bridge: "সেতু", meet: "নদীর মিলনস্থল",
    rainNow: "এখন বৃষ্টি", rainNone: "বৃষ্টি নেই", mmh: "মিমি/ঘণ্টা",
    waveNow: "এখন ঢেউ", waveMax: "আগামী ৩ দিনে সবচেয়ে উঁচু ঢেউ", windNow: "এখন বাতাস", gust: "দমকা হাওয়া",
    m: "মিটার", kmh: "কিমি/ঘণ্টা", from: d => `${d} দিক থেকে`, period: s => `প্রতি ${s} সেকেন্ডে একটি ঢেউ`,
    bayLine: (h, d) => `ঢেউ ${h} মিটার, ${d}`,
    src: "এই জায়গার কাছের সাগরের তথ্য, Open-Meteo marine মডেল ও NOAA GFS পূর্বাভাস থেকে। এটি সরকারি সতর্কবার্তা নয়।",
    srcLand: "এই জায়গার এখনকার আবহাওয়া, Open-Meteo থেকে। এটি সরকারি সতর্কবার্তা নয়।",
    signals: "বন্দরের বিপদ সংকেত দেয় শুধু বাংলাদেশ আবহাওয়া অধিদপ্তর:",
    openUpz: "এই উপজেলা দেখুন", noSea: "এই জায়গার জন্য এখন সাগরের পূর্বাভাস নেই।",
    dirs: ["উত্তর", "উত্তর-পূর্ব", "পূর্ব", "দক্ষিণ-পূর্ব", "দক্ষিণ", "দক্ষিণ-পশ্চিম", "পশ্চিম", "উত্তর-পশ্চিম"],
  },
};
const ct = () => COAST_T[lang];
const compass = deg => ct().dirs[Math.round(((deg % 360) + 360) % 360 / 45) % 8];

// "sea" is a point just offshore: the marine model has no values on land or up a river
const PLACES = [
  { kind: "port", lat: 22.305, lon: 91.80, sea: [22.18, 91.72],
    name: { en: "Chattogram Port", bn: "চট্টগ্রাম বন্দর" },
    fact: { en: "Bangladesh's main seaport, on the Karnaphuli River.", bn: "বাংলাদেশের প্রধান সমুদ্রবন্দর, কর্ণফুলী নদীর তীরে।" } },
  { kind: "port", lat: 22.47, lon: 89.60, sea: [21.75, 89.50],
    name: { en: "Mongla Port", bn: "মোংলা বন্দর" },
    fact: { en: "The second seaport, on the Pasur River beside the Sundarbans.", bn: "দ্বিতীয় সমুদ্রবন্দর, সুন্দরবনের পাশে পশুর নদীর তীরে।" } },
  { kind: "port", lat: 21.99, lon: 90.29, sea: [21.75, 90.30],
    name: { en: "Payra Port", bn: "পায়রা বন্দর" },
    fact: { en: "The newest seaport, in Patuakhali on the Rabnabad channel.", bn: "সবচেয়ে নতুন সমুদ্রবন্দর, পটুয়াখালীর রাবনাবাদ চ্যানেলে।" } },
  { kind: "forest", lat: 21.95, lon: 89.25, sea: [21.65, 89.20], left: true,
    name: { en: "Sundarbans", bn: "সুন্দরবন" },
    fact: { en: "The world's largest mangrove forest, a UNESCO World Heritage Site. Its trees break the force of cyclone surges.",
            bn: "পৃথিবীর সবচেয়ে বড় ম্যানগ্রোভ বন, ইউনেস্কো বিশ্ব ঐতিহ্য। এর গাছ ঘূর্ণিঝড়ের জলোচ্ছ্বাসের ধাক্কা কমায়।" } },
  { kind: "beach", lat: 21.43, lon: 91.97, sea: [21.40, 91.88],
    name: { en: "Cox's Bazar", bn: "কক্সবাজার" },
    fact: { en: "A sea beach about 120 km long.", bn: "প্রায় ১২০ কিমি লম্বা সমুদ্রসৈকত।" } },
  { kind: "beach", lat: 21.815, lon: 90.12, sea: [21.72, 90.12], below: true,
    name: { en: "Kuakata", bn: "কুয়াকাটা" },
    fact: { en: "A beach in Patuakhali where both sunrise and sunset can be seen over the sea.", bn: "পটুয়াখালীর সৈকত, যেখান থেকে সাগরে সূর্যোদয় ও সূর্যাস্ত দুটোই দেখা যায়।" } },
  { kind: "island", lat: 20.627, lon: 92.323, sea: [20.60, 92.28],
    name: { en: "St Martin's Island", bn: "সেন্টমার্টিন দ্বীপ" },
    fact: { en: "Bangladesh's only coral island.", bn: "বাংলাদেশের একমাত্র প্রবাল দ্বীপ।" } },
  { kind: "dam", lat: 22.60, lon: 92.20,
    name: { en: "Kaptai Lake", bn: "কাপ্তাই হ্রদ" },
    fact: { en: "Bangladesh's largest man-made lake, formed by the Kaptai Dam on the Karnaphuli in 1962.", bn: "বাংলাদেশের সবচেয়ে বড় কৃত্রিম হ্রদ, ১৯৬২ সালে কর্ণফুলী নদীতে কাপ্তাই বাঁধ দিয়ে তৈরি।" } },
  { kind: "barrage", lat: 26.175, lon: 89.05,
    name: { en: "Teesta Barrage", bn: "তিস্তা ব্যারাজ" },
    fact: { en: "Irrigation barrage on the Teesta River at Dalia, Lalmonirhat.", bn: "লালমনিরহাটের ডালিয়ায় তিস্তা নদীর উপর সেচ ব্যারাজ।" } },
  { kind: "wetland", lat: 25.14, lon: 91.07,
    name: { en: "Tanguar Haor", bn: "টাঙ্গুয়ার হাওর" },
    fact: { en: "A large haor in Sunamganj and a Ramsar wetland. It fills with water every monsoon.", bn: "সুনামগঞ্জের বড় হাওর, রামসার জলাভূমি। প্রতি বর্ষায় পানিতে ভরে যায়।" } },
  { kind: "bridge", lat: 23.44, lon: 90.265,
    name: { en: "Padma Bridge", bn: "পদ্মা সেতু" },
    fact: { en: "Road and rail bridge over the Padma, opened in 2022.", bn: "পদ্মা নদীর উপর সড়ক ও রেল সেতু, চালু হয় ২০২২ সালে।" } },
  { kind: "island", lat: 22.69, lon: 90.65, tier: 2,
    name: { en: "Bhola", bn: "ভোলা" },
    fact: { en: "Bangladesh's largest island, in the Meghna estuary.", bn: "বাংলাদেশের সবচেয়ে বড় দ্বীপ, মেঘনার মোহনায়।" } },
  { kind: "island", lat: 22.33, lon: 91.10, sea: [22.05, 91.10], tier: 2,
    name: { en: "Hatiya", bn: "হাতিয়া" },
    fact: { en: "An island at the mouth of the Meghna, open to cyclone storm surges.", bn: "মেঘনার মোহনার দ্বীপ, ঘূর্ণিঝড়ের জলোচ্ছ্বাসের মুখে।" } },
  { kind: "island", lat: 22.48, lon: 91.45, sea: [22.30, 91.50], tier: 2,
    name: { en: "Sandwip", bn: "সন্দ্বীপ" },
    fact: { en: "An island in the Bay of Bengal near Chattogram.", bn: "চট্টগ্রামের কাছে বঙ্গোপসাগরের দ্বীপ।" } },
  { kind: "wetland", lat: 24.66, lon: 92.05, tier: 2,
    name: { en: "Hakaluki Haor", bn: "হাকালুকি হাওর" },
    fact: { en: "One of Bangladesh's largest haors, in Moulvibazar and Sylhet.", bn: "মৌলভীবাজার ও সিলেটে, দেশের সবচেয়ে বড় হাওরগুলোর একটি।" } },
  { kind: "swamp", lat: 25.01, lon: 91.93, tier: 2,
    name: { en: "Ratargul", bn: "রাতারগুল" },
    fact: { en: "A freshwater swamp forest in Sylhet that stands in water in the rainy season.", bn: "সিলেটের মিঠাপানির জলাবন, বর্ষায় গাছগুলো পানিতে দাঁড়িয়ে থাকে।" } },
  { kind: "bridge", lat: 24.395, lon: 89.78, tier: 2,
    name: { en: "Jamuna Bridge", bn: "যমুনা সেতু" },
    fact: { en: "Bridge over the Jamuna, opened in 1998.", bn: "যমুনা নদীর উপর সেতু, চালু হয় ১৯৯৮ সালে।" } },
  { kind: "bridge", lat: 24.066, lon: 89.028, tier: 2,
    name: { en: "Hardinge Bridge", bn: "হার্ডিঞ্জ ব্রিজ" },
    fact: { en: "Railway bridge over the Padma at Paksey, opened in 1915.", bn: "পাকশীতে পদ্মার উপর রেল সেতু, চালু হয় ১৯১৫ সালে।" } },
  { kind: "meet", lat: 23.23, lon: 90.64, tier: 2,
    name: { en: "Chandpur", bn: "চাঁদপুর" },
    fact: { en: "Where the Padma meets the Meghna.", bn: "এখানে পদ্মা মেঘনার সাথে মিলেছে।" } },
  { kind: "meet", lat: 23.77, lon: 89.76, tier: 2,
    name: { en: "Goalundo", bn: "গোয়ালন্দ" },
    fact: { en: "Near here the Jamuna joins the Padma.", bn: "এর কাছে যমুনা পদ্মার সাথে মিলেছে।" } },
];
const BAY = [19.7, 89.9];  // label and sample point out in the bay
// rough water outline of the northern Bay of Bengal (lon, lat), only used to keep the moving swell off land
const SEA = [[86.9, 21.45], [87.8, 21.5], [88.6, 21.5], [89.2, 21.58], [89.9, 21.7], [90.6, 21.8], [91.1, 22.0],
  [91.5, 21.9], [91.75, 21.4], [91.9, 21.05], [92.1, 20.7], [92.35, 20.5], [92.9, 19.95], [93.5, 19.3], [93.9, 18.5],
  [94.2, 17.4], [94.25, 16.2], [93.6, 15.0], [85.8, 15.0], [84.5, 16.6], [84.4, 18.0], [85.4, 19.3], [86.5, 20.2], [86.9, 21.45]];

const ICONS = {
  port: '<path d="M12 3v15M8 7h8M5 13a7 7 0 0 0 14 0"/><circle cx="12" cy="4.5" r="1.5"/>',
  forest: '<path d="M12 21v-5M7 16h10l-5-12z"/><path d="M8.5 11h7"/>',
  beach: '<path d="M4 20c2-1.5 4-1.5 6 0s4 1.5 6 0 3-1 4-.5"/><path d="M12 17V8M5 9a7 7 0 0 1 14 0z"/>',
  island: '<path d="M3 18c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0"/><path d="M7 15c1-3 4-5 5-5s4 2 5 5"/><path d="M12 10V5l3 2"/>',
  wetland: '<path d="M3 17c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0M3 21c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0"/><path d="M8 14V6M12 14V4M16 14V7"/>',
  swamp: '<path d="M3 20c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0"/><path d="M12 18v-6M8 12h8l-4-8z"/>',
  dam: '<path d="M4 6h16M5 6l2 14h10l2-14"/><path d="M9 11c1 .8 2 .8 3 0s2-.8 3 0"/>',
  barrage: '<path d="M3 8h18M5 8v10M10 8v10M14 8v10M19 8v10"/><path d="M3 20c2-1 4-1 6 0s4 1 6 0 4-1 6 0"/>',
  bridge: '<path d="M2 16h20M4 16v4M20 16v4"/><path d="M4 16c3-7 13-7 16 0"/><path d="M8 16v-4M12 16v-5M16 16v-4"/>',
  meet: '<path d="M5 3c0 6 7 7 7 12v6M19 3c0 6-7 7-7 12"/>',
};
const svgIcon = k => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[k]}</svg>`;

let coastLayer = null, coastSea = null, coastWind = null, bayMarker = null;
map.createPane("coast").style.zIndex = 660;

function insidePoly(lon, lat, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > lat) !== (yj > lat) && lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function upazilaAt(lat, lon) {
  if (!data) return null;
  for (const f of data.features) {
    const g = f.geometry, polys = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
    if (polys.some(p => insidePoly(lon, lat, p[0]))) return f.properties;
  }
  return null;
}

function placePopup(i) {
  const tt = ct(), p = PLACES[i], s = coastSea?.[i], w = coastWind?.[i];
  const row = (k, v) => `<div><small>${k}</small><b>${v}</b></div>`;
  let grid = "";
  if (s && s.current && s.current.wave_height != null) {
    grid += row(tt.waveNow, `${nf(s.current.wave_height, 1)} ${tt.m}`) +
      row(tt.waveMax, `${nf(Math.max(...s.daily.wave_height_max.filter(v => v != null)), 1)} ${tt.m}`);
  }
  if (w && w.current && w.current.precipitation != null) {
    const r = w.current.precipitation * 3600 / (w.current.interval || 900);
    grid += row(tt.rainNow, r >= 0.05 ? `${nf(r, 1)} ${tt.mmh}` : tt.rainNone);
  }
  if (w && w.current) {
    grid += row(tt.windNow, `${nf(Math.round(w.current.wind_speed_10m))} ${tt.kmh} <span>${tt.from(compass(w.current.wind_direction_10m))}</span>`) +
      row(tt.gust, `${nf(Math.round(w.current.wind_gusts_10m))} ${tt.kmh}`);
  }
  const upz = upazilaAt(p.lat, p.lon);
  return `<div class="cm-pop"><div class="cm-head"><span class="cm-ico ${p.kind}">${svgIcon(p.kind)}</span>
      <div><b>${p.name[lang]}</b><small>${tt[p.kind]}</small></div></div>
    <p>${p.fact[lang]}</p>
    ${grid ? `<div class="cm-grid">${grid}</div>` : `<p class="cm-src">${coastWind ? tt.noSea : t().loading}</p>`}
    <p class="cm-src">${p.sea ? tt.src : tt.srcLand}</p>
    ${p.kind === "port" || p.sea ? `<p class="cm-src">${tt.signals} <a href="https://www.bmd.gov.bd" target="_blank" rel="noopener">bmd.gov.bd</a></p>` : ""}
    ${upz ? `<button class="btn small cm-open" data-id="${upz.id}">${tt.openUpz}: ${upz.name}</button>` : ""}</div>`;
}

function bayHtml() {
  const tt = ct(), s = coastSea?.[PLACES.length];
  const line = s && s.current && s.current.wave_height != null
    ? `<small>${tt.bayLine(nf(s.current.wave_height, 1), tt.from(compass(s.current.wave_direction)))}</small>` : "";
  return `<div class="bay-label"><b>${tt.bay}</b>${line}</div>`;
}

function drawCoast() {
  coastLayer = L.layerGroup();
  PLACES.forEach((p, i) => {
    const icon = L.divIcon({ className: `cm-wrap${p.tier === 2 ? " t2" : ""}`, iconSize: [34, 34], iconAnchor: [17, 17],
      html: `<div aria-label="${p.name.en}" class="cm ${p.kind}${p.left ? " lbl-l" : ""}${p.below ? " lbl-b" : ""}"><span class="ring"></span><span class="dot">${svgIcon(p.kind)}</span><span class="lbl">${p.name[lang]}</span></div>` });
    const m = L.marker([p.lat, p.lon], { icon, pane: "coast", keyboard: true, riseOnHover: true });
    // before the popup opens: leave room for the details drawer on the right when it is open
    m.on("click", () => { const pp = m.getPopup(); if (pp) pp.options.autoPanPaddingBottomRight = [document.body.classList.contains("drawer-open") ? 450 : 70, 40]; });
    // keep the popup clear of the search panel (top-left) and the tool rail (right)
    m.bindPopup(() => placePopup(i), { maxWidth: 290, className: "cm-popup",
        autoPanPaddingTopLeft: innerWidth > 760 ? [390, 20] : [10, 250], autoPanPaddingBottomRight: [70, 40] });
    m.on("popupopen", e => {
      const b = e.popup.getElement().querySelector(".cm-open");
      if (b) b.onclick = () => { map.closePopup(); select(b.dataset.id, true); };
    });
    m.placeIndex = i;
    coastLayer.addLayer(m);
  });
  bayMarker = L.marker(BAY, { pane: "coast", interactive: false, keyboard: false,
    icon: L.divIcon({ className: "bay-wrap", iconSize: [200, 40], iconAnchor: [100, 20], html: bayHtml() }) });
  coastLayer.addLayer(bayMarker);
  coastLayer.addTo(map);
}
function relabelCoast() {
  if (!coastLayer) return;
  coastLayer.eachLayer(m => {
    if (m === bayMarker) { m.setIcon(L.divIcon({ className: "bay-wrap", iconSize: [200, 40], iconAnchor: [100, 20], html: bayHtml() })); return; }
    const el = m.getElement()?.querySelector(".lbl");
    if (el) el.textContent = PLACES[m.placeIndex].name[lang];
    if (m.isPopupOpen()) m.setPopupContent(placePopup(m.placeIndex));
  });
}

async function loadSea() {
  // waves only for places on the sea (plus the bay label); rain and wind for every place
  const seaIdx = PLACES.map((p, i) => p.sea ? i : -1).filter(i => i >= 0);
  const seaPts = [...seaIdx.map(i => PLACES[i].sea), BAY], allPts = [...PLACES.map(p => p.sea || [p.lat, p.lon]), BAY];
  const qs = pts => `latitude=${pts.map(p => p[0]).join(",")}&longitude=${pts.map(p => p[1]).join(",")}&forecast_days=3&timezone=Asia%2FDhaka`;
  const get = url => fetch(url).then(r => r.ok ? r.json() : null).then(j => j && (Array.isArray(j) ? j : [j])).catch(() => null);
  const [sea, wx] = await Promise.all([
    get(`https://marine-api.open-meteo.com/v1/marine?${qs(seaPts)}&current=wave_height,wave_direction,wave_period&daily=wave_height_max`),
    get(`https://api.open-meteo.com/v1/forecast?${qs(allPts)}&current=precipitation,wind_speed_10m,wind_direction_10m,wind_gusts_10m&wind_speed_unit=kmh`),
  ]);
  coastSea = Array(PLACES.length + 1).fill(null);
  if (sea) { seaIdx.forEach((pi, k) => { coastSea[pi] = sea[k]; }); coastSea[PLACES.length] = sea[seaIdx.length]; }
  coastWind = wx;
  relabelCoast();
  swell.update();
}

/* moving swell: short crests drifting the way the waves travel, only over the sea */
const swell = (() => {
  const cv = document.createElement("canvas"); cv.className = "swell"; cv.setAttribute("aria-hidden", "true");
  map.getContainer().appendChild(cv);
  const ctx = cv.getContext("2d");
  const lons = SEA.map(p => p[0]), lats = SEA.map(p => p[1]);
  const box = [Math.min(...lons), Math.min(...lats), Math.max(...lons), Math.max(...lats)];
  let crests = [], dir = 180, height = 0.8, period = 8, on = true, moving = false, W = 0, H = 0, last = 0;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const spot = () => {
    for (let k = 0; k < 40; k++) {
      const lon = box[0] + Math.random() * (box[2] - box[0]), lat = box[1] + Math.random() * (box[3] - box[1]);
      if (insidePoly(lon, lat, SEA)) return { lon, lat };
    }
    return { lon: 89.9, lat: 19.7 };
  };
  // tiny glints of light on the water (sun or moon on wave faces), drifting with the swell
  const seed = () => { crests = Array.from({ length: 180 }, () => ({ ...spot(), life: Math.random(), r: 0.5 + Math.random() * 0.8, sp: 0.6 + Math.random() * 0.8 })); };
  const size = () => {
    const d = Math.min(2, devicePixelRatio || 1); W = map.getContainer().clientWidth; H = map.getContainer().clientHeight;
    cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0);
  };
  let phase = 0;
  function frame(ts) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (ts - last) / 1000 || 0); last = ts;
    if (!on || moving || document.hidden) return;
    ctx.clearRect(0, 0, W, H);
    const toward = (dir + 180) * Math.PI / 180, ux = Math.sin(toward), uy = -Math.cos(toward);  // screen: y grows down
    const t = ts / 1000, hgt = Math.min(height, 3);
    // swell: long, gently wavering lines across the travel direction, moving at a pace set by the real wave period
    const gap = 20, pace = reduce ? 0 : 5 + period * 1.1;  // pixels per second
    phase = (phase + pace * dt) % gap;
    ctx.save();
    ctx.beginPath();
    SEA.forEach(([lon, lat], i) => { const q = map.latLngToContainerPoint([lat, lon]); i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y); });
    ctx.closePath(); ctx.clip();
    const cx = W / 2, cy = H / 2, diag = Math.hypot(W, H) / 2 + gap, n = Math.ceil(diag / gap);
    const amp = 2.4 + hgt * 1.6, light = 0.1 + hgt * 0.05;
    ctx.lineWidth = 1.3;
    for (let k = -n; k <= n; k++) {
      const off = k * gap + phase, ox = cx + ux * off, oy = cy + uy * off;
      ctx.beginPath();
      for (let s = -diag; s <= diag; s += 18) {
        // sum of two sines along the line keeps the crests irregular, like real swell seen from far above
        const w = amp * (Math.sin(s * 0.021 + k * 1.7 + t * 0.5) * 0.7 + Math.sin(s * 0.047 - k * 0.9 + t * 0.8) * 0.3);
        const x = ox - uy * s + ux * w, y = oy + ux * s + uy * w;
        s === -diag ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      const fade = 0.55 + 0.45 * Math.sin(k * 2.3 + t * 0.3);
      ctx.strokeStyle = `rgba(200,232,255,${(light * fade).toFixed(3)})`;
      ctx.stroke();
    }
    ctx.restore();
    const pxPerDeg = 256 * Math.pow(2, map.getZoom()) / 360;
    for (const c of crests) {
      if (!reduce) { const m = pace * c.sp * dt / pxPerDeg; c.lon += ux * m; c.lat -= uy * m; c.life += dt * 0.35; }
      if (c.life > 1 || !insidePoly(c.lon, c.lat, SEA)) Object.assign(c, spot(), { life: 0 });
      const q = map.latLngToContainerPoint([c.lat, c.lon]);
      if (q.x < -5 || q.y < -5 || q.x > W + 5 || q.y > H + 5) continue;
      const a = Math.pow(Math.sin(c.life * Math.PI), 3) * (0.25 + hgt * 0.1);
      ctx.fillStyle = `rgba(235,248,255,${a.toFixed(2)})`;
      ctx.beginPath(); ctx.arc(q.x, q.y, c.r, 0, 6.283); ctx.fill();
    }
  }
  map.on("zoomstart", () => { moving = true; ctx.clearRect(0, 0, W, H); });
  map.on("zoomend", () => { moving = false; });
  new ResizeObserver(size).observe(map.getContainer());
  size(); seed(); requestAnimationFrame(frame);
  return {
    update() {
      const s = coastSea?.[PLACES.length];
      if (s && s.current && s.current.wave_height != null) { dir = s.current.wave_direction; height = s.current.wave_height; period = s.current.wave_period || 8; }
    },
    show(v) { on = v; cv.hidden = !v; },
  };
})();

function toggleCoast() {
  const v = $("show-coast").checked;
  if (v) coastLayer.addTo(map); else coastLayer.remove();
  swell.show(v);
}

drawCoast();
loadSea();
const coastZoom = () => map.getContainer().classList.toggle("coast-far", map.getZoom() < 7.5);
map.on("zoomend", coastZoom); coastZoom();
$("show-coast").onchange = toggleCoast;
const _applyLangBase = applyLang;
applyLang = function () { _applyLangBase(); relabelCoast(); };
