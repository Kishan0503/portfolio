/**
 * Builds a dense, anatomically-proportioned human-face point cloud and a
 * Delaunay-triangulated edge mesh — the structure that makes a particle face
 * read as a realistic head (front view) rather than a loose constellation.
 *
 * Coordinates are normalized (x right, y down, origin between the eyes).
 * Returns { points, edges } where points carry a `type` (for styling) and,
 * for eyelids, a `blink` {openY, closedY}; iris/pupil carry `eyePart` so they
 * can fade during a blink. The triangulation is computed once on base
 * positions, so animating eyelid/jitter offsets never changes topology.
 */

// ---------- small math helpers ----------
function catmull(pts, perSeg, closed) {
  const out = []
  const n = pts.length
  const get = (i) => pts[((i % n) + n) % n]
  const segs = closed ? n : n - 1
  const cr = (p0, p1, p2, p3, u) => {
    const u2 = u * u
    const u3 = u2 * u
    return {
      x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * u + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * u2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * u3),
      y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * u + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * u2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * u3),
    }
  }
  for (let s = 0; s < segs; s++) {
    const p0 = closed ? get(s - 1) : pts[Math.max(0, s - 1)]
    const p1 = pts[s]
    const p2 = closed ? get(s + 1) : pts[s + 1]
    const p3 = closed ? get(s + 2) : pts[Math.min(n - 1, s + 2)]
    for (let t = 0; t < perSeg; t++) out.push(cr(p0, p1, p2, p3, t / perSeg))
  }
  if (!closed) out.push(pts[n - 1])
  return out
}

function pointInPoly(poly, x, y) {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x
    const yi = poly[i].y
    const xj = poly[j].x
    const yj = poly[j].y
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

// Bowyer–Watson Delaunay → unique edges.
function delaunayEdges(verts, n) {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (let i = 0; i < n; i++) {
    minX = Math.min(minX, verts[i].x)
    minY = Math.min(minY, verts[i].y)
    maxX = Math.max(maxX, verts[i].x)
    maxY = Math.max(maxY, verts[i].y)
  }
  const dmax = Math.max(maxX - minX, maxY - minY)
  const midx = (minX + maxX) / 2
  const midy = (minY + maxY) / 2
  const all = verts.slice(0, n)
  all.push({ x: midx - 20 * dmax, y: midy - dmax }, { x: midx, y: midy + 20 * dmax }, { x: midx + 20 * dmax, y: midy - dmax })
  const sa = n
  const sb = n + 1
  const sc = n + 2

  const circum = (a, b, c) => {
    const ax = all[a].x
    const ay = all[a].y
    const bx = all[b].x
    const by = all[b].y
    const cx = all[c].x
    const cy = all[c].y
    const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by))
    if (Math.abs(d) < 1e-12) return null
    const a2 = ax * ax + ay * ay
    const b2 = bx * bx + by * by
    const c2 = cx * cx + cy * cy
    const ux = (a2 * (by - cy) + b2 * (cy - ay) + c2 * (ay - by)) / d
    const uy = (a2 * (cx - bx) + b2 * (ax - cx) + c2 * (bx - ax)) / d
    return { x: ux, y: uy, r2: (ax - ux) ** 2 + (ay - uy) ** 2 }
  }

  let tris = [[sa, sb, sc]]
  for (let p = 0; p < n; p++) {
    const px = all[p].x
    const py = all[p].y
    const bad = []
    for (const t of tris) {
      const cc = circum(t[0], t[1], t[2])
      if (cc && (px - cc.x) ** 2 + (py - cc.y) ** 2 <= cc.r2 + 1e-9) bad.push(t)
    }
    const poly = []
    for (const t of bad) {
      const te = [[t[0], t[1]], [t[1], t[2]], [t[2], t[0]]]
      for (const e of te) {
        const k = poly.findIndex((x) => (x[0] === e[0] && x[1] === e[1]) || (x[0] === e[1] && x[1] === e[0]))
        if (k >= 0) poly.splice(k, 1)
        else poly.push(e)
      }
    }
    tris = tris.filter((t) => !bad.includes(t))
    for (const e of poly) tris.push([e[0], e[1], p])
  }

  const set = new Set()
  const edges = []
  for (const t of tris) {
    if (t[0] >= n || t[1] >= n || t[2] >= n) continue
    const te = [[t[0], t[1]], [t[1], t[2]], [t[2], t[0]]]
    for (let [a, b] of te) {
      if (a > b) [a, b] = [b, a]
      const key = a * 100000 + b
      if (!set.has(key)) {
        set.add(key)
        edges.push([a, b])
      }
    }
  }
  return edges
}

