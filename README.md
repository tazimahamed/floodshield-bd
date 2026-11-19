# FloodShield BD

Flood early warning for every upazila in Bangladesh: a 15-day flood risk with the reasons behind it, where water
stands in the monsoon, what the satellite sees today, hour-by-hour rain, cyclones, landslides and heat, government
hospitals, on a web map and in a Bangla/English Telegram bot.

**Live:** https://floodshieldbd.duckdns.org · **Bot:** [@DurjogBartaBangladesh_bot](https://t.me/DurjogBartaBangladesh_bot)

No demo or mock data: every number on screen comes from a real dataset or a real model run, and says where it came
from. This is supporting information, not an official warning. FFWC, the Bangladesh Meteorological Department and
the upazila administration come first.

## What it does

- **Flood risk map** for 544 map areas (the 483 official upazilas whose boundaries the map has, and 61 metropolitan
  thanas; the government lists 502 upazilas, and 19 newer ones lie inside older boundaries): the chance that unusual
  water covers at least 5% of the area in the next 15 days (low / medium / high), with a likely range. Refreshed every
  6 hours. Official Bangla names from bangladesh.gov.bd.
- **"Why this risk?"**: the 3 inputs that moved the model most for each upazila (TreeSHAP values from LightGBM itself,
  checked to add up to each model's score), in plain words, with the numbers behind them.
- **Flood map poster** for every upazila (`/map/<id>`), downloadable as a picture: in how many monsoons (2017–2025)
  each ~60 m square had water standing on the land, from our own Sentinel-1 analysis (permanent water and hill slopes
  left out); main-road stretches that went under in 3+ monsoons; land that never did; the area's shares; government
  hospitals with a call button and Google Maps directions.
- **Water now**: unusual water on the latest Sentinel-1 radar pictures (last 12 days), daily, with the date of the
  picture and an estimate of the people living on that land (WorldPop 2020).
- **Landslide chance** in hilly upazilas from NASA's LHASA nowcast, daily (probability only; NASA defines no levels).
- **Stale-data warnings**: an old forecast is never shown as today's; the site says when it was last made.
- **Rain**: last 3 days and next 3 days, hour by hour (NOAA GFS), described with the Met Department's 24-hour rain words.
- **Upazila report**: a 3D map (satellite or street map, OpenStreetMap roads, rivers and canals, live rain and wind,
  water flowing downstream), a flood calendar since 2017 from Sentinel-1 radar, the rain that usually comes before a
  flood, monsoon rain per year, and a replay of the real paths of the strongest cyclones that came close.
- **Coast**: seaports, the Sundarbans, beaches, islands, haors, barrages and major bridges, with live waves, rain and
  wind (Open-Meteo). Port danger signals are left to BMD and linked, never invented.
- **Past-date test**: pick any past day and see what the model would have said, next to what the satellite saw.
- **Telegram bot** (Bangla and English, with Bangla voice): subscribe by typing an upazila or district name, even with
  small spelling mistakes; an alert when an upazila reaches watch level or above (at once if the level rises, otherwise at most once a day);
  `/status`, `/list`, `/model`. Alerts pause, and the admin is told, if the forecast goes stale. Also **heatwave
  alerts** (GFS highs in the Met Department's classes, moderate and up) and **cyclone alerts** (GDACS storms whose
  forecast track comes within 500 km of a subscribed upazila, again within 200 km); no signal numbers or surge heights.

## How it works

1. **Drainage graph**: upazilas and upstream river basins (inside Bangladesh, India, Nepal, Bhutan, China) are linked
   by how water flows (HydroSHEDS / HydroRIVERS), so rain far upstream counts for the places it drains into.
2. **Inputs**: rain over the last 30 days and the next 3 days for every upazila and its upstream basins (ERA5-Land
   history, NOAA GFS via Open-Meteo for the latest days and the forecast), runoff and soil moisture (ERA5-Land), the
   size of the catchment and its share outside Bangladesh, location and time of year.
3. **Labels**: unusual flood water mapped from Sentinel-1 radar in Google Earth Engine for every 15-day window since
   2017, with normal seasonal water (JRC) removed.
4. **Model**: FloodGraph-ST v1, gradient-boosted trees (LightGBM, 5 seeds) on those graph features, with calibrated
   probabilities and a P10–P90 range. Every trained model is stored with its scores; a new one goes live only if it
   scores at least as well as the active one.

## How good is it (measured, not claimed)

| Test | Result |
|---|---|
| Leave-one-year-out, ranking a flooded upazila above a dry one | 78 of 100 (seasonal history alone: 72) |
| Probability error (Brier, lower is better) | 0.116 (seasonal history alone: 0.125) |
| P10–P90 range holds the true value | 70 of 100 (target 80, not reached) |
| Last 12 months, monsoon (June–October), floods warned about in advance | 280 of 505 (55%) |
| Same period, warnings not followed by a flood | 76% (the warning level is set low so floods are not missed) |

The 12-month test uses the rain that actually fell, so the live forecast, which depends on a rain forecast, can do
worse. All of this is on the [model page](https://floodshieldbd.duckdns.org/model), fortnight by fortnight, with the
upazilas it caught, missed and wrongly warned.

**GloFAS river forecast: tested and not used.** 138 past GloFAS forecasts (June 2024 to October 2026) at 8 border-river
points were scored against satellite flooding downstream, with pass rules fixed before looking at the results
([scripts/glofas_score.py](scripts/glofas_score.py)). All 8 points failed (hit rate under 50% everywhere), so GloFAS is
not shown on the site or in the bot.

**Model v2: tested and not used.** Rules written before the tests ([ml/MODEL_V2_RULES.md](ml/MODEL_V2_RULES.md)):
a new warning threshold (CSI +0.0096, 0.02 needed), NASA IMERG rain (about 30 h late, 24 h needed) and IMERG as a
filler for the ERA5 gap (7-day error 35.3 mm against 28.5 mm for GFS) all failed, so v1 stays
([ml/MODEL_V2_RESULTS.md](ml/MODEL_V2_RESULTS.md)). Re-scored on 241 windows (2017–2026), leave-one-year-out:
AUC 0.83, floods caught 42%, false warnings 63%.

## Business model and growth

Full page: [floodshieldbd.duckdns.org/plan](https://floodshieldbd.duckdns.org/plan). Marked plainly: there are no
customers, revenue or foreign partners yet, and prices are proposals.

- **Free for people, always:** villagers, union and upazila offices get the site, the bot and every alert free.
- **Paid by organisations that gain from flood risk (planned):** NGOs doing anticipatory action, microfinance lenders
  and agricultural banks, insurers (crop and parametric flood cover), mobile operators for SMS. Tiers: Public ৳0;
  Organisation from ৳5,000/month (area dashboard, team alerts, SMS, reports); Data and API by contract. Grants and CSR
  keep the free tier running.
- **Cheap to run:** all data is open and global; the whole country runs on one 2 vCPU / 4 GB server, about $35 a month
  (list-price estimate), under one taka per upazila per month.
- **Go to market:** now, free national service; monsoon 2027, NGO pilots in Sunamganj, Kurigram and Sirajganj
  measuring alert lead time; late 2027, organisation tier, SMS partner, data sharing with FFWC and DDM; 2028, first
  pilot abroad.
- **Other countries:** nothing is specific to Bangladesh. New boundaries, past floods mapped from Sentinel-1, the same
  river graph (HydroSHEDS) and a retrained model. Nearest candidates: Nepal and Assam/Bihar (already in the river
  graph), then Myanmar, Pakistan, the Mekong delta and African river basins.
- **Scaling:** scheduled data intake with retries, a model that only replaces the live one if it scores better, cached
  compressed API responses, no duplicate alerts, one Docker command to deploy on any cloud, daily backups, 23 tests.
- **NRB collaboration (planned):** hydrology and remote-sensing researchers abroad to test and improve the model;
  cloud and MLOps engineers for scale and security reviews; market introductions and diaspora investment. Already
  working: anyone abroad can subscribe to their home upazila and warn family before a flood.

## Known limits

- River levels and local waterlogging are not in the estimate.
- The model learns from radar maps, so floods the radar missed are missing from its lessons too.
- Seven older 15-day windows have radar pictures for only part of the country; the missing upazilas are treated as
  "no data", never as "no flood".
- OpenStreetMap roads, canals and hospitals are incomplete in places; counts from it are never shown as facts.
- There is no open official list of shelters, so none are drawn; the site links to a map search and says to ask the
  union or upazila office.
- "Where water stands" counts any monsoon water on land (beels and paddy fields too); red is not always danger, and
  "never" is not a safe place.

## Data sources

Sentinel-1 (ESA/Copernicus, via Google Earth Engine) · JRC Global Surface Water · ERA5-Land (Copernicus) · NOAA GFS and
Open-Meteo (forecast, marine) · HydroSHEDS / HydroRIVERS / HydroBASINS · upazila boundaries BBS/OCHA (HDX) · DGHS
Facility Registry (government hospitals) · NOAA IBTrACS (IMD best track) · GDACS (active cyclones) · NASA LHASA
(landslides) · WorldPop 2020 (population) · bangladesh.gov.bd (official upazila names) · Esri imagery and basemaps ·
OpenStreetMap via OpenFreeMap · Mapzen terrain tiles (AWS). Earth Engine is used under its noncommercial terms.
FloodShield BD has no partnership with any of these organisations; they are data sources.

## Run it

```bash
cp .env.example .env        # fill in the database password, site address and API keys
docker compose up -d --build
```

Docker Compose starts PostgreSQL 16 + PostGIS, the FastAPI app (API, web pages, scheduler and bot in one process) and
Caddy for HTTPS. The scheduler fetches rain and makes a forecast every 6 hours, refreshes ERA5-Land daily and rebuilds
the 12-month model check daily. `scripts/backup_db.sh` keeps 7 daily database backups on the server and
`scripts/pull_backup.sh` copies the newest one to another machine.

Tests: `python -m pytest -q` (from the repo root, with the backend requirements installed).

## Repository

```
backend/app/api       REST API (/api/v1)
backend/app/ml        features, training, forecast
backend/app/services  ingest, alerts and bot, outlook, cyclones, model check
backend/app/web       web pages (map, upazila report, model page, about)
scripts/              data loading, training, scoring, backups
docker/               Dockerfiles and Caddyfile
```

Built for the International AI Builders Congress 2026 (Climate Shield).
