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

export function getPlanetName(planet: Planet) {
    const rank = planet.upgradeState.reduce((a, b) => a + b);
    return html`<a href="javascript:ui.setSelectedId('${planet.locationId}')">
        ${df.getProcgenUtils().getPlanetName(planet)} (L${planet.planetLevel}R${rank})
    </a>`;
}

export function stripTags(node: VNode|string|number): string {
    if(isValidElement(node)) {
        return toChildArray(node.props.children).map(stripTags).join('');
    } else {
        return node.toString();
    }
}

function getPlanetScoreModifier(planet: Planet): number {
    switch (planet.planetType) {
        case PlanetType.PLANET:
            return 1.0;
        case PlanetType.RUINS:
            if (planet.hasTriedFindingArtifact) {
                return 0.0;
            } else {
                return 1.25;
            }
        case PlanetType.TRADING_POST:
            return 0.5;
        case PlanetType.SILVER_MINE:
            return 0.5;
        case PlanetType.SILVER_BANK:
            return 0.5;
        default:
            return 0.0;
    }
}

export function scorePlanet(planet: Planet) {
    if (planet.planetLevel == 0) return 0.0;

    const location = df.getLocationOfPlanet(planet.locationId);
    if (location === undefined) {
        return 0.0;
    }

    const distanceToCenter = df.getDistCoords(location.coords, { x: 0, y: 0 });
    // return (Math.pow(planet.energyCap, 2) * planet.planetLevel * getPlanetScoreModifier(planet)) - Math.pow(distanceToCenter, 2);
    return Math.pow(planet.planetLevel, 2) * getPlanetScoreModifier(planet) / Math.log(distanceToCenter);
}

export function useMonomitter<T>(target: Monomitter<T>) {
    const [state, setState] = useState(undefined as T|undefined);
    useEffect(() => {
        const subscription = target.subscribe(setState);
        return subscription.unsubscribe;
    }, []);
    return state;
}