import { LocationId, Planet, Player } from "@darkforest_eth/types";
import { ActionHandler, Context, DebugValue, HandlerInfo, PlanetInfo } from "./handler";
import { BoolOption, ConfigType, ConfigurationOptions, defaultValues, NumberOption, ConfigScope } from "./config";
import { HandlerAction, NoAction } from "./actions";
import { getPlanetName, stripTags } from "./utils";
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

export const globalConfig = {
  dryRun: new BoolOption(true, ConfigScope.ALL, 'Dry Run'),
  runInterval: new NumberOption(60000, ConfigScope.ALL, 'Run Interval'),
};

interface SavedSettings {
  global: ConfigType<typeof globalConfig>;
  defaults: {[handlerKey: string]: ConfigType<any>};
  planets: {[locationId: string]: {[handlerKey: string]: ConfigType<any>}};
}

export class Bot {
  config: ConfigType<typeof globalConfig>;
  actionsUpdated$: Monomitter<Map<string, HandlerAction>> = monomitter(true);
  interval?: ReturnType<typeof setInterval>;
  context: Context;

  constructor(handlers: Array<ActionHandler<any>>, planets: Iterable<Planet>, player: Player) {
    this.config = defaultValues(globalConfig);
    this.context = new Context(df.getPlayer() as Player);
    for (const handler of handlers) {
      this.context.addHandler(handler);
    }
    this.loadSettings();
  }

  start() {
    async function runOnce() {
      await this.run(this.config.dryRun);
      this.interval = setTimeout(runOnce.bind(this), this.config.runInterval);
    }
    setTimeout(runOnce.bind(this), 0);
  }

  stop() {
    if(this.interval) {
      clearTimeout(this.interval);
    }
  }

  getPlanetInfo(planet: Planet, write = false): PlanetInfo {
    return this.context.getPlanetInfo(planet, write)
  }

  loadSettings() {
    const settingData = window.localStorage.getItem('vizier:settings');
    if(settingData === null) return;
    const savedSettings = JSON.parse(settingData) as SavedSettings;
    
    Object.assign(this.config, savedSettings.global);
    
    for(const [key, handler] of this.context.handlers.entries()) {
      if(savedSettings.defaults[key] !== undefined) {
        Object.assign(handler.config, savedSettings.defaults[key]);
      }
    }

    for(const [locationId, configs] of Object.entries(savedSettings.planets)) {
      const planet = df.getPlanetWithId(locationId as LocationId);
      if(planet === undefined) continue;
      const planetInfo = this.getPlanetInfo(planet, true);
      for(const [key, handler] of planetInfo.handlers.entries()) {
        if(configs[key] !== undefined) {
          Object.assign(handler.config, configs[key]);
        }
      }
    }
  }

  saveSettings() {
    const defaults = Object.fromEntries(
      Array.from(this.context.handlers.entries()).map(([key, handler]) => [
        key,
        Object.fromEntries(Object.entries(handler.config))
      ])
    );

    const planets = Object.fromEntries(
      Object.entries(this.context.planetsById).map(([locationId, info]) => [
        locationId,
        Object.fromEntries(Array.from(info.handlers.entries()).map(([key, handler]) => [
          key,
          Object.fromEntries(Object.entries(handler.config))
        ]))
      ])
    );

    const settings = {global: this.config, defaults, planets};
    window.localStorage.setItem('vizier:settings', JSON.stringify(settings));
  }

  async run(dryRun: boolean) {
    const unconfirmedCount = df.getUnconfirmedMoves().length + df.getUnconfirmedUpgrades().length;
    if (unconfirmedCount > 0) {
      log(`Waiting on ${unconfirmedCount} unconfirmed actions`);
      return null;
    } else {
      log(`Beginning run...`);
      this.context.processVoyages(df.getAllVoyages());

      for(const handler of this.context.handlers.values()) {
        handler.handler.prepare(this.context);
      }

      const results = new Map<string, HandlerAction>();
      for (const {planet, handlers} of this.context.getMyPlanets()) {
        const action = await this.runOne(planet, handlers, dryRun);
        results.set(planet.locationId, action);
        if (action.progress == 1.0) {
          log(stripTags(`${getPlanetName(planet)}: ${action.getMessage()}`));
        }
      }
      this.actionsUpdated$.publish(results);
    }
  }

  debugInfo(planet: Planet, targetPlanet: Planet|undefined): Map<string, DebugValue[]> {
    const debug = new Map<string, DebugValue[]>();

    const info = this.context.planetsById[planet.locationId];
    if(info === undefined) {
      return debug;
    }
    for(const {handler, config} of info.handlers.values()) {
      const origin = {planet, config};
      if(targetPlanet === undefined) {
        debug.set(handler.key, handler.debugInfo(origin, undefined, this.context));
      } else {
        const targetConfig = (
          this.context.planetsById[planet.locationId]?.handlers?.get(handler.key)?.config
          || this.context.handlers.get(handler.key)?.config) as ConfigType<any>;
        const target = {planet: targetPlanet, config: targetConfig};
        debug.set(handler.key, handler.debugInfo(origin, target, this.context));
      }
    }
    return debug;
  }


  private async runOne(planet: Planet, handlers: Map<string, HandlerInfo<any>>, dryRun: boolean): Promise<HandlerAction> {
    for (const { handler, config } of handlers.values()) {
      if(!config.enabled) continue;
      const action = handler.run(planet, config, this.context);
      if (!dryRun) {
        action.execute(df, this.context);
      }
      if (!action.continue) {
        return action;
      }
    }
    return new NoAction(planet);
  }
}
