import { Observable } from "rxjs";
export declare function silentTimeout<T>(this: Observable<T>, timeout: number, onTimeout: () => void): Observable<T>;
