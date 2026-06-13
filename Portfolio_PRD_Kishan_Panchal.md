# Product Requirements Document — Portfolio Website

**Owner:** Kishan Panchal
**Type:** Personal developer portfolio (single-page, long-scroll)
**Version:** 1.0 (High-Level PRD)
**Date:** 13 June 2026

---

## 1. Overview

A single-page, long-scroll portfolio that positions Kishan Panchal as a backend-focused Software Engineer with strong AI/ML and team-leadership credentials. The experience is themed as an "AI Command Center" — dark, futuristic, glass-paneled, with motion-driven storytelling as the user scrolls. The primary audience is **recruiters and engineering hiring managers**, with a secondary audience of potential clients and collaborators.

**Primary goal:** convert a recruiter visit into a contact/resume download within the first two screens, while letting deeper visitors explore projects, leadership, and live GitHub activity.

---

## 2. Tech Stack & Build Decision

**Decision: React + Vite (not a single HTML file).**

Rationale: 12 animated sections, live GitHub API calls with loading/error states, a stateful scripted chatbot, and coordinated GSAP + Lenis + particles + minimal 3D are far more maintainable as components than as one monolithic file. Vite gives fast HMR for animation tuning, and Vercel auto-detects the framework for one-command deploys.

| Concern | Choice |
|---|---|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS (utility-first; ideal for glassmorphism) + a few custom CSS vars |
| Smooth scroll | Lenis |
| Animation | GSAP + ScrollTrigger (synced to Lenis) |
| Particle background | tsParticles (or a lightweight custom canvas network) |
| Minimal 3D | three.js via @react-three/fiber + drei (kept deliberately light) |
| Icons | lucide-react |
| GitHub data | GitHub REST API (+ a Vercel serverless function for the contribution graph — see §6) |
| Hosting | Vercel (connected to the GitHub repo Kishan will create) |

---

## 3. Design System

**Theme:** Dark, futuristic, "command center."

**Color palette**
| Token | Value | Use |
|---|---|---|
| `--bg-base` | `#05060A` | Page background (near-black) |
| `--bg-panel` | `#0A0B14` | Section backgrounds |
| `--deep-blue` | `#0B1E3F` / `#1A2B6B` | Structural accents, gradients |
| `--purple` | `#7C3AED` | Primary glow / brand accent |
| `--purple-bright` | `#A855F7` | Highlights, hover states |
| `--glass` | `rgba(255,255,255,0.04)` | Glass panel fill |
| `--glass-border` | `rgba(255,255,255,0.08)` | Glass panel borders |
| `--text-primary` | `#F5F6FA` | Headings/body |
| `--text-muted` | `#9AA3B2` | Secondary text |

