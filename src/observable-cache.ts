import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import {Subscriber} from "rxjs/Subscriber";
import {ISubscription, Subscription, TeardownLogic} from "rxjs/Subscription";
import {Observer, PartialObserver} from "rxjs/Observer";

class CachedObservable<T> extends Subject<T> {

    constructor(private factory: ObservableCache) {
        super();
    }

    _trySubscribe(subscriber: Subscriber<T>): TeardownLogic {
        let subscription: TeardownLogic = super._trySubscribe(subscriber);

        if (subscription && (!("closed" in subscription) || !(<ISubscription>subscription).closed)) {

            this.factory["pushObserver"](this);

            if (!this.factory["initialized"]) {
                this.factory["initialize"]();

            } else if (this.factory["hasValue"]) {
                subscriber.next(this.factory["value"]);
            }

            let niu = new Subscription(() => this.subscriptionClosed());
            niu.add(subscription);
            subscription = niu;
        }

        return subscription;
    }

    private subscriptionClosed() {
        if (this.observers.length == 0) {
            this.factory["pullObserver"](this);
        }
    }

    unsubscribe(): void {
        super.unsubscribe();
        this.factory["pullObserver"](this);
    }
}


export class ObservableCache<T = any> {

    constructor(protected readonly sourceFactory: () => Observable<T>) {
    }

    
    protected source: Observable<T>;

    protected sourceSubscription: Subscription;

    protected value: any;

    protected hasValue: boolean = false;

    private observers: Observer<T>[] = [];


    public observable(): Observable<T> {
        return new CachedObservable(this);
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
            this.value = undefined;
            this.hasValue = false;
            this.sourceSubscription = this.source.subscribe(value => this.onSourceNext(value), error => this.onSourceError(error), () => this.onSourceComplete());
        }
    }

    protected destroySource() {

        if (this.sourceSubscription) {
            this.sourceSubscription.unsubscribe();
        }

        this.sourceSubscription = undefined;
        this.source = undefined;
        this.value = undefined;
        this.hasValue = false;
    }

    protected onSourceNext(value: T) {
        let changed = !this.hasValue ? true : (JSON.stringify(value) != JSON.stringify(this.value));

        this.hasValue = true;
        this.value = value;

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
