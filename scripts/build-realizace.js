/* Generuje realizace/index.html a realizace/<slug>.html z content/realizace.json.
   Spuštění: node scripts/build-realizace.js
   Rozměry obrázků bere z img/realizace/sizes.json (vytváří tools/resize-realizace.ps1). */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'realizace');
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/realizace.json'), 'utf8'));
const sizes = JSON.parse(fs.readFileSync(path.join(ROOT, 'img/realizace/sizes.json'), 'utf8').replace(/^﻿/, ''));
const projects = data.projects;

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// české předložky a spojky nenechávat na konci řádku
const nb = (s = '') => esc(s).replace(/(^|\s)([kvszuoaiKVSZUOAI])\s/g, '$1$2&nbsp;');

function img(slug, item, { cls = '', lazy = true, sizesAttr = '' } = {}) {
  const [w, h] = sizes[`${slug}/${item.file}`] || [1600, 1067];
  return `<img src="../img/realizace/${slug}/${item.file}" alt="${esc(item.alt)}" width="${w}" height="${h}"${lazy ? ' loading="lazy" decoding="async"' : ' fetchpriority="high"'}${cls ? ` class="${cls}"` : ''}${sizesAttr}>`;
}

const head = (title, desc, preload) => `<!doctype html>
<html lang="cs">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="theme-color" content="#faf8f3">
  <link rel="icon" href="../img/logo-mark-white.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Inter+Tight:wght@300;400;500;600&display=swap" rel="stylesheet">${preload ? `\n  <link rel="preload" as="image" href="${preload}" fetchpriority="high">` : ''}
  <link rel="stylesheet" href="../css/style.css">
  <script>document.documentElement.classList.add('js');</script>
</head>
<body>
<a class="skip-link" href="#obsah">Přeskočit na obsah</a>

<header class="nav nav--light" data-nav>
  <div class="wrap nav__inner">
    <a class="nav__logo" href="../index.html" aria-label="H atelier – úvod"><img src="../img/logo-mark-white.png" alt="H atelier" width="940" height="445"></a>
    <nav class="nav__links" id="menu" aria-label="Hlavní navigace">
      <a href="../studie-domu.html">Studie domu</a>
      <a href="index.html" aria-current="page">Realizace</a>
      <a href="../index.html#tvorba">Tvorba</a>
      <a href="../index.html#atelier">Atelier</a>
      <a href="../index.html#kontakt">Kontakt</a>
    </nav>
    <a class="btn nav__cta" href="../studie-domu.html#poptavka">Objednat studii <span class="arrow" aria-hidden="true">→</span></a>
    <button class="nav__toggle" type="button" aria-expanded="false" aria-controls="menu"><i aria-hidden="true"></i><span>Menu</span></button>
  </div>
</header>
`;

const foot = `
<footer class="footer">
  <div class="wrap footer__grid">
    <div class="footer__logo"><img src="../img/logo-white.png" alt="H atelier – Ing. arch. Oldřich Hutter" width="1026" height="676" loading="lazy"></div>
    <div class="footer__col">
      <span class="mono">Atelier</span>
      <a href="../studie-domu.html">Studie domu</a>
      <a href="index.html">Realizace</a>
      <a href="../index.html#tvorba">Volná tvorba</a>
      <a href="../index.html#atelier">O atelieru</a>
    </div>
    <div class="footer__col">
      <span class="mono">Archiv</span>
      <a href="../index.html#atelier">Historie</a>
      <a href="../index.html#atelier">Nábytek Dřevospoj</a>
      <a href="../index.html#atelier">Monografie</a>
    </div>
    <div class="footer__col footer__col--wide">
      <span class="mono">Kontakt</span>
      <span>H atelier — Ing. arch. Oldřich Hutter</span>
      <span>Břeclav</span>
      <span class="placeholder">e-mail — doplnit</span>
      <span class="placeholder">telefon — doplnit</span>
    </div>
    <div class="footer__bottom mono">
      <span>© 2026 H atelier</span>
      <span>Prototyp · <span class="placeholder">doména doplnit</span></span>
    </div>
  </div>
</footer>

<div class="mobile-cta" data-mobile-cta>
  <span class="mono">Studie domu</span>
  <a class="btn" href="../studie-domu.html#poptavka">Objednat <span class="arrow" aria-hidden="true">→</span></a>
</div>

<dialog class="lightbox" data-lightbox-dialog aria-label="Fotografie">
  <figure class="lightbox__figure"><img alt=""><figcaption class="mono"></figcaption></figure>
  <button class="lightbox__btn lightbox__close" type="button" data-lb-close aria-label="Zavřít">×</button>
  <button class="lightbox__btn lightbox__prev" type="button" data-lb-prev aria-label="Předchozí">←</button>
  <button class="lightbox__btn lightbox__next" type="button" data-lb-next aria-label="Další">→</button>
  <span class="lightbox__count mono" data-lb-count></span>
</dialog>

<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" defer></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js" defer></script>
<script src="../js/main.js" defer></script>
</body>
</html>
`;

