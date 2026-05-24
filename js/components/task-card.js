export class TaskCard extends HTMLElement {
  connectedCallback() {
    const title = this.getAttribute("title") ?? "";
    const due = this.getAttribute("due") ?? "";
    const priority = this.getAttribute("priority") ?? "normal";
    const id = this.getAttribute("task-id") ?? "";

    this.classList.add("task-enter");

    this.innerHTML = `
      <article class="card" data-priority="${priority}">
        <header style="display:flex; justify-content:space-between; gap:10px; align-items:start;">
          <strong>${this.escape(title)}</strong>
          <!-- GitHub Pages: musí být relativní cesta -->
          <a href="./task?id=${encodeURIComponent(id)}" data-link style="color:var(--accent); text-decoration:none;">Detail</a>
        </header>
        <p style="margin:10px 0 0; color:var(--muted); font-size:14px;">
          Termín: ${due ? this.escape(due) : "—"} | Priorita: ${this.escape(priority)}
        </p>
      </article>
    `;
  }

  escape(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
}

customElements.define("task-card", TaskCard);