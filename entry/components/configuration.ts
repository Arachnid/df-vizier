import { VNode } from "preact";
import { useEffect, useReducer, useState } from "preact/hooks";
import { html } from 'htm/preact';
import { HandlerAction } from "../actions";
import { Bot } from "../bot";
import { getPlanetName } from "../utils";
import { BoolOption, ConfigType, ConfigurationOptions, globalConfig, NumberOption, Percentage, RelativeLevel } from "entry/config";

export function Configuration({ bot, back }: { bot: Bot; back: ()=>void }) {
  const panels = Array.prototype.concat(
    bot.handlers
      .filter(({handler}) => Object.entries(handler.options).length > 0)
      .map(({handler, config}) => ({title: handler.constructor.name, options: handler.options, config})),
    [{options: globalConfig, config: bot.config, title: "Global configuration"}],
  );
  const [activePanel, setActivePanel] = useState(-1);
  if(activePanel == -1) {
    return html`<div>
      <div><button onClick=${back}>Back</button></div>
      <h1>Configuration Settings</h1>
      ${panels.map(({title}, index) => html`<div><button onClick=${() => setActivePanel(index)}>${title}</button></div>`)}
    </div>`;
  } else {
    const panel = panels[activePanel];
    const save = (newConfig: typeof panel.config) => {
      Object.assign(panel.config, newConfig);
      setActivePanel(-1);
    }
    return html`<div>
      <div><button onClick=${() => setActivePanel(-1)}>Back</button></div>
      <h1>${panel.title} configuration</h1>
      <${ConfigurationPanel} options=${panel.options} config=${panel.config} save=${save} />
    </div>`;
  }
}

export function ConfigurationPanel<T extends ConfigurationOptions>({options, config, save}: {options: T, config: ConfigType<T>, save: (config: ConfigType<T>)=>void}) {
  const [workingConfig, updateConfig] = useReducer((prevState, updates: Partial<ConfigType<T>>) => ({...prevState, ...updates}), config);

  return html`<div>
    <table>
      ${Object.entries(options).map(([key, descriptor]) => {
        if(descriptor instanceof Percentage) {
          return html`<tr>
            <th>${key}</th>
            <td>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value=${workingConfig[key]}
                onInput=${(e: Event) => updateConfig({[key]: (e.target as HTMLInputElement).valueAsNumber} as Partial<ConfigType<T>>)}
              />
              ${workingConfig[key].toFixed(2)}
            </td>
          </tr>`;
        } else if(descriptor instanceof RelativeLevel) {
          return html`<tr>
            <th>${key}</th>
            <td>
              <select onChange=${(e: Event) => updateConfig({[key]: parseInt((e.target as HTMLSelectElement).value)} as Partial<ConfigType<T>>)}>
                ${[0, 1, 2, 3].map(value => html`
                  <option value="${value}" selected=${value == workingConfig[key]}>${-value}</option>
                `)}
              </select>
            </td>
          </tr>`;
        } else if(descriptor instanceof BoolOption) {
          return html`<tr>
            <th>${key}</th>
            <td>
              <input type="checkbox" onChange=${(e: Event) => updateConfig({[key]: (e.target as HTMLInputElement).checked} as Partial<ConfigType<T>>)} checked=${workingConfig[key]} />
            </td>
          </tr>`;
        } else if(descriptor instanceof NumberOption) {
          return html`<tr>
            <th>${key}</th>
            <td>
              <input
                type="number"
                min="1000"
                step="1000"
                onChange=${(e: Event) => updateConfig({[key]: (e.target as HTMLInputElement).valueAsNumber} as Partial<ConfigType<T>>)}
                value=${workingConfig[key]}
              />
            </td>
          </tr>`;
        }
      })}
    </table>
    <button onClick=${() => save(workingConfig)}>Save</button>
  </div>`;
}
