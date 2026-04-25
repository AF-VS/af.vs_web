const MAX_TILT_DEG = 6;
const MAX_YAW_DEG = 2.2;
const MAX_GLOW = 0.9;
const GLOW_FALLOFF = 1.15;
const GLOW_Y_DRIFT_PCT = 22;
const GLOW_RADIUS_PX = 360;
const REVEALED_CLASS = "is-revealed";

type Cleanup = () => void;

export function initServicesBentoMobile(grid: HTMLElement): Cleanup {
  if (typeof window === "undefined") return () => {};

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return () => {};

  const cards = Array.from(grid.querySelectorAll<HTMLElement>("[data-bento-card]"));
  if (cards.length === 0) return () => {};

  cards.forEach((card, i) => {
    card.dataset.tiltCol = String(i % 2 === 0 ? -1 : 1);
    card.setAttribute("data-glow-pulse", "");
    card.style.setProperty("--glow-radius", `${GLOW_RADIUS_PX}px`);
  });

  let rafId = 0;
  let ticking = false;
  let disposed = false;

  const update = (): void => {
    ticking = false;
    if (disposed) return;
    const vh = window.innerHeight;
    const halfVh = vh / 2;

    for (const card of cards) {
      const rect = card.getBoundingClientRect();
      if (rect.bottom < -160 || rect.top > vh + 160) continue;

      if (!card.classList.contains(REVEALED_CLASS)) continue;

      const cardCenter = rect.top + rect.height / 2;
      const p = clamp((halfVh - cardCenter) / halfVh, -1, 1);
      const col = Number(card.dataset.tiltCol ?? 0);
      const rotateX = (p * MAX_TILT_DEG).toFixed(2);
      const rotateY = (col * p * MAX_YAW_DEG).toFixed(2);
      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

      const intensity = clamp(1 - Math.abs(p) * GLOW_FALLOFF, 0, 1) * MAX_GLOW;
      const glowY = 50 - p * GLOW_Y_DRIFT_PCT;
      card.style.setProperty("--glow-intensity", intensity.toFixed(3));
      card.style.setProperty("--glow-y", `${glowY.toFixed(1)}%`);
    }
  };

  const schedule = (): void => {
    if (ticking) return;
    ticking = true;
    rafId = requestAnimationFrame(update);
  };

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });

  // Also poll via rAF for a short window after init, so the first reveal inside
  // the current viewport gets its tilt even if the user hasn't scrolled yet.
  const start = performance.now();
  const tick = (): void => {
    if (disposed) return;
    update();
    if (performance.now() - start < 2000) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  return () => {
    disposed = true;
    cancelAnimationFrame(rafId);
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
    for (const card of cards) {
      card.style.transform = "";
      card.style.removeProperty("--glow-intensity");
      card.style.removeProperty("--glow-y");
      card.style.removeProperty("--glow-radius");
      card.removeAttribute("data-glow-pulse");
      delete card.dataset.tiltCol;
    }
  };
}

function clamp(n: number, min: number, max: number): number {
  return n < min ? min : n > max ? max : n;
}
