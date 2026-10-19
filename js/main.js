/* H atelier — prototyp: pohyb, navigace, galerie, formulář */
(() => {
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  // Bez GSAP (offline CDN) nebo s reduced-motion obsah prostě ukážeme.
  if (!hasGsap || reduced) root.classList.remove('js');

  /* ---------- Plynulý scroll ---------- */
  let lenis = null;
  if (hasGsap && !reduced && window.Lenis) {
    gsap.registerPlugin(ScrollTrigger);
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    window.hLenis = lenis;
  } else if (hasGsap) {
    gsap.registerPlugin(ScrollTrigger);
  }

  // kotvy přes Lenis (s ohledem na fixní navigaci)
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const el = $(id);
      if (!el) return;
      e.preventDefault();
      closeMenu();
      if (lenis) lenis.scrollTo(el, { offset: -70, duration: 1.4 });
      else el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    });
  });

  /* ---------- Navigace ---------- */
  const nav = $('[data-nav]');
  const hero = $('.hero');
  const toggle = $('.nav__toggle');
  function closeMenu() {
    if (!nav || !nav.classList.contains('is-open')) return;
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.querySelector('span').textContent = 'Menu';
    lenis && lenis.start();
  }
  toggle && toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('span').textContent = open ? 'Zavřít' : 'Menu';
    open ? lenis && lenis.stop() : lenis && lenis.start();
  });
  document.addEventListener('keydown', (e) => e.key === 'Escape' && closeMenu());

  let lastY = 0;
  const mobileCta = $('[data-mobile-cta]');
  const ctaStops = $$('#kontakt, #poptavka, .footer');
  function onScroll() {
    const y = window.scrollY;
    const heroEnd = hero ? hero.offsetHeight - 80 : 10;
    if (nav && !nav.classList.contains('nav--light')) nav.classList.toggle('is-solid', y > heroEnd);
    if (nav && !nav.classList.contains('is-open')) nav.classList.toggle('is-hidden', y > lastY && y > 400);
    if (mobileCta) {
      const vh = window.innerHeight;
      const overStop = ctaStops.some((el) => { const r = el.getBoundingClientRect(); return r.top < vh && r.bottom > 0; });
      mobileCta.classList.toggle('is-visible', y > (hero ? heroEnd : 300) && !overStop);
    }
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Intro a hero ---------- */
  const intro = $('.intro');
  function heroIn() {
    if (!hasGsap || reduced || !hero) return;
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.from('[data-hero-media] img', { scale: 1.14, duration: 2.2 }, 0)
      .from('[data-split] .line > span', { yPercent: 110, duration: 1.3, stagger: 0.09 }, 0.15)
      .from('[data-hero-in]', { opacity: 0, y: 18, duration: 1, stagger: 0.08 }, 0.55);
    gsap.to('[data-hero-media] img', {
      yPercent: 12, ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
    });
  }

  let seen = false;
  try { seen = sessionStorage.getItem('h-intro') === '1'; } catch (e) { /* bez úložiště */ }
  if (intro && hasGsap && !reduced && !seen) {
    intro.hidden = false;
    lenis && lenis.stop();
    const lines = $$('.mark-line', intro);
    lines.forEach((l) => { const len = l.getTotalLength(); gsap.set(l, { strokeDasharray: len, strokeDashoffset: len }); });
    gsap.timeline({
      onComplete: () => {
        intro.remove();
        lenis && lenis.start();
        try { sessionStorage.setItem('h-intro', '1'); } catch (e) { /* nic */ }
      },
    })
      .to(lines, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut', stagger: 0.14 })
      .to('.intro__text', { opacity: 1, duration: 0.7, ease: 'power2.out' }, '-=0.35')
      .to(intro, { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut' }, '+=0.35')
      .add(heroIn, '-=0.65');
  } else {
    intro && intro.remove();
    heroIn();
  }

  /* ---------- Odkrývání při scrollu ---------- */
  if (hasGsap && !reduced) {
    // Při skoku přes sekci (posuvník, kotva) se obsah ukáže hned, ne až zpětně.
    const showNow = (els) => gsap.set(els, { opacity: 1, y: 0 });
    ScrollTrigger.batch('[data-reveal]', {
      start: 'top 88%',
      end: 'bottom top',
      once: true,
      onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.08, overwrite: true }),
      onLeave: showNow,
      onEnterBack: showNow,
    });
    $$('[data-reveal-img]').forEach((el) => {
      const img = el.querySelector('img');
      gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%', end: 'bottom top', toggleActions: 'play complete none none' } })
        .to(el, { clipPath: 'inset(0% 0 0 0)', duration: 1.2, ease: 'power4.out' })
        .to(img, { scale: 1, duration: 1.6, ease: 'expo.out' }, 0);
    });
    // kótovací čára kroků se „dokreslí“
    $$('[data-steps]').forEach((el) => {
      gsap.fromTo(el, { '--draw': 0 }, {
        '--draw': 1, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 85%', end: 'top 45%', scrub: true },
      });
    });
    // jemná paralaxa velkých obrázků
    $$('.work__media img, .page-hero__media img').forEach((img) => {
      gsap.fromTo(img, { yPercent: -4 }, {
        yPercent: 4, ease: 'none',
        scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });
  }

  /* ---------- Skica ↔ realizace ---------- */
  $$('[data-compare]').forEach((box) => {
    const input = box.querySelector('input[type="range"]');
    const set = (v) => box.style.setProperty('--pos', v + '%');
    input.addEventListener('input', () => set(input.value));
    set(input.value);
  });

  /* ---------- Galerie tvorby ---------- */
  const rail = $('[data-rail]');
  if (rail) {
    const step = () => (rail.querySelector('.piece:not([hidden])')?.offsetWidth || 300) + 32;
    $('[data-rail-prev]')?.addEventListener('click', () => rail.scrollBy({ left: -step(), behavior: 'smooth' }));
    $('[data-rail-next]')?.addEventListener('click', () => rail.scrollBy({ left: step(), behavior: 'smooth' }));
    rail.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { rail.scrollBy({ left: step(), behavior: 'smooth' }); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { rail.scrollBy({ left: -step(), behavior: 'smooth' }); e.preventDefault(); }
    });
    // táhnutí myší (dotyk řeší nativní scroll)
    let down = false, startX = 0, startL = 0, moved = false;
    rail.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; startX = e.clientX; startL = rail.scrollLeft;
    });
    window.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) { moved = true; rail.classList.add('is-dragging'); }
      rail.scrollLeft = startL - dx;
    });
    window.addEventListener('pointerup', () => { down = false; rail.classList.remove('is-dragging'); });
    rail.addEventListener('click', (e) => { if (moved) e.preventDefault(); }, true);
    // zabránit Lenis převzít vodorovný scroll
    rail.setAttribute('data-lenis-prevent-wheel', '');

    $$('[data-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        $$('[data-filter]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
        const f = btn.dataset.filter;
        $$('.piece', rail).forEach((p) => { p.hidden = f !== 'vse' && p.dataset.cat !== f; });
        rail.scrollTo({ left: 0, behavior: 'smooth' });
        hasGsap && !reduced && gsap.from($$('.piece:not([hidden])', rail), { opacity: 0, y: 16, duration: 0.6, stagger: 0.05, ease: 'expo.out' });
      });
    });
  }

  /* ---------- Formulář poptávky studie ---------- */
  const form = $('[data-order]');
  if (form) {
    const panels = $$('.step-panel', form);
    const prog = $$('.progress li', form);
    const back = $('[data-back]', form);
    const next = $('[data-next]', form);
    const pageNo = $('[data-page]', form);
    const success = $('.success');
    let i = 0;

    // předvyplnění typu z úvodní stránky (?typ=…)
    const typ = new URLSearchParams(location.search).get('typ');
    if (typ) {
      const r = form.querySelector(`input[name="typ"][value="${CSS.escape(typ)}"]`);
      if (r) r.checked = true;
      const target = $('#poptavka');
      if (target) setTimeout(() => (lenis ? lenis.scrollTo(target, { offset: -70, immediate: true }) : target.scrollIntoView()), 60);
    }

    const labelOf = (name) => {
      const el = form.querySelector(`[name="${name}"]:checked`) || form.querySelector(`[name="${name}"]`);
      if (!el) return '—';
      if (el.type === 'radio') return el.checked ? (el.dataset.label || el.closest('label')?.innerText.split('\n')[0].trim()) : '—';
      if (el.tagName === 'SELECT') return el.value ? el.options[el.selectedIndex].text : '—';
      return el.value.trim() || '—';
    };

    function renderSummary() {
      const rows = [
        ['Typ stavby', labelOf('typ')],
        ['Lokalita', labelOf('lokalita')],
        ['Pozemek / objekt', labelOf('pozemek')],
        ['Fáze', labelOf('faze')],
        ['Velikost domácnosti', labelOf('osoby')],
        ['Rozpočet stavby', labelOf('rozpocet')],
        ['Termín', labelOf('termin')],
        ['Přílohy', (form.querySelector('[name="prilohy"]')?.files.length || 0) + ' souborů'],
      ];
      $('[data-summary]', form).innerHTML = rows
        .map(([k, v]) => `<div><span class="mono">${k}</span>${String(v).replace(/</g, '&lt;')}</div>`)
        .join('');
    }

    function show(n) {
      panels.forEach((p, k) => { p.hidden = k !== n; });
      prog.forEach((li, k) => {
        li.classList.toggle('is-done', k < n);
        li.classList.toggle('is-current', k === n);
        if (k === n) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
      });
      back.hidden = n === 0;
      next.innerHTML = n === panels.length - 1 ? 'Odeslat poptávku <span class="arrow" aria-hidden="true">→</span>' : 'Pokračovat <span class="arrow" aria-hidden="true">→</span>';
      pageNo.textContent = `List ${n + 1} / ${panels.length}`;
      if (n === panels.length - 1) renderSummary();
      if (hasGsap && !reduced) gsap.from(panels[n], { opacity: 0, x: 24, duration: 0.6, ease: 'expo.out' });
      i = n;
    }

    function valid(panel) {
      const fields = $$('input, select, textarea', panel);
      for (const f of fields) {
        if (!f.checkValidity()) { f.reportValidity(); f.focus(); return false; }
      }
      return true;
    }

    next.addEventListener('click', () => {
      if (!valid(panels[i])) return;
      if (i < panels.length - 1) {
        show(i + 1);
        const top = form.getBoundingClientRect().top;
        if (top < 0) lenis ? lenis.scrollTo(form, { offset: -90 }) : form.scrollIntoView();
      } else {
        form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit', { cancelable: true }));
      }
    });
    back.addEventListener('click', () => i > 0 && show(i - 1));

    const files = form.querySelector('[name="prilohy"]');
    files && files.addEventListener('change', () => {
      $('[data-files]', form).textContent = files.files.length
        ? Array.from(files.files).map((f) => f.name).join(', ')
        : 'Zatím nic nevybráno';
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!valid(panels[i])) return;
      if (i < panels.length - 1) { show(i + 1); return; } // Enter v poli = další list
      // Prototyp: odeslání se nevolá. V produkci POST na Web3Forms / vlastní endpoint.
      form.hidden = true;
      success.hidden = false;
      requestAnimationFrame(() => success.classList.add('is-in'));
      success.focus();
    });

    show(0);
  }
})();
