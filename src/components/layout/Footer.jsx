import { Github, Linkedin, Mail } from 'lucide-react'
import { identity, socials } from '../../data/content'

export default function Footer() {
  return (
    <footer className="border-t border-glass-border px-5 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-text-muted sm:flex-row">
        <p>
          © {/* year is static-safe to omit; keep evergreen */}
          <span className="font-display text-text-primary">{identity.name}</span> · Built as an AI
          Command Center.
        </p>
        <div className="flex items-center gap-4">
          <a href={socials.github} target="_blank" rel="noreferrer" aria-label="GitHub" className="hover:text-purple-bright">
            <Github size={18} />
          </a>
          <a href={socials.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="hover:text-purple-bright">
            <Linkedin size={18} />
          </a>
          <a href={`mailto:${socials.email}`} aria-label="Email" className="hover:text-purple-bright">
            <Mail size={18} />
          </a>
        </div>
      </div>
    </footer>
  )
}
