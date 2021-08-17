import React from 'react';
import { Hook } from '../../_types/global/GlobalTypes';
import { PaneProps } from '../Components/GameWindowComponents';
export declare type ModalHook = Hook<boolean>;
export declare const enum ModalName {
    Help = 0,
    PlanetDetails = 1,
    Leaderboard = 2,
    PlanetDex = 3,
    UpgradeDetails = 4,
    TwitterVerify = 5,
    Broadcast = 6,
    Hats = 7,
    Settings = 8,
    YourArtifacts = 9,
    ManageArtifacts = 10,
    Plugins = 11,
    WithdrawSilver = 12,
    ArtifactConversation = 13,
    ArtifactDetails = 14,
    MapShare = 15,
    ManageAccount = 16,
    Onboarding = 17,
    Private = 18
}
export declare type ModalProps = PaneProps & {
    title: string | React.ReactNode;
    hook: Hook<boolean>;
    name?: ModalName;
    hideClose?: boolean;
    style?: React.CSSProperties;
    noPadding?: boolean;
    helpContent?: () => React.ReactNode;
    width?: string;
    borderColor?: string;
    backgroundColor?: string;
    titlebarColor?: string;
    initialPosition?: {
        x: number;
        y: number;
    };
};
/**
 * A modal has a {@code content}, and also optionally many {@link ModalFrames} pushed on top of it.
 */
export interface ModalFrame {
    title: string;
    element: () => React.ReactElement;
    helpContent?: React.ReactElement;
}
/**
 * @todo Add things like open, close, set position, etc. Get rid of {@code ModalHook}.
 */
export interface ModalHandle {
    push(frame: ModalFrame): void;
    popAll(): void;
    pop(): void;
}
export declare function ModalPane({ children, title, hook: [visible, setVisible], hideClose, style, helpContent, width, borderColor, backgroundColor, titlebarColor, initialPosition, }: ModalProps): JSX.Element;
