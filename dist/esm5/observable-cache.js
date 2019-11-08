import * as tslib_1 from "tslib";
import { deepEqual } from "fast-equals";
import { Subject, Subscription } from "rxjs";
var CachedObservable = /** @class */ (function (_super) {
    tslib_1.__extends(CachedObservable, _super);
    function CachedObservable(factory) {
        var _this = _super.call(this) || this;
        _this.factory = factory;
        return _this;
    }
    CachedObservable.prototype._trySubscribe = function (subscriber) {
        var _this = this;
        var subscription = _super.prototype._trySubscribe.call(this, subscriber);
        if (subscription && !subscription.closed) {
            this.factory["pushObserver"](this);
            if (!this.factory["initialized"]) {
                this.factory["initialize"]();
            }
            else if (this.factory["hasValue"]) {
                subscriber.next(this.factory["value"]);
            }
            var niu = new Subscription(function () { return _this.subscriptionClosed(); });
            niu.add(subscription);
            subscription = niu;
        }
        return subscription;
    };
    CachedObservable.prototype.subscriptionClosed = function () {
        this.factory["pullObserver"](this);
    };
    CachedObservable.prototype.unsubscribe = function () {
        _super.prototype.unsubscribe.call(this);
        this.subscriptionClosed();
    };
    return CachedObservable;
}(Subject));
var ObservableCache = /** @class */ (function () {
    function ObservableCache(sourceFactory, id) {
        this.sourceFactory = sourceFactory;
        this.id = id;
        this.hasValue = false;
        this.observers = [];
        this._checkEquality = true;
    }
    ObservableCache.prototype.setCheckEquality = function (value) {
        this._checkEquality = value;
        return this;
    };
    ObservableCache.prototype.observable = function () {
        return new CachedObservable(this);
    };
    ObservableCache.prototype.pushObserver = function (observer) {
        for (var _i = 0, _a = this.observers; _i < _a.length; _i++) {
            var o = _a[_i];
            if (o === observer) {
                return;
            }
        }
        this.observers.push(observer);
    };
    ObservableCache.prototype.pullObserver = function (observer) {
        for (var i = this.observers.length; i >= 0; i--) {
            if (this.observers[i] === observer) {
                this.observers.splice(i, 1);
            }
        }
        if (this.observers.length === 0) {
            this.destroySource();
        }
    };
    Object.defineProperty(ObservableCache.prototype, "initialized", {
        get: function () {
            if (this.source) {
                return true;
            }
            return false;
        },
        enumerable: true,
        configurable: true
    });
    ObservableCache.prototype.initialize = function () {
        var _this = this;
        if (!this.source) {
            this.source = this.sourceFactory();
            this.value = undefined;
            this.hasValue = false;
            this.sourceSubscription = this.source.subscribe(function (value) { return _this.onSourceNext(value); }, function (error) { return _this.onSourceError(error); }, function () { return _this.onSourceComplete(); });
        }
    };
    ObservableCache.prototype.destroySource = function () {
        if (this.sourceSubscription) {
            this.sourceSubscription.unsubscribe();
        }
        this.sourceSubscription = undefined;
        this.source = undefined;
        this.value = undefined;
        this.hasValue = false;
    };
    ObservableCache.prototype.onSourceNext = function (value) {
        var changed = !this.hasValue || !this._checkEquality ? true : !deepEqual(value, this.value);
        this.hasValue = true;
        this.value = value;
        var observers = this.observers.slice();
        if (observers.length && changed) {
            for (var _i = 0, observers_1 = observers; _i < observers_1.length; _i++) {
                var o = observers_1[_i];
                o.next(value);
            }
        }
    };
    ObservableCache.prototype.onSourceError = function (error) {
        this.destroySource();
        var observers = this.observers.slice();
        if (observers.length) {
            for (var _i = 0, observers_2 = observers; _i < observers_2.length; _i++) {
                var o = observers_2[_i];
                o.error(error);
            }
        }
        this.observers.length = 0;
    };
    ObservableCache.prototype.onSourceComplete = function () {
        this.destroySource();
        var observers = this.observers.slice();
        if (observers.length) {
            for (var _i = 0, observers_3 = observers; _i < observers_3.length; _i++) {
                var o = observers_3[_i];
                o.complete();
            }
        }
        this.observers.length = 0;
    };
    ObservableCache.prototype.destroy = function () {
        this.destroySource();
        var observers = this.observers.slice();
        if (observers.length) {
            for (var _i = 0, observers_4 = observers; _i < observers_4.length; _i++) {
                var o = observers_4[_i];
                o.complete();
            }
        }
        this.observers.length = 0;
    };
    ObservableCache.prototype.subscribe = function (observerOrNext, error, complete) {
        if (typeof observerOrNext == "function") {
            return this.observable().subscribe(observerOrNext, error, complete);
        }
        else {
            return this.observable().subscribe(observerOrNext);
        }
    };
    ObservableCache.prototype.unsubscribe = function () {
        this.destroy();
    };
    return ObservableCache;
}());
export { ObservableCache };
//# sourceMappingURL=observable-cache.js.map