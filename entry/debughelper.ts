import { Planet } from "@darkforest_eth/types";
import GameUIManager from "@df/GameUIManager";
import { html } from 'htm/preact';
import { useEffect, useState } from "preact/hooks";
import { Bot } from './bot';
import { scorePlanet } from "./utils";

export declare const ui: GameUIManager;

export function DebugHelper({bot}: {bot: Bot}) {
    const [planet, setPlanet] = useState(undefined as Planet | undefined);

    useEffect(() => {
        const subscription = ui.hoverPlanet$.subscribe(setPlanet);
        return subscription.unsubscribe;
    }, []);

    if(planet !== undefined) {
        return html`<div>Score: ${scorePlanet(planet).toFixed(2)}</div>`;
    } else {
        return html`Hover over a planet to see its score`;
    }
}