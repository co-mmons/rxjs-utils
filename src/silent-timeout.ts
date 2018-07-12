import {MonoTypeOperatorFunction, Observable, Operator, Subscriber} from "rxjs";

function silentTimeout<T>(timeout: number, onTimeout: () => void): MonoTypeOperatorFunction<T> {
    return function (source: Observable<T>): Observable<T> {
        return source.lift(new SilentTimeoutOperator(timeout, onTimeout));
    };
}

class SilentTimeoutOperator<T> implements Operator<T, T> {
    constructor(private timeout: number, private timeoutCallback: () => void) {
    }

    call(subscriber: Subscriber<T>, source: any): any {
        return source.subscribe(new SilentTimeoutSubscriber(subscriber, this.timeout, this.timeoutCallback));
    }
}

class SilentTimeoutSubscriber<T, R> extends Subscriber<T> {

    constructor(destination: Subscriber<R>, timeout: number, private timeoutCallback: () => void) {
        super(destination);

        this.timeoutId = setTimeout(() => this.callCallback(), timeout);
    }

    private callCallback() {

        if (!this.isStopped && !this.closed) {
            this.timeoutCallback();
        }

        this.clearTimeout();
    }

    private timeoutId: any;

    private clearTimeout() {
        if (this.timeoutId) {
            clearInterval(this.timeoutId);
            this.timeoutId = undefined;
            this.timeoutCallback = undefined;
        }
    }

    protected _complete() {
        super._complete();
        this.clearTimeout();
    }

    protected _error(error: any) {
        super._error(error);
        this.clearTimeout();
    }

    protected _next(value: T) {
        super._next(value);
        this.clearTimeout();
    }

    unsubscribe() {
        this.clearTimeout();
        super.unsubscribe();
    }

}
