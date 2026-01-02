<p align="center">
  <img src="public/icon.svg" alt="Web Crawler Service icon" width="140" />
</p>

# Web Crawler Service

Web app for analyzing and crawling websites, with results delivered to a user-provided PostgreSQL database. The current build focuses on AI-driven site analysis and report generation; full crawl-to-DB flow is tracked in the PRD roadmap.

## What it does today

- Accepts a URL and generates a structured crawling report via the `/browsing` endpoint
- Optionally uses Browserbase to handle JavaScript-rendered pages
- Provides a `/browsing/session` endpoint for Browserbase sessions and live view URLs

## Roadmap (from PRD)

- NextRows API integration for full-site crawling
- PostgreSQL connection validation and schema creation
- Real-time progress UI and crawl status tracking
- Data ingestion into user-provided databases

## Tech stack

- Frontend: React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query, wouter
- Backend: Bun, Hono, AI SDK v6 (OpenAI provider)

## Getting started

```bash
npm install
```

```bash
# Frontend (Vite)
npm run dev

# Backend (Bun + Hono)
npm run dev:server

# Both together
npm run dev:all
```

## Environment variables

Create `.env.local` (never commit it).

- `OPENAI_API_KEY` (required for `/browsing`)
- `BROWSERBASE_API_KEY` (optional)
- `BROWSERBASE_PROJECT_ID` (optional)
- `PORT` (optional, backend port; defaults to 3001)

## API endpoints (dev)

- `GET /hello` -> health check
- `POST /browsing` -> analyze a website and return a report
- `POST /browsing/session` -> create a Browserbase session

Example request:

```bash
curl -X POST http://localhost:3001/browsing \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'
```

## Scripts

- `npm run dev` - Vite dev server
- `npm run dev:server` - Bun backend with watch mode
- `npm run dev:all` - run frontend + backend
- `npm run build` - typecheck + Vite build
- `npm run preview` - preview production build
- `npm run lint` - Biome check
- `npm run lint:fix` - Biome check with autofix
- `npm run format` - Biome format

## Project structure

```
server/        # Bun + Hono backend
src/           # React frontend
public/        # Static assets (icon.svg)
```

## Security notes

- Do not store PostgreSQL credentials in localStorage or logs
- Handle connection strings carefully; treat them as secrets

## Docs

- `PRD.md` - product requirements and roadmap
- `browsing_report_example.md` - sample browsing report output