function buildFace() {
  const points = []
  const seen = new Map()
  const add = (x, y, type = 'fill', extra) => {
    const key = `${Math.round(x * 2000)}_${Math.round(y * 2000)}`
    if (seen.has(key)) return seen.get(key)
    points.push({ x, y, type, ...extra })
    const idx = points.length - 1
    seen.set(key, idx)
    return idx
  }
  const addM = (x, y, type, extra) => {
    add(x, y, type, extra)
    if (Math.abs(x) > 1e-4) add(-x, y, type, extra)
  }

  // ---- head silhouette (right half → mirror → closed loop) ----
  const half = [
    [0, -1.18], [0.24, -1.13], [0.42, -1.04], [0.56, -0.9], [0.645, -0.72],
    [0.69, -0.5], [0.715, -0.28], [0.72, -0.06], [0.705, 0.16], [0.66, 0.36],
    [0.59, 0.54], [0.48, 0.71], [0.34, 0.86], [0.18, 0.98], [0, 1.05],
  ].map(([x, y]) => ({ x, y }))
  const loop = [...half]
  for (let i = half.length - 2; i >= 1; i--) loop.push({ x: -half[i].x, y: half[i].y })
  const sil = catmull(loop, 2, true)
  sil.forEach((p) => add(p.x, p.y, 'outline'))

  // ---- neck base (suggests jaw/throat continuation) ----
  addM(0.2, 1.14, 'neck')
  addM(0.12, 1.28, 'neck')
  add(0, 1.22, 'neck')
  addM(0.32, 1.05, 'neck')

  // ---- ears (protruding helix + inner concha for clear ear shape) ----
  const earR = [
    [0.71, -0.06], [0.85, -0.08], [0.95, 0.0], [0.98, 0.13], [0.93, 0.25], [0.82, 0.32], [0.71, 0.3],
  ].map(([x, y]) => ({ x, y }))
  catmull(earR, 3, false).forEach((p) => addM(p.x, p.y, 'ear'))
  // inner concha
  addM(0.8, 0.04, 'ear')
  addM(0.86, 0.14, 'ear')
  addM(0.81, 0.22, 'ear')
  addM(0.76, 0.12, 'ear')
  addM(0.75, 0.0, 'ear')

  // ---- forehead / cheek contour density ----
  ;[[0, -0.78], [0.22, -0.74], [0.42, -0.66], [0.55, -0.5], [0.5, -0.18], [0.55, 0.08], [0.46, 0.3], [0.34, 0.5], [0.2, 0.66]]
    .forEach(([x, y]) => addM(x, y, 'cheek'))

  // ---- eyebrows (two rows for thickness) ----
  const browR = [
    [0.1, -0.3], [0.22, -0.37], [0.36, -0.385], [0.5, -0.34], [0.58, -0.28],
  ].map(([x, y]) => ({ x, y }))
  catmull(browR, 3, false).forEach((p) => {
    addM(p.x, p.y, 'brow')
    addM(p.x, p.y - 0.035, 'brow')
  })

  // ---- eyes (built for the right eye, then mirrored) ----
  const EYE = { cx: 0.31, cy: -0.05 }
  const buildEye = (cx) => {
    // upper lid (inner corner → outer corner), sampled smooth; mid points blink
    const upper = [
      { x: cx - 0.21, y: -0.03 },
      { x: cx - 0.1, y: -0.12 },
      { x: cx, y: -0.145 },
      { x: cx + 0.1, y: -0.12 },
      { x: cx + 0.21, y: -0.03 },
    ]
    const lower = [
      { x: cx + 0.21, y: -0.03 },
      { x: cx + 0.09, y: 0.04 },
      { x: cx, y: 0.055 },
      { x: cx - 0.09, y: 0.04 },
      { x: cx - 0.21, y: -0.03 },
    ]
    const us = catmull(upper, 3, false)
    us.forEach((p, i) => {
      const corner = i === 0 || i === us.length - 1
      addM(p.x, p.y, 'eye', corner ? undefined : { blink: { openY: p.y, closedY: 0.0 } })
    })
    catmull(lower, 3, false).forEach((p) => addM(p.x, p.y, 'eye'))
    // iris ring + inner ring + pupil
    const irisCY = -0.02
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2
      addM(cx + Math.cos(a) * 0.072, irisCY + Math.sin(a) * 0.062, 'iris', { eyePart: 'iris' })
    }
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2
      addM(cx + Math.cos(a) * 0.038, irisCY + Math.sin(a) * 0.034, 'iris', { eyePart: 'iris' })
    }
    addM(cx, irisCY, 'pupil', { eyePart: 'pupil' })
  }
  buildEye(EYE.cx)

  // ---- nose (bridge, tip, wings, nostrils, septum) ----
  add(0, -0.13, 'nose')
  add(0, -0.05, 'nose')
  add(0, 0.04, 'nose')
  add(0, 0.14, 'nose')
  addM(0.045, -0.1, 'nose')
  addM(0.05, -0.02, 'nose')
  addM(0.055, 0.07, 'nose')
  addM(0.07, 0.17, 'nose')
  // tip ball
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2
    add(Math.cos(a) * 0.055, 0.29 + Math.sin(a) * 0.045, 'nose')
  }
  add(0, 0.29, 'nose')
  addM(0.12, 0.27, 'nose') // ala top
  addM(0.145, 0.31, 'nose') // ala
  addM(0.11, 0.36, 'nose') // wing base
  addM(0.055, 0.37, 'nose') // nostril
  add(0, 0.345, 'nose') // septum
  addM(0.065, 0.335, 'nose') // nostril hole hint

  // ---- lips ----
  const upperLip = [
    [-0.22, 0.585], [-0.12, 0.555], [-0.04, 0.55], [0, 0.565], [0.04, 0.55], [0.12, 0.555], [0.22, 0.585],
  ].map(([x, y]) => ({ x, y }))
  const seam = [
    [-0.22, 0.6], [-0.1, 0.61], [0, 0.615], [0.1, 0.61], [0.22, 0.6],
  ].map(([x, y]) => ({ x, y }))
  const lowerLip = [
    [-0.19, 0.65], [-0.08, 0.695], [0, 0.705], [0.08, 0.695], [0.19, 0.65],
  ].map(([x, y]) => ({ x, y }))
  catmull(upperLip, 3, false).forEach((p) => add(p.x, p.y, 'lip'))
  catmull(seam, 3, false).forEach((p) => add(p.x, p.y, 'lip'))
  catmull(lowerLip, 3, false).forEach((p) => add(p.x, p.y, 'lip'))
  addM(0.03, 0.45, 'lip') // philtrum
  add(0, 0.5, 'lip')

  // ---- masked interior fill grid (background-style density) ----
  let seed = 1357913
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
  const inEye = (x, y) =>
    (x - EYE.cx) ** 2 / 0.165 ** 2 + (y - EYE.cy) ** 2 / 0.11 ** 2 < 1 ||
    (x + EYE.cx) ** 2 / 0.165 ** 2 + (y - EYE.cy) ** 2 / 0.11 ** 2 < 1
  const STEP = 0.125
  for (let gy = -1.12; gy <= 1.06; gy += STEP) {
    for (let gx = -0.74; gx <= 0.74; gx += STEP) {
      const x = gx + (rand() - 0.5) * 0.08
      const y = gy + (rand() - 0.5) * 0.08
      if (!pointInPoly(sil, x, y)) continue
      if (inEye(x, y)) continue
      add(x, y, 'fill')
    }
  }

  // ---- triangulate + cull over-long spans ----
  const n = points.length
  const raw = delaunayEdges(points.map((p) => ({ x: p.x, y: p.y })), n)
  const MAXLEN = 0.3
  const edges = []
  for (const [a, b] of raw) {
    const d = Math.hypot(points[a].x - points[b].x, points[a].y - points[b].y)
    if (d > MAXLEN) continue
    // shade by length: shorter = brighter (depth cue)
    const shade = d < 0.12 ? 0 : d < 0.2 ? 1 : 2
    edges.push([a, b, shade])
  }

  return { points, edges }
}

export default buildFace
