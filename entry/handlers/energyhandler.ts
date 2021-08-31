// import { Planet, PlanetType, Player } from "@darkforest_eth/types";
// import GameManager from "@df_client/src/Backend/GameLogic/GameManager";
// import { ActionHandler, Context, PlanetInfo } from "../handler";
// import { ConfigType, Percentage } from "../config";
// import { HandlerAction, Move, NoAction, Wait } from "../actions";

// declare const df: GameManager;

// function scorePlanetEnergyNeed(planet: Planet, energy?: number) {
//     if (!energy) {
//         energy = planet.energy;
//     }
//     const baseNeed = planet.range;
//     switch (planet.planetType as number) {
//         case PlanetType.PLANET:
//         case PlanetType.TRADING_POST:
//         case PlanetType.SILVER_MINE:
//             return baseNeed;
//         case PlanetType.SILVER_BANK:
//             return baseNeed * 2;
//         case PlanetType.RUINS:
//             if (planet.hasTriedFindingArtifact) {
//                 return baseNeed * 0.5;
//             } else {
//                 return baseNeed * 1.25;
//             }
//         default:
//             return 0.0;
//     }
// }

// function calculateSendAmount(planet: Planet, target: Planet, config: ConfigType<typeof options>, context: Context) {
//     const maxSendAmount = Math.ceil(planet.energyCap * config.global.energySendAmount);
//     return Math.ceil(
//         Math.min(
//             maxSendAmount,
//             df.getEnergyNeededForMove(
//                 planet.locationId,
//                 target.locationId,
//                 target.energyCap * (1 - config.global.minEnergyReserve)
//                     - target.energy
//                     - (context.incomingEnergy[target.locationId] || 0)
//             )
//         )
//     );
// }

// function calculateEffort(planet: Planet, target: Planet, config: ConfigType<typeof options>, context: Context) {
//     const sendAmount = calculateSendAmount(planet, target, config, context);
//     const arriving = df.getEnergyArrivingForMove(planet.locationId, target.locationId, undefined, sendAmount);
//     return sendAmount / arriving;
// }

// const options = {
// };

// export class EnergyHandler implements ActionHandler<typeof options> {
//     readonly options = options;
//     readonly key: string;
//     readonly actionLabel: string;

//     constructor(key: string, actionLabel: string) {
//         this.key = key;
//         this.actionLabel = actionLabel;
//     }

//     planetAdded(planet: Planet, config: ConfigType<typeof options>): ConfigType<typeof options> {
//         return Object.create(config);
//     }

//     prepare(config: ConfigType<typeof options>, context: Context): void {
        
//     }

//     run(planet: Planet, config: ConfigType<typeof options>, context: Context): HandlerAction {
//         if (planet.planetType == PlanetType.SILVER_MINE) {
//             return new NoAction(planet);
//         }

//         const maxSendAmount = Math.ceil(planet.energyCap * config.global.energySendAmount);
//         const myScore = scorePlanetEnergyNeed(planet, planet.energy - maxSendAmount);
//         const player = (df.getPlayer() as Player).address;
//         const targets = context.inRange
//             .filter((target) =>
//                 // Ours
//                 target.owner == player
//                 // Not under attack
//                 && Object.entries(context.incomingSends[target.locationId] || {}).every(([a]) => a == player)
//                 // Not too many incoming sends
//                 && (context.incomingSends[target.locationId]?.[player] || 0) < 6
//                 // Not this same planet
//                 && target.locationId != planet.locationId)
//             .map((target) => {
//                 const score = scorePlanetEnergyNeed(target);
//                 const effort = calculateEffort(planet, target, config, context);
//                 const value = score / effort
//                 return { planet: target, score, effort, value };
//             });
//         targets.sort((a, b) => b.value - a.value);

//         for (const target of targets) {
//             if (target.value <= myScore) {
//                 break;
//             }
//             const sendAmount = calculateSendAmount(planet, target.planet, config, context);
//             if (sendAmount <= 0) {
//                 continue;
//             }
//             const move = new Move(planet, target.planet, sendAmount, 0);
//             if (planet.energy - sendAmount >= planet.energyCap * config.global.minEnergyReserve) {
//                 return move;
//             } else {
//                 const progress = planet.energy / (sendAmount + planet.energyCap * config.global.minEnergyReserve);
//                 return new Wait(progress, move);
//             }
//         }
//         return new NoAction(planet);
//     }

//     debugInfo(planet: Planet, target: Planet|undefined, config: ConfigType<typeof options>, context: Context) {
//         const targetScore = target === undefined ? 0 : scorePlanetEnergyNeed(target);
//         const targetEffort = target === undefined ? 0 : calculateEffort(planet, target, config, context);
//         return [
//             {key: "Selected score", value: scorePlanetEnergyNeed(planet).toPrecision(6)},
//             {key: "Target score", value: target === undefined ? '' : targetScore.toPrecision(6)},
//             {key: "Target effort", value: target === undefined ? '' : targetEffort.toPrecision(6)},
//             {key: "Value", value: target === undefined ? '' : (targetScore / targetEffort).toPrecision(6)},
//         ];
//     }
// }