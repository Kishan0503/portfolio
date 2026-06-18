/**
 * Marks ONLY the facial-feature contour nodes on the existing particle-face
 * mesh, following the hand-drawn guide: eyebrow arcs, eye outlines, nose ridges
 * + nostril base, and the lip border. It recomputes the `feature` flag array in
 * src/data/faceMesh.js and rewrites the file with vertices / edges / eyes left
 * byte-for-byte unchanged — so the renderer (which already draws flagged nodes
 * and flagged-edge pairs brighter) highlights exactly these outlines and
 * nothing else.
 *
 * Each contour is a 2D polyline in the front-projected (x, y) plane (the face is
 * viewed head-on); a node is flagged when it lies within `tol` of the polyline
 * AND on the front surface (z >= zmin), which excludes the rear skull. Curves
 * marked `mirror` are also applied to the opposite side (x -> -x).
 *
 * Re-run: `node scripts/mark-contours.mjs`
 */
import fs from 'fs'
import path from 'path'
import { vertices as V, edges as E, eyes } from '../src/data/faceMesh.js'

const OUT = path.resolve('src/data/faceMesh.js')

// ---------- contour curves (right side; `mirror` duplicates to the left) ----------
const CURVES = [
  // eyebrow arch above the right eye
  {
    name: 'brow',
    mirror: true,
    tol: 0.04,
    zmin: 0.4,
    pts: [[0.06, -0.27], [0.13, -0.282], [0.2, -0.262], [0.27, -0.265], [0.34, -0.272], [0.41, -0.27]],
  },
  // almond outline around the right eye
  {
    name: 'eye',
    mirror: true,
    closed: true,
    tol: 0.036,
    zmin: 0.4,
    pts: [[0.17, -0.135], [0.24, -0.195], [0.33, -0.19], [0.41, -0.15], [0.34, -0.113], [0.25, -0.113]],
  },
  // right ridge line of the nose, brow → nostril
  {
    name: 'noseRidge',
    mirror: true,
    tol: 0.036,
    zmin: 0.52,
    pts: [[0.05, -0.17], [0.05, -0.1], [0.06, -0.02], [0.08, 0.05], [0.11, 0.1], [0.14, 0.12]],
  },
  // nostril base curve across the bottom of the nose
  {
    name: 'noseBase',
    mirror: false,
    tol: 0.036,
    zmin: 0.55,
    pts: [[0.14, 0.12], [0.07, 0.14], [0.0, 0.128], [-0.07, 0.14], [-0.14, 0.12]],
  },
  // lip border (closed)
  {
    name: 'lips',
    mirror: false,
    closed: true,
    tol: 0.042,
    zmin: 0.55,
    pts: [
      [-0.2, 0.25], [-0.12, 0.224], [-0.04, 0.244], [0.0, 0.235], [0.04, 0.244], [0.12, 0.224],
      [0.2, 0.25], [0.12, 0.312], [0.0, 0.336], [-0.12, 0.312],
    ],
  },
]

// distance from point p to segment a–b in the (x, y) plane
const segDist = (p, a, b) => {
  const vx = b[0] - a[0]
  const vy = b[1] - a[1]
  const wx = p[0] - a[0]
  const wy = p[1] - a[1]
  let t = (vx * wx + vy * wy) / (vx * vx + vy * vy || 1)
  t = Math.max(0, Math.min(1, t))
  return Math.hypot(p[0] - (a[0] + t * vx), p[1] - (a[1] + t * vy))
}
const polyDist = (p, pts, closed) => {
  let d = Infinity
  const n = pts.length
  for (let i = 0; i < n - 1; i++) d = Math.min(d, segDist(p, pts[i], pts[i + 1]))
  if (closed) d = Math.min(d, segDist(p, pts[n - 1], pts[0]))
  return d
}

const onCurve = (v, c) => {
  if (v[2] < c.zmin) return false
  if (polyDist(v, c.pts, c.closed) <= c.tol) return true
  if (c.mirror) {
    const mpts = c.pts.map((q) => [-q[0], q[1]])
    if (polyDist(v, mpts, c.closed) <= c.tol) return true
  }
  return false
}

const feature = V.map((v) => (CURVES.some((c) => onCurve(v, c)) ? 1 : 0))

// ---------- stats ----------
const flagged = feature.reduce((s, f) => s + f, 0)
let fe = 0
for (const [a, b] of E) if (feature[a] && feature[b]) fe++
console.log('flagged contour nodes:', flagged, '/', V.length, '| contour edges:', fe)
for (const c of CURVES) {
  const n = V.filter((v) => onCurve(v, c)).length
  console.log('  ', c.name.padEnd(10), n)
}

// ---------- write (vertices / edges / eyes preserved verbatim) ----------
const out = `/**
 * Particle-face mesh extracted from the Lee Perry-Smith head model
 * (Infinite-Realities, CC-BY 3.0) by scripts/extract-face.mjs using quadric
 * edge-collapse simplification (topology-preserving). Vertices are normalized:
 * centered, y-down, +z front, unit-scaled. Auto-generated — do not edit.
 *
 * \`feature\` flags only the facial-contour nodes (eyebrows, eye outlines, nose
 * ridges + nostril base, lip border) — set by scripts/mark-contours.mjs.
 */
export const vertices = ${JSON.stringify(V)}
export const edges = ${JSON.stringify(E)}
export const eyes = ${JSON.stringify(eyes)}
export const feature = ${JSON.stringify(feature)}
`
fs.writeFileSync(OUT, out)
console.log('wrote', OUT, `(${(out.length / 1024).toFixed(0)} KB)`)
