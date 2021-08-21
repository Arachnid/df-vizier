import { Planet, PlanetType, Player } from "@darkforest_eth/types";
import GameManager from "@df_client/src/Backend/GameLogic/GameManager";
import { ActionHandler, Context } from "../handler";
import { ConfigType, globalConfig, Percentage } from "../config";
import { HandlerAction, Move, NoAction, Wait } from "../actions";
import { scorePlanet } from "../utils";

declare const df: GameManager;

const NO_OWNER = '0x0000000000000000000000000000000000000000';

const options = {
    minCaptureEnergy: new Percentage(0.05),
    partialCaptureAmount: new Percentage(0.7),
    minPartialCapture: new Percentage(0.05),
    bigPirateModifier: new Percentage(0.8),
    bigEnemyModifier: new Percentage(0.1),
};

function calculateEnergyNeeded(planet: Planet, target: Planet, config: ConfigType<typeof options>, context: Context) {
    const targetEnergy = target.energyCap * config.minCaptureEnergy + (target.energy - (context.incomingEnergy[target.locationId] || 0)) * (target.defense / 100.0);
    return df.getEnergyNeededForMove(planet.locationId, target.locationId, targetEnergy);
}

function calculateEffort(planet: Planet, target: Planet, config: ConfigType<typeof options>, context: Context): number {
    let effort = calculateEnergyNeeded(planet, target, config, context);
    if(effort > planet.energyCap * (1 - config.global.minEnergyReserve)) {
        if(target.owner == NO_OWNER) {
            effort /= config.bigPirateModifier;
        } else {
            effort /= config.bigEnemyModifier;
        }
    }
    return effort;
}

export class AttackHandler implements ActionHandler<typeof options> {
    readonly options = options;

    run(planet: Planet, config: ConfigType<typeof options>, context: Context): HandlerAction {
        const player = (df.getPlayer() as Player).address;
        if (!Object.entries(context.incomingSends[planet.locationId] || {}).every(([a]) => a == player)) {
            return new NoAction(planet);
        }

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
                const score = scorePlanet(target);
                const effort = calculateEffort(planet, target, config, context);
                let value = score / effort;
                return { planet: target, score, effort, value };
            });
        targets.sort((a, b) => b.value - a.value);

        const reserve = planet.energyCap * config.global.minEnergyReserve;
        for (const target of targets) {
            let energyRequired = calculateEnergyNeeded(planet, target.planet, config, context);
            if(planet.energyCap - energyRequired < reserve) {
                energyRequired = planet.energyCap * config.partialCaptureAmount;
            }
            const energyArriving = df.getEnergyArrivingForMove(planet.locationId, target.planet.locationId, undefined, energyRequired);
            if(energyArriving < target.planet.energy * config.minPartialCapture) {
                continue;
            }
            const move = new Move(planet, target.planet, energyRequired, 0);
            if (planet.energy - energyRequired >= reserve) {
                return move;
            } else {
                const progress = planet.energy / (energyRequired + reserve);
                return new Wait(progress, move);
            }
        }
        return new NoAction(planet);
    }

    debugInfo(planet: Planet, target: Planet|undefined, config: ConfigType<typeof options>, context: Context) {
        const targetScore = target === undefined ? 0 : scorePlanet(target);
        const effort = target === undefined ? 0 : calculateEffort(planet, target, config, context);
        return [
            {key: "Selected score", value: scorePlanet(planet).toFixed(2)},
            {key: "Target score", value: target === undefined ? '' : targetScore.toPrecision(2)},
            {key: "Target effort", value: target === undefined ? '' : effort.toPrecision(2)},
            {key: "Value", value: target === undefined ? '' : (targetScore / effort).toPrecision(2)},
        ];
    }
}