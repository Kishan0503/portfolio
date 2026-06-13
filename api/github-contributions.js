/**
 * Vercel serverless function: returns the GitHub contribution calendar for the
 * configured user. Uses a server-side PAT (GITHUB_TOKEN) so the token is never
 * exposed to the browser. The contribution calendar is not available via the
 * REST API, so we use GraphQL.
 */
const USERNAME = 'Kishan0503'

export default async function handler(req, res) {
  const token = process.env.GITHUB_TOKEN
  if (!token) {
    res.status(500).json({ error: 'GITHUB_TOKEN not configured' })
    return
  }

  const query = `query {
    user(login: "${USERNAME}") {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays { date contributionCount color weekday }
          }
        }
      }
    }
  }`

  try {
    const r = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'kishan-portfolio',
      },
      body: JSON.stringify({ query }),
    })

    const data = await r.json()
    const calendar = data?.data?.user?.contributionsCollection?.contributionCalendar ?? null

    if (!calendar) {
      res.status(502).json({ error: 'No contribution data', details: data?.errors ?? null })
      return
    }

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
    res.status(200).json(calendar)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch contributions', message: String(err) })
  }
}
