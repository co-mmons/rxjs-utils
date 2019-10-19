import { combineLatest } from "rxjs";
import { map } from "rxjs/operators";
export function namedCombineLatest(namedObservables) {
    let observables = [];
    let keyByIndex = {};
    let index = -1;
    for (let key in namedObservables) {
        keyByIndex[++index] = key;
        observables.push(namedObservables[key]);
    }
    return combineLatest(observables).pipe(map(result => {
        let namedResult = {};
        for (let i = 0; i < result.length; i++) {
            namedResult[keyByIndex[i]] = result[i];
        }
        return namedResult;
    }));
}
//# sourceMappingURL=named-combine-latest.js.map