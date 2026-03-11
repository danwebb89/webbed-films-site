(function () {

  /* ── Auto-mark the current page link as active ── */
  var current = window.location.pathname.split('/').pop() || 'index.html';

  /* Desktop nav + dropdown links */
  document.querySelectorAll('#site-header a').forEach(function (a) {
    var href = (a.getAttribute('href') || '').split('?')[0].split('#')[0];
    if (href && href === current) {
      a.setAttribute('aria-current', 'page');
    }
  });

  /* Mobile nav links */
  document.querySelectorAll('#mobile-nav a').forEach(function (a) {
    var href = (a.getAttribute('href') || '').split('?')[0].split('#')[0];
    if (href && href === current) {
      a.setAttribute('aria-current', 'page');
    }
  });

  /* ── Hamburger toggle ── */
  var hamburger = document.getElementById('hamburger');
  var mobileNav = document.getElementById('mobile-nav');
  var closeBtn  = document.getElementById('mobile-nav-close');

  if (!hamburger || !mobileNav) return;

  hamburger.addEventListener('click', function () {
    mobileNav.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
  });

  closeBtn.addEventListener('click', function () {
    mobileNav.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  });

  mobileNav.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      mobileNav.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

}());
