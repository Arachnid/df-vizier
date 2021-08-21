import { html } from 'htm/preact';
import { useState } from 'preact/hooks';
import { Bot } from "./bot";
import { ActionTable } from "./components/actiontable";
import { Configuration } from './components/configuration';
import { DebugHelper } from "./components/debughelper";

enum Panel {
  DEFAULT,
  ACTIONS,
  DEBUG,
  CONFIG
}

export function App({ bot }: { bot: Bot; }) {
  const [active, setActive] = useState(Panel.DEFAULT);
  const back = () => setActive(Panel.DEFAULT);
  switch (active) {
    case Panel.DEFAULT:
      return html`<div>
        <button onClick=${() => setActive(Panel.DEBUG)}>Debug</button>
        <button onClick=${() => setActive(Panel.ACTIONS)}>Pending Actions</button>
        <button onClick=${() => setActive(Panel.CONFIG)}>Configure</button>
      </div>`;
    case Panel.ACTIONS:
      return html`<${ActionTable} bot=${bot} back=${back} />`;
    case Panel.DEBUG:
      return html`<${DebugHelper} bot=${bot} back=${back} />`;
    case Panel.CONFIG:
      return html`<${Configuration} bot=${bot} back=${back} />`;
  }
}