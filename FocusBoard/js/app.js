import { Router } from "./router.js";
import { TaskStore } from "./store.js";
import { PomodoroTimer } from "./pomodoro.js";
import "./components/task-card.js";
import { SettingsStore } from "./settings.js";

const view = document.getElementById("view");
const netStatus = document.getElementById("netStatus");
const ding = document.getElementById("ding");

const store = new TaskStore();
const settings = new SettingsStore();

// Načteme uložené nastavení (LocalStorage) a aplikujeme téma hned při startu,
// aby se UI nepřepínalo až po prvním renderu.
applyTheme(settings.get().theme);

const router = new Router({ onRoute: renderRoute });

const timer = new PomodoroTimer({
  onTick: (s) => updatePomodoroUI(s),
  onDone: () => {
    // Po dokončení intervalu přehrajeme zvuk (Media API).
    ding.currentTime = 0;
    ding.play().catch(() => { });
  },
});

router.init();
setupNetStatus();
registerServiceWorker();

function renderRoute(path) {
  // Jednoduchý router: podle URL vykreslí odpovídající "stránku" do #view.
  if (path === "/" || path === "/board") return renderBoard();
  if (path === "/task") return renderTaskDetail();
  if (path === "/focus") return renderFocus();
  if (path === "/settings") return renderSettings();
  return renderNotFound();
}

/* ---------- PAGES ---------- */

function renderBoard() {
  const tasks = store.list();
  const byStatus = {
    todo: tasks.filter((t) => t.status === "todo"),
    doing: tasks.filter((t) => t.status === "doing"),
    done: tasks.filter((t) => t.status === "done"),
  };

  view.innerHTML = `
    <section class="grid" style="gap:14px;">
      <div class="card">
        <h2 style="margin:0 0 10px;">Kanban Board</h2>

        <!-- novalidate: na mobilech je validace někdy "tichá" / neviditelná -->
        <form class="form" id="createForm" novalidate>
          <div class="field">
            <label for="title">Název úkolu *</label>
            <input id="title" name="title" required autofocus
              minlength="3" maxlength="60"
              placeholder="Např. Udělat domácí úkol"/>
          </div>

          <div class="row">
            <div class="field">
              <label for="dueDate">Termín</label>
              <input id="dueDate" name="dueDate" type="date" />
            </div>
            <div class="field">
              <label for="priority">Priorita</label>
              <select id="priority" name="priority">
                <option value="low">low</option>
                <option value="normal" selected>normal</option>
                <option value="high">high</option>
              </select>
            </div>
          </div>

          <div class="actions">
            <button class="btn btn--primary" type="submit">Přidat úkol</button>
          </div>
        </form>
      </div>

      <section class="board">
        <div class="columns">
          ${renderColumn("To Do", "todo", byStatus.todo)}
          ${renderColumn("Doing", "doing", byStatus.doing)}
          ${renderColumn("Done", "done", byStatus.done)}
        </div>
      </section>
    </section>
  `;

  document.getElementById("createForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);

    // ✅ vlastní jednoduchá validace (spolehlivá i na mobilu)
    const title = String(fd.get("title") || "").trim();
    if (title.length < 3) {
      alert("Název úkolu musí mít alespoň 3 znaky.");
      return;
    }

    // CRUD: vytvoření úkolu + uložení do LocalStorage (přes TaskStore).
    store.create({
      title,
      dueDate: String(fd.get("dueDate") || ""),
      priority: String(fd.get("priority") || "normal"),
    });

    // zůstáváme na boardu, ale přerenderujeme
    router.go("/board");
  });

  // SortableJS inicializujeme až po vykreslení sloupců (DOM musí existovat).
  // Přetahování mezi sloupci aktualizuje status úkolu a uloží se do LocalStorage.
  initSortable();
  updateEmptyMessages();
}

