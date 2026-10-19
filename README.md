# H atelier — prototyp webu

Web Ing. arch. Oldřicha Huttera. Hlavní cíl: objednání **studie domu**. Vedlejší: prohlížení volné tvorby (malba, socha, kov).

## Spuštění

```
node dev.js        → http://localhost:5198
```

## Struktura

- `index.html` – úvod (Aktuálně → Studie → Realizace → Skica/realizace → Tvorba → Přístup → Atelier → Poptávka)
- `studie-domu.html` – služba, obsah studie, postup, ukázky, cena a FAQ, čtyřkrokový formulář
- `css/style.css` – tokeny (barvy, typografie, mezery, pohyb) a komponenty
- `js/main.js` – Lenis + GSAP ScrollTrigger, intro s logem, galerie, posuvník, formulář
- `img/` – zmenšené fotky; vznikají skriptem `tools/resize.ps1` z `Desktop\bakalarka`

## Detaily realizací

Stránky `realizace/*.html` se negenerují ručně, ale z `content/realizace.json`
(texty, razítko, galerie, porovnání skica/foto nebo před/po, výkresy).

Nová realizace:
1. přidat projekt do `content/realizace.json` (pořadí = pořadí na webu, nejnovější nahoru)
2. `powershell -ExecutionPolicy Bypass -File tools\resize-realizace.ps1` – zmenší fotky do `img/realizace/<slug>/`
3. `node scripts/build-realizace.js` – vygeneruje seznam i detaily
4. odkaz z úvodu (`index.html`) přidat ručně, pokud má být mezi vybranými

## Co je potřeba doplnit (v prototypu oranžově)

- e-mail, telefon, doména
- cena studie, první setkání, délka studie, navazující projekt (FAQ)
- oblast působnosti
- formulář zatím nic neodesílá → Web3Forms / Formspree / vlastní endpoint

## Fotky – ověřit práva / autorství

- `zamek-sal.jpg` – profesionální foto z webu podkladů (pravděpodobně cizí autor)
- `autor-obrazy.jpg`, `vystava-galerie.jpg` – z Facebooku, ověřit, že jde o jeho díla a kdo fotil
- `malba-abstrakce.jpg`, `socha-figura.jpg` – ověřit autorství díla
- Nepoužité záměrně: složky `fota z netu`, `Cafe-Bullodg-Breclav-Kavarna.jpg`, `vinarna-mikulov01.jpg`

## Další krok (produkce)

Astro + content collections: každý projekt/dílo = složka s fotkami + krátký `.md`
(název, rok, kategorie, místo, text). Sekce „Aktuálně“ se plní sama podle data.
Volitelně Pages CMS pro přidávání bez kódu. Obrázky AVIF/WebP při buildu.
