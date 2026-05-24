export class Task {
    constructor({ id, title, description, dueDate, priority, status, createdAt }) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.priority = priority;   // low | normal | high
        this.status = status;       // todo | doing | done
        this.createdAt = createdAt;
    }
}

export class TaskStore {
    constructor(storageKey = "focusboard_tasks_v1") {
        this.storageKey = storageKey;
        this.tasks = this.load();
    }

    load() {
        const raw = localStorage.getItem(this.storageKey);
        if (!raw) return [];
        try {
            const arr = JSON.parse(raw);
            return arr.map((t) => new Task(t));
        } catch {
            return [];
        }
    }

    save() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.tasks));
    }

    list() {
        return [...this.tasks];
    }

    getById(id) {
        return this.tasks.find((t) => t.id === id) || null;
    }

    create(data) {
        const id = (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function")
            ? globalThis.crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

        const task = new Task({
            id,
            createdAt: new Date().toISOString(),
            status: "todo",
            priority: "normal",
            description: "",
            dueDate: "",
            ...data,
        });

        this.tasks.unshift(task);
        this.save();
        return task;
    }

    update(id, patch) {
        const t = this.getById(id);
        if (!t) return null;
        Object.assign(t, patch);
        this.save();
        return t;
    }

    remove(id) {
        const before = this.tasks.length;
        this.tasks = this.tasks.filter((t) => t.id !== id);
        this.save();
        return this.tasks.length !== before;
    }
}