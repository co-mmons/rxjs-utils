"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.silentTimeout = void 0;
const rxjs_1 = require("rxjs");
function silentTimeout(timeout, onTimeout) {
    return function (source) {
        return source.lift(new SilentTimeoutOperator(timeout, onTimeout));
    };
}
exports.silentTimeout = silentTimeout;
class SilentTimeoutOperator {
    constructor(timeout, timeoutCallback) {
        this.timeout = timeout;
        this.timeoutCallback = timeoutCallback;
    }
    call(subscriber, source) {
        return source.subscribe(new SilentTimeoutSubscriber(subscriber, this.timeout, this.timeoutCallback));
    }
}
class SilentTimeoutSubscriber extends rxjs_1.Subscriber {
    constructor(destination, timeout, timeoutCallback) {
        super(destination);
        this.timeoutCallback = timeoutCallback;
        this.timeoutId = setTimeout(() => this.callCallback(), timeout);
    }
    callCallback() {
        if (!this.isStopped && !this.closed) {
            this.timeoutCallback();
        }
        this.clearTimeout();
    }
    clearTimeout() {
        if (this.timeoutId) {
            clearInterval(this.timeoutId);
            this.timeoutId = undefined;
            this.timeoutCallback = undefined;
        }
    }
    _complete() {
        super._complete();
        this.clearTimeout();
    }
    _error(error) {
        super._error(error);
        this.clearTimeout();
    }
    _next(value) {
        super._next(value);
        this.clearTimeout();
    }
    unsubscribe() {
        this.clearTimeout();
        super.unsubscribe();
    }
}
//# sourceMappingURL=silentTimeout.js.map