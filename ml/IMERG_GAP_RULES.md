# IMERG as gap filler: pass/fail rules (written 12 Nov 2026, before any data was pulled)

## The question
ERA5-Land, which the model was trained on, arrives about 9 days late. The live forecast fills those days with NOAA GFS
"past days" from Open-Meteo (a weather model, at the upazila's centre point). Would NASA IMERG (satellite-measured
rain, about 30 h late) fill the days up to 2 days ago better?

"Better" means closer to ERA5-Land. The model learned from ERA5-Land, so the filler should look like what it learned
from, not merely be "true".

## Data (fixed now)
- Upazilas: 80, picked at random with seed 2026 from the 544.
- Days: 1 Jun – 31 Oct of 2024 and of 2025 (monsoon, when floods happen). UTC days, as the model uses.
- ERA5-Land (truth): our `era5_daily.precip_mm` for those upazilas (polygon mean, as in training).
- GFS: Open-Meteo historical forecast API, model `gfs_seamless`, hourly precipitation at the upazila point, summed
  to UTC days. This is the same archive the live `past_days` come from.
- IMERG: `NASA/GPM_L3/IMERG_V07` on Earth Engine, `precipitation` (mm/h, half-hourly) × 0.5, summed to UTC days,
  polygon mean at about 11 km (as ERA5 is done). This is how it would run live.
- Any upazila-day missing in any source is dropped from all three.

## Scores
The model uses 1-, 3- and 7-day totals, so the main score is on rolling 7-day totals.
- MAE7 = mean absolute error of 7-day rain totals against ERA5-Land, pooled over all upazila-days.
- Also reported (not pass/fail): MAE of 3-day totals, daily correlation, mean bias.

## IMERG passes only if all of these hold
1. Pooled MAE7(IMERG) <= 0.8 × MAE7(GFS), i.e. at least 20% smaller error, and
2. it is smaller in both years (2024 and 2025) separately, and
3. it is smaller for at least 60% of the 80 upazilas.

If it passes, it is built into the live forecast for days up to 2 days ago (GFS stays for the last 1–2 days and the
forecast), and the site and README say so. If it fails, nothing changes and the result is reported.

## Not allowed
- Changing the upazilas, days, sources or thresholds after seeing any number.
- Dropping a year or upazilas that look bad.
