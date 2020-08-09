import { MonoTypeOperatorFunction } from "rxjs";
export declare function silentTimeout<T>(timeout: number, onTimeout: () => void): MonoTypeOperatorFunction<T>;
