import { combineLatest } from "rxjs";
import { map } from "rxjs/operators";
export function namedCombinedLatest(namedObservables) {
    var observables = [];
    var keyByIndex = {};
    var index = -1;
    for (var key in namedObservables) {
        keyByIndex[++index] = key;
        observables.push(namedObservables[key]);
    }
    return combineLatest(observables).pipe(map(function (result) {
        var namedResult = {};
        for (var i = 0; i < result.length; i++) {
            namedResult[keyByIndex[i]] = result[i];
        }
        return namedResult;
    }));
}
//# sourceMappingURL=named-combine-latest.js.map