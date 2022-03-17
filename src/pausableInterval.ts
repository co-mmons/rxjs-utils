import {Subject, Subscription, Subscriber, Observable} from "rxjs";

class PausableInterval extends Subject<any> {

    constructor(private interval: number, private pause: Observable<any>, private resume: Observable<any>) {
        super();
    }

    private startTimer() {
        if (!this.timer) {
            this.timer = setInterval(() => this.onInterval(), this.interval);

            if (!this.pauseSubscription && this.pause) {
                this.pauseSubscription = this.pause.subscribe(() => this.paused());
            }

            if (!this.resumeSubscription && this.resume) {
                this.resumeSubscription = this.resume.subscribe(() => this.resumed());
            }
        }
    }

    private stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = undefined;
        }
    }

    _subscribe(subscriber: Subscriber<any>): Subscription {
        this.startTimer();
        return super._subscribe(subscriber);
    }

    unsubscribe(): void {
        this.stopTimer();
        
        if (this.pauseSubscription) {
            this.pauseSubscription.unsubscribe();
            this.pauseSubscription = undefined;
        }

        if (this.resumeSubscription) {
            this.resumeSubscription.unsubscribe();
            this.resumeSubscription = undefined;
        }

        super.unsubscribe();
    }

    private onInterval() {

        if (this.observers.length == 0) {
            this.stopTimer();
            return;
        }
        
        this.next();
    }

    private paused() {
        this.stopTimer();
    }

    private resumed() {
        this.startTimer();
        this.next();
    }

    private pauseSubscription: Subscription;

    private resumeSubscription: Subscription;

    private timer: any;

}

export function pausableInterval(interval: number, pause: Observable<any>, resume: Observable<any>): Observable<any> {
    return new PausableInterval(interval, pause, resume);
}