import { LocationId, Planet } from "@darkforest_eth/types";
import GameManager from "@df_client/src/Backend/GameLogic/GameManager";
import { getPlanetName } from "./utils";
import { Context } from "./handler";
import { html } from "htm/preact";
import { VNode } from "preact";

declare const df: GameManager;

export interface HandlerAction {
    readonly continue: boolean;
    readonly progress: number;
    readonly planet: Planet;
    
    execute(df: GameManager, context: Context): void;
    getMessage(): VNode;
}

export class NoAction implements HandlerAction {
    readonly progress = 0;
    readonly continue = true;
    readonly planet: Planet;

    constructor(planet: Planet) {
        this.planet = planet;
    }

    execute(df: GameManager, context: Context) {
    }

    getMessage() {
        return html`Nothing to do.`;
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

    get planet() {
        return this.action.planet;
    }

    execute(df: GameManager, context: Context) {
    }

    getMessage() {
        return this.action.getMessage();
    }
}

export class ProspectPlanet implements HandlerAction {
    readonly progress = 1.0;
    readonly continue = false;
    readonly planet: Planet;

    constructor(planet: Planet) {
        this.planet = planet;
    }

    execute(df: GameManager, context: Context) {
        df.prospectPlanet(this.planet.locationId);
    }

    getMessage() {
        return html`Prospecting`;
    }
}

export class FindArtifact implements HandlerAction {
    readonly progress = 1.0;
    readonly continue = false;
    readonly planet: Planet;

    constructor(planet: Planet) {
        this.planet = planet;
    }

    execute(df: GameManager, context: Context) {
        df.findArtifact(this.planet.locationId);
        return false;
    }

    getMessage() {
        return html`Finding Artifact`;
    }
}

export class Upgrade implements HandlerAction {
    readonly progress = 1.0;
    readonly continue = false;
    readonly planet: Planet;
    readonly branch: number;

    constructor(planet: Planet, branch: number) {
        this.planet = planet;
        this.branch = branch;
    }

    execute(df: GameManager, context: Context) {
        df.upgrade(this.planet.locationId, this.branch);
        return false;
    }

    getMessage() {
        return html`Upgrading`;
    }
}

export class Move implements HandlerAction {
    readonly progress = 1.0;
    readonly continue = false;
    readonly planet: Planet;
    readonly to: Planet;
    readonly sendEnergy: number;
    readonly sendSilver: number;

    constructor(planet: Planet, to: Planet, sendEnergy: number, sendSilver: number) {
        this.planet = planet;
        this.to = to;
        this.sendEnergy = sendEnergy;
        this.sendSilver = sendSilver;
    }

    execute(df: GameManager, context: Context) {
        const { planet, to, sendEnergy, sendSilver } = this;
        const energyArriving = Math.floor(df.getEnergyArrivingForMove(planet.locationId, to.locationId, undefined, sendEnergy));
        context.updateIncoming(to.locationId, planet.owner, energyArriving, sendSilver);
        df.move(planet.locationId, to.locationId, Math.floor(sendEnergy), Math.floor(sendSilver));
        return false;
    }

    getMessage() {
        const { planet, to, sendEnergy, sendSilver } = this;
        const energyArriving = Math.floor(df.getEnergyArrivingForMove(planet.locationId, to.locationId, undefined, sendEnergy));

        let amounts: VNode;
        if (this.sendSilver > 0) {
            amounts = html`${energyArriving} energy and ${sendSilver} silver`;
        } else {
            amounts = html`${energyArriving} energy`;
        }
        if (this.planet.owner == this.to.owner) {
            return html`Sending ${amounts} to ${getPlanetName(to)}`;
        } else {
            return html`Attacking ${getPlanetName(to)} with ${amounts}`;
        }
    }
}
