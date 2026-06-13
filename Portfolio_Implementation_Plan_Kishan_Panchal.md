# Implementation Plan — Portfolio Website

**Project:** Kishan Panchal — AI Command Center Portfolio
**Stack:** React + Vite, Tailwind CSS, GSAP + ScrollTrigger, Lenis, tsParticles, @react-three/fiber, Vercel (serverless)
**Companion doc:** `Portfolio_PRD_Kishan_Panchal.md`
**Date:** 13 June 2026

This plan is sequenced so each phase builds on the last. Phases 1–4 lay the foundation; Phase 5 builds the 12 sections; Phases 6–10 finish, harden, and ship.

---

## Phase 0 — Prerequisites & Content to Finalize (before any code)

**Checklist of inputs needed:**
- [x] GitHub classic PAT (`read:user`) generated — to be added to Vercel as `GITHUB_TOKEN` (Phase 9).
- [x] Profile photo (`ProfileImage.jpg`).
- [x] Resume PDF (`Kishan-Panchal-CV.pdf`).
- [ ] Favicon/logo — none supplied; plan is to generate a simple "KP" monogram.

**Content reconciliation (decide before building Phase 5):**
1. **AI Email Writer LLM:** CV says **GPT-4**; earlier note said GPT-3.5. → *Recommend: GPT-4 (per CV).*
2. **Leadership team size:** Dashboard set to **5–15** (your instruction). CV/timeline show a **20-developer** lead at Openxcell on Kairos OS. → *Plan: Dashboard shows 5–15 as the typical per-project range; the timeline + Kairos OS card keep the 20-developer detail. Confirm this split reads correctly to you.*
3. **Kairos OS as a 4th project:** Your CV's strongest current work is **Kairos OS** (Tech Lead, 12+ microservices). The PRD locked 3 projects. → *Recommend adding Kairos OS to the Project Showcase (project data is array-driven, so adding one card is trivial).* Confirm yes/no.
4. **Featured project:** Confirm **AI Email Writer** stays the featured/hero project (its pipeline drives the AI Workflow Visualization). Alternative: Kairos OS.

> These are the only blockers. Everything else below can proceed.

---

## Phase 1 — Project Scaffolding

**Step 1.1 — Initialize the project**
```bash
npm create vite@latest portfolio -- --template react
cd portfolio
npm install
```

**Step 1.2 — Install dependencies**
```bash
# Animation & scroll
npm install gsap lenis
# Particles
npm install @tsparticles/react @tsparticles/slim
# Minimal 3D
npm install three @react-three/fiber @react-three/drei
# Icons
npm install lucide-react
# Styling
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Step 1.3 — Folder structure**
```
portfolio/
├─ api/                      # Vercel serverless functions
│  └─ github-contributions.js
├─ public/
│  ├─ profile.jpg
│  ├─ Kishan-Panchal-CV.pdf
│  └─ favicon.svg
├─ src/
│  ├─ components/
│  │  ├─ layout/            # Nav, Footer, SmoothScroll wrapper
│  │  ├─ effects/           # ParticleBackground, Hero3D, GlassCard
│  │  └─ sections/          # one file per section (12)
│  ├─ hooks/                # useReducedMotion, useGsapReveal, useGithubData
│  ├─ data/                 # content.js (all static content)
│  ├─ lib/                  # gsap setup, lenis setup, api clients
│  ├─ styles/               # globals.css
│  ├─ App.jsx
│  └─ main.jsx
├─ .env.local               # GITHUB_TOKEN (local only; gitignored)
└─ vite.config.js
```

**Step 1.4 — Repo & Vercel**
- Create the GitHub repo under `Kishan0503`, push the scaffold.
- Import the repo into Vercel (auto-detects Vite). Don't add env vars yet — done in Phase 9.

---

## Phase 2 — Design System Foundation

**Step 2.1 — Fonts**
- Load **Space Grotesk** (display) and **Inter** (body) via `<link>` in `index.html` or self-host in `public/fonts` for performance.

**Step 2.2 — Tailwind theme** (`tailwind.config.js`)
- Map PRD palette to theme tokens: `bg-base #05060A`, `bg-panel #0A0B14`, `deep-blue #0B1E3F`/`#1A2B6B`, `purple #7C3AED`, `purple-bright #A855F7`, optional `cyan #22D3EE`.
- Register font families `display` (Space Grotesk) and `sans` (Inter).
- Extend `boxShadow` with a reusable purple "glow" and `backdropBlur` scale.

**Step 2.3 — Global styles** (`src/styles/globals.css`)
- CSS variables mirroring the palette (so JS/canvas/3D can read them).
- Base dark background, default text color, selection color (purple).
- A `.glass` utility class: translucent fill, 1px translucent border, backdrop-blur, soft purple glow shadow, rounded corners.
- `prefers-reduced-motion` media query block that neutralizes transitions.

**Step 2.4 — Reusable `GlassCard` component**
- Wraps children in the glass treatment; used by Recruiter Card, project cards, dashboard tiles, chatbot, contact.

---

