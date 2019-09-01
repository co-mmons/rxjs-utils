"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var PausableInterval = /** @class */ (function (_super) {
    __extends(PausableInterval, _super);
    function PausableInterval(interval, pause, resume) {
        var _this = _super.call(this) || this;
        _this.interval = interval;
        _this.pause = pause;
        _this.resume = resume;
        return _this;
    }
    PausableInterval.prototype.startTimer = function () {
        var _this = this;
        if (!this.timer) {
            this.timer = setInterval(function () { return _this.onInterval(); }, this.interval);
            if (!this.pauseSubscription && this.pause) {
                this.pauseSubscription = this.pause.subscribe(function () { return _this.paused(); });
            }
            if (!this.resumeSubscription && this.resume) {
                this.resumeSubscription = this.resume.subscribe(function () { return _this.resumed(); });
            }
        }
    };
    PausableInterval.prototype.stopTimer = function () {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = undefined;
        }
    };
    PausableInterval.prototype._subscribe = function (subscriber) {
        this.startTimer();
        return _super.prototype._subscribe.call(this, subscriber);
    };
    PausableInterval.prototype.unsubscribe = function () {
        this.stopTimer();
        if (this.pauseSubscription) {
            this.pauseSubscription.unsubscribe();
            this.pauseSubscription = undefined;
        }
        if (this.resumeSubscription) {
            this.resumeSubscription.unsubscribe();
            this.resumeSubscription = undefined;
        }
        _super.prototype.unsubscribe.call(this);
    };
    PausableInterval.prototype.onInterval = function () {
        if (this.observers.length == 0) {
            this.stopTimer();
            return;
        }
        this.next();
    };
    PausableInterval.prototype.paused = function () {
        this.stopTimer();
    };
    PausableInterval.prototype.resumed = function () {
        this.startTimer();
        this.next();
    };
    return PausableInterval;
}(rxjs_1.Subject));
function pausableInterval(interval, pause, resume) {
    return new PausableInterval(interval, pause, resume);
}
exports.pausableInterval = pausableInterval;
//# sourceMappingURL=pausable-interval.js.map