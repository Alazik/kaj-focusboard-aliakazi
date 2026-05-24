# FocusBoard (PWA) — semestrální práce (KAJ)

Jednoduchá webová aplikace (PWA) pro produktivitu: **Kanban tabule (To Do / Doing / Done)** + **Pomodoro časovač**. Aplikace ukládá data lokálně a funguje i offline.

---

## Veřejná URL aplikace

GitHub Pages (běžící aplikace):  
`https://alazik.github.io/kaj-focusboard-aliakazi/`

> Pozn.: Projekt je nasazen jako statický web (GitHub Pages). Pro podporu History API je použit SPA fallback přes `404.html`.

---

## Spuštění lokálně

Doporučeno (kvůli History API + refresh na `/board` apod.):

```bash
npx serve -s .
```

Poté otevřít např. `http://localhost:3000/board`.

> Proč ne Live Server? Jednoduchý statický server bez SPA fallback může při refresh na `/board` vrátit „Cannot GET /board“.

---

## Stránky (navigace)

- `/board` — Kanban tabule + vytvoření úkolu
- `/task?id=...` — detail/editace úkolu
- `/focus` — Pomodoro (SVG progress + zvuk)
- `/settings` — nastavení (téma, délka Pomodoro, hlasitost)

---

## Funkcionality (stručně)

- Úkoly: vytvořit / zobrazit / upravit / smazat (CRUD)
- Drag & Drop mezi sloupci (SortableJS)
- Pomodoro: start/stop/reset, SVG progress ring, zvuk po dokončení
- Ukládání dat lokálně (LocalStorage)
- Offline režim (Service Worker + Cache API)
- Vlastní webová komponenta `<task-card>`
- Světlé/tmavé téma

---

## Struktura projektu (aktuální)

> Aplikace je v **kořeni repozitáře** (kvůli GitHub Pages).

- `index.html` — hlavní stránka (SPA)
- `404.html` — SPA fallback pro GitHub Pages (History API)
- `css/style.css` — styly + responsive + nested CSS
- `js/app.js` — render stránek, logika UI, komentáře
- `js/router.js` — History API router
- `js/store.js` — OOP model + ukládání úkolů
- `js/settings.js` — nastavení (LocalStorage)
- `js/pomodoro.js` — Pomodoro timer
- `js/components/task-card.js` — Web Component
- `sw/sw.js` — Service Worker (offline cache)
- `manifest.json` — PWA manifest
- `assets/ding.mp3` — zvuk pro timer
- `assets/icons/icon-192.png`, `assets/icons/icon-512.png` — PWA ikony
- `.nojekyll` — vypnutí Jekyll (GitHub Pages)

---

# Pokrytí hodnoticí tabulky (KATEGORIE → kde je to v projektu)

## Dokumentace (1)
- Cíl projektu, postup, popis funkčnosti: tento `README.md`
- Komentáře ve zdrojovém kódu: `js/app.js` (důležité části: routing, SW, drag&drop, Pomodoro)

## HTML5 (7)
### Validita (1)
- `<!doctype html>`: `index.html`

### Semantické značky (1)
- `header`, `nav`, `main`, `section`, `footer`: `index.html` + šablony v `js/app.js`

### Grafika — SVG / Canvas (2)
- SVG progress ring: `js/app.js` (`renderSvgRing()`, `updatePomodoroUI()`)

### Média — Audio/Video (1)
- `<audio id="ding">`: `index.html`, přehrání v `js/app.js` (Pomodoro `onDone`)

### Formulářové prvky (2)
- Vytvoření úkolu: `js/app.js` (`renderBoard()`), validace přes JS (spolehlivé i na mobilu)
- Editace úkolu: `js/app.js` (`renderTaskDetail()`), `type="date"`, `required`, `maxlength`, `placeholder`

## CSS (8)
### Pokročilé selektory (1)
- atributové selektory, kombinátory, pseudo-třídy: `css/style.css` (např. `.col[data-status=...]`, `>`, `:not()`)

### CSS3 transformace 2D/3D (2)
- `transform` na tlačítkách/odkazech: `css/style.css`

### CSS3 transitions/animations (2)
- `transition` + animace přidání karty: `css/style.css` (`@keyframes pop` + `.task-enter`)

### Media queries (2)
- responzivní layout pro mobil/tablet: `css/style.css` (`@media ...`)

### Nested CSS (1)
- zanořené pravidlo s `&`: `css/style.css` (např. blok `.app-header { & .nav-link ... }`)

## JavaScript (15)
### OOP přístup (2)
- třídy a OOP struktura: `js/router.js`, `js/store.js`, `js/pomodoro.js`, `js/settings.js`

### Použití JS frameworku / knihovny (1)
- SortableJS přes CDN v `index.html`, použití v `js/app.js` (`initSortable()`)

### Použití pokročilých JS API (3)
- LocalStorage: `js/store.js`, `js/settings.js`
- Service Worker + Cache API: `sw/sw.js`
- Drag&Drop přes knihovnu (SortableJS)

### Funkční historie (2)
- History API: `js/router.js` (pushState/popstate), SPA fallback `404.html` pro GitHub Pages

### Ovládání médií (1)
- Audio API: `ding.play()`, nastavení hlasitosti: `js/app.js`

### Offline aplikace (2)
- `sw/sw.js` cachuje statické soubory, aplikace běží i bez internetu (aspoň UI + data z LocalStorage)

### JS práce s SVG (2)
- změna `stroke-dashoffset` v čase: `js/app.js`

### Webová komponenta (2)
- vlastní element `<task-card>`: `js/components/task-card.js`

## Ostatní (5)
### Kompletnost řešení (3)
- CRUD úkolů + kanban + drag&drop + pomodoro + ukládání + nastavení

### Estetické zpracování (2)
- jednotný design, karty, stíny, tmavé/světlé téma, responzivita: `css/style.css`

---

## Poznámky k GitHub Pages (důležité)

- `404.html` řeší SPA fallback (History API) pro refresh na deep linkách.
- `.nojekyll` vypíná Jekyll, aby GitHub Pages pouze publikoval statické soubory.
- V navigaci se používají relativní odkazy `./board`, `./focus`, `./settings` (kvůli nasazení v podadresáři repozitáře).
