# AuthLayer Dashboard

Next.js frontend for AI-powered content authenticity verification. Upload an image or submit a URL and get a real-time trust score, AI-detection probability, metadata integrity report, and full forensic breakdown — powered by the [AuthLayer API](https://github.com/<your-username>/authlayer-backend).

## Features

- **Live content scan** — drag-and-drop image upload or URL input, with client-side file type/size validation
- **Real-time trust dashboard** — trust score, risk level, AI-generation probability, metadata integrity, forensic detail cards
- **Persistent scan history** — hydrated from the backend's `/history` endpoint on load
- **Marketing pages** — Platform, Solutions, Documentation, Pricing, Contact, all in a single-page app with smooth anchor navigation
- **Full loading/error states** — scan progress overlay, inline + toast error handling, network/timeout resilience
- **Responsive, accessible UI** — built with Tailwind CSS + Radix UI primitives

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI primitives | Radix UI / shadcn-style components |
| Animation | Framer Motion |
| Forms/validation | React Hook Form + Zod |
| Deployment | Vercel |

## Project structure

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

## Getting started (local development)

**Requirements:** Node.js 20+

```bash
git clone https://github.com/<your-username>/authlayer-frontend.git
cd authlayer-frontend

npm install

cp .env.example .env.local       # then set NEXT_PUBLIC_API_BASE

npm run dev
```

The app will be available at `http://localhost:3000`.

## Environment variables

See `.env.example`. Both are required for a working deployment:

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_BASE` | ✅ | Base URL of the AuthLayer backend, no trailing slash (e.g. `https://authlayer-backend.onrender.com`). No localhost fallback — scans show a clear "not configured" error until this is set. |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Base URL of  frontend URL, used for SEO metadata (Open Graph, sitemap) |

## Available scripts

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run start    # Serve production build locally
npm run lint     # ESLint
```

## Deployment (Vercel)

1. Push to GitHub
2. Vercel → Add New → Project → import this repo
3. Set `NEXT_PUBLIC_API_BASE` and `NEXT_PUBLIC_SITE_URL` in Project Settings → Environment Variables
4. Deploy
5. Back on the backend (Render), set `ALLOWED_ORIGINS` to this Vercel URL so CORS allows requests

## License

Add your license here (e.g. MIT).
