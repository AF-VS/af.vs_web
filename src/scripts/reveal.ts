const SELECTOR = "[data-reveal]";
const GROUP_SELECTOR = "[data-reveal-group]";
const IMMEDIATE_ATTR = "data-reveal-immediate";
const REVEALED = "is-revealed";

export function initReveal(): void {
  if (typeof window === "undefined") return;

  const all = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR));
  if (all.length === 0) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    for (const el of all) el.classList.add(REVEALED);
    return;
  }

  for (const group of document.querySelectorAll<HTMLElement>(GROUP_SELECTOR)) {
    const step = Number(group.dataset.revealStagger ?? 70);
    const base = Number(group.dataset.revealDelay ?? 0);
    const items = group.querySelectorAll<HTMLElement>(`:scope > ${SELECTOR}`);
    items.forEach((el, i) => {
      if (!el.style.transitionDelay) {
        el.style.transitionDelay = `${base + i * step}ms`;
      }
    });
  }

  for (const el of all) {
    const delay = el.dataset.revealDelay;
    if (delay && !el.style.transitionDelay) {
      el.style.transitionDelay = `${delay}ms`;
    }
  }

  const immediates = all.filter((el) => el.hasAttribute(IMMEDIATE_ATTR));
  const scrollTargets = all.filter((el) => !el.hasAttribute(IMMEDIATE_ATTR));

  if (immediates.length) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        for (const el of immediates) el.classList.add(REVEALED);
      });
    });
  }

  if (scrollTargets.length === 0) return;

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        (entry.target as HTMLElement).classList.add(REVEALED);
        io.unobserve(entry.target);
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
  );

  for (const el of scrollTargets) io.observe(el);
}
