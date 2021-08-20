import { VNode } from "preact";
import { useEffect, useState } from "preact/hooks";
import { html } from 'htm/preact';
import { HandlerAction } from "./actions";
import { Bot } from "./bot";
import { getPlanetName } from "./utils";
import { DebugHelper } from "./debughelper";

export function App({ bot }: { bot: Bot; }) {
  const [actions, setActions] = useState(null as Array<HandlerAction> | null);

  useEffect(() => {
    const subscription = bot.actionsUpdated$.subscribe(setActions);
    return subscription.unsubscribe;
  }, []);

  let table: VNode<any>;
  if (actions === null) {
    table = html`<div>Running</div>`;
  } else {
    const rows: Array<VNode<any>> = [];
    for (const action of actions) {
      if (action.progress != 1.0 && action.progress != 0) {
        rows.push(html`<tr><th>${getPlanetName(action.planet)}</th><td>${Math.floor(action.progress * 100)}% ${action.getMessage()}</td></tr>`);
      } else {
        rows.push(html`<tr><th>${getPlanetName(action.planet)}</th><td>${action.getMessage()}</td></tr>`);
      }
    }
    table = html`<table>${rows}</table>`;
  }
  return html`<div>
    <${DebugHelper} bot=${bot}/>
    ${table}
  </div>`;
}