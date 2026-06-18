# Deployment Checklist — Vercel

The repo is already on GitHub at `github.com/Kishan0503/portfolio`. Follow these steps to ship.

## 1. Push the code

```bash
git add .
git commit -m "Build AI Command Center portfolio"
git push origin main
```

## 2. Import into Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import `Kishan0503/portfolio`.
2. Vercel auto-detects **Vite** (build: `npm run build`, output: `dist`). No changes needed — `vercel.json` already pins this.
3. The `api/` folder is auto-deployed as serverless functions:
   - `/api/github-contributions` — GitHub contribution graph
   - `/api/contact` — contact-form email

## 3. Add environment variables

In **Vercel → Project → Settings → Environment Variables**, add both (Production + Preview):

| Name | Value | Notes |
|---|---|---|
| `GITHUB_TOKEN` | your classic PAT (`read:user`) | for the contribution graph |
| `RESEND_API_KEY` | your Resend API key | for the contact form |

Then **redeploy** so the functions pick up the variables.

## 4. Verify live

- [ ] All 12 sections render in order.
- [ ] Resume downloads (`/Kishan-Panchal-CV.pdf`).
- [ ] GitHub repo count / followers / languages load (REST).
- [ ] Contribution heatmap loads (`/api/github-contributions` returns data).
- [ ] Contact form sends — submit a test; the email arrives at `kishanpanchal0503@gmail.com`.
- [ ] Chatbot answers all seeded questions.
- [ ] Mobile: particles/3D off, timeline vertical, layout stacks.
- [ ] No secrets in the client bundle (tokens are server-side only).

## Resend note

On Resend's free tier **without a verified domain**, emails send from `onboarding@resend.dev` and can only be delivered to the email address the Resend account was registered with. Confirm that account email is `kishanpanchal0503@gmail.com`. To send from a custom address, verify a domain in Resend and update `FROM_EMAIL` in [`api/contact.js`](api/contact.js).

## 5. (Optional) Custom domain

Add a domain under **Vercel → Project → Settings → Domains**.
