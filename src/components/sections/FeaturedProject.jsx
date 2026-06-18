import { ArrowDown, CheckCircle2, Cpu } from 'lucide-react'
import Section from '../layout/Section'
import GlassCard from '../effects/GlassCard'
import useGsapReveal from '../../hooks/useGsapReveal'
import { featuredProject } from '../../data/content'

function scrollToId(id) {
  const el = document.getElementById(id)
  if (!el) return
  if (window.__lenis) window.__lenis.scrollTo(el, { offset: -72 })
  else el.scrollIntoView({ behavior: 'smooth' })
}

export default function FeaturedProject() {
  const ref = useGsapReveal()

  return (
    <Section id="featured" innerRef={ref} eyebrow="Featured Project" title={featuredProject.name}>
      <GlassCard data-reveal className="relative overflow-hidden p-7 shadow-glow sm:p-10">
        {/* glow accent */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple/25 blur-[100px]" />

        <div className="relative grid gap-8 md:grid-cols-5">
          <div className="md:col-span-3">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple/30 bg-purple/10 px-3 py-1 text-xs text-purple-bright">
              <Cpu size={14} /> {featuredProject.role}
            </div>
            <p className="text-lg font-medium text-text-primary">{featuredProject.tagline}</p>
            <p className="mt-4 text-text-muted">{featuredProject.description}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              {featuredProject.stack.map((s) => (
                <span key={s} className="rounded-lg border border-glass-border bg-glass px-3 py-1.5 text-sm">
                  {s}
                </span>
              ))}
            </div>

            <button
              onClick={() => scrollToId('projects')}
              className="group mt-7 inline-flex items-center gap-2 rounded-lg bg-purple px-5 py-3 font-medium text-white shadow-glow transition hover:bg-purple-bright"
            >
              Explore more projects
              <ArrowDown size={18} className="transition-transform group-hover:translate-y-0.5" />
            </button>
          </div>

          <ul className="space-y-3 md:col-span-2">
            {featuredProject.highlights.map((h) => (
              <li key={h} className="flex items-start gap-3 rounded-xl border border-glass-border bg-glass p-3">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-cyan" />
                <span className="text-sm text-text-primary">{h}</span>
              </li>
            ))}
          </ul>
        </div>
      </GlassCard>
    </Section>
  )
}
