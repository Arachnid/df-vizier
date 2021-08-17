/// <reference types="node" />
import type { DarkForestCore, DarkForestGetters, DarkForestGPTCredit, DarkForestScoringRound3, Whitelist } from "@darkforest_eth/contracts/typechain";
import { ContractCaller, EthConnection, QueuedTransaction, TxExecutor } from "@darkforest_eth/network";
import type { BiomebaseSnarkContractCallArgs, InitSnarkContractCallArgs, MoveSnarkContractCallArgs, RevealSnarkContractCallArgs } from "@darkforest_eth/snarks";
import { Artifact, ArtifactId, ClaimedCoords, DiagnosticUpdater, EthAddress, LocationId, Planet, Player, QueuedArrival, RevealedCoords, SubmittedTx, UnconfirmedActivateArtifact, UnconfirmedClaim, UnconfirmedDeactivateArtifact, UnconfirmedDepositArtifact, UnconfirmedInit, UnconfirmedReveal, UnconfirmedWithdrawArtifact, UnconfirmedWithdrawSilver, WorldLocation } from "@darkforest_eth/types";
import { BigNumber as EthersBN, ContractFunction, ethers, providers } from "ethers";
import { EventEmitter } from "events";
import { ClaimArgs, ContractConstants, UpgradeArgs } from "../../_types/darkforest/api/ContractsAPITypes";
/**
 * Roughly contains methods that map 1:1 with functions that live in the contract. Responsible for
 * reading and writing to and from the blockchain.
 *
 * @todo don't inherit from {@link EventEmitter}. instead use {@link Monomitter}
 */
