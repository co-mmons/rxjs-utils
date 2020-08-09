"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flatCombineLatest = void 0;
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var flatten = require("arr-flatten");
function flatCombineLatest() {
    var observables = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        observables[_i] = arguments[_i];
    }
    // if the first and only other argument besides the resultSelector is an array
    // assume it's been called with `concatLatest([obs1, obs2, obs3], project)`
    if (observables.length === 1 && Array.isArray(observables[0])) {
        observables = observables[0];
    }
    return rxjs_1.combineLatest(observables).pipe(operators_1.map(function (results) {
        if (Array.isArray(results)) {
            return flatten(results);
        }
        return [];
    }));
}
exports.flatCombineLatest = flatCombineLatest;
//# sourceMappingURL=flat-combine-latest.js.map