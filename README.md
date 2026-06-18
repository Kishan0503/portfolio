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

## Hero particle face

The hero's living AI avatar is a real human head rendered as a particle/node
network. The head geometry is extracted from a 3D scan at build time by
[`scripts/extract-face.mjs`](scripts/extract-face.mjs) into
[`src/data/faceMesh.js`](src/data/faceMesh.js) (vertices + edges), then rendered
on a plain canvas — no three.js at runtime.

To regenerate the mesh, download the source model and run the script:

```bash
curl -L -o head.glb \
  https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/LeePerrySmith/LeePerrySmith.glb
node scripts/extract-face.mjs head.glb 0.9 0.32 -0.1 0.052 0.03 0.07
# args: <ratio> <neck-cut> <cull> <node-spacing> <occlusion-cell> <depth-tol>
```

Pipeline: weld → normalize → crop to head → **quadric edge-collapse**
simplification (`meshoptimizer`, topology-preserving) → back-face cull → area-
weighted surface sampling → **z-occlusion** (keep only the frontmost/outer layer
per screen cell, so the eyeball-behind-lids, inner-mouth, and skull-behind-ears
don't render) → **variable-spacing Poisson-disk thinning** (sparse on flat
regions, dense on detailed feature regions) → **kNN** edges. A `feature` mask is then computed from **crease +
silhouette detection** (mesh edges whose adjacent faces meet at a sharp angle, or
that lie on the visible border) — these trace the eyelid creases, lip border,
nostrils, brow ridge, nasolabial line, jaw and face outline. The renderer draws
those nodes/edges brighter so the feature contours read clearly, while the rest
of the face stays clean and light. `<node-spacing>` is the flat-region spacing;
features auto-densify to ~0.42× of it.

## Credits

- **3D head model:** "Lee Perry-Smith" head by [Infinite-Realities](https://ir-ltd.net/),
  licensed under [CC-BY 3.0](https://creativecommons.org/licenses/by/3.0/). Used
  to generate the hero particle face.
