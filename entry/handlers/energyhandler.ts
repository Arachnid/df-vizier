import { LocationId, Planet, PlanetType, Player } from "@darkforest_eth/types";
import GameManager from "@df_client/src/Backend/GameLogic/GameManager";
import { ActionHandler, Context, DebugValue, PlanetInfo } from "../handler";
import { BoolOption, ConfigScope, ConfigType, MultipleChoice, NumberOption, Percentage } from "../config";
import { HandlerAction, Move, NoAction, Upgrade, Wait } from "../actions";
import { getPlanetName, maxPlanetRank, stripTags } from "../utils";
import { html } from "htm/preact";

declare const df: GameManager;

const options = {
    minEnergyReserve: new Percentage(0.15, ConfigScope.OWNED, 'Min. energy reserve', 'Minimum percentage of energy to retain after a send'),
    maxSendAmount: new Percentage(0.7, ConfigScope.OWNED, 'Max send amount', "Maximum percentage of source planet's energy cap to send at once"),
    send: new BoolOption(true, ConfigScope.OWNED, 'Send energy'),
    maxEnergyReserve: new Percentage(0.85, ConfigScope.OWNED, 'Max energy reserve', 'Max energy percentage to reach with sends'),
    minCaptureEnergy: new Percentage(0.05, ConfigScope.UNOWNED, 'Minimum capture energy', 'Min percentage of target energy cap to fill on a successful attack'),
    minTargetPercentage: new Percentage(0.05, ConfigScope.ALL, 'Min target percentage', 'Minimum percentage of target energy cap to affect with a send'),
    priority: new NumberOption(0, ConfigScope.ALL, 'Priority'),
};

type PathMatrix<T> = {[Property in keyof T]: {[Property in keyof T]: {cost: number, next: keyof T}}};

function allPairsShortestPath<T>(vertices: {[key: string]: T}, getCost: (a: T, b: T)=>number, combineCosts: (a: number, b: number) => number): PathMatrix<typeof vertices> {
    // Populate direct paths
    const costs: PathMatrix<typeof vertices> = Object.fromEntries(Object.entries(vertices).map(([sourceKey, source]) => [
        sourceKey,
        Object.fromEntries(Object.entries(vertices).map(([destKey, dest]) => [
            destKey,
            {
                cost: source === dest ? 0 : getCost(source, dest),
                next: destKey,
            }
        ]))
    ]));

    // Find indirect paths
    for(const mid of Object.keys(vertices)) {
        for(const source of Object.keys(vertices)) {
            for(const dest of Object.keys(vertices)) {
                const indirectCost = combineCosts(costs[source][mid].cost, costs[mid][dest].cost);
                if(costs[source][dest].cost > indirectCost) {
                    costs[source][dest] = {
                        cost: indirectCost,
                        next: mid,
                    };
                }
            }
        }
    }

    return costs;
}

function calculateEnergyNeeded(planet: Planet, target: Planet, minEnergyReserve: number, maxSendAmount: number, minCaptureEnergy: number, context: Context) {
    let receiveAmount;
    if(target.owner !== context.player.address) {
        receiveAmount = (target.energy - (context.incomingEnergy[target.locationId] || 0)) * (target.defense / 100.0)
            + target.energyCap * minCaptureEnergy;
    } else {
        receiveAmount = target.energyCap - target.energy;
    }

    let sendAmount = df.getEnergyNeededForMove(planet.locationId, target.locationId, receiveAmount);

    // Too much? Redo as a partial send.
    if(sendAmount / planet.energyCap > 1.0 - minEnergyReserve) {
        sendAmount = planet.energyCap * maxSendAmount;
        receiveAmount = df.getEnergyArrivingForMove(planet.locationId, target.locationId, undefined, sendAmount);
    }
    return {sendAmount, receiveAmount};
}

export class EnergyHandler implements ActionHandler<typeof options> {
    readonly options = options;
    readonly key: string;
    readonly actionLabel: string;
    readonly title: string;

    paths: PathMatrix<{[key: string]: any}>;
    targets: Array<{planet: Planet, config: ConfigType<typeof options>}>;

    constructor(key: string, actionLabel: string, title: string) { 
        this.key = key;
        this.actionLabel = actionLabel;
        this.title = title;
    }

    planetAdded(planet: Planet, config: ConfigType<typeof options>): ConfigType<typeof options> | undefined {
        return Object.create(config);
    }

    prepare(context: Context) {
        const planets = Object.fromEntries(Object.values(context.planetsById)
            .flatMap(({handlers, planet}) => {
                const config = handlers.get(this.key)?.config as ConfigType<typeof options>|undefined;
                if(config === undefined) return [];
                return [{
                    planet,
                    config,
                    // Send to planets with this handler enabled, or enemy planets
                    receive: config?.enabled || planet.owner != context.player.address,
                }];
            })
            .filter(({config, planet, receive}) =>
                config?.send || receive
                // Only under attack by us
                && !context.underAttack(planet, context.player.address)
            ).map((entry) => [entry.planet.locationId, entry]));

        const getCost = (a: typeof planets[0], b: typeof planets[0]) => {
            if(a.config === undefined || !b.receive) return 1.0;
            const {sendAmount, receiveAmount} = calculateEnergyNeeded(a.planet, b.planet, a.config.minEnergyReserve, a.config.maxSendAmount, b.config?.minCaptureEnergy || 0, context);
            return 1 - (receiveAmount / sendAmount);
        }

        this.paths = allPairsShortestPath(planets, getCost, (a, b) => 1 - (1 - a) * (1 - b));

        this.targets = Object.values(planets)
            .filter(({planet, config}) => (config?.priority || 0) > 0)
            .map(({planet, config}) => ({planet, config}));
    }

