# AuthLayer

AuthLayer is a full-stack AI content trust verification platform. Upload an image or submit a URL and get a real-time trust score, AI-generation probability, metadata integrity report, and full forensic breakdown.

The project is split into two repositories/folders:

- **`backend/`** — FastAPI service that performs the actual scanning, scoring, and persistence
- **`frontend/`** (`auth-layer-dashboard/`) — Next.js dashboard that drives the scan UI and displays results

---

## Architecture

```
┌─────────────────────┐        HTTPS / JSON        ┌──────────────────────┐
│   Frontend (Vercel)  │  ─────────────────────────▶ │   Backend (Render)    │
│   Next.js 16          │  ◀───────────────────────── │   FastAPI              │
└─────────────────────┘                              └───────────┬──────────┘
                                                                     │
                                                                     ▼
                                                          ┌────────────────────┐
                                                          │  PostgreSQL (Neon)  │
                                                          └────────────────────┘
```

## Features

- **Live content scan** — drag-and-drop image upload or URL input, with client-side file type/size validation
- **AI-generated content detection** — optional HuggingFace Inference API integration blended with local heuristics
- **Metadata forensics** — EXIF integrity checks, perceptual-hash duplicate detection, compression/noise analysis
- **URL safety analysis** — phishing heuristics (suspicious TLDs, punycode, brand impersonation) plus optional Google Safe Browsing lookup
- **Trust scoring engine** — a single backend module aggregates every signal into a 0–100 trust score, risk level, and explanations
- **Persistent scan history** — every scan is saved to PostgreSQL and hydrated into the dashboard via `GET /history`
- **Full loading/error states** — scan progress overlay, inline + toast error handling, network/timeout resilience
- **Marketing pages** — Platform, Solutions, Documentation, Pricing, Contact, in a single-page app with anchor navigation

## Tech stack

| Layer | Technology |
|---|---|
| Backend framework | FastAPI + Uvicorn |
| Database | PostgreSQL (Neon) via SQLAlchemy |
| Image processing | Pillow, ImageHash, ExifRead |
| Backend deployment | Render |
| Frontend framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 + Radix UI |
| Animation | Framer Motion |
| Frontend deployment | Vercel |

---

## Backend (`backend/`)

### Project structure

```
app/
├── api/                  # Route handlers
│   ├── image_scan.py     # POST /scan-image
│   ├── url_scan.py       # POST /scan-url
│   └── history.py        # GET /history, GET /history/{id}
├── core/
│   ├── config.py         # Environment-driven settings (Pydantic BaseSettings)
│   └── logging_config.py
├── database/
│   ├── database.py       # Engine, session, connection check
│   ├── models.py         # ScanHistory ORM model
│   └── crud.py           # DB read/write operations
├── schemas/               # Pydantic request/response models
├── services/
│   ├── image_analysis.py # Forensic image analysis
│   ├── url_analysis.py   # URL heuristics
│   ├── scoring.py         # Trust score aggregation
│   ├── registry.py        # Provider selection (env-driven)
│   ├── detectors/          # AI-image + duplicate-hash detectors
│   └── providers/          # HuggingFace + Google Safe Browsing clients
└── main.py                # FastAPI app, middleware, exception handlers
```

### Local setup

**Requirements:** Python 3.11+

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env             # fill in DATABASE_URL at minimum
uvicorn app.main:app --reload
```

API available at `http://127.0.0.1:8000`, interactive docs at `/docs`.

### Environment variables

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string (Neon). Must include `?sslmode=require`. App fails to start without it. |
| `ALLOWED_ORIGINS` | ✅ | Comma-separated list of allowed frontend origins for CORS |
| `HUGGINGFACE_API_KEY` | optional | Enables AI-generated-image detection; skipped (heuristics-only) if unset |
| `GOOGLE_SAFE_BROWSING_API_KEY` | optional | Enables live URL threat lookups; skipped if unset |
| `TEXT_DETECTION_PROVIDER` | optional | Default: `huggingface` |
| `URL_CHECK_PROVIDER` | optional | Default: `google_safe_browsing` |
| `PROVIDER_TIMEOUT_SECONDS` | optional | Default: `15` |

### API endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Basic liveness check |
| `GET` | `/health` | Health + database connectivity status |
| `POST` | `/scan-image` | Multipart file upload → forensic trust analysis |
| `POST` | `/scan-url` | JSON `{ "url": "..." }` → structural/phishing trust analysis |
| `GET` | `/history` | List of persisted scans |
| `GET` | `/history/{scan_id}` | Single scan detail |

All scan responses return camelCase JSON matching the frontend's expected shape: `trustScore`, `riskLevel`, `aiGeneratedProbability`, `metadataIntegrity`, `duplicateCount`, `explanations`, `forensicDetails`.

### Deploy (Render)

Includes `render.yaml` and `Procfile` — deploys as-is:

1. Push to GitHub
2. Render → New → Web Service → connect the repo (auto-detects `render.yaml`)
3. Set `DATABASE_URL` and `ALLOWED_ORIGINS` in the Render dashboard (never commit these)
4. Deploy — health check path is `/health`

---

## Frontend (`auth-layer-dashboard/`)

### Project structure

```
app/
├── page.tsx           # Single-page app: hero, scan panel, dashboard, marketing sections
├── layout.tsx          # Root layout, fonts, SEO metadata
├── robots.ts / sitemap.ts
├── error.tsx           # Global error boundary
└── not-found.tsx
components/
├── navbar.tsx
├── hero-section.tsx
├── upload-panel.tsx           # Drag/drop + URL input, client-side validation
├── trust-results-dashboard.tsx
├── scan-history-table.tsx
├── marketing-sections.tsx      # Documentation, Pricing, Contact
└── ui/                          # Reusable primitives (button, dialog, input, etc.)
hooks/
└── use-scan-workflow.ts        # Scan orchestration, progress simulation, history hydration
lib/
├── api.ts             # API service layer — all backend calls, validation, error handling
└── types/scan.ts       # Shared TypeScript types
```

### Local setup

**Requirements:** Node.js 20+

```bash
cd auth-layer-dashboard
npm install
cp .env.example .env.local       # set NEXT_PUBLIC_API_BASE
npm run dev
```

App available at `http://localhost:3000`.

### Environment variables

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_BASE` | ✅ | Base URL of the AuthLayer backend, no trailing slash (e.g. `https://authlayer-backend.onrender.com`). No localhost fallback — scans show a clear "not configured" error until this is set. |
| `NEXT_PUBLIC_SITE_URL` | recommended | Your deployed frontend URL, used for SEO metadata (Open Graph, sitemap) |

### Available scripts

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run start    # Serve production build locally
npm run lint     # ESLint
```

### Deploy (Vercel)

1. Push to GitHub
2. Vercel → Add New → Project → import the repo
3. Set `NEXT_PUBLIC_API_BASE` and `NEXT_PUBLIC_SITE_URL` in Project Settings → Environment Variables
4. Deploy

---

## Full deployment order

1. Provision a PostgreSQL database on **Neon**
2. Deploy `backend/` to **Render**, set `DATABASE_URL`
3. Deploy `auth-layer-dashboard/` to **Vercel**, set `NEXT_PUBLIC_API_BASE` to the Render URL
4. Go back to Render and set `ALLOWED_ORIGINS` to the Vercel URL so CORS allows requests
5. Verify: open the Vercel URL and run an image scan and a URL scan end-to-end

## License

Add your license here (e.g. MIT).