export declare class ContractsAPI extends EventEmitter {
    /**
     * Don't allow users to submit txs if balance falls below this amount/
     */
    static readonly MIN_BALANCE: EthersBN;
    /**
     * Instrumented {@link ThrottledConcurrentQueue} for blockchain reads.
     */
    readonly contractCaller: ContractCaller;
    /**
     * Instrumented {@link ThrottledConcurrentQueue} for blockchain writes.
     */
    readonly txExecutor: TxExecutor | undefined;
    /**
     * Our connection to the blockchain. In charge of low level networking, and also of the burner
     * wallet.
     */
    ethConnection: EthConnection;
    get coreContract(): DarkForestCore;
    get scoreContract(): DarkForestScoringRound3;
    get gettersContract(): DarkForestGetters;
    get whitelistContract(): Whitelist;
    get gptCreditContract(): DarkForestGPTCredit;
    constructor(ethConnection: EthConnection);
    /**
     * This function is called by {@link TxExecutor} before each transaction. It gives the client an
     * opportunity to prevent a transaction from going through based on business logic or user
     * interaction. To prevent the queued transaction from being submitted, throw an Error.
     */
    beforeTransaction(txRequest: QueuedTransaction): Promise<void>;
    afterTransaction(_txRequest: QueuedTransaction, txDiagnosticInfo: unknown): Promise<void>;
    destroy(): void;
    makeCall<T>(contractViewFunction: ContractFunction<T>, args?: unknown[]): Promise<T>;
    setupEventListeners(): Promise<void>;
    removeEventListeners(): void;
    getContractAddress(): EthAddress;
    /**
     * Given an unconfirmed (but submitted) transaction, emits the appropriate
     * [[ContractsAPIEvent]].
     */
    waitFor(submitted: SubmittedTx, receiptPromise: Promise<providers.TransactionReceipt>): Promise<ethers.providers.TransactionReceipt>;
    reveal(args: RevealSnarkContractCallArgs, action: UnconfirmedReveal): Promise<providers.TransactionReceipt>;
    claim(args: ClaimArgs, action: UnconfirmedClaim): Promise<providers.TransactionReceipt>;
    initializePlayer(args: InitSnarkContractCallArgs, action: UnconfirmedInit): Promise<providers.TransactionReceipt>;
    transferOwnership(planetId: LocationId, newOwner: EthAddress, actionId: string): Promise<providers.TransactionReceipt>;
    upgradePlanet(args: UpgradeArgs, actionId: string): Promise<providers.TransactionReceipt>;
    prospectPlanet(planetId: LocationId, actionId: string): Promise<ethers.providers.TransactionReceipt>;
    findArtifact(location: WorldLocation, biomeSnarkArgs: BiomebaseSnarkContractCallArgs, actionId: string): Promise<providers.TransactionReceipt>;
    depositArtifact(action: UnconfirmedDepositArtifact): Promise<providers.TransactionReceipt>;
    withdrawArtifact(action: UnconfirmedWithdrawArtifact): Promise<providers.TransactionReceipt>;
    activateArtifact(action: UnconfirmedActivateArtifact): Promise<ethers.providers.TransactionReceipt>;
    deactivateArtifact(action: UnconfirmedDeactivateArtifact): Promise<ethers.providers.TransactionReceipt>;
    move(actionId: string, snarkArgs: MoveSnarkContractCallArgs, shipsMoved: number, silverMoved: number, artifactMoved?: ArtifactId): Promise<providers.TransactionReceipt>;
    buyHat(planetIdDecStr: string, currentHatLevel: number, actionId: string): Promise<ethers.providers.TransactionReceipt>;
    withdrawSilver(action: UnconfirmedWithdrawSilver): Promise<providers.TransactionReceipt>;
    buyGPTCredits(amount: number, actionId: string): Promise<ethers.providers.TransactionReceipt>;
    getGPTCreditPriceEther(): Promise<number>;
    getGPTCreditBalance(address: EthAddress | undefined): Promise<number>;
    getScoreV3(address: EthAddress | undefined): Promise<number | undefined>;
    getConstants(): Promise<ContractConstants>;
    getPlayers(onProgress?: (fractionCompleted: number) => void): Promise<Map<string, Player>>;
    getPlayerById(playerId: EthAddress): Promise<Player | undefined>;
    getWorldRadius(): Promise<number>;
    getTokenMintEndTimestamp(): Promise<number>;
    getContractBalance(): Promise<number>;
    getArrival(arrivalId: number): Promise<QueuedArrival | undefined>;
    getArrivalsForPlanet(planetId: LocationId): Promise<QueuedArrival[]>;
    getAllArrivals(planetsToLoad: LocationId[], onProgress?: (fractionCompleted: number) => void): Promise<QueuedArrival[]>;
    getTouchedPlanetIds(startingAt: number, onProgress?: (fractionCompleted: number) => void): Promise<LocationId[]>;
    getRevealedCoordsByIdIfExists(planetId: LocationId): Promise<RevealedCoords | undefined>;
    getRevealedPlanetsCoords(startingAt: number, onProgressIds?: (fractionCompleted: number) => void, onProgressCoords?: (fractionCompleted: number) => void): Promise<RevealedCoords[]>;
    getClaimedCoordsByIdIfExists(planetId: LocationId): Promise<ClaimedCoords | undefined>;
    getClaimedPlanetsCoords(startingAt: number, onProgressIds?: (fractionCompleted: number) => void, onProgressCoords?: (fractionCompleted: number) => void): Promise<ClaimedCoords[]>;
    bulkGetPlanets(toLoadPlanets: LocationId[], onProgressPlanet?: (fractionCompleted: number) => void, onProgressMetadata?: (fractionCompleted: number) => void): Promise<Map<LocationId, Planet>>;
    getPlanetById(planetId: LocationId): Promise<Planet | undefined>;
    getArtifactById(artifactId: ArtifactId): Promise<Artifact | undefined>;
    bulkGetArtifactsOnPlanets(locationIds: LocationId[], onProgress?: (fractionCompleted: number) => void): Promise<Artifact[][]>;
    bulkGetArtifacts(artifactIds: ArtifactId[], onProgress?: (fractionCompleted: number) => void): Promise<Artifact[]>;
    getPlayerArtifacts(playerId?: EthAddress, onProgress?: (percent: number) => void): Promise<Artifact[]>;
    hasAccount(): boolean;
    getAccount(): EthAddress | undefined;
    getBalance(): Promise<EthersBN>;
    setDiagnosticUpdater(diagnosticUpdater?: DiagnosticUpdater): void;
}
export declare function makeContractsAPI(ethConnection: EthConnection): Promise<ContractsAPI>;
