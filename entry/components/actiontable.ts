import { VNode } from "preact";
import { useEffect, useState } from "preact/hooks";
import { html } from 'htm/preact';
import { HandlerAction } from "../actions";
import { Bot } from "../bot";
import { getPlanetName } from "../utils";

export function ActionTable({ bot }: { bot: Bot }) {
  const [actions, setActions] = useState(null as Array<HandlerAction> | null);

  useEffect(() => {
    const subscription = bot.actionsUpdated$.subscribe(setActions);
    return subscription.unsubscribe;
  }, []);

  if (actions === null) {
    return html`<div>Running</div>`;
  } else {
    const rows: Array<VNode<any>> = [];
    for (const action of actions) {
      if (action.progress != 1.0 && action.progress != 0) {
        rows.push(html`<tr><th>${getPlanetName(action.planet)}</th><td>${Math.floor(action.progress * 100)}% ${action.getMessage()}</td></tr>`);
      } else {
        rows.push(html`<tr><th>${getPlanetName(action.planet)}</th><td>${action.getMessage()}</td></tr>`);
      }
    }
    return html`<div>
      <table>${rows}</table>
    </div>`;
  }
}