## Phase 3 — Core Motion & Layout Infrastructure

**Step 3.1 — `useReducedMotion` hook**
- Reads the media query; returns boolean. Every animated/3D/particle module checks it and renders a static fallback when `true`.

**Step 3.2 — Lenis smooth scroll** (`src/lib/lenis.js` + a `SmoothScroll` wrapper)
- Initialize Lenis once at app root. Disable when reduced-motion is on.

**Step 3.3 — GSAP + ScrollTrigger synced to Lenis** (`src/lib/gsap.js`)
- Register ScrollTrigger. Drive ScrollTrigger from Lenis's scroll event and `gsap.ticker` so scroll-linked animations stay in sync:
```js
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
```

**Step 3.4 — `useGsapReveal` hook**
- Standard entry reveal (fade + slide/scale) via ScrollTrigger, used by every section for consistent motion. Skips animation under reduced-motion.

**Step 3.5 — Particle network background** (`ParticleBackground`)
- tsParticles slim, low particle count, low opacity, slow drift, link lines, gentle mouse parallax. Fixed behind all content. Disabled on mobile and under reduced-motion.

**Step 3.6 — Minimal 3D hero element** (`Hero3D`)
- `@react-three/fiber` canvas with **one** restrained object (slow-rotating wireframe icosahedron/torus, purple emissive). Lazy-loaded (`React.lazy` + `Suspense`). Disabled on mobile and under reduced-motion (static SVG fallback).

**Step 3.7 — App shell**
- Fixed top nav with anchor links to all sections + scroll-progress indicator.
- `App.jsx` renders: `ParticleBackground` → `Nav` → 12 `<section>`s in order → `Footer`.

---

## Phase 4 — Data Layer

**Step 4.1 — Static content file** (`src/data/content.js`)
Single source of truth for all copy, so sections stay presentational:
- `identity` (name, title, tagline, experience, location, availability, socials)
- `about` (bio + architecture-node structure)
- `skills` (grouped: Backend, AI/ML, Databases, Cloud & DevOps, Architecture, Leadership)
- `timeline` (2 roles, with growth: Python Dev→Senior; Software Engineer→Tech Lead)
- `projects` (featured + showcase array; tech, role, highlights)
- `workflow` (AI Email Writer pipeline steps)
- `leadership` (team size 5–15, ~2–3 yrs, owned areas, outcomes)
- `chatbot` (Q&A pairs)
- `contact` (email, phone, socials, resume path)

**Step 4.2 — GitHub REST client** (`src/lib/github.js` + `useGithubData` hook)
- Fetch `https://api.github.com/users/Kishan0503` (repo count, followers).
- Fetch `/users/Kishan0503/repos?per_page=100` and aggregate `language` into a sorted breakdown.
- Unauthenticated (60 req/hr). Cache in state; show skeletons while loading, graceful fallback on rate-limit/error.

**Step 4.3 — Serverless function for contributions** (`api/github-contributions.js`)
- Runs on Vercel server-side; uses `GITHUB_TOKEN` (never exposed to client). Calls GraphQL `contributionsCollection` and returns the weekly calendar:
```js
export default async function handler(req, res) {
  const query = `query {
    user(login: "Kishan0503") {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks { contributionDays { date contributionCount color weekday } }
        }
      }
    }
  }`;
  const r = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });
  const data = await r.json();
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
  res.status(200).json(data?.data?.user?.contributionsCollection?.contributionCalendar ?? null);
}
```
- Frontend fetches `/api/github-contributions` and renders the calendar heatmap (purple intensity scale).

---

## Phase 5 — Build the 12 Sections (in order)

For each section: purpose · content source · key UI · animation · data.

**5.1 — AI Command Center Hero**
Name, "Software Engineer", tagline, CTAs (View Projects / Download Resume / Contact). Particle bg + `Hero3D`. Staggered GSAP intro on load; "system online" micro-detail.

**5.2 — Recruiter Snapshot Card**
Glass card: role, 4.4 yrs, core stack chips, **Ahmedabad, Gujarat, India (IST, UTC+5:30)**, **Availability: Anytime**, **Download Resume (PDF)** button, social links. Reveal on scroll.

**5.3 — Architecture-Based About Section**
Bio as a system diagram: Backend core node connected to AI/ML and Leadership nodes; animated connector lines draw in on scroll. Copy from `about`.

**5.4 — Skill Universe**
Grouped skill clusters (Backend / AI/ML / Databases / Cloud & DevOps / Architecture / Leadership) with emphasis on primary skills. Staggered reveal; optional gentle float. (No arbitrary % bars.)

**5.5 — Neural Network Career Timeline**
Two role-nodes on an animated neural path: Samcom (Mar 2022 – Jun 2025, Python Dev → Senior) and Openxcell (Jul 2025 – Present, Software Engineer → Tech Lead, 20-dev lead on Kairos OS). Path/nodes light up on scroll.

**5.6 — Featured AI Project (AI Email Writer)**
Hero treatment: title, problem, stack (FastAPI · LangChain · GPT-4 · PostgreSQL), role (Backend Dev), highlights (persona/tone control, multi-model orchestration, streaming responses). Prominent glass panel with glow.

