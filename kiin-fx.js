/* KIIN micro-interactions: hero scan, QA log, card cursor label, copy email.
   Everything is visible without this script; it only adds motion on top. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktop = matchMedia('(min-width: 810px)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');

  // Copy email buttons (home hero, case studies).
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-copy]');
    if (!button) return;
    const value = button.getAttribute('data-copy');
    const label = button.textContent;
    const done = ok => {
      button.textContent = ok ? 'Copied ✓' : value;
      button.classList.toggle('is-copied', ok);
      setTimeout(() => { button.textContent = label; button.classList.remove('is-copied'); }, 1800);
    };
    try { navigator.clipboard.writeText(value).then(() => done(true), () => done(false)); } catch { done(false); }
  });

  // Desktop hero intro: Framer hydration owns #hero, so insert after it settles and restore if removed.
  let logPlayed = false;
  const playLog = () => {
    const log = document.querySelector('.qa-log ol');
    if (!log || logPlayed) return;
    logPlayed = true;
    if (reduce) { [...log.children].forEach(line => line.classList.add('is-in')); return; }
    [...log.children].forEach((line, i) => setTimeout(() => line.classList.add('is-in'), 350 + i * 240));
  };
  const placeHero = () => {
    const hero = document.getElementById('hero'), tpl = document.getElementById('kiin-hero-template');
    if (!hero || !tpl || hero.querySelector('.qa-hero-intro')) return;
    hero.append(tpl.content.cloneNode(true));
    if (logPlayed) hero.querySelectorAll('.qa-log li').forEach(line => line.classList.add('is-in'));
    else playLog();
  };
  placeHero();
  const heroWatch = new MutationObserver(placeHero);
  heroWatch.observe(document.body, {childList: true, subtree: true});
  setTimeout(() => heroWatch.disconnect(), 8000);
  addEventListener('load', placeHero);

  if (reduce) return;
  document.documentElement.classList.add('fx-on');

  // One scan pass across the black title block, ending with a PASSED stamp.
  const addScan = () => {
    if (!desktop.matches || document.querySelector('.qa-scan')) return;
    const title = document.querySelector('#hero .framer-1lklpse-container');
    if (!title || title.getBoundingClientRect().width < 200) return;
    if (getComputedStyle(title).position === 'static') title.style.position = 'relative';
    const scan = document.createElement('div');
    scan.className = 'qa-scan';
    scan.setAttribute('aria-hidden', 'true');
    scan.innerHTML = '<span>✓ PASSED</span>';
    title.append(scan);
  };
  if (document.readyState === 'complete') setTimeout(addScan, 200);
  else addEventListener('load', () => setTimeout(addScan, 200), {once: true});

  // Cursor label over project cards on desktop.
  if (!finePointer.matches) return;
  const cursor = document.createElement('div');
  cursor.className = 'qa-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  document.body.append(cursor);
  document.documentElement.classList.add('qa-cursor-on');
  let frame = 0, x = 0, y = 0;
  const labelFor = card => {
    if (card.hasAttribute('data-coming-soon') || !card.getAttribute('href')) return 'Coming soon';
    return /^https?:/.test(card.getAttribute('href')) && !card.getAttribute('href').startsWith(location.origin) ? 'Visit site ↗' : 'View case study →';
  };
  document.addEventListener('pointermove', event => {
    const card = desktop.matches && event.target.closest('[data-framer-name="Projects ticker"] li a');
    if (!card) { cursor.classList.remove('is-on'); return; }
    const text = labelFor(card);
    if (cursor.textContent !== text) cursor.textContent = text;
    x = event.clientX; y = event.clientY;
    cursor.classList.add('is-on');
    if (!frame) frame = requestAnimationFrame(() => { frame = 0; cursor.style.left = x + 'px'; cursor.style.top = y + 'px'; });
  }, {passive: true});
  document.addEventListener('pointerleave', () => cursor.classList.remove('is-on'));
})();