function renderColumn(title, status, tasks) {
  const cards = tasks
    .map(
      (t) => `
    <task-card
      task-id="${t.id}"
      title="${escapeHtml(t.title)}"
      due="${escapeHtml(t.dueDate || "")}"
      priority="${escapeHtml(t.priority)}">
    </task-card>
  `
    )
    .join("");

  return `
    <section class="col" data-status="${status}">
      <h3 class="col__title">${title}</h3>
      <div class="col__list" id="list-${status}" data-status="${status}">
        ${cards}
        <p class="empty-msg">(prázdné)</p>
      </div>
    </section>
  `;
}

function renderTaskDetail() {
  const url = new URL(window.location.href);
  const id = url.searchParams.get("id");
  const task = id ? store.getById(id) : null;

  if (!task) {
    view.innerHTML = `
      <div class="card">
        <h2>Úkol nenalezen</h2>
        <a href="/board" data-link class="nav-link" style="display:inline-block;">Zpět</a>
      </div>
    `;
    return;
  }

  view.innerHTML = `
    <div class="card">
      <h2 style="margin:0 0 10px;">Detail úkolu</h2>

      <form class="form" id="detailForm">
        <div class="field">
          <label for="dTitle">Název *</label>
          <input id="dTitle" name="title" required minlength="3" maxlength="60"
            value="${escapeHtml(task.title)}" />
        </div>

        <div class="field">
          <label for="dDesc">Popis</label>
          <textarea id="dDesc" name="description" maxlength="300"
            placeholder="Krátký popis...">${escapeHtml(task.description || "")}</textarea>
        </div>

        <div class="row">
          <div class="field">
            <label for="dDue">Termín</label>
            <input id="dDue" name="dueDate" type="date" value="${escapeHtml(task.dueDate || "")}" />
          </div>
          <div class="field">
            <label for="dPriority">Priorita</label>
            <select id="dPriority" name="priority">
              <option value="low" ${task.priority === "low" ? "selected" : ""}>low</option>
              <option value="normal" ${task.priority === "normal" ? "selected" : ""}>normal</option>
              <option value="high" ${task.priority === "high" ? "selected" : ""}>high</option>
            </select>
          </div>
        </div>

        <div class="field">
          <label for="dStatus">Stav</label>
          <select id="dStatus" name="status">
            <option value="todo" ${task.status === "todo" ? "selected" : ""}>todo</option>
            <option value="doing" ${task.status === "doing" ? "selected" : ""}>doing</option>
            <option value="done" ${task.status === "done" ? "selected" : ""}>done</option>
          </select>
        </div>

        <div class="actions">
          <button class="btn btn--primary" type="submit">Uložit</button>
          <button class="btn btn--danger" type="button" id="deleteBtn">Smazat</button>
          <a class="btn" href="/board" data-link style="text-decoration:none;">Zpět</a>
        </div>
      </form>
    </div>
  `;

  document.getElementById("detailForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);

    // CRUD: update úkolu.
    store.update(task.id, {
      title: String(fd.get("title") || "").trim(),
      description: String(fd.get("description") || ""),
      dueDate: String(fd.get("dueDate") || ""),
      priority: String(fd.get("priority") || "normal"),
      status: String(fd.get("status") || "todo"),
    });

    router.go("/board");
  });

  document.getElementById("deleteBtn").addEventListener("click", () => {
    // CRUD: delete úkolu.
    store.remove(task.id);
    router.go("/board");
  });
}

