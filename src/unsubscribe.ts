import {Subscription} from "rxjs/Subscription";

export function unsubscribe(subscription: Function | Subscription) {

    if (subscription) {
        if (typeof subscription == "function") {
            subscription();
        } else {
            subscription.unsubscribe();
        }
    }
}