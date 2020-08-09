import { Observable, ObservableInput } from "rxjs";
export declare function flatCombineLatest<T>(...observables: ObservableInput<T[]>[]): Observable<T[]>;
export declare function flatCombineLatest<T>(observables: ObservableInput<T[]>[]): Observable<T[]>;
