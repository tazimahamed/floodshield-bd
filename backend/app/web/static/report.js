/* FloodShield BD — upazila flood report */
const T = {
  en: {
    subtitle: "Upazila flood report", back: "← Back to map", print: "Print / PDF", eyebrow: "Upazila flood report",
    official: "Official warnings come first: follow FFWC (ffwc.gov.bd), BMD and your Upazila Disaster Management Committee. FloodShield supports them and does not replace them.",
    area: "Upazila area", catchment: "Area draining here", outside: "of that area is outside Bangladesh",
    floodRate: "Monsoon periods with flooding", worst: "Worst flood seen",
    now: "Now (next 15 days)", riskOf: { low: "Low risk", medium: "Medium risk", high: "High risk" }, chance: "chance of flooding",
    insightTitle: "What the record shows",
    lead: s => `In <b>${s.flooded_windows} of ${s.windows}</b> monsoon periods (15 days each) since 2017 — <b>${s.flood_rate_pct}%</b> — at least ${s.thr}% of this upazila was under <b>abnormal flood water</b>, as seen by the Sentinel-1 radar satellite.`,
    rainBefore: "Rain here in the 15 days before", rainUp: "Rain upstream in the 15 days before",
    whenFlood: "before floods", whenNot: "before normal periods", lowest: "Smallest rain still followed by a flood",
    worstLine: w => `Worst: <b>${w.start} → ${w.end}</b> — ${w.flooded_pct}% of the upazila (${w.flooded_km2} km²) under abnormal water, after <b>${w.rain_local_15d_before} mm</b> in 15 days here and <b>${w.rain_up_15d_before} mm</b> upstream.`,
    noHistory: "No satellite periods have been mapped for this upazila.",
    timelineTitle: "Flooding in every monsoon period, 2017–2025",
    timelineNote: "Each bar is one 15-day period: the share of the upazila under abnormal flood water. Red = flood (≥5%).",
    scatterTitle: "How much rain led to flooding?",
    scatterNote: "Each dot is one period: rain in the 15 days before it (→) and the share that flooded (↑). Red = flood; big dots = named floods.",
    whatIfTitle: "If this upazila floods", whatIfSub: "OpenStreetMap · modelled ripple effects",
    facilities: "Facilities in the upazila", roads: "Major road under water", power: "May lose power",
    powerSub: "Upazilas fed by a substation here", health: "May lose hospital access",
    healthSub: "Every hospital within 25 km is here", none: "None", assumptions: "Assumptions behind these numbers",
    tableTitle: "Every mapped period", onlyFloods: "Floods only",
    cols: ["Period", "Event", "Flood?", "Abnormal water", "All water", "Rain 7 d before", "Rain 15 d before",
           "Upstream 15 d before", "Rain during", "Upstream during"],
    yes: "Flood", no: "No",
    monsoonTitle: "Monsoon rain (Jun–Sep) each year", here: "This upazila", upstreamKey: "Upstream area",
    wettestTitle: "Wettest days since 2017",
    methodTitle: "Method & sources",
    method: "Flood extent: Sentinel-1 radar, change detection against the dry season and against the same period in other years (UN-SPIDER method), so normal monsoon water such as haors is not counted. Rain: ERA5-Land daily reanalysis, area-averaged over the upazila and over every basin that drains into it (HydroBASINS). Radar sees water extent, not depth, and a satellite pass every 12 days can miss short floods.",
    kinds: { hospital: "Hospitals", clinic: "Clinics", school: "Schools", college: "Colleges", shelter: "Shelters",
             substation: "Substations", power_plant: "Power plants" },
    mm: "mm", notFound: "Upazila not found",
  },
  bn: {
    subtitle: "উপজেলা বন্যা রিপোর্ট", back: "← ম্যাপে ফিরুন", print: "প্রিন্ট / PDF", eyebrow: "উপজেলা বন্যা রিপোর্ট",
    official: "সরকারি সতর্কবার্তা আগে: FFWC (ffwc.gov.bd), আবহাওয়া অধিদপ্তর ও উপজেলা দুর্যোগ ব্যবস্থাপনা কমিটির নির্দেশনা মেনে চলুন। FloodShield এগুলোর সহায়ক, বিকল্প নয়।",
    area: "উপজেলার আয়তন", catchment: "যত এলাকার পানি এখানে আসে", outside: "ওই এলাকার যতটা বাংলাদেশের বাইরে",
    floodRate: "বন্যা হওয়া বর্ষার সময়কাল", worst: "সবচেয়ে বড় বন্যা",
    now: "এখন (আগামী ১৫ দিন)", riskOf: { low: "নিম্ন ঝুঁকি", medium: "মাঝারি ঝুঁকি", high: "উচ্চ ঝুঁকি" }, chance: "বন্যার সম্ভাবনা",
    insightTitle: "অতীতের রেকর্ড যা বলে",
    lead: s => `২০১৭ থেকে বর্ষার <b>${s.windows}টি</b> ১৫-দিনের সময়কালের মধ্যে <b>${s.flooded_windows}টিতে</b> (<b>${s.flood_rate_pct}%</b>) এই উপজেলার অন্তত ${s.thr}% এলাকা Sentinel-1 রাডার স্যাটেলাইটে <b>অস্বাভাবিক বন্যার পানির</b> নিচে দেখা গেছে।`,
    rainBefore: "আগের ১৫ দিনে এখানে বৃষ্টি", rainUp: "আগের ১৫ দিনে উজানে বৃষ্টি",
    whenFlood: "বন্যার আগে", whenNot: "স্বাভাবিক সময়ের আগে", lowest: "সবচেয়ে কম যে বৃষ্টির পরেও বন্যা হয়েছে",
    worstLine: w => `সবচেয়ে বড়: <b>${w.start} → ${w.end}</b> — উপজেলার ${w.flooded_pct}% (${w.flooded_km2} km²) অস্বাভাবিক পানির নিচে; আগের ১৫ দিনে এখানে <b>${w.rain_local_15d_before} মিমি</b> ও উজানে <b>${w.rain_up_15d_before} মিমি</b> বৃষ্টি।`,
    noHistory: "এই উপজেলার জন্য কোনো স্যাটেলাইট সময়কাল ম্যাপ করা হয়নি।",
    timelineTitle: "প্রতিটি বর্ষার সময়কালে বন্যা, ২০১৭–২০২৫",
    timelineNote: "প্রতিটি দণ্ড একটি ১৫-দিনের সময়কাল: উপজেলার কত অংশ অস্বাভাবিক বন্যার পানির নিচে। লাল = বন্যা (≥৫%)।",
    scatterTitle: "কত বৃষ্টিতে বন্যা হয়েছে?",
    scatterNote: "প্রতিটি বিন্দু একটি সময়কাল: আগের ১৫ দিনের বৃষ্টি (→) ও প্লাবিত অংশ (↑)। লাল = বন্যা; বড় বিন্দু = বড় বন্যা।",
    whatIfTitle: "এই উপজেলা ডুবলে", whatIfSub: "OpenStreetMap · আনুমানিক প্রভাব",
    facilities: "উপজেলার স্থাপনা", roads: "প্রধান সড়ক পানির নিচে", power: "বিদ্যুৎ যেতে পারে",
    powerSub: "এখানকার সাবস্টেশন থেকে বিদ্যুৎ পায় এমন উপজেলা", health: "হাসপাতাল-সুবিধা হারাতে পারে",
    healthSub: "২৫ কিমির মধ্যে সব হাসপাতাল এখানে", none: "নেই", assumptions: "এই হিসাবের অনুমানগুলো",
    tableTitle: "ম্যাপ করা সব সময়কাল", onlyFloods: "শুধু বন্যা",
    cols: ["সময়কাল", "ঘটনা", "বন্যা?", "অস্বাভাবিক পানি", "মোট পানি", "আগের ৭ দিন বৃষ্টি", "আগের ১৫ দিন বৃষ্টি",
           "উজানে আগের ১৫ দিন", "চলাকালীন বৃষ্টি", "উজানে চলাকালীন"],
    yes: "বন্যা", no: "না",
    monsoonTitle: "প্রতি বছর বর্ষার (জুন–সেপ্টেম্বর) বৃষ্টি", here: "এই উপজেলা", upstreamKey: "উজানের এলাকা",
    wettestTitle: "২০১৭ থেকে সবচেয়ে বেশি বৃষ্টির দিন",
    methodTitle: "পদ্ধতি ও উৎস",
    method: "বন্যার বিস্তার: Sentinel-1 রাডার; শুকনো মৌসুম ও অন্য বছরের একই সময়ের সাথে তুলনা (UN-SPIDER পদ্ধতি), তাই হাওরের মতো স্বাভাবিক বর্ষার পানি গোনা হয় না। বৃষ্টি: ERA5-Land দৈনিক তথ্য, উপজেলা ও তার উজানের সব অববাহিকার গড় (HydroBASINS)। রাডার পানির বিস্তার দেখে, গভীরতা নয়; ১২ দিনে একবার ছবি তোলায় স্বল্পস্থায়ী বন্যা বাদ পড়তে পারে।",
    kinds: { hospital: "হাসপাতাল", clinic: "ক্লিনিক", school: "স্কুল", college: "কলেজ", shelter: "আশ্রয়কেন্দ্র",
             substation: "সাবস্টেশন", power_plant: "বিদ্যুৎকেন্দ্র" },
    mm: "মিমি", notFound: "উপজেলা পাওয়া যায়নি",
  },
};
const KIND_COLORS = { hospital: "#d4382a", clinic: "#e45f9b", school: "#2f7fc1", college: "#7462c4",
                      shelter: "#2e9e5b", substation: "#e08a00", power_plant: "#8a5a2b" };
