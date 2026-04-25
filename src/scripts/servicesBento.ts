import { animate } from "motion";

const DEFAULT_PARTICLE_COUNT = 10;
const DEFAULT_SPOTLIGHT_RADIUS = 320;
const DEFAULT_GLOW_COLOR = "106, 184, 237";
const MOBILE_BREAKPOINT = 768;

interface BentoOptions {
  particleCount?: number;
  spotlightRadius?: number;
  glowColor?: string;
  enableMagnetism?: boolean;
  enableStars?: boolean;
  enableSpotlight?: boolean;
  enableBorderGlow?: boolean;
  enableTilt?: boolean;
  clickEffect?: boolean;
}

type Cleanup = () => void;

const noop: Cleanup = () => undefined;

export function initServicesBento(grid: HTMLElement, options: BentoOptions = {}): Cleanup {
  if (typeof window === "undefined") return noop;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
  if (reduced || isMobile) return noop;

  const {
    particleCount = DEFAULT_PARTICLE_COUNT,
    spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
    glowColor = DEFAULT_GLOW_COLOR,
    enableMagnetism = true,
    enableStars = true,
    enableSpotlight = true,
    enableBorderGlow = true,
    enableTilt = true,
    clickEffect = true,
  } = options;

  const cards = Array.from(grid.querySelectorAll<HTMLElement>("[data-bento-card]"));
  if (cards.length === 0) return noop;

  const cleanups: Cleanup[] = [];

  for (const card of cards) {
    cleanups.push(
      attachCard(card, { particleCount, glowColor, enableStars, enableMagnetism, enableTilt, clickEffect }),
    );
  }

  if (enableSpotlight || enableBorderGlow) {
    cleanups.push(attachCursor(grid, cards, spotlightRadius, glowColor, enableSpotlight, enableBorderGlow));
  }

  return () => {
    for (const fn of cleanups) fn();
  };
}

interface CardOptions {
  particleCount: number;
  glowColor: string;
  enableStars: boolean;
  enableMagnetism: boolean;
  enableTilt: boolean;
  clickEffect: boolean;
}

const TILT_MAX_DEG = 10;

const EASE_BACK_OUT: [number, number, number, number] = [0.34, 1.56, 0.64, 1];
const EASE_BACK_IN: [number, number, number, number] = [0.36, 0, 0.66, -0.56];

function attachCard(card: HTMLElement, opts: CardOptions): Cleanup {
  const { particleCount, glowColor, enableStars, enableMagnetism, enableTilt, clickEffect } = opts;

  const timeouts: ReturnType<typeof setTimeout>[] = [];
  const particles: HTMLElement[] = [];
  let hovered = false;

  const spawnParticles = (): void => {
    const rect = card.getBoundingClientRect();
    for (let i = 0; i < particleCount; i++) {
      const id = setTimeout(() => {
        if (!hovered) return;

        const el = document.createElement("span");
        el.style.cssText = `position:absolute;width:4px;height:4px;border-radius:50%;background:rgba(${glowColor},1);box-shadow:0 0 6px rgba(${glowColor},0.6);pointer-events:none;z-index:2;left:${Math.random() * rect.width}px;top:${Math.random() * rect.height}px;will-change:transform,opacity;opacity:0;transform:scale(0);`;
        card.appendChild(el);
        particles.push(el);

        animate(
          el,
          { scale: [0, 1], opacity: [0, 1] },
          { duration: 0.3, ease: EASE_BACK_OUT },
        );
        animate(
          el,
          {
            x: [0, (Math.random() - 0.5) * 100],
            y: [0, (Math.random() - 0.5) * 100],
            rotate: [0, Math.random() * 360],
          },
          {
            duration: 2 + Math.random() * 2,
            ease: "linear",
            repeat: Infinity,
            repeatType: "reverse",
          },
        );
        animate(
          el,
          { opacity: [1, 0.3] },
          {
            duration: 1.5,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse",
          },
        );
      }, i * 100);
      timeouts.push(id);
    }
  };

  const clearParticles = (): void => {
    for (const id of timeouts) clearTimeout(id);
    timeouts.length = 0;
    const toRemove = particles.splice(0, particles.length);
    for (const p of toRemove) {
      animate(
        p,
        { scale: 0, opacity: 0 },
        { duration: 0.3, ease: EASE_BACK_IN },
      ).then(() => {
        p.parentNode?.removeChild(p);
      });
    }
  };

  const onEnter = (): void => {
    hovered = true;
    if (enableStars) spawnParticles();
  };

  const onLeave = (): void => {
    hovered = false;
    if (enableStars) clearParticles();
    if (enableMagnetism) {
      animate(card, { x: 0, y: 0 }, { duration: 0.35, ease: "easeOut" });
    }
    if (enableTilt) {
      animate(card, { rotateX: 0, rotateY: 0 }, { duration: 0.3, ease: "easeOut" });
    }
    card.style.setProperty("--glow-intensity", "0");
  };

  const onMove = (e: MouseEvent): void => {
    if (!enableMagnetism && !enableTilt) return;
    const rect = card.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;

    if (enableMagnetism) {
      const dx = (localX - cx) * 0.05;
      const dy = (localY - cy) * 0.05;
      animate(card, { x: dx, y: dy }, { duration: 0.3, ease: "easeOut" });
    }
    if (enableTilt) {
      const rotateX = ((localY - cy) / cy) * -TILT_MAX_DEG;
      const rotateY = ((localX - cx) / cx) * TILT_MAX_DEG;
      animate(card, { rotateX, rotateY }, { duration: 0.1, ease: "easeOut" });
    }
  };

  const onClick = (e: MouseEvent): void => {
    if (!clickEffect) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const max = Math.max(
      Math.hypot(x, y),
      Math.hypot(x - rect.width, y),
      Math.hypot(x, y - rect.height),
      Math.hypot(x - rect.width, y - rect.height),
    );

    const ripple = document.createElement("span");
    ripple.style.cssText = `position:absolute;width:${max * 2}px;height:${max * 2}px;border-radius:50%;left:${x - max}px;top:${y - max}px;pointer-events:none;z-index:3;background:radial-gradient(circle,rgba(${glowColor},0.35) 0%,rgba(${glowColor},0.18) 30%,transparent 70%);opacity:1;transform:scale(0);will-change:transform,opacity;`;
    card.appendChild(ripple);

    animate(
      ripple,
      { scale: [0, 1], opacity: [1, 0] },
      { duration: 0.8, ease: "easeOut" },
    ).then(() => {
      ripple.remove();
    });
  };

  card.addEventListener("mouseenter", onEnter);
  card.addEventListener("mouseleave", onLeave);
  card.addEventListener("mousemove", onMove);
  card.addEventListener("click", onClick);

  return () => {
    card.removeEventListener("mouseenter", onEnter);
    card.removeEventListener("mouseleave", onLeave);
    card.removeEventListener("mousemove", onMove);
    card.removeEventListener("click", onClick);
    clearParticles();
  };
}

