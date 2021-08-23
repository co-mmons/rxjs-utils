import { Observable, Subscription, Observer, PartialObserver } from "rxjs";
export declare class ObservableCache<T = any> {
    protected readonly sourceFactory: () => Observable<T>;
    readonly id?: any;
    constructor(sourceFactory: () => Observable<T>, id?: any);
    protected source: Observable<T>;
    protected sourceSubscription: Subscription;
    protected _value: any;
    protected _hasValue: boolean;
    private observers;
    private _checkEquality;
    setCheckEquality(value: boolean): this;
    observable(): Observable<T>;
    hasValue(): boolean;
    value(): T;
    refresh(): void;
    protected pushObserver(observer: Observer<T>): void;
    protected pullObserver(observer: Observer<T>): void;
    protected get initialized(): boolean;
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
