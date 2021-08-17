import { Planet } from '@darkforest_eth/types';
import { Wrapper } from '../../Backend/Utils/Wrapper';
export declare const enum PlanetNotifType {
    PlanetCanUpgrade = 0,
    CanProspect = 1,
    CanFindArtifact = 2,
    MaxSilver = 3,
    CanAddEmoji = 4
}
export declare function getNotifsForPlanet(planet: Planet | undefined, currentBlockNumber: number | undefined): PlanetNotifType[];
export declare function PlanetNotifications({ notifs, planet, }: {
    notifs: PlanetNotifType[];
    planet: Wrapper<Planet | undefined>;
}): JSX.Element;
