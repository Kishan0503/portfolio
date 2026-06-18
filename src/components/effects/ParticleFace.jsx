import { useEffect, useRef } from 'react'
import useReducedMotion from '../../hooks/useReducedMotion'
import { vertices, edges, eyes, feature } from '../../data/faceMesh'

/**
 * Living AI avatar built from a REAL human head model (Lee Perry-Smith scan,
 * CC-BY 3.0), extracted to a vertex/edge network at build time and rendered as
 * a particle mesh on a transparent canvas — same dot-and-line language as the
 * background. Real scan topology gives genuine human facial structure.
 *   - depth-shaded so the face has volume (front bright, back faint)
 *   - glowing eyes that "blink" (dim) every ~2–3s
 *   - breathing, floating, micro-jitter, subtle 3D sway + pointer parallax
 * Under prefers-reduced-motion it renders a single static, front-facing frame.
 */

// Flip the model front-to-back if the scan faces away from the viewer.
const FLIP_Z = false

export default function ParticleFace({ className = '' }) {
  const canvasRef = useRef(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    // Shell points from the real mesh.
    const zf = FLIP_Z ? -1 : 1
    const points = vertices.map(([x, y, z]) => ({ x, y, z: z * zf }))

    // Synthetic glowing eye markers placed on the detected eye anchors.
    const eyeMarkers = []
    eyes.forEach(([ex, ey, ez]) => {
      const z = ez * zf
      eyeMarkers.push({ x: ex, y: ey, z: z + 0.02, part: 'pupil' })
      for (let k = 0; k < 9; k++) {
        const a = (k / 9) * Math.PI * 2
        eyeMarkers.push({ x: ex + Math.cos(a) * 0.05, y: ey + Math.sin(a) * 0.044, z: z + 0.01, part: 'iris' })
      }
    })

    const jitter = points.map((_, i) => ({
      phase: (i * 1.7) % (Math.PI * 2),
      speed: 0.6 + (i % 5) * 0.13,
      a: 0.5 + (i % 4) * 0.2,
    }))

    // Static depth shading from base z (front bright → back faint).
    const isFeature = (i) => feature && feature[i] === 1
    const depthOf = (z) => Math.max(0.07, Math.min(1, (z + 0.62) / 1.24))
    const bucketOf = (d) => (d > 0.66 ? 0 : d > 0.42 ? 1 : 2)
    const baseDepth = points.map((p) => depthOf(p.z))
    // Feature contours (brows/eyes/nose/lips/ears) drawn brighter; the rest
    // depth-shaded. Feature edges = both endpoints on a feature.
    const edgeBuckets = [[], [], []]
    const featureEdges = []
    for (const [a, b] of edges) {
      if (isFeature(a) && isFeature(b)) featureEdges.push(a, b)
      else edgeBuckets[bucketOf((baseDepth[a] + baseDepth[b]) * 0.5)].push(a, b)
    }
    const nodeGroups = [[], [], []]
    const featureNodes = []
    points.forEach((_, i) => {
      if (isFeature(i)) featureNodes.push(i)
      else nodeGroups[bucketOf(baseDepth[i])].push(i)
    })

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
      scale = Math.min(W, H) * 0.46
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

    let nextBlink = 1500 + Math.random() * 900
    let blinkStart = -1
    const BLINK_DUR = 160

    const sx = new Array(points.length)
    const sy = new Array(points.length)
    const ex = new Array(eyeMarkers.length)
    const ey = new Array(eyeMarkers.length)
    let raf

    const project = (px, py, pz, cyaw, syaw, cpit, spit, cx0, cy0, breathe, out, i) => {
      const x1 = px * cyaw + pz * syaw
      const z1 = -px * syaw + pz * cyaw
      const y1 = py * cpit - z1 * spit
      out[0][i] = cx0 + x1 * scale * breathe
      out[1][i] = cy0 + y1 * scale * breathe
    }

    const render = (t) => {
      ctx.clearRect(0, 0, W, H)
      const floatY = reduced ? 0 : Math.sin(t * 0.0009) * 5
      const breathe = reduced ? 1 : 1 + Math.sin(t * 0.0012) * 0.012
      eased.x += (target.x - eased.x) * 0.05
      eased.y += (target.y - eased.y) * 0.05
      const yaw = reduced ? 0 : Math.sin(t * 0.0004) * 0.05 + eased.x * 0.22
      const pitch = reduced ? 0 : Math.sin(t * 0.00055) * 0.025 - eased.y * 0.1
      const cyaw = Math.cos(yaw)
      const syaw = Math.sin(yaw)
      const cpit = Math.cos(pitch)
      const spit = Math.sin(pitch)
      const cx0 = W / 2
      const cy0 = H / 2 + floatY

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
        let x = p.x
        let y = p.y
        if (!reduced) {
          const j = jitter[i]
          x += Math.sin(t * 0.001 * j.speed + j.phase) * 0.006 * j.a
          y += Math.cos(t * 0.001 * j.speed + j.phase * 1.3) * 0.006 * j.a
        }
        project(x, y, p.z, cyaw, syaw, cpit, spit, cx0, cy0, breathe, [sx, sy], i)
      }
      for (let i = 0; i < eyeMarkers.length; i++) {
        const m = eyeMarkers[i]
        project(m.x, m.y, m.z, cyaw, syaw, cpit, spit, cx0, cy0, breathe, [ex, ey], i)
      }

      // Edges — precomputed depth buckets.
      const EDGE_ALPHA = [0.46, 0.24, 0.09]
      ctx.lineWidth = 1
      for (let s = 0; s < 3; s++) {
        const bk = edgeBuckets[s]
        if (!bk.length) continue
        ctx.strokeStyle = `rgba(150,95,246,${EDGE_ALPHA[s]})`
        ctx.beginPath()
        for (let k = 0; k < bk.length; k += 2) {
          ctx.moveTo(sx[bk[k]], sy[bk[k]])
          ctx.lineTo(sx[bk[k + 1]], sy[bk[k + 1]])
        }
        ctx.stroke()
      }

      // Feature edges (brows/eyes/nose/lips/ears) — brighter to define outlines.
      if (featureEdges.length) {
        ctx.strokeStyle = 'rgba(196,150,255,0.7)'
        ctx.beginPath()
        for (let k = 0; k < featureEdges.length; k += 2) {
          ctx.moveTo(sx[featureEdges[k]], sy[featureEdges[k]])
          ctx.lineTo(sx[featureEdges[k + 1]], sy[featureEdges[k + 1]])
        }
        ctx.stroke()
      }

      // Nodes — precomputed depth groups.
      const NODE_STYLE = [
        { a: 0.85, r: 1.35, c: '178,120,250' },
        { a: 0.5, r: 1.15, c: '140,90,240' },
        { a: 0.2, r: 0.95, c: '124,58,237' },
      ]
      for (let g = 0; g < 3; g++) {
        const grp = nodeGroups[g]
        if (!grp.length) continue
        const st = NODE_STYLE[g]
        ctx.fillStyle = `rgba(${st.c},${st.a})`
        ctx.beginPath()
        for (const i of grp) {
          ctx.moveTo(sx[i] + st.r, sy[i])
          ctx.arc(sx[i], sy[i], st.r, 0, Math.PI * 2)
        }
        ctx.fill()
      }

      // Feature nodes — brighter & larger to highlight the feature outlines.
      if (featureNodes.length) {
        ctx.fillStyle = 'rgba(214,180,255,0.95)'
        ctx.shadowBlur = 4
        ctx.shadowColor = '#A855F7'
        ctx.beginPath()
        for (const i of featureNodes) {
          ctx.moveTo(sx[i] + 1.7, sy[i])
          ctx.arc(sx[i], sy[i], 1.7, 0, Math.PI * 2)
        }
        ctx.fill()
        ctx.shadowBlur = 0
      }

      // Eyes — glowing focal point; the glow dims on blink.
      const eyeA = reduced ? 1 : Math.max(0.12, open)
      for (let i = 0; i < eyeMarkers.length; i++) {
        const m = eyeMarkers[i]
        if (m.part === 'pupil') {
          // soft outer halo
          ctx.fillStyle = `rgba(34,211,238,${0.28 * eyeA})`
          ctx.shadowBlur = 30 * eyeA
          ctx.shadowColor = '#22D3EE'
          ctx.beginPath()
          ctx.arc(ex[i], ey[i], 6.5, 0, Math.PI * 2)
          ctx.fill()
          // bright core
          ctx.fillStyle = `rgba(190,245,255,${eyeA})`
          ctx.shadowBlur = 22 * eyeA
          ctx.beginPath()
          ctx.arc(ex[i], ey[i], 3.6, 0, Math.PI * 2)
          ctx.fill()
        } else {
          ctx.fillStyle = `rgba(80,220,250,${0.95 * eyeA})`
          ctx.shadowBlur = 12 * eyeA
          ctx.shadowColor = '#22D3EE'
          ctx.beginPath()
          ctx.arc(ex[i], ey[i], 1.9, 0, Math.PI * 2)
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
      <div className="pointer-events-none absolute inset-[8%] -z-10 rounded-full bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.3),rgba(34,211,238,0.07)_46%,transparent_70%)] blur-2xl" />
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  )
}
