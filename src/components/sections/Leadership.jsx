import { useEffect, useRef, useState } from 'react'
import { GitPullRequest, MessageSquare, Rocket, Users } from 'lucide-react'
import Section from '../layout/Section'
import GlassCard from '../effects/GlassCard'
import useGsapReveal from '../../hooks/useGsapReveal'
import useReducedMotion from '../../hooks/useReducedMotion'
import { leadership } from '../../data/content'

const ownedIcons = { Mentoring: Users, 'Code reviews': GitPullRequest, 'Client communication': MessageSquare, Delivery: Rocket }

/** Counts up from 0 to `value` once when scrolled into view. */
function CountUp({ value, suffix = '', approx }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) {
      setDisplay(value)
      return
    }
    const el = ref.current
    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return
        obs.disconnect()
        const duration = 1200
        const start = performance.now()
        const tick = (now) => {
          const p = Math.min(1, (now - start) / duration)
          const eased = 1 - Math.pow(1 - p, 3)
          setDisplay(Math.round(eased * value))
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      },
      { threshold: 0.5 },
    )
    if (el) obs.observe(el)
    return () => obs.disconnect()
  }, [value, reduced])

  return (
    <span ref={ref}>
      {approx && '~'}
      {display}
      {suffix}
    </span>
  )
}

export default function Leadership() {
  const ref = useGsapReveal()

  return (
    <Section
      id="leadership"
      innerRef={ref}
      eyebrow="Leadership Dashboard"
      title="Leading from the backend"
      intro={leadership.tagline}
    >
      <div className="grid gap-6 md:grid-cols-3">
        {leadership.metrics.map((m) => (
          <GlassCard key={m.label} data-reveal hover className="p-7 text-center">
            <p className="font-display text-4xl font-bold text-gradient sm:text-5xl">
              <CountUp value={m.value} suffix={m.suffix} approx={m.approx} />
            </p>
            <p className="mt-2 font-medium text-text-primary">{m.label}</p>
            <p className="text-sm text-text-muted">{m.detail}</p>
          </GlassCard>
        ))}
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <GlassCard data-reveal className="p-7">
          <h3 className="mb-4 font-display text-lg font-semibold">Ownership areas</h3>
          <div className="grid grid-cols-2 gap-3">
            {leadership.owned.map((o) => {
              const Icon = ownedIcons[o] ?? Users
              return (
                <div key={o} className="flex items-center gap-3 rounded-xl border border-glass-border bg-glass px-4 py-3">
                  <Icon size={18} className="shrink-0 text-purple-bright" />
                  <span className="text-sm">{o}</span>
                </div>
              )
            })}
          </div>
        </GlassCard>

        <GlassCard data-reveal className="flex flex-col justify-center p-7 shadow-glow-sm">
          <h3 className="mb-3 font-display text-lg font-semibold">Outcome</h3>
          <p className="text-text-muted">{leadership.outcomes}</p>
        </GlassCard>
      </div>
    </Section>
  )
}
