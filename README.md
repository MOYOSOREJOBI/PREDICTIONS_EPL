# EPL Predict (Next.js + Prisma + TypeScript inference)

Production-oriented EPL prediction and picks tracking app.

## Stack
- Next.js App Router + TypeScript + Tailwind
- Prisma + Postgres (Vercel Postgres / Neon)
- Python offline pipeline for ingestion + features + training + export
- TypeScript server-side inference using `artifacts/model_adaboost.json`

## Setup
1. Install dependencies:
   - `npm install`
2. Configure env:
   - `DATABASE_URL=postgres://...`
   - `CRON_SECRET=...`
   - optional: `FOOTBALL_DATA_API_KEY=...`
3. Prisma:
   - `npx prisma generate`
   - `npx prisma db push`
4. Run app:
   - `npm run dev`

## Data + ML pipeline
Run in order:
1. `python scripts/data/refresh_epl_data.py`
2. `python scripts/ml/build_dataset.py`
3. `python scripts/ml/train_adaboost.py`
4. `python scripts/ml/export_adaboost_json.py`
5. `python scripts/ml/verify_ts_parity.py`

Outputs:
- `data/processed/matches.csv`
- `data/processed/features.csv`
- `artifacts/model_adaboost.json`
- `artifacts/fixtures.json`
- `artifacts/teams_state.json`
- `artifacts/metrics.json`
- `artifacts/metadata.json`

## API routes
- `GET /api/fixtures`
- `GET /api/match/:id`
- `POST /api/predict`
- `POST /api/picks`
- `GET /api/picks`
- `POST /api/admin/refresh` (header `x-cron-secret`)
- `POST /api/admin/settle` (header `x-cron-secret`)

## Tests
- Unit: `npm test`
- Type check: `npm run typecheck`
- E2E: `npm run e2e`

## Vercel deploy
- Create Postgres database (Vercel Postgres / Neon)
- Set `DATABASE_URL` and `CRON_SECRET`
- Build command: `npm run build`
- Run `npx prisma db push` in deploy hook or prebuild pipeline

## Disclaimer
Predictions are probabilistic estimates and not guarantees.
