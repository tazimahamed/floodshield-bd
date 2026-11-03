const T = {
  en: {
    official: "Official warnings first: follow FFWC (ffwc.gov.bd) and BMD bulletins and your Upazila Disaster Management Committee. FloodShield supports, and does not replace, official warnings.",
    back: "← Map", area: "Area", catchment: "Area draining here", outside: "of it outside Bangladesh",
    floodRate: "Monsoon windows with flooding", worst: "Worst flood seen",
    insightTitle: "What the record shows",
    insight: s => `<p class="big">In <b>${s.flooded_windows} of ${s.windows}</b> monsoon 15-day windows since 2017 (<b>${s.flood_rate_pct}%</b>), at least ${s.thr}% of this upazila had <b>abnormal flood water</b> on Sentinel-1 radar.</p>
      <p>Before those floods, the 15 days of rain here had a median of <b>${s.lf ?? "–"} mm</b> (vs ${s.ln ?? "–"} mm before windows without flooding), and upstream <b>${s.uf ?? "–"} mm</b> (vs ${s.un ?? "–"} mm).</p>
      <p>The smallest 15-day rain that was still followed by a flood here: <b>${s.low ?? "–"} mm</b>.</p>`,
    worstLine: w => `<p>Worst: <b>${w.start} → ${w.end}</b>, ${w.flooded_pct}% of the upazila (${w.flooded_km2} km²) under abnormal water, after ${w.rain_local_15d_before} mm in 15 days here and ${w.rain_up_15d_before} mm upstream.</p>`,
    noHistory: "No Sentinel-1 windows have been mapped for this upazila.",
    timelineTitle: "Flooding in every monsoon window (2017–2025)",
    timelineNote: "Bar = share of the upazila with abnormal flood water in that 15-day window. Red = flood (≥5%).",
    scatterTitle: "How much rain led to flooding?",
    scatterNote: "Each dot is one 15-day window: rain in the 15 days before it (x) and the share that flooded (y). Red = flood.",
    whatIfTitle: "If this upazila floods",
    roads: "km of major road under water", power: "Upazilas fed by a substation here (may lose power)",
    health: "Upazilas whose every hospital within 25 km is here", none: "none", assumptions: "Assumptions",
    facilities: "Facilities here (OpenStreetMap)",
    tableTitle: "Every mapped window", cols: ["Window", "Event", "Flooded", "Abnormal water", "All water",
      "Rain 7 d before", "Rain 15 d before", "Upstream 15 d before", "Rain during", "Upstream during"],
    yes: "flood", no: "no",
    monsoonTitle: "Monsoon rain (Jun–Sep) each year", monsoonNote: "Dark = this upazila, light = its upstream catchment (ERA5-Land).",
    wettestTitle: "Wettest days on record (2017–2026)", sourcesTitle: "Sources",
    kinds: { hospital: "hospitals", clinic: "clinics", school: "schools", college: "colleges", shelter: "shelters",
             substation: "substations", power_plant: "power plants" },
    mm: "mm",
  },
  bn: {
    official: "সরকারি সতর্কবার্তা আগে: FFWC (ffwc.gov.bd) ও BMD-এর বুলেটিন এবং উপজেলা দুর্যোগ ব্যবস্থাপনা কমিটির নির্দেশনা মেনে চলুন। FloodShield সরকারি সতর্কবার্তার সহায়ক, বিকল্প নয়।",
    back: "← ম্যাপ", area: "আয়তন", catchment: "যত এলাকার পানি এখানে আসে", outside: "এর মধ্যে বাংলাদেশের বাইরে",
    floodRate: "বন্যা হয়েছে এমন বর্ষার সময়কাল", worst: "সবচেয়ে বড় বন্যা",
    insightTitle: "অতীতের রেকর্ড যা বলে",
    insight: s => `<p class="big">২০১৭ থেকে বর্ষার <b>${s.windows}টি</b> ১৫-দিনের সময়কালের মধ্যে <b>${s.flooded_windows}টিতে</b> (<b>${s.flood_rate_pct}%</b>) এই উপজেলার অন্তত ${s.thr}% এলাকায় Sentinel-1 রাডারে <b>অস্বাভাবিক বন্যার পানি</b> দেখা গেছে।</p>
      <p>সেই বন্যাগুলোর আগের ১৫ দিনে এখানে বৃষ্টির মধ্যমা ছিল <b>${s.lf ?? "–"} মিমি</b> (বন্যা না হওয়া সময়ে ${s.ln ?? "–"} মিমি), আর উজানে <b>${s.uf ?? "–"} মিমি</b> (বনাম ${s.un ?? "–"} মিমি)।</p>
      <p>সবচেয়ে কম যে ১৫-দিনের বৃষ্টির পরেও এখানে বন্যা হয়েছে: <b>${s.low ?? "–"} মিমি</b>।</p>`,
    worstLine: w => `<p>সবচেয়ে বড়: <b>${w.start} → ${w.end}</b>, উপজেলার ${w.flooded_pct}% (${w.flooded_km2} km²) অস্বাভাবিক পানির নিচে; আগের ১৫ দিনে এখানে ${w.rain_local_15d_before} মিমি ও উজানে ${w.rain_up_15d_before} মিমি বৃষ্টি।</p>`,
    noHistory: "এই উপজেলার জন্য কোনো Sentinel-1 সময়কাল ম্যাপ করা হয়নি।",
    timelineTitle: "প্রতিটি বর্ষার সময়কালে বন্যা (২০১৭–২০২৫)",
    timelineNote: "দণ্ড = ওই ১৫ দিনে উপজেলার কত অংশে অস্বাভাবিক বন্যার পানি। লাল = বন্যা (≥৫%)।",
    scatterTitle: "কত বৃষ্টিতে বন্যা হয়েছে?",
    scatterNote: "প্রতিটি বিন্দু একটি ১৫-দিনের সময়কাল: আগের ১৫ দিনের বৃষ্টি (x) ও প্লাবিত অংশ (y)। লাল = বন্যা।",
    whatIfTitle: "এই উপজেলা ডুবলে",
    roads: "কিমি প্রধান সড়ক পানির নিচে", power: "এখানকার সাবস্টেশন থেকে বিদ্যুৎ পায় এমন উপজেলা (বিদ্যুৎ যেতে পারে)",
    health: "যেসব উপজেলার ২৫ কিমির মধ্যে সব হাসপাতাল এখানে", none: "নেই", assumptions: "অনুমান",
    facilities: "এখানকার স্থাপনা (OpenStreetMap)",
    tableTitle: "ম্যাপ করা সব সময়কাল", cols: ["সময়কাল", "ঘটনা", "বন্যা", "অস্বাভাবিক পানি", "মোট পানি",
      "আগের ৭ দিন বৃষ্টি", "আগের ১৫ দিন বৃষ্টি", "উজানে আগের ১৫ দিন", "চলাকালীন বৃষ্টি", "উজানে চলাকালীন"],
    yes: "বন্যা", no: "না",
    monsoonTitle: "প্রতি বছর বর্ষার (জুন–সেপ্টেম্বর) বৃষ্টি", monsoonNote: "গাঢ় = এই উপজেলা, হালকা = উজানের অববাহিকা (ERA5-Land)।",
    wettestTitle: "রেকর্ডে সবচেয়ে বেশি বৃষ্টির দিন (২০১৭–২০২৬)", sourcesTitle: "উৎস",
    kinds: { hospital: "হাসপাতাল", clinic: "ক্লিনিক", school: "স্কুল", college: "কলেজ", shelter: "আশ্রয়কেন্দ্র",
             substation: "সাবস্টেশন", power_plant: "বিদ্যুৎকেন্দ্র" },
    mm: "মিমি",
  },
};
let lang = "en", R = null;
try { lang = localStorage.getItem("fs-lang") || "en"; } catch (e) {}
const id = location.pathname.split("/").pop();
const css = n => getComputedStyle(document.body).getPropertyValue(n).trim();