let lang = "en", R = null;
try { lang = localStorage.getItem("fs-lang") || "en"; } catch (e) {}
const $ = id => document.getElementById(id);
const id = location.pathname.split("/").pop();
const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const nf = (v, d = 0) => v == null ? "–" : Number(v).toLocaleString(lang === "bn" ? "bn-BD" : "en-GB", { maximumFractionDigits: d });

function canvas(elId) {
  const c = $(elId), ctx = c.getContext("2d"), H = +c.getAttribute("height");
  c.width = c.clientWidth * devicePixelRatio; c.height = H * devicePixelRatio;
  ctx.scale(devicePixelRatio, devicePixelRatio);
  ctx.font = "11px Inter, sans-serif";
  return [ctx, c.clientWidth, H];
}

function axisY(ctx, w, H, padL, padB, max, fmt) {
  ctx.strokeStyle = css("--line"); ctx.fillStyle = css("--muted");
  [0, 0.5, 1].forEach(k => {
    const y = H - padB - k * (H - padB - 10);
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w, y); ctx.stroke();
    ctx.fillText(fmt(max * k), 0, y + 4);
  });
}

function drawTimeline(h) {
  const [ctx, w, H] = canvas("timeline"), padL = 34, padB = 18;
  const max = Math.max(10, ...h.map(r => r.flooded_pct));
  axisY(ctx, w, H, padL, padB, max, v => `${Math.round(v)}%`);
  const bw = (w - padL) / h.length;
  h.forEach((r, i) => {
    const bh = (r.flooded_pct / max) * (H - padB - 10);
    ctx.fillStyle = r.flooded ? css("--high") : "#a9b4be";
    ctx.fillRect(padL + i * bw + 0.5, H - padB - bh, Math.max(1, bw - 1.5), bh);
    if (i === 0 || r.start.slice(0, 4) !== h[i - 1].start.slice(0, 4)) {
      ctx.fillStyle = css("--muted"); ctx.fillText(r.start.slice(0, 4), padL + i * bw, H - 4);
    }
  });
}

