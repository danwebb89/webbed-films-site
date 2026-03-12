/* ──────────────────────────────────────────────────────
   Hero Tagline Rotator — contact page
   Picks a random tagline on each page load, then
   cycles to a new random one every 30 seconds with
   a smooth crossfade.
   ────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var TAGLINES = [
    { line1: 'Got a story',              line2: 'worth telling?' },
    { line1: 'Ready to make',            line2: 'something great?' },
    { line1: 'Lights, camera,',          line2: 'conversation.' },
    { line1: 'Your vision.',             line2: 'My lens.' },
    { line1: 'The camera\u2019s ready.',      line2: 'Are you?' },
    { line1: 'Let\u2019s bring your',         line2: 'vision to life.' },
    { line1: 'Got an idea',              line2: 'that won\u2019t wait?' },
    { line1: 'Every film starts',        line2: 'with a hello.' },
    { line1: 'Your story deserves',      line2: 'the big screen.' },
    { line1: 'Let\u2019s create',             line2: 'something unforgettable.' },
    { line1: 'Got a vision?',            line2: 'Let\u2019s shoot it.' },
    { line1: 'The best stories',         line2: 'start right here.' },
    { line1: 'Ready to roll?',           line2: 'So am I.' },
    { line1: 'What\u2019s your',              line2: 'next chapter?' },
    { line1: 'Let\u2019s turn ideas',         line2: 'into frames.' },
    { line1: 'Your story,',              line2: 'my craft.' },
    { line1: 'Got something',            line2: 'worth capturing?' },
    { line1: 'Let\u2019s make',               line2: 'magic together.' },
    { line1: 'Ideas don\u2019t film',         line2: 'themselves.' },
    { line1: 'What story are you',       line2: 'dying to tell?' },
    { line1: 'Great things start',       line2: 'with a conversation.' },
    { line1: 'I\u2019m all ears.',            line2: 'And cameras.' },
    { line1: 'Drop me a line.',          line2: 'I\u2019ll make it epic.' },
    { line1: 'Ready for',                line2: 'your close-up?' },
    { line1: 'Let\u2019s talk',               line2: 'storytelling.' },
    { line1: 'Got a project',            line2: 'brewing?' },
    { line1: 'I make films.',            line2: 'You make the call.' },
    { line1: 'From concept',             line2: 'to screen.' },
    { line1: 'Let\u2019s start',              line2: 'something bold.' },
    { line1: 'Roll the intro.',          line2: 'This is your story.' },
    { line1: 'Warning:',                 line2: 'may contain goosebumps.' },
    { line1: 'I don\u2019t bite.',            line2: 'I just film things.' },
    { line1: 'No idea too weird.',       line2: 'Seriously, try me.' },
    { line1: 'You bring the story.',     line2: 'I\u2019ll bring the snacks.' },
    { line1: 'Emails welcome.',          line2: 'Carrier pigeons, less so.' },
    { line1: 'I\u2019ve been expecting',      line2: 'you. Dramatically.' },
    { line1: 'Say hello.',               line2: 'I\u2019m nicer than I look.' },
    { line1: 'This could be',            line2: 'the start of something.' },
    { line1: 'Grab a coffee.',           line2: 'Let\u2019s chat films.' },
    { line1: 'No pitch too small.',      line2: 'No dream too big.' },
    { line1: 'Think of me',              line2: 'as your film person.' },
    { line1: 'Your story won\u2019t',         line2: 'tell itself. Sadly.' },
    { line1: 'The hardest part',         line2: 'is pressing send.' },
    { line1: 'One email away',           line2: 'from something brilliant.' },
    { line1: 'I answer faster',          line2: 'than I render.' },
    { line1: 'Budgets are flexible.',    line2: 'Passion isn\u2019t.' },
    { line1: 'You had me',               line2: 'at \u201Cfilm.\u201D' },
    { line1: 'Come for the films.',      line2: 'Stay for the banter.' },
    { line1: 'Professional enough',      line2: 'to deliver. Weird enough to care.' },
    { line1: 'Less corporate.',          line2: 'More campfire.' },
    { line1: 'Got 30 seconds?',          line2: 'That\u2019s a whole trailer.' },
    { line1: 'Bring the brief.',         line2: 'I\u2019ll bring the magic.' },
    { line1: 'I don\u2019t do boring.',       line2: 'Life\u2019s too short.' },
    { line1: 'Let\u2019s make something',     line2: 'your mum would share.' },
    { line1: 'The best projects',        line2: 'start with a chat.' },
    { line1: 'Not just a filmmaker.',    line2: 'A collaborator.' },
    { line1: 'Tell me everything.',      line2: 'Or just the good bits.' },
    { line1: 'No jargon.',               line2: 'Just good film chat.' },
    { line1: 'I peak in post.',          line2: 'But the chat starts here.' },
    { line1: 'Let\u2019s skip the small talk', line2: 'and make something ace.' }
  ];

  var line1El = document.querySelector('.contact-hero-line1');
  var line2El = document.querySelector('.contact-hero-line2');
  if (!line1El || !line2El) return;

  /* ── Pick a random index, avoiding the previous one ── */
  function randomIndex(exclude) {
    var idx;
    do { idx = Math.floor(Math.random() * TAGLINES.length); } while (idx === exclude);
    return idx;
  }

  var currentIndex = randomIndex(-1);

  /* ── Apply a tagline ── */
  function applyTagline(idx) {
    var t = TAGLINES[idx];
    line1El.textContent = t.line1;
    line1El.setAttribute('data-text', t.line1);
    line2El.textContent = t.line2;
  }

  /* ── Set first tagline immediately ── */
  applyTagline(currentIndex);

  /* Start slow zoom once entrance animation finishes */
  var heroH1 = line1El.parentElement;
  setTimeout(function () {
    if (heroH1) {
      heroH1.style.animation = 'c-hero-breathe 30s ease-in-out infinite alternate';
    }
  }, 1500);

  /* ── Crossfade to a random tagline every 30s ── */
  setInterval(function () {
    currentIndex = randomIndex(currentIndex);

    /* Fade out + drift up */
    var t = 'opacity 0.8s ease, transform 0.8s ease';
    line1El.style.transition = t;
    line2El.style.transition = t;
    line1El.style.opacity = '0';
    line2El.style.opacity = '0';
    line1El.style.transform = 'scale(1.04) translateY(-8px)';
    line2El.style.transform = 'scale(1.04) translateY(-8px)';

    setTimeout(function () {
      applyTagline(currentIndex);

      /* Reset to below position */
      line1El.style.transition = 'none';
      line2El.style.transition = 'none';
      line1El.style.transform = 'scale(0.97) translateY(8px)';
      line2El.style.transform = 'scale(0.97) translateY(8px)';

      /* Force reflow then animate in */
      void line1El.offsetWidth;
      var tIn = 'opacity 0.8s ease, transform 0.8s ease';
      line1El.style.transition = tIn;
      line2El.style.transition = tIn;
      line1El.style.opacity = '1';
      line2El.style.opacity = '1';
      line1El.style.transform = 'scale(1) translateY(0)';
      line2El.style.transform = 'scale(1) translateY(0)';
    }, 800);
  }, 30000);

}());
