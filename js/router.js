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
        const path = window.location.pathname || "./board";
        this.onRoute(path);
        this.markActiveLink(path);
    }

    markActiveLink(path) {
        const current = (path || "")
            .split("?")[0]
            .split("#")[0]
            .split("/")
            .filter(Boolean)
            .pop();

        document.querySelectorAll("a[data-link]").forEach((a) => {
            const href = a.getAttribute("href") || "";
            const target = href
                .replace("./", "")
                .split("?")[0]
                .split("#")[0]
                .split("/")
                .filter(Boolean)
                .pop();

            a.setAttribute("aria-current", target === current ? "page" : "false");
        });
    }
}