import { Planet } from "@darkforest_eth/types";
import GameUIManager from "@df/GameUIManager";
import { html } from 'htm/preact';
import { VNode } from "preact";
import { useEffect, useState } from "preact/hooks";
import { Bot } from '../bot';
import { scorePlanet, useMonomitter } from "../utils";

export declare const ui: GameUIManager;

export function DebugHelper({bot, back}: {bot: Bot; back: () => void;}) {
    const planet = useMonomitter(ui.selectedPlanet$);
    const target = useMonomitter(ui.hoverPlanet$);

    let table: VNode;
    if(planet === undefined) {
        table = html`<div>Select a planet to see debug information.</div>`;
    } else {
        const entries = bot.debugInfo(planet, target);
        table = html`<table>
            ${entries.filter(({debug}) => debug.length > 0).map(({plugin, debug}) => html`
                <tr><th colspan="2">${plugin}</th></tr>
                ${debug.map((entry) => html`<tr><th>${entry.key}</th><td>${entry.value}</td></tr>`)}
            `)}
        </table>`;
    }
    return html`<div>
        <button onClick=${back}>Back</button>
        ${table}
    </div>`;
}
