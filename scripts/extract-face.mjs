/**
 * Build-time extractor: parses a binary glTF (.glb) head model and produces a
 * clean particle-network mesh for the hero avatar.
 *
 * Pipeline (topology-preserving):
 *   1. parse GLB → positions + triangle indices
 *   2. weld coincident vertices (shared topology)
 *   3. normalize (centered, y-down, +z front, unit-scaled) + re-center on head
 *   4. crop the bust to head + upper neck
 *   5. QUADRIC EDGE-COLLAPSE simplification (meshoptimizer) — reduces density
 *      while preserving manifold topology / feature edge loops (eyes, lips,
 *      nose). Edge-collapse only merges already-connected vertices, so it can
 *      never create cross-surface "scribble" edges the way voxel binning did.
 *   6. recompute normals → back-face cull (drops rear-of-head + interior
 *      eyeball/mouth surfaces so the front facial structure reads cleanly)
 *   7. build edges from the simplified triangles, compact, tag eyes
 *
 * Source model: Lee Perry-Smith head (Infinite-Realities), CC-BY 3.0.
 * Usage: node scripts/extract-face.mjs <input.glb> [ratio] [neckCut] [cullNz]
 */
import fs from 'fs'
import path from 'path'
import { MeshoptSimplifier } from 'meshoptimizer'

const INPUT = process.argv[2] || '/tmp/head.glb'
const RATIO = parseFloat(process.argv[3] || '0.5') // target fraction of head triangles
const CUT = parseFloat(process.argv[4] || '0.32') // neck cut (y-down, normalized)
const CULL_NZ = parseFloat(process.argv[5] || '-0.1') // back-face cull threshold
const SPACING = parseFloat(process.argv[6] || '0.05') // Poisson-disk node spacing (uniform density)
const K = 5 // nearest-neighbour connections per node
const TARGET_ERROR = 0.03
const OUT = path.resolve('src/data/faceMesh.js')

// ---------- parse GLB ----------
const buf = fs.readFileSync(INPUT)
if (buf.readUInt32LE(0) !== 0x46546c67) throw new Error('Not a GLB file')
const totalLen = buf.readUInt32LE(8)
let json
let bin
let off = 12
while (off < totalLen) {
  const clen = buf.readUInt32LE(off)
  const ctype = buf.readUInt32LE(off + 4)
  off += 8
  const data = buf.subarray(off, off + clen)
  off += clen
  if (ctype === 0x4e4f534a) json = JSON.parse(data.toString('utf8'))
  else if (ctype === 0x004e4942) bin = data
}

const COMPS = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }
function readAccessor(idx) {
  const acc = json.accessors[idx]
  const bv = json.bufferViews[acc.bufferView]
  const base = (bv.byteOffset || 0) + (acc.byteOffset || 0)
  const comps = COMPS[acc.type]
  const ct = acc.componentType
  const elemSize = ct === 5126 ? 4 : ct === 5125 ? 4 : ct === 5123 ? 2 : 1
  const stride = bv.byteStride || comps * elemSize
  const out = []
  for (let i = 0; i < acc.count; i++) {
    const p = base + i * stride
    for (let c = 0; c < comps; c++) {
      const o = p + c * elemSize
      if (ct === 5126) out.push(bin.readFloatLE(o))
      else if (ct === 5125) out.push(bin.readUInt32LE(o))
      else if (ct === 5123) out.push(bin.readUInt16LE(o))
      else if (ct === 5121) out.push(bin.readUInt8(o))
    }
  }
  return out
}

let positions = []
let indices = []
for (const mesh of json.meshes) {
  for (const prim of mesh.primitives) {
    if (prim.attributes.POSITION == null || prim.indices == null) continue
    const vOffset = positions.length / 3
    positions = positions.concat(readAccessor(prim.attributes.POSITION))
    for (const i of readAccessor(prim.indices)) indices.push(i + vOffset)
  }
}
console.log('raw vertices:', positions.length / 3, 'triangles:', indices.length / 3)

// ---------- weld coincident vertices ----------
const wmap = new Map()
const wpos = []
const wremap = new Int32Array(positions.length / 3)
for (let i = 0; i < positions.length / 3; i++) {
  const x = positions[i * 3]
  const y = positions[i * 3 + 1]
  const z = positions[i * 3 + 2]
  const key = `${Math.round(x * 1e4)}_${Math.round(y * 1e4)}_${Math.round(z * 1e4)}`
  if (wmap.has(key)) {
    wremap[i] = wmap.get(key)
  } else {
    const ni = wpos.length / 3
    wmap.set(key, ni)
    wpos.push(x, y, z)
    wremap[i] = ni
  }
}
const wind = indices.map((i) => wremap[i])
const wcount = wpos.length / 3
console.log('welded vertices:', wcount)

