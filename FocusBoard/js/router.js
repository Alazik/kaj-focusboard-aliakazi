export class Router {
    constructor({ onRoute }) {
        this.onRoute = onRoute;
        this.handlePopState = this.handlePopState.bind(this);
    }

    init() {
        window.addEventListener("popstate", this.handlePopState);
        document.addEventListener("click", (e) => {
            const link = e.target.closest("a[data-link]");
            if (!link) return;

            e.preventDefault();
            this.go(link.getAttribute("href"));
        });

        this.renderCurrent();
    }

    go(path) {
        history.pushState({}, "", path);
        this.renderCurrent();
    }

    handlePopState() {
        this.renderCurrent();
    }

    renderCurrent() {
        const path = window.location.pathname || "/board";
        this.onRoute(path);
        this.markActiveLink(path);
    }

    markActiveLink(path) {
        document.querySelectorAll("a[data-link]").forEach((a) => {
            const href = a.getAttribute("href");
            a.setAttribute("aria-current", href === path ? "page" : "false");
        });
    }
}