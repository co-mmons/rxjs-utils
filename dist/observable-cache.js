"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObservableCache = void 0;
const fast_equals_1 = require("fast-equals");
const rxjs_1 = require("rxjs");
class CachedObservable extends rxjs_1.Subject {
    constructor(factory) {
        super();
        this.factory = factory;
    }
    _trySubscribe(subscriber) {
        let subscription = super._trySubscribe(subscriber);
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
    get observersCount() {
        return this.observers.length;
    }
    refresh() {
        if (this.sourceSubscription) {
            this.sourceSubscription.unsubscribe();
            this.sourceSubscription = undefined;
        }
        this.source = this.sourceFactory();
        if (this.observers.length > 0) {
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
        if (this.observers.length === 0) {
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
        this._value = undefined;
        this._hasValue = false;
    }
    onSourceNext(value) {
        let changed = !this._hasValue || !this._checkEquality ? true : !fast_equals_1.deepEqual(value, this._value);
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
        if (typeof observerOrNext == "function") {
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
//# sourceMappingURL=observable-cache.js.map