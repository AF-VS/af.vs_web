// Native smooth-scroll: `html { scroll-behavior: smooth }` + programmatic scrollIntoView.
// Respects prefers-reduced-motion.

export function initSmoothScroll(): void {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('click', (event) => {
    const anchor = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
    if (!anchor) return;

    const hash = anchor.getAttribute('href');
    if (!hash || hash === '#') return;

    const target = document.querySelector(hash);
    if (!target) return;

    event.preventDefault();
    (target as HTMLElement).scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    history.pushState(null, '', hash);
  });

  if (location.hash) {
    const target = document.querySelector(location.hash);
    if (target) {
      (target as HTMLElement).scrollIntoView({ behavior: 'auto', block: 'start' });
    }
  }
}
