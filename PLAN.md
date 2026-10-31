# 🌊 FloodShield BD — Production Build Plan

> **Graph-based flood early warning for Bangladesh.**
> Tells every upazila what is coming in the next 24–72 h, which hospitals, shelters, substations and roads are at risk, and what to do — in Bangla.

| | |
|---|---|
| **Competition** | International AI Builders Congress 2026 · Idea to Unicorn · Climate Shield |
| **Pitch day** | 26 December 2026 (3-minute pitch) |
| **Runs at** | `http://127.0.0.1:8000` — one real web app (UI + API on the same origin) |
| **First region** | Sylhet division (Sylhet, Sunamganj, Habiganj, Moulvibazar) |
| **Rule #1** | **No demo data, no mock values, no fake numbers.** Everything on screen comes from a real dataset, a real model run, or a real user action. |

---

## 0. The "everything real" contract

These rules apply to every line of code in this repo:

1. **No hard-coded or random forecast values.** If a model run has not happened, the UI says *"No forecast run yet"* — it never fills in a placeholder.
2. **Every number is traceable.** Each forecast row stores `run_id → input data versions → model version`. Any alert can be regenerated and audited.
3. **Metrics shown are measured.** The model card page reads metrics from the `model_versions` table, written by the evaluation script. Nothing is typed in by hand.
4. **Backtests use only data available at the time.** The 2022 Sylhet replay uses GFS *historical forecasts* (not reanalysis) as the forecast input.
5. **If the GNN does not beat the baselines, we ship the better model and say so.**
6. **Official warnings first.** Every page and alert links to FFWC/BMD and says this system supports, not replaces, them.

---

## 1. What the user gets

| # | Step | User does | System does |
|---|------|-----------|-------------|
| 1 | **Select area** | Picks district / upazila | Loads graph, latest run, asset layers |
| 2 | **See outlook** | Opens 72 h risk map | Flood probability per upazila at 24/48/72 h with P10–P90 |
| 3 | **Check assets** | Opens *Assets at risk* | Ranked hospitals, shelters, schools, substations, roads |
| 4 | **Simulate ripples** | "What if this road/substation fails?" | Recomputes road access and power-loss areas |
| 5 | **Understand why** | Clicks *Why this risk?* | Top 3 drivers in plain Bangla/English |
| 6 | **Act** | Sends / downloads alert | Template-based Bangla + English alert with action checklist |

---

## 2. Architecture (local production)

```
                 Browser  →  http://127.0.0.1:8000
                               │
┌──────────────────────────────▼──────────────────────────────┐
│  FastAPI (uvicorn, port 8000)                               │
│   /            → built frontend (Next.js static export)     │
│   /api/v1/*    → REST API  ·  /docs → OpenAPI               │
│   APScheduler  → forecast job every 6 h, ingest jobs        │
├─────────────────────────────────────────────────────────────┤
│  Intelligence                                               │
│   M3 FloodGraph-ST (PyG)  M4 ensemble+isotonic calibration  │
│   M5 impact + ripple (NetworkX)  M6 alerts  M7 explainer    │
├─────────────────────────────────────────────────────────────┤
│  Data pipeline                                              │
│   M1 ingest (Open-Meteo GFS, IMERG, ERA5-Land, CDS)         │
│   M2 graph builder (HDX ADM3, HydroRIVERS, HydroBASINS)     │
│   Labels: Sentinel-1 via Earth Engine − JRC permanent water │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL 16 + PostGIS  (local)   ·   data/ raw cache     │
└─────────────────────────────────────────────────────────────┘
```

**Why one server on :8000?** One process, one origin, no CORS, easy to move later to a VPS or a government data center unchanged (Docker-ready).

### 2.1 The hydrological graph

| Node | Role | Features |
|------|------|----------|
| **Upazila** | Prediction target | Rain history + forecast, soil moisture, elevation, slope, HAND, permanent-water share, population |
| **River reach** | Connector | Upstream catchment rain, length, slope, catchment area |
| **Upstream catchment** | Cross-border driver (Meghalaya, Assam, Tripura) | Basin-mean rain history + forecast |

| Edge | Direction |
|------|-----------|
| `drains_into` | catchment → reach |
| `flows_to` | reach → downstream reach |
| `floods` | reach → upazila it passes through |
| `adjacent_to` | upazila ↔ upazila (shared border) |

### 2.2 Model

- **FloodGraph-ST:** per-node GRU over 14-day sequence → 3 × HeteroConv(GATv2) → head predicting `P(>10% non-permanent area flooded)` and flooded fraction for 24/48/72 h.
- **Labels:** Sentinel-1 VV change detection (event vs. dry-season baseline), JRC permanent/seasonal water masked, HAND > 15 m removed.
- **Training:** monsoons 2017–2025, loss only on Sentinel-1 dates. Weighted BCE + MSE.
- **Event split:** test on 2022 Sylhet and 2024 Feni; never seen in training.
- **Baselines it must beat:** (1) rainfall threshold rule, (2) XGBoost no graph, (3) GNN without upstream catchments.
- **Uncertainty:** 5-seed ensemble → P10/P50/P90 → isotonic calibration on held-out season.

