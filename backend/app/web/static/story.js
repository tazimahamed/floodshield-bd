/* FloodShield BD — a 22-second story: a village, heavy rain, the river rises, a FloodShield alert reaches the
   family's phone, they pack and walk along the raised road to the shelter with the children, the elder and the
   animals, and arrive safe before the water. Plain SVG driven by one timeline, so it needs no library; it pauses
   when off screen and shows the safe ending still when the reader prefers less motion. */
(function () {
  const host = document.getElementById("story");
  if (!host) return;
  const bn = () => (document.documentElement.lang || "bn") === "bn";
  const TXT = {
    bn: { cap: ["একটি সাধারণ দিন", "আকাশ কালো, প্রবল বৃষ্টি", "নদীর পানি বাড়ছে", "ফোনে FloodShield-এর সতর্কবার্তা", "দরকারি জিনিস গুছিয়ে নেওয়া", "উঁচু রাস্তা ধরে আশ্রয়কেন্দ্রে", "সবাই নিরাপদে পৌঁছেছে"],
      alertT: "বন্যার ঝুঁকি বেশি", alertB: "আশ্রয়কেন্দ্রে যান", alertS: "ইউনিয়ন অফিসের নির্দেশনা মানুন", shelter: "আশ্রয়কেন্দ্র",
      tag: "আগাম সতর্কতা, সময়মতো প্রস্তুতি, নিরাপদ জীবন।", sub: "বন্যার আগে সতর্কতা, বিপদের আগে সুরক্ষা", replay: "↻ আবার দেখুন" },
    en: { cap: ["An ordinary day", "Dark skies, heavy rain", "The river is rising", "A FloodShield alert on the phone", "Packing what matters", "Along the raised road to the shelter", "Everyone arrives safe"],
      alertT: "High flood risk", alertB: "Go to the shelter", alertS: "Follow your union office", shelter: "Shelter",
      tag: "Early warning, timely preparation, safe lives.", sub: "Warned before the flood, safe before the danger", replay: "↻ Watch again" },
  };
  const t = () => TXT[bn() ? "bn" : "en"];

  // people and animals, drawn facing right; feet at y=0. Legs (lg1/lg2) and arms (ar1/ar2) swing when walking.
  const SKIN = "#b9825b";
  const person = (o) => `<g class="ps">
      <g class="legs"><rect class="lg1" x="-5" y="-26" width="4.5" height="26" rx="2" fill="${SKIN}"/><rect class="lg2" x="0.5" y="-26" width="4.5" height="26" rx="2" fill="${SKIN}"/>
        <rect class="lg1" x="-6" y="-3" width="7" height="3" rx="1.5" fill="#3f2a1d"/><rect class="lg2" x="0" y="-3" width="7" height="3" rx="1.5" fill="#3f2a1d"/></g>
      ${o.lower || ""}
      <rect class="ar1" x="-9" y="-46" width="4" height="19" rx="2" fill="${o.sleeve || SKIN}"/>
      <path d="M-9 -47 Q0 -51 9 -47 L10 -${o.long ? 14 : 24} L-10 -${o.long ? 14 : 24} Z" fill="${o.top}"/>
      ${o.trim || ""}
      <rect x="-2.5" y="-51" width="5" height="5" fill="${SKIN}"/>
      <ellipse cx="0" cy="-58" rx="7" ry="8" fill="${SKIN}"/><circle cx="-6" cy="-58" r="2" fill="${SKIN}"/>
      ${o.hair || `<path d="M-7 -61 Q0 -69 7 -61 L7 -63 Q0 -68 -7 -63Z" fill="#1f1611"/>`}
      <circle cx="3.5" cy="-59" r="1.2" fill="#1f1611"/>
      <path class="mouth" d="M1 -53 Q3.5 -51.5 5 -53" stroke="#5b3a29" stroke-width="1.3" fill="none"/>
      ${o.face || ""}
      <g class="load" opacity="0">${o.load || ""}</g>
      ${o.front ? o.front : `<rect class="ar2" x="5" y="-46" width="4" height="19" rx="2" fill="${o.sleeve || SKIN}"/><circle class="ar2" cx="7" cy="-26" r="2.4" fill="${SKIN}"/>`}
      ${o.extra || ""}
    </g>`;
  const lungi = `<path d="M-9 -26 L9 -26 L10 -9 L-10 -9 Z" fill="#166534"/><path d="M-9 -20 L9 -20 M-9 -14 L10 -14 M-3 -26 L-4 -9 M3 -26 L4 -9" stroke="#22c55e" stroke-width="1"/>`;
  const sari = `<path d="M-10 -28 L10 -28 L12 -3 L-12 -3 Z" fill="#db2777"/><path d="M-12 -6 L12 -6" stroke="#fde68a" stroke-width="2"/>`;
  const sariTop = `<path d="M-9 -47 L6 -47 L-6 -26" stroke="#fde68a" stroke-width="3" fill="none"/>`;
  const momHair = `<path d="M-8 -64 Q0 -71 8 -63 L9 -48 Q2 -44 -9 -50 Z" fill="#db2777" opacity=".9"/><path d="M-6 -62 Q0 -67 6 -62 L6 -60 Q0 -63 -6 -60Z" fill="#1f1611"/>`;
  const elderHair = `<rect x="-7" y="-67" width="14" height="6" rx="2.5" fill="#f8fafc" stroke="#cbd5e1" stroke-width=".8"/>`;
  const beard = `<path d="M-2 -54 Q4 -45 7 -54 Q5 -49 2 -48 Q-1 -49 -2 -54Z" fill="#e2e8f0"/>`;
  const frock = `<path d="M-8 -40 L8 -40 L11 -20 L-11 -20 Z" fill="#f59e0b"/>`;
  const babyArms = `<path d="M-6 -42 Q4 -34 10 -40" stroke="${SKIN}" stroke-width="4" fill="none" stroke-linecap="round"/><g><rect x="2" y="-46" width="13" height="10" rx="5" fill="#fbcfe8"/><circle cx="13" cy="-48" r="4.5" fill="#c6926a"/><path d="M10 -51 Q13 -54 16 -51" stroke="#1f1611" stroke-width="1.6" fill="none"/></g>`;
  const bundle = `<path d="M-12 -68 Q0 -80 12 -68 L11 -64 L-11 -64 Z" fill="#d97706" stroke="#92400e"/><path d="M-6 -73 L6 -66 M6 -73 L-6 -66" stroke="#92400e"/><path d="M5 -45 L9 -58 L7 -66" stroke="${SKIN}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  const sack = `<rect x="-14" y="-46" width="10" height="16" rx="4" fill="#a16207"/><path d="M-11 -46 L-6 -50" stroke="#713f12" stroke-width="2"/>`;
  const stick = `<path d="M9 -30 L14 0" stroke="#78350f" stroke-width="2.6" stroke-linecap="round"/><path d="M5 -46 L9 -31" stroke="#f1f5f9" stroke-width="4" stroke-linecap="round"/><circle cx="9" cy="-30" r="2.3" fill="${SKIN}"/>`;
  const cow = `<g class="ani">
      <path d="M-26 -28 Q-28 -40 -12 -40 L14 -40 Q24 -40 24 -30 L24 -18 Q24 -12 16 -12 L-20 -12 Q-27 -12 -26 -20 Z" fill="#f5f5f4" stroke="#57534e" stroke-width="1.2"/>
      <path d="M-14 -38 Q-6 -34 -10 -26 Q-16 -30 -14 -38Z M4 -40 Q12 -36 8 -28 Q2 -32 4 -40Z" fill="#57534e"/>
      <path d="M-26 -30 Q-34 -24 -31 -14" stroke="#57534e" stroke-width="2" fill="none"/><circle cx="-31" cy="-13" r="2" fill="#57534e"/>
      <path d="M-4 -12 Q0 -7 4 -12" fill="#fda4af"/>
      <g class="legs"><rect class="lg1" x="-21" y="-14" width="5" height="14" rx="1.5" fill="#e7e5e4" stroke="#57534e" stroke-width=".8"/><rect class="lg2" x="-13" y="-14" width="5" height="14" rx="1.5" fill="#e7e5e4" stroke="#57534e" stroke-width=".8"/><rect class="lg1" x="10" y="-14" width="5" height="14" rx="1.5" fill="#e7e5e4" stroke="#57534e" stroke-width=".8"/><rect class="lg2" x="17" y="-14" width="5" height="14" rx="1.5" fill="#e7e5e4" stroke="#57534e" stroke-width=".8"/></g>
      <path d="M20 -38 Q24 -48 34 -46 L40 -36 Q42 -30 36 -28 L28 -28 Q22 -30 20 -38Z" fill="#f5f5f4" stroke="#57534e" stroke-width="1.2"/>
      <ellipse cx="38" cy="-31" rx="4.5" ry="3.5" fill="#fda4af"/><circle cx="31" cy="-39" r="1.3" fill="#1f1611"/>
      <path d="M26 -45 Q22 -52 26 -54 M32 -46 Q34 -53 38 -53" stroke="#a8a29e" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M24 -42 L17 -44 L22 -39Z" fill="#e7e5e4" stroke="#57534e" stroke-width=".8"/></g>`;
  const goat = `<g class="ani">
      <path d="M-15 -18 Q-16 -27 -6 -27 L8 -27 Q15 -27 15 -20 L15 -14 Q15 -10 9 -10 L-11 -10 Q-16 -10 -15 -15Z" fill="#d6d3d1" stroke="#57534e" stroke-width="1"/>
      <path d="M-15 -22 L-20 -27" stroke="#57534e" stroke-width="2" stroke-linecap="round"/>
      <g class="legs"><rect class="lg1" x="-12" y="-11" width="3.4" height="11" fill="#78716c"/><rect class="lg2" x="-6" y="-11" width="3.4" height="11" fill="#78716c"/><rect class="lg1" x="7" y="-11" width="3.4" height="11" fill="#78716c"/><rect class="lg2" x="12" y="-11" width="3.4" height="11" fill="#78716c"/></g>
      <path d="M12 -26 Q14 -35 22 -33 L26 -26 Q26 -21 21 -21 L16 -21 Q12 -22 12 -26Z" fill="#d6d3d1" stroke="#57534e" stroke-width="1"/>
      <path d="M22 -21 L21 -15 L19 -21Z" fill="#78716c"/><circle cx="20" cy="-29" r="1.1" fill="#1f1611"/>
      <path d="M16 -32 Q12 -40 8 -37" stroke="#78716c" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M14 -29 L9 -27 L13 -25Z" fill="#a8a29e"/></g>`;

  host.innerHTML = `<svg viewBox="0 0 800 380" role="img" aria-label="A village family warned by FloodShield BD walks to a shelter before the flood">
    <defs><linearGradient id="skyDay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7dd3fc"/><stop offset="1" stop-color="#e0f2fe"/></linearGradient>
      <linearGradient id="skyStorm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#334155"/><stop offset="1" stop-color="#64748b"/></linearGradient>
      <linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#38bdf8"/><stop offset="1" stop-color="#0369a1"/></linearGradient>
      <clipPath id="frame"><rect width="800" height="380" rx="18"/></clipPath></defs>
    <g clip-path="url(#frame)">
      <rect width="800" height="380" fill="url(#skyDay)"/><rect id="storm" width="800" height="380" fill="url(#skyStorm)" opacity="0"/>
      <g id="sun"><circle cx="680" cy="70" r="30" fill="#fde047"/><circle cx="680" cy="70" r="44" fill="#fde047" opacity=".25"/></g>
      <path d="M0 230 L120 170 L220 210 L330 160 L460 215 L800 200 L800 380 L0 380Z" fill="#65a30d" opacity=".55"/>
      <rect y="232" width="800" height="148" fill="#4d7c0f"/>
      <g id="farm"><path d="M341 278 q-2 -8 -4 -10 M341 278 q0 -10 1 -12 M341 278 q2 -8 5 -9" stroke="#65a30d" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M84 264 q-2 -7 -4 -9 M84 264 q0 -9 1 -11 M84 264 q2 -7 5 -8" stroke="#65a30d" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M529 294 q-2 -5 -4 -7 M529 294 q0 -7 1 -9 M529 294 q2 -5 5 -6" stroke="#65a30d" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M454 347 q-2 -5 -4 -7 M454 347 q0 -7 1 -9 M454 347 q2 -5 5 -6" stroke="#4d7c0f" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M102 348 q-2 -5 -4 -7 M102 348 q0 -7 1 -9 M102 348 q2 -5 5 -6" stroke="#65a30d" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M238 255 q-2 -9 -4 -11 M238 255 q0 -11 1 -13 M238 255 q2 -9 5 -10" stroke="#3f6212" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M60 296 q-2 -5 -4 -7 M60 296 q0 -7 1 -9 M60 296 q2 -5 5 -6" stroke="#4d7c0f" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M306 347 q-2 -6 -4 -8 M306 347 q0 -8 1 -10 M306 347 q2 -6 5 -7" stroke="#65a30d" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M594 318 q-2 -9 -4 -11 M594 318 q0 -11 1 -13 M594 318 q2 -9 5 -10" stroke="#4d7c0f" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M115 288 q-2 -7 -4 -9 M115 288 q0 -9 1 -11 M115 288 q2 -7 5 -8" stroke="#65a30d" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M570 256 q-2 -9 -4 -11 M570 256 q0 -11 1 -13 M570 256 q2 -9 5 -10" stroke="#65a30d" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M643 292 q-2 -8 -4 -10 M643 292 q0 -10 1 -12 M643 292 q2 -8 5 -9" stroke="#3f6212" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M331 359 q-2 -9 -4 -11 M331 359 q0 -11 1 -13 M331 359 q2 -9 5 -10" stroke="#3f6212" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M380 316 q-2 -6 -4 -8 M380 316 q0 -8 1 -10 M380 316 q2 -6 5 -7" stroke="#4d7c0f" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M725 302 q-2 -5 -4 -7 M725 302 q0 -7 1 -9 M725 302 q2 -5 5 -6" stroke="#84cc16" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M547 366 q-2 -7 -4 -9 M547 366 q0 -9 1 -11 M547 366 q2 -7 5 -8" stroke="#3f6212" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M304 258 q-2 -5 -4 -7 M304 258 q0 -7 1 -9 M304 258 q2 -5 5 -6" stroke="#3f6212" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M178 327 q-2 -6 -4 -8 M178 327 q0 -8 1 -10 M178 327 q2 -6 5 -7" stroke="#3f6212" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M441 250 q-2 -5 -4 -7 M441 250 q0 -7 1 -9 M441 250 q2 -5 5 -6" stroke="#84cc16" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M358 329 q-2 -9 -4 -11 M358 329 q0 -11 1 -13 M358 329 q2 -9 5 -10" stroke="#3f6212" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M603 356 q-2 -5 -4 -7 M603 356 q0 -7 1 -9 M603 356 q2 -5 5 -6" stroke="#65a30d" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M286 361 q-2 -5 -4 -7 M286 361 q0 -7 1 -9 M286 361 q2 -5 5 -6" stroke="#65a30d" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M758 319 q-2 -9 -4 -11 M758 319 q0 -11 1 -13 M758 319 q2 -9 5 -10" stroke="#3f6212" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M301 338 q-2 -7 -4 -9 M301 338 q0 -9 1 -11 M301 338 q2 -7 5 -8" stroke="#65a30d" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M482 330 q-2 -6 -4 -8 M482 330 q0 -8 1 -10 M482 330 q2 -6 5 -7" stroke="#65a30d" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M515 255 q-2 -6 -4 -8 M515 255 q0 -8 1 -10 M515 255 q2 -6 5 -7" stroke="#84cc16" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M142 303 q-2 -8 -4 -10 M142 303 q0 -10 1 -12 M142 303 q2 -8 5 -9" stroke="#3f6212" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M518 260 q-2 -6 -4 -8 M518 260 q0 -8 1 -10 M518 260 q2 -6 5 -7" stroke="#3f6212" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M421 311 q-2 -6 -4 -8 M421 311 q0 -8 1 -10 M421 311 q2 -6 5 -7" stroke="#3f6212" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M573 311 q-2 -8 -4 -10 M573 311 q0 -10 1 -12 M573 311 q2 -8 5 -9" stroke="#84cc16" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M709 337 q-2 -6 -4 -8 M709 337 q0 -8 1 -10 M709 337 q2 -6 5 -7" stroke="#4d7c0f" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M94 285 q-2 -6 -4 -8 M94 285 q0 -8 1 -10 M94 285 q2 -6 5 -7" stroke="#4d7c0f" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M684 299 q-2 -5 -4 -7 M684 299 q0 -7 1 -9 M684 299 q2 -5 5 -6" stroke="#3f6212" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M613 286 q-2 -7 -4 -9 M613 286 q0 -9 1 -11 M613 286 q2 -7 5 -8" stroke="#84cc16" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M14 277 q-2 -8 -4 -10 M14 277 q0 -10 1 -12 M14 277 q2 -8 5 -9" stroke="#84cc16" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M634 321 q-2 -6 -4 -8 M634 321 q0 -8 1 -10 M634 321 q2 -6 5 -7" stroke="#65a30d" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M477 340 q-2 -8 -4 -10 M477 340 q0 -10 1 -12 M477 340 q2 -8 5 -9" stroke="#3f6212" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M413 266 q-2 -8 -4 -10 M413 266 q0 -10 1 -12 M413 266 q2 -8 5 -9" stroke="#3f6212" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M73 288 q-2 -5 -4 -7 M73 288 q0 -7 1 -9 M73 288 q2 -5 5 -6" stroke="#4d7c0f" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M461 281 q-2 -5 -4 -7 M461 281 q0 -7 1 -9 M461 281 q2 -5 5 -6" stroke="#84cc16" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M625 253 q-2 -5 -4 -7 M625 253 q0 -7 1 -9 M625 253 q2 -5 5 -6" stroke="#65a30d" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M590 278 q-2 -9 -4 -11 M590 278 q0 -11 1 -13 M590 278 q2 -9 5 -10" stroke="#65a30d" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M382 246 q-2 -5 -4 -7 M382 246 q0 -7 1 -9 M382 246 q2 -5 5 -6" stroke="#4d7c0f" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M638 336 q-2 -6 -4 -8 M638 336 q0 -8 1 -10 M638 336 q2 -6 5 -7" stroke="#84cc16" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M365 333 q-2 -8 -4 -10 M365 333 q0 -10 1 -12 M365 333 q2 -8 5 -9" stroke="#65a30d" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M128 364 q-2 -8 -4 -10 M128 364 q0 -10 1 -12 M128 364 q2 -8 5 -9" stroke="#3f6212" stroke-width="1.6" fill="none" stroke-linecap="round"/></g>
      <!-- the raised road to the shelter -->
      <!-- the raised road climbs to the shelter's yard and stairs -->
      <path d="M296 324 Q470 310 562 286 Q604 270 646 250 L800 250 L800 262 L652 262 Q610 282 566 300 Q480 330 296 340 Z" fill="#8a6a3d" opacity=".5"/>
      <path d="M300 300 Q470 286 560 262 Q600 246 640 224 L800 224 L800 240 L648 240 Q608 260 566 280 Q480 306 300 320 Z" fill="#d9bf8f"/>
      <path d="M300 300 Q470 286 560 262 Q600 246 640 224 L800 224" stroke="#6b8e23" stroke-width="3" fill="none"/>
      <path d="M300 320 Q480 306 566 280 Q608 260 648 240 L800 240" stroke="#a07c45" stroke-width="2" fill="none"/>
      <path d="M310 307 Q470 293 562 269 Q602 253 642 231 M310 313 Q470 299 564 275 Q604 259 645 236" stroke="#c4a36d" stroke-width="1.6" fill="none" stroke-dasharray="10 6"/>
      <!-- cyclone shelter: two floors on pillars, as along the coast and in the haors -->
      <g id="shelter" transform="translate(650 120)">
        <rect x="0" y="96" width="128" height="6" fill="#94a3b8"/>
        ${[6, 40, 80, 114].map(x => `<rect x="${x}" y="70" width="8" height="28" fill="#cbd5e1" stroke="#64748b"/>`).join("")}
        <path d="M-10 98 L6 70" stroke="#64748b" stroke-width="3"/><path d="M-8 96 L4 96 M-4 90 L8 90 M0 84 L10 84 M2 78 L12 78" stroke="#94a3b8" stroke-width="2"/>
        <rect x="0" y="10" width="128" height="62" fill="#f1f5f9" stroke="#475569" stroke-width="1.6"/><rect x="0" y="40" width="128" height="3" fill="#cbd5e1"/>
        ${[10, 38, 66, 94].map(x => `<rect x="${x}" y="18" width="20" height="16" fill="#7dd3fc" stroke="#475569"/><rect x="${x}" y="48" width="20" height="16" fill="#7dd3fc" stroke="#475569"/>`).join("")}
        <rect x="-4" y="2" width="136" height="10" fill="#0e7490"/>
        <rect x="24" y="-18" width="80" height="18" rx="3" fill="#fff" stroke="#0e7490" stroke-width="1.6"/>
        <text id="shelterTxt" x="64" y="-5" text-anchor="middle" font-size="12" font-weight="800" fill="#0e7490"></text>
        <path d="M118 2 L118 -30" stroke="#334155" stroke-width="2"/><path d="M118 -30 L138 -24 L118 -18 Z" fill="#16a34a"/><circle cx="125" cy="-24" r="3" fill="#dc2626"/></g>
      <!-- the home: bamboo walls and a tin roof -->
      <g id="home" transform="translate(146 196)">
        <rect x="0" y="34" width="88" height="52" fill="#e7c98a" stroke="#92400e"/>${Array.from({ length: 11 }, (_, k) => `<path d="M${4 + k * 8} 34 L${4 + k * 8} 86" stroke="#c9a15a" stroke-width="1.4"/>`).join("")}
        <path d="M-10 36 L20 4 L98 4 L106 36 Z" fill="#94a3b8" stroke="#475569"/>${Array.from({ length: 10 }, (_, k) => `<path d="M${-6 + k * 11} 34 L${22 + k * 8} 6" stroke="#cbd5e1" stroke-width="1.2"/>`).join("")}
        <rect x="34" y="54" width="20" height="32" fill="#78350f"/><circle cx="50" cy="70" r="1.4" fill="#fde68a"/>
        <rect x="8" y="48" width="18" height="14" fill="#1e3a5f" stroke="#78350f" stroke-width="2"/><path d="M17 48 L17 62 M8 55 L26 55" stroke="#78350f" stroke-width="1.5"/>
        <path d="M-14 86 L-14 74 M-6 86 L-6 74 M2 86 L2 74 M100 86 L100 74 M108 86 L108 74 M-16 78 L4 78 M98 78 L112 78" stroke="#a16207" stroke-width="2"/></g>
      <!-- a mango tree -->
      <g transform="translate(64 170)">
        <path d="M-4 60 Q-3 40 -16 30 M-4 60 Q8 46 18 40 M-3 72 Q-14 62 -22 58" stroke="#78350f" stroke-width="7" fill="none" stroke-linecap="round"/>
        <path d="M-8 116 L7 116 L3 58 L-4 58 Z" fill="#78350f"/>
        <circle cx="0" cy="24" r="30" fill="#166534"/><circle cx="-26" cy="38" r="22" fill="#15803d"/><circle cx="26" cy="36" r="24" fill="#15803d"/>
        <circle cx="-8" cy="8" r="22" fill="#16a34a"/><circle cx="16" cy="12" r="20" fill="#22c55e"/><circle cx="-30" cy="22" r="14" fill="#16a34a"/>
        ${[[-14, 30], [12, 38], [-28, 44], [26, 24], [2, 46]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="3.2" ry="4.2" fill="#facc15"/>`).join("")}</g>
      <g id="clouds" opacity="0">${[[90, 64, 1.1], [270, 44, 1.3], [470, 70, 1.15], [650, 46, 1.25], [800, 72, 1]].map(([x, y, k], n) => `<g class="cl" data-x="${x}" data-v="${6 + n * 2}" transform="translate(${x} ${y}) scale(${k})">
        <ellipse cx="0" cy="16" rx="78" ry="16" fill="#1e293b" opacity=".35"/>
        <circle cx="-48" cy="6" r="22" fill="#475569"/><circle cx="-18" cy="-8" r="30" fill="#64748b"/><circle cx="18" cy="-14" r="34" fill="#64748b"/><circle cx="52" cy="2" r="24" fill="#475569"/>
        <circle cx="-6" cy="-20" r="20" fill="#94a3b8" opacity=".55"/><circle cx="26" cy="-26" r="16" fill="#94a3b8" opacity=".45"/>
        <rect x="-70" y="4" width="144" height="20" rx="10" fill="#475569"/></g>`).join("")}</g>
      <g id="rain" opacity="0" stroke-linecap="round">${Array.from({ length: 140 }, (_, i) => { const L = 10 + (i * 7) % 14, w = i % 3 === 0 ? 1.8 : 1.1; return `<line class="dr" data-x="${(i * 61) % 860}" data-y="${(i * 97) % 400}" data-v="${520 + (i * 37) % 260}" x1="0" y1="0" x2="${-L * .3}" y2="${L}" stroke="${i % 4 ? "#cbd5e1" : "#e0f2fe"}" stroke-width="${w}" opacity="${.45 + (i % 5) * .1}"/>`; }).join("")}</g>
      <!-- the river, then the flood -->
      <g id="flood"><path id="wave" d="M-800 0 C -720 -10, -640 10, -560 0 S -400 -10, -320 0 S -160 10, -80 0 S 80 -10, 160 0 S 320 10, 400 0 S 560 -10, 640 0 S 800 10, 880 0 L880 400 L-800 400Z" fill="url(#water)" opacity=".92"/></g>
      <!-- the family -->
      <g id="fam">
        <g id="pFather" transform="translate(252 300)">${person({ top: "#2563eb", lower: lungi, load: bundle })}</g>
        <g id="pMother" transform="translate(224 302)">${person({ top: "#be185d", lower: sari, trim: sariTop, hair: momHair, front: babyArms })}</g>
        <g id="pChild" transform="translate(278 304) scale(.68)">${person({ top: "#f59e0b", lower: frock, load: sack })}</g>
        <g id="pElder" transform="translate(198 302)">${person({ top: "#f8fafc", long: true, sleeve: "#f1f5f9", hair: elderHair, face: beard, front: stick })}</g>
        <g id="pCow" transform="translate(120 306)">${cow}</g>
        <g id="pGoat" transform="translate(90 308)">${goat}</g>
      </g>
      <!-- the phone with the FloodShield alert -->
      <g id="phone" transform="translate(568 70)" opacity="0"><g id="phoneShake">
        <g id="buzz" opacity="0" stroke="#fcd34d" stroke-width="3" fill="none" stroke-linecap="round"><path d="M-12 70 Q-20 90 -12 110 M-24 62 Q-36 90 -24 118"/><path d="M152 70 Q160 90 152 110 M164 62 Q176 90 164 118"/></g>
        <rect width="140" height="230" rx="20" fill="#0f172a"/><rect x="8" y="14" width="124" height="204" rx="12" fill="#e0f2fe"/><rect x="52" y="6" width="36" height="5" rx="2.5" fill="#334155"/>
        <text x="20" y="32" font-size="10" fill="#334155" font-weight="700">9:41</text>
        <g id="notif"><rect x="14" y="40" width="112" height="40" rx="10" fill="#fff" stroke="#0e5a8a" stroke-width="1.4"/><rect x="20" y="47" width="16" height="16" rx="4" fill="#0e5a8a"/><path d="M23 58c1.5-1.5 2.5-1.5 4 0s2.5 1.5 4 0" stroke="#fff" stroke-width="1.4" fill="none"/>
          <text x="40" y="55" font-size="9" font-weight="800" fill="#0b3b5c">FloodShield BD</text><text id="nT" x="40" y="69" font-size="9" fill="#b91c1c" font-weight="700"></text></g>
        <g id="alertBody" opacity="0"><rect x="14" y="88" width="112" height="122" rx="12" fill="#fff"/>
          <text x="70" y="114" text-anchor="middle" font-size="22">⚠️</text><text id="aT" x="70" y="136" text-anchor="middle" font-size="12.5" font-weight="800" fill="#b91c1c"></text>
          <rect x="24" y="146" width="92" height="26" rx="8" fill="#16a34a"/><text id="aB" x="70" y="163" text-anchor="middle" font-size="11" font-weight="700" fill="#fff"></text>
          <text id="aS" x="70" y="192" text-anchor="middle" font-size="8.6" fill="#475569"></text></g></g></g>
      <g id="ending" opacity="0"><rect width="800" height="380" fill="#0b3b5c" opacity=".78"/>
        <g transform="translate(400 130)"><rect x="-34" y="-34" width="68" height="68" rx="16" fill="#0e5a8a"/><path d="M-22 6c6-6 10-6 16 0s10 6 16 0 10-6 12-2v10h-44z" fill="#fff"/><path d="M0 -24l14 8v8c0 6-6 10-14 12-8-2-14-6-14-12v-8z" fill="#89d0f5"/></g>
        <text x="400" y="200" text-anchor="middle" font-size="30" font-weight="800" fill="#fff">FloodShield BD</text>
        <text id="tag" x="400" y="242" text-anchor="middle" font-size="21" font-weight="700" fill="#fcd34d"></text>
        <text id="tsub" x="400" y="274" text-anchor="middle" font-size="15" fill="#d7ebf3"></text></g>
    </g></svg>
