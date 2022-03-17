"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pausableInterval = void 0;
const rxjs_1 = require("rxjs");
class PausableInterval extends rxjs_1.Subject {
    constructor(interval, pause, resume) {
        super();
        this.interval = interval;
        this.pause = pause;
        this.resume = resume;
    }
    startTimer() {
        if (!this.timer) {
            this.timer = setInterval(() => this.onInterval(), this.interval);
            if (!this.pauseSubscription && this.pause) {
                this.pauseSubscription = this.pause.subscribe(() => this.paused());
            }
            if (!this.resumeSubscription && this.resume) {
                this.resumeSubscription = this.resume.subscribe(() => this.resumed());
            }
        }
    }
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = undefined;
        }
    }
    _subscribe(subscriber) {
        this.startTimer();
        return super["_subscribe"](subscriber);
    }
    unsubscribe() {
        this.stopTimer();
        if (this.pauseSubscription) {
            this.pauseSubscription.unsubscribe();
            this.pauseSubscription = undefined;
        }
        if (this.resumeSubscription) {
            this.resumeSubscription.unsubscribe();
            this.resumeSubscription = undefined;
        }
        super.unsubscribe();
    }
    onInterval() {
        if (this.observers.length == 0) {
            this.stopTimer();
            return;
        }
        this.next(undefined);
    }
    paused() {
        this.stopTimer();
    }
    resumed() {
        this.startTimer();
        this.next(undefined);
    }
}
function pausableInterval(interval, pause, resume) {
    return new PausableInterval(interval, pause, resume);
}
exports.pausableInterval = pausableInterval;
//# sourceMappingURL=pausableInterval.js.map