import { LocationId, Planet, Player, QueuedArrival } from "@darkforest_eth/types";
import GameManager from "@df_client/src/Backend/GameLogic/GameManager";
import { getPlanetName } from "./utils";

declare const df: GameManager;

interface Descriptor {
    defaultValue: any;
}

export class Percentage implements Descriptor {
    defaultValue: number;

    constructor(defaultValue: number) {
        this.defaultValue = defaultValue;
    }
}

export class RelativeLevel implements Descriptor {
    defaultValue: number;

    constructor(defaultValue: number) {
        this.defaultValue = defaultValue;
    }
}

export class NumberOption implements Descriptor {
    defaultValue: number;

    constructor(defaultValue: number) {
        this.defaultValue = defaultValue;
    }
}

export class String implements Descriptor {
    defaultValue: string;

    constructor(defaultValue: string) {
        this.defaultValue = defaultValue;
    }
}

export interface ConfigurationOptions {
    [key: string]: Descriptor;
}

export type ConfigType<T extends ConfigurationOptions> = { [P in keyof T]: T[P]["defaultValue"] };

export function defaultValues<T extends ConfigurationOptions>(options: T): ConfigType<T> {
    return Object.fromEntries(Object.entries(options).map(([key, value]) => [key, value.defaultValue])) as ConfigType<T>;
}

export interface HandlerAction {
    readonly continue: boolean;
    readonly progress: number;
    execute(df: GameManager, context: Context);
    getMessage(html: boolean): string;
}

export class NoAction implements HandlerAction {
    readonly progress = 0;
    readonly continue = true;

    execute(df: GameManager, context: Context) {
    }

    getMessage(html: boolean) {
        return "Nothing to do.";
    }
}

export class Wait implements HandlerAction {
    readonly continue = false;
    readonly progress: number;
    readonly action: HandlerAction;

    constructor(progress: number, action: HandlerAction) {
        this.progress = progress;
        this.action = action;
    }

    execute(df: GameManager, context: Context) {
    }

    getMessage(html: boolean) {
        return this.action.getMessage(html);
    }
}

export class ProspectPlanet implements HandlerAction {
    readonly progress = 1.0;
    readonly continue = false;
    readonly locationId: LocationId;

    constructor(locationId: LocationId) {
        this.locationId = locationId;
    }

    execute(df: GameManager, context: Context) {
        df.prospectPlanet(this.locationId);
    }

    getMessage(html: boolean) {
        return "Prospecting";
    }
}

export class FindArtifact implements HandlerAction {
    readonly progress = 1.0;
    readonly continue = false;
    readonly locationId: LocationId;

    constructor(locationId: LocationId) {
        this.locationId = locationId;
    }

    execute(df: GameManager, context: Context) {
        df.findArtifact(this.locationId);
        return false;
    }

    getMessage(html: boolean) {
        return "Finding Artifact";
    }
}

export class Upgrade implements HandlerAction {
    readonly progress = 1.0;
    readonly continue = false;
    readonly locationId: LocationId;
    readonly branch: number;

    constructor(locationId: LocationId, branch: number) {
        this.locationId = locationId;
        this.branch = branch;
    }

    execute(df: GameManager, context: Context) {
        df.upgrade(this.locationId, this.branch);
        return false;
    }

    getMessage(html: boolean) {
        return "Upgrading";
    }
}

export class Move implements HandlerAction {
    readonly progress = 1.0;
    readonly continue = false;
    readonly from: Planet;
    readonly to: Planet;
    readonly sendEnergy: number;
    readonly sendSilver: number;

    constructor(from: Planet, to: Planet, sendEnergy: number, sendSilver: number) {
        this.from = from;
        this.to = to;
        this.sendEnergy = sendEnergy;
        this.sendSilver = sendSilver;
    }

    execute(df: GameManager, context: Context) {
        const { from, to, sendEnergy, sendSilver } = this;
        const energyArriving = df.getEnergyArrivingForMove(from.locationId, to.locationId, undefined, sendEnergy);
        context.updateIncoming(to.locationId, from.owner, energyArriving, sendSilver);
        df.move(from.locationId, to.locationId, sendEnergy, sendSilver);
        return false;
    }

    getMessage(html: boolean) {
        const { from, to, sendEnergy, sendSilver } = this;
        const energyArriving = df.getEnergyArrivingForMove(from.locationId, to.locationId, undefined, sendEnergy);

        let amounts: string;
        if (this.sendSilver > 0) {
            amounts = `${energyArriving} energy and ${sendSilver} silver`;
        } else {
            amounts = `${energyArriving} energy`;
        }
        if (this.from.owner == this.to.owner) {
            return `Sending ${amounts} to ${getPlanetName(to, html)}`;
        } else {
            return `Attacking ${getPlanetName(to, html)} with ${amounts}`;
        }
    }
}

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