function canvas(elId) {
  const c = document.getElementById(elId), ctx = c.getContext("2d");
  const H = +c.getAttribute("height");
  c.width = c.clientWidth * devicePixelRatio; c.height = H * devicePixelRatio;
  ctx.scale(devicePixelRatio, devicePixelRatio);
  ctx.font = "11px Inter, sans-serif";
  return [ctx, c.clientWidth, H];
}

function drawTimeline(h) {
  const [ctx, w, H] = canvas("timeline"), pad = 30, max = Math.max(10, ...h.map(r => r.flooded_pct));
  const bw = (w - pad) / h.length;
  ctx.fillStyle = css("--muted");
  [0, max / 2, max].forEach(v => ctx.fillText(`${Math.round(v)}%`, 0, H - 18 - (v / max) * (H - 34) + 4));
  h.forEach((r, i) => {
    const bh = (r.flooded_pct / max) * (H - 34);
    ctx.fillStyle = r.flooded ? "#d7301f" : "#9aa5ae";
    ctx.fillRect(pad + i * bw, H - 18 - bh, Math.max(1, bw - 1), bh);
    if (i === 0 || r.start.slice(0, 4) !== h[i - 1].start.slice(0, 4)) {
      ctx.fillStyle = css("--muted"); ctx.fillText(r.start.slice(0, 4), pad + i * bw, H - 4);
    }
  });
}

