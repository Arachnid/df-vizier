import { ArtifactId, Biome, EthAddress, LocationId, Planet, UpgradeBranchName } from "@darkforest_eth/types";
import { HSLVec, RGBAVec, RGBVec } from "../../Frontend/Renderers/GameRenderer/EngineTypes";
import { PlanetCosmeticInfo, RuinsInfo } from "../Utils/UtilsTypes";
export declare type PixelCoords = {
    x: number;
    y: number;
};
export declare type QuoteData = {
    quote: string;
    author: string;
};
export declare class ProcgenUtils {
    static blurbsById: Map<LocationId, string>;
    static blurbs2ById: Map<LocationId, string>;
    static cosmeticByLocId: Map<LocationId, PlanetCosmeticInfo>;
    static baseByBiome: {
        readonly [Biome: number]: HSLVec;
    };
    static oceanByBiome: {
        readonly [Biome: number]: HSLVec;
    };
    static strByBiome: Map<Biome, string>;
    static getBiomeRgbStr(biome: Biome): string;
    static grayColors: PlanetCosmeticInfo;
    static namesById: Map<LocationId, string>;
    static taglinesById: Map<LocationId, string>;
    static huesByHash: Map<string, number>;
    static rgbsByHash: Map<string, RGBAVec>;
    static ellipsisStr(str: string, maxLen: number): string;
    static ellipsStrEnd(str: string, maxLen: number): string;
    static hslStr(h: number, s: number, l: number): string;
    static rgbStr(rgb: RGBVec): string;
    static hslToRgb([h, s, l]: HSLVec): RGBVec;
    static hashToInt(hash: string): number;
    static hashToHue(hash: string): number;
    static getPlayerColor(player: EthAddress): string;
    static getPlayerColorVec(player: EthAddress): RGBAVec;
    static getOwnerColorVec(planet: Planet): RGBAVec;
    static getOwnerColor(planet: Planet): string;
    static getPlanetClass(planet: Planet): UpgradeBranchName;
    static planetPerlin(loc: LocationId): (coords: PixelCoords) => number;
    static planetRandom(loc: LocationId): () => number;
    static planetRandomInt(loc: LocationId): () => number;
    static artifactRandom(loc: ArtifactId): () => number;
    static artifactRandomInt(loc: ArtifactId): () => number;
    static getRuinsInfo(loc: LocationId): RuinsInfo;
    static getPlanetCosmetic(planet: Planet | undefined): PlanetCosmeticInfo;
    static getPlanetTitle(planet: Planet | undefined): string;
    static getPlanetName(planet: Planet | undefined): string;
    static getPlanetNameHash(locId: LocationId): string;
    static getPlanetTagline(planet: Planet | undefined): string;
    static getPlanetBlurb(planet: Planet | undefined): string;
    static getPlanetBlurb2(planet: Planet | undefined): string;
    static getHatSizeName(planet: Planet): string;
}
