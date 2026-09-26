'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * ParticleBackground
 * Props:
 *  - type: string — particle type preset OR 'custom_image' for custom images
 *  - color: string — hex color for built-in types
 *  - speed: number — multiplier (default 1)
 *  - density: number — count multiplier (default 1)
 *  - isInline: boolean — if true, fills parent container instead of fullscreen
 *  - customImages: string[] — array of image URLs for 'custom_image' type
 *  - customAnimate: boolean — whether custom images rotate/bob (default true)
 *  - emitDirection: 'all'|'up'|'down'|'left'|'right' — direction particles drift (default 'all')
 *  - particleSize: 'small'|'medium'|'large'|number — max bounding box for custom sprites
 */
export default function ParticleBackground({
  type = 'embers',
  color = '#ff2a44',
  speed = 1,
  density = 1,
  isInline = false,
  customImages = [],
  customAnimate = true,
  emitDirection = 'all',
  particleSize = 'medium',
}) {
  const canvasRef = useRef(null);
  const domContainerRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Stable identity key: a fresh array instance (e.g. `member.customParticleImages || []`)
  // must NOT restart the whole engine, otherwise sprites vanish and respawn endlessly.
  const imagesKey = useMemo(
    () => (Array.isArray(customImages) ? customImages.filter(Boolean).join('|') : ''),
    [customImages]
  );
  const images = useMemo(() => (imagesKey ? imagesKey.split('|') : []), [imagesKey]);

  useEffect(() => {
    if (type === 'none') {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });

    // ===== SINGLE SOURCE OF TRUTH FOR THE ANIMATION LOOP =====
    // Previously the custom_image branch cancelled the frame and then scheduled a no-op
    // frame when the tab became visible again, so the engine stayed frozen forever while
    // the <img> GIFs kept animating on their own (the "frozen but still moving" bug).
    let animationFrameId = null;
    let bootId = null;
    let running = false;
    let frameFn = () => { };

    const startLoop = () => {
      if (running) return;
      running = true;
      const tick = () => {
        if (!running) return;
        frameFn();
        animationFrameId = requestAnimationFrame(tick);
      };
      animationFrameId = requestAnimationFrame(tick);
    };

    const stopLoop = () => {
      running = false;
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    };

    let onScreen = true;
    const applyRunState = () => {
      if (typeof document !== 'undefined' && !document.hidden && onScreen) startLoop();
      else stopLoop();
    };

    // Pause the engine while the component is scrolled out of view
    const io = typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver((entries) => {
        onScreen = entries[0] ? entries[0].isIntersecting : true;
        applyRunState();
      }, { threshold: 0 })
      : null;
    if (io) io.observe(canvas);

    document.addEventListener('visibilitychange', applyRunState);

    const teardown = () => {
      if (bootId !== null) {
        cancelAnimationFrame(bootId);
        bootId = null;
      }
      stopLoop();
      document.removeEventListener('visibilitychange', applyRunState);
      if (io) io.disconnect();
    };

    const domContainer = domContainerRef.current;

    // Respect OS-level motion preference (accessibility + battery)
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const motionScale = prefersReducedMotion ? 0.4 : 1;

    const parent = isInline ? canvas.parentElement : null;
    const getW = () => (isInline && parent ? (parent.clientWidth || 300) : window.innerWidth);
    const getH = () => (isInline && parent ? (parent.clientHeight || 200) : window.innerHeight);

    const isMobile = window.innerWidth < 768;
    let dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
    let width = getW();
    let height = getH();

    const applyCanvasSize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.5 : 2);
      width = getW();
      height = getH();
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      // setTransform REPLACES the viewport scale (ctx.scale accumulates on every resize)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    applyCanvasSize();

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

    // ===== CUSTOM IMAGE PARTICLES (DOM + GIF Animation Support) =====
    // NOTE: when `custom_image` has no usable sprites we deliberately FALL THROUGH to the
    // built-in canvas renderer, so the background is never left empty.
    if (type === 'custom_image' && images.length > 0) {
      if (domContainer) {
        domContainer.innerHTML = '';
      }

      // Load all custom images first to get dimensions
      const loadedImages = [];
      let loadedCount = 0;
      const totalImages = images.length;
      let resizedSprites = [];

      // Compute target max bounding size based on particleSize prop
      let MAX_SIZE = 38;
      if (particleSize === 'small') MAX_SIZE = 24;
      else if (particleSize === 'large') MAX_SIZE = 54;
      else if (typeof particleSize === 'number') MAX_SIZE = particleSize;
      const MIN_SIZE = Math.max(12, Math.round(MAX_SIZE * 0.5));

      const startCustomParticles = () => {
        if (loadedImages.length === 0) return;

        // --- Sprite count is derived from the viewport AREA ---
        // The old formula was `10 / totalImages`, which gave FEWER particles the more
        // sprites you uploaded, and collapsed a full screen down to ~5 sprites total.
        const densityMul = Math.max(0.4, Math.min(2.5, Number(density) || 1));
        const areaBase = (width * height) / 30000;
        const varietyBoost = Math.min(1.25, 0.85 + loadedImages.length * 0.08);
        const hardCap = isMobile ? 20 : 44;
        const softMin = isMobile ? 8 : 14;
        const totalCount = Math.max(
          softMin,
          Math.min(hardCap, Math.round(areaBase * densityMul * varietyBoost * motionScale))
        );

        // ONE canonical render size per UNIQUE sprite. Previously every particle picked a
        // random size from the same source image, forcing the browser to decode/rescale the
        // animated GIF at many different sizes at once (the source of the periodic stalls).
        // Per-particle variance now happens through GPU-composited transform scale().
        const sizeByImage = new Map();
        loadedImages.forEach((item, idx) => {
          const origW = item.naturalWidth || 36;
          const origH = item.naturalHeight || 36;
          const maxDim = Math.max(origW, origH, 1);
          const target = MAX_SIZE * (0.78 + ((idx * 37) % 10) / 40); // deterministic 0.78–1.00
          const scale = target / maxDim;
          sizeByImage.set(item, {
            w: Math.max(MIN_SIZE, Math.round(origW * scale)),
            h: Math.max(MIN_SIZE, Math.round(origH * scale)),
          });
        });

        const velocityScale = speed * motionScale;
        const particles = [];
        const centerX = width / 2;
        const centerY = height / 2;

        if (domContainer) {
          domContainer.innerHTML = '';
        }

        for (let i = 0; i < totalCount; i++) {
          const item = loadedImages[Math.floor(Math.random() * loadedImages.length)];
          const box = sizeByImage.get(item) || { w: MAX_SIZE, h: MAX_SIZE };
          const isGif = /\.gif(\?|$)/i.test(item.src || '');

          const spd = (Math.random() * 0.8 + 0.6) * velocityScale;
          let px = Math.random() * width;
          let py = Math.random() * height;
          let vx = 0;
          let vy = 0;

          if (emitDirection === 'down' || emitDirection === 'rain') {
            vy = (Math.random() * 1.6 + 1.2) * velocityScale;
            vx = (Math.random() - 0.5) * 0.6 * velocityScale;
            py = Math.random() * (height + 200) - 100;
          } else if (emitDirection === 'up' || emitDirection === 'float') {
            vy = -(Math.random() * 1.5 + 0.8) * velocityScale;
            vx = (Math.random() - 0.5) * 0.6 * velocityScale;
          } else if (emitDirection === 'drift' || emitDirection === 'snow') {
            vy = (Math.random() * 0.9 + 0.5) * velocityScale;
            vx = Math.sin(Math.random() * Math.PI * 2) * 0.4;
          } else if (emitDirection === 'burst') {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 80;
            px = centerX + Math.cos(angle) * dist;
            py = centerY + Math.sin(angle) * dist;
            const burstSpeed = (Math.random() * 2.2 + 1.2) * velocityScale;
            vx = Math.cos(angle) * burstSpeed;
            vy = Math.sin(angle) * burstSpeed;
          } else if (emitDirection === 'fountain') {
            px = centerX + (Math.random() - 0.5) * 160;
            py = height + 10;
            vy = -(Math.random() * 3.5 + 2.5) * velocityScale;
            vx = (Math.random() - 0.5) * 2.0 * velocityScale;
          } else if (emitDirection === 'left') {
            vx = -(Math.random() * 1.4 + 0.8) * velocityScale;
            vy = (Math.random() - 0.5) * 0.6 * velocityScale;
          } else if (emitDirection === 'right') {
            vx = (Math.random() * 1.4 + 0.8) * velocityScale;
            vy = (Math.random() - 0.5) * 0.6 * velocityScale;
          } else if (emitDirection === 'vortex') {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * (Math.min(width, height) * 0.45);
            px = centerX + Math.cos(angle) * radius;
            py = centerY + Math.sin(angle) * radius;
            vx = -Math.sin(angle) * (1.2 * velocityScale);
            vy = Math.cos(angle) * (1.2 * velocityScale);
          } else {
            // 'all': ambient zero-g
            const angle = Math.random() * Math.PI * 2;
            vx = Math.cos(angle) * spd;
            vy = Math.sin(angle) * spd;
          }

          const scaleVal = 0.85 + Math.random() * 0.3;

          // Native DOM IMG for animated GIF playback
          let el = null;
          if (domContainer) {
            el = document.createElement('img');
            el.src = item.src;
            el.alt = '';
            el.decoding = 'async';
            el.loading = 'eager';
            el.draggable = false;
            el.referrerPolicy = 'no-referrer';
            el.style.position = 'absolute';
            el.style.left = '0px';
            el.style.top = '0px';
            el.style.width = `${box.w}px`;
            el.style.height = `${box.h}px`;
            el.style.objectFit = 'contain';
            el.style.pointerEvents = 'none';
            el.style.userSelect = 'none';
            el.style.transformOrigin = 'center center';
            el.style.backfaceVisibility = 'hidden';
            el.style.willChange = 'transform';
            el.style.opacity = '0';
            el.style.transform = `translate3d(${Math.round(px - box.w / 2)}px, ${Math.round(py - box.h / 2)}px, 0) scale(${scaleVal.toFixed(3)})`;
            domContainer.appendChild(el);
          }

          particles.push({
            el,
            isGif,
            x: px,
            y: py,
            vx,
            vy,
            w: box.w,
            h: box.h,
            scale: scaleVal,
            baseAlpha: Math.random() * 0.4 + 0.6,
            lastAlpha: -1,
            pulseSpeed: Math.random() * 0.03 + 0.015,
            pulseVal: Math.random() * Math.PI * 2,
            // GIFs are never rotated: rotating them at 60fps makes browsers thrash the
            // animated-image compositor.
            angle: customAnimate && !isGif ? Math.random() * Math.PI * 2 : 0,
            rotSpeed: customAnimate && !isGif ? (Math.random() - 0.5) * 0.02 : 0,
            bobOffset: Math.random() * Math.PI * 2,
            initialVy: vy,
            gravity: emitDirection === 'fountain' ? 0.045 * velocityScale : 0,
          });
        }

        resizedSprites = particles;

        frameFn = () => {
          // Custom mode paints with DOM nodes, so clear any stale canvas pixels left behind
          // by a previously selected particle type.
          ctx.clearRect(0, 0, width, height);

          for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.pulseVal += p.pulseSpeed;
            const targetAlpha = Math.max(0, Math.min(1, p.baseAlpha + Math.sin(p.pulseVal) * 0.15));
            p.angle += p.rotSpeed;

            if (p.gravity) {
              p.vy += p.gravity;
            }

            let swayX = 0;
            if (emitDirection === 'drift' || emitDirection === 'snow') {
              swayX = Math.sin(p.pulseVal + p.bobOffset) * 0.8;
            } else if (emitDirection === 'down' || emitDirection === 'rain') {
              swayX = Math.sin(p.pulseVal * 0.5 + p.bobOffset) * 0.4;
            }

            p.x += p.vx + swayX;
            p.y += p.vy;

            // Mouse repel
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < mouse.radius && dist > 0) {
              const force = (1 - dist / mouse.radius) * 1.5;
              p.x += (dx / dist) * force;
              p.y += (dy / dist) * force;
            }

            // Screen boundary respawn
            if (emitDirection === 'down' || emitDirection === 'rain' || emitDirection === 'drift' || emitDirection === 'snow') {
              if (p.y > height + p.h) {
                p.y = -p.h - 10;
                p.x = Math.random() * width;
              }
              if (p.x < -p.w - 10) p.x = width + p.w;
              if (p.x > width + p.w + 10) p.x = -p.w;
            } else if (emitDirection === 'up' || emitDirection === 'float') {
              if (p.y < -p.h - 10) {
                p.y = height + p.h + 10;
                p.x = Math.random() * width;
              }
              if (p.x < -p.w - 10) p.x = width + p.w;
              if (p.x > width + p.w + 10) p.x = -p.w;
            } else if (emitDirection === 'burst') {
              if (p.x < -50 || p.x > width + 50 || p.y < -50 || p.y > height + 50) {
                const angle = Math.random() * Math.PI * 2;
                p.x = centerX + Math.cos(angle) * (Math.random() * 40);
                p.y = centerY + Math.sin(angle) * (Math.random() * 40);
                const bSpeed = (Math.random() * 2.2 + 1.2) * velocityScale;
                p.vx = Math.cos(angle) * bSpeed;
                p.vy = Math.sin(angle) * bSpeed;
              }
            } else if (emitDirection === 'fountain') {
              if (p.y > height + 30 && p.vy > 0) {
                p.x = centerX + (Math.random() - 0.5) * 160;
                p.y = height + 10;
                p.vy = -(Math.random() * 3.5 + 2.5) * velocityScale;
                p.vx = (Math.random() - 0.5) * 2.0 * velocityScale;
              }
            } else {
              // 'all' / wrap around
              if (p.y < -p.h - 10) p.y = height + p.h;
              if (p.y > height + p.h + 10) p.y = -p.h;
              if (p.x < -p.w - 10) p.x = width + p.w;
              if (p.x > width + p.w + 10) p.x = -p.w;
            }

            if (!p.el) continue;

            const tx = Math.round(p.x - p.w / 2);
            const ty = Math.round(p.y - p.h / 2);
            const rot = p.rotSpeed !== 0 ? ` rotate(${p.angle.toFixed(3)}rad)` : '';
            p.el.style.transform =
              `translate3d(${tx}px, ${ty}px, 0) scale(${p.scale.toFixed(3)})${rot}`;

            // Skip redundant style writes — only touch opacity when it actually moved.
            if (Math.abs(targetAlpha - p.lastAlpha) > 0.01) {
              p.lastAlpha = targetAlpha;
              p.el.style.opacity = targetAlpha.toFixed(2);
            }
          }
        };

        setIsLoaded(true);
        applyRunState();
      };

      let started = false;
      const tryStart = () => {
        if (!started && loadedImages.length > 0) {
          started = true;
          startCustomParticles();
        }
      };

      const safetyTimeout = setTimeout(tryStart, 1500);

      images.forEach((src) => {
        const img = new Image();
        img.decoding = 'async';
        img.referrerPolicy = 'no-referrer';
        const onReady = () => {
          if (!loadedImages.includes(img)) loadedImages.push(img);
          loadedCount++;
          if (loadedCount >= totalImages) {
            clearTimeout(safetyTimeout);
            tryStart();
          }
        };
        img.onload = onReady;
        img.onerror = () => {
          // Expired/dead sprite URL: skip it instead of aborting the whole effect.
          loadedCount++;
          if (loadedCount >= totalImages) {
            clearTimeout(safetyTimeout);
            tryStart();
          }
        };
        img.src = src;
        if (img.complete && img.naturalWidth > 0) {
          onReady();
        }
      });

      const handleMouseMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
      const handleTouchMove = (e) => {
        if (e.touches?.[0]) { mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY; }
      };
      const handleMouseLeave = () => { mouse.x = -1000; mouse.y = -1000; };
      const handleResize = () => {
        applyCanvasSize();
        // Re-seat sprites so none are stranded outside the new viewport
        for (let i = 0; i < resizedSprites.length; i++) {
          const p = resizedSprites[i];
          if (p.x > width + p.w || p.x < -p.w - 10) p.x = Math.random() * width;
          if (p.y > height + p.h || p.y < -p.h - 10) p.y = Math.random() * height;
        }
      };

      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      window.addEventListener('touchmove', handleTouchMove, { passive: true });
      window.addEventListener('mouseleave', handleMouseLeave);
      window.addEventListener('resize', handleResize);

      return () => {
        clearTimeout(safetyTimeout);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('mouseleave', handleMouseLeave);
        window.removeEventListener('resize', handleResize);
        teardown();
        resizedSprites = [];
        if (domContainer) {
          domContainer.innerHTML = '';
        }
      };
    }

    // ===== BUILT-IN PARTICLE TYPES =====
    const particles = [];
    const effSpeed = speed * motionScale;
    const baseCount = isMobile ? (type === 'rain' ? 34 : 22) : (type === 'rain' ? 90 : 62);
    const totalCount = Math.round(
      baseCount * Math.max(0.4, Math.min(2.5, Number(density) || 1)) * motionScale
    );

    for (let i = 0; i < totalCount; i++) {
      let vy = 0;
      let vx = (Math.random() - 0.5) * 0.8 * effSpeed;
      let size = Math.random() * 3 + 1.5;

      if (type === 'snow') {
        vy = (Math.random() * 0.9 + 0.5) * effSpeed;
        vx = (Math.random() - 0.5) * 0.6 * effSpeed;
        size = Math.random() * 3.5 + 1.5;
      } else if (type === 'sakura') {
        vy = (Math.random() * 1.1 + 0.6) * effSpeed;
        vx = (Math.sin(Math.random() * Math.PI) * 0.8 + 0.3) * effSpeed;
        size = Math.random() * 4 + 2.5;
      } else if (type === 'rain') {
        vy = (Math.random() * 9 + 11) * effSpeed;
        vx = -1.2 * effSpeed;
        size = Math.random() * 1.8 + 1;
      } else if (type === 'embers') {
        vy = -(Math.random() * 1.4 + 0.6) * effSpeed;
        vx = (Math.random() - 0.5) * 0.9 * effSpeed;
        size = Math.random() * 3.6 + 1.2;
      } else if (type === 'stars' || type === 'sparkles') {
        vy = (Math.random() - 0.5) * 0.3 * effSpeed;
        vx = (Math.random() - 0.5) * 0.3 * effSpeed;
        size = Math.random() * 3.2 + 1.8;
      } else if (type === 'fireflies') {
        vy = (Math.random() - 0.5) * 0.7 * effSpeed;
        vx = (Math.random() - 0.5) * 0.7 * effSpeed;
        size = Math.random() * 3.5 + 2;
      } else if (type === 'bubbles') {
        vy = -(Math.random() * 1.2 + 0.4) * effSpeed;
        vx = (Math.sin(Math.random() * Math.PI) * 0.5) * effSpeed;
        size = Math.random() * 5 + 2.5;
      } else if (type === 'matrix') {
        vy = (Math.random() * 4 + 3) * effSpeed;
        vx = 0;
        size = Math.random() * 2 + 1.5;
      } else {
        vy = (Math.random() - 0.5) * 0.5 * effSpeed;
        vx = (Math.random() - 0.5) * 0.5 * effSpeed;
        size = Math.random() * 2.8 + 1;
      }

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx, vy, size,
        baseSize: size,
        alpha: Math.random() * 0.6 + 0.25,
        baseAlpha: Math.random() * 0.5 + 0.3,
        pulseSpeed: Math.random() * 0.025 + 0.015,
        pulseVal: Math.random() * Math.PI * 2,
        angle: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.04,
        swaySpeed: Math.random() * 0.02 + 0.01,
        swayOffset: Math.random() * Math.PI * 2,
        isFlake: Math.random() > 0.45,
      });
    }

    // Burst particles on tap/click (hard capped so spam clicking cannot tank the FPS)
    const burstParticles = [];
    const MAX_BURST = isMobile ? 80 : 140;
    const createBurst = (x, y) => {
      const room = MAX_BURST - burstParticles.length;
      if (room <= 0) return;
      const count = Math.min(isMobile ? 10 : 16, room);
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = Math.random() * 3.5 + 1.2;
        burstParticles.push({
          x, y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          size: Math.random() * 2.5 + 1,
          alpha: 1,
          life: 1,
          decay: Math.random() * 0.04 + 0.02,
        });
      }
    };

    // Draw helpers
    const drawSnowflake = (x, y, size, angle, alpha) => {
      ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
      ctx.strokeStyle = `rgba(${baseRgb.r}, ${baseRgb.g}, ${baseRgb.b}, ${alpha * 0.95})`;
      ctx.lineWidth = Math.max(1, size * 0.25); ctx.lineCap = 'round';
      for (let i = 0; i < 6; i++) {
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -size);
        ctx.moveTo(0, -size * 0.55); ctx.lineTo(-size * 0.3, -size * 0.8);
        ctx.moveTo(0, -size * 0.55); ctx.lineTo(size * 0.3, -size * 0.8);
        ctx.stroke(); ctx.rotate(Math.PI / 3);
      }
      ctx.restore();
    };

    const drawSoftSnow = (x, y, size, alpha) => {
      ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${baseRgb.r}, ${baseRgb.g}, ${baseRgb.b}, ${alpha * 0.8})`; ctx.fill();
    };

    const drawSakuraPetal = (x, y, size, angle, alpha) => {
      ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, -size * 1.3);
      ctx.bezierCurveTo(size * 1.1, -size * 0.6, size * 0.8, size * 1.2, 0, size * 1.4);
      ctx.bezierCurveTo(-size * 0.8, size * 1.2, -size * 1.1, -size * 0.6, 0, -size * 1.3);
      ctx.fillStyle = `rgba(${baseRgb.r}, ${baseRgb.g}, ${baseRgb.b}, ${alpha * 0.75})`; ctx.fill();
      ctx.restore();
    };

    const drawRainStreak = (p, r, g, b) => {
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + p.vx * 3.5, p.y + p.vy * 1.8);
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha * 0.7})`;
      ctx.lineWidth = p.size; ctx.lineCap = 'round'; ctx.stroke();
    };

    const drawCrossStar = (x, y, size, angle, r, g, b, alpha) => {
      ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, -size * 1.5); ctx.quadraticCurveTo(0, 0, size * 1.5, 0);
      ctx.quadraticCurveTo(0, 0, 0, size * 1.5); ctx.quadraticCurveTo(0, 0, -size * 1.5, 0);
      ctx.quadraticCurveTo(0, 0, 0, -size * 1.5); ctx.closePath();
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.95})`; ctx.fill();
      ctx.beginPath(); ctx.arc(0, 0, size * 1.3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.35})`; ctx.fill();
      ctx.restore();
    };

    const drawEmber = (p, r, g, b) => {
      ctx.save();
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 5, p.y - p.vy * 5);
      ctx.strokeStyle = `rgba(${Math.min(r + 30, 255)}, ${Math.min(g + 60, 255)}, 120, ${p.alpha * 0.45})`;
      ctx.lineWidth = p.size * 0.7; ctx.lineCap = 'round'; ctx.stroke();
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha * 0.4})`; ctx.fill();
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.9})`; ctx.fill();
      ctx.restore();
    };

    const drawCyberDust = (p, r, g, b) => {
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 1.4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha * 0.35})`; ctx.fill();
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.8})`; ctx.fill();
    };

    frameFn = () => {
      ctx.clearRect(0, 0, width, height);
      const { r, g, b } = baseRgb;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.pulseVal += p.pulseSpeed;
        p.alpha = p.baseAlpha + Math.sin(p.pulseVal) * 0.25;
        p.angle += p.rotationSpeed;

        if (type === 'snow' || type === 'sakura') {
          p.x += p.vx + Math.sin(p.pulseVal * 0.5 + p.swayOffset) * 0.5;
          p.y += p.vy;
        } else {
          p.x += p.vx; p.y += p.vy;
        }

        const dx = p.x - mouse.x; const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius && dist > 0) {
          const force = (1 - dist / mouse.radius) * 1.5;
          p.x += (dx / dist) * force; p.y += (dy / dist) * force;
        }

        if (p.y < -30) p.y = height + 20;
        if (p.y > height + 30) p.y = -20;
        if (p.x < -30) p.x = width + 20;
        if (p.x > width + 30) p.x = -20;

        if (type === 'snow') {
          if (p.isFlake) drawSnowflake(p.x, p.y, p.size * 1.3, p.angle, p.alpha);
          else drawSoftSnow(p.x, p.y, p.size, p.alpha);
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
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 1.6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha * 0.25})`; ctx.fill();
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${Math.min(r + 50, 255)}, ${Math.min(g + 50, 255)}, 255, ${p.alpha * 0.9})`; ctx.fill();
          ctx.restore();
        } else if (type === 'bubbles') {
          ctx.save();
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha * 0.7})`; ctx.lineWidth = 1.2; ctx.stroke();
          ctx.beginPath(); ctx.arc(p.x - p.size * 0.3, p.y - p.size * 0.3, p.size * 0.3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.6})`; ctx.fill();
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

      // Burst particles
      for (let i = burstParticles.length - 1; i >= 0; i--) {
        const bp = burstParticles[i];
        bp.x += bp.vx; bp.y += bp.vy;
        bp.vx *= 0.94; bp.vy *= 0.94;
        bp.life -= bp.decay; bp.alpha = bp.life;
        drawCrossStar(bp.x, bp.y, bp.size, 0, r, g, b, bp.alpha);
        if (bp.life <= 0) burstParticles.splice(i, 1);
      }
    };

    // Deferred one frame so mounting does not flip state synchronously inside the effect
    // body (which would trigger a cascading render right after mount).
    bootId = requestAnimationFrame(() => {
      bootId = null;
      setIsLoaded(true);
      applyRunState();
    });

    const handleMouseMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const handleTouchMove = (e) => {
      if (e.touches?.[0]) { mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY; }
    };
    const handleMouseLeave = () => { mouse.x = -1000; mouse.y = -1000; };

    // Never spawn bursts when the user is actually interacting with the UI
    const INTERACTIVE_SELECTOR = 'a,button,input,textarea,select,label,[role="button"],[data-no-particle-burst]';
    const handleClick = (e) => {
      const target = e.target;
      if (target && typeof target.closest === 'function' && target.closest(INTERACTIVE_SELECTOR)) return;
      createBurst(e.clientX, e.clientY);
    };

    const handleResize = () => {
      applyCanvasSize();
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('click', handleClick);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      teardown();
      if (domContainer) {
        domContainer.innerHTML = '';
      }
    };
  }, [type, color, speed, density, isInline, imagesKey, customAnimate, emitDirection, particleSize, images]);

  if (type === 'none') return null;

  // `custom_image` without usable sprites falls back to the canvas renderer, so in that case
  // the canvas must stay visible and the DOM sprite layer must not be mounted at all.
  const useDomSprites = type === 'custom_image' && imagesKey.length > 0;

  return (
    <>
      <canvas
        ref={canvasRef}
        className={`${isInline ? 'absolute inset-0 w-full h-full pointer-events-none' : 'fixed inset-0 w-full h-full pointer-events-none -z-10'} transition-opacity duration-1000 ${isLoaded && !useDomSprites ? 'opacity-100' : 'opacity-0'
          }`}
        style={isInline ? { width: '100%', height: '100%' } : { width: '100vw', height: '100vh' }}
      />
      {useDomSprites && (
        <div
          ref={domContainerRef}
          className={`${isInline ? 'absolute inset-0 w-full h-full overflow-hidden pointer-events-none' : 'fixed inset-0 w-full h-full overflow-hidden pointer-events-none -z-10'} transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          style={isInline ? { width: '100%', height: '100%' } : { width: '100vw', height: '100vh' }}
        />
      )}
    </>
  );
}
