"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unsubscribe = void 0;
function unsubscribe(subscription) {
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
}
exports.unsubscribe = unsubscribe;
//# sourceMappingURL=unsubscribe.js.map