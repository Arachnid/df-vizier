import React from 'react';
import { BtnProps } from './Btn';
export declare const InlineBlock: import("styled-components").StyledComponent<"div", any, {}, never>;
export declare const Separator: import("styled-components").StyledComponent<"div", any, {}, never>;
export declare const FloatRight: import("styled-components").StyledComponent<"div", any, {}, never>;
export declare const TextButton: import("styled-components").StyledComponent<"span", any, {}, never>;
export declare const Padded: import("styled-components").StyledComponent<"div", any, {
    left?: string | undefined;
    top?: string | undefined;
    right?: string | undefined;
    bottom?: string | undefined;
}, never>;
export declare const PaddedRecommendedModalWidth: import("styled-components").StyledComponent<"div", any, {
    left?: string | undefined;
    top?: string | undefined;
    right?: string | undefined;
    bottom?: string | undefined;
}, never>;
export declare const RecommendedModalWidth: import("styled-components").StyledComponent<"div", any, {}, never>;
export declare const BorderlessPane: import("styled-components").StyledComponent<"div", any, {}, never>;
export declare const Underline: import("styled-components").StyledComponent<"span", any, {}, never>;
export declare const Display: import("styled-components").StyledComponent<"div", any, {
    visible?: boolean | undefined;
}, never>;
export declare const Emphasized: import("styled-components").StyledComponent<"span", any, {}, never>;
export declare const HeaderText: import("styled-components").StyledComponent<"div", any, {}, never>;
export declare const SectionHeader: import("styled-components").StyledComponent<"div", any, {}, never>;
export declare const Section: import("styled-components").StyledComponent<"div", any, {}, never>;
export declare const Bottom: import("styled-components").StyledComponent<"div", any, {}, never>;
export declare const VerticalSplit: ({ children, }: {
    children: [React.ReactNode, React.ReactNode];
}) => JSX.Element;
export declare const FullWidth: import("styled-components").StyledComponent<"div", any, {
    padding?: string | undefined;
}, never>;
export declare const FullHeight: import("styled-components").StyledComponent<"div", any, {}, never>;
/**
 * Fills parent width, aligns children horizontally in the center.
 */
export declare const AlignCenterHorizontally: import("styled-components").StyledComponent<"div", any, {}, never>;
export declare const AlignCenterVertically: import("styled-components").StyledComponent<"div", any, {}, never>;
/**
 * Expands to fill space in a flexbox.
 */
export declare const Expand: import("styled-components").StyledComponent<"div", any, {}, never>;
/**
 * Don't shrink in a flexbox.
 */
export declare const DontShrink: import("styled-components").StyledComponent<"div", any, {}, never>;
/**
 * This is the link that all core ui in Dark Forest should use. Please!
 */
export declare function Link(props: {
    to?: string;
    color?: string;
    openInThisTab?: boolean;
    children: React.ReactNode;
} & React.HtmlHTMLAttributes<HTMLAnchorElement>): JSX.Element;
/**
 * Inline block rectangle, measured in ems, default 1em by 1em.
 */
export declare const EmSpacer: import("styled-components").StyledComponent<"div", any, {
    width?: number | undefined;
    height?: number | undefined;
}, never>;
export declare const Spacer: import("styled-components").StyledComponent<"div", any, {
    width?: number | undefined;
    height?: number | undefined;
}, never>;
export declare const Truncate: import("styled-components").StyledComponent<"div", any, {
    maxWidth?: string | undefined;
}, never>;
/**
 * The container element into which a plugin renders its html elements.
 * Contains styles for child elements so that plugins can use UI
 * that is consistent with the rest of Dark Forest's UI. Keeping this up
 * to date will be an ongoing challange, but there's probably some better
 * way to do this.
 */
export declare const PluginElements: import("styled-components").StyledComponent<"div", any, {}, never>;
export declare const MaxWidth: import("styled-components").StyledComponent<"div", any, {
    width: string;
}, never>;
export declare const Hidden: import("styled-components").StyledComponent<"div", any, {}, never>;
export declare const Select: import("styled-components").StyledComponent<"select", any, {
    wide?: boolean | undefined;
}, never>;
/**
 * Controllable input that allows the user to select from one of the
 * given string values.
 */
export declare function SelectFrom({ values, value, setValue, labels, style, wide, }: {
    values: string[];
    value: string;
    setValue: (value: string) => void;
    labels: string[];
    style?: React.CSSProperties;
    wide?: boolean;
}): JSX.Element;
export declare const HoverableTooltip: import("styled-components").StyledComponent<"div", any, {}, never>;
export declare const CenterRow: import("styled-components").StyledComponent<"div", any, {}, never>;
/**
 * A box which centers some darkened text. Useful for displaying
 * *somthing* instead of empty space, if there isn't something to
 * be displayed. Think of it as a placeholder.
 */
export declare const CenterBackgroundSubtext: import("styled-components").StyledComponent<"div", any, {
    width: string;
    height: string;
}, never>;
/**
 * A button that also displays a {@code KeyboardBtn} directly next to it, which shows the user
 * whether or not the given shortcut key is down. In the case that now {@code shortcutKey} was
 * provided, this is just a normal button.
 */
export declare function ShortcutButton(props: {
    children: React.ReactNode;
    shortcutKey?: string;
    shortcutText?: string;
} & BtnProps): JSX.Element;
export declare const KeyboardBtn: import("styled-components").StyledComponent<"kbd", any, {
    active?: boolean | undefined;
}, never>;
export declare const CenteredText: import("styled-components").StyledComponent<"span", any, {}, never>;
export declare function ShortcutKeyDown({ shortcutKey, text }: {
    shortcutKey?: string;
    text?: string;
}): JSX.Element;
