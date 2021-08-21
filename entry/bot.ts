import { Planet, Player, WorldLocation } from "@darkforest_eth/types";
import RBush from "rbush";
import { ActionHandler, Context, DebugValue } from "./handler";
import { ConfigType, ConfigurationOptions, defaultValues, globalConfig, GlobalConfig } from "./config";
import { HandlerAction, NoAction } from "./actions";
import { getPlanetName, scorePlanet, stripTags } from "./utils";
import GameManager from "@df_client/src/Backend/GameLogic/GameManager";
import { monomitter, Monomitter } from "@darkforest_eth/events";

export declare const df: GameManager;

function log(message: string) {
  df.terminal.current?.println(message);
}

interface PlanetEntry {
  planet: Planet;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

interface HandlerInfo<T extends ConfigurationOptions> {
  handler: ActionHandler<T>;
  config: ConfigType<T>;
}

export class Bot {
  config: GlobalConfig;
  handlers: Array<HandlerInfo<any>> = [];
  player: Player;
  table?: HTMLTableElement;
  planets: RBush<PlanetEntry>;
  actionsUpdated$: Monomitter<Array<HandlerAction>> = monomitter(true);
  interval?: ReturnType<typeof setInterval>;
  lastContext: Context;

  constructor(handlers: Array<ActionHandler<any>>, planets: Iterable<Planet>, player: Player) {
    this.config = Object.fromEntries(Object.entries(globalConfig).map(([key, value]) => [key, value.defaultValue])) as GlobalConfig;
    for (const handler of handlers) {
      this.addHandler(handler);
    }
    this.planets = new RBush<PlanetEntry>();
    this.buildPlanetIndex(planets, 3);
    this.player = player;
    this.lastContext = this.makeContext(df.getMyPlanets());
  }

  start() {
    async function runOnce() {
      const actions = await this.run();
      if(actions !== null) {
        this.actionsUpdated$.publish(actions);
      }
      this.interval = setTimeout(runOnce.bind(this), this.config.runInterval);
    }
    setTimeout(runOnce.bind(this), 0);
  }

  stop() {
    if(this.interval) {
      clearTimeout(this.interval);
    }
  }

  addHandler<T extends ConfigurationOptions>(handler: ActionHandler<T>) {
    this.handlers.push({
      handler,
      config: defaultValues(handler.options, this.config),
    });
  }

  buildPlanetIndex(planets: Iterable<Planet>, minLevel: number) {
    this.planets.load(Array.from(planets)
      .filter((planet) => planet.planetLevel >= minLevel)
      .map((planet) => {
        const location = df.getLocationOfPlanet(planet.locationId) as WorldLocation;
        if (location === undefined)
          return undefined;
        return {
          minX: location.coords.x,
          maxX: location.coords.x,
          minY: location.coords.y,
          maxY: location.coords.y,
          planet: planet
        };
      }).filter((entry): entry is PlanetEntry => entry !== undefined));
  }

  async run(): Promise<Array<HandlerAction> | null> {
    const unconfirmedCount = df.getUnconfirmedMoves().length + df.getUnconfirmedUpgrades().length;
    if (unconfirmedCount > 0) {
      log(`Waiting on ${unconfirmedCount} unconfirmed actions`);
      return null;
    } else {
      log(`Beginning run...`);

      const myPlanets = df.getMyPlanets();
      myPlanets.sort((a, b) => scorePlanet(b) - scorePlanet(a));

      const context = this.makeContext(myPlanets);

      const results: Array<HandlerAction> = [];
      for (const planet of myPlanets) {
        if (planet.planetLevel + this.config.minActionLevel < context.maxLevel) {
          continue;
        }
        const action = await this.runOne(planet, context);
        results.push(action);
        if (action.progress == 1.0) {
          log(stripTags(`${getPlanetName(planet)}: ${action.getMessage()}`));
        }
      }
      this.lastContext = context;
      results.sort((a, b) => b.progress - a.progress);
      return results;
    }
  }

  debugInfo(planet: Planet, target: Planet|undefined): Array<{plugin: string, debug: DebugValue[]}> {
    return this.handlers.map(({handler, config}) => ({plugin: handler.constructor.name, debug: handler.debugInfo(planet, target, config, this.lastContext)}));
  }

  private makeContext(myPlanets: Array<Planet>) {
    const context = new Context(this.player, Math.max(...myPlanets.map((planet) => planet.planetLevel)));
    context.processVoyages(df.getAllVoyages());
    return context;
  }

  private async runOne(planet: Planet, context: Context): Promise<HandlerAction> {
    const minTargetLevel = context.maxLevel - this.config.minCaptureLevel;
    // const inRange = df.getPlanetsInRange(planet.locationId, 100 * (1 - this.minEnergyReserve)).filter((planet) => planet.planetLevel >= minTargetLevel);
    const location = df.getLocationOfPlanet(planet.locationId) as WorldLocation;
    const range = df.getMaxMoveDist(planet.locationId, 100 * (1 - this.config.minEnergyReserve));
    const inRange = this.planets.search({ minX: location.coords.x - range, minY: location.coords.y - range, maxX: location.coords.x + range, maxY: location.coords.y + range })
      .map((entry) => entry.planet)
      .filter((planet) => planet.planetLevel >= minTargetLevel);
    context.inRange = inRange;
    for (const { handler, config } of this.handlers) {
      const action = handler.run(planet, config, context);
      if (!this.config.dryRun) {
        action.execute(df, context);
      }
      if (!action.continue) {
        return action;
      }
    }
    return new NoAction(planet);
  }
}