// ---------- normalize (y-down, +z front, unit) then re-center on head ----------
let min = [Infinity, Infinity, Infinity]
let max = [-Infinity, -Infinity, -Infinity]
for (let i = 0; i < wcount; i++)
  for (let a = 0; a < 3; a++) {
    const v = wpos[i * 3 + a]
    if (v < min[a]) min[a] = v
    if (v > max[a]) max[a] = v
  }
const center = [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2]
const s = 1 / (Math.max(max[0] - min[0], max[1] - min[1]) / 2)
const pos = new Float64Array(wcount * 3)
for (let i = 0; i < wcount; i++) {
  pos[i * 3] = (wpos[i * 3] - center[0]) * s
  pos[i * 3 + 1] = -(wpos[i * 3 + 1] - center[1]) * s
  pos[i * 3 + 2] = (wpos[i * 3 + 2] - center[2]) * s
}
// head bbox (y <= CUT) → re-center & re-scale so the head fills the frame
let hmin = [Infinity, Infinity, Infinity]
let hmax = [-Infinity, -Infinity, -Infinity]
for (let i = 0; i < wcount; i++) {
  if (pos[i * 3 + 1] > CUT) continue
  for (let a = 0; a < 3; a++) {
    const v = pos[i * 3 + a]
    if (v < hmin[a]) hmin[a] = v
    if (v > hmax[a]) hmax[a] = v
  }
}
const hc = [(hmin[0] + hmax[0]) / 2, (hmin[1] + hmax[1]) / 2, (hmin[2] + hmax[2]) / 2]
const hs = 1 / (Math.max(hmax[0] - hmin[0], hmax[1] - hmin[1]) / 2)

// ---------- crop bust to head (in FULL-normalized space, where CUT is the neck) ----------
// Must run BEFORE the head re-centering transform below — otherwise CUT lands
// mid-face and chops off the mouth/chin/jaw.
const cropIndices = []
for (let t = 0; t < wind.length; t += 3) {
  const a = wind[t]
  const b = wind[t + 1]
  const c = wind[t + 2]
  const cy = (pos[a * 3 + 1] + pos[b * 3 + 1] + pos[c * 3 + 1]) / 3
  if (cy <= CUT) cropIndices.push(a, b, c)
}
console.log('head triangles:', cropIndices.length / 3)

// ---------- re-center & re-scale on the head so it fills the frame ----------
for (let i = 0; i < wcount; i++) {
  pos[i * 3] = (pos[i * 3] - hc[0]) * hs
  pos[i * 3 + 1] = (pos[i * 3 + 1] - hc[1]) * hs
  pos[i * 3 + 2] = (pos[i * 3 + 2] - hc[2]) * hs
}

// ---------- quadric edge-collapse simplification ----------
await MeshoptSimplifier.ready
const fpos = Float32Array.from(pos)
const triCount = cropIndices.length / 3
const targetIndexCount = Math.max(3, Math.floor(triCount * RATIO)) * 3
const [newIdx, error] = MeshoptSimplifier.simplify(
  Uint32Array.from(cropIndices),
  fpos,
  3,
  targetIndexCount,
  TARGET_ERROR,
  ['LockBorder'],
)
console.log('simplified triangles:', newIdx.length / 3, 'error:', error.toFixed(4))

// ---------- normals (from simplified mesh) → back-face cull ----------
const nrm = new Float64Array(wcount * 3)
for (let t = 0; t < newIdx.length; t += 3) {
  const ia = newIdx[t]
  const ib = newIdx[t + 1]
  const ic = newIdx[t + 2]
  const e1x = pos[ib * 3] - pos[ia * 3]
  const e1y = pos[ib * 3 + 1] - pos[ia * 3 + 1]
  const e1z = pos[ib * 3 + 2] - pos[ia * 3 + 2]
  const e2x = pos[ic * 3] - pos[ia * 3]
  const e2y = pos[ic * 3 + 1] - pos[ia * 3 + 1]
  const e2z = pos[ic * 3 + 2] - pos[ia * 3 + 2]
  const nx = e1y * e2z - e1z * e2y
  const ny = e1z * e2x - e1x * e2z
  const nz = e1x * e2y - e1y * e2x
  for (const idx of [ia, ib, ic]) {
    nrm[idx * 3] += nx
    nrm[idx * 3 + 1] += ny
    nrm[idx * 3 + 2] += nz
  }
}
const vnz = new Float64Array(wcount)
let frontSum = 0
let frontN = 0
for (let i = 0; i < wcount; i++) {
  const L = Math.hypot(nrm[i * 3], nrm[i * 3 + 1], nrm[i * 3 + 2]) || 1
  vnz[i] = nrm[i * 3 + 2] / L
  if (pos[i * 3 + 2] > 0.5) {
    frontSum += vnz[i]
    frontN++
  }
}
if (frontN && frontSum / frontN < 0) for (let i = 0; i < wcount; i++) vnz[i] = -vnz[i]
const culled = (i) => vnz[i] < CULL_NZ