function attachCursor(
  section: HTMLElement,
  cards: HTMLElement[],
  radius: number,
  glowColor: string,
  enableSpotlight: boolean,
  enableBorderGlow: boolean,
): Cleanup {
  let spot: HTMLDivElement | null = null;
  if (enableSpotlight) {
    spot = document.createElement("div");
    spot.style.cssText = `position:fixed;left:0;top:0;width:800px;height:800px;border-radius:50%;pointer-events:none;transform:translate3d(-9999px,-9999px,0);opacity:0;z-index:30;mix-blend-mode:screen;will-change:transform,opacity;background:radial-gradient(circle,rgba(${glowColor},0.15) 0%,rgba(${glowColor},0.08) 15%,rgba(${glowColor},0.04) 25%,rgba(${glowColor},0.02) 40%,rgba(${glowColor},0.01) 65%,transparent 70%);`;
    document.body.appendChild(spot);
  }

  const proximity = radius * 0.5;
  const fade = radius * 0.75;

  const resetGlows = (): void => {
    if (!enableBorderGlow) return;
    for (const c of cards) c.style.setProperty("--glow-intensity", "0");
  };

  const onMove = (e: MouseEvent): void => {
    const rect = section.getBoundingClientRect();
    const inside =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;

    if (!inside) {
      if (spot) animate(spot, { opacity: 0 }, { duration: 0.3, ease: "easeOut" });
      resetGlows();
      return;
    }

    let minDist = Infinity;
    for (const c of cards) {
      const cr = c.getBoundingClientRect();
      const cx = cr.left + cr.width / 2;
      const cy = cr.top + cr.height / 2;
      const distance = Math.max(
        0,
        Math.hypot(e.clientX - cx, e.clientY - cy) - Math.max(cr.width, cr.height) / 2,
      );
      minDist = Math.min(minDist, distance);

      if (enableBorderGlow) {
        let glow = 0;
        if (distance <= proximity) glow = 1;
        else if (distance <= fade) glow = (fade - distance) / (fade - proximity);

        const rx = ((e.clientX - cr.left) / cr.width) * 100;
        const ry = ((e.clientY - cr.top) / cr.height) * 100;
        c.style.setProperty("--glow-x", `${rx}%`);
        c.style.setProperty("--glow-y", `${ry}%`);
        c.style.setProperty("--glow-intensity", glow.toString());
        c.style.setProperty("--glow-radius", `${radius}px`);
      }
    }

    if (spot) {
      spot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      const targetOpacity =
        minDist <= proximity
          ? 0.8
          : minDist <= fade
            ? ((fade - minDist) / (fade - proximity)) * 0.8
            : 0;
      animate(
        spot,
        { opacity: targetOpacity },
        { duration: targetOpacity > 0 ? 0.2 : 0.5, ease: "easeOut" },
      );
    }
  };

  const onDocLeave = (): void => {
    if (spot) animate(spot, { opacity: 0 }, { duration: 0.3, ease: "easeOut" });
    resetGlows();
  };

  document.addEventListener("mousemove", onMove);
  document.addEventListener("mouseleave", onDocLeave);

  return () => {
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseleave", onDocLeave);
    spot?.remove();
  };
}
