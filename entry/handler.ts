import { LocationId, Planet, Player, QueuedArrival, WorldLocation } from "@darkforest_eth/types";
import GameManager from "@df_client/src/Backend/GameLogic/GameManager";
import { HandlerAction } from "./actions";
import { ConfigurationOptions, ConfigType, defaultValues } from "./config";

export declare const df: GameManager;

export interface DebugValue {
    key: string;
    value: string;
}

export interface ActionHandler<T extends ConfigurationOptions> {
    readonly options: T;
    readonly key: string;
    readonly actionLabel: string;
    readonly title: string;

    prepare(context: Context);
    planetAdded(planet: Planet, config: ConfigType<T>): ConfigType<T>|undefined;
    run(planet: Planet, config: ConfigType<T>, context: Context): HandlerAction;
    debugInfo(origin: { planet: Planet, config: ConfigType<T> }, target: { planet: Planet, config: ConfigType<T> } | undefined, context: Context): Array<DebugValue>;
}

export interface HandlerInfo<T extends ConfigurationOptions> {
    handler: ActionHandler<T>;
    config: ConfigType<T>;
}

export class PlanetInfo {
    locationId: LocationId;
    location: WorldLocation;
    handlers: Map<string, HandlerInfo<any>>;

    constructor(planet: Planet, globalHandlers: Array<HandlerInfo<any>>) {
        this.locationId = planet.locationId;
        this.handlers = new Map(globalHandlers.flatMap(({ handler, config }) => {
            const planetConfig = handler.planetAdded(planet, config);
            if(planetConfig === undefined) return [];
            return [[
                handler.key,
                {
                    handler,
                    config: planetConfig,
                }
            ]];
        }));
        const location = df.getLocationOfPlanet(planet.locationId);
        if (location === undefined) {
            throw new Error("Cannot create a PlanetInfo for planets without locations");
        }
        this.location = location;
    }

    get planet() {
        return df.getPlanetWithId(this.locationId) as Planet;
    }

    get minX() {
        return this.location.coords.x;
    }

    get maxX() {
        return this.location.coords.x;
    }

    get minY() {
        return this.location.coords.y;
    }

    get maxY() {
        return this.location.coords.y;
    }
}

interface FindPlanetOptions {
    owned?: boolean; // Only return owned/unowned planets
    underAttack?: string; // Only return planets attacked by nobody or the specified player
    sendsFrom?: string; // Limit maximum number of sends from this player
    defaults?: boolean; // Only return planets without/with default settings
}

export class Context {
    player: Player;
    handlers: Map<string, HandlerInfo<any>> = new Map();
    planetsById: { [key: string]: PlanetInfo } = {};
    incomingEnergy: { [key: string]: number } = {};
    incomingSilver: { [key: string]: number } = {};
    incomingSends: { [key: string]: { [key: string]: number } } = {};

    constructor(player: Player) {
        this.player = player;
    }

    addHandler<T extends ConfigurationOptions>(handler: ActionHandler<T>) {
        this.handlers.set(handler.key, {
            handler,
            config: defaultValues(handler.options),
        });
    }

    addPlanet(planet: PlanetInfo) {
        this.planetsById[planet.planet.locationId] = planet;
    }

    getPlanetInfo(planet: Planet, write = false) {
        let info = this.planetsById[planet.locationId];
        if (info === undefined) {
            info = new PlanetInfo(planet, Array.from(this.handlers.values()));
            if (write) {
                this.addPlanet(info);
            }
        }
        return info;
    }

    findPlanets<T extends ConfigurationOptions>(forHandler: ActionHandler<T>, origin: LocationId, sendingPercent: number, options: FindPlanetOptions): Array<{planet: Planet, config: ConfigType<T>}> {
        let candidates: Array<{planet: Planet, config: ConfigType<T>|undefined}>;
        if(options.defaults === false) {
            // If we're only looking for planets we have settings for, it's much quicker to search planetsById
            candidates = Object.values(this.planetsById).map(( {planet, handlers} ) => ({
                planet,
                config: (handlers.get(forHandler.key) as HandlerInfo<T> | undefined)?.config
            }));
        } else {
            // Otherwise ask DF for all planets in range
            candidates = df.getPlanetsInRange(origin, sendingPercent).map(( planet ) => ({
                planet,
                config: (this.getPlanetInfo(planet).handlers.get(forHandler.key) as HandlerInfo<T> | undefined)?.config 
            }));
            // ...and filter out those with settings if necessary
            if(options.defaults === true) {
                candidates = candidates.filter((candidate) => this.planetsById[candidate.planet.locationId] === undefined);
            }
        }
        return candidates
            .filter(( {planet, config} ) => (options.owned === undefined || options.owned === (planet.owner === this.player.address))
                && (options.underAttack === undefined || !this.underAttack(planet, options.underAttack))
                && (options.sendsFrom === undefined || this.countSends(planet.locationId, options.sendsFrom) < 6)
                && df.getDist(origin, planet.locationId) < df.getMaxMoveDist(origin, sendingPercent)
                && config !== undefined) as Array<{planet: Planet, config: ConfigType<T>}>;
    }

    getMyPlanets() {
        return df.getMyPlanets().map((planet) => this.getPlanetInfo(planet));
    }

    underAttack(planet: Planet, allowedPlayer: string) {
        const sends = this.incomingSends[planet.locationId];
        return sends !== undefined && Object.keys(sends).some((player) => player != allowedPlayer);
    }

    countSends(planet: LocationId, sender: string): number {
        return this.incomingSends[planet]?.[sender] || 0;
    }

    processVoyages(voyages: Array<QueuedArrival>) {
        this.incomingEnergy = {};
        this.incomingSilver = {};
        this.incomingSends = {};
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
