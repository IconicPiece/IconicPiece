// =========================================================
// ICONIC PEACE — Behavior
// 1. Animated black/white noise canvases (mix-blend-mode: difference)
// 2. Scroll-triggered reveal animations (IntersectionObserver)
// 3. Lightweight scroll parallax for hero + large photography section
// =========================================================

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------------------------------------------------------
  // 1. Noise canvases
  // ---------------------------------------------------------
  function initNoise(canvas) {
    var ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    var animationFrameId;
    var resizeTimeout;

    function resize() {
      // Scale down canvas for performance and chunkier grain
      canvas.width = window.innerWidth / 2;
      canvas.height = window.innerHeight / 2;
    }

    function draw() {
      var w = canvas.width;
      var h = canvas.height;
      var idata = ctx.createImageData(w, h);
      var buffer32 = new Uint32Array(idata.data.buffer);
      var len = buffer32.length;

      for (var i = 0; i < len; i++) {
        buffer32[i] = Math.random() < 0.5 ? 0xff000000 : 0xffffffff;
      }

      ctx.putImageData(idata, 0, 0);
      animationFrameId = requestAnimationFrame(draw);
    }

    window.addEventListener("resize", function () {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resize, 100);
    });

    resize();

    if (!reduceMotion) {
      draw();
    } else {
      // Draw a single still frame instead of animating
      draw();
      cancelAnimationFrame(animationFrameId);
    }
  }

  document.querySelectorAll("[data-noise]").forEach(initNoise);

  // ---------------------------------------------------------
  // 2. Scroll-triggered reveals
  // ---------------------------------------------------------
  var revealEls = document.querySelectorAll(
    ".fade-in, .reveal-blur, .reveal-fade-late, .scale-in"
  );

  if ("IntersectionObserver" in window && !reduceMotion) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            var delay = el.getAttribute("data-delay");
            if (delay) {
              el.style.transitionDelay = delay + "s";
            }
            el.classList.add("is-visible");
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.1, rootMargin: "-100px 0px" }
    );

    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // No IntersectionObserver support, or reduced motion: show everything immediately
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  // ---------------------------------------------------------
  // 3. Scroll parallax (hero title drift + large photography drift)
  // ---------------------------------------------------------
  if (!reduceMotion) {
    var heroInner = document.querySelector(".hero-inner");
    var parallaxEls = document.querySelectorAll("[data-parallax]");
    var ticking = false;

    function updateParallax() {
      var scrollY = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? scrollY / docHeight : 0;

      if (heroInner) {
        // Hero drifts down to 30% of its section as the page scrolls
        var heroOffset = progress * 30;
        heroInner.style.transform = "translateY(" + heroOffset + "%)";
      }

      parallaxEls.forEach(function (el) {
        var factor = parseFloat(el.getAttribute("data-parallax")) || 0.15;
        var offset = progress * factor * 100;
        el.style.transform = "translateY(" + offset + "%)";
      });

      ticking = false;
    }

    window.addEventListener("scroll", function () {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    });

    updateParallax();
  }
})();
