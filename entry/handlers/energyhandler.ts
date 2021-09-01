import { Planet, PlanetType, Player } from "@darkforest_eth/types";
import GameManager from "@df_client/src/Backend/GameLogic/GameManager";
import { ActionHandler, Context, PlanetInfo } from "../handler";
import { BoolOption, ConfigScope, ConfigType, MultipleChoice, NumberOption, Percentage } from "../config";
import { HandlerAction, Move, NoAction, Upgrade, Wait } from "../actions";
import { getPlanetName, maxPlanetRank, stripTags } from "../utils";

declare const df: GameManager;

const options = {
    minEnergyReserve: new Percentage(0.15, ConfigScope.OWNED, 'Min. energy reserve', 'Minimum percentage of energy to retain after a send'),
    maxSendAmount: new Percentage(0.7, ConfigScope.OWNED, 'Max send amount', "Maximum percentage of source planet's energy cap to send at once"),
    send: new BoolOption(true, ConfigScope.OWNED, 'Send energy'),
    minCaptureEnergy: new Percentage(0.05, ConfigScope.UNOWNED, 'Minimum capture energy', 'Min percentage of target energy cap to fill on a successful attack'),
    minTargetPercentage: new Percentage(0.05, ConfigScope.ALL, 'Min target percentage', 'Minimum percentage of target energy cap to affect with a send'),
    priority: new NumberOption(0, ConfigScope.ALL, 'Priority'),
};

function findEffectivePriorities<T extends {priority: number}>(vertices: {[key: string]: T}, getEfficiency: (a: T, b: T) => number) {
    const unvisited = new Set(Object.keys(vertices));
    while(unvisited.size > 0) {
        // TODO: Use a priority queue
        const biggest = Array.from(unvisited.keys()).reduce((a, b) => vertices[a].priority > vertices[b].priority ? a : b);
        const dest = vertices[biggest];
        for(const source of Object.values(vertices)) {
            const efficiency = getEfficiency(source, dest);
            if(source.priority < dest.priority * efficiency) {
                source.priority = dest.priority * efficiency;
            }
        }
        unvisited.delete(biggest);
    }
    return vertices;
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

    effectivePriorities: {[locationId: string]: {priority: number}};

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
            .map(({handlers, planet}) => {
                const config = handlers.get(this.key)?.config as ConfigType<typeof options>|undefined;
                return {
                    planet,
                    config,
                    // Send to planets with this handler enabled, or enemy planets
                    receive: config?.enabled || planet.owner != context.player.address,
                    priority: config?.priority || 0,
                };
            })
            .filter(({config, receive}) => config?.send || receive)
            .map((entry) => [entry.planet.locationId, entry]));

        const getEfficiency = (a: typeof planets[0], b: typeof planets[0]) => {
            if(a.config === undefined || !b.receive) return 0;
            const sendAmount = Math.min(a.planet.energyCap * a.config.maxSendAmount, b.planet.energyCap);
            const receiveAmount = df.getEnergyArrivingForMove(a.planet.locationId, b.planet.locationId, undefined, sendAmount);
            return receiveAmount / sendAmount;
        }

        this.effectivePriorities = findEffectivePriorities(planets, getEfficiency);
    }

    run(planet: Planet, config: ConfigType<typeof options>, context: Context): HandlerAction {
        // Don't send from planets that are under attack
        // TODO: Refine this so people can't DoS us with tiny sends.
        if (Object.entries(context.incomingSends[planet.locationId] || {}).some(([a]) => a != context.player.address)) {
            return new NoAction(planet);
        }

        const targets = context.findPlanets(
                this,
                planet.locationId,
                100 * (1.0 - config.minEnergyReserve),
                {
                    // Exclude targets under attack by anyone but us
                    underAttack: context.player.address,
                    // Exclude targets with max sends from us already
                    sendsFrom: context.player.address,
                    // Exclude planets with all default values
                    defaults: false
                })
            .filter(({planet: target}) => target.locationId !== planet.locationId && this.effectivePriorities[target.locationId].priority > 0)
            .map(({planet: target, config: targetConfig}) => {
                const {sendAmount, receiveAmount} = calculateEnergyNeeded(planet, target, config.minEnergyReserve, config.maxSendAmount, targetConfig.minCaptureEnergy, context);
                const score = this.effectivePriorities[target.locationId].priority * (receiveAmount / sendAmount);
                return { target, targetConfig, score, sendAmount, receiveAmount };
            });
        targets.sort((a, b) => b.score - a.score);

        const reserve = planet.energyCap * config.minEnergyReserve;
        for (let {target, targetConfig, sendAmount, receiveAmount, score} of targets) {
            if(score < config.priority) {
                // Don't send from a higher priority planet to a lower priority one.
                break;
            }
            if(receiveAmount / target.energyCap < targetConfig.minTargetPercentage) {
                // Don't bother with sends that won't move the needle
                continue;
            }
            const move = new Move(planet, target, sendAmount, 0);
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
        return [];
    }
}