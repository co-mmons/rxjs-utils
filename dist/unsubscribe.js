"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function unsubscribe(subscription) {
    if (Array.isArray(subscription)) {
        for (var _i = 0, subscription_1 = subscription; _i < subscription_1.length; _i++) {
            var s = subscription_1[_i];
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
exports.unsubscribe = unsubscribe;
//# sourceMappingURL=unsubscribe.js.map