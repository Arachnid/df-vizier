import { Player } from "@darkforest_eth/types";
import GameManager from "@df/GameManager";
import GameUIManager from "@df/GameUIManager";
import { ArtifactsHandler, AttackHandler, EnergyHandler, SilverHandler } from "./handlers";
import { createElement, render } from "preact";
import { App } from "./app";
import { Bot } from "./bot";

export declare const df: GameManager;
declare const ui: GameUIManager;

class Plugin {
  container?: HTMLElement;
  bot?: Bot;

  constructor() {
  }

  async render(container: HTMLElement) {
    this.container = container;
    this.bot = new Bot([
      new ArtifactsHandler(),
      new SilverHandler(),
      new EnergyHandler(),
      new AttackHandler(),
    ], df.getAllPlanets(), df.getPlayer() as Player);
    container.style.width = '600px';
    render(createElement(App, {bot: this.bot}), container);
  }

  destroy() {
    if (this.container !== undefined) {
      render(null, this.container);
    }
  }
}

/**
 * And don't forget to export it!
 */
export default Plugin;
