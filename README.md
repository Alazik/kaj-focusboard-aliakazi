# FocusBoard (PWA) — semestrální práce

Jednoduchá webová aplikace (PWA) pro produktivitu: Kanban tabule (To Do / Doing / Done) + Pomodoro časovač. Aplikace ukládá data lokálně a funguje i offline.

---

## Spuštění

### Doporučeno (kvůli History API + refresh /board)
```bash
npx serve -s .
```
Poté otevřít např. `http://localhost:3000/board`.

> Pozn.: Aplikace používá History API (routes `/board`, `/task`, `/focus`, `/settings`). Pro správný refresh na těchto URL je potřeba SPA fallback (proto `serve -s`).

---

## Stránky (navigace)

- `/board` — Kanban tabule + vytvoření úkolu
- `/task?id=...` — detail/editace úkolu
- `/focus` — Pomodoro (SVG progress + zvuk)
- `/settings` — nastavení (základ)

---

## Funkcionality (stručně)

- Úkoly: vytvořit / zobrazit / upravit / smazat (CRUD)
- Drag & Drop mezi sloupci (To Do / Doing / Done)
- Pomodoro: start/stop/reset, SVG progress ring, zvuk po dokončení
- Ukládání dat lokálně (LocalStorage)
- Offline režim (Service Worker + Cache)
- Vlastní webová komponenta `<task-card>`

---

## Struktura projektu

- `index.html` — hlavní stránka (SPA)
- `css/style.css` — styly + responsive
- `js/app.js` — render stránek, logika UI
- `js/router.js` — History API router
- `js/store.js` — OOP model + ukládání úkolů
- `js/pomodoro.js` — OOP Pomodoro timer
- `js/components/task-card.js` — Web Component
- `sw/sw.js` — Service Worker (offline cache)
- `manifest.json` — PWA manifest
- `assets/ding.mp3` — zvuk pro timer

---

# Pokrytí hodnoticí tabulky (KATEGORIE → kde je to v projektu)

## Dokumentace
- Cíl projektu, postup, popis funkčnosti: tento `README.md`
- Komentáře ve zdrojovém kódu: `js/*` (třídy a klíčové funkce)

## HTML5
### Validita
- HTML5 doctype: `index.html` (`<!doctype html>`)

### Semantické značky
- `header`, `nav`, `main`, `section`, `footer`: `index.html` + render šablony v `js/app.js`

### Grafika — SVG / Canvas
- SVG progress ring v Pomodoro: `js/app.js` funkce `renderSvgRing()` + `updatePomodoroUI()`

### Média — Audio/Video
- `<audio id="ding">`: `index.html`
- ovládání zvuku přes JS (play, volume): `js/app.js` (v `renderFocus()` + `onDone`)

### Formulářové prvky
- Formulář pro vytvoření úkolu: `js/app.js` (`renderBoard()`), prvky:
  - `required`, `autofocus`, `minlength`, `maxlength`, `placeholder`, `pattern`
  - `type="date"` pro termín
- Formulář pro editaci úkolu: `js/app.js` (`renderTaskDetail()`)

## CSS
### Pokročilé selektory
- atributové selektory: `.col[data-status="..."]` v `css/style.css`
- kombinátory `>` a `:not(...)`: `.columns > .col:not(:first-child)` v `css/style.css`
- `:nth-child` lze použít dle potřeby (např. pro stylování seznamu)

### CSS3 transformace 2D/3D
- hover efekty: `.nav-link:hover`, `.btn:hover` používají `transform` (`css/style.css`)

### CSS3 transitions/animations
- `transition` na odkazech a tlačítkách: `css/style.css`
- animace přidání úkolu: `@keyframes pop` + `.task-enter`

### Media queries (responsive)
- `@media (max-width: 900px)` pro mobilní zobrazení: `css/style.css`

### Nested CSS
- Projekt používá strukturované CSS (modulární bloky).  
  *(Pokud je vyžadováno SCSS, lze jednoduše převést na `style.scss` se zanořenými pravidly.)*

## JavaScript
### OOP přístup (povinné)
- `Task`, `TaskStore`: `js/store.js`
- `Router`: `js/router.js`
- `PomodoroTimer`: `js/pomodoro.js`

### Použití JS frameworku / knihovny
- SortableJS (drag & drop knihovna): připojeno v `index.html` (CDN) a použito v `js/app.js` (`initSortable()`)

### Použití pokročilých JS API
- LocalStorage: `js/store.js` (`load()`, `save()`)
- Service Worker + Cache API: `sw/sw.js`
- DOM API + Events: render + event listenery v `js/app.js`

### Funkční historie (History API)
- `history.pushState`, `popstate`: `js/router.js`
- navigace mezi `/board`, `/task`, `/focus`, `/settings`

### Ovládání médií
- `audio.play()`, nastavení hlasitosti: `js/app.js` (Pomodoro)

### Offline aplikace
- offline cache: `sw/sw.js`
- PWA manifest: `manifest.json`

### JS práce s SVG
- změna `stroke-dashoffset` v čase: `js/app.js` (`updatePomodoroUI()`)

### Webová komponenta
- vlastní komponenta `<task-card>`: `js/components/task-card.js` + použití v `js/app.js`

## Ostatní
### Kompletnost řešení
- CRUD úkolů + Kanban + Pomodoro + ukládání + navigace: `js/app.js`, `js/store.js`

### Estetické zpracování
- jednotný dark UI, karty, responsivní layout, animace: `css/style.css`

---

## Poznámky
- Pro správný refresh na `/board` apod. použijte `npx serve -s .`.
- Data jsou ukládána lokálně v prohlížeči, po zavření aplikace zůstávají zachována.