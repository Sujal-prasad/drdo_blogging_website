/* =========================================================
   MASCOT ANIMATION
   - pupils follow the cursor (eyes peek over the book)
   - the cat lifts its book to cover its eyes on password focus
   ========================================================= */

(function () {
  const svg = document.querySelector(".mascot");
  if (!svg) return;

  const pupils = [
    { el: document.getElementById("pupilL"), baseX: 96,  baseY: 92 },
    { el: document.getElementById("pupilR"), baseX: 144, baseY: 92 }
  ];
  const MAX_SHIFT = 6; // how far the pupil can travel inside the eye

  // Convert a screen point to the SVG's internal coordinate system so the
  // pupils aim accurately regardless of how the SVG is scaled/positioned.
  function toSvgPoint(clientX, clientY) {
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }

  let covering = false;

  window.addEventListener("mousemove", (e) => {
    if (covering) return; // eyes are hidden behind the book
    const p = toSvgPoint(e.clientX, e.clientY);
    pupils.forEach((pupil) => {
      const dx = p.x - pupil.baseX;
      const dy = p.y - pupil.baseY;
      const dist = Math.hypot(dx, dy) || 1;
      const shift = Math.min(MAX_SHIFT, dist);
      const x = (dx / dist) * shift;
      const y = (dy / dist) * shift;
      pupil.el.setAttribute("transform", `translate(${x}, ${y})`);
    });
  });

  /* ---- The cat lifts its book to hide its eyes on password focus ---- */
  const hasGSAP = typeof window.gsap !== "undefined";
  const book = document.getElementById("book");
  const LIFT = -66; // how far up the book travels to cover the eyes

  function coverEyes() {
    covering = true;
    // recentre pupils so they're tidy behind the book
    pupils.forEach((p) => p.el.setAttribute("transform", "translate(0,0)"));
    if (hasGSAP) {
      gsap.to(book, { y: LIFT, rotation: 2, transformOrigin: "50% 100%", duration: 0.45, ease: "back.out(1.5)" });
    } else if (book) {
      book.setAttribute("transform", `translate(0, ${LIFT})`);
    }
  }

  function uncoverEyes() {
    if (hasGSAP) {
      gsap.to(book, { y: 0, rotation: 0, duration: 0.4, ease: "power2.inOut" });
    } else if (book) {
      book.setAttribute("transform", "translate(0,0)");
    }
    covering = false;
  }

  // Expose so auth.js can bind these to whichever password field is visible.
  window.MascotEyes = { coverEyes, uncoverEyes };

  // Auto-bind to any current/future password inputs on the page.
  function bindPasswordFields() {
    document.querySelectorAll('input[type="password"]').forEach((inp) => {
      if (inp.dataset.mascotBound) return;
      inp.dataset.mascotBound = "1";
      inp.addEventListener("focus", coverEyes);
      inp.addEventListener("blur", uncoverEyes);
    });
  }
  bindPasswordFields();
  window.MascotEyes.rebind = bindPasswordFields;
})();
