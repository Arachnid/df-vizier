import { Planet, PlanetType, SpaceType } from "@darkforest_eth/types";
import GameManager from "@df_client/src/Backend/GameLogic/GameManager";
import { html } from 'htm/preact';
import { useState, useEffect } from "preact/hooks";
import { isValidElement, toChildArray, VNode } from "preact";
import { Monomitter } from "@darkforest_eth/events";

declare const df: GameManager;

export function maxPlanetRank(planet: Planet): number {
    switch (planet.spaceType) {
        case SpaceType.NEBULA:
            return 3;
        case SpaceType.SPACE:
            return 4;
        default:
            return 5;
    }
}

export function getPlanetName(planet: Planet, withLevel=true) {
    const rank = planet.upgradeState.reduce((a, b) => a + b);
    return html`<a href="javascript:ui.setSelectedId('${planet.locationId}')">
        ${df.getProcgenUtils().getPlanetName(planet)}${withLevel === true && html`(L${planet.planetLevel}R${rank})`}
    </a>`;
}

export function stripTags(node: VNode|string|number): string {
    if(isValidElement(node)) {
        return toChildArray(node.props.children).map(stripTags).join('');
    } else {
        return node.toString();
    }
}

export function useMonomitter<T>(target: Monomitter<T>) {
    const [state, setState] = useState(undefined as T|undefined);
    useEffect(() => {
        const subscription = target.subscribe(setState);
        return subscription.unsubscribe;
    }, []);
    return state;
}