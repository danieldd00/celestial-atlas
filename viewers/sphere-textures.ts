export type TextureKind = "earth" | "moon" | "rocky" | "mars" | "venus" | "gasJupiter" | "gasSaturn" | "iceUranus" | "iceNeptune" | "dwarf" | "starHot" | "starRed";

export type TextureSet = {
  w: number;
  h: number;
  base: Uint32Array;
  clouds?: Uint32Array; // RGBA, premult not required (we blend manually)
};

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

function packRGBA(r: number, g: number, b: number, a: number = 255): number {
  // Uint32 view on ImageData is little-endian => bytes [r,g,b,a]
  return ((a & 255) << 24) | ((b & 255) << 16) | ((g & 255) << 8) | (r & 255);
}

function clamp01(x: number) {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// Value noise (fast + good enough for textures)
function makeNoise2D(seed: number) {
  const rnd = mulberry32(seed);
  const gridSize = 256;
  const grid = new Float32Array(gridSize * gridSize);
  for (let i = 0; i < grid.length; i++) grid[i] = rnd() * 2 - 1;

  const fade = (t: number) => t * t * (3 - 2 * t);

  return (x: number, y: number) => {
    const xi = Math.floor(x) & 255;
    const yi = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);

    const a = grid[yi * gridSize + xi];
    const b = grid[yi * gridSize + ((xi + 1) & 255)];
    const c = grid[((yi + 1) & 255) * gridSize + xi];
    const d = grid[((yi + 1) & 255) * gridSize + ((xi + 1) & 255)];

    const u = fade(xf);
    const v = fade(yf);

    return lerp(lerp(a, b, u), lerp(c, d, u), v);
  };
}

function fbm(noise: (x: number, y: number) => number, x: number, y: number, octaves: number, lac: number, gain: number) {
  let amp = 0.5;
  let freq = 1;
  let sum = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * noise(x * freq, y * freq);
    freq *= lac;
    amp *= gain;
  }
  return sum;
}

export function getTextureKindByIdAndType(id: string, type: string): TextureKind {
  const lid = id.toLowerCase();

  if (type === "star") return lid.includes("betel") ? "starRed" : "starHot";
  if (lid === "earth") return "earth";
  if (lid === "mars") return "mars";
  if (lid === "venus") return "venus";
  if (lid === "jupiter") return "gasJupiter";
  if (lid === "saturn") return "gasSaturn";
  if (lid === "uranus") return "iceUranus";
  if (lid === "neptune") return "iceNeptune";

  // moons
  if (type === "moon" || ["moon", "phobos", "deimos", "io", "europa", "enceladus", "titan", "ganymede", "callisto", "triton", "charon"].includes(lid)) {
    return "moon";
  }

  if (type === "dwarf planet" || ["pluto", "ceres"].includes(lid)) return "dwarf";

  // default rocky
  return "rocky";
}

