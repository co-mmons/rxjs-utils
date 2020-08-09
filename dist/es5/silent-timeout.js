"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.silentTimeout = void 0;
var tslib_1 = require("tslib");
var rxjs_1 = require("rxjs");
function silentTimeout(timeout, onTimeout) {
    return function (source) {
        return source.lift(new SilentTimeoutOperator(timeout, onTimeout));
    };
}
exports.silentTimeout = silentTimeout;
var SilentTimeoutOperator = /** @class */ (function () {
    function SilentTimeoutOperator(timeout, timeoutCallback) {
        this.timeout = timeout;
        this.timeoutCallback = timeoutCallback;
    }
    SilentTimeoutOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new SilentTimeoutSubscriber(subscriber, this.timeout, this.timeoutCallback));
    };
    return SilentTimeoutOperator;
}());
var SilentTimeoutSubscriber = /** @class */ (function (_super) {
    tslib_1.__extends(SilentTimeoutSubscriber, _super);
    function SilentTimeoutSubscriber(destination, timeout, timeoutCallback) {
        var _this = _super.call(this, destination) || this;
        _this.timeoutCallback = timeoutCallback;
        _this.timeoutId = setTimeout(function () { return _this.callCallback(); }, timeout);
        return _this;
    }
    SilentTimeoutSubscriber.prototype.callCallback = function () {
        if (!this.isStopped && !this.closed) {
            this.timeoutCallback();
        }
        this.clearTimeout();
    };
    SilentTimeoutSubscriber.prototype.clearTimeout = function () {
        if (this.timeoutId) {
            clearInterval(this.timeoutId);
            this.timeoutId = undefined;
            this.timeoutCallback = undefined;
        }
    };
    SilentTimeoutSubscriber.prototype._complete = function () {
        _super.prototype._complete.call(this);
        this.clearTimeout();
    };
    SilentTimeoutSubscriber.prototype._error = function (error) {
        _super.prototype._error.call(this, error);
        this.clearTimeout();
    };
    SilentTimeoutSubscriber.prototype._next = function (value) {
        _super.prototype._next.call(this, value);
        this.clearTimeout();
    };
    SilentTimeoutSubscriber.prototype.unsubscribe = function () {
        this.clearTimeout();
        _super.prototype.unsubscribe.call(this);
    };
    return SilentTimeoutSubscriber;
}(rxjs_1.Subscriber));
//# sourceMappingURL=silent-timeout.js.map