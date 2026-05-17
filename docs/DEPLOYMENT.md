# NepalJobAI — Deployment Guide

Stack: **Next.js 15** on Vercel · **FastAPI** on Render · **PostgreSQL** on Neon

---

## 1. Set up Neon (PostgreSQL)

1. Go to [neon.tech](https://neon.tech) and create a free account.
2. Create a new project — name it `nepaljobai`, region **Singapore (ap-southeast-1)**.
3. After creation, open the **Connection Details** panel.
4. Copy the **connection string** — it looks like:
   ```
   postgresql://nepaljobai_owner:<password>@ep-xxx.ap-southeast-1.aws.neon.tech/nepaljobai?sslmode=require
   ```
5. Keep this string — you will need it in steps 2, 3, and 4.

> **Tip:** Neon free tier gives you 0.5 GB storage and auto-suspends after 5 min of inactivity. The Render health-check ping keeps it awake during business hours.

---

## 2. Migrate SQLite data to PostgreSQL

Run this **once** from your local machine after step 1.

```bash
cd backend

# Install dependencies (if not already done)
pip install -r requirements.txt

# Run the migration (replace with your actual Neon URL)
DATABASE_URL="postgresql://nepaljobai_owner:<password>@ep-xxx.ap-southeast-1.aws.neon.tech/nepaljobai?sslmode=require" \
  python scripts/migrate_sqlite_to_postgres.py
```

Expected output:
```
Source : /path/to/nepaljobai.db
Target : postgresql://nepaljobai_owner@***

  users          42 rows migrated
  profiles       38 rows migrated
  jobs          156 rows migrated
  matches       312 rows migrated
  roadmaps       15 rows migrated

Done. 563 total rows migrated.
```

> **Note:** The script is idempotent — re-running it is safe (uses `ON CONFLICT DO NOTHING`).

---

## 3. Deploy backend to Render

### 3a. Create the Render service

1. Go to [render.com](https://render.com) → **New → Web Service**.
2. Connect your GitHub repo and select the `nepaljobai` repository.
3. Set **Root Directory** to `backend`.
4. Render will auto-detect `render.yaml` — confirm the settings:
   - **Build command:** `pip install -r requirements.txt`
   - **Start command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Region:** Singapore

### 3b. Set environment variables in Render dashboard

Go to your web service → **Environment** tab and add:

| Variable | Value |
|---|---|
| `DATABASE_URL` | `postgresql://nepaljobai_owner:<pw>@ep-xxx.neon.tech/nepaljobai?sslmode=require` |
| `OPENROUTER_API_KEY` | `sk-or-v1-...` (your OpenRouter key) |
| `OPENROUTER_MODEL` | `meta-llama/llama-3.3-70b-instruct:free` |
| `CLERK_SECRET_KEY` | `sk_live_...` (from Clerk dashboard) |
| `CLERK_WEBHOOK_SECRET` | `whsec_...` (from Clerk Webhooks) |
| `HF_API_TOKEN` | your HuggingFace token (leave blank for mock embeddings) |
| `FRONTEND_URL` | `https://nepaljobai.vercel.app` (your Vercel URL, add after step 4) |
| `APP_ENV` | `production` |
| `DEBUG` | `false` |

### 3c. Deploy

Click **Deploy**. First deploy takes ~3 minutes (heavy ML deps).

After deploy, your API will be at:
```
https://nepaljobai-api.onrender.com
```

---

## 4. Deploy frontend to Vercel

### 4a. Import project

1. Go to [vercel.com](https://vercel.com) → **New Project**.
2. Import your GitHub repo.
3. Set **Root Directory** to `frontend`.
4. Framework will be auto-detected as **Next.js**.

### 4b. Set environment variables in Vercel dashboard

Go to your project → **Settings → Environment Variables** and add:

| Variable | Value | Environments |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_...` | Production, Preview |
| `CLERK_SECRET_KEY` | `sk_live_...` | Production, Preview |
| `CLERK_WEBHOOK_SECRET` | `whsec_...` | Production, Preview |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` | All |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` | All |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/dashboard` | All |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/dashboard` | All |
| `NEXT_PUBLIC_API_BASE_URL` | `https://nepaljobai-api.onrender.com` | Production, Preview |

### 4c. Configure Clerk webhook

After Vercel deploys (you get a URL like `https://nepaljobai.vercel.app`):

1. Go to [Clerk Dashboard](https://dashboard.clerk.com) → **Webhooks → Add Endpoint**.
2. URL: `https://nepaljobai.vercel.app/api/webhooks/clerk`
3. Subscribe to events: `user.created`, `user.updated`, `user.deleted`.
4. Copy the **Signing Secret** and set it as `CLERK_WEBHOOK_SECRET` in both Vercel and Render.

### 4d. Update Render with frontend URL

Go back to Render → Environment and set:
```
FRONTEND_URL = https://nepaljobai.vercel.app
```

Then trigger a redeploy so CORS picks up the production domain.

---

## 5. Verify the deployment

### Health check

```bash
curl https://nepaljobai-api.onrender.com/health
```

Expected response:
```json
{"status": "ok", "jobs_indexed": 156}
```

### Full smoke test

```bash
# List jobs
curl https://nepaljobai-api.onrender.com/api/jobs | jq '.total'

# Match jobs
curl -X POST https://nepaljobai-api.onrender.com/api/match_jobs \
  -H "Content-Type: application/json" \
  -d '{"skills": ["Python", "React", "PostgreSQL"], "top_k": 5}'
```

---

## 6. Set up the daily scraper as a Render cron job

The `render.yaml` already defines a cron service scheduled at **06:00 NPT** (00:15 UTC).

Render will create it automatically when you connect the repo. To verify:
- Render dashboard → **Cron Jobs** → `nepaljobai-scraper`.
- Set the same `DATABASE_URL` env var on the cron job service.

To run the scraper manually at any time:

```bash
cd backend
DATABASE_URL="postgresql://..." python scripts/scrape_initial.py
```

Expected output:
```
14:30:15  INFO     Starting scrape run — 2026-05-17 09:00 UTC
14:30:15  INFO     ── merojob ──
14:30:22  INFO     merojob: found 48 jobs
14:30:22  INFO     merojob: 12 new jobs inserted
...
14:32:01  INFO     Scrape complete — 47 total new jobs inserted
```

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `/health` returns 500 | `DATABASE_URL` wrong or Neon paused — check Render logs |
| CORS error in browser | Set `FRONTEND_URL` in Render env vars and redeploy |
| Clerk webhook `401 Unauthorized` | `CLERK_WEBHOOK_SECRET` mismatch — regenerate in Clerk and update both Render + Vercel |
| Scraper finds 0 jobs | Job sites changed HTML — inspect and update CSS selectors in `scripts/scrape_initial.py` |
| Render deploy OOM on `sentence-transformers` | Upgrade to Render Starter ($7/mo) or remove the package and use mock embeddings |
| LinkedIn scraper returns nothing | Expected — LinkedIn blocks bots. Consider their Jobs API for reliable data |
