"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flatCombineLatest = void 0;
const tslib_1 = require("tslib");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const arr_flatten_1 = (0, tslib_1.__importDefault)(require("arr-flatten"));
function flatCombineLatest(...observables) {
    // if the first and only other argument besides the resultSelector is an array
    // assume it's been called with `concatLatest([obs1, obs2, obs3], project)`
    if (observables.length === 1 && Array.isArray(observables[0])) {
        observables = observables[0];
    }
    return (0, rxjs_1.combineLatest)(observables).pipe((0, operators_1.map)(results => {
        if (Array.isArray(results)) {
            return (0, arr_flatten_1.default)(results);
        }
        return [];
    }));
}
exports.flatCombineLatest = flatCombineLatest;
//# sourceMappingURL=flatCombineLatest.js.map