# EPL Predictor (Next.js + AdaBoost SAMME.R)

Production-oriented EPL match prediction app with a white, minimal UI and Vercel-safe TypeScript inference.

## Stack
- Next.js App Router + TypeScript + Tailwind CSS
- Prisma + Postgres (Vercel Postgres/Neon compatible)
- AdaBoostClassifier (SAMME.R) exported to JSON for runtime TS inference

## Setup
```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npm run dev
```

## Environment
Create `.env` with:
```bash
DATABASE_URL="postgresql://..."
POSTGRES_URL="postgresql://..." # optional fallback
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

## Build
```bash
npm run build
npm run start
```

## ML Pipeline
```bash
python scripts/ml/train_adaboost.py
python scripts/ml/export_adaboost_json.py
python scripts/ml/build_artifacts.py
```

Artifacts are committed under `/artifacts` and read-only at runtime.

## Prisma commands
```bash
npx prisma migrate dev
npx prisma db push
npx prisma generate
```

## Deploy to Vercel
1. Import repository in Vercel.
2. Set `DATABASE_URL` (or `POSTGRES_URL`).
3. Deploy.

## Notes
- Legacy Flask app has been moved to `/legacy_flask`.
- Inference runs in TypeScript from `artifacts/model_adaboost.json`, no sklearn runtime on Vercel.
- Model outputs are probabilistic and not guaranteed outcomes.
