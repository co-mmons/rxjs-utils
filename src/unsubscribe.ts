import {Subject} from "rxjs/Subject";
import {Subscription} from "rxjs/Subscription";

export function unsubscribe(subscription: Function | Subscription | Subject<any> | {unsubscribe: () => any}) {

    if (subscription) {
        if (typeof subscription == "function") {
            subscription();
        } else {
            subscription.unsubscribe();
        }
    }
}