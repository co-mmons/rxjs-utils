"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function unsubscribe(subscription) {
    if (subscription) {
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