function drawScatter(h) {
  const [ctx, w, H] = canvas("scatter"), padL = 34, padB = 22;
  const pts = h.filter(r => r.rain_local_15d_before != null);
  const mx = Math.max(100, ...pts.map(r => r.rain_local_15d_before)), my = Math.max(10, ...pts.map(r => r.flooded_pct));
  axisY(ctx, w, H, padL, padB, my, v => `${Math.round(v)}%`);
  ctx.fillStyle = css("--muted");
  [0, 0.5, 1].forEach(k => ctx.fillText(`${Math.round(mx * k)}${k === 1 ? " " + T[lang].mm : ""}`, padL + k * (w - padL - 44), H - 6));
  const ty = H - padB - (R.flood_threshold_pct / my) * (H - padB - 10);
  ctx.strokeStyle = css("--high"); ctx.setLineDash([4, 4]);
  ctx.beginPath(); ctx.moveTo(padL, ty); ctx.lineTo(w, ty); ctx.stroke(); ctx.setLineDash([]);
  pts.forEach(r => {
    ctx.fillStyle = r.flooded ? css("--high") : "#a9b4be";
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.arc(padL + (r.rain_local_15d_before / mx) * (w - padL - 30), H - padB - (r.flooded_pct / my) * (H - padB - 10),
            r.named_event ? 6.5 : 4, 0, 7);
    ctx.fill();
    ctx.globalAlpha = 1;
  });
}

