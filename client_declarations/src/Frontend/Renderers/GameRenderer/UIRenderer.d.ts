import { Planet, WorldCoords } from "@darkforest_eth/types";
import { RGBVec } from "./EngineTypes";
import Renderer from "./Renderer";
export declare class UIRenderer {
    renderer: Renderer;
    constructor(renderer: Renderer);
    queueBorders(): void;
    queueMousePath(): void;
    queueRectAtPlanet(planet: Planet, coords: WorldCoords, color: RGBVec): void;
    queueSelectedRect(): void;
    queueHoveringRect(): void;
    drawMiner(): void;
    queueSelectedRangeRing(): void;
}
