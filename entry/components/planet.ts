import { HandlerInfo } from '../handler';
import { html } from 'htm/preact';
import { useEffect, useState } from 'preact/hooks';
import { getPlanetName, useMonomitter } from "../utils";
import { Planet } from '@darkforest_eth/types';
import { ConfigurationPanel } from './configuration';
import { ConfigScope, ConfigType, ConfigurationOptions } from 'entry/config';
import { VNode } from 'preact';
import { DebugHelper } from './debughelper';
import { Bot } from '../bot';

export function PlanetPanel({ bot, planet, target, saveSettings }: { bot: Bot, planet: Planet, target?: Planet, saveSettings: () => void }) {
    const { context } = bot;
    const [handlers, setHandlers] = useState(new Map<string, HandlerInfo<any>>());

    useEffect(() => {
        setHandlers(context.getPlanetInfo(planet).handlers);
    }, [planet]);

    function toggleHandler(key: string) {
        return (e: InputEvent) => {
            const info = handlers.get(key) as HandlerInfo<any>;
            const newConfig = Object.assign(Object.create(Object.getPrototypeOf(info.config)), info.config);
            newConfig.enabled = (e.target as HTMLInputElement).checked;
            const newInfo = { config: newConfig, handler: info.handler };
            const newHandlers = new Map(handlers);
            newHandlers.set(key, newInfo);
            setHandlers(newHandlers);
        }
    }

    function onUpdate(key: string) {
        return (config: ConfigType<any>) => {
            const handler = handlers.get(key) as HandlerInfo<any>;
            const newHandler = { ...handler, config }
            const newHandlers = new Map(handlers);
            newHandlers.set(key, newHandler);
            setHandlers(newHandlers);
        }
    }

    function save() {
        if(planet === undefined) return;
        for(const [key, handler] of handlers.entries()) {
            const planetInfo = context.getPlanetInfo(planet, true);
            planetInfo.handlers.set(key, handler);
        }
        saveSettings();
    }

    let configuration: VNode;
    if(planet.owner === context.player.address) {
        configuration = html`<div>
            <table>
                <thead>
                    <tr><th>Action</th><th>Enabled</th></tr>
                </thead>
                ${Array.from(handlers.entries()).map(([key, handler]) => html`
                    <tr>
                        <th>${handler.handler.actionLabel} ${handler.handler.title}</th>
                        <th><input type="checkbox" checked=${handler.config.enabled} onClick=${toggleHandler(handler.handler.key)} /></th>
                    </tr>
                    ${Object.values(handler.handler.options as ConfigurationOptions).some((descriptor) => descriptor.scope === ConfigScope.ALL || descriptor.scope === ConfigScope.OWNED) && handler.config.enabled && html`
                        <tr>
                            <td colspan="2">
                                <${ConfigurationPanel}
                                    options=${handler.handler.options}
                                    config=${handler.config}
                                    scopes=${new Set([ConfigScope.ALL, ConfigScope.OWNED])}
                                    onUpdate=${onUpdate(key)} />
                            </td>
                        </tr>
                    `}
                `)}
            </table>
            <button onClick=${save}>Save</button>
        </div>`;
    } else {
        const entries = Array.from(handlers.entries())
            .filter(([key, handler]) => Object.values(handler.handler.options as ConfigurationOptions)
                .some((descriptor) => descriptor.scope === ConfigScope.ALL || descriptor.scope === ConfigScope.UNOWNED));
        configuration = html`<div>
            <h1>${getPlanetName(planet)}</h1>
            <table>
                ${entries.map(([key, handler]) => html`
                    <tr>
                        <th>${handler.handler.actionLabel} ${handler.handler.title}</th>
                    </tr>
                    <tr>
                        <td colspan="2">
                            <${ConfigurationPanel}
                                options=${handler.handler.options}
                                config=${handler.config}
                                scopes=${new Set([ConfigScope.ALL, ConfigScope.UNOWNED])}
                                onUpdate=${onUpdate(key)} />
                        </td>
                    </tr>
                `)}
            </table>
            <button onClick=${save}>Save</button>
        </div>`;
    }

    return html`
        <h1>${getPlanetName(planet)}</h1>
        <h2>Next Action</h2>
        <div>${bot.nextActions.get(planet.locationId)?.getMessage() || 'Nothing to do'}</div>
        <h2>Configuration</h2>
        ${configuration}
        <h2>Debug</h2>
        ${bot.config.debug && html`<${DebugHelper} bot=${bot} planet=${planet} target=${target} />`}
    `;
}