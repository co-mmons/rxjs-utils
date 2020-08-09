"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.namedCombineLatest = void 0;
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
function namedCombineLatest(namedObservables) {
    var observables = [];
    var keyByIndex = {};
    var index = -1;
    for (var key in namedObservables) {
        keyByIndex[++index] = key;
        observables.push(namedObservables[key]);
    }
    return rxjs_1.combineLatest(observables).pipe(operators_1.map(function (result) {
        var namedResult = {};
        for (var i = 0; i < result.length; i++) {
            namedResult[keyByIndex[i]] = result[i];
        }
        return namedResult;
    }));
}
exports.namedCombineLatest = namedCombineLatest;
//# sourceMappingURL=named-combine-latest.js.map