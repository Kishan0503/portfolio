import { ArrowUpRight } from 'lucide-react'
import Section from '../layout/Section'
import GlassCard from '../effects/GlassCard'
import useGsapReveal from '../../hooks/useGsapReveal'
import { projects, featuredProject } from '../../data/content'

export default function Projects() {
  const ref = useGsapReveal()

  return (
    <Section
      id="projects"
      innerRef={ref}
      eyebrow="Project Showcase"
      title="Selected work"
      intro={`Beyond the featured ${featuredProject.name}, here's a cross-section of backend and AI work.`}
    >
      <div className="grid gap-6 md:grid-cols-3">
        {projects.map((p) => (
          <GlassCard key={p.name} data-reveal hover className="flex flex-col p-6">
            <div className="mb-3 flex items-center justify-between">
              <span className="rounded-full border border-glass-border bg-glass px-3 py-1 text-xs text-cyan">
                {p.tag}
              </span>
              <ArrowUpRight size={18} className="text-text-muted" />
            </div>
            <h3 className="font-display text-xl font-semibold">{p.name}</h3>
            <p className="text-xs text-purple-bright">{p.role}</p>
            <p className="mt-3 flex-1 text-sm text-text-muted">{p.description}</p>

            <ul className="mt-4 space-y-1.5">
              {p.highlights.map((h) => (
                <li key={h} className="flex items-center gap-2 text-xs text-text-muted">
                  <span className="h-1 w-1 rounded-full bg-purple-bright" /> {h}
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {p.stack.map((s) => (
                <span key={s} className="rounded-md border border-glass-border bg-glass px-2 py-0.5 text-xs text-text-primary">
                  {s}
                </span>
              ))}
            </div>
          </GlassCard>
        ))}
      </div>
    </Section>
  )
}
