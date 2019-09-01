import * as tslib_1 from "tslib";
import { Subject } from "rxjs";
var PausableInterval = /** @class */ (function (_super) {
    tslib_1.__extends(PausableInterval, _super);
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
}(Subject));
export function pausableInterval(interval, pause, resume) {
    return new PausableInterval(interval, pause, resume);
}
//# sourceMappingURL=pausable-interval.js.map