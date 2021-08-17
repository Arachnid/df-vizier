export declare class Lazy<T> {
    getPromise: () => Promise<T>;
    promise: Promise<T> | undefined;
    constructor(getPromise: () => Promise<T>);
    get(): Promise<T>;
}
export declare function lazy<T>(getPromise: () => Promise<T>): Lazy<T>;
