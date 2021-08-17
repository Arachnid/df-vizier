/// <reference types="node" />
import { TransactionReceipt } from '@ethersproject/providers';
import { ContractInterface, Contract } from 'ethers';
import EventEmitter from 'events';
import { Monomitter } from '../../Frontend/Utils/Monomitter';
import { EthAddress } from '@darkforest_eth/types';
import type { DarkForestCore, DarkForestGetters, DarkForestGPTCredit, Whitelist } from '@darkforest_eth/contracts/typechain';
import { ContractEvent } from '../../_types/darkforest/api/ContractsAPITypes';
/**
 * Responsible for
 * 1) loading the contract
 * 2) the in-memory wallet
 * 3) connecting to the correct network
 */
declare class EthConnection extends EventEmitter {
    private static readonly XDAI_DEFAULT_URL;
    readonly blockNumber$: Monomitter<number>;
    private blockNumber;
    private readonly knownAddresses;
    private provider;
    private signer;
    private rpcURL;
    constructor();
    private adjustPollRateBasedOnVisibility;
    getRpcEndpoint(): string;
    hasSigner(): boolean;
    subscribeToEvents(contract: DarkForestCore, handlers: Partial<Record<ContractEvent, any>>): void;
    private processEvents;
    setRpcEndpoint(url: string): Promise<void>;
    loadContract<C extends Contract>(contractAddress: string, contractABI: ContractInterface): Promise<C>;
    loadGettersContract(): Promise<DarkForestGetters>;
    loadCoreContract(): Promise<DarkForestCore>;
    loadWhitelistContract(): Promise<Whitelist>;
    loadGPTCreditContract(): Promise<DarkForestGPTCredit>;
    isWhitelisted(address: EthAddress): Promise<boolean>;
    getAddress(): EthAddress;
    getNonce(): Promise<number>;
    setAccount(address: EthAddress): void;
    addAccount(skey: string): void;
    getKnownAccounts(): EthAddress[];
    signMessage(message: string): Promise<string>;
    verifySignature(message: string, signature: string, address: EthAddress): boolean;
    getBalance(address: EthAddress): Promise<number>;
    getPrivateKey(): string;
    waitForTransaction(txHash: string): Promise<TransactionReceipt>;
}
export default EthConnection;
