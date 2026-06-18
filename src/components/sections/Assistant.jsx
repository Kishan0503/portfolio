import { useEffect, useRef, useState } from 'react'
import { Bot, User } from 'lucide-react'
import Section from '../layout/Section'
import GlassCard from '../effects/GlassCard'
import useGsapReveal from '../../hooks/useGsapReveal'
import useReducedMotion from '../../hooks/useReducedMotion'
import { chatbot } from '../../data/content'

export default function Assistant() {
  const ref = useGsapReveal()
  const reduced = useReducedMotion()
  const [messages, setMessages] = useState([{ role: 'bot', text: chatbot.intro }])
  const [typing, setTyping] = useState(false)
  const [asked, setAsked] = useState([])
  const listRef = useRef(null)
  const timers = useRef([])

  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, typing])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const ask = (pair) => {
    if (typing) return
    setMessages((m) => [...m, { role: 'user', text: pair.q }])
    setAsked((a) => (a.includes(pair.q) ? a : [...a, pair.q]))

    if (reduced) {
      setMessages((m) => [...m, { role: 'bot', text: pair.a }])
      return
    }

    setTyping(true)
    const t = setTimeout(() => {
      setTyping(false)
      setMessages((m) => [...m, { role: 'bot', text: pair.a }])
    }, 700)
    timers.current.push(t)
  }

  return (
    <Section
      id="assistant"
      innerRef={ref}
      eyebrow="AI Assistant"
      title="Ask the assistant"
      intro="A scripted Q&A — pick a question and get an instant answer drawn straight from this profile. No backend, no API cost."
    >
      <GlassCard data-reveal className="mx-auto max-w-3xl overflow-hidden">
        {/* message list */}
        <div ref={listRef} className="max-h-[420px] space-y-4 overflow-y-auto p-6" aria-live="polite">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                  m.role === 'user' ? 'bg-cyan/15 text-cyan' : 'bg-purple/20 text-purple-bright'
                }`}
              >
                {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </span>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === 'user'
                    ? 'rounded-tr-sm bg-cyan/10 text-text-primary'
                    : 'rounded-tl-sm border border-glass-border bg-glass text-text-primary'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {typing && (
            <div className="flex gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-purple/20 text-purple-bright">
                <Bot size={16} />
              </span>
              <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm border border-glass-border bg-glass px-4 py-3">
                {[0, 1, 2].map((d) => (
                  <span
                    key={d}
                    className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-bright"
                    style={{ animationDelay: `${d * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* question chips */}
        <div className="border-t border-glass-border p-4">
          <p className="mb-2 text-xs uppercase tracking-wide text-text-muted">Suggested questions</p>
          <div className="flex flex-wrap gap-2">
            {chatbot.qa.map((pair) => (
              <button
                key={pair.q}
                onClick={() => ask(pair)}
                disabled={typing}
                className={`rounded-full border px-3 py-1.5 text-sm transition disabled:opacity-50 ${
                  asked.includes(pair.q)
                    ? 'border-glass-border bg-glass text-text-muted'
                    : 'border-purple/30 bg-purple/10 text-text-primary hover:border-purple-bright/50'
                }`}
              >
                {pair.q}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>
    </Section>
  )
}
