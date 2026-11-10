/* FloodShield BD — map app (full-screen map, dark HUD) */
const T = {
  en: {
    tagline: "Flood early warning · Bangladesh",
    searchPh: "Search an upazila or district…",
    official: "For official warnings, always follow FFWC, the Met Department (BMD) and your upazila office.",
    viewRisk: "Flood risk", viewRain: "Rainfall", viewPast: "Past floods", viewCyc: "Cyclones",
    cycEyebrow: "Cyclone history · NOAA IBTrACS", cycTop: "Closest to the track",
    cycBand: ["≤ 50 km", "50–100 km", "100–150 km"], cycScale: "Distance from the storm centre",
    cycFromTrack: km => `${km} km from the track`, cycWind: kt => `IMD wind nearby ${kt} kt (${Math.round(kt * 1.852)} km/h)`,
    cycPeak: "Peak (IMD)", cycLandfall: "Landfall", cycNoWind: "Wind not recorded in IBTrACS",
    cycJtwc: kt => `US JTWC estimate: ${kt} kt (1-min wind, a different measure)`, cycProvisional: "Provisional track (not yet final)",
    cycNote: "Path from the Indian Meteorological Department's official record. Strong winds reach well beyond the centre line.",
    cycHistTitle: "🌀 Cyclones since 1960",
    cats: ["Depression", "Deep depression", "Cyclone", "Severe cyclone", "Very severe cyclone", "Extremely severe cyclone", "Super cyclone"],
    catRange: ["31–49", "50–61", "62–88", "89–117", "118–166", "167–221", "222+"],
    kmh: "km/h", allStorms: "All storms since 1960…", playStorm: "Watch the storm",
    stFormed: "Formed in the Bay of Bengal", stPeak: "Strongest", stLand: "Hit the coast", stEnd: "Faded away",
    nearPlace: (u, d) => `near ${u} (${d})`, outsideBd: "outside Bangladesh (India / Myanmar coast)",
    affected: n => `<b>${n}</b> upazilas had the storm centre within 50 km`,
    peakWind: "Strongest wind", hitCoast: "Hit the coast", noLandfall: "Did not reach land",
    passedNear: "Areas the storm centre passed near", howToRead: "How to read the map",
    readTrack: "The line is the storm path; its colour shows how strong it was there.",
    readArea: "Coloured upazilas: how close the storm centre came (red = within 50 km).",
    dataNote: "Storm paths: Indian Meteorological Department official record (via NOAA). Wind is a 3-minute average.",
    noWindRec: "Wind speed was not recorded for this storm.",
    cycHist: (n50, n150) => `<b>${n50}</b> storm tracks passed within 50 km, <b>${n150}</b> within 150 km (IBTrACS, IMD best track).`,
    cycStrongest: "Strongest nearby",
    cycNoLand: "Did not make landfall",
    cycFar: km => `Never within 150 km of an upazila (closest ${km} km from Bangladesh)`, cycUpz: n => `${n} upazilas within 150 km`,
    dateLabel: "Date", today: "Today", total24: "Next 24h", total72: "Next 72h",
    past72: "Last 72h", next24: "Next 24h", next72: "Next 72h",
    allDivisions: "All Bangladesh", rivers: "Rivers", upstream: "Upstream basins (India, Nepal…)", coastLayer: "Coast, ports & live sea",
    layersTitle: "Map layers", loading: "Loading…", runningModel: "Running the model for this date…",
    tHome: "Show all Bangladesh", tSearch: "Search", tLayers: "Layers", tTheme: "Dark / light map", tPanel: "Details panel",
    overviewTitle: "National overview", detailTitle: "Upazila details",
    statusEyebrow: "National flood outlook", statusEyebrowPast: "Past date test · not today's situation",
    headlineNone: "No elevated flood risk", headlineSome: (h, m) => h ? `${h} upazilas at high risk` : `${m} upazilas at medium risk`,
    period: (a, b) => `Next 15 days · ${a} – ${b}`,
    high: "High", medium: "Medium", low: "Low",
    whatMeans: "Each upazila is grouped by its chance of abnormal water over at least 5% of its area in the next 15 days: low is under 25%, medium 25–50%, high 50% or more.",
    skill: (m, b) => `Tested on 9 past monsoons the model had not seen: given one flooded and one dry upazila, it gave the flooded one the higher risk <b>${nf(m * 100)} times out of 100</b>. Going by past flood history alone: ${nf(b * 100)} times.`,
    modelDetails: "How reliable is this model?",
    hindNote: "This is a test, not a live forecast: it shows what the model would have said, given the rain that actually fell.",
    observed: (name, hit, total) => `Satellite images show flooding in <b>${nf(total)}</b> upazilas around this time (${name}). The model put <b>${nf(hit)}</b> of them at medium or high risk.`,
    noObserved: "We have no satellite flood map for this date, so the result can't be compared here.",
    topRisk: "Upazilas at highest risk", topRain: "Most rain expected", topRainPast: "Most rain, last 72h", topPast: "Most flooded",
    howTitle: "How to use",
    how1: "Search or tap an upazila to see its flood risk, rainfall and hospitals.",
    how2: "Use the buttons at the top for rainfall, past floods and cyclones.",
    how3: "Open an upazila's full report for its flood history since 2017.",
    backOverview: "← National overview", reportBtn: "Open flood history report",
    riskOf: { low: "Low risk", medium: "Medium risk", high: "High risk" },
    chance: "estimated chance of flooding", riskLimit: "River levels and local waterlogging are not included in this estimate.",
    likelyRange: (f, a, b) => `Expected flooded share ${f}% · likely range ${a}–${b}%`,
    noForecast: "No flood forecast for this upazila yet.",
    rainTitle: "Rainfall", chartPast: "Past", chartFuture: "Forecast",
    hospTitle: "🏥 Government hospitals",
    hospNote: (d) => `Official DGHS Facility Registry (Ministry of Health). Shown only where the registry's location falls inside this upazila. Fetched ${d}.`,
    beds: "beds", call: "Call", profile: "DGHS profile",
    upTitle: "Where its water comes from", upArea: "Area draining here", upOut: "Outside Bangladesh",
    upRain: "Rain forecast over that area (72h)",
    flooded: "flooded", pastPick: "Choose a past flood", mm: "mm", mmh: "mm/h",
    stripRain: v => `Next 72h rain ${v}`, risk: "risk",
    sourcesTitle: "ⓘ Data sources", aboutLink: "ⓘ About the data & official warnings",
    noResults: "No matching upazila", now: "Now",
    riskSay: { low: "Flooding is unlikely here in the next 15 days.",
      medium: "There is some chance of flooding here in the next 15 days. Keep an eye on FFWC and Met Department news.",
      high: "Flooding is likely here in the next 15 days. Follow FFWC, the Met Department and your upazila office." },
    rainClasses: ["Little or no rain", "Light rain", "Moderate rain", "Moderately heavy rain", "Heavy rain", "Very heavy rain"],
    rainClsNote: "Words follow the Met Department (BMD) scale for rain in 24 hours.",
    upSay: (area, times) => `Rain falling on <b>${area} km²</b> of land flows through this upazila${times ? `, about <b>${times} times</b> its own size` : ""}.`,
    upOutSay: (pct, txt) => pct > 0 ? `<b>${txt}%</b> of that land is outside Bangladesh, so rain in India or Nepal can raise the water here too.` : "All of that land is inside Bangladesh.",
    upRainSay: v => `Rain expected over that land in the next 3 days: <b>${v}</b>.`,
    inside: "Inside Bangladesh", outside: "Outside Bangladesh",
    cycSay: (n50, n150) => `Since 1960, <b>${n50}</b> storms passed within 50 km of here and <b>${n150}</b> within 150 km.`,
    kmAway: km => `${km} km away`, nextDays: "next 24 hours",
  },
  bn: {
    tagline: "বন্যার আগাম সতর্কতা · বাংলাদেশ",
    searchPh: "উপজেলা বা জেলার নাম লিখুন…",
    official: "সরকারি সতর্কবার্তার জন্য সবসময় FFWC, আবহাওয়া অধিদপ্তর ও উপজেলা প্রশাসনের কথা মেনে চলুন।",
    viewRisk: "বন্যার ঝুঁকি", viewRain: "বৃষ্টি", viewPast: "অতীতের বন্যা", viewCyc: "ঘূর্ণিঝড়",
    cycEyebrow: "ঘূর্ণিঝড়ের ইতিহাস · NOAA IBTrACS", cycTop: "ঝড়ের পথের সবচেয়ে কাছে",
    cycBand: ["≤ ৫০ কিমি", "৫০–১০০ কিমি", "১০০–১৫০ কিমি"], cycScale: "ঝড়ের কেন্দ্র থেকে দূরত্ব",
    cycFromTrack: km => `ঝড়ের পথ থেকে ${km} কিমি`, cycWind: kt => `কাছাকাছি IMD বাতাস ${kt} নট (${Math.round(kt * 1.852)} কিমি/ঘণ্টা)`,
    cycPeak: "সর্বোচ্চ (IMD)", cycLandfall: "আঘাত হানে", cycNoWind: "IBTrACS-এ বাতাসের গতি রেকর্ড নেই",
    cycJtwc: kt => `মার্কিন JTWC-এর হিসাব: ${kt} নট (১ মিনিটের বাতাস, ভিন্ন মাপ)`, cycProvisional: "অস্থায়ী পথ (এখনো চূড়ান্ত নয়)",
    cycNote: "পথ ভারতীয় আবহাওয়া অধিদপ্তরের অফিসিয়াল রেকর্ড থেকে। জোরালো বাতাস কেন্দ্রের অনেক দূর পর্যন্ত যায়।",
    cycHistTitle: "🌀 ১৯৬০ থেকে ঘূর্ণিঝড়",
    cats: ["নিম্নচাপ", "গভীর নিম্নচাপ", "ঘূর্ণিঝড়", "প্রবল ঘূর্ণিঝড়", "অতি প্রবল ঘূর্ণিঝড়", "অত্যন্ত প্রবল ঘূর্ণিঝড়", "সুপার সাইক্লোন"],
    catRange: ["৩১–৪৯", "৫০–৬১", "৬২–৮৮", "৮৯–১১৭", "১১৮–১৬৬", "১৬৭–২২১", "২২২+"],
    kmh: "কিমি/ঘণ্টা", allStorms: "১৯৬০ থেকে সব ঝড়…", playStorm: "ঝড়টি চলতে দেখুন",
    stFormed: "বঙ্গোপসাগরে সৃষ্টি", stPeak: "সবচেয়ে শক্তিশালী", stLand: "উপকূলে আঘাত", stEnd: "দুর্বল হয়ে মিলিয়ে যায়",
    nearPlace: (u, d) => `${u} (${d})-এর কাছে`, outsideBd: "বাংলাদেশের বাইরে (ভারত / মিয়ানমার উপকূল)",
    affected: n => `<b>${n}</b>টি উপজেলার ৫০ কিমির মধ্যে দিয়ে ঝড়ের কেন্দ্র গেছে`,
    peakWind: "সর্বোচ্চ বাতাস", hitCoast: "উপকূলে আঘাত", noLandfall: "স্থলভাগে পৌঁছায়নি",
    passedNear: "ঝড়ের কেন্দ্র যেসব এলাকার কাছ দিয়ে গেছে", howToRead: "ম্যাপ কীভাবে বুঝবেন",
    readTrack: "রেখাটি ঝড়ের পথ; রঙ দেখায় সেখানে ঝড় কত শক্তিশালী ছিল।",
    readArea: "রঙিন উপজেলা: ঝড়ের কেন্দ্র কত কাছে এসেছিল (লাল = ৫০ কিমির মধ্যে)।",
    dataNote: "ঝড়ের পথ: ভারতীয় আবহাওয়া অধিদপ্তরের অফিসিয়াল রেকর্ড (NOAA-র মাধ্যমে)। বাতাস ৩ মিনিটের গড়।",
    noWindRec: "এই ঝড়ের বাতাসের গতি রেকর্ডে নেই।",
    cycHist: (n50, n150) => `<b>${n50}</b>টি ঝড়ের পথ ৫০ কিমির মধ্যে, <b>${n150}</b>টি ১৫০ কিমির মধ্যে দিয়ে গেছে (IBTrACS, IMD best track)।`,
    cycStrongest: "কাছ দিয়ে যাওয়া সবচেয়ে শক্তিশালী",
    cycNoLand: "স্থলভাগে আঘাত হানেনি",
    cycFar: km => `কোনো উপজেলার ১৫০ কিমির মধ্যে আসেনি (বাংলাদেশ থেকে সবচেয়ে কাছে ${km} কিমি)`, cycUpz: n => `${n}টি উপজেলা ১৫০ কিমির মধ্যে`,
    dateLabel: "তারিখ", today: "আজ", total24: "আগামী ২৪ ঘণ্টা", total72: "আগামী ৭২ ঘণ্টা",
    past72: "গত ৭২ ঘণ্টা", next24: "আগামী ২৪ ঘণ্টা", next72: "আগামী ৭২ ঘণ্টা",
    allDivisions: "সমগ্র বাংলাদেশ", rivers: "নদী", upstream: "উজানের অববাহিকা (ভারত, নেপাল…)", coastLayer: "উপকূল, বন্দর ও সাগরের এখনকার অবস্থা",
    layersTitle: "ম্যাপের স্তর", loading: "লোড হচ্ছে…", runningModel: "এই তারিখের জন্য মডেল চলছে…",
    tHome: "পুরো বাংলাদেশ", tSearch: "খুঁজুন", tLayers: "স্তর", tTheme: "গাঢ় / হালকা ম্যাপ", tPanel: "বিস্তারিত প্যানেল",
    overviewTitle: "জাতীয় পরিস্থিতি", detailTitle: "উপজেলার বিস্তারিত",
    statusEyebrow: "জাতীয় বন্যা পরিস্থিতি", statusEyebrowPast: "পুরনো তারিখের পরীক্ষা · আজকের অবস্থা নয়",
    headlineNone: "বন্যার বাড়তি ঝুঁকি নেই", headlineSome: (h, m) => h ? `${nf(h)}টি উপজেলায় উচ্চ ঝুঁকি` : `${nf(m)}টি উপজেলায় মাঝারি ঝুঁকি`,
    period: (a, b) => `আগামী ১৫ দিন · ${a} – ${b}`,
    high: "উচ্চ", medium: "মাঝারি", low: "নিম্ন",
    whatMeans: "আগামী ১৫ দিনে উপজেলার অন্তত ৫% এলাকায় অস্বাভাবিক পানি জমার সম্ভাবনা ধরে ভাগ করা হয়েছে: নিম্ন ২৫%-এর কম, মাঝারি ২৫–৫০%, উচ্চ ৫০% বা তার বেশি।",
    skill: (m, b) => `মডেলকে আগে না দেখানো ৯টি বর্ষায় পরীক্ষা করা হয়েছে। একটি প্লাবিত ও একটি শুকনো উপজেলার মধ্যে প্লাবিতটিকে বেশি ঝুঁকিতে রেখেছে <b>১০০ বারে ${nf(m * 100)} বার</b>। শুধু আগের বন্যার ইতিহাস দেখে অনুমান করলে ${nf(b * 100)} বার।`,
    modelDetails: "এই মডেল কতটা নির্ভরযোগ্য?",
    hindNote: "এটি পরীক্ষা, আসল পূর্বাভাস নয়। ওই সময়ে যে বৃষ্টি সত্যিই হয়েছিল, তা দিয়ে মডেল কী বলত সেটাই এখানে দেখানো হচ্ছে।",
    observed: (name, hit, total) => `স্যাটেলাইটের ছবিতে এই সময়ে <b>${nf(total)}</b>টি উপজেলায় বন্যা দেখা গেছে। মডেল এর মধ্যে <b>${nf(hit)}</b>টিকে মাঝারি বা উচ্চ ঝুঁকিতে রেখেছে।`,
    noObserved: "এই তারিখের স্যাটেলাইট বন্যা-ম্যাপ আমাদের কাছে নেই, তাই ফল মিলিয়ে দেখা যাচ্ছে না।",
    topRisk: "সবচেয়ে বেশি ঝুঁকিতে থাকা উপজেলা", topRain: "সবচেয়ে বেশি বৃষ্টির পূর্বাভাস", topRainPast: "গত ৭২ ঘণ্টায় সবচেয়ে বেশি বৃষ্টি", topPast: "সবচেয়ে বেশি প্লাবিত",
    howTitle: "কীভাবে ব্যবহার করবেন",
    how1: "উপজেলা খুঁজুন বা ম্যাপে চাপুন। বন্যার ঝুঁকি, বৃষ্টি আর হাসপাতালের তথ্য পাবেন।",
    how2: "ওপরের বোতাম থেকে বৃষ্টি, অতীতের বন্যা আর ঘূর্ণিঝড় দেখুন।",
    how3: "উপজেলার পুরো রিপোর্টে ২০১৭ থেকে বন্যার ইতিহাস দেখুন।",
    backOverview: "← জাতীয় পরিস্থিতি", reportBtn: "বন্যার ইতিহাসের রিপোর্ট দেখুন",
    riskOf: { low: "নিম্ন ঝুঁকি", medium: "মাঝারি ঝুঁকি", high: "উচ্চ ঝুঁকি" },
    chance: "বন্যার আনুমানিক সম্ভাবনা", riskLimit: "নদীর পানির স্তর ও স্থানীয় জলাবদ্ধতা এই হিসাবে নেই।",
    likelyRange: (f, a, b) => `প্রত্যাশিত প্লাবিত অংশ ${f}% · সম্ভাব্য পরিসর ${a}–${b}%`,
    noForecast: "এই উপজেলার জন্য এখনো পূর্বাভাস নেই।",
    rainTitle: "বৃষ্টি", chartPast: "অতীত", chartFuture: "পূর্বাভাস",
    hospTitle: "🏥 সরকারি হাসপাতাল",
    hospNote: (d) => `সরকারি উৎস: স্বাস্থ্য অধিদপ্তরের (DGHS) ফ্যাসিলিটি রেজিস্ট্রি। রেজিস্ট্রির অবস্থান এই উপজেলার ভেতরে পড়লে তবেই দেখানো হয়। সংগ্রহ: ${d}।`,
    beds: "শয্যা", call: "ফোন", profile: "DGHS প্রোফাইল",
    upTitle: "পানি কোথা থেকে আসে", upArea: "যত এলাকার পানি এখানে আসে", upOut: "বাংলাদেশের বাইরে",
    upRain: "ওই এলাকায় বৃষ্টির পূর্বাভাস (৭২ ঘণ্টা)",
    flooded: "প্লাবিত", pastPick: "একটি অতীতের বন্যা বাছুন", mm: "মিমি", mmh: "মিমি/ঘণ্টা",
    stripRain: v => `আগামী ৭২ ঘণ্টায় বৃষ্টি ${v}`, risk: "ঝুঁকি",
    sourcesTitle: "ⓘ ডেটার উৎস", aboutLink: "ⓘ ডেটা ও সরকারি সতর্কবার্তা সম্পর্কে",
    noResults: "কোনো উপজেলা মেলেনি", now: "এখন",
    riskSay: { low: "আগামী ১৫ দিনে এখানে বন্যার সম্ভাবনা কম।",
      medium: "আগামী ১৫ দিনে এখানে কিছুটা বন্যার সম্ভাবনা আছে। FFWC ও আবহাওয়া অধিদপ্তরের খবর খেয়াল রাখুন।",
      high: "আগামী ১৫ দিনে এখানে বন্যার সম্ভাবনা বেশি। FFWC, আবহাওয়া অধিদপ্তর ও উপজেলা প্রশাসনের নির্দেশনা মেনে চলুন।" },
    rainClasses: ["সামান্য বা বৃষ্টি নেই", "হালকা বৃষ্টি", "মাঝারি বৃষ্টি", "মাঝারি ধরনের ভারী বৃষ্টি", "ভারী বৃষ্টি", "অতি ভারী বৃষ্টি"],
    rainClsNote: "বৃষ্টির ভাগ আবহাওয়া অধিদপ্তরের ২৪ ঘণ্টার মাপ অনুযায়ী।",
    upSay: (area, times) => `<b>${area} বর্গকিমি</b> জমিতে পড়া বৃষ্টির পানি এই উপজেলা দিয়ে বয়ে যায়${times ? `, যা এই উপজেলার প্রায় <b>${times} গুণ</b>` : ""}।`,
    upOutSay: (pct, txt) => pct > 0 ? `ওই জমির <b>${txt}%</b> বাংলাদেশের বাইরে, তাই ভারত বা নেপালে বৃষ্টি হলেও এখানে পানি বাড়তে পারে।` : "পুরো জমিই বাংলাদেশের ভেতরে।",
    upRainSay: v => `আগামী ৩ দিনে ওই এলাকায় বৃষ্টির পূর্বাভাস: <b>${v}</b>।`,
    inside: "বাংলাদেশের ভেতরে", outside: "বাংলাদেশের বাইরে",
    cycSay: (n50, n150) => `১৯৬০ থেকে <b>${n50}</b>টি ঝড় এখানকার ৫০ কিমির মধ্যে দিয়ে এবং <b>${n150}</b>টি ১৫০ কিমির মধ্যে দিয়ে গেছে।`,
    kmAway: km => `${km} কিমি দূরে`, nextDays: "আগামী ২৪ ঘণ্টা",
  },
};

