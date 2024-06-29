"use strict";
var _ObservableCache_keepValue, _ObservableCache_keepAlive;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObservableCache = void 0;
const tslib_1 = require("tslib");
const fast_equals_1 = require("fast-equals");
const rxjs_1 = require("rxjs");
class CachedObservable extends rxjs_1.Subject {
    constructor(factory) {
        super();
        this.factory = factory;
    }
    _trySubscribe(subscriber) {
        let subscription = super["_trySubscribe"](subscriber);
        if (subscription && !subscription.closed) {
            this.factory["pushObserver"](this);
            if (!this.factory["initialized"]) {
                this.factory["initialize"]();
            }
            else if (this.factory["_hasValue"]) {
                subscriber.next(this.factory["_value"]);
            }
            let niu = new rxjs_1.Subscription(() => this.subscriptionClosed());
            niu.add(subscription);
            subscription = niu;
        }
        return subscription;
    }
    subscriptionClosed() {
        this.factory["pullObserver"](this);
    }
    unsubscribe() {
        super.unsubscribe();
        this.subscriptionClosed();
    }
}
class ObservableCache {
    constructor(sourceFactory, id) {
        this.sourceFactory = sourceFactory;
        this.id = id;
        this._hasValue = false;
        this.observers = [];
        this._checkEquality = true;
        _ObservableCache_keepValue.set(this, false);
        _ObservableCache_keepAlive.set(this, false);
    }
    setCheckEquality(value) {
        this._checkEquality = value;
        return this;
    }
    observable() {
        return new CachedObservable(this);
    }
    hasValue() {
        return !!this._hasValue;
    }
    value() {
        return this._value;
    }
    set keepValue(keepValue) {
        (0, tslib_1.__classPrivateFieldSet)(this, _ObservableCache_keepValue, !!keepValue, "f");
    }
    get keepValue() {
        return (0, tslib_1.__classPrivateFieldGet)(this, _ObservableCache_keepValue, "f");
    }
    set keepAlive(value) {
        (0, tslib_1.__classPrivateFieldSet)(this, _ObservableCache_keepAlive, !!value, "f");
        if (!value && this.observers.length === 0) {
            this.destroySource();
        }
    }
    get keepAlive() {
        return (0, tslib_1.__classPrivateFieldGet)(this, _ObservableCache_keepAlive, "f");
    }
    get observersCount() {
        return this.observers.length;
    }
    refresh() {
        if (this.sourceSubscription) {
            this.sourceSubscription.unsubscribe();
            this.sourceSubscription = undefined;
        }
        this.source = this.sourceFactory();
        if (this.observers.length > 0 || (0, tslib_1.__classPrivateFieldGet)(this, _ObservableCache_keepAlive, "f")) {
            this.sourceSubscription = this.source.subscribe(value => this.onSourceNext(value), error => this.onSourceError(error), () => this.onSourceComplete());
        }
    }
    pushObserver(observer) {
        for (let o of this.observers) {
            if (o === observer) {
                return;
            }
        }
        this.observers.push(observer);
    }
    pullObserver(observer) {
        for (let i = this.observers.length; i >= 0; i--) {
            if (this.observers[i] === observer) {
                this.observers.splice(i, 1);
            }
        }
        if (this.observers.length === 0 || (0, tslib_1.__classPrivateFieldGet)(this, _ObservableCache_keepAlive, "f")) {
            this.destroySource();
        }
    }
    get initialized() {
        if (this.source) {
            return true;
        }
        return false;
    }
    initialize() {
        if (!this.source) {
            this._value = undefined;
            this._hasValue = false;
            this.refresh();
        }
    }
    destroySource() {
        if (this.sourceSubscription) {
            this.sourceSubscription.unsubscribe();
        }
        this.sourceSubscription = undefined;
        this.source = undefined;
        if (!this.keepValue) {
            this._value = undefined;
            this._hasValue = false;
        }
    }
    onSourceNext(value) {
        let changed = !this._hasValue || !this._checkEquality ? true : !(0, fast_equals_1.deepEqual)(value, this._value);
        this._hasValue = true;
        this._value = value;
        let observers = this.observers.slice();
        if (observers.length && changed) {
            for (let o of observers) {
                o.next(value);
            }
        }
    }
    onSourceError(error) {
        this.destroySource();
        let observers = this.observers.slice();
        if (observers.length) {
            for (let o of observers) {
                o.error(error);
            }
        }
        this.observers.length = 0;
    }
    onSourceComplete() {
        this.destroySource();
        let observers = this.observers.slice();
        if (observers.length) {
            for (let o of observers) {
                o.complete();
            }
        }
        this.observers.length = 0;
    }
    destroy() {
        this.destroySource();
        let observers = this.observers.slice();
        if (observers.length) {
            for (let o of observers) {
                o.complete();
            }
        }
        this.observers.length = 0;
    }
    subscribe(observerOrNext, error, complete) {
        if (typeof observerOrNext === "function") {
            return this.observable().subscribe(observerOrNext, error, complete);
        }
        else {
            return this.observable().subscribe(observerOrNext);
        }
    }
    unsubscribe() {
        this.destroy();
    }
}
exports.ObservableCache = ObservableCache;
_ObservableCache_keepValue = new WeakMap(), _ObservableCache_keepAlive = new WeakMap();
//# sourceMappingURL=ObservableCache.js.map