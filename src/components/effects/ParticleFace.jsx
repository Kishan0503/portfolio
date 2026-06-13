import { useEffect, useRef } from 'react'
import useReducedMotion from '../../hooks/useReducedMotion'
import buildFace from './faceModel'

/**
 * A living AI avatar rendered as a dense, Delaunay-triangulated particle face
 * on a transparent canvas — the same dot-and-line language as the background,
 * so it reads as an extension of it rather than a framed photo.
 *   - eyelids blink every ~2–3s (iris/pupil fade with the lid)
 *   - gentle floating + breathing + per-node micro-jitter + pointer parallax
 *   - glowing eyes as the focal point; soft radial bloom behind the face
 * Under prefers-reduced-motion it renders a single static frame (eyes open).
 */
export default function ParticleFace({ className = '' }) {
  const canvasRef = useRef(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const { points, edges } = buildFace()

    // Pre-bucket edges by shade so we can stroke each shade as one path.
    const shaded = [[], [], []]
    for (const e of edges) shaded[e[2]].push(e)
    const SHADE_ALPHA = [0.55, 0.34, 0.18]

    const jitter = points.map((_, i) => ({
      phase: (i * 1.7) % (Math.PI * 2),
      speed: 0.6 + (i % 5) * 0.13,
      ax: 0.5 + (i % 3) * 0.22,
      ay: 0.5 + (i % 4) * 0.18,
    }))

    let W = 0
    let H = 0
    let scale = 1
    let dpr = 1
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      W = rect.width || canvas.offsetWidth
      H = rect.height || canvas.offsetHeight
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      scale = Math.min(W, H) * 0.4
    }
    resize()
    window.addEventListener('resize', resize)

    const target = { x: 0, y: 0 }
    const eased = { x: 0, y: 0 }
    const onMove = (e) => {
      target.x = (e.clientX / window.innerWidth - 0.5) * 2
      target.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    if (!reduced) window.addEventListener('pointermove', onMove)

    let nextBlink = 1400 + Math.random() * 900
    let blinkStart = -1
    const BLINK_DUR = 180

    const sx = new Array(points.length)
    const sy = new Array(points.length)
    let raf

    const render = (t) => {
      ctx.clearRect(0, 0, W, H)

      const floatY = reduced ? 0 : Math.sin(t * 0.0009) * 5
      const breathe = reduced ? 1 : 1 + Math.sin(t * 0.0012) * 0.012
      eased.x += (target.x - eased.x) * 0.05
      eased.y += (target.y - eased.y) * 0.05
      const cx0 = W / 2 + (reduced ? 0 : eased.x * 10)
      const cy0 = H / 2 + floatY + (reduced ? 0 : eased.y * 7)

      let open = 1
      if (!reduced) {
        if (blinkStart < 0 && t >= nextBlink) blinkStart = t
        if (blinkStart >= 0) {
          const p = (t - blinkStart) / BLINK_DUR
          if (p >= 1) {
            blinkStart = -1
            nextBlink = t + 2000 + Math.random() * 1000
          } else {
            open = Math.abs(Math.cos(p * Math.PI))
          }
        }
      }

      for (let i = 0; i < points.length; i++) {
        const p = points[i]
        let nx = p.x
        let ny = p.blink ? p.blink.openY + (p.blink.closedY - p.blink.openY) * (1 - open) : p.y
        if (!reduced) {
          const j = jitter[i]
          nx += Math.sin(t * 0.001 * j.speed + j.phase) * 0.011 * j.ax
          ny += Math.cos(t * 0.001 * j.speed + j.phase * 1.3) * 0.011 * j.ay
        }
        sx[i] = cx0 + nx * scale * breathe
        sy[i] = cy0 + ny * scale * breathe
      }

      // Edges — one batched stroke per shade bucket.
      ctx.lineWidth = 1
      for (let s = 0; s < 3; s++) {
        const bucket = shaded[s]
        if (!bucket.length) continue
        ctx.strokeStyle = `rgba(140,90,246,${SHADE_ALPHA[s]})`
        ctx.beginPath()
        for (const [a, b] of bucket) {
          ctx.moveTo(sx[a], sy[a])
          ctx.lineTo(sx[b], sy[b])
        }
        ctx.stroke()
      }

      // Nodes — batch the plain dots, then draw glowing eyes individually.
      ctx.fillStyle = 'rgba(124,58,237,0.5)'
      ctx.beginPath()
      for (let i = 0; i < points.length; i++) {
        const ty = points[i].type
        if (ty === 'fill' || ty === 'cheek' || ty === 'neck') {
          ctx.moveTo(sx[i] + 1.05, sy[i])
          ctx.arc(sx[i], sy[i], 1.05, 0, Math.PI * 2)
        }
      }
      ctx.fill()

      ctx.fillStyle = 'rgba(168,85,247,0.9)'
      ctx.beginPath()
      for (let i = 0; i < points.length; i++) {
        const ty = points[i].type
        if (ty === 'outline' || ty === 'brow' || ty === 'nose' || ty === 'lip' || ty === 'ear') {
          ctx.moveTo(sx[i] + 1.4, sy[i])
          ctx.arc(sx[i], sy[i], 1.4, 0, Math.PI * 2)
        }
      }
      ctx.fill()

      // Eyes — glowing focal point. Iris/pupil fade as the lid closes.
      const eyeAlpha = reduced ? 1 : Math.max(0.15, open)
      for (let i = 0; i < points.length; i++) {
        const p = points[i]
        if (p.type === 'eye') {
          ctx.fillStyle = '#C084FC'
          ctx.shadowBlur = 6
          ctx.shadowColor = '#A855F7'
          ctx.beginPath()
          ctx.arc(sx[i], sy[i], 1.7, 0, Math.PI * 2)
          ctx.fill()
        } else if (p.eyePart === 'iris') {
          ctx.fillStyle = `rgba(34,211,238,${0.85 * eyeAlpha})`
          ctx.shadowBlur = 10 * eyeAlpha
          ctx.shadowColor = '#22D3EE'
          ctx.beginPath()
          ctx.arc(sx[i], sy[i], 1.7, 0, Math.PI * 2)
          ctx.fill()
        } else if (p.eyePart === 'pupil') {
          ctx.fillStyle = `rgba(125,233,255,${eyeAlpha})`
          ctx.shadowBlur = 18 * eyeAlpha
          ctx.shadowColor = '#22D3EE'
          ctx.beginPath()
          ctx.arc(sx[i], sy[i], 3.2, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.shadowBlur = 0

      if (!reduced) raf = requestAnimationFrame(render)
    }

    if (reduced) render(0)
    else raf = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
    }
  }, [reduced])

  return (
    <div className={`relative ${className}`} role="img" aria-label="AI-inspired particle portrait of Kishan Panchal">
      <div className="pointer-events-none absolute inset-[6%] -z-10 rounded-full bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.3),rgba(34,211,238,0.07)_46%,transparent_70%)] blur-2xl" />
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  )
}
