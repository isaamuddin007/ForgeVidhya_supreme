import { useEffect, useRef } from 'react';

type Color = { r: number; g: number; b: number };

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
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

const MagicCursor = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000, prevX: -1000, prevY: -1000 });
  const rafRef = useRef<number | null>(null);
  const lastSpawnRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Respect the OS "reduce motion" setting: no particles, and the real
    // cursor stays visible (hiding it with nothing drawn in its place would
    // leave the site unusable).
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    document.documentElement.classList.add('magic-cursor-active');

    // ---------- Resize handling with DPR for crisp rendering ----------
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

    // ---------- Color palette: rose gold, crimson, soft blue ----------
    const PALETTE: Color[] = [
      { r: 255, g: 193, b: 168 }, // rose gold
      { r: 255, g: 140, b: 150 }, // soft rose
      { r: 220, g: 20, b: 60 }, // crimson
      { r: 180, g: 30, b: 90 }, // deep crimson
      { r: 140, g: 200, b: 255 }, // soft blue
      { r: 100, g: 180, b: 255 }, // brighter blue
      { r: 200, g: 220, b: 255 }, // icy blue
    ];

    // ---------- Particle factory ----------
    const createParticle = (x: number, y: number, vx: number, vy: number): Particle => {
      const color = PALETTE[(Math.random() * PALETTE.length) | 0];
      const size = 1.2 + Math.random() * 4.2; // varied size
      // Swirl direction: perpendicular to mouse velocity + randomness
      const speed = Math.hypot(vx, vy) || 1;
      const perpX = -vy / speed;
      const perpY = vx / speed;
      const swirlForce = (Math.random() - 0.5) * 0.9;
      const isStar = Math.random() < 0.35; // 35% are stars

      return {
        x,
        y,
        vx: vx * 0.18 + perpX * swirlForce * 2.2 + (Math.random() - 0.5) * 0.6,
        vy: vy * 0.18 + perpY * swirlForce * 2.2 + (Math.random() - 0.5) * 0.6,
        size,
        baseSize: size,
        life: 1,
        decay: 0.012 + Math.random() * 0.012, // ~0.8s to 1.4s
        color,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.15,
        isStar,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.1 + Math.random() * 0.15,
        // Swirl orbital params for organic float
        swirlRadius: 0.3 + Math.random() * 1.2,
        swirlAngle: Math.random() * Math.PI * 2,
        swirlSpeed: (Math.random() - 0.5) * 0.08,
      };
    };

    // ---------- Mouse tracking (with velocity for directional swirl) ----------
    const onMouseMove = (e: MouseEvent) => {
      const m = mouseRef.current;
      m.prevX = m.x;
      m.prevY = m.y;
      m.x = e.clientX;
      m.y = e.clientY;
    };

    // Also support touch for mobile
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const t = e.touches[0];
      const m = mouseRef.current;
      m.prevX = m.x;
      m.prevY = m.y;
      m.x = t.clientX;
      m.y = t.clientY;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    // ---------- Draw a four-point sparkle/star ----------
    const drawStar = (
      context: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      outer: number,
      inner: number,
      rotation: number,
    ) => {
      context.save();
      context.translate(cx, cy);
      context.rotate(rotation);
      context.beginPath();
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI / 4) * i;
        const r = i % 2 === 0 ? outer : inner;
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        if (i === 0) context.moveTo(px, py);
        else context.lineTo(px, py);
      }
      context.closePath();
      context.fill();
      context.restore();
    };

    // ---------- Main animation loop ----------
    const animate = (time: number) => {
      const m = mouseRef.current;
      const particles = particlesRef.current;

      // Spawn particles based on mouse velocity (throttled)
      const dx = m.x - m.prevX;
      const dy = m.y - m.prevY;
      const speed = Math.hypot(dx, dy);

      // prev only advances on a mousemove event, so once the pointer stops
      // the last delta would stick and the emitter would keep firing at full
      // tilt forever. Consume it here: with no new event the next frame sees
      // zero movement, and the trail is only ever drawn by actual motion.
      m.prevX = m.x;
      m.prevY = m.y;

      // Spawn more particles when moving faster, up to a limit
      const spawnInterval = speed > 12 ? 0 : speed > 4 ? 16 : 32;
      if (m.x > 0 && m.y > 0 && speed > 0.5 && time - lastSpawnRef.current > spawnInterval) {
        const count = speed > 25 ? 3 : speed > 10 ? 2 : 1;
        for (let i = 0; i < count; i++) {
          const spread = speed > 20 ? 8 : 3;
          const offX = (Math.random() - 0.5) * spread;
          const offY = (Math.random() - 0.5) * spread;
          particles.push(createParticle(m.x + offX, m.y + offY, dx, dy));
        }
        lastSpawnRef.current = time;
      }

      // Fade previous frame (trail effect) — lower alpha = longer trails.
      // Erased via destination-out rather than painted over with a dark fill:
      // this canvas covers the whole site in 'screen' blend mode, so a fill
      // would build up into an opaque sheet and tint every page behind it.
      // Removing alpha instead gives the same fading trail on a canvas that
      // stays fully transparent wherever there are no particles.
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
      ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      // Use 'lighter' for glow additive blending
      ctx.globalCompositeOperation = 'lighter';

      // Update & draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // --- Organic swirl physics ---
        p.swirlAngle += p.swirlSpeed;
        const swirlX = Math.cos(p.swirlAngle) * p.swirlRadius * 0.15;
        const swirlY = Math.sin(p.swirlAngle) * p.swirlRadius * 0.15;

        // Damping for smooth, glassy motion
        p.vx *= 0.94;
        p.vy *= 0.94;

        // Gentle upward float (like glitter rising)
        p.vy -= 0.025;

        p.x += p.vx + swirlX;
        p.y += p.vy + swirlY;

        // Rotation
        p.rotation += p.rotSpeed;
        p.twinkle += p.twinkleSpeed;

        // Life decay
        p.life -= p.decay;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        // Eased fade: smooth curve so it doesn't pop out
        const easedLife = p.life * p.life * (3 - 2 * p.life);
        const alpha = easedLife;

        // Shrink over lifetime
        const size = p.baseSize * (0.25 + 0.75 * easedLife);

        // Twinkle modulation
        const twinkleFactor = 0.7 + 0.3 * Math.sin(p.twinkle);
        const finalAlpha = alpha * twinkleFactor;

        const { r, g, b } = p.color;

        // Glow layer (soft radial)
        const glowRadius = size * (p.isStar ? 3.5 : 2.8);
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
        gradient.addColorStop(0, `rgba(${r},${g},${b},${finalAlpha * 0.9})`);
        gradient.addColorStop(0.4, `rgba(${r},${g},${b},${finalAlpha * 0.35})`);
        gradient.addColorStop(1, `rgba(${r},${g},${b},0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Core particle
        if (p.isStar) {
          // Draw a 4-point sparkle
          ctx.fillStyle = `rgba(${r},${g},${b},${finalAlpha})`;
          drawStar(ctx, p.x, p.y, size * 1.8, size * 0.5, p.rotation);

          // Bright center dot
          ctx.fillStyle = `rgba(255,255,255,${finalAlpha * 0.95})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, size * 0.55, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Round glittery dot
          ctx.fillStyle = `rgba(${r},${g},${b},${finalAlpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
          ctx.fill();

          // White highlight for sparkle
          ctx.fillStyle = `rgba(255,255,255,${finalAlpha * 0.8})`;
          ctx.beginPath();
          ctx.arc(p.x - size * 0.3, p.y - size * 0.3, size * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ---------- Persistent pointer core ----------
      // The trail dies ~1s after the last movement, so without this the
      // pointer disappears entirely whenever the mouse sits still — you
      // could not tell what you were about to click. Drawn every frame so
      // the magic cursor is always where the real one would have been.
      if (m.x > 0 && m.y > 0) {
        const coreGlow = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 16);
        coreGlow.addColorStop(0, 'rgba(200,220,255,0.55)');
        coreGlow.addColorStop(0.45, 'rgba(140,200,255,0.22)');
        coreGlow.addColorStop(1, 'rgba(140,200,255,0)');
        ctx.fillStyle = coreGlow;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 16, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.beginPath();
        ctx.arc(m.x, m.y, 2.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Cap particle count to keep performance steady
      if (particles.length > 380) {
        particles.splice(0, particles.length - 380);
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    // ---------- Cleanup ----------
    return () => {
      document.documentElement.classList.remove('magic-cursor-active');
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
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
        mixBlendMode: 'screen',
      }}
    />
  );
};

export default MagicCursor;
