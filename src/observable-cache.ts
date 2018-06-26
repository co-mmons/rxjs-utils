import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import {Subscriber} from "rxjs/Subscriber";
import {ISubscription, Subscription, TeardownLogic} from "rxjs/Subscription";
import {Observer} from "rxjs/Observer";

class CachedObservable extends Subject<any> {

    constructor(private factory: ObservableCache) {
        super();
    }

    _trySubscribe(subscriber: Subscriber<any>): TeardownLogic {
        let subscription: TeardownLogic = super._trySubscribe(subscriber);

        if (subscription && (!("closed" in subscription) || !(<ISubscription>subscription).closed)) {

            this.factory["pushObserver"](this);

            if (!this.factory["initialized"]) {
                this.factory["initialize"]();

            } else if (this.factory["hasValue"]) {
                subscriber.next(this.factory["value"]);
            }
        }

        return subscription;
    }

    unsubscribe(): void {
        super.unsubscribe();
        this.factory["pullObserver"](this);
    }
}


export class ObservableCache {

    constructor(protected readonly sourceFactory: () => Observable<any>) {
    }

    
    protected source: Observable<any>;

    protected sourceSubscription: Subscription;

    protected value: any;

    protected hasValue: boolean = false;

    private observers: Observer<any>[] = [];


    public observable(): Observable<any> {
        return new CachedObservable(this);
    }

    protected pushObserver(observable: Observer<any>) {
        this.observers.push(observable);
    }

    protected pullObserver(observer: Observer<any>) {
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

    protected onSourceNext(value: any) {
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

    public unsubscribe() {
        this.destroy();
    }
}
