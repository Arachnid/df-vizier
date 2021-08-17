import { WorldCoords } from '@darkforest_eth/types';
import { Rectangle } from '../../_types/global/GlobalTypes';
export declare const enum MiningPatternType {
    Home = 0,
    Target = 1,
    Spiral = 2,
    Cone = 3,
    Grid = 4,
    ETH = 5,
    SwissCheese = 6
}
export interface MiningPattern {
    type: MiningPatternType;
    fromChunk: Rectangle;
    nextChunk: (prevLoc: Rectangle) => Rectangle;
}
export declare class SpiralPattern implements MiningPattern {
    type: MiningPatternType;
    fromChunk: Rectangle;
    chunkSideLength: number;
    constructor(center: WorldCoords, chunkSize: number);
    nextChunk(chunk: Rectangle): Rectangle;
}
export declare class SwissCheesePattern implements MiningPattern {
    type: MiningPatternType;
    fromChunk: Rectangle;
    chunkSideLength: number;
    constructor(center: WorldCoords, chunkSize: number);
    nextChunk(chunk: Rectangle): Rectangle;
}
