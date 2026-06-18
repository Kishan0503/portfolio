import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '../../lib/gsap'
import useReducedMotion from '../../hooks/useReducedMotion'

/**
 * Initializes Lenis smooth scroll once at the app root and syncs it with GSAP
 * ScrollTrigger so scroll-linked animations stay in lockstep.
 *
 * Critically, it refreshes ScrollTrigger AFTER Lenis is wired up and after
 * fonts/images settle the layout — section reveal triggers are created in child
 * effects (which run before this parent effect), so their start positions must
 * be recomputed here or they fire at the wrong scroll position.
 *
 * Under prefers-reduced-motion, Lenis is skipped (native scroll is used) but the
 * refresh hooks still run so any remaining triggers measure correctly.
 */
export default function SmoothScroll({ children }) {
  const reduced = useReducedMotion()

  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh()

    // Recompute once layout fully settles.
    window.addEventListener('load', refresh)
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(refresh)
    }
    window.addEventListener('resize', refresh)

    let lenis
    let onTick
    if (!reduced) {
      lenis = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      })

      // Expose for anchor-link scrolling (Nav / CTAs).
      window.__lenis = lenis

      lenis.on('scroll', ScrollTrigger.update)

      onTick = (time) => lenis.raf(time * 1000)
      gsap.ticker.add(onTick)
      gsap.ticker.lagSmoothing(0)
    }

    // After this tick, all section triggers exist and the DOM is laid out —
    // refresh so every trigger's start position is correct.
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh())

    return () => {
      window.removeEventListener('load', refresh)
      window.removeEventListener('resize', refresh)
      cancelAnimationFrame(raf)
      if (onTick) gsap.ticker.remove(onTick)
      if (lenis) {
        lenis.destroy()
        delete window.__lenis
      }
    }
  }, [reduced])

  return children
}
