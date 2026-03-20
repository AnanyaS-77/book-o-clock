# Book o' Clock

An AI-powered book discovery platform with mood-based search, personalized recommendations, account-backed shelves, and reading progress tracking.

## Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: FastAPI
- Recommendations: pandas, scikit-learn, Google Books API
- Auth + user data: Supabase Auth + Postgres

## Local setup

### Frontend

Create `frontend/.env.local`:

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_SITE_URL=http://localhost:8080
```

Run:

```bash
cd frontend
npm install
npm run dev
```

### Backend

Create `backend/.env` if you want custom CORS origins:

```env
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:8080,http://127.0.0.1:8080
ALLOWED_ORIGIN_REGEX=
```

Run:

```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

## Supabase setup

Run the SQL migration in:

- [supabase/migrations/20260320_create_user_books.sql](/Users/ananyasingh/Desktop/book-o-clock-ai/supabase/migrations/20260320_create_user_books.sql)

Add these redirect URLs in Supabase Auth settings:

- `http://localhost:5173/auth`
- `http://localhost:5173/reset-password`
- `http://localhost:8080/auth`
- `http://localhost:8080/reset-password`

## Deployment plan

### Frontend on Vercel

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- SPA rewrites: included in [frontend/vercel.json](/Users/ananyasingh/Desktop/book-o-clock-ai/frontend/vercel.json)
- Environment variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_API_BASE_URL`
  - `VITE_SITE_URL`

### Backend on Render

- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
- Health check path: `/health`
- Environment variables:
  - `ALLOWED_ORIGINS=https://your-production-frontend-domain.com`
  - `ALLOWED_ORIGIN_REGEX=https://your-preview-domain-pattern\\.vercel\\.app`

You can also use the included [render.yaml](/Users/ananyasingh/Desktop/book-o-clock-ai/render.yaml) as a starting point.

## Production checklist

- Set `VITE_SITE_URL` to your production frontend URL in Vercel.
- Set `VITE_API_BASE_URL` to your Render API URL in Vercel.
- Set `ALLOWED_ORIGINS` in Render to your Vercel production URL or custom domain.
- If you want Vercel preview deployments to reach the API, set `ALLOWED_ORIGIN_REGEX` in Render to a regex that matches only your preview domains.
- Add your production `auth` and `reset-password` URLs to Supabase Auth redirect settings before testing sign-up and password reset.

## Current features

- Search with suggestions
- Mood-based discovery
- Similar book recommendations
- Personalized homepage row based on user shelf behavior
- Supabase authentication
- Account-backed library, reviews, ratings, and progress tracking
- Password reset flow
