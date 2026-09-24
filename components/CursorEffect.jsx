'use client';

import { useEffect, useRef } from 'react';

export default function CursorEffect({ type = 'none', color = '#ff2a44' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!type || type === 'none') return;

    // Disable on touch devices to conserve battery
    if (typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const parseColor = (col) => {
      let r = 255, g = 42, b = 68;
      if (col && col.startsWith('#')) {
        const hex = col.replace('#', '');
        if (hex.length === 6) {
          r = parseInt(hex.substring(0, 2), 16);
          g = parseInt(hex.substring(2, 4), 16);
          b = parseInt(hex.substring(4, 6), 16);
        }
      }
      return { r, g, b };
    };

    const { r, g, b } = parseColor(color);

    const particles = [];
    const mouse = { x: -100, y: -100, lastX: -100, lastY: -100, isMoving: false };
    const ring = { x: -100, y: -100 }; // For smooth lerp dot/ring

    const handleMouseMove = (e) => {
      mouse.lastX = mouse.x;
      mouse.lastY = mouse.y;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.isMoving = true;

      // Spawn trail particles based on type
      const speed = Math.hypot(mouse.x - mouse.lastX, mouse.y - mouse.lastY);
      const spawnCount = Math.min(Math.floor(speed / 4) + 1, 4);

      for (let i = 0; i < spawnCount; i++) {
        const offsetX = (Math.random() - 0.5) * 6;
        const offsetY = (Math.random() - 0.5) * 6;

        if (type === 'sparkle_trail') {
          particles.push({
            x: mouse.x + offsetX,
            y: mouse.y + offsetY,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5 - 0.2,
            size: Math.random() * 3 + 2,
            alpha: 1,
            decay: Math.random() * 0.04 + 0.03,
            angle: Math.random() * Math.PI,
            rotSpeed: (Math.random() - 0.5) * 0.1
          });
        } else if (type === 'fire_ember') {
          particles.push({
            x: mouse.x + offsetX,
            y: mouse.y + offsetY,
            vx: (Math.random() - 0.5) * 1.2,
            vy: -(Math.random() * 2 + 1),
            size: Math.random() * 3.5 + 1.5,
            alpha: 1,
            decay: Math.random() * 0.05 + 0.03,
            angle: 0
          });
        } else if (type === 'ghost_blur') {
          particles.push({
            x: mouse.x,
            y: mouse.y,
            vx: 0,
            vy: 0,
            size: 16,
            alpha: 0.7,
            decay: 0.06
          });
        } else if (type === 'sakura_trail') {
          particles.push({
            x: mouse.x + offsetX,
            y: mouse.y + offsetY,
            vx: (Math.random() - 0.5) * 1.8,
            vy: Math.random() * 1.5 + 0.8,
            size: Math.random() * 3.5 + 2.5,
            alpha: 1,
            decay: Math.random() * 0.03 + 0.02,
            angle: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.08
          });
        }
      }
    };

    const drawCrossStar = (x, y, size, angle, alpha) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.quadraticCurveTo(0, 0, size, 0);
      ctx.quadraticCurveTo(0, 0, 0, size);
      ctx.quadraticCurveTo(0, 0, -size, 0);
      ctx.quadraticCurveTo(0, 0, 0, -size);
      ctx.closePath();
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.95})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, size * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.4})`;
      ctx.fill();
      ctx.restore();
    };

    const drawSakura = (x, y, size, angle, alpha) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.bezierCurveTo(size * 0.9, -size * 0.5, size * 0.7, size, 0, size * 1.2);
      ctx.bezierCurveTo(-size * 0.7, size, -size * 0.9, -size * 0.5, 0, -size);
      ctx.fillStyle = `rgba(255, 182, 193, ${alpha * 0.8})`;
      ctx.fill();
      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render neon_dot lerp follower
      if (type === 'neon_dot' && mouse.x > 0) {
        ring.x += (mouse.x - ring.x) * 0.22;
        ring.y += (mouse.y - ring.y) * 0.22;

        // Outer glow
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, 14, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.15)`;
        ctx.fill();

        // Thin neon ring
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, 9, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.75)`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Inner solid dot directly at cursor
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.9)`;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Render trail particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        if (p.angle !== undefined && p.rotSpeed) {
          p.angle += p.rotSpeed;
        }

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        if (type === 'sparkle_trail') {
          drawCrossStar(p.x, p.y, p.size, p.angle, p.alpha);
        } else if (type === 'fire_ember') {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${Math.min(r + 40, 255)}, ${Math.min(g + 80, 255)}, 90, ${p.alpha * 0.6})`;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.95})`;
          ctx.fill();
        } else if (type === 'ghost_blur') {
          p.size *= 0.94;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha * 0.35})`;
          ctx.fill();
        } else if (type === 'sakura_trail') {
          drawSakura(p.x, p.y, p.size, p.angle, p.alpha);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [type, color]);

  if (!type || type === 'none') return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-40"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
}
