# Model v2: results (12 Nov 2026), scored with the rules in MODEL_V2_RULES.md

Verdict: **nothing passed. v1 stays live, unchanged.**

## Baseline, re-scored honestly (v1 settings, leave-one-year-out, 241 windows, 2017–2026, 129,801 upazila-windows)
- AUC 0.829
- Current warning rule (calibrated chance >= 25%), pooled over the 10 held-out years:
  POD 0.419 (4,303 of 10,268 floods caught), FAR 0.628, CSI 0.2455

Note: the site's "model calendar" (last 12 months, monsoon: 55% caught, 76% of warnings false) uses a different
period and the live model, which saw 2017–2025 in training. The numbers above are the fairer
"never saw that year" scores.

## A. New warning threshold: FAIL
The best threshold was picked on the other 9 years (it came out at 0.19–0.21 every time) and scored on the held-out year.

| | POD | FAR | CSI |
|---|---|---|---|
| current (25%) | 0.419 | 0.628 | 0.2455 |
| nested best | 0.517 | 0.665 | 0.2551 |

- Rule 1 (CSI +0.02 or more): +0.0096, **fail**
- Rule 2 (POD >= 0.45): 0.517, pass
- Rule 3 (CSI worse in at most 3 years): worse in 4 of 10 (2018, 2023, 2025, 2026), **fail**

A lower threshold catches more floods but adds more false alarms than it removes misses. It is not a real improvement.

## B. NASA IMERG rain: FAIL on rule 4 (live availability), so rules 1–3 were not run
- `NASA/GPM_L3/IMERG_V07` on Earth Engine covers 2017 to now.
- At about 09:00 UTC on 12 Nov, the newest image was from 03:30 UTC on 11 Nov, about 30 hours old.
  No full day of yesterday's rain was available.
- Rule 4 needs it within 24 hours: **fail**.
- Running the costly backfill for rules 1–3 would not change the verdict, so it was not done.
- `IMERG_V06` ended in June 2024.

## What this leaves for a future, separately pre-registered test
IMERG at about 1.5–2 days old is still much newer than ERA5-Land (about 9 days old). The live model currently fills that
gap with GFS "past days", which are a weather model, not measured rain. A new test could use IMERG only to fill the gap,
under its own rules written before it is run. It is not a v2 pass under the rules above.

## C. IMERG as gap filler (rules in IMERG_GAP_RULES.md): FAIL on all 3 rules
80 random upazilas (seed 2026), monsoon 2024 and 2025 (1 Jun – 31 Oct), 24,480 upazila-days, nothing dropped.
Error of rolling 7-day rain totals against ERA5-Land (what the model learned from):

| | IMERG | GFS (what the site uses now) |
|---|---|---|
| MAE7, pooled | 35.3 mm | 28.5 mm |
| MAE7, 2024 | 38.8 mm | 31.5 mm |
| MAE7, 2025 | 31.8 mm | 25.5 mm |
| upazilas where it is the closer one | 16% | 84% |

- Rule 1 (IMERG error <= 0.8 × GFS): ratio 1.24, so IMERG is 24% worse. **Fail**
- Rule 2 (better in both years): **fail**
- Rule 3 (better for at least 60% of upazilas): 16%. **Fail**

For information:
- 3-day MAE: IMERG 19.9 mm, GFS 15.7 mm
- daily correlation with ERA5: IMERG 0.58, GFS 0.60
- mean daily rain: ERA5 11.0, IMERG 12.8, GFS 9.7 mm

IMERG may be closer to the rain that really fell, but it is further from ERA5-Land, the rain the model was trained
on, so it would feed the model inputs unlike what it learned from. The GFS gap filler stays.
