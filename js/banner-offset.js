(() => {
  const banner = document.getElementById("banner");
  if (!banner) return;

  const fixedElements = Array.from(
    document.querySelectorAll(".navbar, .lang, #scroll-progress"),
  ).filter((element) => getComputedStyle(element).position === "fixed");
  if (fixedElements.length === 0) return;

  const initialTop = new Map(
    fixedElements.map((element) => [
      element,
      Number.parseFloat(getComputedStyle(element).top) || 0,
    ]),
  );

  const updateOffsets = () => {
    const visibleHeight = Math.max(
      0,
      Math.min(banner.getBoundingClientRect().bottom, window.innerHeight),
    );

    fixedElements.forEach((element) => {
      element.style.top = `${initialTop.get(element) + visibleHeight}px`;
    });
  };

  new ResizeObserver(updateOffsets).observe(banner);
  window.addEventListener("scroll", updateOffsets, { passive: true });
  window.addEventListener("resize", updateOffsets);
  updateOffsets();
})();