function renderFocus() {
  view.innerHTML = `
    <div class="grid">
      <div class="card">
        <h2 style="margin:0 0 10px;">Pomodoro</h2>

        <div style="display:grid; gap:12px; justify-items:start;">
          <div style="display:flex; gap:16px; align-items:center; flex-wrap:wrap;">
            ${renderSvgRing()}
            <div>
              <div style="font-size:34px; font-weight:800;" id="timeText">25:00</div>
              <div style="color:var(--muted);">SVG progress + Audio upozornění</div>
            </div>
          </div>

          <div class="row">
            <div class="field">
              <label for="minutes">Délka (min)</label>
              <input id="minutes" type="number" min="1" max="90" value="25" />
            </div>
            <div class="field">
              <label for="volume">Hlasitost</label>
              <input id="volume" type="range" min="0" max="1" step="0.05" value="0.7" />
            </div>
          </div>

          <div class="actions">
            <button class="btn btn--primary" id="startBtn">Start</button>
            <button class="btn" id="stopBtn">Stop</button>
            <button class="btn" id="resetBtn">Reset</button>
          </div>
        </div>
      </div>
    </div>
  `;

  const minutes = document.getElementById("minutes");
  const volume = document.getElementById("volume");

  const s = settings.get();
  minutes.value = s.pomodoroWorkMin;
  volume.value = s.volume;
  ding.volume = s.volume;

  // Důležité: při návratu na stránku Focus nechceme resetovat běžící timer.
  if (timer.isRunning()) {
    updatePomodoroUI(timer.getState());
    minutes.disabled = true;
  } else {
    minutes.disabled = false;
    timer.setMinutes(s.pomodoroWorkMin);
  }

  minutes.addEventListener("change", () => {
    const m = Number(minutes.value);
    settings.set({ pomodoroWorkMin: m });

    // Délku Pomodoro měníme jen když timer neběží.
    if (!timer.isRunning()) timer.setMinutes(m);
  });

  volume.addEventListener("input", () => {
    const v = Number(volume.value);
    settings.set({ volume: v });
    ding.volume = v;
  });

  document.getElementById("startBtn").addEventListener("click", () => {
    timer.start();
    minutes.disabled = true;
  });

  document.getElementById("stopBtn").addEventListener("click", () => {
    timer.stop();
    minutes.disabled = false;
  });

  document.getElementById("resetBtn").addEventListener("click", () => {
    timer.reset();
    minutes.disabled = false;
  });
}

function renderSettings() {
  const s = settings.get();

  view.innerHTML = `
    <div class="card">
      <h2 style="margin:0 0 10px;">Settings</h2>

      <form class="form" id="settingsForm">
        <div class="field">
          <label for="theme">Téma</label>
          <select id="theme" name="theme">
            <option value="dark" ${s.theme === "dark" ? "selected" : ""}>dark</option>
            <option value="light" ${s.theme === "light" ? "selected" : ""}>light</option>
          </select>
        </div>

        <div class="row">
          <div class="field">
            <label for="work">Pomodoro work (min)</label>
            <input id="work" name="work" type="number" min="1" max="90" value="${s.pomodoroWorkMin}" />
          </div>
          <div class="field">
            <label for="break">Pomodoro break (min)</label>
            <input id="break" name="break" type="number" min="1" max="30" value="${s.pomodoroBreakMin}" />
          </div>
        </div>

        <div class="field">
          <label for="vol">Hlasitost (0–1)</label>
          <input id="vol" name="vol" type="range" min="0" max="1" step="0.05" value="${s.volume}" />
        </div>

        <div class="actions">
          <button class="btn btn--primary" type="submit">Uložit</button>
          <a class="btn" href="/board" data-link style="text-decoration:none;">Zpět</a>
        </div>
      </form>
    </div>
  `;

  document.getElementById("settingsForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);

    const theme = String(fd.get("theme"));
    const work = Number(fd.get("work"));
    const brk = Number(fd.get("break"));
    const volume = Number(fd.get("vol"));

    settings.set({
      theme,
      pomodoroWorkMin: work,
      pomodoroBreakMin: brk,
      volume,
    });

    applyTheme(theme);
    ding.volume = volume;

    router.go("/settings");
  });
}

function renderNotFound() {
  view.innerHTML = `
    <div class="card">
      <h2>404</h2>
      <p style="color:var(--muted);">Stránka nenalezena.</p>
      <a class="btn" href="/board" data-link style="text-decoration:none;">Zpět</a>
    </div>
  `;
}

/* ---------- SVG (JS práce s SVG) ---------- */

