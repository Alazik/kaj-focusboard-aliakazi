export class SettingsStore {
    constructor(key = "focusboard_settings_v1") {
        this.key = key;
        this.data = this.load();
    }

    load() {
        const raw = localStorage.getItem(this.key);
        if (!raw) {
            return {
                theme: "dark",
                pomodoroWorkMin: 25,
                pomodoroBreakMin: 5,
                volume: 0.7
            };
        }
        try {
            return JSON.parse(raw);
        } catch {
            return {
                theme: "dark",
                pomodoroWorkMin: 25,
                pomodoroBreakMin: 5,
                volume: 0.7
            };
        }
    }

    save() {
        localStorage.setItem(this.key, JSON.stringify(this.data));
    }

    get() {
        return { ...this.data };
    }

    set(patch) {
        this.data = { ...this.data, ...patch };
        this.save();
        return this.get();
    }
}