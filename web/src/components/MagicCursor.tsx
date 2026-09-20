import { useEffect, useRef } from 'react';

type Color = { r: number; g: number; b: number };

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseSize: number;
  life: number;
  decay: number;
  color: Color;
  rotation: number;
  rotSpeed: number;
  isStar: boolean;
  twinkle: number;
  twinkleSpeed: number;
  swirlRadius: number;
  swirlAngle: number;
  swirlSpeed: number;
};

/** A fleck of glitter sitting on the arrow itself. Fixed position, so it
 *  does not crawl around the blade; only its brightness breathes. */
type Fleck = { x: number; y: number; r: number; phase: number; speed: number; star: boolean };

/**
 * The classic pointer outline, tip at the origin so the shape can be drawn
 * straight at the mouse position with no hotspot offset to correct for.
 */
const ARROW: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [0, 17.6],
  [4.2, 13.7],
  [7.0, 19.9],
  [10.2, 18.5],
  [7.4, 12.5],
  [12.7, 12.3],
];
const ARROW_SCALE = 1.3;

const MagicCursor = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000, prevX: -1000, prevY: -1000, seen: false });
  const rafRef = useRef<number | null>(null);
  const lastSpawnRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Reduce motion: no drawn cursor at all, and the real one stays put.
    // Hiding the pointer with nothing in its place would break the site.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    document.documentElement.classList.add('magic-cursor-active');

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    // ---------- Gold glitter palette ----------
    const PALETTE: Color[] = [
      { r: 255, g: 245, b: 214 }, // champagne
      { r: 255, g: 232, b: 150 }, // pale gold
      { r: 255, g: 214, b: 102 }, // gold
      { r: 245, g: 197, b: 66 }, // bright gold
      { r: 224, g: 168, b: 45 }, // amber gold
      { r: 255, g: 255, b: 238 }, // white sparkle
    ];

    // ---------- Flecks on the arrow ----------
    // Scattered once over the blade's box and clipped to the outline when
    // drawn, so they read as glitter embedded in the gold rather than noise
    // reshuffling itself every frame.
    const flecks: Fleck[] = Array.from({ length: 34 }, () => ({
      x: Math.random() * 12.7,
      y: Math.random() * 20,
      r: 0.25 + Math.random() * 0.55,
      phase: Math.random() * Math.PI * 2,
      speed: 1.4 + Math.random() * 3.2,
      star: Math.random() < 0.22,
    }));

    const createParticle = (x: number, y: number, vx: number, vy: number): Particle => {
      const color = PALETTE[(Math.random() * PALETTE.length) | 0];
      const size = 0.9 + Math.random() * 2.6;
      const speed = Math.hypot(vx, vy) || 1;
      const perpX = -vy / speed;
      const perpY = vx / speed;
      const swirlForce = (Math.random() - 0.5) * 0.9;

      return {
        x,
        y,
        vx: vx * 0.16 + perpX * swirlForce * 2.0 + (Math.random() - 0.5) * 0.7,
        vy: vy * 0.16 + perpY * swirlForce * 2.0 + (Math.random() - 0.5) * 0.7,
        baseSize: size,
        life: 1,
        // Shorter than the old trail: glitter that has come off the pointer
        // should be gone within about half a second, not linger behind it.
        decay: 0.022 + Math.random() * 0.02,
        color,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.18,
        isStar: Math.random() < 0.4,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.12 + Math.random() * 0.18,
        swirlRadius: 0.3 + Math.random() * 1.2,
        swirlAngle: Math.random() * Math.PI * 2,
        swirlSpeed: (Math.random() - 0.5) * 0.08,
      };
    };

    const track = (clientX: number, clientY: number) => {
      const m = mouseRef.current;
      m.x = clientX;
      m.y = clientY;
      m.seen = true;
    };
    const onMouseMove = (e: MouseEvent) => track(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length) track(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onLeave = () => {
      mouseRef.current.seen = false;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);

    const starPath = (
      g: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      outer: number,
      inner: number,
      rotation: number,
    ) => {
      g.save();
      g.translate(cx, cy);
      g.rotate(rotation);
      g.beginPath();
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI / 4) * i;
        const r = i % 2 === 0 ? outer : inner;
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        if (i === 0) g.moveTo(px, py);
        else g.lineTo(px, py);
      }
      g.closePath();
      g.fill();
      g.restore();
    };

    // ---------- The arrow ----------
    const drawArrow = (g: CanvasRenderingContext2D, x: number, y: number, time: number) => {
      g.save();
      g.translate(x, y);
      g.scale(ARROW_SCALE, ARROW_SCALE);

      g.beginPath();
      g.moveTo(ARROW[0][0], ARROW[0][1]);
      for (let i = 1; i < ARROW.length; i++) g.lineTo(ARROW[i][0], ARROW[i][1]);
      g.closePath();

      // Soft halo so the gold separates from whatever is behind it.
      g.shadowColor = 'rgba(190, 140, 20, 0.55)';
      g.shadowBlur = 9;

      const body = g.createLinearGradient(0, 0, 11, 20);
      body.addColorStop(0, '#FFEFB0');
      body.addColorStop(0.42, '#F3C64A');
      body.addColorStop(1, '#D79B22');
      g.fillStyle = body;
      g.fill();
      g.shadowBlur = 0;

      // A darker rim keeps the shape legible on pale backgrounds, where a
      // plain gold fill would otherwise wash out.
      g.lineJoin = 'round';
      g.lineWidth = 1;
      g.strokeStyle = 'rgba(122, 80, 10, 0.5)';
      g.stroke();

      // Glitter, clipped to the blade.
      g.clip();
      for (const f of flecks) {
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(time * 0.001 * f.speed + f.phase));
        g.fillStyle = `rgba(255, 253, 235, ${(0.9 * tw).toFixed(3)})`;
        if (f.star) {
          starPath(g, f.x, f.y, f.r * 2.4, f.r * 0.7, f.phase + time * 0.0004);
        } else {
          g.beginPath();
          g.arc(f.x, f.y, f.r, 0, Math.PI * 2);
          g.fill();
        }
      }
      g.restore();
    };

    const animate = (time: number) => {
      const m = mouseRef.current;
      const particles = particlesRef.current;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      const dx = m.x - m.prevX;
      const dy = m.y - m.prevY;
      const speed = Math.hypot(dx, dy);
      // prev only advances on a pointer event, so consume the delta here or a
      // resting pointer would keep firing glitter at its last velocity.
      m.prevX = m.x;
      m.prevY = m.y;

      // Glitter only comes off the pointer while it is actually moving.
      const spawnInterval = speed > 12 ? 0 : speed > 4 ? 14 : 28;
      if (m.seen && speed > 0.5 && time - lastSpawnRef.current > spawnInterval) {
        const count = speed > 25 ? 3 : speed > 10 ? 2 : 1;
        for (let i = 0; i < count; i++) {
          const spread = speed > 20 ? 9 : 4;
          // Shed from along the blade, not from the very tip.
          particles.push(
            createParticle(
              m.x + 4 + (Math.random() - 0.5) * spread,
              m.y + 9 + (Math.random() - 0.5) * spread,
              dx,
              dy,
            ),
          );
        }
        lastSpawnRef.current = time;
      }

      ctx.clearRect(0, 0, w, h);

      // Additive inside the canvas so overlapping flecks bloom; the canvas
      // itself composites normally onto the page, so the gold stays visible
      // over white cards as well as dark sections.
      ctx.globalCompositeOperation = 'lighter';

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        p.swirlAngle += p.swirlSpeed;
        const sx = Math.cos(p.swirlAngle) * p.swirlRadius * 0.15;
        const sy = Math.sin(p.swirlAngle) * p.swirlRadius * 0.15;

        p.vx *= 0.93;
        p.vy *= 0.93;
        p.vy += 0.02; // glitter falls rather than rises

        p.x += p.vx + sx;
        p.y += p.vy + sy;
        p.rotation += p.rotSpeed;
        p.twinkle += p.twinkleSpeed;

        p.life -= p.decay;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        const eased = p.life * p.life * (3 - 2 * p.life);
        const size = p.baseSize * (0.3 + 0.7 * eased);
        const a = eased * (0.65 + 0.35 * Math.sin(p.twinkle));
        const { r, g, b } = p.color;

        const glowR = size * (p.isStar ? 3.6 : 2.6);
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
        grad.addColorStop(0, `rgba(${r},${g},${b},${a * 0.85})`);
        grad.addColorStop(0.4, `rgba(${r},${g},${b},${a * 0.3})`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
        if (p.isStar) {
          starPath(ctx, p.x, p.y, size * 1.9, size * 0.5, p.rotation);
          ctx.fillStyle = `rgba(255,253,230,${a * 0.9})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, size * 0.45, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (particles.length > 300) particles.splice(0, particles.length - 300);

      // The arrow goes on last and opaquely, so the glitter never washes it out.
      ctx.globalCompositeOperation = 'source-over';
      if (m.seen) drawArrow(ctx, m.x, m.y, time);

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      document.documentElement.classList.remove('magic-cursor-active');
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('mouseleave', onLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      particlesRef.current = [];
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="magic-cursor-canvas"
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
};

export default MagicCursor;
