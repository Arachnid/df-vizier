/**
 * A queue that executes promises with a max throughput, and optionally max
 * concurrency.
 */
export declare class ThrottledConcurrentQueue {
    /**
     * The interval during which we only allow a certain maximum amount of tasks
     * to be executed.
     */
    private readonly invocationIntervalMs;
    /**
     * Maximum amount of tasks that can be executing at the same time.
     */
    private readonly maxConcurrency;
    /**
     * Queue of tasks to execute. Added to the front, popped off the back.
     */
    private taskQueue;
    /**
     * Each time a task is executed, record the start of its execution time.
     * Execution timestamps are removed when they become outdated. Used for
     * keeping the amount of executions under the throttle limit.
     */
    private executionTimestamps;
    /**
     * Amount of tasks being executed right now.
     */
    private concurrency;
    /**
     * When we schedule an attempt at executing another task in the future,
     * we don't want to schedule it more than once. Therefore, we keep track
     * of this scheduled attempt.
     */
    private executionTimeout;
    constructor(maxInvocationsPerIntervalMs: number, invocationIntervalMs: number, maxConcurrency?: number);
    /**
     * Adds a task to be executed at some point in the future. Returns a promise
     * that resolves when the task finishes successfully, and rejects when there
     * is an error.
     *
     * @param generator a function that returns a promise representing the task
     */
    add<T>(generator: () => Promise<T>): Promise<T>;
    /**
     * Returns the amount of queued items, not including the ones that are being executed at this moment.
     */
    size(): number;
    /**
     * Runs tasks until it's at either the throttle or concurrency limit. If there are more
     * tasks to be executed after that, schedules itself to execute again at the soonest
     * possible moment.
     */
    private executeNextTasks;
    /**
     * Returns the soonest possible time from now we could execute another task without going
     * over the throttle limit.
     */
    private nextPossibleExecution;
    /**
     * At this moment, how many more tasks we could execute without exceeding the
     * concurrency quota.
     */
    private concurrencyQuotaRemaining;
    /**
     * At this moment, how many more tasks we could execute without exceeding the
     * throttle quota.
     */
    private throttleQuotaRemaining;
    /**
     * Removes all task execution timestamps that are older than [[this.invocationIntervalMs]],
     * because those invocations have no bearing on whether or not we can execute another task.
     */
    private deleteOutdatedExecutionTimestamps;
    /**
     * If there is a next task to execute, executes it. Records the time of execution in
     * [[executionTimestamps]]. Increments and decrements concurrency counter. Neither throttles
     * nor limits concurrency.
     */
    private next;
}
