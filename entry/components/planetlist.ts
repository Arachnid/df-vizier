import { Context, HandlerInfo, PlanetInfo } from '../handler';
import { html } from 'htm/preact';
import { StateUpdater, useEffect, useState} from 'preact/hooks';
import GameManager from '@df_client/src/Backend/GameLogic/GameManager';
import { SortableTable } from './sortabletable';
import { getPlanetName, stripTags, useMonomitter } from 'entry/utils';
import { Planet } from '@darkforest_eth/types';
import { HandlerAction } from 'entry/actions';
import { Monomitter } from '@darkforest_eth/events';

export declare const df: GameManager;

function compareNumbers(a: number, b: number) {
    return a - b;
}

function scoreBool(a: boolean|undefined) {
    if(typeof a === "boolean") {
        if(a) {
            return 2;
        }
        return 1;
    }
    return 0;
}

function compareBools(a: boolean|undefined, b: boolean|undefined) {
    return scoreBool(a) - scoreBool(b);
}

export function PlanetListPanel({
    context,
    actionsUpdated$,
    saveSettings,
    sort,
    reverse
}: {
    context: Context,
    actionsUpdated$: Monomitter<Map<string, HandlerAction>>,
    saveSettings: () => void,
    sort: [number|undefined, StateUpdater<number|undefined>]
    reverse: [boolean, StateUpdater<boolean>]
}) {
    const [enableds, setEnableds] = useState(new Map<[string, string], boolean>());
    const actions = useMonomitter(actionsUpdated$);

    useEffect(() => {
        setEnableds(new Map(context.getMyPlanets().map((info) => {
            return Array.from(info.handlers.values()).map((handler) =>
                [[info.planet.locationId, handler.handler.key], handler.config.enabled] as [[string, string], boolean]);
        }).flat()));
    }, []);

    function toggleHandler(planet: Planet, key: string) {
        return (e: Event) => {
            const checked = (e.target as HTMLInputElement).checked;
            const info = context.getPlanetInfo(planet, true);
            (info.handlers.get(key) as HandlerInfo<any>).config.enabled = checked;
            saveSettings();
            const newEnableds = new Map(enableds);
            newEnableds.set([info.planet.locationId, key], checked);
        }
    }

    const headings = [
        "Planet Name",
        "Level",
        "Rank",
        ...Array.from(context.handlers.values()).map((info) => info.handler.actionLabel),
        "Next Action"
    ];
    const compareFunctions = [
        (a, b) => a.localeCompare(b),
        compareNumbers,
        compareNumbers,
        ...Array.from(context.handlers.values()).map(() => compareBools),
        compareNumbers,
    ];

    const planets = df.getMyPlanets().map((planet) => {
        const info = context.getPlanetInfo(planet);
        const planetName = getPlanetName(planet, false);
        const nextAction = actions?.get(planet.locationId);
        const rank = planet.upgradeState.reduce((a, b) => a + b).toString();
        return [
            {content: planetName, sortValue: stripTags(planetName)},
            {content: planet.planetLevel.toString(), sortValue: planet.planetLevel},
            {content: rank.toString(), sortValue: rank},
            ...Array.from(context.handlers.keys()).map((key) => {
                const handlerInfo = info.handlers.get(key);
                if(handlerInfo === undefined) {
                    return {content: html``, sortValue: undefined};
                }
                return {
                    content: html`<input type="checkbox" onClick=${toggleHandler(planet, key)} checked=${handlerInfo.config.enabled} />`,
                    sortValue: handlerInfo.config.enabled,
                };
            }),
            nextAction !== undefined ? {content: nextAction.getMessage(), sortValue: nextAction.progress } : '',
        ];
    });
    return html`<${SortableTable} headings=${headings} rows=${planets} compareFunctions=${compareFunctions} sort=${sort} reverse=${reverse} />`;
}
