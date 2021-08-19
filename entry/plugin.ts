import { Planet, Player, WorldLocation } from "@darkforest_eth/types";
import GameManager from "@df/GameManager";
import GameUIManager from "@df/GameUIManager";
import RBush from "rbush";
import { ActionHandler, ConfigType, ConfigurationOptions, Context, defaultValues, HandlerAction, NoAction } from "./handler";
import { ArtifactsHandler, AttackHandler, EnergyHandler, SilverHandler } from "./handlers";
import { getPlanetName, scorePlanet } from "./utils";

declare const df: GameManager;
declare const ui: GameUIManager;

interface PlanetInfo {
  planet: Planet;
  location: WorldLocation;
  score: number;
  effort: number;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

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

class Plugin {
  readonly dryRun = false;
  readonly runInterval = 60000;
  readonly minEnergyReserve = 0.15;
  readonly minCaptureLevel = 1; // Relative to max level
  readonly minActionLevel = 2; // Relative to max level

  timeout: ReturnType<typeof setTimeout>;
  handlers: Array<HandlerInfo<any>> = [];
  player: Player;
  table?: HTMLTableElement;
  planets: RBush<PlanetEntry>;

  constructor() {
    this.addHandler(new ArtifactsHandler());
    this.addHandler(new SilverHandler());
    this.addHandler(new EnergyHandler());
    this.addHandler(new AttackHandler());
    this.planets = new RBush<PlanetEntry>();
  }

  addHandler<T extends ConfigurationOptions>(handler: ActionHandler<T>) {
    this.handlers.push({
      handler,
      config: defaultValues(handler.options),
    })
  }

  buildPlanetIndex(planets: Iterable<Planet>, minLevel: number) {
    this.planets.load(Array.from(planets)
      // .filter((planet) => planet.planetLevel >= minLevel)
      .map((planet) => {
        const location = df.getLocationOfPlanet(planet.locationId) as WorldLocation;
        if (location === undefined) return undefined;
        return {
          minX: location.coords.x,
          maxX: location.coords.x,
          minY: location.coords.y,
          maxY: location.coords.y,
          planet: planet
        };
      }).filter((entry): entry is PlanetEntry => entry !== undefined));
  }

  /**
   * Called when plugin is launched with the "run" button.
   */
  async render(container) {
    container.style.width = '600px';
    this.table = document.createElement('table');
    container.appendChild(this.table);
    this.player = df.getPlayer() as Player;
    this.buildPlanetIndex(df.getAllPlanets(), 3);
    await this.run();
  }

  /**
   * Called when plugin modal is closed.
   */
  destroy() {
    clearTimeout(this.timeout);
  }

  async run() {
    const unconfirmedCount = df.getUnconfirmedMoves().length + df.getUnconfirmedUpgrades().length;
    if (unconfirmedCount > 0) {
      log(`Waiting on ${unconfirmedCount} unconfirmed actions`);
    } else {
      log(`Beginning run...`);

      const myPlanets = df.getMyPlanets();
      myPlanets.sort((a, b) => scorePlanet(b) - scorePlanet(a));

      const context = new Context(this.player, Math.max(...myPlanets.map((planet) => planet.planetLevel)));
      context.processVoyages(df.getAllVoyages());

      const results: Array<{ planet: Planet, action: HandlerAction }> = [];
      for (const planet of myPlanets) {
        if (planet.planetLevel + this.minActionLevel < context.maxLevel) {
          continue;
        }
        const action = await this.runOne(planet, context);
        results.push({ planet, action });
        log(`${getPlanetName(planet, false)}: ${action.getMessage(false)}`);
      }
      results.sort((a, b) => b.action.progress - a.action.progress);

      const container = this.table?.parentElement;
      this.table?.remove();
      this.table = document.createElement('table');
      container?.appendChild(this.table);
      for (const { planet, action } of results) {
        const row = document.createElement('tr');
        const namecol = document.createElement('td');
        namecol.innerHTML = getPlanetName(planet);
        row.appendChild(namecol);
        const actioncol = document.createElement('td');
        if (action.progress != 1.0 && action.progress != 0) {
          actioncol.innerHTML = `${Math.ceil(action.progress * 100)}% ${action.getMessage(true)}`;
        } else {
          actioncol.innerHTML = action.getMessage(true);
        }
        row.appendChild(actioncol);
        this.table.appendChild(row);
      }
    }

    this.timeout = setTimeout(this.run.bind(this), this.runInterval);
  }

  async runOne(planet: Planet, context: Context): Promise<HandlerAction> {
    const minTargetLevel = context.maxLevel - this.minCaptureLevel;
    // const inRange = df.getPlanetsInRange(planet.locationId, 100 * (1 - this.minEnergyReserve)).filter((planet) => planet.planetLevel >= minTargetLevel);
    const location = df.getLocationOfPlanet(planet.locationId) as WorldLocation;
    const range = df.getMaxMoveDist(planet.locationId, 100 * (1 - this.minEnergyReserve));
    const inRange = this.planets.search({ minX: location.coords.x - range, minY: location.coords.y - range, maxX: location.coords.x + range, maxY: location.coords.y + range })
      .map((entry) => entry.planet)
      .filter((planet) => planet.planetLevel >= minTargetLevel);
    context.inRange = inRange;
    for (const { handler, config } of this.handlers) {
      const action = handler.run(planet, config, context);
      if (!this.dryRun) {
        action.execute(df, context);
      }
      if (!action.continue) {
        return action;
      }
    }
    return new NoAction();
  }
}

/**
 * And don't forget to export it!
 */
export default Plugin;