`;

  const $ = id => host.querySelector("#" + id);
  const D = 24;  // seconds
  const drops = [...host.querySelectorAll(".dr")].map(el => ({ el, x: +el.dataset.x, y: +el.dataset.y, v: +el.dataset.v }));
  const clouds = [...host.querySelectorAll(".cl")].map(el => ({ el, x: +el.dataset.x, v: +el.dataset.v, base: el.getAttribute("transform") }));
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const ease = x => x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
  const span = (s, a, b) => ease(clamp((s - a) / (b - a)));
  const members = ["pFather", "pMother", "pChild", "pElder", "pCow", "pGoat"].map(id => ({ el: $(id), x0: +$(id).getAttribute("transform").match(/translate\(([\d.]+)/)[1], y0: +$(id).getAttribute("transform").match(/ ([\d.]+)\)/)[1], s: $(id).getAttribute("transform").includes("scale") ? .7 : 1 }));
  // where each member stands at the shelter
  const dest = { pFather: [716, 232], pMother: [690, 233], pChild: [740, 233], pElder: [664, 234], pCow: [604, 258], pGoat: [634, 244] };  // in the shelter's yard

  function texts() {
    const k = t();
    $("shelterTxt").textContent = k.shelter; $("aT").textContent = k.alertT; $("aB").textContent = k.alertB; $("aS").textContent = k.alertS; $("nT").textContent = k.alertT;
    $("tag").textContent = k.tag; $("tsub").textContent = k.sub;
  }
  function frame(s) {
    const k = t();
    const storm = span(s, 3, 6);
    $("storm").setAttribute("opacity", storm); $("sun").setAttribute("opacity", 1 - storm); $("clouds").setAttribute("opacity", storm);
    $("rain").setAttribute("opacity", storm * (1 - span(s, 19.5, 20.5)));
    // each drop falls at its own speed and slants with the wind; clouds drift slowly
    if (storm > 0) {
      drops.forEach(d => { const y = (d.y + s * d.v) % 420 - 20, x = (d.x - (y + 20) * .3 + 860) % 860 - 30; d.el.setAttribute("transform", `translate(${x} ${y})`); });
      clouds.forEach(c => c.el.setAttribute("transform", c.base.replace(/translate\(([-\d.]+)/, `translate(${((c.x + s * c.v + 120) % 1040) - 120}`)));
    }
    // water: a river at the bottom, rising onto the land and up the house, never reaching the raised road's end
    const lvl = 352 - span(s, 6, 9) * 24 - span(s, 15.5, 19.5) * 58;  // rises behind the family, after they have left
    $("flood").setAttribute("transform", `translate(${(s * 60) % 160 - 80} ${lvl})`);
    // phone alert
    const ph = span(s, 8.6, 9) * (1 - span(s, 12.8, 13.6));
    $("phone").setAttribute("opacity", ph); $("phone").setAttribute("transform", `translate(568 ${70 + (1 - span(s, 8.6, 9)) * 30})`);
    const shaking = s > 9 && s < 9.9;  // the phone vibrates first, then the notification drops in, then the alert opens
    $("phoneShake").setAttribute("transform", shaking ? `rotate(${Math.sin(s * 90) * 5} 70 115)` : "");
    $("buzz").setAttribute("opacity", shaking ? .9 : 0);
    $("notif").setAttribute("transform", `translate(0 ${-50 * (1 - span(s, 9.8, 10.2))})`); $("notif").setAttribute("opacity", span(s, 9.8, 10.1));
    $("alertBody").setAttribute("opacity", span(s, 10.4, 10.9));
    // packing: loads appear; walking: each member moves along the road to its place at the shelter
    const pack = span(s, 12, 13.4), walk = span(s, 14, 19);
    members.forEach((m, i) => {
      const [dx, dy] = dest[m.el.id], lag = clamp(walk * 1.15 - i * .03);
      const x = m.x0 + (dx - m.x0) * lag, y = m.y0 + (dy - m.y0) * lag;
      const bob = walk > 0 && lag < 1 ? Math.abs(Math.sin(s * 9 + i)) * 2 : 0;
      m.el.setAttribute("transform", `translate(${x} ${y - bob})${m.s !== 1 ? ` scale(${m.s})` : ""}`);
      const load = m.el.querySelector(".load"); if (load) load.setAttribute("opacity", pack);
      const lg = Math.sin(s * 9 + i) * (walk > 0 && lag < 1 ? 1 : 0);
      const hip = m.el.id === "pCow" ? -14 : m.el.id === "pGoat" ? -11 : -26;
      m.el.querySelectorAll(".lg1").forEach(l => l.setAttribute("transform", `rotate(${lg * 18} ${+l.getAttribute("x") + 2} ${hip})`));
      m.el.querySelectorAll(".lg2").forEach(l => l.setAttribute("transform", `rotate(${-lg * 18} ${+l.getAttribute("x") + 2} ${hip})`));
      m.el.querySelectorAll(".ar1").forEach(l => l.setAttribute("transform", `rotate(${-lg * 24} -7 -45)`));
      m.el.querySelectorAll(".ar2").forEach(l => l.setAttribute("transform", `rotate(${lg * 24} 7 -45)`));
      const mouth = m.el.querySelector(".mouth"); if (mouth) mouth.setAttribute("d", s > 19 ? "M0 -54 Q3.5 -49.5 6.5 -54" : s > 9 ? "M1 -52.5 Q3.5 -53.8 5.5 -52.5" : "M1 -53 Q3.5 -51.5 5.5 -53");
    });
    $("ending").setAttribute("opacity", span(s, 21.2, 22.2));  // first a moment of everyone safe at the shelter
    const scene = s < 3 ? 0 : s < 6 ? 1 : s < 9 ? 2 : s < 12 ? 3 : s < 14 ? 4 : s < 19 ? 5 : 6;
    host.setAttribute("aria-label", k.cap[scene]);
  }

  let start = performance.now(), seen = true, raf = 0, lang0 = "";
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function loop(now) {
    raf = requestAnimationFrame(loop);
    if (document.documentElement.lang !== lang0) { lang0 = document.documentElement.lang; texts(); }
    if (window.__noLoop) return;  // a test is drawing chosen moments
    if (!seen || document.hidden) { start += 16; return; }
    let s = (now - start) / 1000;
    if (s > D + 2.5) { start = now; s = 0; }  // hold the ending a moment, then start again
    frame(Math.min(s, D));
  }
  texts();
  if (calm) { frame(20.2); return; }
  new IntersectionObserver(es => { seen = es[0].isIntersecting; }).observe(host);
  raf = requestAnimationFrame(loop);
  window.__story = { frame };  // lets a test render any moment
})();