export function makeTextureSet(kind: TextureKind, seedKey: string): TextureSet {
  const seed = hashSeed(seedKey + "::" + kind);
  const noiseA = makeNoise2D(seed ^ 0x9e3779b9);
  const noiseB = makeNoise2D(seed ^ 0x85ebca6b);

  const w = 512;
  const h = 256;
  const base = new Uint32Array(w * h);
  let clouds: Uint32Array | undefined;

  if (kind === "earth") clouds = new Uint32Array(w * h);

  for (let y = 0; y < h; y++) {
    const v = y / (h - 1); // 0..1
    const lat = (v - 0.5) * Math.PI; // -pi/2..pi/2
    const latAbs = Math.abs(lat);

    for (let x = 0; x < w; x++) {
      const u = x / (w - 1);
      const lon = (u - 0.5) * Math.PI * 2;

      // wrap-friendly coords for noise
      const nx = Math.cos(lon) * Math.cos(lat);
      const ny = Math.sin(lat);
      const nz = Math.sin(lon) * Math.cos(lat);

      const n0 = fbm(noiseA, nx * 1.2 + 10, nz * 1.2 + 10, 5, 2.0, 0.5);
      const n1 = fbm(noiseB, nx * 2.1 - 20, nz * 2.1 - 20, 4, 2.1, 0.55);
      const n = n0 * 0.75 + n1 * 0.25;

      let r = 120,
        g = 120,
        b = 120,
        a = 255;

      if (kind === "earth") {
        // oceans
        const oceanDeep = { r: 10, g: 35, b: 70 };
        const oceanShallow = { r: 20, g: 65, b: 120 };

        // land mask
        const landMask = clamp01((n + 0.15) * 1.2);
        const isLand = landMask > 0.52;

        // temperature-ish banding by latitude (for biome tint)
        const tropics = clamp01(1 - latAbs / (Math.PI * 0.5));
        const ice = clamp01((latAbs - 1.15) * 2.0); // polar caps

        if (!isLand) {
          const depth = clamp01(landMask * 1.5);
          r = Math.round(lerp(oceanDeep.r, oceanShallow.r, depth));
          g = Math.round(lerp(oceanDeep.g, oceanShallow.g, depth));
          b = Math.round(lerp(oceanDeep.b, oceanShallow.b, depth));
        } else {
          // land colors: desert -> green
          const dryness = clamp01((fbm(noiseB, nx * 3.2 + 5, nz * 3.2 + 5, 3, 2.0, 0.55) + 0.2) * 0.9);
          const desert = { r: 170, g: 150, b: 95 };
          const forest = { r: 55, g: 120, b: 70 };
          const tundra = { r: 130, g: 135, b: 120 };

          const biomeT = clamp01(tropics * (1 - dryness) * 1.1);
          const baseLand = {
            r: Math.round(lerp(desert.r, forest.r, biomeT)),
            g: Math.round(lerp(desert.g, forest.g, biomeT)),
            b: Math.round(lerp(desert.b, forest.b, biomeT)),
          };

          // higher lat shifts toward tundra
          const tundraT = clamp01((latAbs - 0.85) * 1.2);
          r = Math.round(lerp(baseLand.r, tundra.r, tundraT));
          g = Math.round(lerp(baseLand.g, tundra.g, tundraT));
          b = Math.round(lerp(baseLand.b, tundra.b, tundraT));

          // coastline smoothing
          const coast = clamp01((landMask - 0.52) * 8);
          r = Math.round(lerp(80, r, coast));
          g = Math.round(lerp(105, g, coast));
          b = Math.round(lerp(120, b, coast));
        }

        // polar ice caps
        if (ice > 0) {
          r = Math.round(lerp(r, 235, ice));
          g = Math.round(lerp(g, 240, ice));
          b = Math.round(lerp(b, 245, ice));
        }

        // subtle atmosphere tint baked into texture
        const haze = clamp01(0.08 + (1 - tropics) * 0.05);
        r = Math.round(lerp(r, 140, haze));
        g = Math.round(lerp(g, 170, haze));
        b = Math.round(lerp(b, 210, haze));

        // clouds layer (separate)
        if (clouds) {
          const cN = fbm(noiseA, nx * 6.0 + 100, nz * 6.0 + 100, 4, 2.15, 0.55);
          const bands = 0.08 * Math.sin(lat * 6.0 + cN * 2.0);
          const c = clamp01((cN + bands + 0.25) * 1.25);
          const alpha = Math.round(clamp01((c - 0.55) * 1.8) * 190);
          const cr = 245,
            cg = 248,
            cb = 252;
          clouds[y * w + x] = packRGBA(cr, cg, cb, alpha);
        }
      } else if (kind === "gasJupiter" || kind === "gasSaturn") {
        const bands = Math.sin(lat * 10 + n * 1.5) * 0.5 + 0.5;
        const creamy = kind === "gasSaturn";

        const c1 = creamy ? { r: 232, g: 210, b: 165 } : { r: 210, g: 170, b: 115 };
        const c2 = creamy ? { r: 200, g: 180, b: 135 } : { r: 165, g: 125, b: 85 };
        const c3 = creamy ? { r: 175, g: 160, b: 135 } : { r: 140, g: 95, b: 60 };

        const t = clamp01(bands + n * 0.18);
        r = Math.round(lerp(lerp(c1.r, c2.r, t), c3.r, (1 - t) * 0.35));
        g = Math.round(lerp(lerp(c1.g, c2.g, t), c3.g, (1 - t) * 0.35));
        b = Math.round(lerp(lerp(c1.b, c2.b, t), c3.b, (1 - t) * 0.35));

        // Great Red Spot-ish for Jupiter
        if (kind === "gasJupiter") {
          const spotLon = -0.6;
          const spotLat = -0.15;
          const dLon = Math.atan2(Math.sin(lon - spotLon), Math.cos(lon - spotLon));
          const dLat = lat - spotLat;
          const e = Math.exp(-((dLon * dLon) / 0.16 + (dLat * dLat) / 0.06));
          r = Math.round(lerp(r, 210, e));
          g = Math.round(lerp(g, 110, e));
          b = Math.round(lerp(b, 70, e));
        }
      } else if (kind === "iceUranus" || kind === "iceNeptune") {
        const baseC = kind === "iceNeptune" ? { r: 40, g: 90, b: 200 } : { r: 90, g: 170, b: 200 };
        const deep = kind === "iceNeptune" ? { r: 20, g: 55, b: 150 } : { r: 55, g: 120, b: 170 };
        const t = clamp01(0.55 + 0.25 * Math.sin(lat * 6.0 + n * 1.2) + n * 0.12);

        r = Math.round(lerp(deep.r, baseC.r, t));
        g = Math.round(lerp(deep.g, baseC.g, t));
        b = Math.round(lerp(deep.b, baseC.b, t));
      } else if (kind === "mars") {
        const dust = clamp01(0.55 + n * 0.35);
        r = Math.round(lerp(140, 205, dust));
        g = Math.round(lerp(70, 120, dust));
        b = Math.round(lerp(45, 75, dust));

        // polar caps
        const ice = clamp01((latAbs - 1.15) * 2.0);
        if (ice > 0) {
          r = Math.round(lerp(r, 235, ice));
          g = Math.round(lerp(g, 235, ice));
          b = Math.round(lerp(b, 240, ice));
        }
      } else if (kind === "venus") {
        const swirl = clamp01(0.55 + 0.3 * Math.sin(lon * 3.0 + lat * 5.0 + n * 2.0) + n * 0.18);
        r = Math.round(lerp(190, 245, swirl));
        g = Math.round(lerp(150, 220, swirl));
        b = Math.round(lerp(95, 160, swirl));
      } else if (kind === "moon" || kind === "rocky" || kind === "dwarf") {
        // cratered rocky / icy surfaces
        const baseL = kind === "dwarf" ? 140 : 125;
        const contrast = kind === "dwarf" ? 40 : 55;

        let m = clamp01(0.5 + n * 0.55);
        // “crater” speckle
        const crater = fbm(noiseB, nx * 10.0 + 40, nz * 10.0 + 40, 2, 2.0, 0.5);
        m = clamp01(m - clamp01((crater - 0.2) * 1.2) * 0.35);

        const L = baseL + m * contrast;
        r = Math.round(L);
        g = Math.round(L);
        b = Math.round(L);

        // subtle color tints by kind
        if (kind === "dwarf") {
          r = Math.round(lerp(r, 165, 0.2));
          g = Math.round(lerp(g, 150, 0.2));
          b = Math.round(lerp(b, 135, 0.2));
        } else if (kind === "rocky") {
          r = Math.round(lerp(r, 150, 0.08));
          g = Math.round(lerp(g, 135, 0.08));
          b = Math.round(lerp(b, 120, 0.08));
        }
      } else if (kind === "starHot" || kind === "starRed") {
        // star “surface” (photosphere): granulation
        const gran = clamp01(0.55 + fbm(noiseA, nx * 18 + 3, nz * 18 + 3, 3, 2.0, 0.5) * 0.35);

        const hot = kind === "starHot";
        const cA = hot ? { r: 210, g: 225, b: 255 } : { r: 255, g: 120, b: 85 };
        const cB = hot ? { r: 160, g: 180, b: 255 } : { r: 210, g: 70, b: 55 };

        r = Math.round(lerp(cB.r, cA.r, gran));
        g = Math.round(lerp(cB.g, cA.g, gran));
        b = Math.round(lerp(cB.b, cA.b, gran));
      }

      base[y * w + x] = packRGBA(r, g, b, a);
    }
  }

  return { w, h, base, clouds };
}
