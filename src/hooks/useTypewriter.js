import { useEffect, useState } from 'react'
import useReducedMotion from './useReducedMotion'

/**
 * Types out `text` one character at a time once `active` is true. Chains
 * naturally: feed one typewriter's `done` into the next one's `active` to
 * sequence multiple lines.
 *
 * Accessibility: under prefers-reduced-motion the full text is shown instantly
 * (no animation). Callers should also expose the complete text to assistive
 * tech (e.g. an aria-label) and mark the animated nodes aria-hidden.
 */
export default function useTypewriter(text, { active = true, speed = 45 } = {}) {
  const reduced = useReducedMotion()
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!active) {
      setCount(0)
      return
    }
    if (reduced) {
      setCount(text.length)
      return
    }

    setCount(0)
    let i = 0
    let timer
    const tick = () => {
      i += 1
      setCount(i)
      if (i < text.length) timer = setTimeout(tick, speed)
    }
    timer = setTimeout(tick, speed)
    return () => clearTimeout(timer)
  }, [active, reduced, text, speed])

  return {
    displayed: text.slice(0, count),
    done: count >= text.length,
  }
}
