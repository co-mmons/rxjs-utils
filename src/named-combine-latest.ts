import {combineLatest, Observable} from "rxjs";
import {map} from "rxjs/operators";

export function namedCombineLatest<R extends {[key: string]: any}>(namedObservables: {[key: string]: Observable<any>}): Observable<R> {

    let observables: Observable<any>[] = [];
    let keyByIndex = {};
    let index = -1;
    for (let key in namedObservables) {
        keyByIndex[++index] = key;
        observables.push(namedObservables[key]);
    }

    return combineLatest(observables).pipe(map(result => {

        let namedResult: any = {};
        for (let i = 0; i < result.length; i++) {
            namedResult[keyByIndex[i]] = result[i];
        }

        return namedResult;

    }));
}
