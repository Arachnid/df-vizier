import { Planet, PlanetType, Player } from "@darkforest_eth/types";
import GameManager from "@df_client/src/Backend/GameLogic/GameManager";
import { ActionHandler, Context, PlanetInfo } from "../handler";
import { ConfigScope, ConfigType, MultipleChoice, NumberOption, Percentage } from "../config";
import { HandlerAction, Move, NoAction, Upgrade, Wait } from "../actions";
import { maxPlanetRank } from "../utils";

declare const df: GameManager;

const upgradeBranches = [
    ['0', 'Defense'],
    ['1', 'Range'],
    ['2', 'Speed'],
] as Array<[string, string]>;

const upgradeRanks = [
    ['0', '0'],
    ['1', '1'],
    ['2', '2'],
    ['3', '3'],
    ['4', '4'],
] as Array<[string, string]>;

const options = {
    primaryUpgradeBranch: new MultipleChoice('1', ConfigScope.OWNED, 'Primary upgrade type', upgradeBranches),
    primaryUpgradeRank: new MultipleChoice('0', ConfigScope.OWNED, 'Primary upgrade rank', upgradeRanks),
    secondaryUpgradeBranch: new MultipleChoice('2', ConfigScope.OWNED, 'Secondary upgrade type', upgradeBranches),
    secondaryUpgradeRank: new MultipleChoice('0', ConfigScope.OWNED, 'Secondary upgrade rank', upgradeRanks),
};

function getSilverNeeded(planet: Planet): number {
    const totalLevel = planet.upgradeState.reduce((a, b) => a + b);
    return (totalLevel + 1) * 0.2 * planet.silverCap;
}

export class UpgradeHandler implements ActionHandler<typeof options> {
    readonly options = options;
    readonly key: string;
    readonly actionLabel: string;
    readonly title: string;

    constructor(key: string, actionLabel: string, title: string) { 
        this.key = key;
        this.actionLabel = actionLabel;
        this.title = title;
    }

    planetAdded(planet: Planet, config: ConfigType<typeof options>): ConfigType<typeof options> | undefined {
        if(planet.planetType !== PlanetType.PLANET || planet.planetLevel === 0 || planet.upgradeState.reduce((a, b) => a + b) >= maxPlanetRank(planet)) {
            return undefined;
        }
        return Object.create(config);
    }

    run(planet: Planet, config: ConfigType<typeof options>, context: Context): HandlerAction {
        const rank = planet.upgradeState.reduce((a, b) => a + b);
        // Check we're not already maxed out
        if(rank >= maxPlanetRank(planet)) {
            return new NoAction(planet);
        }

        // Iterate upgrades in order of priority to find the next one
        const upgrades = [
            {branch: parseInt(config.primaryUpgradeBranch), maxRank: parseInt(config.primaryUpgradeRank)},
            {branch: parseInt(config.secondaryUpgradeBranch), maxRank: parseInt(config.secondaryUpgradeRank)},
        ];
        let upgrade: HandlerAction = new NoAction(planet);
        for(const {branch, maxRank} of upgrades) {
            if(planet.upgradeState[branch] < maxRank) {
                upgrade = new Upgrade(planet, branch);
                break;
            }
        }

        if (planet.silver >= getSilverNeeded(planet)) {
            return upgrade;
        } else {
            // Wait for more silver, but we can do other things in the meantime.
            return new NoAction(planet);
        }
    }

    debugInfo(origin: {planet: Planet, config: ConfigType<typeof options>}, target: {planet: Planet, config: ConfigType<typeof options>}|undefined, context: Context) {
        return [];
    }
}