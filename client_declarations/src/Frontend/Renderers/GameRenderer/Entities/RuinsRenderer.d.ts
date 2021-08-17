import { Planet, WorldCoords } from "@darkforest_eth/types";
import { CanvasCoords } from "../../../../Backend/Utils/Coordinates";
import { RGBVec } from "../EngineTypes";
import { RUINS_PROGRAM_DEFINITION } from "../Programs/RuinsProgram";
import { GenericRenderer } from "../WebGL/GenericRenderer";
import { WebGLManager } from "../WebGL/WebGLManager";
export declare class RuinsRenderer extends GenericRenderer<typeof RUINS_PROGRAM_DEFINITION> {
    quad3Buffer: number[];
    quad2Buffer: number[];
    constructor(manager: WebGLManager);
    queueRuinsScreen(planet: Planet, center: CanvasCoords, radius: number, z: number): void;
    queueBloom(center: CanvasCoords, radius: number, z: number, color: RGBVec, weights: [number, number, number, number], props: [number, number, number, number]): void;
    queueRuins(planet: Planet, centerW: WorldCoords, radiusW: number): void;
    setUniforms(): void;
}
