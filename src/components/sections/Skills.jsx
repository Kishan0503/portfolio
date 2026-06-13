import Section from '../layout/Section'
import GlassCard from '../effects/GlassCard'
import useGsapReveal from '../../hooks/useGsapReveal'
import { skills } from '../../data/content'

export default function Skills() {
  const ref = useGsapReveal()

  return (
    <Section
      id="skills"
      innerRef={ref}
      eyebrow="Skill Universe"
      title="A connected stack, not a checklist"
      intro="Skills grouped by domain. Primary clusters — Backend and AI/ML — are emphasized; supporting clusters round out delivery."
    >
      <div className="grid gap-6 sm:grid-cols-2">
        {skills.map((group) => (
          <GlassCard
            key={group.category}
            data-reveal
            hover
            className={`p-6 ${group.primary ? 'shadow-glow-sm ring-1 ring-purple/25' : ''}`}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold">{group.category}</h3>
              {group.primary && (
                <span className="rounded-full bg-purple/20 px-2.5 py-0.5 text-xs text-purple-bright">
                  Primary
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {group.items.map((item) => (
                <span
                  key={item}
                  className={`rounded-lg border px-3 py-1.5 text-sm ${
                    group.primary
                      ? 'border-purple/30 bg-purple/10 text-text-primary'
                      : 'border-glass-border bg-glass text-text-muted'
                  }`}
                >
                  {item}
                </span>
              ))}
            </div>
          </GlassCard>
        ))}
      </div>
    </Section>
  )
}
