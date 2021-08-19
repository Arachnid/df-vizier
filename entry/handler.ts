import { LocationId, Planet, Player, QueuedArrival } from "@darkforest_eth/types";
import GameManager from "@df_client/src/Backend/GameLogic/GameManager";
import { HandlerAction } from "./actions";
import { ConfigurationOptions, ConfigType } from "./config";

export declare const df: GameManager;

export class Context {
    player: Player;
    maxLevel: number;
    incomingEnergy: { [key: string]: number } = {};
    incomingSilver: { [key: string]: number } = {};
    incomingSends: { [key: string]: { [key: string]: number } } = {};
    inRange: Array<Planet> = [];

    constructor(player: Player, maxLevel: number) {
        this.player = player;
        this.maxLevel = maxLevel;
    }

    processVoyages(voyages: Array<QueuedArrival>) {
        for (const arrival of voyages) {
            if (arrival.arrivalTime < Date.now() / 1000) {
                continue;
            }
            this.updateIncoming(arrival.toPlanet, arrival.player, arrival.energyArriving, arrival.silverMoved);
        }
    }

    updateIncoming(locationId: LocationId, sender: string, energy: number, silver: number) {
        if (sender == this.player.address) {
            this.incomingEnergy[locationId] = (this.incomingEnergy[locationId] || 0) + energy;
            this.incomingSilver[locationId] = (this.incomingSilver[locationId] || 0) + silver;
        }
        if (this.incomingSends[locationId] === undefined) {
            this.incomingSends[locationId] = {};
        }
        this.incomingSends[locationId][sender] = (this.incomingSends[locationId][sender] || 0) + 1;
    }
}

export interface ActionHandler<T extends ConfigurationOptions> {
    readonly options: T;

    run(planet: Planet, config: ConfigType<T>, context: Context): HandlerAction;
}
