export class PomodoroTimer {
    constructor({ onTick, onDone }) {
        this.onTick = onTick;
        this.onDone = onDone;
        this.totalSec = 25 * 60;
        this.leftSec = this.totalSec;
        this.intervalId = null;
    }

    setMinutes(min) {
        this.totalSec = Math.max(1, Number(min)) * 60;
        this.leftSec = this.totalSec;
        this.onTick(this.getState());
    }

    start() {
        if (this.intervalId) return;
        this.intervalId = setInterval(() => {
            this.leftSec -= 1;
            this.onTick(this.getState());
            if (this.leftSec <= 0) {
                this.stop();
                this.leftSec = 0;
                this.onTick(this.getState());
                this.onDone();
            }
        }, 1000);
    }

    stop() {
        clearInterval(this.intervalId);
        this.intervalId = null;
    }

    reset() {
        this.stop();
        this.leftSec = this.totalSec;
        this.onTick(this.getState());
    }

    getState() {
        const progress = 1 - this.leftSec / this.totalSec; // 0..1
        return { totalSec: this.totalSec, leftSec: this.leftSec, progress };
    }
}