import { Artifact, LocatablePlanet, LocationId, Planet, WorldCoords } from "@darkforest_eth/types";
import { PlanetRenderInfo } from "../../../../Backend/GameLogic/ViewportEntities";
import Renderer from "../Renderer";
/**
 * this guy is always going to call things in worldcoords, we'll convert them
 * to CanvasCoords. responsible for rendering planets by calling primitive renderers
 */
export default class PlanetRenderManager {
    renderer: Renderer;
    constructor(renderer: Renderer);
    queueLocation(renderInfo: PlanetRenderInfo, now: number, highPerfMode: boolean): void;
    queueArtifactsAroundPlanet(planet: Planet, artifacts: Artifact[], centerW: WorldCoords, radiusW: number, now: number, alpha: number): void;
    drawPlanetMessages(renderInfo: PlanetRenderInfo, coords: WorldCoords, radiusW: number, textAlpha: number): void;
    queueArtifactIcon(planet: Planet, { x, y }: WorldCoords, radius: number): void;
    queuePlanetSilverText(planet: Planet, center: WorldCoords, radius: number, alpha: number): void;
    getLockedEnergy(planet: Planet): number;
    getMouseAtk(): number | undefined;
    queueRings(planet: Planet, center: WorldCoords, radius: number): void;
    queuePlanetBody(planet: Planet, centerW: WorldCoords, radiusW: number): void;
    queueBlackDomain(planet: Planet, center: WorldCoords, radius: number): void;
    queueAsteroids(planet: Planet, center: WorldCoords, radius: number): void;
    queueHat(planet: Planet, center: WorldCoords, radius: number): void;
    queuePlanetEnergyText(planet: Planet, center: WorldCoords, radius: number, alpha: number): void;
    /**
     * Renders rings around planet that show how far sending the given percentage of this planet's
     * energy would be able to travel.
     */
    drawRangeAtPercent(planet: LocatablePlanet, pct: number): void;
    /**
     * Renders three rings around the planet that show the player how far this planet can attack.
     */
    queueRangeRings(planet: LocatablePlanet): void;
    queuePlanets(cachedPlanets: Map<LocationId, PlanetRenderInfo>, now: number, highPerfMode: boolean): void;
    flush(): void;
}
