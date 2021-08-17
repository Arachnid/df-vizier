import { Planet, Player, QueuedArrival, SpaceType, WorldLocation } from "@darkforest_eth/types";
import GameManager from "@df/GameManager";
import GameUIManager from "@df/GameUIManager";
import { TargetIcon } from "@df_client/src/Frontend/Components/Icons";

declare const df: GameManager;
declare const ui: GameUIManager;

enum HandlerAction { NONE, WAIT, ACTION }

const NO_OWNER = '0x0000000000000000000000000000000000000000';

interface HandlerResult {
  action: HandlerAction;
  message?: string;
  progress?: number;
}

type ArrivalMap = {[key: string]: Array<QueuedArrival>};

interface RunState {
  maxLevel: number;
  arrivals: ArrivalMap;
  incomingEnergy: {[key: string]: number};
  expectedSilver: {[key: string]: number};
}

type ModuleHandler = (info: Planet, inRange: Array<Planet>, state: RunState) => Promise<HandlerResult>|HandlerResult;

const enum PlanetType {
  PLANET = 0,
  ASTEROID_FIELD = 1,
  FOUNDRY = 2,
  SPACETIME_RIP = 3,
  QUASAR = 4
}

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

function getPlanetScoreModifier(planet: Planet): number {
  switch(planet.planetType as number) {
  case PlanetType.PLANET:
    return 1.0;
  case PlanetType.FOUNDRY:
    if(planet.hasTriedFindingArtifact) {
      return 0.0;
    } else {
      return 2.0;
    }
  case PlanetType.SPACETIME_RIP:
    return 0.5;
  case PlanetType.ASTEROID_FIELD:
    return 1.1;
  case PlanetType.QUASAR:
    return 0.5;
  default:
    return 0.0;
  }
}

function getSilverNeeded(planet: Planet): number {
  const totalLevel = planet.upgradeState.reduce((a, b) => a + b);
  return (totalLevel + 1) * 0.2 * planet.silverCap;
}

function maxPlanetRank(planet: Planet): number {
  switch(planet.spaceType) {
  case SpaceType.NEBULA:
    return 3;
  case SpaceType.SPACE:
    return 4;
  default:
    return 5;
  }
}

function log(message: string) {
  df.terminal.current?.println(message);
}

function scorePlanet(planet: Planet) {
  if(planet.planetLevel == 0) return 0.0;

  const location = df.getLocationOfPlanet(planet.locationId);
  if(location === undefined) {
    return 0.0;
  }

  const distanceToCenter = df.getDistCoords(location.coords, {x: 0, y: 0});
  return (Math.pow(planet.energyCap, 2) * getPlanetScoreModifier(planet)) / Math.log(Math.max(distanceToCenter, 2));
}

function scorePlanetEnergyNeed(planet: Planet, energy?: number) {
  if(!energy) {
    energy = planet.energy;
  }
  const baseNeed = Math.pow(planet.energyCap - energy, 2) * planet.speed;
  switch(planet.planetType as number) {
  case PlanetType.PLANET:
    return baseNeed;
  case PlanetType.QUASAR:
    return baseNeed * 1.5;
  case PlanetType.FOUNDRY:
    return baseNeed * 1.5;
  default:
    return 0.0;
  }
}

function getPlanetSilverValue(planet: Planet): number {
  let rank = planet.upgradeState.reduce((a, b) => a + b);

  switch(planet.planetType as number) {
  case PlanetType.SPACETIME_RIP:
    return 10 + planet.planetLevel;
  case PlanetType.PLANET:
    if(rank == maxPlanetRank(planet)) {
      return planet.planetLevel;
    }
    return 20 + planet.planetLevel + (1 - rank / 10);
  default:
    return 0.0;
  }
}

function getPlanetName(planet: Planet, html: boolean = true): string {
  const rank = planet.upgradeState.reduce((a, b) => a + b);
  const name = `${df.getProcgenUtils().getPlanetName(planet)} (L${planet.planetLevel}R${rank})`;
  if(html) {
    return `<a href="javascript:ui.setSelectedId('${planet.locationId}')">${name}`;
  } else {
    return name;
  }
}

