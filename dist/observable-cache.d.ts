import { Observable } from "rxjs/Observable";
import { Subscription } from "rxjs/Subscription";
import { Observer, PartialObserver } from "rxjs/Observer";
export declare class ObservableCache<T = any> {
    protected readonly sourceFactory: () => Observable<T>;
    constructor(sourceFactory: () => Observable<T>);
    protected source: Observable<T>;
    protected sourceSubscription: Subscription;
    protected value: any;
    protected hasValue: boolean;
    private observers;
    observable(): Observable<T>;
    protected pushObserver(observer: Observer<T>): void;
    protected pullObserver(observer: Observer<T>): void;
    protected readonly initialized: boolean;
    protected initialize(): void;
    protected destroySource(): void;
    protected onSourceNext(value: T): void;
    protected onSourceError(error: any): void;
    protected onSourceComplete(): void;
    destroy(): void;
    subscribe(observer?: PartialObserver<T>): Subscription;
    subscribe(next?: (value: T) => void, error?: (error: any) => void, complete?: () => void): Subscription;
    unsubscribe(): void;
}
