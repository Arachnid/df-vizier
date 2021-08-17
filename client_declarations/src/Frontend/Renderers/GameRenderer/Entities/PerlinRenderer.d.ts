import { PerlinConfig } from "@darkforest_eth/hashing";
import { Chunk, Rectangle } from "../../../../_types/global/GlobalTypes";
import { Vec3 } from "../EngineTypes";
import { PERLIN_PROGRAM_DEFINITION } from "../Programs/PerlinProgram";
import AttribManager from "../WebGL/AttribManager";
import { GameGLManager } from "../WebGL/GameGLManager";
import { GenericRenderer } from "../WebGL/GenericRenderer";
import { PerlinOctave } from "./PerlinUtils";
import RectRenderer from "./RectRenderer";
export declare class PerlinRenderer extends GenericRenderer<typeof PERLIN_PROGRAM_DEFINITION> {
    manager: GameGLManager;
    config: PerlinConfig;
    posBuffer: number[];
    coordsBuffer: number[];
    rectRenderer: RectRenderer | undefined;
    thresholds: Vec3;
    constructor(manager: GameGLManager, config: PerlinConfig, thresholds: [number, number, number], rectRenderer?: RectRenderer | undefined);
    bufferGradients(rect: Rectangle, octave: PerlinOctave, topGrad: AttribManager, botGrad: AttribManager): void;
    queueRect(rect: Rectangle): void;
    queueChunk(chunk: Chunk): void;
    setUniforms(): void;
}
