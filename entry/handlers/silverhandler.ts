import { Planet, PlanetType, Player } from "@darkforest_eth/types";
import GameManager from "@df_client/src/Backend/GameLogic/GameManager";
import { ActionHandler, ConfigType, Context, HandlerAction, Move, NoAction, NumberOption, Percentage, Upgrade, Wait } from "entry/handler";
import { maxPlanetRank } from "../utils";

declare const df: GameManager;

const options = {
    silverSendAmount: new Percentage(0.7),
    minSilverReserve: new Percentage(0.15),
    minEnergyReserve: new Percentage(0.15),
    upgradeBranch: new NumberOption(1),
    secondaryUpgradeBranch: new NumberOption(2),
};

function getSilverNeeded(planet: Planet): number {
    const totalLevel = planet.upgradeState.reduce((a, b) => a + b);
    return (totalLevel + 1) * 0.2 * planet.silverCap;
}

function getPlanetSilverScore(planet: Planet): number {
    let rank = planet.upgradeState.reduce((a, b) => a + b);

    switch (planet.planetType as number) {
        // case PlanetType.SPACETIME_RIP:
        //   return 10 + planet.planetLevel;
        case PlanetType.PLANET:
            if (rank == maxPlanetRank(planet)) {
                return planet.planetLevel;
            }
            return 20 + planet.planetLevel + (1 - rank / 10);
        default:
            return 0.0;
    }
}

export class SilverHandler implements ActionHandler<typeof options> {
    readonly options = options;

    run(planet: Planet, config: ConfigType<typeof options>, context: Context): HandlerAction {
        let mySilver = planet.silver;
        const rank = planet.upgradeState.reduce((a, b) => a + b);
        if (planet.planetType as number == PlanetType.PLANET && planet.planetLevel > 0 && rank < maxPlanetRank(planet)) {
            const upgrade = new Upgrade(planet.locationId, rank == maxPlanetRank(planet) ? config.secondaryUpgradeBranch : config.upgradeBranch);
            if (mySilver >= getSilverNeeded(planet)) {
                mySilver -= getSilverNeeded(planet);
                return upgrade;
            } else {
                // Wait for more silver, but we can do other things in the meantime.
                return new NoAction();
            }
        }

        const mySilverScore = getPlanetSilverScore(planet);
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
                const score = getPlanetSilverScore(target);
                const capRemaining = target.silverCap - target.silver - (context.incomingSilver[target.locationId] || 0);
                const sendAmount = Math.ceil(
                    Math.min(
                        capRemaining,
                        Math.max(
                            planet.silver - planet.silverCap * config.minSilverReserve,
                            planet.silverCap * config.silverSendAmount
                        )
                    )
                );
                const value = score * sendAmount;
                return { planet: target, score, value, sendAmount };
            });
        targets.sort((a, b) => b.value - a.value);

        for (const target of targets) {
            if (target.score <= mySilverScore || target.sendAmount <= 0) {
                continue;
            }
            const energyRequired = Math.ceil(df.getEnergyNeededForMove(planet.locationId, target.planet.locationId, 10));

            let myEnergy = planet.energy;
            const enoughSilver = (planet.silverGrowth == 0 && target.sendAmount <= planet.silver) || (planet.silverGrowth > 0 && planet.silver - target.sendAmount >= planet.silverCap * config.minSilverReserve);
            const enoughEnergy = myEnergy - energyRequired >= planet.energyCap * config.minEnergyReserve;
            const move = new Move(planet, target.planet, energyRequired, target.sendAmount);
            if (enoughSilver && enoughEnergy) {
                mySilver -= target.sendAmount;
                myEnergy -= energyRequired;
                return move;
            } else if (enoughSilver && !enoughEnergy) {
                const progress = planet.energy / (energyRequired + planet.energyCap * config.minEnergyReserve);
                return new Wait(progress, move);
            }
        }
        return new NoAction();
    }
}