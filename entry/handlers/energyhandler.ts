import { Planet, PlanetType, Player } from "@darkforest_eth/types";
import GameManager from "@df_client/src/Backend/GameLogic/GameManager";
import { ActionHandler, Context } from "../handler";
import { ConfigType, Percentage } from "../config";
import { HandlerAction, Move, NoAction, Wait } from "../actions";

declare const df: GameManager;

function scorePlanetEnergyNeed(planet: Planet, energy?: number) {
    if (!energy) {
        energy = planet.energy;
    }
    const baseNeed = planet.range;
    switch (planet.planetType as number) {
        case PlanetType.PLANET:
        case PlanetType.TRADING_POST:
        case PlanetType.SILVER_MINE:
            return baseNeed;
        case PlanetType.SILVER_BANK:
            return baseNeed * 2;
        case PlanetType.RUINS:
            if (planet.hasTriedFindingArtifact) {
                return baseNeed * 0.5;
            } else {
                return baseNeed * 1.25;
            }
        default:
            return 0.0;
    }
}

const options = {
};

export class EnergyHandler implements ActionHandler<typeof options> {
    readonly options = options;

    run(planet: Planet, config: ConfigType<typeof options>, context: Context): HandlerAction {
        if (planet.planetType == PlanetType.SILVER_MINE) {
            return new NoAction(planet);
        }

        const maxSendAmount = Math.ceil(planet.energyCap * config.global.energySendAmount);
        const myScore = scorePlanetEnergyNeed(planet, planet.energy - maxSendAmount);
        const player = (df.getPlayer() as Player).address;
        const targets = context.inRange
            .filter((target) =>
                // Ours
                target.owner == player
                // Not under attack
                && Object.entries(context.incomingSends[target.locationId] || {}).every(([a]) => a == player)
                // Not too many incoming sends
                && (context.incomingSends[target.locationId]?.[player] || 0) < 6
                // Not this same planet
                && target.locationId != planet.locationId)
            .map((target) => {
                const score = scorePlanetEnergyNeed(target);
                const sendAmount = Math.ceil(Math.min(maxSendAmount, target.energyCap * (1 - config.global.minEnergyReserve) - target.energy - (context.incomingEnergy[target.locationId] || 0)));
                const value = score * (df.getEnergyArrivingForMove(planet.locationId, target.locationId, undefined, sendAmount) / sendAmount);
                return { planet: target, score, value, sendAmount };
            });
        targets.sort((a, b) => b.value - a.value);

        let myEnergy = planet.energy;
        for (const target of targets) {
            if (target.value <= myScore) {
                break;
            }
            if (target.sendAmount <= 0) {
                continue;
            }
            const move = new Move(planet, target.planet, target.sendAmount, 0);
            if (myEnergy - target.sendAmount >= planet.energyCap * config.global.minEnergyReserve) {
                myEnergy -= target.sendAmount;
                return move;
            } else {
                const progress = planet.energy / (target.sendAmount + planet.energyCap * config.global.minEnergyReserve);
                return new Wait(progress, move);
            }
        }
        return new NoAction(planet);
    }
}