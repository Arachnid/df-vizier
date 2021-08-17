import { WorldLocation } from '@darkforest_eth/types';
import { Rectangle } from '../../_types/global/GlobalTypes';
export declare const getPlanetLocations: (spaceTypeKey: number, biomebaseKey: number, perlinLengthScale: number, perlinMirrorX: boolean, perlinMirrorY: boolean) => (chunkFootprint: Rectangle, planetRarity: number) => WorldLocation[];