function razitko(p) {
  const rows = [
    ['Rok', p.year], ['Místo', p.place], ['Typ', p.type], ['Stav', p.status],
    ['Rozsah', p.scope, true], p.collab ? ['Spolupráce', p.collab, true] : null,
  ].filter(Boolean);
  // poslední řádek bez spodní linky
  return `<div class="razitko">${rows.map(([k, v, full], i) => {
    const last = i >= rows.length - (rows[rows.length - 1][2] ? 1 : 2);
    return `<div class="${[full ? 'full' : '', last ? 'last-row' : ''].join(' ').trim()}"><span class="mono">${k}</span>${nb(v)}</div>`;
  }).join('')}</div>`;
}

function gallery(p) {
  return p.gallery.map((g, i) => `
        <figure class="gal-item${g.size ? ` gal-item--${g.size}` : ''}">
          <a class="gal-item__media" href="../img/realizace/${p.slug}/${g.file}" data-lightbox="${p.slug}" data-caption="${esc(g.alt)}" data-reveal-img>
            ${img(p.slug, g)}
          </a>
          <figcaption class="mono"><span>${String(i + 1).padStart(2, '0')}</span><span>${nb(g.alt)}</span></figcaption>
        </figure>`).join('');
}

function compare(p) {
  const c = p.compare;
  if (!c) return '';
  return `
  <section class="section section--aged" aria-labelledby="cmp-title">
    <div class="wrap compare-wrap">
      <div class="compare-wrap__text">
        <p class="eyebrow" data-reveal><b>03</b>&nbsp;${esc(c.labels.join(' / '))}</p>
        <h2 class="h2" id="cmp-title" data-reveal>${nb(c.title)}</h2>
        <p class="prose" data-reveal>${nb(c.text)}</p>
      </div>
      <div class="compare${c.drawing ? '' : ' compare--photo'}" data-compare data-reveal>
        ${img(p.slug, c.after)}
        <div class="compare__before" aria-hidden="true">${img(p.slug, { ...c.before, alt: '' })}</div>
        <span class="compare__label compare__label--l mono">${esc(c.labels[0])}</span>
        <span class="compare__label compare__label--r mono">${esc(c.labels[1])}</span>
        <input type="range" min="0" max="100" value="50" aria-label="${esc(c.labels.join(' / '))}">
        <span class="compare__handle" aria-hidden="true"></span>
      </div>
    </div>
  </section>`;
}

function sketches(p) {
  const s = p.sketches;
  if (!s) return '';
  const no = p.compare ? '04' : '03';
  return `
  <section class="section" aria-labelledby="sk-title">
    <div class="wrap">
      <div class="sec-head">
        <div class="sec-head__title">
          <p class="eyebrow" data-reveal><b>${no}</b>&nbsp;Výkresy a skici</p>
          <h2 class="h2" id="sk-title" data-reveal>${nb(s.title)}</h2>
        </div>
        <div class="sec-head__aside" data-reveal><p class="muted" style="max-width:34ch">${nb(s.text)}</p></div>
      </div>
      <div class="sketches sketches--${s.items.length}">${s.items.map((it) => `
        <figure class="fig sketch">
          <a class="fig__media" href="../img/realizace/${p.slug}/${it.file}" data-lightbox="${p.slug}-skici" data-caption="${esc(it.caption)}" data-reveal-img>${img(p.slug, it)}</a>
          <figcaption class="mono"><span>${esc(it.caption)}</span></figcaption>
        </figure>`).join('')}
      </div>
    </div>
  </section>`;
}

