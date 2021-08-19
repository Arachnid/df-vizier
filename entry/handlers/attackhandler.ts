import { Planet, PlanetType, Player } from "@darkforest_eth/types";
import GameManager from "@df_client/src/Backend/GameLogic/GameManager";
import { ActionHandler, ConfigType, Context, HandlerAction, Move, NoAction, Percentage, Wait } from "entry/handler";
import { scorePlanet } from "../utils";

declare const df: GameManager;

const NO_OWNER = '0x0000000000000000000000000000000000000000';

const options = {
    energySendAmount: new Percentage(0.7),
    minEnergyReserve: new Percentage(0.15),
    minCaptureEnergy: new Percentage(0.05),
    partialCaptureAmount: new Percentage(0.7),
    minPartialCapture: new Percentage(0.05),
    bigPirateModifier: new Percentage(0.8),
    bigEnemyModifier: new Percentage(0.2),
};

export class AttackHandler implements ActionHandler<typeof options> {
    readonly options = options;

    run(planet: Planet, config: ConfigType<typeof options>, context: Context): HandlerAction {
        if (planet.planetType == PlanetType.SILVER_BANK) {
            return new NoAction();
        }

        const player = (df.getPlayer() as Player).address;
        if (!Object.entries(context.incomingSends[planet.locationId] || {}).every(([a]) => a == player)) {
            return new NoAction();
        }

        const maxSend = planet.energyCap * (1.0 - config.minEnergyReserve);

        const targets = context.inRange
            .filter((target) =>
                // Not ours
                target.owner != player
                // Not under attack
                && Object.entries(context.incomingSends[target.locationId] || {}).every(([a]) => a == player)
                // Not too many incoming sends
                && (context.incomingSends[target.locationId]?.[player] || 0) < 6
                // At least min level, and at least our level
                && target.planetLevel >= planet.planetLevel)
            .map((target) => {
                let targetEnergy = target.energyCap * config.minCaptureEnergy + (target.energy - (context.incomingEnergy[target.locationId] || 0)) * (target.defense / 100.0);
                let sendEnergy = Math.ceil(df.getEnergyNeededForMove(planet.locationId, target.locationId, targetEnergy));
                const score = scorePlanet(target);
                let value = score / sendEnergy;
                if (sendEnergy > maxSend) {
                    sendEnergy = Math.ceil(planet.energyCap * config.partialCaptureAmount);
                    targetEnergy = df.getEnergyArrivingForMove(planet.locationId, target.locationId, undefined, sendEnergy);
                    if (target.owner === NO_OWNER) {
                        value *= config.bigPirateModifier;
                    } else {
                        value *= config.bigEnemyModifier;
                    }
                }
                return { planet: target, targetEnergy, sendEnergy, score, value };
            });
        targets.sort((a, b) => b.value - a.value);

        for (const target of targets) {
            if (target.sendEnergy <= 0 || target.targetEnergy / target.planet.energy < config.minPartialCapture) {
                continue;
            }
            const move = new Move(planet, target.planet, target.sendEnergy, 0);
            if (planet.energy - target.sendEnergy >= planet.energyCap * config.minEnergyReserve) {
                return move;
            } else {
                const progress = planet.energy / (target.sendEnergy + planet.energyCap * config.minEnergyReserve);
                return new Wait(progress, move);
            }
        }
        return new NoAction();
    }
}