import {deepEqual} from "fast-equals";
import {Observable, Subject, Subscriber, Subscription, SubscriptionLike, TeardownLogic, Observer, PartialObserver} from "rxjs";

class CachedObservable<T> extends Subject<T> {

    constructor(private factory: ObservableCache) {
        super();
    }

    _trySubscribe(subscriber: Subscriber<T>): TeardownLogic {
        let subscription: TeardownLogic = super._trySubscribe(subscriber);

        if (subscription && !(<SubscriptionLike>subscription).closed) {

            this.factory["pushObserver"](this);

            if (!this.factory["initialized"]) {
                this.factory["initialize"]();

            } else if (this.factory["_hasValue"]) {
                subscriber.next(this.factory["_value"]);
            }

            let niu = new Subscription(() => this.subscriptionClosed());
            niu.add(subscription);
            subscription = niu;
        }

        return subscription;
    }

    private subscriptionClosed() {
        this.factory["pullObserver"](this);
    }

    unsubscribe(): void {
        super.unsubscribe();
        this.subscriptionClosed();
    }
}

export class ObservableCache<T = any> {

    constructor(protected readonly sourceFactory: () => Observable<T>, public readonly id?: any) {
    }


    protected source: Observable<T>;

    protected sourceSubscription: Subscription;

    protected _value: any;

    protected _hasValue: boolean = false;

    private observers: Observer<T>[] = [];

    private _checkEquality: boolean = true;

    public setCheckEquality(value: boolean): this {
        this._checkEquality = value;
        return this;
    }

    public observable(): Observable<T> {
        return new CachedObservable(this);
    }

    hasValue() {
        return !!this._hasValue;
    }

    value() {
        return this._value;
    }

    protected pushObserver(observer: Observer<T>) {

        for (let o of this.observers) {
            if (o === observer) {
                return;
            }
        }

        this.observers.push(observer);
    }

    protected pullObserver(observer: Observer<T>) {
        for (let i = this.observers.length; i >= 0; i--) {
            if (this.observers[i] === observer) {
                this.observers.splice(i, 1);
            }
        }

        if (this.observers.length === 0) {
            this.destroySource();
        }
    }

    protected get initialized(): boolean {

        if (this.source) {
            return true;
        }

        return false;
    }

    protected initialize() {

        if (!this.source) {
            this.source = this.sourceFactory();
            this._value = undefined;
            this._hasValue = false;
            this.sourceSubscription = this.source.subscribe(value => this.onSourceNext(value), error => this.onSourceError(error), () => this.onSourceComplete());
        }
    }

    protected destroySource() {

        if (this.sourceSubscription) {
            this.sourceSubscription.unsubscribe();
        }

        this.sourceSubscription = undefined;
        this.source = undefined;
        this._value = undefined;
        this._hasValue = false;
    }

    protected onSourceNext(value: T) {
        let changed = !this._hasValue || !this._checkEquality ? true : !deepEqual(value, this._value);

        this._hasValue = true;
        this._value = value;

        let observers = this.observers.slice();
        if (observers.length && changed) {
            for (let o of observers) {
                o.next(value);
            }
        }
    }

    protected onSourceError(error: any) {

        this.destroySource();

        let observers = this.observers.slice();
        if (observers.length) {
            for (let o of observers) {
                o.error(error);
            }
        }

        this.observers.length = 0;
    }

    protected onSourceComplete() {
        this.destroySource();

        let observers = this.observers.slice();
        if (observers.length) {
            for (let o of observers) {
                o.complete();
            }
        }

        this.observers.length = 0;
    }

    public destroy() {
        this.destroySource();

        let observers = this.observers.slice();
        if (observers.length) {
            for (let o of observers) {
                o.complete();
            }
        }

        this.observers.length = 0;
    }

    public subscribe(observer?: PartialObserver<T>): Subscription;

    public subscribe(next?: (value: T) => void, error?: (error: any) => void, complete?: () => void): Subscription;

    public subscribe(observerOrNext?: PartialObserver<T> | ((value: T) => void), error?: (error: any) => void, complete?: () => void): Subscription {
        if (typeof observerOrNext == "function") {
            return this.observable().subscribe(observerOrNext, error, complete);
        } else {
            return this.observable().subscribe(observerOrNext);
        }
    }

    public unsubscribe() {
        this.destroy();
    }
}