function renderSvgRing() {
  return `
    <svg width="120" height="120" viewBox="0 0 120 120" aria-label="Progress">
      <circle cx="60" cy="60" r="46" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="10"></circle>
      <circle id="ring"
        cx="60" cy="60" r="46"
        fill="none" stroke="var(--accent)" stroke-width="10"
        stroke-linecap="round"
        stroke-dasharray="289"
        stroke-dashoffset="289"
        transform="rotate(-90 60 60)"></circle>
    </svg>
  `;
}

function updatePomodoroUI(state) {
  const timeText = document.getElementById("timeText");
  const ring = document.getElementById("ring");
  if (!timeText || !ring) return;

  const mm = String(Math.floor(state.leftSec / 60)).padStart(2, "0");
  const ss = String(state.leftSec % 60).padStart(2, "0");
  timeText.textContent = `${mm}:${ss}`;

  const circumference = 289;
  const offset = circumference * (1 - state.progress);
  ring.style.strokeDashoffset = String(offset);
}

/* ---------- NET STATUS ---------- */

function setupNetStatus() {
  const setStatus = (online) => {
    netStatus.textContent = online ? "Online" : "Offline";
    netStatus.dataset.online = String(online);
  };

  const probeInternet = async () => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 2500);

    try {
      await fetch("https://www.gstatic.com/generate_204", {
        method: "GET",
        mode: "no-cors",
        cache: "no-store",
        signal: ctrl.signal,
      });

      setStatus(true);
    } catch {
      setStatus(false);
    } finally {
      clearTimeout(t);
    }
  };

  // События оставим, но главное — probeInternet()
  window.addEventListener("online", probeInternet);
  window.addEventListener("offline", () => setStatus(false));

  setStatus(navigator.onLine);
  probeInternet();
  setInterval(probeInternet, 3000);
}

/* ---------- SERVICE WORKER (offline) ---------- */

async function registerServiceWorker() {
  // Service Worker zajišťuje offline režim (Cache API).
  // Po instalaci SW lze aplikaci otevřít i bez internetu (alespoň statické soubory).
  if (!("serviceWorker" in navigator)) return;

  try {
    await navigator.serviceWorker.register("./sw/sw.js");
  } catch {
    // ignore
  }
}

/* ---------- helpers ---------- */

function escapeHtml(s) {
  // Jednoduché escapování HTML (kvůli bezpečnému vložení textu do šablon).
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function initSortable() {
  document.querySelectorAll(".col__list").forEach((listEl) => {
    new Sortable(listEl, {
      group: "tasks",
      animation: 150,

      draggable: "task-card",

      delay: 150,
      delayOnTouchOnly: true,
      touchStartThreshold: 5,

      filter: ".empty-msg",
      preventOnFilter: false,

      // onAdd = úkol byl přesunut do jiného sloupce.
      onAdd: (evt) => {
        const toStatus = evt.to.dataset.status;
        const id = evt.item.getAttribute("task-id");
        if (!id) return;

        store.update(id, { status: toStatus });
        updateEmptyMessages();
      },

      onRemove: () => {
        updateEmptyMessages();
      },
    });
  });
}

function updateEmptyMessages() {
  document.querySelectorAll(".col__list").forEach((list) => {
    const hasTask = list.querySelector("task-card") !== null;
    list.classList.toggle("has-items", hasTask);
  });
}

function applyTheme(theme) {
  // Uložené téma se aplikuje přes data atribut na <html>.
  document.documentElement.dataset.theme = theme;
}

// OOP demo (prototypová dědičnost)
function BaseEntity() { }
BaseEntity.prototype.getType = function () { return "base"; };

function TaskEntity() { }
TaskEntity.prototype = Object.create(BaseEntity.prototype);
TaskEntity.prototype.constructor = TaskEntity;
TaskEntity.prototype.getType = function () { return "task"; };

// "jmenný prostor" (namespace) pattern
window.FocusBoard = window.FocusBoard || {};
window.FocusBoard.TaskEntity = TaskEntity;