function drawMonsoon(m) {
  const [ctx, w, H] = canvas("monsoon"), padL = 40, padB = 18;
  const max = Math.max(1, ...m.flatMap(r => [r.local_mm || 0, r.upstream_mm || 0]));
  axisY(ctx, w, H, padL, padB, max, v => `${Math.round(v)}`);
  const gw = (w - padL) / m.length;
  m.forEach((r, i) => {
    [[r.local_mm, "#1b5f9e", 0], [r.upstream_mm, "#86bde0", 1]].forEach(([v, col, k]) => {
      const bh = ((v || 0) / max) * (H - padB - 10), bw = Math.max(2, gw / 2 - 4);
      ctx.fillStyle = col; ctx.fillRect(padL + i * gw + 3 + k * (bw + 1), H - padB - bh, bw, bh);
    });
    ctx.fillStyle = css("--muted"); ctx.fillText(`'${String(r.year).slice(2)}`, padL + i * gw + 4, H - 4);
  });
}

function renderTable() {
  const t = T[lang], f = v => v == null ? "–" : nf(v, 1);
  const rows = [...R.history].reverse().filter(r => !$("only-floods").checked || r.flooded);
  $("table").innerHTML = `<thead><tr>${t.cols.map(c => `<th>${c}</th>`).join("")}</tr></thead><tbody>` +
    rows.map(r => `<tr class="${r.named_event ? "named" : ""}">
      <td>${r.start} → ${r.end.slice(5)}</td><td>${r.named_event ? r.name : ""}</td>
      <td><span class="pill ${r.flooded ? "yes" : "no"}">${r.flooded ? t.yes : t.no}</span></td>
      <td>${nf(r.flooded_pct, 1)}%</td><td>${nf(r.all_water_pct, 1)}%</td>
      <td>${f(r.rain_local_7d_before)}</td><td>${f(r.rain_local_15d_before)}</td><td>${f(r.rain_up_15d_before)}</td>
      <td>${f(r.rain_local_during)}</td><td>${f(r.rain_up_during)}</td></tr>`).join("") + "</tbody>";
}

