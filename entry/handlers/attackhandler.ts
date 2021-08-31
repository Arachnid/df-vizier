import { Planet, PlanetType, Player } from "@darkforest_eth/types";
import GameManager from "@df_client/src/Backend/GameLogic/GameManager";
import { ActionHandler, Context } from "../handler";
import { ConfigScope, ConfigType, NumberOption, Percentage } from "../config";
import { HandlerAction, Move, NoAction, Wait } from "../actions";

declare const df: GameManager;

const NO_OWNER = '0x0000000000000000000000000000000000000000';

const options = {
    minEnergyReserve: new Percentage(0.15, ConfigScope.OWNED, 'Min. energy reserve', 'Minimum percentage of energy to retain after a send'),
    partialCaptureAmount: new Percentage(0.7, ConfigScope.OWNED, 'Partial capture amount', "Percentage of source planet's energy cap to send for a partial capture"),
    minCaptureEnergy: new Percentage(0.05, ConfigScope.UNOWNED, 'Minimum capture energy', 'Min percentage of target energy cap to fill on a successful attack'),
    minPartialCapture: new Percentage(0.05, ConfigScope.UNOWNED, 'Min partial capture', 'Minimum percentage of target energy cap to consider attacking with'),
    priority: new NumberOption(0, ConfigScope.UNOWNED, 'Capture priority', 'Higher priority targets are attacked first, after accounting for efficiency'),
};

function calculateEnergyNeeded(planet: Planet, target: Planet, minEnergyReserve: number, partialCaptureAmount: number, minCaptureEnergy: number, context: Context) {
    let receiveAmount = target.energyCap * minCaptureEnergy + (target.energy - (context.incomingEnergy[target.locationId] || 0)) * (target.defense / 100.0);
    let sendAmount = df.getEnergyNeededForMove(planet.locationId, target.locationId, receiveAmount);
    // Too much? Redo as a partial capture.
    if(sendAmount / planet.energyCap > 1.0 - minEnergyReserve) {
        sendAmount = planet.energyCap * partialCaptureAmount;
        receiveAmount = df.getEnergyArrivingForMove(planet.locationId, target.locationId, undefined, sendAmount);
    }
    return {sendAmount, receiveAmount};
}

export class AttackHandler implements ActionHandler<typeof options> {
    readonly options = options;
    readonly key: string;
    readonly actionLabel: string;
    readonly title: string;

    constructor(key: string, actionLabel: string, title: string) { 
        this.key = key;
        this.actionLabel = actionLabel;
        this.title = title;
    }

    planetAdded(planet: Planet, config: ConfigType<typeof options>): ConfigType<typeof options> {
        return Object.create(config);
    }

    run(planet: Planet, config: ConfigType<typeof options>, context: Context): HandlerAction {
        // Don't attack from planets that are under attack
        // TODO: Refine this so people can't DoS us with tiny sends.
        if (Object.entries(context.incomingSends[planet.locationId] || {}).some(([a]) => a != context.player.address)) {
            return new NoAction(planet);
        }

        const targets = context.findPlanets(
                this,
                planet.locationId,
                100 * (1.0 - config.minEnergyReserve),
                {owned: false, underAttack: context.player.address, sendsFrom: context.player.address, defaults: false})
            .filter(({config}) => config.priority > 0)
            .map(({planet: target, config: targetConfig}) => {
                const {sendAmount, receiveAmount} = calculateEnergyNeeded(planet, target, config.minEnergyReserve, config.partialCaptureAmount, targetConfig.minCaptureEnergy, context);
                const score = targetConfig.priority * (receiveAmount / sendAmount);
                return { target, targetConfig, score, sendAmount, receiveAmount };
            });
        targets.sort((a, b) => b.score - a.score);
        console.log({planet, targets})

        const reserve = planet.energyCap * config.minEnergyReserve;
        for (let {target, targetConfig, sendAmount, receiveAmount} of targets) {
            if(receiveAmount / target.energyCap < targetConfig.minPartialCapture) {
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
        if(target !== undefined) {
            const {sendAmount, receiveAmount} = calculateEnergyNeeded(
                origin.planet,
                target.planet,
                origin.config.minEnergyReserve,
                origin.config.partialCaptureAmount,
                target.config.minCaptureEnergy,
                context);
            const score = target.config.priority * (receiveAmount / sendAmount);
            return [
                {key: "Send amount", value: sendAmount.toFixed(0)},
                {key: "Receive amount", value: receiveAmount.toFixed(0)},
                {key: "Score", value: score.toPrecision(6)},
            ];
        } else {
            return [];
        }
    }
}