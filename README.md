# Trackapp — Delivery Tracking

Real-time package tracking with bot protection. Enter a tracking number, solve a
captcha, and see your shipment's journey — powered by the Sinclog public
tracking API.

## About

Trackapp is a lightweight, privacy-respecting delivery tracking web application.
It proxies requests to the Sinclog logistics API, acquiring and caching auth
tokens automatically. Cloudflare Turnstile protects every lookup from abuse
without harassing real users.

Built with **Next.js 16** (App Router), **React 19**, and **Bun**.

## Features

- **Package tracking** — look up any shipment by tracking number and see a
  timeline of events with locations and status descriptions.
- **Bot protection** — Cloudflare Turnstile captcha is enforced server-side on
  every tracking request. No captcha, no data.
- **Automatic token management** — auth tokens are fetched, cached in-memory
  with TTL expiry, and refreshed transparently. Concurrent lookups share a
  single auth call.
- **Docker-ready** — multi-stage `Dockerfile` with standalone output for a
  minimal production image.
- **Zero client secrets** — all sensitive keys stay on the server. Only the
  Turnstile site key is exposed to the browser.

## Prerequisites

- [Bun](https://bun.com) ≥ 1.0 (or Node.js ≥ 18)
- A [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) site
  key and secret key (free)

## Installation

```bash
git clone <repo-url>
cd trackapp
```

### 1. Install dependencies

```bash
bun install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in the required values:

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Yes | Cloudflare Turnstile site key (public) |
| `TURNSTILE_SECRET_KEY` | Yes | Cloudflare Turnstile secret key (server-only) |
| `EXTERNAL_AUTH_URL` | Yes | Auth token endpoint |
| `EXTERNAL_TRACKING_API_URL` | Yes | Tracking API base URL |
| `TRACKING_REFERER` | No | `Referer` header sent to the tracking API (default: `https://cademinhaentrega.com.br/`) |
| `TRACKING_CARRIER` | No | `Carrier` header sent to the tracking API (default: `201801`) |

### 3. Start the development server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Usage

### Web interface

1. Open the app in your browser.
2. Enter a tracking number (e.g. `290457511`).
3. Complete the Turnstile challenge.
4. View the shipment timeline with status, location, and description for each
   event.

### API

**`POST /api/tracking`** — Look up a shipment.

```http
POST /api/tracking
Content-Type: application/json

{
  "trackingNumber": "290457511",
  "turnstileToken": "<token-from-widget>"
}
```

**Success response (200):**

```json
{
  "trackingNumber": "123456789",
  "totalEvents": 5,
  "events": [
    {
      "id": "12a4f5ef0242ffa35476cd311",
      "timestamp": "2026-06-09T18:29:59Z",
      "status": "Solicitação Realizada",
      "description": "Remessa criada em sistema",
      "location": "—",
      "comments": "Arquivo EDI"
    }
  ]
}
```

**Error responses:**

| Status | Condition |
|---|---|
| 400 | Missing `trackingNumber`, missing `turnstileToken`, invalid JSON, or failed captcha |
| 404 | Tracking number not found |
| 502 | Upstream auth or tracking API unavailable |

### Docker

```bash
docker build -t trackapp .
docker run -p 3000:3000 --env-file .env.local trackapp
```

The image uses Bun's slim runtime and Next.js standalone output — no
`node_modules` bloat.

## Project structure

```
app/
  api/tracking/route.ts    # POST handler — captcha verify → auth → proxy
  layout.tsx                # Root layout (fonts, global styles)
  page.tsx                  # Home page
components/
  TrackingForm.tsx          # 'use client' — input + captcha + results
  TrackingResults.tsx       # Shipment event timeline
  TurnstileWidget.tsx       # 'use client' — Cloudflare Turnstile wrapper
lib/
  _token/
    auth.ts                 # Fetch JWT from external auth endpoint
    cache.ts                # In-memory TTL cache with request dedup
    resolve.ts              # Cache-first token resolver
  _tracking/api.ts          # External tracking API client + normalisation
  _turnstile/verify.ts      # Server-side Turnstile verification
  _types/tracking.ts        # Shared TypeScript types
```

## Troubleshooting

**"Captcha widget error" in the browser**

The Turnstile site key must match the domain the app is served from. During
local development, use `localhost` as the domain in your Cloudflare Turnstile
site settings. The test keys (`1x00000000000000000000AA` /
`1x0000000000000000000000000000000AA`) always pass on any domain.

**502 from the tracking API**

The upstream tracking service requires specific browser headers (`Referer`,
`Carrier`, `User-Agent`). The defaults in `.env.example` match what a standard
browser sends. If the API tightens these checks, override `TRACKING_REFERER`
and `TRACKING_CARRIER` in `.env.local`.

**Auth token errors after deploy**

The in-memory token cache is lost on server restart or cold start. The app
handles this transparently — the first request after a cold start fetches a
fresh token automatically.

## Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feat/my-feature`).
3. Make your changes and verify the build passes (`bun run build`).
4. Open a pull request with a clear description of the change.

Keep changes focused and avoid bundling unrelated work. This project follows
conventional Next.js patterns — Server Components by default, `'use client'`
only where interactivity is needed.

## License

Trackapp is licensed under the **GNU Affero General Public License v3.0**
(AGPL-3.0). See [LICENSE](./LICENSE) for the full text.

Copyright (C) 2026 Zoe Leullier.