function render() {
  const t = T[lang], n = R.node, s = R.summary, c = R.current;
  document.documentElement.lang = lang;
  document.body.classList.toggle("bn", lang === "bn");
  document.querySelectorAll("[data-i18n]").forEach(el => el.textContent = t[el.dataset.i18n]);
  $("lang").textContent = lang === "en" ? "বাংলা" : "English";
  document.title = `${n.name} — ${t.subtitle} · FloodShield BD`;
  $("title").textContent = n.name;
  $("where").textContent = [n.district, n.division].filter(Boolean).join(" · ");
  $("now").innerHTML = c ? `<div class="risk-card ${c.risk}"><span class="lvl">${t.riskOf[c.risk]}</span>
    <div class="prob">${nf(c.flood_prob * 100)}% <small>${t.chance}</small></div>
    <p>${t.now}: ${c.reference_day} → ${c.valid_until}</p></div>` : "";

  $("kpis").innerHTML = `
    <div><b>${nf(n.km2)} km²</b><small>${t.area}</small></div>
    <div><b>${nf(n.catchment_km2)} km²</b><small>${t.catchment}</small></div>
    <div><b>${nf(n.outside_bd_pct)}%</b><small>${t.outside}</small></div>
    ${s ? `<div class="alert"><b>${nf(s.flooded_windows)} / ${nf(s.windows)}</b><small>${t.floodRate}</small></div>` : ""}
    ${s && s.worst ? `<div class="alert"><b>${nf(s.worst.flooded_pct, 1)}%</b><small>${t.worst} · ${s.worst.start.slice(0, 7)}</small></div>` : ""}`;

  if (s) {
    const lr = s.median_rain_local_15d_before, ur = s.median_rain_up_15d_before;
    $("insight").innerHTML = `<p class="big">${t.lead({ ...s, thr: R.flood_threshold_pct })}</p>
      <div class="callouts">
        <div><span class="muted small">${t.rainBefore}</span><b>${nf(lr.flooded)} ${t.mm}</b><span class="vs">${t.whenFlood} · ${nf(lr.not_flooded)} ${t.mm} ${t.whenNot}</span></div>
        <div><span class="muted small">${t.rainUp}</span><b>${nf(ur.flooded)} ${t.mm}</b><span class="vs">${t.whenFlood} · ${nf(ur.not_flooded)} ${t.mm} ${t.whenNot}</span></div>
        <div><span class="muted small">${t.lowest}</span><b>${nf(s.lowest_rain_local_15d_before_a_flood)} ${t.mm}</b></div>
      </div>${s.worst ? `<p>${t.worstLine(s.worst)}</p>` : ""}`;
  } else $("insight").innerHTML = `<p>${t.noHistory}</p>`;

  const rp = R.ripple, road = Object.values(rp.road_km).reduce((a, b) => a + b, 0);
  const list = rows => rows.length ? rows.map(u => `${u.name} <span class="muted">(${u.district})</span>`).join(", ") : t.none;
  $("whatif").innerHTML = `
    <div class="chips">${Object.entries(R.facilities).sort((a, b) => b[1] - a[1]).map(([k, v]) =>
      `<span><i style="background:${KIND_COLORS[k]}"></i>${nf(v)} ${t.kinds[k] ?? k}</span>`).join("") || `<span>${t.none}</span>`}</div>
    <div class="impact">
      <div><h3>${t.roads}</h3><b class="big">${nf(road, 1)} km</b></div>
      <div><h3>${t.power}</h3><b class="big">${nf(rp.power_ripple.length)}</b><span class="small muted">${t.powerSub}</span><br>${list(rp.power_ripple)}</div>
      <div><h3>${t.health}</h3><b class="big">${nf(rp.health_ripple.length)}</b><span class="small muted">${t.healthSub}</span><br>${list(rp.health_ripple)}</div>
    </div>
    <details class="more"><summary>${t.assumptions}</summary>${rp.assumptions.join("<br>")}</details>`;

  renderTable();
  $("wettest").innerHTML = R.wettest_days.map(d => `<li><span class="nm">${d.day}</span><span class="val">${nf(d.mm, 1)} ${t.mm}</span></li>`).join("");
  $("sources").innerHTML = R.sources.join(" · ");
  if (R.history.length) { drawTimeline(R.history); drawScatter(R.history); }
  drawMonsoon(R.monsoon_rain);
}

$("lang").onclick = () => {
  lang = lang === "en" ? "bn" : "en";
  try { localStorage.setItem("fs-lang", lang); } catch (e) {}
  render();
};
$("print").onclick = () => window.print();
$("only-floods").onchange = () => R && renderTable();
let resizeTimer;
window.addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => R && render(), 150); });

(async () => {
  document.querySelectorAll("[data-i18n]").forEach(el => el.textContent = T[lang][el.dataset.i18n]);
  const res = await fetch(`/api/v1/nodes/${id}/report`);
  if (!res.ok) { $("title").textContent = T[lang].notFound; return; }
  R = await res.json();
  render();
})();
