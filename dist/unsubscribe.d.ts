import { Subject, Subscription } from "rxjs";
declare type Unsubscribable = Function | Subscription | Subject<any> | {
    unsubscribe: () => any;
};
export declare function unsubscribe(subscription: Unsubscribable | Unsubscribable[]): void;
export {};
