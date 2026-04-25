export function initDrawer(): void {
  const drawer = document.querySelector<HTMLDivElement>("[data-drawer]");
  const burger = document.querySelector<HTMLButtonElement>("[data-burger]");
  const closeBtn = document.querySelector<HTMLButtonElement>("[data-drawer-close]");
  const links = document.querySelectorAll<HTMLAnchorElement>("[data-drawer-link]");
  if (!drawer || !burger) return;
  if (drawer.dataset.bound === "1") return;
  drawer.dataset.bound = "1";

  const open = (): void => {
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };
  const close = (): void => {
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  burger.addEventListener("click", open);
  closeBtn?.addEventListener("click", close);
  drawer.addEventListener("click", (e) => {
    if (e.target === drawer) close();
  });
  links.forEach((a) => a.addEventListener("click", () => setTimeout(close, 100)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer.classList.contains("open")) close();
  });
}
