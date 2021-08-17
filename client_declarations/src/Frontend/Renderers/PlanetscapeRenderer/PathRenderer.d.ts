import { PixelCoords } from "../../../Backend/Procedural/ProcgenUtils";
import { RGBVec } from "../GameRenderer/EngineTypes";
import AttribManager from "../GameRenderer/WebGL/AttribManager";
import { WebGLManager } from "../GameRenderer/WebGL/WebGLManager";
export declare class PathRenderer {
    manager: WebGLManager;
    program: WebGLProgram;
    matrixULoc: WebGLUniformLocation | null;
    posA: AttribManager;
    colorA: AttribManager;
    constructor(manager: WebGLManager);
    drawPath(arr: PixelCoords[], color: RGBVec): void;
}
