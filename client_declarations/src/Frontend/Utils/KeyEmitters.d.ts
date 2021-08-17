import { Wrapper } from '../../Backend/Utils/Wrapper';
export declare const SpecialKey: {
    readonly Space: " ";
    readonly Tab: "Tab";
    readonly Escape: "Escape";
    readonly Control: "Control";
    readonly Shift: "Shift";
};
export declare const keyUp$: import("@darkforest_eth/events").Monomitter<Wrapper<string>>;
export declare const keyDown$: import("@darkforest_eth/events").Monomitter<Wrapper<string>>;
export declare function listenForKeyboardEvents(): void;
export declare function unlinkKeyboardEvents(): void;
export declare function useIsDown(key?: string): boolean;
export declare function useOnUp(key?: string, onUp?: () => void): void;