function drawScatter(h) {
  const [ctx, w, H] = canvas("scatter"), pad = 40;
  const pts = h.filter(r => r.rain_local_15d_before != null);
  const mx = Math.max(100, ...pts.map(r => r.rain_local_15d_before)), my = Math.max(10, ...pts.map(r => r.flooded_pct));
  ctx.strokeStyle = css("--line"); ctx.beginPath(); ctx.moveTo(pad, 6); ctx.lineTo(pad, H - 24); ctx.lineTo(w - 6, H - 24); ctx.stroke();
  ctx.fillStyle = css("--muted");
  ctx.fillText(`${Math.round(my)}%`, 4, 14); ctx.fillText("0", pad - 10, H - 24);
  ctx.fillText(`${Math.round(mx)} ${T[lang].mm}`, w - 60, H - 8);
  const ty = H - 24 - (R.flood_threshold_pct / my) * (H - 30);
  ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(pad, ty); ctx.lineTo(w - 6, ty); ctx.stroke(); ctx.setLineDash([]);
  pts.forEach(r => {
    ctx.fillStyle = r.flooded ? "#d7301f" : "#9aa5ae";
    ctx.beginPath();
    ctx.arc(pad + (r.rain_local_15d_before / mx) * (w - pad - 10), H - 24 - (r.flooded_pct / my) * (H - 30), r.named_event ? 6 : 4, 0, 7);
    ctx.fill();
  });
}

function drawMonsoon(m) {
  const [ctx, w, H] = canvas("monsoon"), max = Math.max(1, ...m.flatMap(r => [r.local_mm || 0, r.upstream_mm || 0]));
  const gw = w / m.length;
  m.forEach((r, i) => {
    [[r.local_mm, "#1b5f9e", 0], [r.upstream_mm, "#86c3e0", 1]].forEach(([v, col, k]) => {
      const bh = ((v || 0) / max) * (H - 30);
      ctx.fillStyle = col; ctx.fillRect(i * gw + 4 + k * (gw / 2 - 4), H - 18 - bh, gw / 2 - 6, bh);
    });
    ctx.fillStyle = css("--muted"); ctx.fillText(String(r.year), i * gw + 4, H - 4);
  });
}

