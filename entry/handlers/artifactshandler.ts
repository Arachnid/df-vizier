import { Planet } from "@darkforest_eth/types";
import GameManager from "@df_client/src/Backend/GameLogic/GameManager";
import { ActionHandler, ConfigType, Context, FindArtifact, HandlerAction, NoAction, ProspectPlanet, Wait } from "entry/handler";

declare const df: GameManager;

const options = {

};

export class ArtifactsHandler implements ActionHandler<typeof options> {
    readonly options = options;

    run(planet: Planet, config: ConfigType<typeof options>, context: Context): HandlerAction {
        if (!df.isPlanetMineable(planet) || planet.unconfirmedProspectPlanet || planet.unconfirmedFindArtifact) {
            return new NoAction();
        }
        if (planet.prospectedBlockNumber === undefined) {
            const prospect = new ProspectPlanet(planet.locationId);
            if (planet.energy >= planet.energyCap * 0.95) {
                return prospect;
            } else {
                const progress = planet.energy / (planet.energyCap * 0.95);
                return new Wait(progress, prospect);
            }
        }
        const currentBlockNumber = df.contractsAPI.ethConnection.blockNumber;
        if (!planet.hasTriedFindingArtifact && !planet.unconfirmedFindArtifact && currentBlockNumber - planet.prospectedBlockNumber < 256) {
            return new FindArtifact(planet.locationId);
        }
        return new NoAction();
    }
}