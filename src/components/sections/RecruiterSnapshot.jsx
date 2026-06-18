import { useEffect, useRef } from 'react'
import { Briefcase, Clock, Download, Github, Linkedin, MapPin, Zap } from 'lucide-react'
import GlassCard from '../effects/GlassCard'
import { gsap, ScrollTrigger } from '../../lib/gsap'
import useReducedMotion from '../../hooks/useReducedMotion'
import { identity, socials, skills } from '../../data/content'

// Core stack chips — primary backend skills plus the AI/ML focus.
const coreStack = [...skills.find((s) => s.category === 'Backend').items.slice(0, 4), 'AI/ML']

const facts = [
  { icon: Briefcase, label: 'Role', value: identity.title },
  { icon: Clock, label: 'Experience', value: identity.experience },
  { icon: MapPin, label: 'Location', value: `${identity.location} · ${identity.timezone}` },
  { icon: Zap, label: 'Availability', value: identity.availability },
]

export default function RecruiterSnapshot() {
  const root = useRef(null)
  const reduced = useReducedMotion()

  // Coordinated cascade: all content inside the card reveals in DOM order with
  // a gentle, well-timed stagger when the section scrolls into view.
  useEffect(() => {
    const el = root.current
    if (!el) return
    const items = el.querySelectorAll('[data-reveal]')

    if (reduced) {
      gsap.set(items, { opacity: 1, y: 0, clearProps: 'all' })
      return
    }

    const ctx = gsap.context(() => {
      gsap.from(el.querySelector('[data-card]'), {
        opacity: 0,
        y: 32,
        scale: 0.98,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 80%' },
      })
      gsap.from(items, {
        opacity: 0,
        y: 18,
        duration: 0.55,
        stagger: 0.07,
        ease: 'power3.out',
        delay: 0.15,
        scrollTrigger: { trigger: el, start: 'top 80%' },
      })
    }, el)

    const raf = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => {
      cancelAnimationFrame(raf)
      ctx.revert()
    }
  }, [reduced])

  return (
    <section id="snapshot" ref={root} className="section-pad px-5">
      <div className="mx-auto max-w-4xl">
        <GlassCard data-card className="p-7 sm:p-10">
          <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center">
            <img
              data-reveal
              src={identity.profileImage}
              alt={identity.name}
              className="h-20 w-20 rounded-2xl border border-glass-border object-cover"
              loading="lazy"
            />
            <div data-reveal>
              <p className="eyebrow mb-1">Recruiter Snapshot</p>
              <h2 className="font-display text-2xl font-bold sm:text-3xl">{identity.name}</h2>
              <p className="text-text-muted">{identity.focus}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {facts.map((f) => (
              <div
                key={f.label}
                data-reveal
                className="flex items-center gap-3 rounded-xl border border-glass-border bg-glass px-4 py-3"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-purple/15 text-purple-bright">
                  <f.icon size={18} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wide text-text-muted">{f.label}</p>
                  <p className="truncate font-medium text-text-primary">{f.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div data-reveal className="mt-6">
            <p className="mb-2 text-xs uppercase tracking-wide text-text-muted">Core stack</p>
            <div className="flex flex-wrap gap-2">
              {coreStack.map((s) => (
                <span key={s} className="rounded-full border border-glass-border bg-glass px-3 py-1 text-sm text-text-primary">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div data-reveal className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={identity.resume}
              download
              className="inline-flex items-center gap-2 rounded-lg bg-purple px-5 py-3 font-medium text-white shadow-glow transition hover:bg-purple-bright"
            >
              <Download size={18} /> Download Resume (PDF)
            </a>
            <a href={socials.github} target="_blank" rel="noreferrer" aria-label="GitHub" className="grid h-11 w-11 place-items-center rounded-lg border border-glass-border bg-glass text-text-primary transition hover:border-purple-bright/40">
              <Github size={18} />
            </a>
            <a href={socials.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="grid h-11 w-11 place-items-center rounded-lg border border-glass-border bg-glass text-text-primary transition hover:border-purple-bright/40">
              <Linkedin size={18} />
            </a>
          </div>
        </GlassCard>
      </div>
    </section>
  )
}
