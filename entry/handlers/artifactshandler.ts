import { Planet } from "@darkforest_eth/types";
import GameManager from "@df_client/src/Backend/GameLogic/GameManager";
import { ActionHandler, Context, PlanetInfo } from "../handler";
import { ConfigType } from "../config";
import { FindArtifact, HandlerAction, NoAction, ProspectPlanet, Wait } from "../actions";

declare const df: GameManager;

const options = {

};

export class ArtifactsHandler implements ActionHandler<typeof options> {
    readonly options = options;
    readonly key: string;
    readonly actionLabel: string;
    readonly title: string;

    constructor(key: string, actionLabel: string, title: string) { 
        this.key = key;
        this.actionLabel = actionLabel;
        this.title = title;
    }

    planetAdded(planet: Planet, config: ConfigType<typeof options>): ConfigType<typeof options>|undefined {
        if(df.isPlanetMineable(planet)) {
            return Object.assign(Object.create(config), {enabled: true});
        }
        return undefined;
    }

    run(planet: Planet, config: ConfigType<typeof options>, context: Context): HandlerAction {
        if (!df.isPlanetMineable(planet) || planet.unconfirmedProspectPlanet || planet.unconfirmedFindArtifact) {
            return new NoAction(planet);
        }
        if (planet.prospectedBlockNumber === undefined) {
            const prospect = new ProspectPlanet(planet);
            if (planet.energy >= planet.energyCap * 0.96) {
                return prospect;
            } else {
                const progress = planet.energy / (planet.energyCap * 0.96);
                return new Wait(progress, prospect);
            }
        }
        const currentBlockNumber = df.contractsAPI.ethConnection.blockNumber;
        if (!planet.hasTriedFindingArtifact && !planet.unconfirmedFindArtifact && currentBlockNumber - planet.prospectedBlockNumber < 256) {
            return new FindArtifact(planet);
        }
        return new NoAction(planet);
    }

    debugInfo(origin: {planet: Planet, config: ConfigType<typeof options>}, target: {planet: Planet, config: ConfigType<typeof options>}|undefined, context: Context) {
        return [];
    }
}