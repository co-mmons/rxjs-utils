import {deepEqual} from "fast-equals";
import {Observable, Subject, Subscriber, Subscription, SubscriptionLike, TeardownLogic, Observer, PartialObserver} from "rxjs";

class CachedObservable<T> extends Subject<T> {

    constructor(private factory: ObservableCache) {
        super();
    }

    _trySubscribe(subscriber: Subscriber<T>): TeardownLogic {
        let subscription: TeardownLogic = super["_trySubscribe"](subscriber);

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

export interface ObservableCacheParams {
    id?: string | symbol;
    checkEquality?: boolean;
    keepValue?: boolean;
    keepAlive?: boolean;
}

export class ObservableCache<T = any> {

    constructor(protected readonly sourceFactory: () => Observable<T>, paramsOrId?: ObservableCacheParams | string) {

        if (typeof paramsOrId === "string") {
            this.id = paramsOrId;
        } else if (paramsOrId) {
            this.id = paramsOrId.id;

            if (typeof paramsOrId.keepValue === "boolean") {
                this.#keepValue = paramsOrId.keepValue;
            }

            if (typeof paramsOrId.keepAlive === "boolean") {
                this.#keepAlive = paramsOrId.keepAlive;
            }

            if (typeof paramsOrId.checkEquality === "boolean") {
                this.#checkEquality = paramsOrId.checkEquality;
            }
        }
    }

    public readonly id: string | symbol | undefined;

    protected source: Observable<T>;

    protected sourceSubscription: Subscription;

    protected _value: any;

    protected _hasValue: boolean = false;

    private observers: Observer<T>[] = [];

    #checkEquality: boolean = true;

    public setCheckEquality(value: boolean): this {
        this.#checkEquality = value;
        return this;
    }

    public observable(): Observable<T> {
        return new CachedObservable(this);
    }

    hasValue() {
        return !!this._hasValue;
    }

    value(): T {
        return this._value;
    }

    #keepValue: boolean = false;

    set keepValue(keepValue: boolean) {
        this.#keepValue = !!keepValue;
    }

    get keepValue() {
        return this.#keepValue;
    }

    #keepAlive: boolean = false;

    set keepAlive(value: boolean) {
        this.#keepAlive = !!value;

        if (!value && this.observers.length === 0) {
            this.destroySource();
        }
    }

    get keepAlive() {
        return this.#keepAlive;
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

        if (this.observers.length > 0 || this.#keepAlive) {
            this.sourceSubscription = this.source.subscribe(value => this.onSourceNext(value), error => this.onSourceError(error), () => this.onSourceComplete());
        }
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

        if (this.observers.length === 0 || this.#keepAlive) {
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
            this._value = undefined;
            this._hasValue = false;
            this.refresh();
        }
    }

    protected destroySource() {

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

    protected onSourceNext(value: T) {
        let changed = !this._hasValue || !this.#checkEquality ? true : !deepEqual(value, this._value);

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
        if (typeof observerOrNext === "function") {
            return this.observable().subscribe(observerOrNext, error, complete);
        } else {
            return this.observable().subscribe(observerOrNext);
        }
    }

    public unsubscribe() {
        this.destroy();
    }
}
