import { Subject, Subscription } from "rxjs";
export declare type Unsubscribable = Function | Subscription | Subject<any> | {
    unsubscribe: () => any;
};
export declare function unsubscribe(subscription: Unsubscribable | Unsubscribable[]): void;
