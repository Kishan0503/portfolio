import { GITHUB_USERNAME } from '../data/content'

const BASE = 'https://api.github.com'

/** Fetch profile basics (repo count, followers, etc.) — unauthenticated. */
export async function fetchProfile() {
  const res = await fetch(`${BASE}/users/${GITHUB_USERNAME}`)
  if (!res.ok) throw new Error(`GitHub profile request failed (${res.status})`)
  return res.json()
}

/** Fetch repos and aggregate primary languages into a sorted breakdown. */
export async function fetchLanguages() {
  const res = await fetch(`${BASE}/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`)
  if (!res.ok) throw new Error(`GitHub repos request failed (${res.status})`)
  const repos = await res.json()

  const counts = {}
  for (const repo of repos) {
    if (repo.fork) continue
    if (repo.language) counts[repo.language] = (counts[repo.language] || 0) + 1
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count, pct: Math.round((count / total) * 100) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
}

/** Fetch the contribution calendar from our serverless function (server uses a PAT). */
export async function fetchContributions() {
  const res = await fetch('/api/github-contributions')
  if (!res.ok) throw new Error(`Contributions request failed (${res.status})`)
  const data = await res.json()
  if (!data) throw new Error('No contribution data')
  return data
}
