/**
 * You can schedule a function to be executed {@code waitThisLong} in the future. If you
 * schedule again, the previously scheduled function will not be executed.
 */
export declare class BlockWaiter {
    private timeout?;
    private waitThisLong;
    constructor(waitThisLong: number);
    schedule(func: () => void): void;
}