// ---------- crease + silhouette detection → feature outline curves ----------
// Crease edges (adjacent faces meet at a sharp angle) trace the eyelid creases,
// lip border, nostrils, brow ridge, nasolabial line and jaw; border edges (only
// one front face) trace the face silhouette. These are the curves to highlight.
const faceNorm = (a, b, c) => {
  const ux = pos[b * 3] - pos[a * 3]
  const uy = pos[b * 3 + 1] - pos[a * 3 + 1]
  const uz = pos[b * 3 + 2] - pos[a * 3 + 2]
  const vx = pos[c * 3] - pos[a * 3]
  const vy = pos[c * 3 + 1] - pos[a * 3 + 1]
  const vz = pos[c * 3 + 2] - pos[a * 3 + 2]
  let nx = uy * vz - uz * vy
  let ny = uz * vx - ux * vz
  let nz = ux * vy - uy * vx
  const L = Math.hypot(nx, ny, nz) || 1
  return [nx / L, ny / L, nz / L]
}
const edgeFaces = new Map()
for (let t = 0; t < newIdx.length; t += 3) {
  const a = newIdx[t]
  const b = newIdx[t + 1]
  const c = newIdx[t + 2]
  if ((vnz[a] + vnz[b] + vnz[c]) / 3 < CULL_NZ) continue // front faces only
  const n = faceNorm(a, b, c)
  for (const [u, v] of [[a, b], [b, c], [c, a]]) {
    const key = u < v ? u * 1e7 + v : v * 1e7 + u
    let e = edgeFaces.get(key)
    if (!e) {
      e = { ends: [Math.min(u, v), Math.max(u, v)], n: [] }
      edgeFaces.set(key, e)
    }
    e.n.push(n)
  }
}
const COS_CREASE = Math.cos((35 * Math.PI) / 180)
const creasePts = []
for (const e of edgeFaces.values()) {
  let crease = false
  if (e.n.length === 1) crease = true // silhouette / border
  else {
    const d = e.n[0][0] * e.n[1][0] + e.n[0][1] * e.n[1][1] + e.n[0][2] * e.n[1][2]
    if (d < COS_CREASE) crease = true
  }
  if (crease) for (const vi of e.ends) creasePts.push([pos[vi * 3], pos[vi * 3 + 1], pos[vi * 3 + 2]])
}
console.log('crease points:', creasePts.length)

// ---------- candidate cloud: area-weighted SURFACE sampling ----------
// Scatter points across front-facing triangles proportional to area, so even
// large low-detail regions (crown) get a dense, uniform candidate cloud — the
// final node density is then set purely by Poisson spacing, not by the source
// mesh's uneven vertex distribution. This is what makes the whole head uniform.
let jseed = 123456789
const rnd01 = () => {
  jseed = (jseed * 16807) % 2147483647
  return jseed / 2147483647
}
const SAMPLE = 0.018 // candidate spacing (denser than node spacing)
const triArea = (a, b, c) => {
  const ux = pos[b * 3] - pos[a * 3]
  const uy = pos[b * 3 + 1] - pos[a * 3 + 1]
  const uz = pos[b * 3 + 2] - pos[a * 3 + 2]
  const vx = pos[c * 3] - pos[a * 3]
  const vy = pos[c * 3 + 1] - pos[a * 3 + 1]
  const vz = pos[c * 3 + 2] - pos[a * 3 + 2]
  return 0.5 * Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx)
}
// Median triangle area → reference for "feature detail". Features (eyes, lips,
// nostrils, brows, ear folds) keep much smaller triangles than flat cheeks, so a
// small area ⇒ high feature score.
const areasFront = []
for (let t = 0; t < newIdx.length; t += 3) {
  if ((vnz[newIdx[t]] + vnz[newIdx[t + 1]] + vnz[newIdx[t + 2]]) / 3 < CULL_NZ) continue
  areasFront.push(triArea(newIdx[t], newIdx[t + 1], newIdx[t + 2]))
}
areasFront.sort((a, b) => a - b)
const medianArea = areasFront[Math.floor(areasFront.length / 2)] || 1e-6

