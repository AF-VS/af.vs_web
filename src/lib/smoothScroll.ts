import Lenis from 'lenis';

export function initSmoothScroll(): Lenis | null {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return null;
  }

  const lenis = new Lenis({ autoRaf: true });

  document.addEventListener('click', (event) => {
    const anchor = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
    if (!anchor) return;

    const hash = anchor.getAttribute('href');
    if (!hash || hash === '#') return;

    const target = document.querySelector(hash);
    if (!target) return;

    event.preventDefault();
    lenis.scrollTo(target as HTMLElement);
    history.pushState(null, '', hash);
  });

  if (location.hash) {
    const target = document.querySelector(location.hash);
    if (target) {
      lenis.scrollTo(target as HTMLElement, { immediate: true });
    }
  }

  return lenis;
}
