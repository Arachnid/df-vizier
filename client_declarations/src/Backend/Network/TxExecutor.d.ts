/// <reference types="node" />
import { EventEmitter } from "events";
import { Contract, providers } from "ethers";
import { EthTxType } from "@darkforest_eth/types";
import EthConnection from "./EthConnection";
import { DiagnosticUpdater } from "../Interfaces/DiagnosticUpdater";
export interface QueuedTxRequest {
    onSubmissionError: (e: Error) => void;
    onReceiptError: (e: Error) => void;
    onTransactionResponse: (e: providers.TransactionResponse) => void;
    onTransactionReceipt: (e: providers.TransactionReceipt) => void;
    type: EthTxType;
    actionId: string;
    contract: Contract;
    args: unknown[];
    overrides: providers.TransactionRequest;
}
export interface PendingTransaction {
    submitted: Promise<providers.TransactionResponse>;
    confirmed: Promise<providers.TransactionReceipt>;
}
export declare class TxExecutor extends EventEmitter {
    /**
     * tx is considered to have errored if haven't successfully
     * submitted to mempool within 30s
     */
    private static readonly TX_SUBMIT_TIMEOUT;
    /**
     * we refresh the nonce if it hasn't been updated in this amount of time
     */
    private static readonly NONCE_STALE_AFTER_MS;
    /**
     * don't allow users to submit txs if balance falls below
     */
    private static readonly MIN_BALANCE_ETH;
    private txQueue;
    private lastTransaction;
    private nonce;
    private eth;
    private diagnosticsUpdater?;
    constructor(ethConnection: EthConnection, nonce: number);
    /**
     * Schedules this transaction to execute once all of the transactions
     * ahead of it have completed.
     */
    makeRequest<T, U>(type: EthTxType, actionId: string, contract: Contract, args: unknown[], overrides?: providers.TransactionRequest): PendingTransaction;
    private maybeUpdateNonce;
    private checkBalance;
    private execute;
    setDiagnosticUpdater(diagnosticUpdater?: DiagnosticUpdater): void;
}
