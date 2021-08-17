import { EmojiFlagBody, LocatablePlanet, LocationId, Planet, PlanetMessage, WorldCoords, WorldLocation } from '@darkforest_eth/types';
import { Dispatch, SetStateAction } from 'react';
import GameManager from '../../Backend/GameLogic/GameManager';
import GameUIManager from '../../Backend/GameLogic/GameUIManager';
export declare type Hook<T> = [T, Dispatch<SetStateAction<T>>];
export declare type Wormhole = {
    from: LocationId;
    to: LocationId;
};
declare global {
    interface Window {
        snarkjs: any;
        df?: GameManager;
        ui?: GameUIManager;
    }
}
export declare type HashConfig = {
    planetHashKey: number;
    spaceTypeKey: number;
    biomebaseKey: number;
    perlinLengthScale: number;
    perlinMirrorX: boolean;
    perlinMirrorY: boolean;
};
export declare const enum StatIdx {
    EnergyCap = 0,
    EnergyGro = 1,
    Range = 2,
    Speed = 3,
    Defense = 4
}
export declare function isLocatable(planet: Planet): planet is LocatablePlanet;
export declare function isEmojiFlagMessage(planetMessage: PlanetMessage<unknown>): planetMessage is PlanetMessage<EmojiFlagBody>;
/**
 * Ok, this is gonna sound weird, but all rectangles are squares. Also, we only permit side lengths
 * that are powers of two, and ALSO!! The side lengths must be between {@link MIN_CHUNK_SIZE} and
 * {@link MAX_CHUNK_SIZE}.
 */
export interface Rectangle {
    bottomLeft: WorldCoords;
    sideLength: number;
}
/**
 * Represents a fully mined aligned square.
 */
export declare class Chunk {
    chunkFootprint: Rectangle;
    planetLocations: WorldLocation[];
    perlin: number;
}
export interface MinerWorkerMessage {
    chunkFootprint: Rectangle;
    workerIndex: number;
    totalWorkers: number;
    planetRarity: number;
    jobId: number;
    useMockHash: boolean;
    planetHashKey: number;
    spaceTypeKey: number;
    biomebaseKey: number;
    perlinLengthScale: number;
    perlinMirrorX: boolean;
    perlinMirrorY: boolean;
}
export interface RevealCountdownInfo {
    myLastRevealTimestamp?: number;
    currentlyRevealing: boolean;
    revealCooldownTime: number;
}
export interface ClaimCountdownInfo {
    myLastClaimTimestamp?: number;
    currentlyClaiming: boolean;
    claimCooldownTime: number;
}
