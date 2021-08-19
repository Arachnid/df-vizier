import { LocationId, Planet } from "@darkforest_eth/types";
import GameManager from "@df_client/src/Backend/GameLogic/GameManager";
import { getPlanetName } from "./utils";
import { Context } from "./handler";

declare const df: GameManager;

export interface HandlerAction {
    readonly continue: boolean;
    readonly progress: number;
    execute(df: GameManager, context: Context): void;
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
        const energyArriving = Math.floor(df.getEnergyArrivingForMove(from.locationId, to.locationId, undefined, sendEnergy));
        context.updateIncoming(to.locationId, from.owner, energyArriving, sendSilver);
        df.move(from.locationId, to.locationId, Math.floor(sendEnergy), Math.floor(sendSilver));
        return false;
    }

    getMessage(html: boolean) {
        const { from, to, sendEnergy, sendSilver } = this;
        const energyArriving = Math.floor(df.getEnergyArrivingForMove(from.locationId, to.locationId, undefined, sendEnergy));

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
