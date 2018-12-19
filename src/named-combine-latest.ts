import {combineLatest, Observable} from "rxjs";
import {map} from "rxjs/operators";

export function namedCombineLatest<T extends {[K in keyof T]: T[K]}>(namedObservables: {[K in keyof T]: Observable<T[K]>}): Observable<{[K in keyof T]: T[K]}> {

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