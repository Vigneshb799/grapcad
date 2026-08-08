// ==============================================================
// HOMEPAGE 3D / TRENDING EFFECTS (index.html only)
// ==============================================================
// Lightweight, CSS-transform-only motion: 3D tilt on cards, magnetic
// hero glow + floating stat chips. No animation library, no layout
// properties touched (transform/opacity only, GPU-composited).
//
// Skips everything for touch devices (tilt needs a real pointer) and
// for users who've asked for less motion — both checked once up front.
// ==============================================================

(function () {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (prefersReducedMotion || !canHover) return;

  // ---- 3D tilt on cards (course cards, testimonials, google reviews, gallery) ----
  // Delegated on the document so it also picks up the Google review cards
  // that render in asynchronously after the Places API call resolves.
  let activeTiltCard = null;

  function tilt(card, clientX, clientY) {
    const rect = card.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const maxTilt = parseFloat(card.dataset.tiltMax || "8");
    const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * maxTilt;
    const rotateX = -((y - rect.height / 2) / (rect.height / 2)) * maxTilt;
    const isImage = card.tagName === "IMG";

    card.style.transform = isImage
      ? `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.04)`
      : `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;

    card.style.setProperty("--glare-x", `${(x / rect.width) * 100}%`);
    card.style.setProperty("--glare-y", `${(y / rect.height) * 100}%`);
  }

  function resetTilt(card) {
    card.style.transform = "";
  }

  document.addEventListener("pointermove", (e) => {
    const card = e.target.closest(".tilt-card");

    if (card !== activeTiltCard && activeTiltCard) {
      resetTilt(activeTiltCard);
      activeTiltCard = null;
    }

    if (card) {
      tilt(card, e.clientX, e.clientY);
      activeTiltCard = card;
    }
  });

  document.addEventListener("mouseleave", () => {
    if (activeTiltCard) {
      resetTilt(activeTiltCard);
      activeTiltCard = null;
    }
  });

  // ---- Magnetic buttons ----
  document.querySelectorAll(".magnetic-btn").forEach((btn) => {
    btn.addEventListener("pointermove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.3}px)`;
    });

    btn.addEventListener("pointerleave", () => {
      btn.style.transform = "";
    });
  });

  // ---- Hero: cursor glow + parallax floating chips ----
  const hero = document.querySelector(".hero");
  const heroLayer = document.querySelector(".hero-3d-layer");
  const glow = document.querySelector(".hero-glow");
  const chipWraps = document.querySelectorAll(".float-chip-wrap");

  if (hero && heroLayer) {
    let raf = null;

    hero.addEventListener("pointerenter", () => heroLayer.classList.add("is-active"));
    hero.addEventListener("pointerleave", () => heroLayer.classList.remove("is-active"));

    hero.addEventListener("pointermove", (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const rect = hero.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (glow) {
          glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        }

        const cx = rect.width / 2;
        const cy = rect.height / 2;

        chipWraps.forEach((wrap) => {
          const depth = parseFloat(wrap.dataset.depth || "1");
          const dx = ((x - cx) / cx) * 10 * depth;
          const dy = ((y - cy) / cy) * 10 * depth;
          wrap.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
        });

        raf = null;
      });
    });
  }
})();
