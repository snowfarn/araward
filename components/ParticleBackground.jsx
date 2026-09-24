'use client';

import { useEffect, useRef, useState } from 'react';

export default function ParticleBackground({ 
  type = 'embers', 
  color = '#ff2a44',
  speed = 1,
  density = 1,
  isInline = false
}) {
  const canvasRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (type === 'none') {
      setIsLoaded(false);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    let animationFrameId;

    const parent = isInline ? canvas.parentElement : null;
    const getW = () => (isInline && parent ? (parent.clientWidth || 300) : window.innerWidth);
    const getH = () => (isInline && parent ? (parent.clientHeight || 200) : window.innerHeight);

    const isMobile = window.innerWidth < 768;
    let dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
    let width = getW();
    let height = getH();
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const mouse = { x: -1000, y: -1000, radius: isMobile ? 90 : 130 };

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

    const baseRgb = parseColor(color);

    // Particle pool setup based on type
    const particles = [];
    const baseCount = isMobile ? (type === 'rain' ? 45 : 30) : (type === 'rain' ? 85 : 55);
    const totalCount = Math.round(baseCount * Math.max(0.4, Math.min(2.5, density)));

    for (let i = 0; i < totalCount; i++) {
      let vy = 0;
      let vx = (Math.random() - 0.5) * 0.8 * speed;
      let size = Math.random() * 3 + 1.5;

      if (type === 'snow') {
        vy = (Math.random() * 0.9 + 0.5) * speed;
        vx = (Math.random() - 0.5) * 0.6 * speed;
        size = Math.random() * 3.5 + 1.5;
      } else if (type === 'sakura') {
        vy = (Math.random() * 1.1 + 0.6) * speed;
        vx = (Math.sin(Math.random() * Math.PI) * 0.8 + 0.3) * speed;
        size = Math.random() * 4 + 2.5;
      } else if (type === 'rain') {
        vy = (Math.random() * 9 + 11) * speed;
        vx = -1.2 * speed;
        size = Math.random() * 1.8 + 1;
      } else if (type === 'embers') {
        vy = -(Math.random() * 1.4 + 0.6) * speed;
        vx = (Math.random() - 0.5) * 0.9 * speed;
        size = Math.random() * 3.6 + 1.2;
      } else if (type === 'stars' || type === 'sparkles') {
        vy = (Math.random() - 0.5) * 0.3 * speed;
        vx = (Math.random() - 0.5) * 0.3 * speed;
        size = Math.random() * 3.2 + 1.8;
      } else if (type === 'fireflies') {
        vy = (Math.random() - 0.5) * 0.7 * speed;
        vx = (Math.random() - 0.5) * 0.7 * speed;
        size = Math.random() * 3.5 + 2;
      } else if (type === 'bubbles') {
        vy = -(Math.random() * 1.2 + 0.4) * speed;
        vx = (Math.sin(Math.random() * Math.PI) * 0.5) * speed;
        size = Math.random() * 5 + 2.5;
      } else if (type === 'matrix') {
        vy = (Math.random() * 4 + 3) * speed;
        vx = 0;
        size = Math.random() * 2 + 1.5;
      } else {
        // cyber_dust
        vy = (Math.random() - 0.5) * 0.5 * speed;
        vx = (Math.random() - 0.5) * 0.5 * speed;
        size = Math.random() * 2.8 + 1;
      }

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx,
        vy,
        size,
        baseSize: size,
        alpha: Math.random() * 0.6 + 0.25,
        baseAlpha: Math.random() * 0.5 + 0.3,
        pulseSpeed: Math.random() * 0.025 + 0.015,
        pulseVal: Math.random() * Math.PI * 2,
        angle: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.04,
        swaySpeed: Math.random() * 0.02 + 0.01,
        swayOffset: Math.random() * Math.PI * 2,
        isFlake: Math.random() > 0.45 // For snow: crystalline snowflake vs soft circle
      });
    }

    // Burst particles on tap/click
    const burstParticles = [];
    const createBurst = (x, y) => {
      const count = isMobile ? 10 : 16;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3.5 + 1.2;
        burstParticles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 2.5 + 1,
          alpha: 1,
          life: 1,
          decay: Math.random() * 0.04 + 0.02,
          shape: Math.random() > 0.5 ? 'sparkle' : 'star'
        });
      }
    };

    // --- DRAW FUNCTIONS ---

    // 6-arm delicate snowflake crystal (like in the reference screenshot!)
    const drawSnowflake = (x, y, size, angle, alpha) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.strokeStyle = `rgba(${baseRgb.r}, ${baseRgb.g}, ${baseRgb.b}, ${alpha * 0.95})`;
      ctx.lineWidth = Math.max(1, size * 0.25);
      ctx.lineCap = 'round';

      // 6 main arms
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -size);
        // Small branchlets
        ctx.moveTo(0, -size * 0.55);
        ctx.lineTo(-size * 0.3, -size * 0.8);
        ctx.moveTo(0, -size * 0.55);
        ctx.lineTo(size * 0.3, -size * 0.8);
        ctx.stroke();
        ctx.rotate(Math.PI / 3);
      }
      ctx.restore();
    };

    // Soft round snowflake
    const drawSoftSnow = (x, y, size, alpha) => {
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${baseRgb.r}, ${baseRgb.g}, ${baseRgb.b}, ${alpha * 0.8})`;
      ctx.fill();
    };

    // Sakura blossom petal
    const drawSakuraPetal = (x, y, size, angle, alpha) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, -size * 1.3);
      ctx.bezierCurveTo(size * 1.1, -size * 0.6, size * 0.8, size * 1.2, 0, size * 1.4);
      ctx.bezierCurveTo(-size * 0.8, size * 1.2, -size * 1.1, -size * 0.6, 0, -size * 1.3);
      ctx.fillStyle = `rgba(${baseRgb.r}, ${baseRgb.g}, ${baseRgb.b}, ${alpha * 0.75})`;
      ctx.fill();
      ctx.restore();
    };

    // Cyber rain streak
    const drawRainStreak = (p, r, g, b) => {
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + p.vx * 3.5, p.y + p.vy * 1.8);
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha * 0.7})`;
      ctx.lineWidth = p.size;
      ctx.lineCap = 'round';
      ctx.stroke();
    };

    // 4-pointed cross star (Stars / Sparkles)
    const drawCrossStar = (x, y, size, angle, r, g, b, alpha) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      ctx.beginPath();
      ctx.moveTo(0, -size * 1.5);
      ctx.quadraticCurveTo(0, 0, size * 1.5, 0);
      ctx.quadraticCurveTo(0, 0, 0, size * 1.5);
      ctx.quadraticCurveTo(0, 0, -size * 1.5, 0);
      ctx.quadraticCurveTo(0, 0, 0, -size * 1.5);
      ctx.closePath();
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.95})`;
      ctx.fill();

      // Outer glow
      ctx.beginPath();
      ctx.arc(0, 0, size * 1.3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.35})`;
      ctx.fill();
      ctx.restore();
    };

    // Rising fire ember with trail
    const drawEmber = (p, r, g, b) => {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - p.vx * 5, p.y - p.vy * 5);
      ctx.strokeStyle = `rgba(${Math.min(r + 30, 255)}, ${Math.min(g + 60, 255)}, 120, ${p.alpha * 0.45})`;
      ctx.lineWidth = p.size * 0.7;
      ctx.lineCap = 'round';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha * 0.4})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.9})`;
      ctx.fill();
      ctx.restore();
    };

    // Soft floating dust orb
    const drawCyberDust = (p, r, g, b) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 1.4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha * 0.35})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.8})`;
      ctx.fill();
    };

    // Main animation loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const { r, g, b } = baseRgb;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Pulse alpha
        p.pulseVal += p.pulseSpeed;
        p.alpha = p.baseAlpha + Math.sin(p.pulseVal) * 0.25;
        p.angle += p.rotationSpeed;

        // Position updates
        if (type === 'snow' || type === 'sakura') {
          p.x += p.vx + Math.sin(p.pulseVal * 0.5 + p.swayOffset) * 0.5;
          p.y += p.vy;
        } else {
          p.x += p.vx;
          p.y += p.vy;
        }

        // Mouse repelling physics
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius && dist > 0) {
          const force = (1 - dist / mouse.radius) * 1.5;
          p.x += (dx / dist) * force;
          p.y += (dy / dist) * force;
        }

        // Screen wrap
        if (p.y < -30) p.y = height + 20;
        if (p.y > height + 30) p.y = -20;
        if (p.x < -30) p.x = width + 20;
        if (p.x > width + 30) p.x = -20;

        // Render particle
        if (type === 'snow') {
          if (p.isFlake) {
            drawSnowflake(p.x, p.y, p.size * 1.3, p.angle, p.alpha);
          } else {
            drawSoftSnow(p.x, p.y, p.size, p.alpha);
          }
        } else if (type === 'sakura') {
          drawSakuraPetal(p.x, p.y, p.size, p.angle, p.alpha);
        } else if (type === 'rain') {
          drawRainStreak(p, r, g, b);
        } else if (type === 'embers') {
          drawEmber(p, r, g, b);
        } else if (type === 'stars' || type === 'sparkles') {
          drawCrossStar(p.x, p.y, p.size, p.angle, r, g, b, p.alpha);
        } else if (type === 'fireflies') {
          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 1.6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha * 0.25})`;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${Math.min(r + 50, 255)}, ${Math.min(g + 50, 255)}, 255, ${p.alpha * 0.9})`;
          ctx.fill();
          ctx.restore();
        } else if (type === 'bubbles') {
          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha * 0.7})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(p.x - p.size * 0.3, p.y - p.size * 0.3, p.size * 0.3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.6})`;
          ctx.fill();
          ctx.restore();
        } else if (type === 'matrix') {
          ctx.save();
          ctx.font = `${Math.round(p.size * 4)}px monospace`;
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha * 0.85})`;
          ctx.fillText(String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96)), p.x, p.y);
          ctx.restore();
        } else {
          drawCyberDust(p, r, g, b);
        }
      }

      // Render burst particles
      for (let i = burstParticles.length - 1; i >= 0; i--) {
        const bp = burstParticles[i];
        bp.x += bp.vx;
        bp.y += bp.vy;
        bp.vx *= 0.94;
        bp.vy *= 0.94;
        bp.life -= bp.decay;
        bp.alpha = bp.life;

        drawCrossStar(bp.x, bp.y, bp.size, 0, r, g, b, bp.alpha);

        if (bp.life <= 0) {
          burstParticles.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    setIsLoaded(true);

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
      }
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleClick = (e) => {
      createBurst(e.clientX, e.clientY);
    };

    const handleResize = () => {
      const mob = window.innerWidth < 768;
      dpr = Math.min(window.devicePixelRatio || 1, mob ? 1.5 : 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(render);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('click', handleClick);
    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, [type, color, speed, density, isInline]);

  if (type === 'none') return null;

  return (
    <canvas
      ref={canvasRef}
      className={`${isInline ? 'absolute inset-0 w-full h-full pointer-events-none' : 'fixed inset-0 w-full h-full pointer-events-none -z-10'} transition-opacity duration-1000 ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      }`}
      style={isInline ? { width: '100%', height: '100%' } : { width: '100vw', height: '100vh' }}
    />
  );
}
