import { useState } from "preact/hooks";
import { html } from 'htm/preact';
import { BoolOption, ConfigScope, ConfigType, ConfigurationOptions, MultipleChoice, NumberOption, Percentage } from "entry/config";

export function GlobalConfiguration({ options, currentConfigs, back, saveSettings }: { options: Array<{title: string, options: ConfigurationOptions}>, currentConfigs: Array<ConfigType<any>>; back: () => void, saveSettings: () => void }) {
  const [configs, setConfigs] = useState(currentConfigs);

  function onUpdate(index: number) {
    return (config: ConfigType<any>) => {
      const newConfigs = [...configs];
      newConfigs[index] = config;
      setConfigs(newConfigs);
    }
  }

  function save(index: number) {
    return () => {
      const config = configs[index];
      const currentConfig = currentConfigs[index];
      for(const key of Object.keys(options[index].options)) {
        if(config.hasOwnProperty(key)) {
          currentConfig[key] = config[key];
        } else if(currentConfig.hasOwnProperty(key)) {
          delete currentConfig[key];
        }
      }
      saveSettings();
      back();
    }
  }

  return html`<div>
    <div><button onClick=${back}>Back</button></div>
    <h1>Configuration Settings</h1>
    ${configs.flatMap((config, idx) => {
        if(Object.entries(options[idx].options).length == 0) return [];
        return [html`
          <h2>${options[idx].title}</h2>
          <${ConfigurationPanel}
            options=${options[idx].options}
            config=${config}
            scopes=${new Set([ConfigScope.ALL, ConfigScope.OWNED, ConfigScope.UNOWNED])}
            defaults=false
            onUpdate=${onUpdate(idx)} />
          <button onClick=${save(idx)}>Save</button>
        `];
    })}
  </div>`;
}

export function ConfigurationPanel<T extends ConfigurationOptions>({ options, config, scopes, onUpdate, defaults=true }: { options: T, config: ConfigType<T>, scopes: Set<ConfigScope>, onUpdate: (config: ConfigType<T>) => void, defaults: boolean }) {
  function doUpdate<K extends keyof ConfigType<T>>(key: K, value: ConfigType<T>[K]) {
    const newConfig = Object.assign(Object.create(Object.getPrototypeOf(config)), config);
    newConfig[key] = value;
    onUpdate(newConfig);
  }

  function toggleDefault<K extends keyof ConfigType<T>>(key: K) {
    return (e: Event) => {
      const newConfig = Object.create(Object.getPrototypeOf(config));
      Object.assign(newConfig, config);
      if((e.target as HTMLInputElement).checked) {
        delete newConfig[key];
      } else {
        newConfig[key] = newConfig[key];
      }
      onUpdate(newConfig);
    }
  }

  return html`
    <table>
      <thead>
        <tr>
          <th>Setting</th>
          ${defaults === true && html`<th>Default?</th>`}
          <th>Value</th></tr>
      </thead>
      ${Object.entries(options).filter(([key, descriptor]) => scopes.has(descriptor.scope)).map(([key, descriptor]) => {
        if (descriptor instanceof Percentage) {
          return html`<tr>
                <th>${descriptor.title}</th>
                ${defaults === true && html`<td><input type="checkbox" onChange=${toggleDefault(key)} checked=${!config.hasOwnProperty(key)} /></td>`}
                <td>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value=${config[key]}
                    onInput=${(e: Event) => doUpdate(key, (e.target as HTMLInputElement).valueAsNumber)}
                  />
                  ${config[key].toFixed(2)}
                </td>
              </tr>`;
        } else if (descriptor instanceof BoolOption) {
          return html`<tr>
                <th>${descriptor.title}</th>
                ${defaults === true && html`<td><input type="checkbox" onChange=${toggleDefault(key)} checked=${!config.hasOwnProperty(key)} /></td>`}
                <td>
                  <input type="checkbox" onChange=${(e: Event) => doUpdate(key, (e.target as HTMLInputElement).checked)} checked=${config[key]} />
                </td>
              </tr>`;
        } else if (descriptor instanceof NumberOption) {
          return html`<tr>
                <th>${descriptor.title}</th>
                ${defaults === true && html`<td><input type="checkbox" onChange=${toggleDefault(key)} checked=${!config.hasOwnProperty(key)} /></td>`}
                <td>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    onInput=${(e: Event) => doUpdate(key, (e.target as HTMLInputElement).valueAsNumber)}
                    value=${config[key]}
                  />
                </td>
              </tr>`;
        } else if (descriptor instanceof MultipleChoice) {
          return html`<tr>
            <th>${descriptor.title}</th>
            ${defaults === true && html`<td><input type="checkbox" onChange=${toggleDefault(key)} checked=${!config.hasOwnProperty(key)} /></td>`}
            <td>
              <select onChange=${(e: Event) => doUpdate(key, (e.target as HTMLSelectElement).value)}>
                ${descriptor.choices.map(([choiceKey, value]) => html`
                  <option value="${choiceKey}" selected=${choiceKey == config[key]}>${value}</option>
                `)}
              </select>
            </td>
          </tr>`;
        }
      })}
  </table>`;
}
