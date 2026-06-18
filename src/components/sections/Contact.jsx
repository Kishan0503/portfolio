import { useState } from 'react'
import { Github, Linkedin, Mail, Phone, Send, CheckCircle2, Download } from 'lucide-react'
import Section from '../layout/Section'
import GlassCard from '../effects/GlassCard'
import useGsapReveal from '../../hooks/useGsapReveal'
import { socials, identity } from '../../data/content'

const channels = [
  { icon: Mail, label: 'Email', value: socials.email, href: `mailto:${socials.email}` },
  { icon: Phone, label: 'Phone', value: socials.phone, href: `tel:${socials.phone.replace(/\s/g, '')}` },
  { icon: Linkedin, label: 'LinkedIn', value: 'kishan-panchal', href: socials.linkedin },
  { icon: Github, label: 'GitHub', value: '@Kishan0503', href: socials.github },
]

export default function Contact() {
  const ref = useGsapReveal()
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  const [errorMsg, setErrorMsg] = useState('')

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    setErrorMsg('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Something went wrong.')
      setStatus('success')
      setForm({ name: '', email: '', message: '' })
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.message || 'Failed to send. Please email me directly.')
    }
  }

  return (
    <Section
      id="contact"
      innerRef={ref}
      eyebrow="Get in touch"
      title="Let's build something"
      intro="Open to opportunities anytime. Send a message below — it lands straight in my inbox — or reach me through any channel."
    >
      <div className="grid gap-6 lg:grid-cols-5">
        {/* form */}
        <GlassCard data-reveal className="p-7 lg:col-span-3">
          {status === 'success' ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <CheckCircle2 size={44} className="text-cyan" />
              <h3 className="font-display text-xl font-semibold">Message sent!</h3>
              <p className="text-text-muted">Thanks for reaching out — I'll get back to you soon.</p>
              <button
                onClick={() => setStatus('idle')}
                className="mt-2 rounded-lg border border-glass-border bg-glass px-4 py-2 text-sm hover:border-purple-bright/40"
              >
                Send another
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm text-text-muted">Name</span>
                  <input
                    name="name"
                    required
                    value={form.name}
                    onChange={update}
                    className="w-full rounded-lg border border-glass-border bg-glass px-4 py-2.5 text-text-primary outline-none transition focus:border-purple-bright/60"
                    placeholder="Your name"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm text-text-muted">Email</span>
                  <input
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={update}
                    className="w-full rounded-lg border border-glass-border bg-glass px-4 py-2.5 text-text-primary outline-none transition focus:border-purple-bright/60"
                    placeholder="you@company.com"
                  />
                </label>
              </div>
              <label className="block">
                <span className="mb-1.5 block text-sm text-text-muted">Message</span>
                <textarea
                  name="message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={update}
                  className="w-full resize-y rounded-lg border border-glass-border bg-glass px-4 py-2.5 text-text-primary outline-none transition focus:border-purple-bright/60"
                  placeholder="Tell me about the role or project…"
                />
              </label>

              {status === 'error' && (
                <p className="text-sm text-red-400">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={status === 'sending'}
                className="inline-flex items-center gap-2 rounded-lg bg-purple px-6 py-3 font-medium text-white shadow-glow transition hover:bg-purple-bright disabled:opacity-60"
              >
                {status === 'sending' ? 'Sending…' : 'Send message'}
                <Send size={16} />
              </button>
            </form>
          )}
        </GlassCard>

        {/* channels */}
        <div data-reveal className="space-y-4 lg:col-span-2">
          {channels.map((c) => (
            <a
              key={c.label}
              href={c.href}
              target={c.href.startsWith('http') ? '_blank' : undefined}
              rel="noreferrer"
              className="flex items-center gap-4 rounded-xl border border-glass-border bg-glass p-4 transition hover:border-purple-bright/40"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-purple/15 text-purple-bright">
                <c.icon size={18} />
              </span>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-text-muted">{c.label}</p>
                <p className="truncate text-text-primary">{c.value}</p>
              </div>
            </a>
          ))}
          <a
            href={identity.resume}
            download
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple to-deep-blue-bright p-4 font-medium text-white shadow-glow transition hover:opacity-90"
          >
            <Download size={18} /> Download Resume (PDF)
          </a>
        </div>
      </div>
    </Section>
  )
}
