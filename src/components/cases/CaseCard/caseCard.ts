const PARALLAX_MAX = 14;
const AUTOPLAY_MQ = "(hover: none), (max-width: 767px)";

export function initCaseHover(): void {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const autoplayMode = window.matchMedia(AUTOPLAY_MQ).matches;

  const autoplayCards: Array<{ card: HTMLElement; video: HTMLVideoElement }> = [];

  document.querySelectorAll<HTMLElement>("[data-case-hover]").forEach((card) => {
    if (card.dataset.caseHoverBound === "1") return;
    card.dataset.caseHoverBound = "1";
    const video = card.querySelector<HTMLVideoElement>("[data-case-video]");
    if (video && !reduced) {
      const play = () => {
        video.play()
          .then(() => card.setAttribute("data-case-playing", "true"))
          .catch(() => {});
      };
      const stop = () => {
        video.pause();
        video.currentTime = 0;
        card.removeAttribute("data-case-playing");
      };

      if (autoplayMode) {
        autoplayCards.push({ card, video });
      } else {
        card.addEventListener("mouseenter", play);
        card.addEventListener("mouseleave", stop);
        card.addEventListener("focusin", play);
        card.addEventListener("focusout", stop);
      }
    }

    if (card.hasAttribute("data-case-parallax") && !reduced && !autoplayMode) {
      let frame = 0;
      const onMove = (e: MouseEvent) => {
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          const rect = card.getBoundingClientRect();
          const nx = (e.clientX - rect.left) / rect.width - 0.5;
          const ny = (e.clientY - rect.top) / rect.height - 0.5;
          card.style.setProperty("--tx", `${(-nx * PARALLAX_MAX).toFixed(2)}px`);
          card.style.setProperty("--ty", `${(-ny * PARALLAX_MAX).toFixed(2)}px`);
        });
      };
      const reset = () => {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        card.style.setProperty("--tx", "0px");
        card.style.setProperty("--ty", "0px");
      };
      card.addEventListener("mousemove", onMove);
      card.addEventListener("mouseleave", reset);
    }
  });

  if (autoplayCards.length === 0) return;

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const target = entry.target as HTMLElement;
        const pair = autoplayCards.find((p) => p.card === target);
        if (!pair) continue;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
          pair.video.play()
            .then(() => target.setAttribute("data-case-playing", "true"))
            .catch(() => {});
        } else {
          if (!pair.video.paused) pair.video.pause();
          target.removeAttribute("data-case-playing");
        }
      }
    },
    { threshold: [0, 0.6, 0.9] },
  );

  for (const { card } of autoplayCards) io.observe(card);
}