### 2.3 Alert levels

| Level | Rule (configurable) |
|-------|------|
| 🟡 Watch | P50 ≥ 30% |
| 🟠 Warning | P50 ≥ 60% |
| 🔴 Severe | P50 ≥ 60% **and** a critical facility affected |

Alert text = fixed templates filled from DB values only. No LLM, so no invented numbers.

---

## 3. Data sources (all real, all free)

| Need | Source | Access | Account? |
|------|--------|--------|----------|
| Forecast rain (live) | GFS via [Open-Meteo](https://open-meteo.com/en/docs/gfs-api) | HTTP API | No |
| Forecast rain (past, for backtest) | [Open-Meteo Historical Forecast](https://open-meteo.com/en/docs/historical-forecast-api) | HTTP API | No |
| Raw GFS (fallback) | [NOMADS](https://nomads.ncep.noaa.gov/) | HTTP | No |
| Observed rain | [GPM IMERG](https://developers.google.com/earth-engine/datasets/catalog/NASA_GPM_L3_IMERG_V07) | Earth Engine | **GEE** |
| Historical rain | [ERA5](https://cds.climate.copernicus.eu/datasets/reanalysis-era5-single-levels) | CDS API | **CDS** |
| Soil moisture | [ERA5-Land](https://cds.climate.copernicus.eu/datasets/reanalysis-era5-land) | CDS API | **CDS** |
| Flood labels | [Sentinel-1 GRD](https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_S1_GRD) | Earth Engine | **GEE** |
| Permanent water | [JRC GSW](https://developers.google.com/earth-engine/datasets/catalog/JRC_GSW1_4_GlobalSurfaceWater) | Earth Engine | **GEE** |
| DEM | [SRTM](https://developers.google.com/earth-engine/datasets/catalog/USGS_SRTMGL1_003) | Earth Engine | **GEE** |
| HAND | [MERIT Hydro](https://hydro.iis.u-tokyo.ac.jp/~yamadai/MERIT_Hydro/) | Download (registration form) | Form |
| Rivers / basins | [HydroRIVERS](https://www.hydrosheds.org/products/hydrorivers), [HydroBASINS](https://www.hydrosheds.org/products/hydrobasins) | Download | No |
| Upazila boundaries | [HDX COD-AB BGD](https://data.humdata.org/dataset/cod-ab-bgd) / [geoBoundaries](https://www.geoboundaries.org/) | Download | No |
| Roads, schools, substations, shelters | [Geofabrik BD](https://download.geofabrik.de/asia/bangladesh.html), [Overpass](https://overpass-turbo.eu/) | Download | No |
| Health facilities | [healthsites.io](https://healthsites.io/) + OSM | API/Download | API key (free) |
| Population | [WorldPop](https://hub.worldpop.org/geodata/listing?id=29) | Download | No |
| Validation | [FFWC](http://www.ffwc.gov.bd/), [ReliefWeb](https://reliefweb.int/country/bgd) | Web | No |
| Backup imagery | [Planetary Computer](https://planetarycomputer.microsoft.com/catalog), [Copernicus Browser](https://browser.dataspace.copernicus.eu/) | API/Web | Optional |

### 🔑 Accounts you must create (you do these, I cannot)

| # | Account | Why | Time |
|---|---------|-----|------|
| 1 | **Google Earth Engine** (noncommercial project) | Sentinel-1, IMERG, JRC, SRTM | ⚠ up to 1 day — **do first** |
| 2 | **Copernicus CDS** + accept ERA5 & ERA5-Land licences | ERA5 / soil moisture | 10 min |
| 3 | **MERIT Hydro** registration form | HAND raster | 1–2 days for reply |
| 4 | **healthsites.io** API key | Health facilities | 5 min |
| 5 | **Telegram BotFather** bot | Real alert delivery | 5 min |

Keys go in `.env` (never committed). `.env.example` lists every variable.

---

## 4. Tech stack

| Layer | Choice |
|-------|--------|
| Frontend | Next.js 14 (static export), TypeScript, Tailwind, shadcn/ui, Leaflet, Recharts, next-intl (বাংলা / English) |
| Backend | FastAPI, Pydantic v2, SQLAlchemy 2 + GeoAlchemy2, APScheduler, uvicorn on **:8000** |
| ML | PyTorch (CPU inference), PyTorch Geometric, XGBoost, scikit-learn |
| Geo | GeoPandas, rasterio, xarray, earthengine-api, cdsapi |
| Networks | NetworkX (roads, Voronoi power areas) |
| DB | PostgreSQL 16 + PostGIS 3 (local install or Docker) |
| Alerts | Telegram Bot API |
| Quality | pytest, ruff, mypy, Alembic migrations, GitHub Actions CI |
| Python | **3.11** venv (PyTorch Geometric does not yet support the system's 3.14) |

---

## 5. Database (PostGIS)

`organizations`, `memberships`, `users`, `regions`, `nodes`, `edges`, `model_versions`, `forecast_runs`, `node_forecasts`, `assets`, `asset_impacts`, `alerts`, `subscriptions`, `observations`, `alert_outcomes`, `ingest_log`.
Partner tables carry `org_id`; access is enforced in the API layer. Schema is managed by Alembic.

## 6. API (`/api/v1`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/regions/{id}/forecast?lead=48` | GeoJSON, p10/p50/p90 per upazila |
| GET | `/nodes/{id}/forecast` | All lead times + top drivers |
| GET | `/regions/{id}/assets/at-risk` | Ranked assets |
| POST | `/simulate/ripple` | Fail roads/substations → lost access/power |
| GET | `/alerts` | Bangla + English alerts |
| POST | `/subscriptions` | Telegram subscription |
| POST/GET | `/portfolio/upload`, `/portfolio/exposure` | Partner CSV assets |
| GET | `/backtests/{event}` | sylhet-2022, feni-2024 replays |
| GET | `/model-card` | Measured metrics + limitations |
| POST | `/observations` | Ground-truth reports |
| POST | `/auth/login`, `/auth/register` | JWT auth with roles |
| GET | `/health` | Liveness |

---

## 7. Repository layout

```
floodshield-bd/
├── backend/          FastAPI app (api/, core/, services/M1–M8, db/, templates/alerts/)
├── frontend/         Next.js app → `npm run build` → backend serves frontend/out
├── ml/               gee/ exports, features.py, train.py, baselines.py, backtest.py, eval/
├── database/         Alembic migrations
├── data/             raw/ processed/ (git-ignored; reproducible by scripts)
├── scripts/          setup + one-shot data download scripts
├── tests/
├── .github/workflows/ci.yml
├── PLAN.md  README.md  MODEL_CARD.md  DATA_LICENSES.md  .env.example
```

---

## 8. Build phases

| Phase | Goal | Done when |
|-------|------|-----------|
| **P0 Setup** | Repo, Python 3.11 venv, PostGIS, accounts | `GET /health` → ok on :8000; GEE + CDS auth succeed |
| **P1 Static data** | Boundaries, rivers, basins, DEM/HAND, OSM, WorldPop | Sylhet graph built & stored (`nodes`, `edges`) |
| **P2 Live ingest** | Open-Meteo GFS + IMERG every 6 h | `ingest_log` shows real pulls; rain map renders |
| **P3 Labels & features** | Sentinel-1 flood fractions 2017–2025, ERA5-Land | `observations` table filled from GEE |
| **P4 Models** | Threshold, XGBoost, FloodGraph-ST, ensemble, calibration | Metrics saved to `model_versions`; best model selected automatically |
| **P5 Impact** | Asset exposure, road access, power areas, shelters | `/assets/at-risk` and `/simulate/ripple` return real results |
| **P6 Alerts** | Bangla/English templates, Telegram delivery | Real message received in Telegram |
| **P7 Web app** | Map, assets, simulator, alerts, backtest, model card, auth | All pages work at `127.0.0.1:8000` with real data |
| **P8 Hardening** | Tests, CI, logging, rate limits, Docker | CI green; `docker run` serves same app |

### Evaluation (reported as measured, never invented)

POD · FAR · CSI · PR-AUC · Brier · ECE · median lead time · per-district & haor/non-haor fairness · ablations (no upstream, no river edges) · 100% numeric match of alert text vs. DB.

---

## 9. Responsible AI

| Risk | Safeguard |
|------|-----------|
| Over-reliance | FFWC/BMD banner on every page and alert |
| Missed floods | Detection-favouring thresholds; misses logged publicly |
| False alarms | Calibration, levels, post-event scoring |
| OSM gaps | Coverage gaps shown; partners can add facilities |
| Privacy | Only chat ID + area stored for subscriptions |
| Opacity | Model card, drivers per forecast, reproducible runs |

## 10. Risks

| Risk | Mitigation |
|------|-----------|
| GEE approval delay | Register today; Planetary Computer fallback |
| Few labelled events | Use every S1 date 2017–2025; FFWC danger-level weak labels |
| Noisy SAR labels | JRC mask, baseline subtraction, HAND filter |
| GNN ≤ baseline | Ship the better model, report honestly |
| No Docker on this PC | Run PostGIS natively (PostgreSQL installer + Stack Builder) or install Docker Desktop |
