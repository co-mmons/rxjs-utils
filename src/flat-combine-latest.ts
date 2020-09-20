import {Observable, ObservableInput, combineLatest} from "rxjs";
import {map} from "rxjs/operators";
import flatten from "arr-flatten";

export function flatCombineLatest<T>(...observables: ObservableInput<T[]>[]): Observable<T[]>;

export function flatCombineLatest<T>(observables: ObservableInput<T[]>[]): Observable<T[]>;

export function flatCombineLatest<T>(...observables: Array<any | ObservableInput<any> | Array<ObservableInput<any>>>): Observable<T[]> {

    // if the first and only other argument besides the resultSelector is an array
    // assume it's been called with `concatLatest([obs1, obs2, obs3], project)`
    if (observables.length === 1 && Array.isArray(observables[0])) {
        observables = <Array<Observable<any>>>observables[0];
    }

    return combineLatest(observables).pipe(map(results => {

        if (Array.isArray(results)) {
            return flatten(results);
        }

        return [];
    }));

}