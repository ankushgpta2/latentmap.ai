"use client";

import { useEffect, useRef } from "react";

/**
 * An interactive 2D-projected manifold.
 *
 * Each frame we sample a deformed sphere on a (theta, phi) grid, displace
 * each point by a sum of low-order spherical-harmonic-like terms whose
 * phases drift with time, then project to screen via an orthographic
 * rotation. Points near the projected cursor are pushed radially outward
 * with a Gaussian falloff, which gives the surface the feeling of
 * responding to touch without breaking the underlying topology.
 *
 * Everything is plain Canvas 2D — no WebGL, no shaders, no external
 * geometry libraries. The shape is generated from math, not loaded.
 *
 * Knobs you can safely tweak:
 *   - N_THETA / N_PHI    : point density (perf vs. density trade-off)
 *   - autoYaw / autoPitch: autonomous rotation feel
 *   - h{1,2,3} amplitudes: how lumpy the manifold gets
 *   - PUSH               : peak hover displacement in pixels
 */
export function ManifoldField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    /* ------------------------------------------------------------------ */
    /* Reduced motion                                                     */
    /* ------------------------------------------------------------------ */
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduceMotion = mq.matches;
    const onMq = () => {
      reduceMotion = mq.matches;
    };
    mq.addEventListener("change", onMq);

    /* ------------------------------------------------------------------ */
    /* Sample grid (built once)                                           */
    /* ------------------------------------------------------------------ */
    // Halve the point count on phones — preserves the dot-pattern feel
    // without melting the GPU on a 4-year-old Android.
    const narrow = window.matchMedia("(max-width: 640px)").matches;
    const N_THETA = narrow ? 64 : 96;
    const N_PHI = narrow ? 38 : 56;
    const base: { theta: number; phi: number; sinPhi: number; cosPhi: number }[] = [];
    for (let i = 0; i < N_PHI; i++) {
      const phi = ((i + 0.5) / N_PHI) * Math.PI;
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);
      for (let j = 0; j < N_THETA; j++) {
        const theta = (j / N_THETA) * Math.PI * 2;
        base.push({ theta, phi, sinPhi, cosPhi });
      }
    }

    /* ------------------------------------------------------------------ */
    /* DPR-aware sizing                                                   */
    /* ------------------------------------------------------------------ */
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    function resize() {
      if (!canvas || !container) return;
      const rect = container.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    /* ------------------------------------------------------------------ */
    /* Pointer tracking                                                   */
    /* ------------------------------------------------------------------ */
    const mouse = { x: 0, y: 0, target: 0, current: 0 };

    function setMouseFromEvent(clientX: number, clientY: number) {
      const r = canvas!.getBoundingClientRect();
      mouse.x = (clientX - r.left) / r.width - 0.5;
      mouse.y = (clientY - r.top) / r.height - 0.5;
      mouse.target = 1;
    }
    const onMove = (e: MouseEvent) => setMouseFromEvent(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      if (e.touches[0]) {
        setMouseFromEvent(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onLeave = () => {
      mouse.target = 0;
    };

    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("touchmove", onTouch, { passive: true });
    canvas.addEventListener("mouseleave", onLeave);
    canvas.addEventListener("touchend", onLeave);

    /* ------------------------------------------------------------------ */
    /* Frame loop                                                         */
    /* ------------------------------------------------------------------ */
    const PUSH = 38; // peak hover displacement (px)
    let rafId = 0;
    let t = 0;
    let lastT = performance.now();
    let visible = true;

    // Pause work when scrolled off-screen or the tab is hidden. The RAF
    // loop keeps ticking so it picks up where it left off, but the draw
    // pass and time-accumulator are skipped.
    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0 }
    );
    io.observe(container);

    const onVisibility = () => {
      // Reset lastT to avoid a big dt jump when the tab regains focus.
      lastT = performance.now();
    };
    document.addEventListener("visibilitychange", onVisibility);

    // Reusable buffer so we don't allocate per frame.
    type Drawn = { sx: number; sy: number; d: number; s: number; a: number };
    const drawn: Drawn[] = new Array(base.length);
    for (let i = 0; i < drawn.length; i++) {
      drawn[i] = { sx: 0, sy: 0, d: 0, s: 0, a: 0 };
    }

    /* ------------------------------------------------------------------ */
    /* Local structures                                                   */
    /* Random hotspots on the manifold that grow, hold, and dissolve —    */
    /* each one deforms the local geometry (visible bulge in the dots)    */
    /* and is marked with a soft halo on top.                             */
    /* ------------------------------------------------------------------ */
    type Structure = {
      theta: number;
      phi: number;
      cosTheta: number;
      sinTheta: number;
      cosPhi: number;
      sinPhi: number;
      birth: number;
      life: number;     // total lifespan in seconds
      amp: number;      // peak radial bump (fraction of unit radius)
      sigma2: number;   // squared angular falloff
      cool: boolean;    // warm bone vs. cool grey-blue accent
    };
    const MAX_STRUCTURES = narrow ? 3 : 5;
    const SPAWN_RATE = 0.55; // attempted spawns per second
    const structures: Structure[] = [];

    function spawnStructure() {
      // Uniform on the sphere: cos(phi) ~ U(-1,1) since phi ∈ [0, π].
      const phi = Math.acos(1 - 2 * Math.random());
      const theta = Math.random() * Math.PI * 2;
      const sigma = 0.28 + Math.random() * 0.18; // angular st. dev.
      structures.push({
        theta,
        phi,
        cosTheta: Math.cos(theta),
        sinTheta: Math.sin(theta),
        cosPhi: Math.cos(phi),
        sinPhi: Math.sin(phi),
        birth: t,
        life: 3.5 + Math.random() * 3.5,
        amp: 0.13 + Math.random() * 0.08,
        sigma2: sigma * sigma,
        cool: Math.random() < 0.45,
      });
    }

    // Smooth rise → hold → fall envelope so structures "build" and dissolve.
    function envelope(age01: number): number {
      if (age01 <= 0 || age01 >= 1) return 0;
      if (age01 < 0.3) {
        const x = age01 / 0.3;
        return x * x * (3 - 2 * x); // smoothstep in
      }
      if (age01 > 0.7) {
        const x = (1 - age01) / 0.3;
        return x * x * (3 - 2 * x); // smoothstep out
      }
      return 1;
    }

    let spawnAccum = 0;

    function frame(now: number) {
      rafId = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;

      // Cheap exit when off-screen or tab is hidden.
      if (!visible || document.hidden) return;

      if (!reduceMotion) t += dt;

      // Smoothly ramp mouse influence in/out.
      mouse.current += (mouse.target - mouse.current) * Math.min(1, dt * 6);

      ctx!.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.38;

      const yaw = t * 0.18;
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const pitch = Math.sin(t * 0.21) * 0.18;
      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);

      const mxPx = cx + mouse.x * width;
      const myPx = cy + mouse.y * height;
      const mInf = mouse.current;
      const sigma2 = radius * radius * 0.5;

      // Maintain local structures. Reap expired, then attempt spawns
      // (Poisson-ish via accumulator) until the cap is reached.
      for (let k = structures.length - 1; k >= 0; k--) {
        if (t - structures[k].birth >= structures[k].life) structures.splice(k, 1);
      }
      if (!reduceMotion) {
        spawnAccum += dt * SPAWN_RATE;
        while (spawnAccum >= 1 && structures.length < MAX_STRUCTURES) {
          spawnAccum -= 1;
          spawnStructure();
        }
        if (spawnAccum > 1) spawnAccum = 1;
      }

      // Precompute envelope per active structure so the inner loop is tight.
      const sEnv = new Array(structures.length);
      for (let k = 0; k < structures.length; k++) {
        sEnv[k] = envelope((t - structures[k].birth) / structures[k].life);
      }

      for (let i = 0; i < base.length; i++) {
        const { theta, phi, sinPhi, cosPhi } = base[i];

        // Spherical-harmonic-flavored deformation. The phase offsets are
        // mutually irrational-ish so the surface never repeats exactly.
        const h1 = Math.sin(3 * theta + t * 0.9) * Math.cos(2 * phi + t * 0.4);
        const h2 = Math.sin(5 * phi - t * 0.6) * Math.cos(theta + t * 0.3);
        const h3 = Math.sin(theta * 2 + phi * 3 + t * 0.55);
        let r3 = 1 + 0.1 * h1 + 0.06 * h2 + 0.04 * h3;

        // Local bumps from active structures. Use (1 − cosΔ) ≈ Δ²/2 as a
        // cheap stand-in for angular distance squared, avoiding acos().
        for (let k = 0; k < structures.length; k++) {
          const env = sEnv[k];
          if (env <= 0.001) continue;
          const s = structures[k];
          const cosD =
            cosPhi * s.cosPhi +
            sinPhi * s.sinPhi * (s.cosTheta * Math.cos(theta) + s.sinTheta * Math.sin(theta));
          const dist2 = 2 * (1 - cosD);
          r3 += env * s.amp * Math.exp(-dist2 / s.sigma2);
        }

        const x = sinPhi * Math.cos(theta) * r3;
        const y = cosPhi * r3;
        const z = sinPhi * Math.sin(theta) * r3;

        // Y-axis yaw, then X-axis pitch.
        const xr = x * cosY + z * sinY;
        const zr1 = -x * sinY + z * cosY;
        const yr = y * cosP - zr1 * sinP;
        const zr = y * sinP + zr1 * cosP;

        let sx = cx + xr * radius;
        let sy = cy + yr * radius;

        // Hover deformation: radial push with Gaussian falloff.
        if (mInf > 0.01) {
          const dx = sx - mxPx;
          const dy = sy - myPx;
          const dist2 = dx * dx + dy * dy;
          const falloff = Math.exp(-dist2 / sigma2);
          const push = falloff * mInf * PUSH;
          const dist = Math.sqrt(dist2) + 0.0001;
          sx += (dx / dist) * push;
          sy += (dy / dist) * push;
        }

        const dn = (zr + 1) * 0.5; // 0 (back) → 1 (front)
        const p = drawn[i];
        p.sx = sx;
        p.sy = sy;
        p.d = zr;
        p.s = 0.7 + dn * 1.6;
        p.a = 0.12 + dn * 0.78;
      }

      // Painter's algorithm: back-to-front so front-facing dots render
      // on top. Sort in place to avoid GC churn.
      drawn.sort((a, b) => a.d - b.d);

      for (let i = 0; i < drawn.length; i++) {
        const p = drawn[i];
        const dn = (p.d + 1) * 0.5;
        // Blend bone (front) → cool-grey (back) using the LML accent pair.
        // Front is warmer/brighter; back recedes.
        const r = (201 - dn * 60) | 0;
        const g = (184 - dn * 30) | 0;
        const b = (154 + dn * 30) | 0;
        ctx!.fillStyle = `rgba(${r},${g},${b},${p.a})`;
        ctx!.fillRect(p.sx - p.s * 0.5, p.sy - p.s * 0.5, p.s, p.s);
      }

      // Structure halos — soft pulses centered on each active hotspot.
      // Projected through the same yaw/pitch so they ride the surface,
      // and only drawn when the center is on the visible hemisphere.
      ctx!.globalCompositeOperation = "lighter";
      for (let k = 0; k < structures.length; k++) {
        const env = sEnv[k];
        if (env <= 0.02) continue;
        const s = structures[k];
        const rUnit = 1 + s.amp * env;
        const x = s.sinPhi * s.cosTheta * rUnit;
        const y = s.cosPhi * rUnit;
        const z = s.sinPhi * s.sinTheta * rUnit;
        const xr = x * cosY + z * sinY;
        const zr1 = -x * sinY + z * cosY;
        const yr = y * cosP - zr1 * sinP;
        const zr = y * sinP + zr1 * cosP;
        if (zr < -0.15) continue;
        const front = Math.max(0, Math.min(1, (zr + 0.15) / 1.15));
        const hx = cx + xr * radius;
        const hy = cy + yr * radius;
        const haloR = radius * (0.16 + 0.18 * env);
        const baseA = 0.55 * env * front;
        const grad = ctx!.createRadialGradient(hx, hy, 0, hx, hy, haloR);
        if (s.cool) {
          grad.addColorStop(0, `rgba(138,163,184,${baseA})`);
          grad.addColorStop(0.55, `rgba(138,163,184,${baseA * 0.18})`);
          grad.addColorStop(1, `rgba(138,163,184,0)`);
        } else {
          grad.addColorStop(0, `rgba(201,184,154,${baseA})`);
          grad.addColorStop(0.55, `rgba(201,184,154,${baseA * 0.18})`);
          grad.addColorStop(1, `rgba(201,184,154,0)`);
        }
        ctx!.fillStyle = grad;
        ctx!.beginPath();
        ctx!.arc(hx, hy, haloR, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalCompositeOperation = "source-over";

    }
    rafId = requestAnimationFrame(frame);

    /* ------------------------------------------------------------------ */
    /* Cleanup                                                            */
    /* ------------------------------------------------------------------ */
    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      mq.removeEventListener("change", onMq);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("touchmove", onTouch);
      canvas.removeEventListener("mouseleave", onLeave);
      canvas.removeEventListener("touchend", onLeave);
    };
  }, []);

  return (
    <figure className="my-0 select-none">
      <div
        ref={containerRef}
        className="relative aspect-square mx-auto w-[min(640px,48vh,100%)]"
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 block cursor-crosshair"
          aria-hidden="true"
        />
      </div>
      <figcaption className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-fg-subtle)] text-center mt-4">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] mr-3 align-middle" />
        Latent surface — interact to perturb
      </figcaption>
    </figure>
  );
}
