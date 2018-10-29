import { Observable } from "rxjs";
export declare function namedCombineLatest<R extends {
    [key: string]: any;
}>(namedObservables: {
    [key: string]: Observable<any>;
}): Observable<R>;