const cand = []
for (let t = 0; t < newIdx.length; t += 3) {
  const a = newIdx[t]
  const b = newIdx[t + 1]
  const c = newIdx[t + 2]
  if ((vnz[a] + vnz[b] + vnz[c]) / 3 < CULL_NZ) continue // front-facing only
  const ax = pos[a * 3]
  const ay = pos[a * 3 + 1]
  const az = pos[a * 3 + 2]
  const ux = pos[b * 3] - ax
  const uy = pos[b * 3 + 1] - ay
  const uz = pos[b * 3 + 2] - az
  const vx = pos[c * 3] - ax
  const vy = pos[c * 3 + 1] - ay
  const vz = pos[c * 3 + 2] - az
  const area = triArea(a, b, c)
  const fscore = Math.max(0, Math.min(1, 1 - area / medianArea)) // small tri → ~1
  const count = Math.max(1, Math.round(area / (SAMPLE * SAMPLE)))
  for (let s = 0; s < count; s++) {
    let r1 = rnd01()
    let r2 = rnd01()
    if (r1 + r2 > 1) {
      r1 = 1 - r1
      r2 = 1 - r2
    }
    cand.push([ax + r1 * ux + r2 * vx, ay + r1 * uy + r2 * vy, az + r1 * uz + r2 * vz, fscore])
  }
}

// ---------- z-occlusion: keep only the frontmost (outer) layer per screen cell ----------
// Front view has multiple stacked front-facing layers at the eyes (eyelids +
// eyeball), mouth (lips + inner mouth) and ears (ear + skull behind). A real
// renderer's depth buffer hides the rear ones; here we emulate it: bin
// candidates by screen (x,y) and drop any that sit further back than the
// nearest surface in their column. This leaves a single clean outer shell.
const OCC = parseFloat(process.argv[7] || '0.03')
const DEPTH_TOL = parseFloat(process.argv[8] || '0.07')
const colMax = new Map()
const ckey = (p) => `${Math.round(p[0] / OCC)}_${Math.round(p[1] / OCC)}`
for (const p of cand) {
  const k = ckey(p)
  const m = colMax.get(k)
  if (m === undefined || p[2] > m) colMax.set(k, p[2])
}
const visible = cand.filter((p) => p[2] >= colMax.get(ckey(p)) - DEPTH_TOL)
console.log('candidates:', cand.length, '→ visible (outer layer):', visible.length)