/* ---------- state ---------- */
let lang = "en", view = "risk", lead = "rain_24h_mm";
let data = null, layer = null, selected = null, selectedLayer = null;
let hind = null, events = [], eventLabels = null;
let cycList = [], cyc = null, cycLayer = null;
let riverLayer = null, basinLayer = null, basinData = null, hiLayer = null, maskLayer = null, hospLayer = null;
let mapDark = true;
try { lang = localStorage.getItem("fs-lang") || "en"; mapDark = localStorage.getItem("fs-map") !== "light"; } catch (e) {}
const t = () => T[lang];
const slugify = s => (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const $ = id => document.getElementById(id);
const loc = () => lang === "bn" ? "bn-BD" : "en-GB";
const nf = (v, d = 0) => Number(v).toLocaleString(loc(), { maximumFractionDigits: d, minimumFractionDigits: d });
const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const dateFmt = s => new Date(s).toLocaleDateString(loc(), { day: "numeric", month: "short", year: "numeric" });
const dateLong = (s, year) => new Date(s).toLocaleDateString(loc(), { day: "numeric", month: "long", ...(year && { year: "numeric" }) });

/* ---------- colour scales ---------- */
const RISK = { low: "#5bbf7e", medium: "#f4b740", high: "#e5483a" };
const riskOf = p => p == null ? null : p >= 0.5 ? "high" : p >= 0.25 ? "medium" : "low";
// rain colours tuned for a dark map: dry stays nearly invisible, heavy rain glows
const TOTAL = { breaks: [0, 1, 5, 10, 20, 50, 100, 200], colors: ["rgba(0,0,0,0)", "#3a6ea5", "#2f8fd8", "#33b3a6", "#7dcf3c", "#f2d43a", "#f07c2a", "#d42e5a"] };
const FLOOD = { breaks: [0, 0.02, 0.05, 0.1, 0.2, 0.4], colors: ["rgba(0,0,0,0)", "#f6c9a8", "#f39b6d", "#ea6a45", "#cf3a2b", "#8f1420"] };
const step = (v, s) => v == null ? "rgba(0,0,0,0)" : s.colors[s.breaks.filter(b => v >= b).length - 1];

const CYC_BANDS = [[50, "#e5483a"], [100, "#f4914a"], [150, "#f4d35e"]];  // closeness of the storm centre
const cycOf = p => cyc?.upazilas[p.id];
function fillFor(p) {
  if (view === "cyc") { const e = cycOf(p); return e ? CYC_BANDS.find(([km]) => e.min_km <= km)[1] : "rgba(0,0,0,0)"; }
  if (view === "past") return step(eventLabels?.[p.id]?.abnormal_frac, FLOOD);
  if (view === "rain") return step(p[lead], TOTAL);
  const r = riskOf(p.flood_prob);
  return r ? RISK[r] : "rgba(0,0,0,0)";
}
function valueFor(p) {
  const tt = t();
  if (view === "cyc") {
    const e = cycOf(p);
    return e ? tt.cycFromTrack(nf(e.min_km)) + (e.wind_kt ? `<br>${tt.cycWind(e.wind_kt)}` : "") : "–";
  }
  if (view === "past") { const v = eventLabels?.[p.id]; return v ? `${nf(v.abnormal_frac * 100, 1)}% ${tt.flooded}` : "–"; }
  if (view === "rain") {
    const v = p[lead];
    return v == null ? "–" : `${nf(v, 1)} ${tt.mm}`;
  }
  return p.flood_prob == null ? "–" : `${nf(p.flood_prob * 100)}%`;
}
function sortKey(p) {
  if (view === "cyc") { const e = cycOf(p); return e ? 150 - e.min_km : -1; }
  if (view === "past") return eventLabels?.[p.id]?.abnormal_frac ?? -1;
  if (view === "rain") return p[lead] ?? -1;
  return p.flood_prob ?? -1;
}

/* ---------- map ---------- */
const BD_BOUNDS = L.latLngBounds([20.55, 88.0], [26.65, 92.7]);
const REGION_BOUNDS = L.latLngBounds([4.0, 72.0], [33.5, 101.0]);  // whole Bay of Bengal: cyclone tracks start far south
const map = L.map("map", { zoomSnap: 0.25, zoomControl: false, minZoom: 5, maxBounds: REGION_BOUNDS, maxBoundsViscosity: 0.8 });
map.setView([23.7, 90.3], 7);
// fitBounds throws (NaN LatLng) when the padding is larger than the map; fall back to no padding
function safeFit(bounds, opts = {}) {
  try { map.fitBounds(bounds, opts); } catch (e) { try { map.fitBounds(bounds); } catch (e2) { /* map not sized yet */ } }
}
function fitBangladesh() {
  // keep the country clear of the floating panels, but only when the map is wide enough for that
  const { x: w, y: h } = map.getSize();
  if (!w || !h) return;  // not laid out yet; called again after load
  const left = w > 900 ? 360 : 10, bottom = h > 500 ? 90 : 20;
  if (w - left - 70 < 200 || h - bottom - 10 < 200) { safeFit(BD_BOUNDS); return; }
  safeFit(BD_BOUNDS, { paddingTopLeft: [left, 10], paddingBottomRight: [70, bottom] });
}
new ResizeObserver(() => map.invalidateSize()).observe($("map"));
$("map").addEventListener("mouseleave", () => closeTips());
map.on("zoomstart movestart", () => closeTips());
const ESRI = "https://server.arcgisonline.com/ArcGIS/rest/services";
map.createPane("labels").style.zIndex = 640;
map.getPane("labels").style.pointerEvents = "none";
map.createPane("mask").style.zIndex = 460;
map.getPane("mask").style.pointerEvents = "none";
map.createPane("geo").style.zIndex = 650;
map.getPane("geo").style.pointerEvents = "none";
map.createPane("rivers").style.zIndex = 450;
map.createPane("track").style.zIndex = 655;
map.on("zoomend", () => map.getContainer().classList.toggle("rivers-far", map.getZoom() < 7));
let baseLayers = [];
function setBasemap() {
  baseLayers.forEach(l => l.remove());
  const ref = mapDark ? "Canvas/World_Dark_Gray_Reference" : "Ocean/World_Ocean_Reference";
  const attribution = mapDark
    ? "Imagery © Esri, Maxar, Earthstar Geographics · Labels © Esri · Boundaries BBS/OCHA · Rivers HydroSHEDS · Sea: Open-Meteo"
    : "Basemap © Esri, GEBCO, NOAA, Garmin, HERE, © OpenStreetMap contributors · Boundaries BBS/OCHA · Rivers HydroSHEDS · Sea: Open-Meteo";
  // dark mode: satellite imagery, so the Bay of Bengal, the delta and the rivers show their real colours.
  // light mode: the Ocean basemap (sea-floor shading); it has no land tiles past ~zoom 10, so zoom-10 tiles are stretched.
  baseLayers = mapDark ? [
    L.tileLayer(`${ESRI}/World_Imagery/MapServer/tile/{z}/{y}/{x}`, { maxZoom: 16, maxNativeZoom: 17, className: "sat-dark", attribution }),
    L.tileLayer(`${ESRI}/${ref}/MapServer/tile/{z}/{y}/{x}`, { pane: "labels", maxZoom: 16, maxNativeZoom: 16, opacity: 0.85 }),
  ] : [
    L.tileLayer(`${ESRI}/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}`, { maxZoom: 16, maxNativeZoom: 10, attribution }),
    L.tileLayer(`${ESRI}/${ref}/MapServer/tile/{z}/{y}/{x}`, { pane: "labels", maxZoom: 16, maxNativeZoom: 10, opacity: 0.9 }),
  ];
  baseLayers.forEach(l => l.addTo(map));
  $("map").style.background = mapDark ? "#1b232c" : "#cfe0ec";
  $("r-theme").classList.toggle("on", !mapDark);
  if (maskLayer) maskLayer.setStyle({ fillColor: mapDark ? "#0b1015" : "#ffffff", fillOpacity: maskOpacity() });
  restyleRivers();
  if (layer) restyle();
}
const maskOpacity = () => $("show-basins").checked ? 0.15 : (mapDark ? 0.2 : 0.3);

async function drawCountry() {
  const f = await (await fetch("/api/v1/country-outline")).json();
  const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
  const ll = ring => ring.map(([x, y]) => [y, x]);
  maskLayer = L.polygon([[[-89, -179], [-89, 179], [89, 179], [89, -179]], ...polys.map(p => ll(p[0]))], {
    pane: "mask", stroke: false, fillColor: mapDark ? "#0b1015" : "#ffffff", fillOpacity: maskOpacity(), interactive: false }).addTo(map);
  const big = p => { const b = L.latLngBounds(ll(p[0])); return b.getNorth() - b.getSouth() + b.getEast() - b.getWest() > 0.6; };
  const rings = polys.filter(big).map(p => ll(p[0]));
  L.polyline(rings, { pane: "geo", color: "#000", weight: 4, opacity: 0.35, interactive: false }).addTo(map);
  L.polyline(rings, { pane: "geo", color: "#e9eef3", weight: 1.4, opacity: 0.9, interactive: false }).addTo(map);
}

function baseStyle(f) {
  const fill = fillFor(f.properties), empty = fill === "rgba(0,0,0,0)";
  // low risk stays a soft tint so medium/high areas are what the eye catches
  const soft = (view === "risk" && riskOf(f.properties.flood_prob) === "low") || view === "cyc";
  return { fillColor: fill, fillOpacity: empty ? 0 : soft ? 0.3 : 0.82, weight: 0.4, opacity: 0.5,
           color: mapDark ? "#6d7c8a" : "#ffffff" };
}

async function load(reframe = false) {
  const div = $("division").value;
  const res = await fetch("/api/v1/upazilas" + (div ? `?division=${encodeURIComponent(div)}` : ""));
  data = await res.json();
  if (hind) applyHindcast();
  if (layer) { closeTips(); layer.remove(); }
  layer = L.geoJSON(data, {
    style: baseStyle,
    onEachFeature: (f, l) => {
      l.bindTooltip(() => `<div class="tt-name">${f.properties.name}</div><div class="tt-sub">${f.properties.district ?? ""}</div><b>${valueFor(f.properties)}</b>`, { sticky: true, direction: "top", offset: [0, -6] });
      l.on("mouseover", () => { if (l !== selectedLayer) l.setStyle({ weight: 1.6, color: "#ffffff", opacity: 1 }); });
      l.on("mouseout", () => { if (l !== selectedLayer) layer.resetStyle(l); });
      l.on("click", () => select(f.properties.id));
    },
  }).addTo(map);
  if (riverLayer && map.hasLayer(riverLayer)) riverLayer.bringToFront();
  if (div) safeFit(layer.getBounds(), { padding: [30, 30] });
  else if (reframe) fitBangladesh();
  if (selected) highlight(selected.id);
  renderSide();
}

const closeTips = () => layer && layer.eachLayer(l => l.closeTooltip());  // upazila tooltips only

function restyle() {
  closeTips();
  layer && layer.setStyle(baseStyle);
  if (selected) highlight(selected.id);
  basinLayer && basinLayer.setStyle(f => ({ fillColor: step(f.properties.rain_72h_mm, TOTAL) }));
  renderScale();
  renderSide();
}

function highlight(id) {
  if (selectedLayer) layer.resetStyle(selectedLayer);
  selectedLayer = null;
  layer.eachLayer(l => { if (l.feature.properties.id === id) selectedLayer = l; });
  if (selectedLayer) selectedLayer.setStyle({ weight: 3, color: "#f2a90f", opacity: 1 }).bringToFront();
}

/* ---------- bottom colour scale ---------- */
function renderScale() {
  const tt = t();
  $("scale").classList.remove("cats");
  let s, labels, unit;
  if (view === "risk") {
    $("scale").innerHTML = [["low", `${tt.low} < 25%`], ["medium", `${tt.medium} 25–50%`], ["high", `${tt.high} ≥ 50%`]]
      .map(([k, l]) => `<span style="background:${RISK[k]}">${l}</span>`).join("") + `<span class="unit">${tt.viewRisk}</span>`;
    return;
  }
  if (view === "cyc") {
    $("scale").classList.add("cats");
    $("scale").innerHTML = CAT_COLORS.map((c, i) => `<span style="background:${c}" title="${tt.cats[i]}: ${tt.catRange[i]} ${tt.kmh}"><b>${tt.cats[i]}</b><small>${tt.catRange[i]}</small></span>`).join("")
      + `<span class="unit">${tt.kmh}</span>`;
    return;
  }
  if (view === "past") { s = FLOOD; labels = ["0", "2%", "5%", "10%", "20%", "40%+"]; unit = tt.flooded; }
  else { s = TOTAL; labels = ["0", "1", "5", "10", "20", "50", "100", "200+"]; unit = tt.mm; }
  $("scale").innerHTML = s.colors.map((c, i) => `<span style="background:${i ? c : "#2a333d"}">${labels[i]}</span>`).join("")
    + `<span class="unit">${unit}</span>`;
}

/* ---------- views ---------- */
function setView(v) {
  view = v;
  document.querySelectorAll("#view button").forEach(b => b.classList.toggle("on", b.dataset.view === v));
  document.querySelectorAll(".top-left .sub").forEach(s => s.hidden = s.dataset.for !== v);
  $("playbar").hidden = v !== "cyc";
  [cycLayer, trailLayer, stormMarker].forEach(l => l && (v === "cyc" ? l.addTo(map) : l.remove()));
  if (v !== "cyc") stopStorm();
  if (v === "cyc" && !cyc) { loadCyclones(); return; }
  if (v === "past" && !eventLabels && events.length) { $("event").value = events[events.length - 1].id; selectEvent(); return; }
  restyle();
}

async function selectEvent() {
  const id = $("event").value;
  eventLabels = id ? await (await fetch(`/api/v1/flood-events/${id}`)).json() : null;
  restyle();
}

/* ---------- cyclones ---------- */
const CAT_KT = [17, 28, 34, 48, 64, 90, 120];
const CAT_COLORS = ["#7fd0a8", "#3fb6a8", "#f2d43a", "#f39a2b", "#e8562c", "#c41d4a", "#7b1fa2"];
const catIdx = kt => kt == null ? -1 : CAT_KT.filter(k => kt >= k).length - 1;
const IMD_COLOR = kt => catIdx(kt) < 0 ? "#9aa5ae" : CAT_COLORS[catIdx(kt)];
const kmh = kt => Math.round(kt * 1.852);
const catName = kt => catIdx(kt) < 0 ? "" : t().cats[catIdx(kt)];
// famous storms, picked from the IBTrACS list by name/season (unnamed ones by date and coast)
const FAMOUS = [
  { label: { en: "Remal", bn: "রেমাল" }, find: c => c.name === "Remal" && c.season === 2024 },
  { label: { en: "Mocha", bn: "মোখা" }, find: c => c.name === "Mocha" && c.season === 2023 },
  { label: { en: "Sitrang", bn: "সিত্রাং" }, find: c => c.name === "Sitrang" && c.season === 2022 },
  { label: { en: "Amphan", bn: "আম্পান" }, find: c => c.name === "Amphan" && c.season === 2020 },
  { label: { en: "Bulbul", bn: "বুলবুল" }, find: c => c.name === "Bulbul" && c.season === 2019 },
  { label: { en: "Aila", bn: "আইলা" }, find: c => c.name === "Aila" && c.season === 2009 },
  { label: { en: "Sidr", bn: "সিডর" }, find: c => c.name === "Sidr" && c.season === 2007 },
  { label: { en: "1991 cyclone", bn: "১৯৯১-এর ঘূর্ণিঝড়" }, find: c => c.season === 1991 && c.max_wind_kt >= 120 },
  { label: { en: "1970 Bhola", bn: "১৯৭০ ভোলা" }, find: c => c.season === 1970 && (c.landfall_time || "").startsWith("1970-11-12") },
];
let playTimer = null, pbIdx = 0, stormMarker = null, trailLayer = null, cycTrack = [];

async function loadCyclones() {
  if (!cycList.length) {
    const r = await (await fetch("/api/v1/cyclones?min_wind_kt=34")).json();
    cycList = r.cyclones;
    renderStormCards();
  }
  await pickStorm((FAMOUS.map(f => cycList.find(f.find)).find(Boolean) || cycList[0]).sid);
}

function renderStormCards() {
  const tt = t();
  $("storm-cards").innerHTML = FAMOUS.map(f => {
    const c = cycList.find(f.find);
    if (!c) return "";
    const kt = c.max_wind_kt;
    return `<button class="storm-card${cyc && cyc.sid === c.sid ? " on" : ""}" data-sid="${c.sid}" style="--c:${IMD_COLOR(kt)}">
      <span class="sc-name">${f.label[lang]}</span><span class="sc-year">${c.season}</span>
      <span class="sc-wind">${kt ? `${kmh(kt)} ${tt.kmh}` : "–"}</span></button>`;
  }).join("");
  document.querySelectorAll(".storm-card").forEach(b => b.onclick = () => pickStorm(b.dataset.sid));
  $("cyclone").innerHTML = `<option value="">${tt.allStorms}</option>` + cycList.map(c =>
    `<option value="${c.sid}">${c.name === "Unnamed" ? "—" : c.name} ${c.season}${c.max_wind_kt ? ` · ${kmh(c.max_wind_kt)} ${tt.kmh}` : ""}${c.closest_bd_km === 0 ? " · 🇧🇩" : ""}</option>`).join("");
}

async function pickStorm(sid) {
  if (!sid) return;
  $("cyclone").value = sid;
  await selectCyclone();
  renderStormCards();
  $("cyclone").value = sid;
}

async function selectCyclone() {
  const sid = $("cyclone").value;
  if (!sid) return;
  stopStorm();
  cyc = await (await fetch(`/api/v1/cyclones/${sid}`)).json();
  [cycLayer, trailLayer, stormMarker].forEach(l => l && l.remove());
  cycTrack = cyc.points;
  const ll = cycTrack.map(p => [p.lat, p.lon]);
  const extra = [L.polyline(ll, { pane: "track", color: "#ffffff", weight: 2, opacity: 0.35, dashArray: "4 6", interactive: false })];
  if (cyc.landfall_lat != null) extra.push(L.circleMarker([cyc.landfall_lat, cyc.landfall_lon],
    { pane: "track", radius: 7, color: "#ffffff", weight: 2.5, fillColor: "#f2a90f", fillOpacity: 1, className: "lf-dot" })
    .bindTooltip(`⚑ ${t().hitCoast} · ${dateFmt(cyc.landfall_time)}`, { permanent: true, direction: "left", className: "lf-tip", offset: [-8, 0] }));
  cycLayer = L.layerGroup(extra).addTo(map);
  trailLayer = L.layerGroup().addTo(map);
  stormMarker = L.marker(ll[0], { pane: "track", interactive: false, icon: stormIcon(cycTrack[0].wind_kt) }).addTo(map);
  safeFit(L.latLngBounds(ll).extend(BD_BOUNDS), { paddingTopLeft: [innerWidth > 900 ? 380 : 20, 20], paddingBottomRight: [80, 140] });
  $("pb-range").max = cycTrack.length - 1;
  renderPbDays();
  setStormTime(0);
  restyle();
  setTimeout(() => { if (view === "cyc" && cyc?.sid === sid) playStorm(); }, 500);
}

function stormIcon(kt) {
  const size = 26 + Math.max(0, catIdx(kt)) * 5, c = IMD_COLOR(kt);
  return L.divIcon({ className: "storm-icon", iconSize: [size, size], iconAnchor: [size / 2, size / 2],
    html: `<svg viewBox="0 0 40 40" width="${size}" height="${size}"><g class="spin" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round">
      <path d="M20 20 C 20 8, 34 6, 36 14"/><path d="M20 20 C 32 20, 34 34, 26 36"/><path d="M20 20 C 20 32, 6 34, 4 26"/><path d="M20 20 C 8 20, 6 6, 14 4"/></g>
      <circle cx="20" cy="20" r="5" fill="${c}" stroke="#fff" stroke-width="2"/></svg>` });
}

function setStormTime(i) {
  pbIdx = +i;
  const p = cycTrack[pbIdx], tt = t();
  $("pb-range").value = pbIdx;
  stormMarker.setLatLng([p.lat, p.lon]).setIcon(stormIcon(p.wind_kt));
  trailLayer.clearLayers();
  for (let k = 1; k <= pbIdx; k++)
    trailLayer.addLayer(L.polyline([[cycTrack[k - 1].lat, cycTrack[k - 1].lon], [cycTrack[k].lat, cycTrack[k].lon]],
      { pane: "track", color: IMD_COLOR(cycTrack[k].wind_kt ?? cycTrack[k - 1].wind_kt), weight: 5, opacity: 0.95, lineCap: "round", interactive: false }));
  $("pb-time").textContent = new Date(p.time).toLocaleString(loc(), { timeZone: "Asia/Dhaka", day: "numeric", month: "short", hour: "numeric" });
  $("pb-cat").textContent = catName(p.wind_kt) || "";
  $("pb-cat").style.background = IMD_COLOR(p.wind_kt);
  $("pb-cat").hidden = p.wind_kt == null;
  $("pb-wind").textContent = p.wind_kt != null ? `${nf(kmh(p.wind_kt))} ${tt.kmh}` : "";
}

function renderPbDays() {
  const n = cycTrack.length - 1, out = [];
  let last = "", lastPos = -100;
  const minGap = innerWidth < 760 ? 18 : 9;  // % of the bar between labels, so dates never overlap
  cycTrack.forEach((p, i) => {
    const d = new Date(p.time).toLocaleDateString(loc(), { timeZone: "Asia/Dhaka", day: "numeric", month: "short" });
    const pos = n ? (i / n) * 100 : 0;
    if (d !== last && pos - lastPos >= minGap) { out.push(`<span style="left:${pos}%">${d}</span>`); lastPos = pos; }
    last = d;
  });
  $("pb-days").innerHTML = out.join("");
}

function playStorm() {
  if (playTimer) { stopStorm(); return; }
  if (pbIdx >= cycTrack.length - 1) setStormTime(0);
  $("cyc-play").textContent = "❚❚";
  playTimer = setInterval(() => {
    if (pbIdx >= cycTrack.length - 1) { stopStorm(); return; }
    setStormTime(pbIdx + 1);
  }, Math.max(90, Math.min(260, 9000 / cycTrack.length)));
}
function stopStorm() { clearInterval(playTimer); playTimer = null; if ($("cyc-play")) $("cyc-play").textContent = "▶"; }

function applyHindcast() {
  data.features.forEach(f => Object.assign(f.properties, hind.upazilas[f.properties.id] || {}));
}

async function selectDay() {
  const day = $("day").value;
  const live = !day || day >= new Date().toISOString().slice(0, 10);
  $("day-clear").hidden = live;
  if (live) { hind = null; $("day").value = ""; await load(); return; }
  $("map-loading").hidden = false;
  $("map-loading").lastElementChild.textContent = t().runningModel;
  try {
    const res = await fetch(`/api/v1/hindcast?day=${day}`);
    if (!res.ok) { alert((await res.json()).detail); return; }
    hind = await res.json();
    applyHindcast();
    if (view !== "risk") setView("risk"); else restyle();
    openDrawer();
  } finally { $("map-loading").hidden = true; }
}

/* ---------- drawer ---------- */
const openDrawer = () => { document.body.classList.add("drawer-open"); $("r-panel").classList.add("on"); };
const closeDrawer = () => { document.body.classList.remove("drawer-open"); $("r-panel").classList.remove("on"); };

function counts() {
  const c = { high: 0, medium: 0, low: 0 };
  data.features.forEach(f => { const r = riskOf(f.properties.flood_prob); if (r) c[r]++; });
  return c;
}

function renderCycStatus(el, tt) {
  el.className = "panel status storm";
  if (!cyc) { el.innerHTML = `<p class="note">${tt.loading}</p>`; return; }
  const peak = cycTrack.reduce((a, p) => (p.wind_kt ?? -1) > (a?.wind_kt ?? -1) ? p : a, null);
  const when = iso => new Date(iso).toLocaleString(loc(), { timeZone: "Asia/Dhaka", day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit" });
  const place = cyc.landfall_place ? tt.nearPlace(cyc.landfall_place.upazila, cyc.landfall_place.district) : tt.outsideBd;
  const n50 = Object.values(cyc.upazilas).filter(e => e.min_km <= 50).length;
  const steps = [[tt.stFormed, cycTrack[0].time]];
  if (peak && peak.wind_kt != null) steps.push([`${tt.stPeak} · ${nf(kmh(peak.wind_kt))} ${tt.kmh}`, peak.time]);
  if (cyc.landfall_time) steps.push([`${tt.stLand} · ${place}`, cyc.landfall_time]);
  steps.push([tt.stEnd, cycTrack[cycTrack.length - 1].time]);
  steps.sort((a, b) => a[1].localeCompare(b[1]));
  el.innerHTML = `<div class="storm-head" style="--c:${IMD_COLOR(cyc.max_wind_kt)}">
      <span class="storm-emoji">🌀</span>
      <div><div class="headline">${cyc.name === "Unnamed" ? (FAMOUS.find(f => f.find(cyc))?.label[lang] || "—") : cyc.name}</div>
      <div class="period">${cyc.season}</div></div>
      ${cyc.max_wind_kt ? `<span class="cat-badge" style="background:${IMD_COLOR(cyc.max_wind_kt)}">${catName(cyc.max_wind_kt)}</span>` : ""}
    </div>
    <div class="storm-facts">
      <div><small>${tt.peakWind}</small><b>${cyc.max_wind_kt ? `${nf(kmh(cyc.max_wind_kt))} <i>${tt.kmh}</i>` : "–"}</b></div>
      <div><small>${tt.hitCoast}</small><b class="sm">${cyc.landfall_time ? `${when(cyc.landfall_time)}<br><span>${place}</span>` : tt.noLandfall}</b></div>
    </div>
    ${cyc.max_wind_kt ? "" : `<p class="note">${tt.noWindRec}</p>`}
    <p class="note">${n50 ? tt.affected(nf(n50)) : tt.cycFar(nf(cyc.closest_bd_km))}</p>
    <ol class="storm-steps">${steps.map(([s2, iso]) => `<li><b>${s2}</b><span>${when(iso)}</span></li>`).join("")}</ol>
    <button class="btn primary block" id="replay">▶ ${tt.playStorm}</button>
    <details class="more"><summary>${tt.howToRead}</summary>${tt.readTrack}<br>${tt.readArea}<br><br>${tt.dataNote}
      ${cyc.provisional ? `<br>${tt.cycProvisional}` : ""}</details>`;
  $("replay").onclick = () => { stopStorm(); setStormTime(0); playStorm(); };
}

function renderStatus() {
  const el = $("status"), tt = t(), r = data.flood_forecast_run, c = counts();
  if (view === "cyc") { renderCycStatus(el, tt); return; }
  el.className = `panel status ${c.high ? "high" : c.medium ? "medium" : "low"}`;
  if (!r && !hind) { el.innerHTML = `<div class="eyebrow">${tt.statusEyebrow}</div><p class="note">${tt.noForecast}</p>`; return; }
  let extra;
  if (hind) {
    const obs = Object.values(hind.upazilas).filter(v => v.observed_frac != null && v.observed_frac >= 0.05);
    const hit = obs.filter(v => v.flood_risk !== "low").length;
    extra = `<p class="note">${hind.observed_event ? tt.observed(hind.observed_event.name, hit, obs.length) : tt.noObserved}</p>
      <p class="note">${tt.hindNote}</p>`;
  } else {
    const m = r.metrics || {}, b = r.baseline || {};
    extra = `<p class="note">${tt.whatMeans}</p>
      <details class="more"><summary>${tt.modelDetails}</summary><div class="skill">${tt.skill(m.auc ?? "–", b.auc ?? "–")}</div>${r.model_version}<br>GFS run #${r.rain_run_id} · ERA5-Land → ${r.era5_last_day}</details>`;
  }
  el.innerHTML = `<div class="eyebrow">${hind ? tt.statusEyebrowPast : tt.statusEyebrow}</div>
    <div class="headline">${c.high + c.medium ? tt.headlineSome(c.high, c.medium) : tt.headlineNone}</div>
    <div class="period">${hind ? dateFmt(hind.day) : tt.period(dateLong(r.reference_day), dateLong(r.valid_until, true))}</div>
    <div class="counts"><div class="h"><b>${nf(c.high)}</b><small>${tt.high}</small></div>
      <div class="m"><b>${nf(c.medium)}</b><small>${tt.medium}</small></div>
      <div class="l"><b>${nf(c.low)}</b><small>${tt.low}</small></div></div>${extra}`;
}

function renderTop() {
  const tt = t();
  $("top-title").textContent = view === "cyc" ? tt.cycTop : view === "past" ? tt.topPast : view === "rain"
    ? (lead === "rain_past_72h_mm" ? tt.topRainPast : tt.topRain) : tt.topRisk;
  const rows = [...data.features].filter(f => sortKey(f.properties) > 0 || view === "risk")
    .sort((a, b) => sortKey(b.properties) - sortKey(a.properties)).slice(0, 10);
  const max = Math.max(1e-9, ...rows.map(f => sortKey(f.properties)));
  $("top").innerHTML = rows.map(f => {
    const p = f.properties, fill = fillFor(p);
    return `<li data-id="${p.id}"><span class="nm">${p.name} <small>${p.district ?? ""}</small></span>
      <span class="val">${valueFor(p)}</span>
      <span class="bar"><span style="width:${(sortKey(p) / max) * 100}%;background:${fill === "rgba(0,0,0,0)" ? "#9aa5ae" : fill}"></span></span></li>`;
  }).join("") || `<li class="empty">–</li>`;
  document.querySelectorAll("#top li[data-id]").forEach(li => li.onclick = () => select(li.dataset.id, true));
}

function renderSide() {
  if (!data) return;
  renderStatus();
  renderTop();
  if (selected) renderDetail();
  $("drawer-title").textContent = selected ? t().detailTitle : t().overviewTitle;
}

/* ---------- selected upazila ---------- */
function select(id, zoom = false) {
  const f = data.features.find(x => x.properties.id === id);
  if (!f) return;
  selected = f.properties;
  highlight(id);
  if (zoom) safeFit(L.geoJSON(f).getBounds(), { maxZoom: 10, padding: [60, 60] });
  $("overview").hidden = true;
  $("detail").hidden = false;
  $("report-link").href = `/upazila/${slugify(selected.district)}/${slugify(selected.name)}`;
  $("drawer-title").textContent = t().detailTitle;
  openDrawer();
  $("side").querySelector(".drawer-body").scrollTop = 0;
  renderDetail();
  renderStrip();
  loadRain(id);
  showUpstream(id);
  showHospitals(id);
  showCycloneHistory(id);
}

function closeDetail() {
  selected = null;
  if (selectedLayer) layer.resetStyle(selectedLayer);
  selectedLayer = null;
  [hiLayer, hospLayer].forEach(l => l && l.remove());
  $("detail").hidden = true;
  $("overview").hidden = false;
  $("strip").hidden = true;
  $("drawer-title").textContent = t().overviewTitle;
}

function renderStrip() {
  const p = selected, tt = t(), r = riskOf(p.flood_prob);
  $("strip").hidden = false;
  $("s-name").textContent = p.name;
  $("s-where").textContent = [p.district, p.division].filter(Boolean).join(" · ");
  $("s-risk").innerHTML = (r ? `<span class="dot" style="background:${RISK[r]}"></span>${tt.riskOf[r]} · ${nf(p.flood_prob * 100)}%` : "")
    + (p.rain_72h_mm != null ? ` <span style="opacity:.7">· ${tt.stripRain(`${nf(p.rain_72h_mm, 1)} ${tt.mm}`)}</span>` : "");
}

// Met Department (BMD) words for rain in 24 hours: light 1-10 mm, moderate 11-22, moderately heavy 23-43, heavy 44-88, very heavy 89+
const rainClass = mm => mm == null || mm < 1 ? 0 : mm <= 10 ? 1 : mm <= 22 ? 2 : mm <= 43 ? 3 : mm <= 88 ? 4 : 5;
const RISK_ICON = {
  low: '<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  medium: '<path d="M12 3l9 16H3z"/><path d="M12 10v4M12 17h.01"/>',
  high: '<path d="M3 15c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M3 19c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M12 3v7M12 12h.01"/>',
};
function countTo(el, to, fmt, ms = 900) {
  const t0 = performance.now();
  const stepFn = now => { const k = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - k, 3); el.textContent = fmt(to * e); if (k < 1) requestAnimationFrame(stepFn); };
  requestAnimationFrame(stepFn);
}
function renderDetail() {
  const p = selected, tt = t();
  $("d-name").textContent = p.name;
  $("d-where").textContent = [p.district, p.division].filter(Boolean).join(" · ");
  const r = riskOf(p.flood_prob), box = $("d-risk");
  if (!r) { box.className = "risk-card"; box.innerHTML = `<p>${tt.noForecast}</p>`; }
  else {
    const pct = Math.round(p.flood_prob * 100);
    box.className = `risk-card ${r}`;
    box.innerHTML = `<div class="risk-top"><span class="risk-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${RISK_ICON[r]}</svg></span>
        <div><span class="lvl">${tt.riskOf[r]}</span><div class="prob"><span class="num">0</span>% <small>${tt.chance}</small></div></div></div>
      <p class="say">${tt.riskSay[r]}</p>
      <div class="meter"><span style="width:0;background:var(--${r === "medium" ? "med" : r})"></span><i style="left:25%"></i><i style="left:50%"></i></div>
      ${p.flood_frac != null ? `<p>${tt.likelyRange(nf(p.flood_frac * 100), nf((p.frac_p10 ?? p.flood_frac) * 100), nf((p.frac_p90 ?? p.flood_frac) * 100))}</p>` : ""}
      <p>${tt.riskLimit}</p>
      ${hind ? `<p>${dateFmt(hind.day)}${p.observed_frac != null ? ` · Sentinel-1: ${nf(p.observed_frac * 100, 1)}% ${tt.flooded}` : ""}</p>` : ""}`;
    countTo(box.querySelector(".num"), pct, v => nf(Math.round(v)));
    requestAnimationFrame(() => requestAnimationFrame(() => { box.querySelector(".meter span").style.width = `${Math.max(2, pct)}%`; }));
  }
  // rain tiles: millimetres, plus the Met Department's word for the next 24 hours
  const v = (id, x) => { const el = $(id); el.innerHTML = x == null ? "–" : `<b>0</b><em>${tt.mm}</em>`; if (x != null) countTo(el.querySelector("b"), x, y => nf(y, 1)); };
  v("d-past", p.rain_past_72h_mm); v("d-24", p.rain_24h_mm); v("d-72", p.rain_72h_mm);
  let rc = $("d-rcls");
  if (!rc) { rc = document.createElement("div"); rc.id = "d-rcls"; $("d-24").closest(".tiles").after(rc); }
  const k = rainClass(p.rain_24h_mm);
  rc.className = `rain-cls lv${k}`;
  rc.title = tt.rainClsNote;
  rc.innerHTML = p.rain_24h_mm == null ? "" :
    `<span class="drops">${[1, 2, 3, 4, 5].map(i => `<i class="${i <= k ? "on" : ""}"></i>`).join("")}</span><b>${tt.rainClasses[k]}</b><small>${tt.nextDays}</small>`;
}

async function loadOutlook(id) {
  const box = $("d-outlook"), bn = lang === "bn";
  box.innerHTML = "";
  $("outlook-panel").hidden = true;
  const res = await fetch(`/api/v1/nodes/${id}/outlook`);
  if (!res.ok || selected?.id !== id) return;
  const rows = (await res.json()).filter(r => r.heat || r.wave_m != null);
  if (!rows.length) return;
  $("outlook-title").textContent = bn ? "গরম ও সাগর" : "Heat and sea";
  $("outlook-panel").hidden = false;
  box.innerHTML = rows.map(r =>
    `<li>${new Date(r.day).toLocaleDateString(loc(), { day: "numeric", month: "short" })}: ` +
    [r.heat ? `${nf(r.tmax_c)}° (${r.heat[bn ? 0 : 1]})` : "",
     r.wave_m != null ? (bn ? `ঢেউ ${nf(r.wave_m, 1)} মি, বাতাস ${nf(r.wind_kmh)} কিমি/ঘণ্টা` : `waves ${nf(r.wave_m, 1)} m, wind ${nf(r.wind_kmh)} km/h`) : ""]
      .filter(Boolean).join(" · ") + `</li>`).join("");
}

async function loadRain(id) {
  loadOutlook(id);
  const res = await fetch(`/api/v1/nodes/${id}/rain`);
  if (res.ok && selected?.id === id) drawChart((await res.json()).hourly);
}

// Daily totals on Dhaka days, 3 days back to 3 ahead: hourly bars over 13 days were too thin to read.
function drawChart(h) {
  const c = $("chart"), ctx = c.getContext("2d"), H = 150, bn = lang === "bn";
  c.width = c.clientWidth * devicePixelRatio; c.height = H * devicePixelRatio;
  ctx.scale(devicePixelRatio, devicePixelRatio);
  const DHAKA = 6 * 3600e3, DAY = 864e5, now = Date.now(), today = Math.floor((now + DHAKA) / DAY);
  const days = new Map();
  h.precipitation.forEach((v, i) => {
    const ts = Date.parse(h.time[i] + "Z"), key = Math.floor((ts + DHAKA) / DAY);
    const d = days.get(key) || { past: 0, next: 0, hours: 0 };
    d[ts < now ? "past" : "next"] += v ?? 0; d.hours += 1;
    days.set(key, d);
  });
  const rows = [...days].filter(([k, d]) => Math.abs(k - today) <= 3 && d.hours === 24).sort((x, y) => x[0] - y[0]);
  const w = c.clientWidth, padT = 34, padB = 34, plot = H - padT - padB;
  ctx.clearRect(0, 0, w, H);
  if (!rows.length) return;
  const max = Math.max(1, ...rows.map(([, d]) => d.past + d.next)), slot = w / rows.length, bw = Math.min(34, slot * 0.62);
  ctx.textAlign = "center";
  ctx.strokeStyle = css("--line");
  ctx.beginPath(); ctx.moveTo(0, H - padB); ctx.lineTo(w, H - padB); ctx.stroke();
  rows.forEach(([k, d], i) => {
    const x = slot * i + slot / 2, total = d.past + d.next, hp = d.past / max * plot, hn = d.next / max * plot;
    ctx.fillStyle = "#9aa5ae"; ctx.fillRect(x - bw / 2, H - padB - hp, bw, hp);
    ctx.fillStyle = css("--rain"); ctx.fillRect(x - bw / 2, H - padB - hp - hn, bw, hn);
    ctx.fillStyle = css("--text"); ctx.font = "600 12px Inter, sans-serif";
    ctx.fillText(nf(total, total < 10 ? 1 : 0), x, H - padB - hp - hn - 6);
    ctx.fillStyle = k === today ? css("--text") : css("--muted");
    ctx.font = `${k === today ? "600 " : ""}11px Inter, sans-serif`;
    const date = new Date(k * DAY).toLocaleDateString(loc(), { day: "numeric", month: "short", timeZone: "UTC" });
    ctx.fillText(k === today ? (bn ? "আজ" : "Today") : date, x, H - padB + 15);
    if (k === today) ctx.fillText(date, x, H - padB + 29);
  });
  ctx.textAlign = "right"; ctx.fillStyle = css("--muted"); ctx.font = "11px Inter, sans-serif";
  ctx.fillText(bn ? "মিমি/দিন" : "mm/day", w, 11);
  ctx.textAlign = "left";
}

// rough area of an upazila in km² (fine at this size: plane geometry with the latitude correction)
function areaKm2(g) {
  if (!g) return 0;
  const polys = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
  let a = 0;
  polys.forEach(pl => pl.forEach((ring, ri) => {
    let s = 0;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) s += (ring[j][0] - ring[i][0]) * (ring[j][1] + ring[i][1]);
    const lat = ring[0][1] * Math.PI / 180, km2 = Math.abs(s / 2) * 111.32 * Math.cos(lat) * 110.57;
    a += ri === 0 ? km2 : -km2;
  }));
  return a;
}
async function showUpstream(id) {
  const res = await fetch(`/api/v1/nodes/${id}/upstream`), tt = t();
  if (!res.ok || selected?.id !== id) return;
  const u = await res.json();
  const pct = u.catchment_km2 ? Math.round(100 * u.outside_bd_km2 / u.catchment_km2) : 0;
  const own = areaKm2(data.features.find(f => f.properties.id === id)?.geometry);
  const times = own > 0 && u.catchment_km2 / own >= 1.5 ? nf(Math.round(u.catchment_km2 / own)) : null;
  $("d-up").innerHTML = `<p class="say-sm">${tt.upSay(nf(u.catchment_km2), times)}</p>
    <div class="split"><span class="in" style="width:${100 - pct}%"></span><span class="out" style="width:${pct}%"></span></div>
    <div class="split-key"><span><i class="in"></i>${tt.inside} ${nf(100 - pct)}%</span><span><i class="out"></i>${tt.outside} ${nf(pct)}%</span></div>
    <p class="say-sm">${tt.upOutSay(pct, nf(pct))}</p>
    ${u.rain_72h_mm == null ? "" : `<p class="say-sm">${tt.upRainSay(`${nf(u.rain_72h_mm, 1)} ${tt.mm}`)}</p>`}`;
  if (hiLayer) hiLayer.remove();
  if (!basinData) basinData = await (await fetch("/api/v1/basins")).json();
  const ids = new Set(u.basins);
  hiLayer = L.geoJSON({ type: "FeatureCollection", features: basinData.features.filter(f => ids.has(f.properties.id)) },
    { style: { color: "#f2a90f", weight: 1.2, dashArray: "4 3", fillColor: "#f2a90f", fillOpacity: 0.06 }, interactive: false }).addTo(map);
  hiLayer.bringToBack();
}

async function showCycloneHistory(id) {
  const res = await fetch(`/api/v1/nodes/${id}/cyclones`), tt = t();
  if (!res.ok || selected?.id !== id) return;
  const r = await res.json();
  $("cyc-panel").hidden = !r.within_150km;
  if (!r.within_150km) return;
  const strong = r.cyclones.filter(c => c.max_wind_kt && c.min_km <= 100)
    .sort((a, b) => b.max_wind_kt - a.max_wind_kt).slice(0, 3);
  const CK = [17, 28, 34, 48, 64, 90, 120], CC = ["#7fd0a8", "#3fb6a8", "#f2d43a", "#f39a2b", "#e8562c", "#c41d4a", "#7b1fa2"];
  const ci = kt => CK.filter(k => kt >= k).length - 1;
  const yr = y => lang === "bn" ? String(y).replace(/\d/g, x => "০১২৩৪৫৬৭৮৯"[x]) : y;
  $("d-cyc").innerHTML = `<p class="say-sm">${tt.cycSay(nf(r.within_50km), nf(r.within_150km))}</p>` + (strong.length
    ? `<p class="mini-h">${tt.cycStrongest}</p><ul class="cyc-mini">${strong.map(c => `<li style="--c:${CC[ci(c.max_wind_kt)] || "#9aa5ae"}">
        <span class="spin" aria-hidden="true"><svg viewBox="0 0 40 40"><path d="M20 4c-6 0-10 3-12 7 4-3 9-3 12 0 3 3 3 8 0 11a8 8 0 0 1-3 2c6 1 13-3 14-10 0-6-5-10-11-10z" fill="currentColor"/><path d="M20 36c6 0 10-3 12-7-4 3-9 3-12 0-3-3-3-8 0-11a8 8 0 0 1 3-2c-6-1-13 3-14 10 0 6 5 10 11 10z" fill="currentColor" opacity=".75"/></svg></span>
        <div><b>${c.name === "Unnamed" ? yr(c.season) : `${c.name} ${yr(c.season)}`}</b><em>${tt.cats[ci(c.max_wind_kt)] || ""}</em>
        <span>${tt.kmAway(nf(c.min_km))} · ${nf(Math.round(c.max_wind_kt * 1.852))} ${tt.kmh}</span></div></li>`).join("")}</ul>`
    : "");
}

async function showHospitals(id) {
  if (hospLayer) hospLayer.remove();
  const res = await fetch(`/api/v1/nodes/${id}/hospitals`), tt = t();
  if (!res.ok || selected?.id !== id) return;
  const r = await res.json();
  // no verified record: the section stays hidden rather than implying there is no hospital
  $("hosp-panel").hidden = !r.hospitals.length;
  if (!r.hospitals.length) return;
  $("d-hosp").innerHTML = r.hospitals.map(h => `<li><b>${(lang === "bn" && h.name_bn) || h.name}</b>
    <span class="meta">${h.type}${h.beds ? ` · ${nf(h.beds)} ${tt.beds}` : ""}</span><br>
    <span class="hosp-act">${h.mobile ? `<a class="call" href="tel:${h.mobile}">📞 ${tt.call} ${h.mobile}</a>` : ""}<a href="${h.profile_url}" target="_blank" rel="noopener">${tt.profile} ↗</a></span></li>`).join("");
  $("hosp-note").textContent = tt.hospNote(r.fetched_at ? dateFmt(r.fetched_at) : "–");
  hospLayer = L.layerGroup(r.hospitals.map(h => L.marker([h.lat, h.lon], {
    icon: L.divIcon({ className: "hosp-pin", html: "🏥", iconSize: [26, 26], iconAnchor: [13, 13] }) })
    .bindTooltip(`<div class="tt-name">${(lang === "bn" && h.name_bn) || h.name}</div><div class="tt-sub">${h.type}</div>`))).addTo(map);
}

/* ---------- layers ---------- */
// Rivers: OpenStreetMap water areas (each river at its real width) and river lines, drawn in one blue together with
// the sea, so the Padma, Meghna and the delta channels run on into the Bay of Bengal. HydroRIVERS lines stop at
// Chandpur because HydroSHEDS counts the estuary below it as sea, so they are used only to place the river names.
let riverNames = null, riverData = null, waterLayer = null;
map.createPane("water").style.zIndex = 300;
map.getPane("water").style.pointerEvents = "none";
function waterStyle() {
  const blue = mapDark ? "#2f9df0" : "#3b8fd6";
  return { version: 8, sources: { osm: { type: "vector", url: "https://tiles.openfreemap.org/planet" } },
    layers: [
      { id: "water", type: "fill", source: "osm", "source-layer": "water",
        paint: { "fill-color": blue, "fill-opacity": ["match", ["get", "class"], "ocean", mapDark ? 0.32 : 0.25, mapDark ? 0.62 : 0.55] } },
      { id: "river-glow", type: "line", source: "osm", "source-layer": "waterway", filter: ["==", ["get", "class"], "river"],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#7fd3ff", "line-opacity": mapDark ? 0.25 : 0.2, "line-blur": 2,
          "line-width": ["interpolate", ["linear"], ["zoom"], 5, 2, 8, 5, 12, 9] } },
      { id: "river", type: "line", source: "osm", "source-layer": "waterway", filter: ["==", ["get", "class"], "river"],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": blue, "line-opacity": 0.95, "line-width": ["interpolate", ["linear"], ["zoom"], 5, 0.8, 8, 1.8, 12, 3.5] } },
      { id: "canal", type: "line", source: "osm", "source-layer": "waterway", minzoom: 9,
        filter: ["match", ["get", "class"], ["canal", "stream"], true, false],
        paint: { "line-color": blue, "line-opacity": 0.8, "line-width": ["interpolate", ["linear"], ["zoom"], 9, 0.5, 14, 2] } },
    ] };
}
function restyleRivers() {
  if (!waterLayer) return;
  const on = map.hasLayer(waterLayer);
  waterLayer.remove();
  waterLayer = L.maplibreGL({ style: waterStyle(), pane: "water", interactive: false,
    attribution: "Rivers © OpenStreetMap contributors (OpenFreeMap)" });
  if (on) waterLayer.addTo(map);
}
// the big rivers by name; each label snaps onto the nearest real river line big enough, or is left out
const RIVER_NAMES = [
  { en: "Padma", bn: "পদ্মা", at: [23.95, 89.35], up: 500000, r: 0.25 },
  { en: "Jamuna", bn: "যমুনা", at: [24.75, 89.72], up: 400000, r: 0.25 },
  { en: "Meghna", bn: "মেঘনা", at: [22.85, 90.7], up: 1000000, r: 0.3 },
  { en: "Meghna", bn: "মেঘনা", at: [24.0, 90.98], up: 30000, r: 0.2, minor: true },
  { en: "Old Brahmaputra", bn: "পুরাতন ব্রহ্মপুত্র", at: [24.75, 90.4], up: 2000, r: 0.12, minor: true },
  { en: "Teesta", bn: "তিস্তা", at: [25.85, 89.35], up: 10000, r: 0.15, minor: true },
  { en: "Surma", bn: "সুরমা", at: [24.9, 91.85], up: 5000, r: 0.12, minor: true },
  { en: "Kushiyara", bn: "কুশিয়ারা", at: [24.7, 91.95], up: 5000, r: 0.1, minor: true },
  { en: "Karnaphuli", bn: "কর্ণফুলী", at: [22.45, 92.0], up: 5000, r: 0.15, minor: true },
];
function placeRiverNames() {
  if (!riverData) return;
  riverNames && riverNames.remove();
  riverNames = L.layerGroup();
  RIVER_NAMES.forEach(n => {
    let best = n.r * n.r, pt = null;
    riverData.features.forEach(f => {
      if ((f.properties.upland_km2 || 0) < n.up) return;
      const lines = f.geometry.type === "MultiLineString" ? f.geometry.coordinates : [f.geometry.coordinates];
      lines.forEach(c => c.forEach(([x, y]) => { const d = (x - n.at[1]) ** 2 + (y - n.at[0]) ** 2; if (d < best) { best = d; pt = [y, x]; } }));
    });
    if (!pt) return;
    riverNames.addLayer(L.marker(pt, { pane: "labels", interactive: false, keyboard: false,
      icon: L.divIcon({ className: `river-name${n.minor ? " minor" : ""}`, iconSize: [140, 20], iconAnchor: [70, 10], html: `<span>${n[lang]}</span>` }) }));
  });
  riverNames.addTo(map);
}
async function toggleRivers() {
  if (!$("show-rivers").checked) { [waterLayer, riverNames].forEach(l => l && l.remove()); return; }
  if (!window.maplibregl || !L.maplibreGL) return;  // no WebGL library: the satellite still shows the rivers
  if (!waterLayer) {
    waterLayer = L.maplibreGL({ style: waterStyle(), pane: "water", interactive: false,
      attribution: "Rivers © OpenStreetMap contributors (OpenFreeMap)" });
  }
  waterLayer.addTo(map);
  if (!riverData) riverData = await (await fetch("/api/v1/rivers")).json().catch(() => null);
  placeRiverNames();
}

async function toggleBasins() {
  if (!$("show-basins").checked) {
    basinLayer && basinLayer.remove();
    maskLayer && maskLayer.setStyle({ fillOpacity: maskOpacity() });
    return;
  }
  if (!basinData) basinData = await (await fetch("/api/v1/basins")).json();
  if (!basinLayer) basinLayer = L.geoJSON(basinData, {
    style: f => ({ fillColor: step(f.properties.rain_72h_mm, TOTAL), weight: 0.4, color: "#8a96a3", fillOpacity: 0.55 }),
    onEachFeature: (f, l) => l.bindTooltip(() => `<div class="tt-name">${f.properties.name}</div><div class="tt-sub">${f.properties.region}</div>${t().next72}: <b>${f.properties.rain_72h_mm == null ? "–" : nf(f.properties.rain_72h_mm, 1) + " " + t().mm}</b>`, { sticky: true }),
  });
  basinLayer.addTo(map).bringToBack();
  maskLayer && maskLayer.setStyle({ fillOpacity: maskOpacity() });
  safeFit(basinLayer.getBounds());
}

/* ---------- search ---------- */
let hits = [], active = -1;
function search(q) {
  const box = $("search-results");
  q = q.trim().toLowerCase();
  if (!q || !data) { box.hidden = true; return; }
  hits = data.features.map(f => f.properties)
    .filter(p => p.name.toLowerCase().includes(q) || (p.district || "").toLowerCase().includes(q))
    .sort((a, b) => (b.name.toLowerCase().startsWith(q) - a.name.toLowerCase().startsWith(q)) || a.name.localeCompare(b.name))
    .slice(0, 8);
  active = -1;
  box.innerHTML = hits.length
    ? hits.map((p, i) => `<li role="option" data-i="${i}"><span>${p.name}</span><span class="tag">${p.district ?? ""}, ${p.division ?? ""}</span></li>`).join("")
    : `<li class="empty">${t().noResults}</li>`;
  box.hidden = false;
  box.querySelectorAll("li[data-i]").forEach(li => li.onmousedown = () => pick(+li.dataset.i));
}
function pick(i) {
  const p = hits[i];
  if (!p) return;
  $("search").value = p.name;
  $("search-results").hidden = true;
  select(p.id, true);
}
$("search").addEventListener("input", e => search(e.target.value));
$("search").addEventListener("blur", () => setTimeout(() => $("search-results").hidden = true, 150));
$("search").addEventListener("keydown", e => {
  const items = [...$("search-results").querySelectorAll("li[data-i]")];
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    e.preventDefault();
    active = (active + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
    items.forEach((li, i) => li.classList.toggle("active", i === active));
  } else if (e.key === "Enter") pick(active >= 0 ? active : 0);
  else if (e.key === "Escape") $("search-results").hidden = true;
});

/* ---------- language ---------- */
function applyLang() {
  const tt = t();
  document.body.classList.toggle("bn", lang === "bn");
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach(el => el.textContent = tt[el.dataset.i18n]);
  document.querySelectorAll("[data-i18n-ph]").forEach(el => el.placeholder = tt[el.dataset.i18nPh]);
  document.querySelectorAll("[data-i18n-title]").forEach(el => { el.title = tt[el.dataset.i18nTitle]; el.setAttribute("aria-label", el.title); });
  $("lang").textContent = lang === "en" ? "বাং" : "EN";
  if ($("event").firstElementChild) $("event").firstElementChild.textContent = tt.pastPick;
  renderScale();
  if (cycList.length) renderStormCards();
  if (cyc && cycTrack.length) setStormTime(pbIdx);
  if (data) { renderSide(); if (selected) renderStrip(); }
  if (riverNames && $("show-rivers").checked) placeRiverNames();
}

/* ---------- wiring ---------- */
document.querySelectorAll("#view button").forEach(b => b.onclick = () => setView(b.dataset.view));
document.querySelectorAll("#lead button").forEach(b => b.onclick = () => {
  document.querySelectorAll("#lead button").forEach(x => x.classList.toggle("on", x === b));
  lead = b.dataset.lead;
  restyle();
});
$("event").onchange = selectEvent;
$("cyclone").onchange = () => pickStorm($("cyclone").value);
$("cyc-play").onclick = playStorm;
$("pb-range").oninput = e => { stopStorm(); setStormTime(e.target.value); };
$("day").onchange = selectDay;
$("day").max = new Date().toISOString().slice(0, 10);
$("day-clear").onclick = () => { $("day").value = ""; selectDay(); };
$("division").onchange = () => load(true);
$("show-rivers").onchange = toggleRivers;
$("show-basins").onchange = toggleBasins;
$("detail-close").onclick = closeDetail;
$("strip-close").onclick = closeDetail;
$("drawer-close").onclick = closeDrawer;
$("r-panel").onclick = () => document.body.classList.contains("drawer-open") ? closeDrawer() : openDrawer();
$("r-home").onclick = fitBangladesh;
$("r-search").onclick = () => $("search").focus();
$("r-layers").onclick = () => { $("layers").hidden = !$("layers").hidden; $("r-layers").classList.toggle("on", !$("layers").hidden); };
$("r-theme").onclick = () => {
  mapDark = !mapDark;
  try { localStorage.setItem("fs-map", mapDark ? "dark" : "light"); } catch (e) {}
  setBasemap();
};
$("lang").onclick = () => {
  lang = lang === "en" ? "bn" : "en";
  try { localStorage.setItem("fs-lang", lang); } catch (e) {}
  applyLang();
};
document.addEventListener("keydown", e => {
  if (e.key !== "Escape") return;
  if (selected) closeDetail(); else closeDrawer();
});

(async () => {
  $("event").innerHTML = `<option value=""></option>`;
  setBasemap();
  applyLang();
  $("map-loading").hidden = false;
  const [divs, evs] = await Promise.all([
    fetch("/api/v1/divisions").then(r => r.json()),
    fetch("/api/v1/flood-events").then(r => r.json()),
  ]);
  divs.forEach(d => $("division").insertAdjacentHTML("beforeend", `<option value="${d.name}">${d.name}</option>`));
  // monsoon windows are training labels only; post-cyclone maps miss surge flooding in tidal areas
  events = evs.filter(e => !e.id.startsWith("auto_") && !e.id.startsWith("cyclone_"));
  events.forEach(e => $("event").insertAdjacentHTML("beforeend", `<option value="${e.id}">${e.name}</option>`));
  map.invalidateSize();
  fitBangladesh();
  drawCountry();
  await load();
  $("map-loading").hidden = true;
  toggleRivers();
  if (innerWidth > 1100) openDrawer();
})();
