import type { LocationId } from "@darkforest_eth/types";
import Renderer from "../Renderer";
export declare class WormholeRenderer {
    renderer: Renderer;
    constructor(renderer: Renderer);
    queueWormholes(): void;
    drawVoyagePath(from: LocationId, to: LocationId, confirmed: boolean): void;
}