// ---------- variable-spacing Poisson thinning ----------
// Sparse on flat regions, DENSE on feature regions (small source triangles), so
// the eyebrows/eyes/nose/lips/ears get extra nodes to define their outlines
// while the rest of the face stays clean and light.
const SPACING_MAX = SPACING // flat regions (sparser overall)
const SPACING_MIN = SPACING * 0.42 // feature regions (denser)
const radiusOf = (f) => SPACING_MAX - (SPACING_MAX - SPACING_MIN) * f
const CELL = SPACING_MAX
const thinGrid = new Map()
const finalVerts = []
for (const p of visible) {
  const rp = radiusOf(p[3])
  const gx = Math.round(p[0] / CELL)
  const gy = Math.round(p[1] / CELL)
  const gz = Math.round(p[2] / CELL)
  let ok = true
  for (let dx = -1; dx <= 1 && ok; dx++)
    for (let dy = -1; dy <= 1 && ok; dy++)
      for (let dz = -1; dz <= 1 && ok; dz++) {
        const arr = thinGrid.get(`${gx + dx}_${gy + dy}_${gz + dz}`)
        if (!arr) continue
        for (const q of arr) {
          const d2 = (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2
          const minD = (rp + q[4]) * 0.5
          if (d2 < minD * minD) {
            ok = false
            break
          }
        }
      }
  if (ok) {
    const k = `${gx}_${gy}_${gz}`
    if (!thinGrid.has(k)) thinGrid.set(k, [])
    thinGrid.get(k).push([p[0], p[1], p[2], p[3], rp])
    finalVerts.push([p[0], p[1], p[2]])
  }
}

// ---------- highlight mask: nodes near a crease/silhouette curve ----------
const HL = SPACING_MAX * 0.75
const HL2 = HL * HL
const cgcell = HL
const cgrid = new Map()
for (const cp of creasePts) {
  const k = `${Math.round(cp[0] / cgcell)}_${Math.round(cp[1] / cgcell)}_${Math.round(cp[2] / cgcell)}`
  if (!cgrid.has(k)) cgrid.set(k, [])
  cgrid.get(k).push(cp)
}
const featureMask = finalVerts.map((p) => {
  const gx = Math.round(p[0] / cgcell)
  const gy = Math.round(p[1] / cgcell)
  const gz = Math.round(p[2] / cgcell)
  for (let dx = -1; dx <= 1; dx++)
    for (let dy = -1; dy <= 1; dy++)
      for (let dz = -1; dz <= 1; dz++) {
        const arr = cgrid.get(`${gx + dx}_${gy + dy}_${gz + dz}`)
        if (!arr) continue
        for (const cp of arr) {
          if ((p[0] - cp[0]) ** 2 + (p[1] - cp[1]) ** 2 + (p[2] - cp[2]) ** 2 < HL2) return 1
        }
      }
  return 0
})

// ---------- kNN edges among the nodes ----------
const ecell = SPACING_MIN
const egrid = new Map()
finalVerts.forEach((p, idx) => {
  const k = `${Math.round(p[0] / ecell)}_${Math.round(p[1] / ecell)}_${Math.round(p[2] / ecell)}`
  if (!egrid.has(k)) egrid.set(k, [])
  egrid.get(k).push(idx)
})
const reach = Math.ceil((SPACING_MAX * 2.2) / ecell)
const MAXD2 = (SPACING_MAX * 2.2) ** 2
const eset = new Set()
const edges = []
finalVerts.forEach((p, i) => {
  const gx = Math.round(p[0] / ecell)
  const gy = Math.round(p[1] / ecell)
  const gz = Math.round(p[2] / ecell)
  const near = []
  for (let dx = -reach; dx <= reach; dx++)
    for (let dy = -reach; dy <= reach; dy++)
      for (let dz = -reach; dz <= reach; dz++) {
        const arr = egrid.get(`${gx + dx}_${gy + dy}_${gz + dz}`)
        if (!arr) continue
        for (const j of arr) {
          if (j === i) continue
          const q = finalVerts[j]
          const d2 = (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2
          if (d2 <= MAXD2) near.push([d2, j])
        }
      }
  near.sort((a, b) => a[0] - b[0])
  for (let n = 0; n < Math.min(K, near.length); n++) {
    const j = near[n][1]
    const a = Math.min(i, j)
    const b = Math.max(i, j)
    const k = a * 1e6 + b
    if (!eset.has(k)) {
      eset.add(k)
      edges.push([a, b])
    }
  }
})

// ---------- eye anchors (front-hemisphere centroid of each eye region) ----------
function eyeAnchor(side) {
  let sx = 0
  let sy = 0
  let sz = 0
  let n = 0
  for (const v of finalVerts) {
    if (side * v[0] < 0.16 || side * v[0] > 0.46) continue
    if (v[1] < -0.32 || v[1] > -0.02) continue
    if (v[2] < 0.25) continue
    sx += v[0]
    sy += v[1]
    sz += v[2]
    n++
  }
  return n ? [sx / n, sy / n, sz / n] : null
}
const eyes = [eyeAnchor(1), eyeAnchor(-1)].filter(Boolean)

const r = (n) => Math.round(n * 1000) / 1000
const verts = finalVerts.map((v) => [r(v[0]), r(v[1]), r(v[2])])
console.log('output vertices:', verts.length, 'edges:', edges.length, 'eyes:', eyes.length)

const out = `/**
 * Particle-face mesh extracted from the Lee Perry-Smith head model
 * (Infinite-Realities, CC-BY 3.0) by scripts/extract-face.mjs using quadric
 * edge-collapse simplification (topology-preserving). Vertices are normalized:
 * centered, y-down, +z front, unit-scaled. Auto-generated — do not edit.
 */
export const vertices = ${JSON.stringify(verts)}
export const edges = ${JSON.stringify(edges)}
export const eyes = ${JSON.stringify(eyes.map((v) => [r(v[0]), r(v[1]), r(v[2])]))}
export const feature = ${JSON.stringify(featureMask)}
`
fs.writeFileSync(OUT, out)
console.log('wrote', OUT, `(${(out.length / 1024).toFixed(0)} KB)`)
