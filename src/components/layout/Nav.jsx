import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { navLinks, identity } from '../../data/content'

/** Smoothly scroll to a section, using Lenis when available. */
function scrollToId(id) {
  const el = document.getElementById(id)
  if (!el) return
  if (window.__lenis) {
    window.__lenis.scrollTo(el, { offset: -72 })
  } else {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

export default function Nav() {
  const [progress, setProgress] = useState(0)
  const [active, setActive] = useState('hero')
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? (window.scrollY / max) * 100 : 0)
      setScrolled(window.scrollY > 24)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Track the active section for nav highlighting.
  useEffect(() => {
    const sections = navLinks.map((l) => document.getElementById(l.id)).filter(Boolean)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id)
        })
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  const go = (id) => {
    scrollToId(id)
    setOpen(false)
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? 'bg-base/70 backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      {/* scroll-progress indicator */}
      <div
        className="absolute inset-x-0 top-0 h-0.5 origin-left bg-gradient-to-r from-purple via-purple-bright to-cyan"
        style={{ transform: `scaleX(${progress / 100})` }}
        aria-hidden="true"
      />

      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <button
          onClick={() => go('hero')}
          className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-text-primary"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg border border-glass-border bg-glass text-sm text-purple-bright">
            KP
          </span>
          <span className="hidden sm:inline">{identity.name}</span>
        </button>

        <ul className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <li key={link.id}>
              <button
                onClick={() => go(link.id)}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                  active === link.id
                    ? 'text-purple-bright'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>

        <button
          className="rounded-md p-2 text-text-primary lg:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* mobile menu */}
      {open && (
        <div className="border-t border-glass-border bg-base/95 backdrop-blur-lg lg:hidden">
          <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-1 px-5 py-4">
            {navLinks.map((link) => (
              <li key={link.id}>
                <button
                  onClick={() => go(link.id)}
                  className={`w-full rounded-md px-3 py-2 text-left text-sm ${
                    active === link.id ? 'text-purple-bright' : 'text-text-muted'
                  }`}
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  )
}
