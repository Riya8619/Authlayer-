# AuthLayer API

FastAPI backend for AI-powered content trust verification. Scans images and URLs, detects AI-generated media, checks metadata integrity, screens URLs for phishing/malware signals, and returns a computed trust score with a full forensic breakdown.

Live companion frontend: [AuthLayer Dashboard](https://github.com/<your-username>/authlayer-frontend)

## Features

- **Image scanning** — Pillow/ImageHash/ExifRead-based forensic analysis (entropy, edge noise, compression artifacts, EXIF metadata integrity, perceptual-hash duplicate detection)
- **URL scanning** — structural/heuristic phishing detection (suspicious TLDs, brand impersonation, punycode, IP-hosts, open redirects) plus optional Google Safe Browsing lookup
- **AI-generated content detection** — optional HuggingFace Inference API integration, blended with local heuristics
- **Trust scoring engine** — a single scoring module (`app/services/scoring.py`) aggregates all signals into a 0–100 trust score, risk level, and explanations
- **Persistent scan history** — every scan is saved to PostgreSQL and retrievable via `GET /history`
- **Centralized error handling** — consistent `{ success, error }` JSON shape for all failures (validation, HTTP, and unhandled exceptions)

## Tech stack

| Layer | Technology |
|---|---|
| Framework | FastAPI |
| Server | Uvicorn |
| Database | PostgreSQL (Neon) via SQLAlchemy |
| Image processing | Pillow, ImageHash, ExifRead |
| Validation | Pydantic v2 / pydantic-settings |
| Deployment | Render |

## Project structure

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

## Getting started (local development)

**Requirements:** Python 3.11+

```bash
git clone https://github.com/<your-username>/authlayer-backend.git
cd authlayer-backend

python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt

cp .env.example .env            # then fill in DATABASE_URL at minimum

uvicorn app.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`. Interactive docs at `http://127.0.0.1:8000/docs`.

## Environment variables

See `.env.example` for the full list with descriptions. Required:

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string (Neon). Must include `?sslmode=require`. App fails to start without it. |
| `ALLOWED_ORIGINS` | ✅ | Comma-separated list of allowed frontend origins for CORS |
| `HUGGINGFACE_API_KEY` | optional | Enables AI-generated-image detection; skipped (heuristics-only) if unset |
| `GOOGLE_SAFE_BROWSING_API_KEY` | optional | Enables live URL threat lookups; skipped if unset |
| `TEXT_DETECTION_PROVIDER` | optional | Default: `huggingface` |
| `URL_CHECK_PROVIDER` | optional | Default: `google_safe_browsing` |
| `PROVIDER_TIMEOUT_SECONDS` | optional | Default: `15` |

## API endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Basic liveness check |
| `GET` | `/health` | Health + database connectivity status |
| `POST` | `/scan-image` | Multipart file upload → forensic trust analysis |
| `POST` | `/scan-url` | JSON `{ "url": "..." }` → structural/phishing trust analysis |
| `GET` | `/history` | List of persisted scans |
| `GET` | `/history/{scan_id}` | Single scan detail |

All scan responses return camelCase JSON matching the frontend's expected shape: `trustScore`, `riskLevel`, `aiGeneratedProbability`, `metadataIntegrity`, `duplicateCount`, `explanations`, `forensicDetails`.

## Deployment (Render)

This repo includes a `render.yaml` and `Procfile` and deploys as-is:

1. Push to GitHub
2. Render → New → Web Service → connect this repo (auto-detects `render.yaml`)
3. Set `DATABASE_URL` and `ALLOWED_ORIGINS` in the Render dashboard (marked `sync: false` in `render.yaml`, so they must be set manually — never committed)
4. Deploy — health check path is `/health`

## License

Add your license here (e.g. MIT).