class Plugin {
  readonly dryRun = false;
  readonly runInterval = 60000;
  readonly minEnergyReserve = 0.15;
  readonly minCaptureEnergy = 0.05;
  readonly minCaptureLevel = 1; // Relative to max level
  readonly minActionLevel = 1; // Relative to max level
  readonly minSilverSendLevel = 3; // Relative to max level
  readonly bigPirateModifier = 0.8; // Value modifier when partially capturing an unowned planet
  readonly bigEnemyModifier = 0.2; // Value modifier when partially capturing an owned planet
  readonly partialCaptureAmount = 0.70; // Amount of total energy to send for a 'partial capture'
  readonly minPartialCapture = 0.05; // Minimum % of target energy to bother with
  readonly silverSendAmount = 0.70; // Min % of silver to send if not filling target
  readonly energySendAmount = 0.70; // Min % of energy to send if not filling target
  readonly minSilverReserve = 0.15; // Min % of silver to keep on planets that produce silver
  readonly upgradeBranch = 1; // Range
  readonly secondaryUpgradeBranch = 2; // Speed
  
  timeout: ReturnType<typeof setTimeout>;
  modules: Array<ModuleHandler>;
  player: Player;
  table?: HTMLTableElement;
  
  constructor() {
    this.modules = [
      this.findArtifacts,
      this.sendSilverAndUpgrade,
      this.sendEnergy,
      this.capturePlanets,
    ];
  }

  /**
   * Called when plugin is launched with the "run" button.
   */
  async render(container) {
    container.style.width = '600px';
    this.table = document.createElement('table');
    container.appendChild(this.table);
    this.player = df.getPlayer() as Player;
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
    if(unconfirmedCount > 0) {
      log(`Waiting on ${unconfirmedCount} unconfirmed actions`);
    } else {
      log(`Beginning run...`);

      const myPlanets = df.getMyPlanets();
      const state: RunState = {
        maxLevel: Math.max(...myPlanets.map((planet) => planet.planetLevel)),
        arrivals: {},
        incomingEnergy: {},
        expectedSilver: {},
      }
      for(const arrival of df.getAllVoyages()) {
        if(arrival.arrivalTime < Date.now() / 1000) {
          continue;
        }
        if(arrival.player === this.player.address) {
          state.incomingEnergy[arrival.toPlanet] = (state.incomingEnergy[arrival.toPlanet] || 0) + arrival.energyArriving;
          state.expectedSilver[arrival.toPlanet] = (state.expectedSilver[arrival.toPlanet] || 0) + arrival.silverMoved;
        }
        if(state.arrivals[arrival.toPlanet] === undefined) {
          state.arrivals[arrival.toPlanet] = [];
        }
        state.arrivals[arrival.toPlanet].push(arrival);
      }
      myPlanets.sort((a, b) => scorePlanet(b) - scorePlanet(a));
      const results: Array<{planet: Planet, result: HandlerResult}> = [];
      for(const planet of myPlanets) {
        if(planet.planetLevel + this.minActionLevel < state.maxLevel) {
          continue;
        }
        const result = await this.runOne(planet, state);
        if(result.action != HandlerAction.NONE) {
          results.push({planet, result});
        }
        if(result.action == HandlerAction.ACTION && result.message) {
          log(`${getPlanetName(planet, false)}: ${result.message}`);
        }
      }
      results.sort((a, b) => (b.result.progress || 1) - (a.result.progress || 1));

      const container = this.table?.parentElement;
      this.table?.remove();
      this.table = document.createElement('table');
      container?.appendChild(this.table);
      for(const {planet, result} of results) {
        const row = document.createElement('tr');
        const namecol = document.createElement('td');
        namecol.innerHTML = getPlanetName(planet);
        row.appendChild(namecol);
        const actioncol = document.createElement('td');
        if(result.action == HandlerAction.WAIT && result.progress) {
          actioncol.innerHTML = `${Math.ceil(result.progress * 100)}% ${result.message}`;
        } else {
          actioncol.innerHTML = result.message || '';
        }
        row.appendChild(actioncol);
        this.table.appendChild(row);
      }
    }

    this.timeout = setTimeout(this.run.bind(this), this.runInterval);
  }

  async runOne(planet: Planet, state: RunState): Promise<HandlerResult> {
    const minTargetLevel = state.maxLevel - this.minCaptureLevel;
    const inRange = df.getPlanetsInRange(planet.locationId, 100).filter((planet) => planet.planetLevel >= minTargetLevel);
    for(const module of this.modules) {
      const result = await module.bind(this)(planet, inRange, state);
      if(result.action !== HandlerAction.NONE) {
        return result;
      }
    }
    return {action: HandlerAction.NONE, message: "Nothing to do"};
  }

