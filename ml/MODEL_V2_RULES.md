# Model v2: pass/fail rules (written 12 Nov 2026, before any v2 test was run)

The live model is `floodgraph-st-v1-20261101T1301Z`. A change ships only if it passes every rule below.
If it fails, v1 stays and the result is reported as a failure (as with GloFAS).

## How everything is scored
- Data: every labelled Sentinel-1 window now in the database, same label:
  "flooded" = unusual water over >= 5% of the upazila.
  (Correction, made before any threshold or IMERG result was looked at: when these rules were written I assumed
  the 77 windows / 41,000 rows v1 was trained on. The database now holds 241 windows, 2017–2026, 129,801 rows,
  because later mapping added dry-season and 2026 windows. Both v1 and any v2 are rebuilt and scored on this
  same larger table, so the comparison stays fair.)
- Leave-one-year-out: every score comes from a model that never saw that year.
  Any threshold or calibration is also chosen without the held-out year (nested).
- "Warned" = the level users see as medium or high.
- Scores, pooled over all held-out years:
  - POD (caught) = hits / (hits + misses)
  - FAR (false alarms) = false alarms / (hits + false alarms)
  - CSI = hits / (hits + misses + false alarms), the single number that punishes both misses and false alarms
  - AUC (ranking skill)

## A. New warning threshold (same model, different medium/high cut-offs)
Passes only if, against the current rule (calibrated chance >= 25%):
1. pooled CSI is higher by at least 0.02, and
2. pooled POD stays at or above 0.45, and
3. CSI is not worse in more than 3 of the 9 years.

## B. Adding NASA IMERG rain
Passes only if, against v1 scored the same way:
1. pooled AUC is higher by at least 0.01, and
2. pooled CSI (each with its own nested threshold) is higher by at least 0.02, and
3. AUC is not worse in more than 3 of the 9 years, and
4. IMERG data for yesterday is available on Earth Engine within 24 hours (otherwise live use is impossible).

## Not allowed
- Changing these rules after seeing results.
- Choosing a threshold using the year it is scored on.
- Reporting only the years that improved.
