/* ================================================================
   flourishes.js — Webbed Films site-wide interactive flourishes
   Self-contained, no external dependencies. Degrades gracefully.
   ================================================================ */

(function () {
  'use strict';

  /* ── Page detection ─────────────────────────────────────────── */
  var isTouch = window.matchMedia('(hover: none)').matches;
  var isHome  = !!document.getElementById('bg-wrapper');    // index.html
  var isAbout = !!document.querySelector('.bio-columns');   // about.html

  /* ================================================================
     1. CUSTOM CURSOR
     Disabled on touch devices. Dot tracks instantly; ring has lag.
  ================================================================ */

  if (!isTouch) {

    /* Inject elements */
    var dot  = document.createElement('div');
    var ring = document.createElement('div');
    dot.id  = 'cursor-dot';
    ring.id = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    /* Hide default cursor via body class */
    document.documentElement.classList.add('wf-cursor-active');

    /* Track mouse position — dot follows immediately via style.left/top */
    document.addEventListener('mousemove', function (e) {
      dot.style.left  = e.clientX + 'px';
      dot.style.top   = e.clientY + 'px';
      ring.style.left = e.clientX + 'px';
      ring.style.top  = e.clientY + 'px';
      checkHover(e.target);
    });

    /* Hover state machine */
    var cursorState = 'default';

    function setCursorState(s) {
      if (s === cursorState) return;
      cursorState = s;

      if (s === 'play') {
        dot.style.opacity   = '0';
        ring.style.width    = '64px';
        ring.style.height   = '64px';
        ring.style.borderColor = 'rgba(200,169,110,0.8)';
        ring.textContent    = '▶';
      } else if (s === 'link') {
        dot.style.opacity   = '1';
        dot.style.transform = 'translate(-50%,-50%) scale(1.5)';
        ring.style.width    = '56px';
        ring.style.height   = '56px';
        ring.style.borderColor = 'var(--color-gold)';
        ring.textContent    = '';
      } else {
        dot.style.opacity   = '1';
        dot.style.transform = 'translate(-50%,-50%) scale(1)';
        ring.style.width    = '36px';
        ring.style.height   = '36px';
        ring.style.borderColor = 'rgba(200,169,110,0.5)';
        ring.textContent    = '';
      }
    }

    function checkHover(el) {
      if (!el) { setCursorState('default'); return; }
      if (el.closest('.play-target'))             setCursorState('play');
      else if (el.closest('a, button, [data-hover]')) setCursorState('link');
      else                                        setCursorState('default');
    }

    /* Mark the homepage play button as a play-target */
    if (isHome) {
      var playBtn = document.getElementById('play-btn');
      if (playBtn) playBtn.classList.add('play-target');
    }

    /* Hide cursor when leaving window */
    document.addEventListener('mouseleave', function () {
      dot.style.opacity  = '0';
      ring.style.opacity = '0';
    });
    document.addEventListener('mouseenter', function () {
      dot.style.opacity  = '1';
      ring.style.opacity = '1';
    });
  }

  /* ================================================================
     3. MAGNETIC NAV LINKS
     Document-level mousemove checks distance from each nav link.
     Within 60px: pull toward cursor max 6px. On exit: spring back.
  ================================================================ */

  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll('.main-nav a')
  );

  var MAG_RANGE = 60;
  var MAG_MAX   = 6;

  if (navLinks.length && !isTouch) {

    document.addEventListener('mousemove', function (e) {
      navLinks.forEach(function (link) {
        var rect = link.getBoundingClientRect();
        var cx   = rect.left + rect.width  / 2;
        var cy   = rect.top  + rect.height / 2;
        var dx   = e.clientX - cx;
        var dy   = e.clientY - cy;
        var dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MAG_RANGE) {
          var strength = (1 - dist / MAG_RANGE);
          var tx = (dx / MAG_RANGE) * MAG_MAX * strength * 2;
          var ty = (dy / MAG_RANGE) * MAG_MAX * strength * 2;
          tx = Math.max(-MAG_MAX, Math.min(MAG_MAX, tx));
          ty = Math.max(-MAG_MAX, Math.min(MAG_MAX, ty));

          /* No transition while tracking — silky real-time */
          link.style.transition = 'color 0.2s ease, border-color 0.2s ease';
          link.style.transform  = 'translate(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px)';
          link._inMag = true;
        } else if (link._inMag) {
          link._inMag = false;
          /* Spring back */
          link.style.transition =
            'transform 0.4s cubic-bezier(0.23,1,0.32,1), color 0.2s ease, border-color 0.2s ease';
          link.style.transform = 'translate(0,0)';
        }
      });
    });
  }

  /* ================================================================
     4. CURRENTLY EDITING STRIP
     Homepage only. Already in index.html as static HTML —
     nothing to inject here. CSS handles the appearance.
  ================================================================ */

  /* ================================================================
     5. SCROLL-LINKED TIMELINE LINE
     About page only. Injected dynamically into .bio-text.
  ================================================================ */

  if (isAbout) {
    var bioText = document.querySelector('.bio-text');

    if (bioText) {
      /* Line wrapper + fill bar */
      var tlLine = document.createElement('div');
      tlLine.className = 'bio-timeline-line';

      var tlFill = document.createElement('div');
      tlFill.className = 'bio-timeline-fill';
      tlLine.appendChild(tlFill);

      /* Insert as first child so it sits behind text content */
      bioText.insertBefore(tlLine, bioText.firstChild);

      var pulseFired = false;

      function updateTimeline() {
        var rect     = bioText.getBoundingClientRect();
        var vh       = window.innerHeight;
        /* progress: 0 when bottom of section at bottom of viewport,
                      1 when top of section at top of viewport */
        var progress = (vh - rect.top) / (vh + rect.height);
        progress = Math.max(0, Math.min(1, progress));

        tlFill.style.height = (progress * 100).toFixed(1) + '%';

        if (progress >= 0.99 && !pulseFired) {
          pulseFired = true;
          tlFill.classList.add('pulse');
          setTimeout(function () { tlFill.classList.remove('pulse'); }, 700);
        }
      }

      window.addEventListener('scroll', updateTimeline, { passive: true });
      updateTimeline();
    }
  }

  /* ================================================================
     6. PAGE TRANSITIONS
     Outgoing: fade to #0a0a0a then navigate.
     Incoming: start opaque, fade out.
     sessionStorage key: 'wf-pt' flags an in-progress transition.
  ================================================================ */

  /* Incoming — fade away overlay if we arrived via a transition */
  if (sessionStorage.getItem('wf-pt')) {
    sessionStorage.removeItem('wf-pt');

    var inOverlay = document.createElement('div');
    inOverlay.id = 'transition-overlay';
    inOverlay.classList.add('active');          /* start fully opaque */
    document.body.appendChild(inOverlay);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        inOverlay.classList.remove('active');   /* fade to transparent */
        setTimeout(function () {
          if (inOverlay.parentNode) inOverlay.parentNode.removeChild(inOverlay);
        }, 380);
      });
    });
  }

  /* Internal-link check */
  function isInternal(a) {
    var href = a.getAttribute('href') || '';
    if (!href || href === '#' || href.charAt(0) === '#') return false;
    if (a.target === '_blank') return false;
    if (href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0) return false;
    try {
      return new URL(a.href, window.location.href).hostname === window.location.hostname;
    } catch (e) {
      return false;
    }
  }

  /* Outgoing — intercept clicks on internal anchors */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a || !isInternal(a)) return;

    /* Don't intercept if modifier keys held (open in new tab etc.) */
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    e.preventDefault();
    var dest = a.href;

    /* Inject + show overlay */
    var outOverlay = document.createElement('div');
    outOverlay.id = 'transition-overlay';
    document.body.appendChild(outOverlay);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        outOverlay.classList.add('active');
      });
    });

    sessionStorage.setItem('wf-pt', '1');

    setTimeout(function () {
      window.location.href = dest;
    }, 320);
  });

}());
