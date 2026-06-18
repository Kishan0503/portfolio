import Section from '../layout/Section'
import GlassCard from '../effects/GlassCard'
import useGsapReveal from '../../hooks/useGsapReveal'
import { timeline } from '../../data/content'

export default function Timeline() {
  const ref = useGsapReveal()

  return (
    <Section
      id="timeline"
      innerRef={ref}
      eyebrow="Neural Career Path"
      title="Career timeline"
      intro="Two roles rendered as connected nodes along a neural path — each node a step up in scope and responsibility."
    >
      <div className="relative">
        {/* the animated neural path */}
        <div
          className="absolute left-4 top-2 bottom-2 w-px bg-gradient-to-b from-purple-bright via-purple to-cyan md:left-1/2 md:-translate-x-1/2"
          aria-hidden="true"
        />

        <ul className="space-y-10">
          {timeline.map((role, i) => (
            <li
              key={role.company}
              data-reveal
              className={`relative pl-12 md:w-1/2 md:pl-0 ${
                i % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:ml-auto md:pl-12'
              }`}
            >
              {/* node — centered on the path line (left-4 on mobile, center on desktop) */}
              <span
                className={`absolute top-7 left-4 -translate-x-1/2 ${
                  i % 2 === 0 ? 'md:left-full' : 'md:left-0'
                }`}
                aria-hidden="true"
              >
                <span className="relative flex h-4 w-4 items-center justify-center">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-bright/50" />
                  <span className="relative h-3.5 w-3.5 rounded-full bg-purple-bright shadow-[0_0_12px_2px_rgba(168,85,247,0.7)] ring-2 ring-base" />
                </span>
              </span>

              <GlassCard hover className="p-6">
                <p className="text-xs font-medium uppercase tracking-wide text-purple-bright">{role.period}</p>
                <h3 className="mt-1 font-display text-xl font-semibold">{role.title}</h3>
                <p className="text-text-muted">{role.company}</p>
                <p className="mt-2 inline-block rounded-full border border-glass-border bg-glass px-3 py-1 text-xs text-cyan">
                  {role.growth}
                </p>
                <p className="mt-3 text-sm text-text-muted">{role.highlight}</p>
              </GlassCard>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}
