import { Github, Users, FolderGit2, AlertCircle } from 'lucide-react'
import Section from '../layout/Section'
import GlassCard from '../effects/GlassCard'
import useGsapReveal from '../../hooks/useGsapReveal'
import { useGithubProfile, useGithubLanguages, useGithubContributions } from '../../hooks/useGithubData'
import { GITHUB_USERNAME, socials } from '../../data/content'

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-md bg-white/5 ${className}`} />
}

function StatTiles() {
  const { data, loading, error } = useGithubProfile()

  if (loading) {
    return (
      <>
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </>
    )
  }
  if (error || !data) {
    return (
      <GlassCard className="col-span-2 flex items-center gap-3 p-5 text-sm text-text-muted">
        <AlertCircle size={18} className="text-purple-bright" /> Live GitHub stats are unavailable
        right now (rate-limited). Visit the profile directly.
      </GlassCard>
    )
  }
  return (
    <>
      <GlassCard className="p-5">
        <FolderGit2 className="mb-2 text-purple-bright" size={20} />
        <p className="font-display text-3xl font-bold">{data.public_repos}</p>
        <p className="text-sm text-text-muted">Public repos</p>
      </GlassCard>
      <GlassCard className="p-5">
        <Users className="mb-2 text-cyan" size={20} />
        <p className="font-display text-3xl font-bold">{data.followers}</p>
        <p className="text-sm text-text-muted">Followers</p>
      </GlassCard>
    </>
  )
}

function Languages() {
  const { data, loading, error } = useGithubLanguages()

  if (loading) return <Skeleton className="h-40" />
  if (error || !data || data.length === 0) {
    return (
      <GlassCard className="p-5 text-sm text-text-muted">
        Language breakdown unavailable right now.
      </GlassCard>
    )
  }
  return (
    <GlassCard className="p-6">
      <h3 className="mb-4 font-display text-lg font-semibold">Top languages</h3>
      <ul className="space-y-3">
        {data.map((lang) => (
          <li key={lang.name}>
            <div className="mb-1 flex justify-between text-sm">
              <span>{lang.name}</span>
              <span className="text-text-muted">{lang.pct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple to-purple-bright"
                style={{ width: `${lang.pct}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </GlassCard>
  )
}

// Map contribution count to a purple-intensity class.
function levelClass(count, max) {
  if (count === 0) return 'bg-white/[0.04]'
  const r = count / (max || 1)
  if (r > 0.66) return 'bg-purple-bright'
  if (r > 0.33) return 'bg-purple'
  return 'bg-purple/40'
}

function Heatmap() {
  const { data, loading, error } = useGithubContributions()

  if (loading) return <Skeleton className="h-44" />
  if (error || !data?.weeks) {
    return (
      <GlassCard className="flex items-center gap-3 p-5 text-sm text-text-muted">
        <AlertCircle size={18} className="text-purple-bright" />
        Contribution graph will populate once deployed with a server-side token.
      </GlassCard>
    )
  }

  const max = Math.max(...data.weeks.flatMap((w) => w.contributionDays.map((d) => d.contributionCount)), 1)

  return (
    <GlassCard className="overflow-x-auto p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">Contributions</h3>
        <span className="text-sm text-text-muted">{data.totalContributions} in the last year</span>
      </div>
      <div className="flex gap-1">
        {data.weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.contributionDays.map((day) => (
              <span
                key={day.date}
                title={`${day.contributionCount} on ${day.date}`}
                className={`h-2.5 w-2.5 rounded-sm ${levelClass(day.contributionCount, max)}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-end gap-1 text-xs text-text-muted">
        Less
        <span className="h-2.5 w-2.5 rounded-sm bg-white/[0.04]" />
        <span className="h-2.5 w-2.5 rounded-sm bg-purple/40" />
        <span className="h-2.5 w-2.5 rounded-sm bg-purple" />
        <span className="h-2.5 w-2.5 rounded-sm bg-purple-bright" />
        More
      </div>
    </GlassCard>
  )
}

export default function GithubIntel() {
  const ref = useGsapReveal()

  return (
    <Section
      id="github"
      innerRef={ref}
      eyebrow="GitHub Intelligence Center"
      title="Live from GitHub"
      intro={
        <>
          Real-time activity for{' '}
          <a href={socials.github} target="_blank" rel="noreferrer" className="text-purple-bright hover:underline">
            @{GITHUB_USERNAME}
          </a>
          .
        </>
      }
    >
      <div data-reveal className="grid gap-6 lg:grid-cols-3">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-1">
          <StatTiles />
        </div>
        <div className="lg:col-span-2">
          <Languages />
        </div>
      </div>
      <div data-reveal className="mt-6">
        <Heatmap />
      </div>
      <div data-reveal className="mt-6">
        <a
          href={socials.github}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-glass-border bg-glass px-5 py-3 text-sm transition hover:border-purple-bright/40"
        >
          <Github size={18} /> View full profile
        </a>
      </div>
    </Section>
  )
}
