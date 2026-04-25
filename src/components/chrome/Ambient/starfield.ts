interface Star {
  x: number;
  yVirtual: number;
  r: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

const STAR_COUNT_BASE = 70;
const STAR_COUNT_MIN = 40;
const STAR_COUNT_MAX = 110;
const STAR_RADIUS_MIN = 0.55;
const STAR_RADIUS_MAX = 1.6;
const ALPHA_MIN = 0.18;
const ALPHA_MAX = 0.45;
const TWINKLE_SPEED_MIN = 0.25;
const TWINKLE_SPEED_MAX = 0.85;
const PARALLAX_FACTOR = 0.15;
const PARALLAX_RANGE = 1.3;
const RESIZE_THROTTLE_MS = 200;
const REFERENCE_VW = 1440;
const ALPHA_BUCKETS = 8;
const FRAME_INTERVAL_MS = 1000 / 30;

function init(): void {
  const canvas = document.querySelector<HTMLCanvasElement>("canvas[class*='starfield']");
  if (!canvas) return;
  if (canvas.dataset.bound === "1") return;
  canvas.dataset.bound = "1";
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let cssWidth = 0;
  let cssHeight = 0;
  let stars: Star[] = [];

  const rand = (min: number, max: number): number => min + Math.random() * (max - min);

  const makeStar = (): Star => ({
    x: Math.random() * cssWidth,
    yVirtual: Math.random() * (cssHeight * PARALLAX_RANGE),
    r: rand(STAR_RADIUS_MIN, STAR_RADIUS_MAX),
    baseAlpha: rand(ALPHA_MIN, ALPHA_MAX),
    twinkleSpeed: rand(TWINKLE_SPEED_MIN, TWINKLE_SPEED_MAX),
    twinklePhase: Math.random() * Math.PI * 2,
  });

  const computeCount = (): number => {
    const scaled = Math.round(STAR_COUNT_BASE * (cssWidth / REFERENCE_VW));
    return Math.max(STAR_COUNT_MIN, Math.min(STAR_COUNT_MAX, scaled));
  };

  const resize = (): void => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cssWidth = window.innerWidth;
    cssHeight = window.innerHeight;
    canvas.width = Math.floor(cssWidth * dpr);
    canvas.height = Math.floor(cssHeight * dpr);
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    stars = Array.from({ length: computeCount() }, makeStar);
  };

  let resizeTimer: number | undefined;
  const onResize = (): void => {
    if (resizeTimer !== undefined) window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resize, RESIZE_THROTTLE_MS);
  };
  window.addEventListener("resize", onResize);
  resize();

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const buckets: Path2D[] = [];

  const drawFrame = (t: number, scrollY: number): void => {
    ctx.clearRect(0, 0, cssWidth, cssHeight);
    const range = cssHeight * PARALLAX_RANGE;
    const halfExcess = (range - cssHeight) / 2;
    const parallaxOffset = scrollY * PARALLAX_FACTOR;

    for (let i = 0; i < ALPHA_BUCKETS; i++) buckets[i] = new Path2D();

    for (const star of stars) {
      const twinkle = 0.6 + 0.4 * Math.sin(t * star.twinkleSpeed * Math.PI * 2 + star.twinklePhase);
      const alpha = star.baseAlpha * twinkle;
      const bucket = Math.min(ALPHA_BUCKETS - 1, (alpha * ALPHA_BUCKETS) | 0);
      let y = star.yVirtual - parallaxOffset;
      y = ((y % range) + range) % range - halfExcess;
      buckets[bucket].moveTo(star.x + star.r, y);
      buckets[bucket].arc(star.x, y, star.r, 0, Math.PI * 2);
    }

    for (let i = 0; i < ALPHA_BUCKETS; i++) {
      const a = (i + 0.5) / ALPHA_BUCKETS;
      ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
      ctx.fill(buckets[i]);
    }
  };

  if (prefersReducedMotion) {
    const drawStatic = (): void => {
      ctx.clearRect(0, 0, cssWidth, cssHeight);
      for (const star of stars) {
        ctx.fillStyle = `rgba(255,255,255,${star.baseAlpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.yVirtual % cssHeight, star.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    drawStatic();
    window.addEventListener("resize", () => {
      window.setTimeout(drawStatic, RESIZE_THROTTLE_MS + 10);
    });
    return;
  }

  let rafId = 0;
  let running = true;
  const startTime = performance.now();
  let lastFrameAt = 0;

  const loop = (now: number): void => {
    if (!running) return;
    if (now - lastFrameAt >= FRAME_INTERVAL_MS) {
      lastFrameAt = now;
      const tSec = (now - startTime) / 1000;
      drawFrame(tSec, window.scrollY || window.pageYOffset || 0);
    }
    rafId = requestAnimationFrame(loop);
  };
  rafId = requestAnimationFrame(loop);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      running = false;
      cancelAnimationFrame(rafId);
    } else if (!running) {
      running = true;
      rafId = requestAnimationFrame(loop);
    }
  });
}

init();
