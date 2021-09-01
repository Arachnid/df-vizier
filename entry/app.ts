import GameUIManager from '@df_client/src/Backend/GameLogic/GameUIManager';
import { html } from 'htm/preact';
import { useState } from 'preact/hooks';
import { Bot, globalConfig } from "./bot";
import { GlobalConfiguration } from './components/configuration';
import { DebugHelper } from "./components/debughelper";
import { PlanetPanel } from './components/planet';
import { PlanetListPanel } from './components/planetlist';
import { useMonomitter } from './utils';

export declare const ui: GameUIManager;

enum Panel {
  DEFAULT,
  CONFIG
}

export function App({ bot }: { bot: Bot; }) {  
  const [active, setActive] = useState(Panel.DEFAULT);
  const sortByColumn = useState<number|undefined>(undefined);
  const reverse = useState(false);
  const planet = useMonomitter(ui.selectedPlanet$);
  const target = useMonomitter(ui.hoverPlanet$);
  const back = () => setActive(Panel.DEFAULT);

  switch (active) {
    case Panel.DEFAULT:
      return html`<div>
        <button onClick=${() => setActive(Panel.CONFIG)}>Default Settings</button>
        <button onClick=${() => bot.run(bot.config.dryRun)}>Update</button>
        ${planet === undefined
          ?html`<${PlanetListPanel} context=${bot.context} actionsUpdated$=${bot.actionsUpdated$} saveSettings=${bot.saveSettings.bind(bot)} sort=${sortByColumn} reverse=${reverse} />`
          :html`<${PlanetPanel} bot=${bot} planet=${planet} target=${target} saveSettings=${bot.saveSettings.bind(bot)} />`}
      </div>`;
    case Panel.CONFIG:
      const configs = [bot.config, ...Array.from(bot.context.handlers.values()).map((info) => info.config)];
      const options = [
        {title: 'Global settings', options: globalConfig},
        ...Array.from(bot.context.handlers.values()).map((info) => ({
          title: `${info.handler.actionLabel} ${info.handler.title}`,
          options: info.handler.options
        }))
      ];
      return html`<${GlobalConfiguration} currentConfigs=${configs} options=${options} back=${back} saveSettings=${bot.saveSettings.bind(bot)} />`;
  }
}