import { Subject } from "rxjs/Subject";
import { Subscription } from "rxjs/Subscription";
declare type Unsubscribable = Function | Subscription | Subject<any> | {
    unsubscribe: () => any;
};
export declare function unsubscribe(subscription: Unsubscribable | Unsubscribable[]): void;
export {};
