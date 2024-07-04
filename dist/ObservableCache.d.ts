import { Observable, Subscription, Observer, PartialObserver } from "rxjs";
export interface ObservableCacheParams {
    id?: string | symbol;
    checkEquality?: boolean;
    keepValue?: boolean;
    keepAlive?: boolean;
}
export declare class ObservableCache<T = any> {
    #private;
    protected readonly sourceFactory: () => Observable<T>;
    constructor(sourceFactory: () => Observable<T>, paramsOrId?: ObservableCacheParams | string);
    readonly id: string | symbol | undefined;
    protected source: Observable<T>;
    protected sourceSubscription: Subscription;
    protected _value: any;
    protected _hasValue: boolean;
    private observers;
    setCheckEquality(value: boolean): this;
    observable(): Observable<T>;
    hasValue(): boolean;
    value(): T;
    set keepValue(keepValue: boolean);
    get keepValue(): boolean;
    set keepAlive(value: boolean);
    get keepAlive(): boolean;
    get observersCount(): number;
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
