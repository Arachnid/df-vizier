import { HandlerAction } from "./actions";
import { VNode } from "preact";
import { useEffect, useState } from "preact/hooks";
import { Bot } from "./bot";
import { getPlanetName } from "./utils";
import { html } from 'htm/preact';

export function App({ bot }: { bot: Bot; }) {
  const [actions, setActions] = useState(null as Array<HandlerAction> | null);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined = undefined;
    async function runOnce() {
      const results = await bot.run();
      if (results !== null) {
        setActions(results);
      }
      intervalId = setInterval(runOnce, bot.config.runInterval);
    }
    runOnce();
    return () => {
      if (intervalId)
        clearInterval(intervalId);
    };
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
  return table;
}