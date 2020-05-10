import {Subject, Subscription} from "rxjs";

export type Unsubscribable = Function | Subscription | Subject<any> | {unsubscribe: () => any};

export function unsubscribe(subscription: Unsubscribable | Unsubscribable[]) {

    if (Array.isArray(subscription)) {

        for (let s of subscription) {
            unsubscribe(s);
        }

    } else if (subscription) {

        if (typeof subscription == "function") {
            subscription();
        } else if (!("closed" in subscription) || !subscription.closed) {
            subscription.unsubscribe();
        }
    }
}
