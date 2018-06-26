import {Subject} from "rxjs/Subject";
import {Subscription} from "rxjs/Subscription";

type Unsubscribable = Function | Subscription | Subject<any> | {unsubscribe: () => any};

export function unsubscribe(subscription: Unsubscribable | Unsubscribable[]) {

    if (Array.isArray(subscription)) {
        
        for (let s of subscription) {
            unsubscribe(s);
        }

    } else if (subscription) {
        
        if (typeof subscription == "function") {
            subscription();
        } else {
            subscription.unsubscribe();
        }
    }
}