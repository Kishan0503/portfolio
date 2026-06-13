import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'
import useReducedMotion from './useReducedMotion'

/**
 * Per-element scroll reveal used by every section. Each descendant marked with
 * `data-reveal` (text, cards, images, etc.) gets its OWN ScrollTrigger and
 * fades/slides in as it enters the viewport — so animations fire reliably when
 * the user reaches each section, regardless of section height.
 *
 * Using `gsap.from` with `immediateRender` means elements that are already in
 * view on load also reveal (instead of staying hidden), so nothing ever gets
 * stuck invisible. Under reduced-motion everything is shown statically.
 *
 * Returns a ref to attach to the section container.
 */
export default function useGsapReveal(options = {}) {
  const { y = 30, duration = 0.7, start = 'top 86%', stagger = 0.08 } = options
  const ref = useRef(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const targets = el.querySelectorAll('[data-reveal]')
    const items = targets.length ? Array.from(targets) : [el]

    if (reduced) {
      gsap.set(items, { opacity: 1, y: 0, clearProps: 'all' })
      return
    }

    const ctx = gsap.context(() => {
      items.forEach((item) => {
        // Items sharing a direct parent (e.g. cards in a grid) cascade in
        // together via a small index-based delay; otherwise each reveals solo.
        const siblings = item.parentElement
          ? Array.from(item.parentElement.querySelectorAll(':scope > [data-reveal]'))
          : [item]
        const index = Math.max(0, siblings.indexOf(item))

        gsap.from(item, {
          opacity: 0,
          y,
          duration,
          delay: Math.min(index, 6) * stagger,
          ease: 'power3.out',
          scrollTrigger: { trigger: item, start },
        })
      })
    }, el)

    // Recompute positions once this section's triggers exist (a global refresh
    // is also issued from SmoothScroll after Lenis/fonts settle).
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh())

    return () => {
      cancelAnimationFrame(raf)
      ctx.revert()
    }
  }, [reduced, y, duration, start, stagger])

  return ref
}
