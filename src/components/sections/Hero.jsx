import { useEffect, useState } from 'react'
import { ArrowRight, Download, Mail } from 'lucide-react'
import useReducedMotion from '../../hooks/useReducedMotion'
import useTypewriter from '../../hooks/useTypewriter'
import ParticleFace from '../effects/ParticleFace'
import { identity } from '../../data/content'

function scrollToId(id) {
  const el = document.getElementById(id)
  if (!el) return
  if (window.__lenis) window.__lenis.scrollTo(el, { offset: -72 })
  else el.scrollIntoView({ behavior: 'smooth' })
}

/** Blinking terminal caret. Hidden under reduced-motion. */
function Caret({ show, reduced }) {
  if (!show || reduced) return null
  return (
    <span
      aria-hidden="true"
      className="ml-0.5 inline-block w-[0.55ch] animate-blink bg-purple-bright align-middle"
      style={{ height: '0.95em' }}
    />
  )
}

export default function Hero() {
  const reduced = useReducedMotion()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // Sequence the three key lines: name → role → tagline.
  const name = useTypewriter(identity.name, { active: true, speed: 75 })
  const role = useTypewriter(identity.title, { active: name.done, speed: 60 })
  const tagline = useTypewriter(identity.tagline, { active: role.done, speed: 20 })

  const reveal = reduced || mounted // image fade-in trigger
  const ctasVisible = reduced || tagline.done

  return (
    <section
      id="hero"
      className="relative flex min-h-[100svh] items-center overflow-hidden px-5 pt-24"
    >
      {/* ambient glows */}
      <div className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-purple/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-24 bottom-1/4 h-80 w-80 rounded-full bg-deep-blue-bright/30 blur-[120px]" />

      <div className="mx-auto grid w-full max-w-7xl items-center gap-10 md:grid-cols-2">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-glass-border bg-glass px-4 py-1.5 font-mono text-xs text-text-muted">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan" />
            </span>
            System online · Command Center
          </div>

          {/* Name (Space Grotesk) — aria-label carries the full text for a11y */}
          <h1
            className="min-h-[1.1em] font-display text-4xl font-bold leading-[1.05] sm:text-6xl md:text-7xl"
            aria-label={identity.name}
          >
            <span aria-hidden="true">{name.displayed}</span>
            <Caret show={!name.done} reduced={reduced} />
          </h1>

          {/* Role (JetBrains Mono — terminal accent) */}
          <p
            className="mt-3 min-h-[1.6em] font-mono text-xl text-purple-bright sm:text-2xl"
            aria-label={identity.title}
          >
            <span aria-hidden="true">{role.displayed}</span>
            <Caret show={name.done && !role.done} reduced={reduced} />
          </p>

          {/* Tagline (Inter) — caret persists, blinking, once everything is typed */}
          <p
            className="mt-6 min-h-[3.5rem] max-w-xl text-lg text-text-muted sm:min-h-[3.5rem]"
            aria-label={identity.tagline}
          >
            <span aria-hidden="true">{tagline.displayed}</span>
            <Caret show={role.done} reduced={reduced} />
          </p>

          <div
            className={`mt-9 flex flex-wrap gap-3 transition-all duration-700 ease-out ${
              ctasVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
            }`}
          >
            <button
              onClick={() => scrollToId('projects')}
              className="group inline-flex items-center gap-2 rounded-lg bg-purple px-5 py-3 font-medium text-white shadow-glow transition hover:bg-purple-bright"
            >
              View Projects
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </button>
            <a
              href={identity.resume}
              download
              className="inline-flex items-center gap-2 rounded-lg border border-glass-border bg-glass px-5 py-3 font-medium text-text-primary transition hover:border-purple-bright/40"
            >
              <Download size={18} /> Download Resume
            </a>
            <button
              onClick={() => scrollToId('contact')}
              className="inline-flex items-center gap-2 rounded-lg border border-glass-border bg-glass px-5 py-3 font-medium text-text-primary transition hover:border-purple-bright/40"
            >
              <Mail size={18} /> Contact
            </button>
          </div>
        </div>

        {/* living AI avatar — particle/network face that emerges from the background */}
        <div
          className={`relative mx-auto aspect-square w-full max-w-md transition-all duration-1000 ease-out ${
            reveal ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          <ParticleFace className="h-full w-full" />
        </div>
      </div>
    </section>
  )
}