  findArtifacts(planet: Planet, inRange: Array<Planet>, state: RunState): HandlerResult {
    if(!df.isPlanetMineable(planet) || planet.unconfirmedProspectPlanet || planet.unconfirmedFindArtifact) {
      return {action: HandlerAction.NONE};
    }
    if(planet.prospectedBlockNumber === undefined) {
      if(planet.energy >= planet.energyCap * 0.95) {
        if(!this.dryRun) df.prospectPlanet(planet.locationId);
        return {action: HandlerAction.ACTION, message: "Prospecting for artifacts"};
      } else {
        const progress = planet.energy / (planet.energyCap * 0.95);
        return {action: HandlerAction.WAIT, progress: progress, message: `to prospect`};
      }
    }
    const currentBlockNumber = df.contractsAPI.ethConnection.blockNumber;
    if(!planet.hasTriedFindingArtifact && !planet.unconfirmedFindArtifact && currentBlockNumber - planet.prospectedBlockNumber < 256) {
      if(!this.dryRun) df.findArtifact(planet.locationId);
      return {action: HandlerAction.ACTION, message: "Finding artifact"};
    }
    return {action: HandlerAction.NONE};
  }

  sendSilverAndUpgrade(planet: Planet, inRange: Array<Planet>, state: RunState): HandlerResult {
    let mySilver = planet.silver;
    const rank = planet.upgradeState.reduce((a, b) => a + b);
    if(planet.planetType as number == PlanetType.PLANET && planet.planetLevel > 0 && rank < maxPlanetRank(planet)) {
      if(mySilver >= getSilverNeeded(planet)) {
        mySilver -= getSilverNeeded(planet);
        if(rank == maxPlanetRank(planet) - 1) {
          if(!this.dryRun) df.upgrade(planet.locationId, this.secondaryUpgradeBranch);
          return {action: HandlerAction.ACTION, message: `Upgrading ${this.secondaryUpgradeBranch}`};
        } else {
          if(!this.dryRun) df.upgrade(planet.locationId, this.upgradeBranch);
          return {action: HandlerAction.ACTION, message: `Upgrading ${this.upgradeBranch}`};
        }
      } else {
        // Wait for more silver, but we can do other things in the meantime.
        return {action: HandlerAction.NONE};
      }
    }

    const mySilverValue = getPlanetSilverValue(planet);
    const targets = inRange
      .filter((target) => 
        // Ours
        target.owner == this.player.address
        // Not under attack
        && (state.arrivals[target.locationId] || []).every((a) => a.player == this.player.address)
        // Not too many incoming sends
        && (state.arrivals[target.locationId] || []).filter((a) => a.player == this.player.address).length < 6
        // Not this same planet
        && target.locationId != planet.locationId)
      .map((target) => {
        const value = getPlanetSilverValue(target);
        return {planet: target, value: value};
      });
    targets.sort((a, b) => b.value - a.value);

    for(const target of targets) {
      if(target.value <= mySilverValue) {
        break;
      }
      const capRemaining = target.planet.silverCap - target.planet.silver - (state.expectedSilver[target.planet.locationId] || 0);
      if(capRemaining <= 0) {
        continue;
      }
      const sendAmount = Math.ceil(
        Math.min(
          capRemaining,
          Math.max(
            planet.silver - planet.silverCap * this.minSilverReserve,
            planet.silverCap * this.silverSendAmount
          )
        )
      );
      const energyRequired = Math.ceil(df.getEnergyNeededForMove(planet.locationId, target.planet.locationId, 1));
      
      const enoughSilver = (planet.silverGrowth == 0 && sendAmount <= planet.silver) || (planet.silverGrowth > 0 && planet.silver - sendAmount >= planet.silverCap * this.minSilverReserve);
      const enoughEnergy = planet.energy - energyRequired >= planet.energyCap * this.minEnergyReserve;
      if(enoughSilver && enoughEnergy) {
        if(!this.dryRun) df.move(planet.locationId, target.planet.locationId, energyRequired, sendAmount);
        mySilver -= sendAmount;
        state.expectedSilver[target.planet.locationId] = (state.expectedSilver[target.planet.locationId] || 0) + sendAmount;
        return {action: HandlerAction.ACTION, message: `Sending ${sendAmount} silver to ${getPlanetName(target.planet)}`};
      } else if(enoughSilver && !enoughEnergy) {
        const progress = planet.energy / (energyRequired + planet.energyCap * this.minEnergyReserve);
        return {action: HandlerAction.WAIT, progress: progress, message: ` energy to send silver to ${getPlanetName(target.planet)}`};
      }
    }

    return {action: HandlerAction.NONE};
  }