    run(planet: Planet, config: ConfigType<typeof options>, context: Context): HandlerAction {
        // Don't send from planets that are under attack unless it has a priority
        // TODO: Refine this so people can't DoS us with tiny sends.
        if (context.underAttack(planet, context.player.address) && config.priority == 0) {
            return new NoAction(planet);
        }

        const targets = this.targets
            .filter(({planet: target, config: targetConfig}) => {
                if(target.owner === context.player.address) {
                    const energy = target.energy + (context.incomingEnergy[target.locationId] || 0);
                    return energy < target.energyCap * targetConfig.maxEnergyReserve;
                } else {
                    const energy = target.energy + (context.incomingEnergy[target.locationId] || 0);
                    return energy > 0;
                }
            }).map(({planet: target, config: targetConfig}) => {
                const {cost, next} = this.paths[planet.locationId][target.locationId];
                const nextPlanet = df.getPlanetWithId(next as LocationId) as Planet;
                return {
                    cost: cost / targetConfig.priority,
                    next: nextPlanet
                }
            });
        targets.sort((a, b) => a.cost - b.cost);

        const reserve = planet.energyCap * config.minEnergyReserve;
        for (const {next} of targets) {
            if(next.locationId === planet.locationId) {
                break;
            }
            if(context.countSends(next.locationId, context.player.address) >= 6) {
                // Too many sends already
                continue;
            }

            const nextConfig = context.getPlanetInfo(next).handlers.get(this.key) as ConfigType<typeof options>;
            const {sendAmount, receiveAmount} = calculateEnergyNeeded(planet, next, config.minEnergyReserve, config.maxSendAmount, nextConfig.minCaptureEnergy, context);
            
            if(receiveAmount / next.energyCap < nextConfig.minTargetPercentage) {
                // Don't bother with sends that won't move the needle
                continue;
            }

            const move = new Move(planet, next, sendAmount, 0);
            if (planet.energy - sendAmount >= reserve) {
                return move;
            } else {
                const progress = planet.energy / (sendAmount + reserve);
                return new Wait(progress, move);
            }
        }
        return new NoAction(planet);
    }

    debugInfo(origin: {planet: Planet, config: ConfigType<typeof options>}, target: {planet: Planet, config: ConfigType<typeof options>}|undefined, context: Context) {
        const values: Array<DebugValue> = [
        ];

        let action = this.run(origin.planet, origin.config, context);
        if(action instanceof Wait) {
            action = action.action;
        }
        if(action instanceof Move) {
            values.push({
                key: "Next: Send quantity",
                value: `${Math.floor(action.sendEnergy)} (${Math.floor(100 * action.sendEnergy / action.planet.energyCap)}%)`
            });
            const receiveAmount = df.getEnergyArrivingForMove(action.planet.locationId, action.to.locationId, undefined, action.sendEnergy);
            const efficiency = receiveAmount / action.sendEnergy;
            values.push({
                key: "Next: Receive quantity",
                value: `${Math.floor(receiveAmount)} (${Math.floor(100 * receiveAmount / action.to.energyCap)}%)`
            });
            values.push({
                key: "Next: Efficiency",
                value: `${Math.floor(100 * efficiency)}%`
            });
        }

        if(target !== undefined) {
            const cost = this.paths[origin.planet.locationId][target.planet.locationId];
            if(cost !== undefined) {
                const nextPlanet = df.getPlanetWithId(cost.next as LocationId) as Planet;
                values.push({
                    key: "Target: Cost",
                    value: cost.cost.toPrecision(6)
                });
                values.push({
                    key: "Target: Next",
                    value: html`${getPlanetName(nextPlanet)}`
                });
                const nextConfig = context.getPlanetInfo(nextPlanet).handlers.get(this.key)?.config as ConfigType<typeof options>;
                const {sendAmount, receiveAmount} = calculateEnergyNeeded(origin.planet, target.planet, origin.config.minEnergyReserve, origin.config.maxSendAmount, nextConfig.minCaptureEnergy, context);
                values.push({
                    key: "Target Next: Send quantity",
                    value: `${Math.floor(sendAmount)} (${Math.floor(100 * sendAmount / origin.planet.energyCap)}%)`
                });
                const efficiency = receiveAmount / sendAmount;
                values.push({
                    key: "Next: Receive quantity",
                    value: `${Math.floor(receiveAmount)} (${Math.floor(100 * receiveAmount / nextPlanet.energyCap)}%)`
                });
                values.push({
                    key: "Next: Efficiency",
                    value: `${Math.floor(100 * efficiency)}%`
                });
            }
        }

        return values;
    }
}