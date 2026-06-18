import { Brain, Database, Rocket, Users } from 'lucide-react'
import Section from '../layout/Section'
import GlassCard from '../effects/GlassCard'
import useGsapReveal from '../../hooks/useGsapReveal'
import { about } from '../../data/content'

const nodeIcons = [Brain, Users, Rocket]

export default function About() {
  const ref = useGsapReveal()

  return (
    <Section
      id="about"
      innerRef={ref}
      eyebrow="System Architecture"
      title="About — engineered like a system"
      intro={about.bio}
    >
      {/* Architecture diagram: backend core wired to connected nodes */}
      <div className="relative grid gap-6 md:grid-cols-3">
        {/* Core node spanning full width on top */}
        <div data-reveal className="md:col-span-3">
          <GlassCard className="relative mx-auto max-w-xl p-6 text-center shadow-glow">
            <span className="mb-3 inline-grid h-12 w-12 place-items-center rounded-xl bg-purple/20 text-purple-bright">
              <Database size={24} />
            </span>
            <h3 className="font-display text-xl font-semibold">{about.core.label}</h3>
            <p className="mt-1 text-sm text-text-muted">{about.core.detail}</p>
          </GlassCard>
          {/* connector */}
          <div className="mx-auto my-1 h-8 w-px bg-gradient-to-b from-purple-bright/60 to-transparent" aria-hidden="true" />
        </div>

        {about.nodes.map((node, i) => {
          const Icon = nodeIcons[i] ?? Brain
          return (
            <GlassCard key={node.label} data-reveal hover className="p-6">
              <span className="mb-3 inline-grid h-11 w-11 place-items-center rounded-xl bg-deep-blue-bright/30 text-cyan">
                <Icon size={20} />
              </span>
              <h3 className="font-display text-lg font-semibold">{node.label}</h3>
              <p className="mt-1 text-sm text-text-muted">{node.detail}</p>
            </GlassCard>
          )
        })}
      </div>
    </Section>
  )
}
