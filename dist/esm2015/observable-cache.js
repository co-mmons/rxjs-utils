import { deepEqual } from "fast-equals";
import { Subject, Subscription } from "rxjs";
class CachedObservable extends Subject {
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
            else if (this.factory["hasValue"]) {
                subscriber.next(this.factory["value"]);
            }
            let niu = new Subscription(() => this.subscriptionClosed());
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
export class ObservableCache {
    constructor(sourceFactory, id) {
        this.sourceFactory = sourceFactory;
        this.id = id;
        this.hasValue = false;
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
            this.source = this.sourceFactory();
            this.value = undefined;
            this.hasValue = false;
            this.sourceSubscription = this.source.subscribe(value => this.onSourceNext(value), error => this.onSourceError(error), () => this.onSourceComplete());
        }
    }
    destroySource() {
        if (this.sourceSubscription) {
            this.sourceSubscription.unsubscribe();
        }
        this.sourceSubscription = undefined;
        this.source = undefined;
        this.value = undefined;
        this.hasValue = false;
    }
    onSourceNext(value) {
        let changed = !this.hasValue || !this._checkEquality ? true : !deepEqual(value, this.value);
        this.hasValue = true;
        this.value = value;
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
//# sourceMappingURL=observable-cache.js.map