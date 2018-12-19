import { Observable } from "rxjs";
export declare function namedCombineLatest<T extends {
    [K in keyof T]: T[K];
}>(namedObservables: {
    [K in keyof T]: Observable<T[K]>;
}): Observable<{
    [K in keyof T]: T[K];
}>;
