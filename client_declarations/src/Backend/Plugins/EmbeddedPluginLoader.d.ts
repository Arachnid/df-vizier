import { PluginId } from './SerializedPlugin';
/**
 * This interface represents an embedded plugin, which is stored in `embedded_plugins/`.
 */
export interface EmbeddedPlugin {
    id: PluginId;
    name: string;
    code: string;
}
export declare function getEmbeddedPlugins(): {
    id: PluginId;
    name: string;
    code: string;
}[];
