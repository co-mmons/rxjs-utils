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
var Subject_1 = require("rxjs/Subject");
var CachedObservable = /** @class */ (function (_super) {
    __extends(CachedObservable, _super);
    function CachedObservable(factory) {
        var _this = _super.call(this) || this;
        _this.factory = factory;
        return _this;
    }
    CachedObservable.prototype._trySubscribe = function (subscriber) {
        var subscription = _super.prototype._trySubscribe.call(this, subscriber);
        if (subscription && (!("closed" in subscription) || !subscription.closed)) {
            this.factory["pushObserver"](this);
            if (!this.factory["initialized"]) {
                this.factory["initialize"]();
            }
            else if (this.factory["hasValue"]) {
                subscriber.next(this.factory["value"]);
            }
        }
        return subscription;
    };
    CachedObservable.prototype.unsubscribe = function () {
        _super.prototype.unsubscribe.call(this);
        this.factory["pullObserver"](this);
    };
    return CachedObservable;
}(Subject_1.Subject));
var ObservableCache = /** @class */ (function () {
    function ObservableCache(sourceFactory) {
        this.sourceFactory = sourceFactory;
        this.hasValue = false;
        this.observers = [];
    }
    ObservableCache.prototype.observable = function () {
        return new CachedObservable(this);
    };
    ObservableCache.prototype.pushObserver = function (observable) {
        this.observers.push(observable);
    };
    ObservableCache.prototype.pullObserver = function (observer) {
        for (var i = this.observers.length; i >= 0; i--) {
            if (this.observers[i] === observer) {
                this.observers.splice(i, 1);
            }
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
        var changed = !this.hasValue ? true : (JSON.stringify(value) != JSON.stringify(this.value));
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
    ObservableCache.prototype.unsubscribe = function () {
        this.destroy();
    };
    return ObservableCache;
}());
exports.ObservableCache = ObservableCache;
//# sourceMappingURL=observable-cache.js.map