function render() {
  const t = T[lang], n = R.node, s = R.summary;
  document.documentElement.lang = lang;
  document.body.classList.toggle("bn", lang === "bn");
  document.querySelectorAll("[data-i18n]").forEach(el => el.textContent = t[el.dataset.i18n]);
  document.getElementById("lang").textContent = lang === "en" ? "বাংলা" : "English";
  document.title = `${n.name} · FloodShield BD`;
  document.getElementById("title").textContent = n.name;
  document.getElementById("where").textContent = [n.district, n.division].filter(Boolean).join(", ");
  const num = v => Number(v).toLocaleString(lang === "bn" ? "bn-BD" : "en-GB");
  document.getElementById("kpis").innerHTML = `
    <div><b>${num(n.km2)} km²</b><small>${t.area}</small></div>
    <div><b>${num(n.catchment_km2)} km²</b><small>${t.catchment}</small></div>
    <div><b>${n.outside_bd_pct}%</b><small>${t.outside}</small></div>
    ${s ? `<div class="red"><b>${s.flooded_windows}/${s.windows}</b><small>${t.floodRate}</small></div>` : ""}
    ${s && s.worst ? `<div class="red"><b>${s.worst.flooded_pct}%</b><small>${t.worst} (${s.worst.start.slice(0, 7)})</small></div>` : ""}`;
  document.getElementById("insight").innerHTML = s ? t.insight({
    ...s, thr: R.flood_threshold_pct, lf: s.median_rain_local_15d_before.flooded, ln: s.median_rain_local_15d_before.not_flooded,
    uf: s.median_rain_up_15d_before.flooded, un: s.median_rain_up_15d_before.not_flooded,
    low: s.lowest_rain_local_15d_before_a_flood }) + (s.worst ? t.worstLine(s.worst) : "") : `<p>${t.noHistory}</p>`;

  const rp = R.ripple, road = Object.values(rp.road_km).reduce((a, b) => a + b, 0);
  const list = rows => rows.length ? rows.map(u => `${u.name} <span class="muted">(${u.district})</span>`).join(", ") : t.none;
  document.getElementById("whatif").innerHTML = `
    <div class="chips">${Object.entries(R.facilities).map(([k, v]) => `<span>${v} ${t.kinds[k] ?? k}</span>`).join("")}</div>
    <p><b>${road.toFixed(1)}</b> ${t.roads}</p>
    <p><b>${t.power}:</b> ${list(rp.power_ripple)}</p>
    <p><b>${t.health}:</b> ${list(rp.health_ripple)}</p>
    <details class="small muted"><summary>${t.assumptions}</summary>${rp.assumptions.join("<br>")}</details>`;

  const h = R.history, f = v => v == null ? "–" : v;
  document.getElementById("table").innerHTML = `<tr>${t.cols.map(c => `<th>${c}</th>`).join("")}</tr>` +
    [...h].reverse().map(r => `<tr class="${r.flooded ? "flood" : ""} ${r.named_event ? "named" : ""}">
      <td>${r.start} → ${r.end.slice(5)}</td><td>${r.named_event ? r.name : ""}</td>
      <td><span class="pill ${r.flooded ? "yes" : "no"}">${r.flooded ? t.yes : t.no}</span></td>
      <td>${r.flooded_pct}%</td><td>${r.all_water_pct}%</td>
      <td>${f(r.rain_local_7d_before)}</td><td>${f(r.rain_local_15d_before)}</td><td>${f(r.rain_up_15d_before)}</td>
      <td>${f(r.rain_local_during)}</td><td>${f(r.rain_up_during)}</td></tr>`).join("");
  document.getElementById("wettest").innerHTML = R.wettest_days.map(d => `<li>${d.day}: <b>${d.mm} ${t.mm}</b></li>`).join("");
  document.getElementById("sources").innerHTML = R.sources.join("<br>");
  if (h.length) { drawTimeline(h); drawScatter(h); }
  drawMonsoon(R.monsoon_rain);
}

document.getElementById("lang").onclick = () => {
  lang = lang === "en" ? "bn" : "en";
  try { localStorage.setItem("fs-lang", lang); } catch (e) {}
  render();
};
window.addEventListener("resize", () => R && render());

(async () => {
  const res = await fetch(`/api/v1/nodes/${id}/report`);
  if (!res.ok) { document.getElementById("title").textContent = "Upazila not found"; return; }
  R = await res.json();
  render();
})();