  sendEnergy(planet: Planet, inRange: Array<Planet>, state: RunState): HandlerResult {
    if(planet.planetType as number == PlanetType.ASTEROID_FIELD) {
      return {action: HandlerAction.NONE};
    }
    const maxSendAmount = Math.ceil(planet.energyCap * this.energySendAmount);
    const myScore = scorePlanetEnergyNeed(planet, planet.energy - maxSendAmount);
    const targets = inRange
      .filter((target) => 
        // Ours
        target.owner == this.player.address
        // Not under attack
        && (state.arrivals[target.locationId] || []).every((a) => a.player == this.player.address)
        // Not too many incoming sends
        && (state.arrivals[target.locationId] || []).filter((a) => a.player == this.player.address).length < 6
        // Not this same planet
        && target.locationId != planet.locationId)
      .map((target) => {
        const score = scorePlanetEnergyNeed(target);
        const sendAmount = Math.ceil(Math.min(maxSendAmount, target.energyCap * (1 - this.minEnergyReserve) - target.energy - (state.incomingEnergy[target.locationId] || 0)));
        const value = score * (df.getEnergyArrivingForMove(planet.locationId, target.locationId, undefined, sendAmount) / sendAmount);
        return {planet: target, score, value, sendAmount};
      });
    targets.sort((a, b) => b.value - a.value);

    let myEnergy = planet.energy;
    for(const target of targets) {
      if(target.score <= myScore || target.sendAmount <= 0) {
        continue;
      }
      if(myEnergy - target.sendAmount >= planet.energyCap * this.minEnergyReserve) {
        if(!this.dryRun) df.move(planet.locationId, target.planet.locationId, target.sendAmount, 0);
        state.incomingEnergy[target.planet.locationId] = (state.incomingEnergy[target.planet.locationId] || 0) + target.sendAmount;
        myEnergy -= target.sendAmount;
        return {action: HandlerAction.ACTION, message: `Sending ${target.sendAmount} energy to ${getPlanetName(target.planet)}`};
      } else {
        const progress = planet.energy / (target.sendAmount + planet.energyCap * this.minEnergyReserve);
        return {action: HandlerAction.WAIT, progress: progress, message: ` energy to send to ${getPlanetName(target.planet)}`};
      }
    }
    return {action: HandlerAction.NONE};
  }

  capturePlanets(planet: Planet, inRange: Array<Planet>, state: RunState): HandlerResult {
    if((state.arrivals[planet.locationId] || []).some((a) => a.player != this.player.address)) {
      // Don't send from planets under attack
      return {action: HandlerAction.NONE};
    }

    const maxSend = planet.energyCap * (1.0 - this.minEnergyReserve);

    const targets = inRange
      .filter((target) => 
        // Not ours
        target.owner != this.player.address
        // Not under attack
        && (state.arrivals[target.locationId] || []).every((a) => a.player == this.player.address)
        // Not too many incoming sends
        && (state.arrivals[target.locationId] || []).filter((a) => a.player == this.player.address).length < 6
        // At least min level, and at least our level
        && target.planetLevel >= planet.planetLevel)
      .map((target) => {
        let targetEnergy = target.energyCap * this.minCaptureEnergy + (target.energy - (state.incomingEnergy[target.locationId] || 0)) * (target.defense / 100.0);
        let sendEnergy = Math.ceil(df.getEnergyNeededForMove(planet.locationId, target.locationId, targetEnergy));
        const score = scorePlanet(target);
        let value = score / sendEnergy;
        if(sendEnergy > maxSend) {
          sendEnergy = planet.energyCap * this.partialCaptureAmount;
          targetEnergy = df.getEnergyArrivingForMove(planet.locationId, target.locationId, undefined, sendEnergy);
          if(target.owner === NO_OWNER) {
            value *= this.bigPirateModifier;
          } else {
            value *= this.bigEnemyModifier;
          }
        }
        return {planet: target, targetEnergy, sendEnergy, score, value};
      });
    targets.sort((a, b) => b.value - a.value);

    for(const target of targets) {
      if(target.sendEnergy <= 0 || target.targetEnergy / target.planet.energy < this.minPartialCapture) {
        continue;
      }
      if(planet.energy - target.sendEnergy >= planet.energyCap * this.minEnergyReserve) {
        state.incomingEnergy[target.planet.locationId] = (state.incomingEnergy[target.planet.locationId] || 0) + target.targetEnergy;
        if(!this.dryRun) df.move(planet.locationId, target.planet.locationId, target.sendEnergy, 0);
        return {action: HandlerAction.ACTION, message: `Capturing ${getPlanetName(target.planet)} with ${target.sendEnergy}`};
      } else {
        const progress = planet.energy / (target.sendEnergy + planet.energyCap * this.minEnergyReserve);
        return {action: HandlerAction.WAIT, progress: progress, message: ` to attack ${getPlanetName(target.planet)}`};
      }
    }
    return {action: HandlerAction.NONE};
  }
}

/**
 * And don't forget to export it!
 */
export default Plugin;