**5.7 — Project Showcase**
Cards for **XEMI** (Django DRF · FastAPI · Celery · PostgreSQL · AWS; ICEGATE/customs, real-time tracking, doc AI) and **AI Marketing Agents** (Vapi.ai · prompt engineering; +25% lead conversion). *+ Kairos OS card if confirmed (Phase 0 item 3).* Data-driven map over `projects`.

**5.8 — AI Workflow Visualization**
Animated left-to-right pipeline of AI Email Writer: User inputs (style · persona · product · tone) → LangChain prompt construction → GPT-4 generation → Generated email → PostgreSQL → Display. Nodes/connectors animate sequentially on scroll.

**5.9 — Leadership Dashboard**
Dashboard tiles: team size **5–15**, **~2–3 yrs** leadership, owned **mentoring / code reviews / client comms / delivery**, outcome **3 projects to production + live clients**. Leadership tagline. Count-up animation on numbers.

**5.10 — GitHub Intelligence Center**
Live: repo count + followers (REST), top languages breakdown (REST aggregate), contribution heatmap (serverless GraphQL). Skeleton loaders; error/rate-limit fallback. Purple-scale heatmap.

**5.11 — AI Assistant (scripted Q&A)**
See Phase 6.

**5.12 — Futuristic Contact Section**
Email, phone (+91 6356183766), LinkedIn, GitHub, resume download. Mailto or simple form (no backend; if a form, use Formspree/Vercel function — confirm preference). Closing CTA + glow.

---

## Phase 6 — AI Assistant (Scripted Q&A)

- Chat UI in a glass panel: message list + clickable predefined questions (no free-text LLM call).
- State: `messages[]` in React; clicking a question appends Q then its scripted A with a typing-delay effect.
- Seed Q&A from PRD (stack, experience, leadership, AI projects, availability, contact/resume) — final answer copy drafted from `content.js` and reviewed by you.
- Fully static; works offline; zero API cost.

---

## Phase 7 — Responsive & Accessibility

**Responsive**
- Mobile-first breakpoints. On mobile: disable particles + 3D, simplify timeline to vertical, stack dashboard/showcase grids, ensure chatbot and nav are touch-friendly.

**Accessibility**
- Honor `prefers-reduced-motion` everywhere (Phase 3.1).
- Contrast audit on glass panels (muted text over blur is the risk).
- Keyboard navigation for nav, chatbot, CTAs; visible focus states.
- Alt text on profile image; `aria-label`s on icon-only links; semantic landmarks.

---

## Phase 8 — Performance

- Lazy-load 3D (`React.lazy`/`Suspense`) and the particles module.
- Code-split heavy sections; preconnect to fonts and `api.github.com`.
- Compress `profile.jpg` (serve WebP), keep the resume PDF reasonable.
- Cache GitHub responses (serverless `s-maxage`; client state for REST).
- Target: smooth ~50–60fps scroll on mid-range hardware; check Lighthouse (Performance + Accessibility).

---

## Phase 9 — Deployment (Vercel)

1. Push final code to the `Kishan0503` repo.
2. In Vercel project → **Settings → Environment Variables**, add `GITHUB_TOKEN` = your classic PAT (`read:user`). Apply to Production (and Preview if desired).
3. Confirm `api/github-contributions.js` deploys as a serverless function and `/api/github-contributions` returns data.
4. Trigger a production deploy; verify all live-data sections render.
5. (Optional) Add a custom domain.

---

## Phase 10 — QA Checklist (pre-launch)

- [ ] All 12 sections present, in order, populated with correct content.
- [ ] Resume downloads correctly; all social/contact links open right targets.
- [ ] GitHub repo count, languages, and contribution heatmap load live (and degrade gracefully when rate-limited).
- [ ] Chatbot answers all seeded questions correctly.
- [ ] Animations smooth; reduced-motion fully respected; no layout shift.
- [ ] Mobile layout verified (particles/3D off, timeline vertical).
- [ ] No secrets in the client bundle (token only server-side).
- [ ] Lighthouse: Performance & Accessibility acceptable.
- [ ] Content reconciliation items (Phase 0) resolved.

---

## Appendix

**A. Environment variables**
| Name | Where | Purpose |
|---|---|---|
| `GITHUB_TOKEN` | Vercel (server) + `.env.local` (gitignored) | Classic PAT, `read:user`, for contribution GraphQL |

**B. Key dependencies**
`react`, `vite`, `tailwindcss`, `gsap`, `lenis`, `@tsparticles/react`, `@tsparticles/slim`, `three`, `@react-three/fiber`, `@react-three/drei`, `lucide-react`.

**C. Open confirmations before Phase 5**
1. AI Email Writer LLM = GPT-4? · 2. Leadership 5–15 vs 20 split OK? · 3. Add Kairos OS as 4th project? · 4. Featured project stays AI Email Writer? · 5. Contact section: mailto vs form (Formspree/serverless)?
