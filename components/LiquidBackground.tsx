"use client";

import { useEffect, useRef } from "react";

/* A few soft blobs drifting behind the page, nudged by the cursor.
 *
 * Drawn at a quarter of the viewport size and blurred by CSS, which is what
 * keeps it cheap: the canvas is a fraction of the pixels, and the blur hides
 * the low resolution entirely. No WebGL, no per-pixel work.
 */

type Blob = {
  /* where it orbits around, 0-1 of the viewport */
  hx: number;
  hy: number;
  /* orbit radius and speed */
  rx: number;
  ry: number;
  speed: number;
  phase: number;
  size: number;
  hue: string;
  /* current position, eased towards the target each frame */
  x: number;
  y: number;
};

const BLOBS: Omit<Blob, "x" | "y">[] = [
  { hx: 0.22, hy: 0.28, rx: 0.10, ry: 0.08, speed: 0.11, phase: 0.0, size: 0.44, hue: "168,130,255" },
  { hx: 0.78, hy: 0.24, rx: 0.09, ry: 0.10, speed: 0.09, phase: 1.9, size: 0.40, hue: "120,90,220" },
  { hx: 0.68, hy: 0.76, rx: 0.11, ry: 0.07, speed: 0.13, phase: 3.4, size: 0.46, hue: "190,150,255" },
  { hx: 0.30, hy: 0.74, rx: 0.08, ry: 0.09, speed: 0.10, phase: 5.1, size: 0.38, hue: "140,105,240" },
];

const SCALE = 0.25;

export default function LiquidBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let frame = 0;
    let running = false;

    /* Eased so the blobs lag behind the cursor rather than snapping to it,
       which is most of what makes it read as liquid instead of attached. */
    const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, strength: 0 };

    const blobs: Blob[] = BLOBS.map((b) => ({ ...b, x: b.hx, y: b.hy }));

    function resize() {
      width = canvas!.width = Math.max(1, Math.round(window.innerWidth * SCALE));
      height = canvas!.height = Math.max(1, Math.round(window.innerHeight * SCALE));
    }

    function draw(time: number) {
      ctx!.clearRect(0, 0, width, height);
      ctx!.globalCompositeOperation = "lighter";

      pointer.x += (pointer.tx - pointer.x) * 0.05;
      pointer.y += (pointer.ty - pointer.y) * 0.05;

      const t = time * 0.001;

      for (const b of blobs) {
        const targetX = b.hx + Math.sin(t * b.speed + b.phase) * b.rx;
        const targetY = b.hy + Math.cos(t * b.speed * 0.9 + b.phase) * b.ry;

        /* Pushed away from the cursor, falling off with distance. */
        const dx = targetX - pointer.x;
        const dy = targetY - pointer.y;
        const dist = Math.hypot(dx, dy) || 0.0001;
        const push = Math.max(0, 1 - dist / 0.55) * 0.14 * pointer.strength;

        const wantX = targetX + (dx / dist) * push;
        const wantY = targetY + (dy / dist) * push;

        b.x += (wantX - b.x) * 0.04;
        b.y += (wantY - b.y) * 0.04;

        const radius = b.size * width;
        const gradient = ctx!.createRadialGradient(
          b.x * width,
          b.y * height,
          0,
          b.x * width,
          b.y * height,
          radius
        );
        gradient.addColorStop(0, `rgba(${b.hue},0.55)`);
        gradient.addColorStop(1, `rgba(${b.hue},0)`);
        ctx!.fillStyle = gradient;
        ctx!.beginPath();
        ctx!.arc(b.x * width, b.y * height, radius, 0, Math.PI * 2);
        ctx!.fill();
      }

      frame = requestAnimationFrame(draw);
    }

    function start() {
      if (running || reduced.matches || document.hidden) return;
      running = true;
      frame = requestAnimationFrame(draw);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(frame);
    }

    /* Nothing runs while the tab is in the background. */
    function onVisibility() {
      if (document.hidden) stop();
      else start();
    }

    function onPointer(event: PointerEvent) {
      pointer.tx = event.clientX / window.innerWidth;
      pointer.ty = event.clientY / window.innerHeight;
      pointer.strength = 1;
    }

    function onLeave() {
      pointer.strength = 0;
    }

    function onReducedChange() {
      if (reduced.matches) {
        stop();
        ctx!.clearRect(0, 0, width, height);
      } else {
        start();
      }
    }

    resize();
    start();

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    reduced.addEventListener("change", onReducedChange);

    return () => {
      stop();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      reduced.removeEventListener("change", onReducedChange);
    };
  }, []);

  return <canvas className="liquid" ref={ref} aria-hidden="true" />;
}
