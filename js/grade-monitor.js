/**
 * Grade Monitor — shared timeline UI for category pages
 *
 * Reads config from window.GRADE_CONFIG:
 *   { category: 'shorts', colors: [...], label: 'SHORTS' }
 */
(function () {
  'use strict';

  var CONFIG = window.GRADE_CONFIG || {};
  var PAGE_CATEGORY = CONFIG.category || 'shorts';
  var CLIP_COLORS = CONFIG.colors || ['#74b9ff', '#55efc4', '#ffeaa7', '#fd79a8', '#e17055', '#a29bfe', '#00cec9'];
  var TRACK_LABEL = CONFIG.label || 'SHORTS';

  var phX = 0, phMax = 1600, phPaused = false;
  var clipData = [], kbIndex = -1;
  var activeIdleIndex = -1, isHovering = false;

  function initNoise () {
    var canvas = document.getElementById('monitor-canvas');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    function resize () {
      canvas.width  = canvas.offsetWidth  || canvas.parentElement.offsetWidth  || 800;
      canvas.height = canvas.offsetHeight || canvas.parentElement.offsetHeight || 400;
    }
    resize();
    window.addEventListener('resize', resize);
    function draw () {
      var w = canvas.width, h = canvas.height;
      if (!w || !h) { requestAnimationFrame(draw); return; }
      var img = ctx.createImageData(w, h), d = img.data;
      for (var i = 0; i < d.length; i += 4) {
        var v = (Math.random() * 255) | 0;
        d[i] = d[i+1] = d[i+2] = v; d[i+3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      requestAnimationFrame(draw);
    }
    draw();
  }

  function initTimecode () {
    var el = document.getElementById('timecode');
    if (!el) return;
    var FPS = 25, frame = 0;
    function pad (n) { return ('0' + n).slice(-2); }
    function tick () {
      frame++;
      el.textContent = pad(Math.floor(frame / (FPS*3600)) % 24) + ':' +
                       pad(Math.floor(frame / (FPS*60)) % 60) + ':' +
                       pad(Math.floor(frame / FPS) % 60) + ':' +
                       pad(frame % FPS);
      requestAnimationFrame(tick);
    }
    tick();
    var dot = document.getElementById('rec-dot');
    if (dot) dot.classList.add('blinking');
  }

  var IMG_EXTS = ['webp', 'jpg', 'png', 'avif'];

  function loadImage (title, onSuccess, onFail) {
    var i = 0;
    var paths = ['assets/images/800w/', 'assets/images/'];
    var p = 0;
    function tryNext () {
      if (i >= IMG_EXTS.length) {
        i = 0; p++;
        if (p >= paths.length) { if (onFail) onFail(); return; }
      }
      var img = new Image();
      img.onload = function () { onSuccess(img.src); };
      img.onerror = function () { i++; tryNext(); };
      img.src = paths[p] + title + '.' + IMG_EXTS[i];
    }
    tryNext();
  }

  function buildTimeline (clips) {
    var lanesEl    = document.getElementById('track-lanes');
    var rulerEl    = document.getElementById('tc-ruler');
    var mobileList = document.getElementById('mobile-track-list');
    var sbCount    = document.getElementById('sb-count');
    var playhead   = document.getElementById('playhead');

    var lane = document.createElement('div');
    lane.className = 'track-lane';

    clips.forEach(function (clip, i) {
      var color = CLIP_COLORS[i % CLIP_COLORS.length];
      var block = document.createElement('div');
      block.className = 'clip-block';
      block.style.background = 'linear-gradient(180deg, ' + color + '44 0%, ' + color + '18 100%)';
      block.style.borderLeft = '3px solid ' + color;
      block.dataset.slug     = clip.slug;
      block.title            = clip.title;

      (function (b, title, c) {
        loadImage(title, function (src) {
          b.style.backgroundImage = 'linear-gradient(180deg, ' + c + 'cc 0%, ' + c + '88 100%), url("' + src + '")';
          b.style.backgroundSize = 'auto, cover';
          b.style.backgroundPosition = 'center, center';
        });
      })(block, clip.title, color);

      block.addEventListener('mouseenter', function () { hoverClip(clip, block, color); });
      block.addEventListener('mouseleave', function () { clearHover(block); });
      block.addEventListener('click', function () {
        if (clip.link) window.open(clip.link, '_blank', 'noopener,noreferrer');
      });
      lane.appendChild(block);
      clipData.push({ clip: clip, el: block, color: color });
    });

    lanesEl.insertBefore(lane, playhead);

    var pillWrap = document.createElement('div');
    pillWrap.className = 'mobile-clips-wrap';
    clips.forEach(function (clip, i) {
      var color = CLIP_COLORS[i % CLIP_COLORS.length];
      var pill = document.createElement('div');
      pill.className = 'mobile-clip-pill';
      pill.style.background  = color + '33';
      pill.style.borderLeft  = '3px solid ' + color;
      pill.textContent       = clip.title;
      pill.addEventListener('mouseenter', function () { hoverClip(clip, pill, color); });
      pill.addEventListener('mouseleave', function () { clearHover(pill); });
      pill.addEventListener('click', function () {
        if (clip.link) window.open(clip.link, '_blank', 'noopener,noreferrer');
      });
      pillWrap.appendChild(pill);
    });
    mobileList.appendChild(pillWrap);

    if (sbCount) {
      sbCount.innerHTML = '<em>' + clips.length + '</em>\u00a0' + TRACK_LABEL + ' PROJECTS';
    }

    requestAnimationFrame(function () {
      var w = lanesEl.offsetWidth || 1600;
      phMax = w;
      buildRuler(rulerEl, w);
    });
  }

  function buildRuler (rulerEl, totalWidth) {
    var count = 22, every = totalWidth / count;
    for (var i = 1; i < count; i++) {
      var x = every * i;
      var secs = Math.round(i * 3.2);
      var mark = document.createElement('span');
      mark.className = 'tc-mark'; mark.style.left = x + 'px';
      mark.textContent = ('0' + Math.floor(secs / 60)).slice(-2) + ':' +
                         ('0' + (secs % 60)).slice(-2) + ':00';
      rulerEl.appendChild(mark);
      var tick = document.createElement('div');
      tick.className = 'tc-tick tc-tick-major'; tick.style.left = x + 'px';
      rulerEl.appendChild(tick);
    }
  }

  function hoverClip (clip, el, color) {
    isHovering = true;
    var t = document.getElementById('hover-title');
    if (t) t.textContent = clip.title;
    var sub = document.getElementById('hover-subtitle');
    if (sub) sub.textContent = clip.link ? 'WATCH \u25B6' : 'AVAILABLE ON REQUEST';
    var h = document.getElementById('monitor-hover');
    if (h) h.style.opacity = '1';
    if (el) el.classList.add('active');

    phPaused = true;
    var ph = document.getElementById('playhead');
    if (ph && el && el.classList.contains('clip-block')) {
      phX = el.offsetLeft + el.offsetWidth / 2;
      ph.style.left = phX + 'px';
    }

    var wash = document.getElementById('monitor-idle-wash');
    if (wash) wash.style.opacity = '0';

    var thumb = document.getElementById('monitor-thumb-bg');
    if (thumb) {
      thumb.classList.remove('kb-active');
      void thumb.offsetWidth;
      loadImage(clip.title, function (src) {
        thumb.style.backgroundImage = 'url("' + src + '")';
        thumb.style.opacity = '1';
        thumb.classList.add('kb-active');
      }, function () { thumb.style.opacity = '0'; });
    }

    var glow = document.getElementById('monitor-glow');
    if (glow && color) {
      glow.style.background = 'radial-gradient(ellipse at center bottom, ' + color + '44 0%, transparent 70%)';
      glow.style.opacity = '1';
    }

    var canvas = document.getElementById('monitor-canvas');
    if (canvas) canvas.style.opacity = '0.02';
  }

  function clearHover (el) {
    isHovering = false;
    if (el) el.classList.remove('active');
    phPaused = false;
    activeIdleIndex = -1;
    var canvas = document.getElementById('monitor-canvas');
    if (canvas) canvas.style.opacity = '0.055';
    var wash = document.getElementById('monitor-idle-wash');
    if (wash) wash.style.opacity = '1';
  }

  function showIdleClip (idx) {
    if (idx === activeIdleIndex || isHovering) return;
    activeIdleIndex = idx;
    var d = clipData[idx];
    if (!d) return;

    var thumb = document.getElementById('monitor-thumb-bg');
    if (!thumb) return;
    thumb.classList.remove('kb-active');
    void thumb.offsetWidth;

    var title = d.clip.title;
    loadImage(title, function (src) {
      if (isHovering) return;
      thumb.style.backgroundImage = 'url("' + src + '")';
      thumb.style.opacity = '0.6';
      thumb.classList.add('kb-active');
    });

    var glow = document.getElementById('monitor-glow');
    if (glow) {
      glow.style.background = 'radial-gradient(ellipse at center bottom, ' + d.color + '22 0%, transparent 70%)';
      glow.style.opacity = '1';
    }

    var hover = document.getElementById('monitor-hover');
    if (hover) hover.style.opacity = '1';
    var ht = document.getElementById('hover-title');
    if (ht) ht.textContent = d.clip.title;
    var sub = document.getElementById('hover-subtitle');
    if (sub) sub.textContent = d.clip.link ? 'WATCH \u25B6' : 'AVAILABLE ON REQUEST';
  }

  function getClipAtPlayhead () {
    for (var i = 0; i < clipData.length; i++) {
      var el = clipData[i].el;
      var left = el.offsetLeft;
      var right = left + el.offsetWidth;
      if (phX >= left && phX < right) return i;
    }
    return -1;
  }

  function startPlayhead () {
    var ph = document.getElementById('playhead'), speed = 0.3;
    function step () {
      if (!phPaused) {
        phX = (phX + speed) % (phMax || 1600);
        if (ph) ph.style.left = phX + 'px';
        var idx = getClipAtPlayhead();
        if (idx >= 0) showIdleClip(idx);
      }
      requestAnimationFrame(step);
    }
    step();
  }

  function initDragScroll () {
    var el = document.getElementById('timeline-scroll');
    if (!el) return;
    var down = false, startX, initScroll;
    el.addEventListener('mousedown', function (e) {
      if (e.target.closest('.clip-block')) return;
      down = true; startX = e.pageX - el.offsetLeft; initScroll = el.scrollLeft;
      el.style.cursor = 'grabbing';
    });
    window.addEventListener('mouseup', function () {
      if (!down) return; down = false;
      var s = document.getElementById('timeline-scroll'); if (s) s.style.cursor = '';
    });
    el.addEventListener('mousemove', function (e) {
      if (!down) return; e.preventDefault();
      el.scrollLeft = initScroll - ((e.pageX - el.offsetLeft) - startX) * 1.1;
    });
  }

  function initAnimations () {
    setTimeout(function () { var t = document.getElementById('timeline-panel'); if (t) t.classList.add('is-visible'); }, 300);
    setTimeout(function () { var m = document.getElementById('monitor'); if (m) m.classList.add('is-visible'); }, 500);
    setTimeout(function () {
      document.querySelectorAll('.corner').forEach(function (c) { c.style.transition = 'opacity 0.5s ease'; c.style.opacity = '1'; });
    }, 700);
  }

  initNoise(); initTimecode(); initAnimations(); initDragScroll();

  fetch('data/portfolio.json')
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function (data) {
      buildTimeline(data[PAGE_CATEGORY] || []);
      startPlayhead();
    })
    .catch(function () {
      startPlayhead();
      var sb = document.getElementById('sb-count');
      if (sb) sb.textContent = TRACK_LABEL + ' PROJECTS';
    });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    if (!clipData.length) return;
    e.preventDefault();
    document.querySelectorAll('.clip-block.active').forEach(function (b) { b.classList.remove('active'); });
    if (e.key === 'ArrowRight') {
      kbIndex = (kbIndex + 1) % clipData.length;
    } else {
      kbIndex = kbIndex <= 0 ? clipData.length - 1 : kbIndex - 1;
    }
    var d = clipData[kbIndex];
    hoverClip(d.clip, d.el, d.color);
  });

}());
