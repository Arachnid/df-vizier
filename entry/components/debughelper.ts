import { Planet } from "@darkforest_eth/types";
import GameUIManager from "@df/GameUIManager";
import { html } from 'htm/preact';
import { VNode } from "preact";
import { Bot } from '../bot';

export declare const ui: GameUIManager;

export function DebugHelper({bot, planet, target}: {bot: Bot, planet: Planet; target?: Planet,}) {
    let table: VNode;
    const entries = bot.debugInfo(planet, target);
    const handlers = bot.context.handlers;
    return html`
        <table>
            ${Array.from(entries.entries()).filter(([_, values]) => values.length > 0).map(([key, values]) => html`
                <tr><th colspan="2">${handlers.get(key)?.handler.actionLabel} ${handlers.get(key)?.handler.title}</th></tr>
                ${values.map((entry) => html`<tr><th>${entry.key}</th><td>${entry.value}</td></tr>`)}
            `)}
        </table>
    `;
}
