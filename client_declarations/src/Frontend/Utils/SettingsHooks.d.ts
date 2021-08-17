import { Monomitter } from '@darkforest_eth/events';
import { AutoGasSetting, EthAddress } from '@darkforest_eth/types';
import React from 'react';
import GameUIManager from '../../Backend/GameLogic/GameUIManager';
/**
 * Whenever a setting changes, we publish the setting's name to this event emitter.
 */
export declare const settingChanged$: Monomitter<Setting>;
/**
 * Each setting has a unique identifier. Each account gets to store its own local storage setting,
 * per instance of the dark forest contract that it's connected to.
 */
export declare const enum Setting {
    OptOutMetrics = "OptOutMetrics",
    AutoApproveNonPurchaseTransactions = "AutoApproveNonPurchaseTransactions",
    DrawChunkBorders = "DrawChunkBorders",
    HighPerformanceRendering = "HighPerformanceRendering",
    MoveNotifications = "MoveNotifications",
    GasFeeGwei = "GasFeeGwei",
    TerminalVisible = "TerminalVisible",
    HasAcceptedPluginRisk = "HasAcceptedPluginRisk",
    FoundPirates = "FoundPirates",
    TutorialCompleted = "TutorialCompleted",
    FoundSilver = "FoundSilver",
    FoundSilverBank = "FoundSilverBank",
    FoundTradingPost = "FoundTradingPost",
    FoundComet = "FoundComet",
    FoundArtifact = "FoundArtifact",
    FoundDeepSpace = "FoundDeepSpace",
    FoundSpace = "FoundSpace",
    NewPlayer = "NewPlayer",
    MiningCores = "MiningCores",
    TutorialOpen = "TutorialOpen",
    IsMining = "IsMining",
    DisableDefaultShortcuts = "DisableDefaultShortcuts"
}
export declare const ALL_AUTO_GAS_SETTINGS: AutoGasSetting[];
/**
 * Each setting is stored in local storage. Each account has their own setting.
 */
export declare function getLocalStorageSettingKey(account: EthAddress | undefined, setting: Setting): string;
/**
 * Read the local storage setting from local storage.
 */
export declare function getSetting(account: EthAddress | undefined, setting: Setting): string;
/**
 * Save the given setting to local storage. Publish an event to {@link settingChanged$}.
 */
export declare function setSetting(account: EthAddress | undefined, setting: Setting, value: string): void;
/**
 * Loads from local storage, and interprets as a boolean the setting with the given name.
 */
export declare function getBooleanSetting(account: EthAddress | undefined, setting: Setting): boolean;
/**
 * Save the given setting to local storage. Publish an event to {@link settingChanged$}.
 */
export declare function setBooleanSetting(account: EthAddress | undefined, setting: Setting, value: boolean): void;
/**
 * Loads from local storage, and interprets as a boolean the setting with the given name.
 */
export declare function getNumberSetting(account: EthAddress | undefined, setting: Setting): number;
/**
 * Save the given setting to local storage. Publish an event to {@link settingChanged$}.
 */
export declare function setNumberSetting(account: EthAddress | undefined, setting: Setting, value: number): void;
/**
 * Allows a react component to subscribe to changes to the give setting.
 */
export declare function useSetting(uiManager: GameUIManager | undefined, setting: Setting): [string, (newValue: string | undefined) => void];
/**
 * Allows a react component to subscribe to changes to the given setting, interpreting its value as
 * a boolean.
 */
export declare function useBooleanSetting(uiManager: GameUIManager | undefined, setting: Setting): [boolean, (newValue: boolean) => void];
/**
 * React component that renders a checkbox representing the current value of this particular
 * setting, interpreting its value as a boolean. Allows the player to click on the checkbox to
 * toggle the setting. Toggling the setting both notifies the rest of the game that the given
 * setting was changed, and also saves it to local storage.
 */
export declare function BooleanSetting({ uiManager, setting, settingDescription, }: {
    uiManager: GameUIManager;
    setting: Setting;
    settingDescription?: string;
}): JSX.Element;
/**
 * UI that is kept in-sync with a particular setting which allows you to set that setting to one of
 * several options.
 */
export declare function MultiSelectSetting({ uiManager, setting, values, labels, style, wide, }: {
    uiManager: GameUIManager;
    setting: Setting;
    values: string[];
    labels: string[];
    style?: React.CSSProperties;
    wide?: boolean;
}): JSX.Element;
/**
 * Some settings can be set from another window. In particular, the 'auto accept transaction'
 * setting is set from multiple windows. As a result, the local storage setting can get out of sync
 * with the in memory setting. To fix this, we can poll the given setting from local storage, and
 * notify the rest of the game that it changed if it changed.
 */
export declare function pollSetting(account: EthAddress | undefined, setting: Setting): ReturnType<typeof setInterval>;
