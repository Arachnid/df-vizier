import GameUIManager from '../../Backend/GameLogic/GameUIManager';
import { ModalHook } from '../Views/ModalPane';
/**
 * This modal presents an overview of all of the player's plugins. Has a button
 * to add a new plugin, and lists out all the existing plugins, allowing the
 * user to view their titles, as well as either edit, delete, or open their window.
 *
 * You can think of this as the plugin process list, the Activity Monitor of
 * Dark forest.
 */
export declare function PluginLibraryPane({ gameUIManager, hook, modalsContainer, }: {
    gameUIManager: GameUIManager;
    hook: ModalHook;
    modalsContainer: Element;
}): JSX.Element | null;
