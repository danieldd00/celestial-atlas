"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { makeTextureSet, getTextureKindByIdAndType, type TextureSet } from "./sphere-textures";

type PlanetViewerProps = {
  id: string;
  type: string;
  color: string;
  accentColor: string;
  name: string;
  hasRings?: boolean;
  size?: number; // optional fixed size
  compact?: boolean; // smaller UI label
};

function unpackRGBA(p: number) {
  const r = p & 255;
  const g = (p >>> 8) & 255;
  const b = (p >>> 16) & 255;
  const a = (p >>> 24) & 255;
  return { r, g, b, a };
}

function clamp01(x: number) {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

export function PlanetViewer({ id, type, color, accentColor, name, hasRings = false, size, compact }: PlanetViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);

  const dragRef = useRef({
    dragging: false,
    lastX: 0,
    lastY: 0,
    rotX: 0.25,
    rotY: 0,
    velX: 0,
    velY: 0.003,
  });

  const reducedMotion = useRef(false);

  const [autoSize, setAutoSize] = useState<number>(size ?? 400);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (size) return;
    const el = wrapRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      const w = el.getBoundingClientRect().width;
      const next = Math.max(240, Math.min(420, Math.floor(w)));
      setAutoSize(next);
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, [size]);

  const tex: TextureSet = useMemo(() => {
    const kind = getTextureKindByIdAndType(id, type);
    return makeTextureSet(kind, id);
  }, [id, type]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const s = autoSize;
    canvas.width = Math.floor(s * dpr);
    canvas.height = Math.floor(s * dpr);
    canvas.style.width = s + "px";
    canvas.style.height = s + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cx = s / 2;
    const cy = s / 2;
    const baseRadius = Math.floor(s * 0.275); // ~110 at 400

    // internal render resolution (keeps it fast on mobile)
    const internal = Math.max(180, Math.min(280, Math.floor(s * 0.7)));
    const off = document.createElement("canvas");
    off.width = internal;
    off.height = internal;
    const offCtx = off.getContext("2d", { willReadFrequently: true });
    if (!offCtx) return;

    const img = offCtx.createImageData(internal, internal);
    const buf32 = new Uint32Array(img.data.buffer);

    const light = { x: -0.55, y: -0.25, z: 0.8 };
    const lightLen = Math.hypot(light.x, light.y, light.z);
    light.x /= lightLen;
    light.y /= lightLen;
    light.z /= lightLen;

    const sample = (u: number, v: number) => {
      // wrap u, clamp v
      u = u - Math.floor(u);
      v = clamp01(v);
      const x = Math.floor(u * (tex.w - 1));
      const y = Math.floor(v * (tex.h - 1));
      return tex.base[y * tex.w + x];
    };

    const sampleClouds = (u: number, v: number) => {
      if (!tex.clouds) return 0;
      u = u - Math.floor(u);
      v = clamp01(v);
      const x = Math.floor(u * (tex.w - 1));
      const y = Math.floor(v * (tex.h - 1));
      return tex.clouds[y * tex.w + x];
    };

    const drawSphere = () => {
      const d = dragRef.current;

      if (!d.dragging) {
        d.rotY += reducedMotion.current ? 0 : d.velY;
        d.velX *= 0.98;
        d.rotX += d.velX;
      }

      // clear visible canvas
      ctx.clearRect(0, 0, s, s);

      // atmosphere glow (kept from your original vibe)
      const glowGrad = ctx.createRadialGradient(cx, cy, baseRadius * 0.9, cx, cy, baseRadius * 1.65);
      glowGrad.addColorStop(0, `${accentColor}14`);
      glowGrad.addColorStop(0.55, `${accentColor}07`);
      glowGrad.addColorStop(1, "transparent");
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, s, s);

      // rings (behind)
      if (hasRings) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(1, 0.3 + Math.abs(Math.sin(d.rotX)) * 0.15);
        ctx.beginPath();
        ctx.ellipse(0, 0, baseRadius * 1.8, baseRadius * 1.8, 0, Math.PI, Math.PI * 2);
        ctx.strokeStyle = `${accentColor}28`;
        ctx.lineWidth = Math.max(8, baseRadius * 0.11);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(0, 0, baseRadius * 1.55, baseRadius * 1.55, 0, Math.PI, Math.PI * 2);
        ctx.strokeStyle = `${accentColor}18`;
        ctx.lineWidth = Math.max(4, baseRadius * 0.055);
        ctx.stroke();
        ctx.restore();
      }

      // ---- render textured sphere into offscreen (internal res) ----
      const r = internal * 0.36;
      const icx = internal / 2;
      const icy = internal / 2;

      const rotY = d.rotY;
      const rotX = d.rotX;

      // precompute sin/cos
      const cyy = Math.cos(rotY);
      const syy = Math.sin(rotY);
      const cxx = Math.cos(rotX);
      const sxx = Math.sin(rotX);

      // background transparent
      buf32.fill(0);

      for (let py = 0; py < internal; py++) {
        const dy = (py - icy) / r;
        const dy2 = dy * dy;
        for (let px = 0; px < internal; px++) {
          const dx = (px - icx) / r;
          const d2 = dx * dx + dy2;
          if (d2 > 1) continue;

          const dz = Math.sqrt(1 - d2);

          // normal in object space
          let nx = dx;
          let ny = dy;
          let nz = dz;

          // rotate around Y (longitude)
          let rx = nx * cyy + nz * syy;
          let rz = -nx * syy + nz * cyy;
          let ry = ny;

          // rotate around X (tilt)
          const ry2 = ry * cxx - rz * sxx;
          const rz2 = ry * sxx + rz * cxx;
          const rx2 = rx;

          // spherical UV
          const u = 0.5 + Math.atan2(rz2, rx2) / (Math.PI * 2);
          const v = 0.5 - Math.asin(ry2) / Math.PI;

          const pix = sample(u, v);
          const { r: pr, g: pg, b: pb } = unpackRGBA(pix);

          // lighting (Lambert + small ambient)
          const ndotl = Math.max(0, rx2 * light.x + ry2 * light.y + rz2 * light.z);
          const ambient = 0.22;
          let shade = ambient + ndotl * 0.9;

          // limb darkening (stronger for stars)
          const limb = Math.pow(dz, type === "star" ? 0.45 : 0.85);
          shade *= 0.7 + 0.3 * limb;

          // specular (tiny)
          const spec = Math.pow(ndotl, 28) * 0.12;

          let rr = Math.min(255, pr * shade + 255 * spec);
          let gg = Math.min(255, pg * shade + 255 * spec);
          let bb = Math.min(255, pb * shade + 255 * spec);

          // optional cloud overlay (Earth)
          if (tex.clouds) {
            const cPix = sampleClouds(u + rotY * 0.03, v);
            const c = unpackRGBA(cPix);
            if (c.a > 0) {
              const alpha = (c.a / 255) * (0.85 + ndotl * 0.25);
              rr = rr * (1 - alpha) + c.r * alpha;
              gg = gg * (1 - alpha) + c.g * alpha;
              bb = bb * (1 - alpha) + c.b * alpha;
            }
          }

          // write pixel
          buf32[py * internal + px] = ((255 & 255) << 24) | ((Math.round(bb) & 255) << 16) | ((Math.round(gg) & 255) << 8) | (Math.round(rr) & 255);
        }
      }

      offCtx.putImageData(img, 0, 0);

      // draw the sphere into visible canvas
      ctx.save();
      ctx.translate(cx - baseRadius, cy - baseRadius);
      ctx.beginPath();
      ctx.arc(baseRadius, baseRadius, baseRadius, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(off, 0, 0, internal, internal, 0, 0, baseRadius * 2, baseRadius * 2);
      ctx.restore();

      // terminator shadow (kept from your original vibe)
      const termGrad = ctx.createLinearGradient(cx - baseRadius, cy, cx + baseRadius, cy);
      termGrad.addColorStop(0, "transparent");
      termGrad.addColorStop(0.58, "transparent");
      termGrad.addColorStop(0.82, "rgba(0,0,0,0.28)");
      termGrad.addColorStop(1, "rgba(0,0,0,0.62)");
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
      ctx.fillStyle = termGrad;
      ctx.fill();

      // rings (front)
      if (hasRings) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(1, 0.3 + Math.abs(Math.sin(d.rotX)) * 0.15);
        ctx.beginPath();
        ctx.ellipse(0, 0, baseRadius * 1.8, baseRadius * 1.8, 0, 0, Math.PI);
        ctx.strokeStyle = `${accentColor}33`;
        ctx.lineWidth = Math.max(8, baseRadius * 0.11);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(0, 0, baseRadius * 1.55, baseRadius * 1.55, 0, 0, Math.PI);
        ctx.strokeStyle = `${accentColor}1f`;
        ctx.lineWidth = Math.max(4, baseRadius * 0.055);
        ctx.stroke();
        ctx.restore();
      }

      // technical overlay crosshair (kept)
      ctx.strokeStyle = `${accentColor}22`;
      ctx.lineWidth = 0.5;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo(cx, cy - baseRadius - 30);
      ctx.lineTo(cx, cy + baseRadius + 30);
      ctx.moveTo(cx - baseRadius - 30, cy);
      ctx.lineTo(cx + baseRadius + 30, cy);
      ctx.stroke();
      ctx.setLineDash([]);

      // small radius measurement arc (kept)
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius + 20, -0.3, 0.3);
      ctx.strokeStyle = `${accentColor}26`;
      ctx.lineWidth = 0.5;
      ctx.stroke();

      animRef.current = requestAnimationFrame(drawSphere);
    };

    drawSphere();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [autoSize, accentColor, color, hasRings, id, name, tex, type]);

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    dragRef.current.dragging = true;
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastY = e.clientY;
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragRef.current.dragging) return;
    const dx = e.clientX - dragRef.current.lastX;
    const dy = e.clientY - dragRef.current.lastY;
    dragRef.current.rotY += dx * 0.005;
    dragRef.current.rotX += dy * 0.005;
    dragRef.current.velX = dy * 0.001;
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastY = e.clientY;
  };

  const onPointerUp = () => {
    dragRef.current.dragging = false;
  };

  return (
    <div ref={wrapRef} className="flex flex-col items-center justify-center" style={{ minHeight: compact ? "220px" : "400px", width: "100%" }}>
      <canvas ref={canvasRef} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp} style={{ cursor: "grab", touchAction: "none" }} aria-label={`Interactive 3D visualization of ${name}`} />
      {!compact && (
        <p className="font-mono mt-2" style={{ fontSize: "9px", color: "var(--text-tertiary)", letterSpacing: "0.1em" }}>
          DRAG TO ROTATE · INTERACTIVE VIEW
        </p>
      )}
    </div>
  );
}
