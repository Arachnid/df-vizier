import React, { Dispatch, SetStateAction } from 'react';
import { InitRenderState } from '../Pages/GameLandingPage';
declare type LandingWrapperProps = {
    children: React.ReactNode;
    initRender: InitRenderState;
    terminalEnabled: boolean;
};
export declare function Wrapper({ children, initRender, terminalEnabled }: LandingWrapperProps): JSX.Element;
export declare function TerminalWrapper({ children, initRender, terminalEnabled }: LandingWrapperProps): JSX.Element;
export declare function TerminalToggler({ terminalEnabled, setTerminalEnabled, }: {
    terminalEnabled: boolean;
    setTerminalEnabled: Dispatch<SetStateAction<boolean>>;
}): JSX.Element;
export declare function GameWindowWrapper({ children, initRender, terminalEnabled }: LandingWrapperProps): JSX.Element;
export declare const Hidden: import("styled-components").StyledComponent<"div", any, {}, never>;
export {};
