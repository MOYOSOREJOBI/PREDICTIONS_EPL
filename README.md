# EPL Predict & Pick

Next.js + TypeScript + Prisma project for EPL outcome/scoreline probabilities and session-based pick tracking.

## Data + model pipeline

Sources:
- football-data.co.uk seasonal EPL CSVs (`2015-16` through `2025-26`)
- football-data.co.uk `fixtures.csv` (division `E0`)
- optional live odds provider when `ODDS_API_KEY` is set

Run now:
1. `python scripts/data/refresh_epl_data.py`
2. `python scripts/ml/fit_model.py`
3. `python scripts/build_artifacts.py`

Artifacts generated:
- `artifacts/model_params.json`
- `artifacts/fixtures.json`
- `artifacts/teams_state.json`
- `artifacts/metrics.json`
- `artifacts/metadata.json`

## Local development

1. `npm install`
2. `npx prisma db push`
3. `npm run dev`

## APIs

- `GET /api/fixtures?from=&to=&team=&sort=kickoff|ev|edge`
- `GET /api/match/[id]`
- `POST /api/predict`
- `POST /api/picks`
- `GET /api/picks`
- `GET /api/cron/daily` (`x-cron-secret` required)

## Automation

- GitHub Actions daily refresh: `.github/workflows/daily_refresh.yml` (06:00 UTC)
- Vercel cron trigger: `vercel.json` -> `/api/cron/daily`

## Deployment

- Configure `DATABASE_URL` and `CRON_SECRET`
- Deploy to Vercel
- Enable scheduled GitHub Action and Vercel cron
