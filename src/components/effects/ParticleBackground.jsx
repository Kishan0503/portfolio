import { useEffect, useMemo, useState } from 'react'
import Particles, { initParticlesEngine } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import useReducedMotion from '../../hooks/useReducedMotion'
import useIsMobile from '../../hooks/useIsMobile'

/**
 * Subtle particle-network background: low count, low opacity, slow drift,
 * link lines, gentle mouse parallax. Fixed behind all content.
 * Disabled on mobile and under reduced-motion.
 */
export default function ParticleBackground() {
  const reduced = useReducedMotion()
  const isMobile = useIsMobile()
  const [ready, setReady] = useState(false)

  const enabled = !reduced && !isMobile

  useEffect(() => {
    if (!enabled) return
    let active = true
    initParticlesEngine(async (engine) => {
      await loadSlim(engine)
    }).then(() => {
      if (active) setReady(true)
    })
    return () => {
      active = false
    }
  }, [enabled])

  const options = useMemo(
    () => ({
      fullScreen: { enable: false },
      fpsLimit: 60,
      detectRetina: true,
      particles: {
        number: { value: 46, density: { enable: true, area: 900 } },
        color: { value: ['#7C3AED', '#A855F7', '#22D3EE'] },
        opacity: { value: 0.32 },
        size: { value: { min: 1, max: 2.4 } },
        links: {
          enable: true,
          distance: 150,
          color: '#7C3AED',
          opacity: 0.18,
          width: 1,
        },
        move: {
          enable: true,
          speed: 0.5,
          direction: 'none',
          outModes: { default: 'out' },
        },
      },
      interactivity: {
        events: { onHover: { enable: true, mode: 'grab' } },
        modes: { grab: { distance: 160, links: { opacity: 0.35 } } },
      },
    }),
    [],
  )

  if (!enabled || !ready) return null

  return (
    <Particles
      id="tsparticles"
      options={options}
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  )
}
