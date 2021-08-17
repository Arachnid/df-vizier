import type { DarkForestCore, DarkForestGetters, DarkForestGPTCredit, DarkForestScoringRound3, Whitelist } from '@darkforest_eth/contracts/typechain';
import { EthConnection } from '@darkforest_eth/network';
import type { providers, Wallet } from 'ethers';
/**
 * Loads the Core game contract, which is responsible for updating the state of the game.
 * @see https://github.com/darkforest-eth/eth/blob/master/contracts/DarkForestCore.sol
 */
export declare function loadCoreContract(address: string, provider: providers.JsonRpcProvider, signer?: Wallet): Promise<DarkForestCore>;
/**
 * Loads the Getters contract, which contains utility view functions which get game objects
 * from the blockchain in bulk.
 * @see https://github.com/darkforest-eth/eth/blob/master/contracts/DarkForestGetters.sol
 */
export declare function loadGettersContract(address: string, provider: providers.JsonRpcProvider, signer?: Wallet): Promise<DarkForestGetters>;
/**
 * Loads the Whitelist contract, which keeps track of which players are allowed to play the game.
 * @see https://github.com/darkforest-eth/eth/blob/master/contracts/Whitelist.sol
 */
export declare function loadWhitelistContract(address: string, provider: providers.JsonRpcProvider, signer?: Wallet): Promise<Whitelist>;
/**
 * Loads ths GPT Credit contract, which players can pay to talk to artifacts.
 * @see https://github.com/darkforest-eth/eth/blob/master/contracts/DarkForestGPTCredit.sol
 */
export declare function loadGptCreditContract(address: string, provider: providers.JsonRpcProvider, signer?: Wallet): Promise<DarkForestGPTCredit>;
/**
 * Loads the Round 3 Scoring contract which tracks claimed planets and player claim cooldowns.
 * @see https://github.com/darkforest-eth/eth/blob/master/contracts/DarkForestRound3Scoring.sol
 */
export declare function loadScoringContract(address: string, provider: providers.JsonRpcProvider, signer?: Wallet): Promise<DarkForestScoringRound3>;
export declare function getEthConnection(): Promise<EthConnection>;
