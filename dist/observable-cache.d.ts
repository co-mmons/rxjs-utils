import { Observable } from "rxjs/Observable";
import { Subscription } from "rxjs/Subscription";
import { Observer } from "rxjs/Observer";
export declare class ObservableCache {
    protected readonly sourceFactory: () => Observable<any>;
    constructor(sourceFactory: () => Observable<any>);
    protected source: Observable<any>;
    protected sourceSubscription: Subscription;
    protected value: any;
    protected hasValue: boolean;
    private observers;
    observable(): Observable<any>;
    protected pushObserver(observable: Observer<any>): void;
    protected pullObserver(observer: Observer<any>): void;
    protected readonly initialized: boolean;
    protected initialize(): void;
    protected destroySource(): void;
    protected onSourceNext(value: any): void;
    protected onSourceError(error: any): void;
    protected onSourceComplete(): void;
    destroy(): void;
    unsubscribe(): void;
}
