export function unsubscribe(subscription) {
    if (Array.isArray(subscription)) {
        for (let s of subscription) {
            unsubscribe(s);
        }
    }
    else if (subscription) {
        if (typeof subscription == "function") {
            subscription();
        }
        else {
            subscription.unsubscribe();
        }
    }
}
//# sourceMappingURL=unsubscribe.js.map