function detail(p, i) {
  const next = projects[(i + 1) % projects.length];
  const n = String(i + 1).padStart(2, '0');
  const total = String(projects.length).padStart(2, '0');
  return head(`${p.title}, ${p.place} — Realizace | H atelier`, p.lead, `../img/realizace/${p.slug}/${p.hero.file}`) + `
<main id="obsah">
  <article>
    <header class="project-head">
      <div class="wrap">
        <nav class="crumbs mono" aria-label="Drobečková navigace" data-reveal><a href="index.html">Realizace</a><span aria-hidden="true">/</span><span>${n} — ${total}</span></nav>
        <div class="project-head__grid">
          <div class="project-head__title">
            <p class="eyebrow" data-reveal><b>${esc(p.year)}</b>&nbsp;${esc(p.category)}</p>
            <h1 class="h1" data-reveal>${nb(p.title)}<br><strong>${nb(p.place)}</strong></h1>
          </div>
          <p class="lead project-head__lead" data-reveal>${nb(p.lead)}</p>
          <div class="project-head__razitko" data-reveal>${razitko(p)}</div>
        </div>
      </div>
      <figure class="project-hero">
        <div class="project-hero__media" data-reveal-img>${img(p.slug, p.hero, { lazy: false })}</div>
      </figure>
    </header>

    <section class="section" aria-labelledby="o-projektu">
      <div class="wrap project-text">
        <p class="eyebrow" data-reveal><b>01</b>&nbsp;O projektu</p>
        <h2 class="visually-hidden" id="o-projektu">O projektu</h2>
        <div class="project-text__body">
          ${p.body.map((t, k) => `<p${k === 0 ? ' class="project-text__first"' : ''} data-reveal>${nb(t)}</p>`).join('\n          ')}
        </div>
      </div>
    </section>

    <section class="section" style="padding-top:0" aria-labelledby="galerie">
      <div class="wrap">
        <div class="sec-head">
          <div class="sec-head__title">
            <p class="eyebrow" data-reveal><b>02</b>&nbsp;Fotografie</p>
            <h2 class="h2" id="galerie" data-reveal>Realizace</h2>
          </div>
          <div class="sec-head__aside mono muted" data-reveal>${p.gallery.length} fotografií · klikněte pro zvětšení</div>
        </div>
        <div class="gallery">${gallery(p)}
        </div>
      </div>
    </section>
${compare(p)}${sketches(p)}
  </article>

  <section class="next-project" aria-label="Další realizace">
    <a class="next-project__link" href="${next.slug}.html">
      <div class="next-project__media">${img(next.slug, next.hero)}</div>
      <div class="wrap next-project__inner">
        <span class="mono">Další realizace →</span>
        <span class="display next-project__title">${nb(next.title)}</span>
        <span class="mono">${esc(next.place)} · ${esc(next.year)}</span>
      </div>
    </a>
  </section>

  <section class="section section--night" aria-labelledby="cta-title">
    <div class="wrap cta__inner">
      <div class="cta__title">
        <p class="eyebrow"><b>Poptávka</b></p>
        <h2 class="h2" id="cta-title" style="margin-top:1.5rem">Máte podobné <strong>zadání?</strong></h2>
      </div>
      <div class="cta__form" style="display:flex;gap:.75rem;flex-wrap:wrap">
        <a class="btn btn--light" href="../studie-domu.html#poptavka">Objednat studii <span class="arrow" aria-hidden="true">→</span></a>
        <a class="btn btn--ghost" href="index.html">Všechny realizace</a>
      </div>
    </div>
  </section>
</main>
` + foot;
}

function listing() {
  return head('Realizace — H atelier | Ing. arch. Oldřich Hutter', 'Vybrané realizace atelieru H atelier: rodinné domy, vinárny, kavárny a rekonstrukce na jižní Moravě.') + `
<main id="obsah">
  <header class="page-hero" style="padding-bottom:clamp(3rem,2rem + 4vw,6rem)">
    <div class="wrap">
      <div class="page-hero__grid">
        <div class="page-hero__title">
          <p class="eyebrow" data-reveal><b>Realizace</b>&nbsp;— ${projects.length} vybraných projektů</p>
          <h1 class="h1" data-reveal>Domy, interiéry<br>a <strong>rekonstrukce</strong></h1>
        </div>
        <div class="page-hero__lead"><p class="lead" data-reveal>Od rodinných vil po vinárny, kavárny a zámecký sál. Nejnovější realizace jsou nahoře.</p></div>
      </div>
    </div>
  </header>
  <section class="section" style="padding-top:0" aria-label="Seznam realizací">
    <div class="wrap">
      <ol class="project-list">${projects.map((p, i) => `
        <li class="project-row" data-reveal>
          <a href="${p.slug}.html">
            <span class="mono project-row__no">${String(i + 1).padStart(2, '0')}</span>
            <span class="project-row__media">${img(p.slug, p.hero)}</span>
            <span class="project-row__title">${nb(p.title)}<small>${esc(p.place)}</small></span>
            <span class="mono project-row__type">${esc(p.category)}</span>
            <span class="mono project-row__year">${esc(p.year)}</span>
            <span class="project-row__arrow" aria-hidden="true">→</span>
          </a>
        </li>`).join('')}
      </ol>
    </div>
  </section>
  <section class="section section--night" aria-labelledby="cta-title">
    <div class="wrap cta__inner">
      <div class="cta__title"><h2 class="h2" id="cta-title">Máte podobné <strong>zadání?</strong></h2></div>
      <div class="cta__form"><a class="btn btn--light" href="../studie-domu.html#poptavka">Objednat studii <span class="arrow" aria-hidden="true">→</span></a></div>
    </div>
  </section>
</main>
` + foot;
}

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'index.html'), listing());
projects.forEach((p, i) => fs.writeFileSync(path.join(OUT, `${p.slug}.html`), detail(p, i)));
console.log(`realizace: index + ${projects.length} detailů → ${path.relative(ROOT, OUT)}/`);
