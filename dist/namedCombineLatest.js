"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.namedCombineLatest = void 0;
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
function namedCombineLatest(namedObservables) {
    let observables = [];
    let keyByIndex = {};
    let index = -1;
    for (let key in namedObservables) {
        keyByIndex[++index] = key;
        observables.push(namedObservables[key]);
    }
    return (0, rxjs_1.combineLatest)(observables).pipe((0, operators_1.map)(result => {
        let namedResult = {};
        for (let i = 0; i < result.length; i++) {
            namedResult[keyByIndex[i]] = result[i];
        }
        return namedResult;
    }));
}
exports.namedCombineLatest = namedCombineLatest;
//# sourceMappingURL=namedCombineLatest.js.map