(Optional micro-accent: a restrained cyan `#22D3EE` for "live"/active states, used sparingly so it doesn't compete with the blue+purple core.)

**Typography:** Space Grotesk (display/headings) + Inter (body/UI).

**Visual effects**
- Glassmorphism: frosted panels (`backdrop-blur`, subtle border, soft purple glow shadow).
- Subtle particle-network background (low opacity, slow drift, gentle mouse parallax).
- Purple/blue glow accents on key CTAs and active elements.
- Minimal 3D: one or two restrained elements only (e.g., a slow-rotating wireframe object in the hero). No heavy scenes.

**Motion principles**
- Lenis-driven smooth scroll across the whole page.
- GSAP ScrollTrigger reveals: fade/slide/scale on section entry.
- Respect `prefers-reduced-motion` — disable heavy animation and particles when set.
- Performance budget: 3D and particles must not drop the page below ~50fps on a mid-range laptop.

---

## 4. Site Structure (12 sections)

Order preserved from the original brief; Achievement Metrics removed.

1. **AI Command Center Hero** — Name, designation (Software Engineer), tagline, primary CTAs (View Projects / Download Resume / Contact). Particle network + one minimal 3D element. Subtle "system online" command-center framing.
2. **Recruiter Snapshot Card** — Glass card with at-a-glance facts: role, 4.4 yrs experience, core stack, location/timezone, availability, **Download Resume (PDF)** button, social links.
3. **Architecture-Based About Section** — Bio presented as a system/architecture diagram (backend at the core, AI/ML and leadership as connected nodes), reflecting his microservices framing.
4. **Skill Universe** — Skills grouped by category with proficiency emphasis (see §5).
5. **Neural Network Career Timeline** — Two roles rendered as connected nodes along an animated "neural" path.
6. **Featured AI Project** — AI Email Writer, given a hero treatment.
7. **Project Showcase Section** — Cards for XEMI and AI Marketing Agents (plus the featured one linked).
8. **AI Workflow Visualization** — Animated pipeline of the AI Email Writer flow.
9. **Leadership Dashboard** — Leadership metrics and ownership areas as a dashboard.
10. **GitHub Intelligence Center** — Live data from GitHub for username `Kishan0503`.
11. **AI Assistant** — Scripted Q&A chatbot (predefined questions/answers; no LLM/backend).
12. **Futuristic Contact Section** — Contact form/links, email, phone, socials, closing CTA.

---

## 5. Content Data

### 5.1 Identity
- **Name:** Kishan Panchal
- **Designation:** Software Engineer
- **Experience:** 4.4 years
- **Focus:** Backend engineering with AI/ML
- **Tagline (proposed):** *"I build intelligent backend systems and machine learning solutions that scale."*

### 5.2 Bio (About)
Full-time software engineer with a backend focus. Hands-on with backend frameworks including FastAPI (microservice architecture) and Django DRF. Experienced in team leadership and daily client communication. Has built AI-related projects using LangChain, LangGraph, RAG, and vector databases.

### 5.3 Contact
- **Email:** kishanpanchal0503@gmail.com
- **Phone:** +91 6356183766
- **GitHub:** https://github.com/Kishan0503/Kishan0503 (username: `Kishan0503`)
- **LinkedIn:** https://www.linkedin.com/in/kishan-panchal-15792622b
- **Location/Timezone:** *To confirm* — assumed India (IST, UTC+5:30) based on phone code; placeholder until confirmed.

### 5.4 Skill Universe (proposed grouping)
- **Backend:** Python, FastAPI (microservices), Django, Django REST Framework, Celery
- **AI/ML:** LangChain, LangGraph, RAG, Vector Databases, Prompt Engineering, GPT-3.5, Vapi.AI
- **Databases:** PostgreSQL
- **Leadership & Practice:** Team leadership, mentoring, code reviews, client communication, delivery ownership

(Proficiency can be shown via grouping + emphasis rather than arbitrary percentages, which read poorly to engineers. Confirm if you'd prefer explicit levels.)

### 5.5 Career Timeline
| Period | Company | Title | Highlight |
|---|---|---|---|
| Mar 2022 – Jun 2025 | Samcom Technobrains Pvt. Ltd. | Python Developer | Developed leadership, client communication, and the ability to handle projects in critical situations. |
| Jul 2025 – Present | Openxcell Technolab | Software Engineer | Led a 20-member team on a single project; earned client trust through clear product guidance, kept the project on track, and delivered within deadline. |

### 5.6 Projects

**Featured — AI Email Writer**
- AI-based email generator that produces email content based on user-selected writing style, persona, product details, and tone.
- Stack: LangChain, GPT-3.5, PostgreSQL.
- Role: Backend Developer.

**XEMI**
- Platform for importers/exporters to track shipments/containers live, with document extraction surfacing live data, plus custom clearance for clearing customs and duties.
- Stack: Django DRF, Celery, PostgreSQL.
- Role: Backend Developer.

**AI Marketing Agents**
- AI voice-calling agents for product marketing, built with the Vapi.AI third-party platform and implemented via prompt engineering.
- Stack: Vapi.AI, Prompt Engineering.
- Role: Backend Developer.

### 5.7 AI Workflow Visualization (Featured project pipeline)
Animated, left-to-right pipeline for AI Email Writer:
`User inputs (style · persona · product · tone)` → `Prompt construction (LangChain)` → `GPT-3.5 generation` → `Generated email` → `Persisted to PostgreSQL` → `Displayed to user`

### 5.8 Leadership Dashboard
- **Leadership tagline (proposed):** *"Leading from the backend — turning ideas into production-ready systems and lasting client trust."*
- **Team size led:** 5–15 members per project
- **Duration in leadership capacity:** ~2–3 years
- **Owned:** mentoring, code reviews, client communication, delivery
- **Outcomes:** brought 3 projects to production-ready state and onboarded live clients for them

> Note: §5.5 lists a 20-member team lead at Openxcell, while the dashboard states 5–15. Both are presented as given; confirm whether the dashboard should reflect the 20-member figure or keep the 5–15 range.

### 5.9 AI Assistant — Scripted Q&A
Static, predefined question→answer pairs (no LLM, no backend). Suggested seed questions:
- "What's your tech stack?"
- "How many years of experience do you have?"
- "Have you led a team?"
- "What kind of AI projects have you built?"
- "Are you open to opportunities?"
- "How do I contact you / get your resume?"

Final answer copy to be drafted from this PRD's content and reviewed by Kishan.

---

## 6. Technical Considerations

**GitHub Intelligence Center (live data)** — for username `Kishan0503`:
- **Repo count, followers, profile basics:** GitHub REST API (`/users/Kishan0503`) — unauthenticated, ~60 requests/hour. Sufficient for a portfolio with light caching.
- **Language breakdown:** aggregate from `/users/Kishan0503/repos`.
- **Contribution graph (decision point):** *Not available via the REST API.* Two viable paths:
  - **(A) Recommended:** a small Vercel serverless function that calls the GitHub **GraphQL API** with a personal access token stored as a server-side environment variable (token never exposed to the browser). Returns clean contribution data for a custom-rendered graph.
  - **(B) Simpler:** embed a third-party contribution-chart image/service. Faster to ship, less control, external dependency.
- Always handle loading and error/rate-limit states gracefully (skeletons + fallback copy).

**Performance & UX**
- Lazy-load the 3D and particle modules; gate them behind `prefers-reduced-motion`.
- Code-split per section where it helps initial load.
- Mobile: reduce/disable particles and 3D, simplify timeline to a vertical layout.

**Accessibility**
- Sufficient contrast on glass panels (watch muted text over blur).
- Keyboard-navigable nav, chatbot, and CTAs; alt text on the profile image.

---

## 7. Assets

| Asset | Status |
|---|---|
| Profile photo | ✅ Provided (`ProfileImage.jpg`) |
| Resume / CV (PDF) | ⏳ To be supplied (Kishan has it; needs upload for the Download button) |
| Favicon / logo | ⏳ Optional — can generate a simple monogram if none exists |

---

## 8. Open Items to Confirm

1. **Location/timezone** for the Recruiter Snapshot Card (assumed IST until confirmed).
2. **Availability status** — open to work? notice period? what should the card display?
3. **Leadership team size** — 5–15 (dashboard) vs 20 (Openxcell timeline): which to feature where.
4. **Resume PDF** — please upload the file to include the download.
5. **Skill display** — grouped emphasis (recommended) vs explicit proficiency levels.
6. **GitHub contribution graph** — path A (serverless + token) or path B (third-party embed).
7. **Project links** — any live URLs or repos to link from project cards? (Confidential client work can be described without links.)

---

## 9. Deployment

- Source in a new GitHub repository under `Kishan0503`.
- Connected to **Vercel** for automatic deploys on push.
- Environment variable (`GITHUB_TOKEN`) configured in Vercel if contribution-graph path A is chosen.
