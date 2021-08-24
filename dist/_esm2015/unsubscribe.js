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
        else if (!("closed" in subscription) || !subscription.closed) {
            subscription.unsubscribe();
        }
    }
    return undefined;
}
//# sourceMappingURL=unsubscribe.js.map