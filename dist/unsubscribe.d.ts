import { Subject } from "rxjs/Subject";
import { Subscription } from "rxjs/Subscription";
export declare function unsubscribe(subscription: Function | Subscription | Subject<any> | {
    unsubscribe: () => any;
}): void;
