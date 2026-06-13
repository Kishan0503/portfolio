# Kishan Panchal — Portfolio

A single-page, long-scroll developer portfolio themed as an **AI Command Center** — dark, glassmorphic, motion-driven. Built for recruiters and engineering hiring managers.

## Stack

- **React 18 + Vite**
- **Tailwind CSS** (glassmorphism design system)
- **GSAP + ScrollTrigger** synced to **Lenis** smooth scroll
- **tsParticles** (slim) particle-network background
- **three.js** via `@react-three/fiber` + `drei` (one restrained 3D hero element)
- **lucide-react** icons
- **Vercel serverless functions** for live GitHub contributions + the contact form (Resend)

## Local development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview the production build
```

> Note: the `/api/*` serverless functions only run on Vercel (or `vercel dev`). In plain `npm run dev`, the contribution heatmap and contact form show graceful fallbacks.

## Environment variables

Copy `.env.example` → `.env` and fill in:

| Name | Purpose |
|---|---|
| `GITHUB_TOKEN` | Classic PAT (`read:user`) for the GitHub contribution graph (GraphQL). Server-side only. |
| `RESEND_API_KEY` | Resend API key for the contact-form email function. Server-side only. |

`.env` is gitignored — never commit secrets.

## Content

All copy lives in [`src/data/content.js`](src/data/content.js) — the single source of truth. Edit there; sections are presentational.

## Deployment

See [`DEPLOY.md`](DEPLOY.md) for the full Vercel checklist.
