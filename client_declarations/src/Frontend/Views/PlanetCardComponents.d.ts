import { Artifact, Planet } from '@darkforest_eth/types';
import React from 'react';
import { TooltipName } from '../Game/WindowManager';
/**
 * Displayed in {@link PlanetContextPane} when a planet is {@code destroyed}.
 */
export declare const DestroyedMarker: import("styled-components").StyledComponent<"div", any, {}, never>;
export declare const TimesTwo: () => JSX.Element;
/**
 * Expands to fit the width of container. Is itself a flex box that spreads out its children
 * horizontally.
 */
export declare const SpreadApart: import("styled-components").StyledComponent<"div", any, {}, never>;
export declare const RowTip: ({ name, children }: {
    name: TooltipName;
    children: React.ReactNode;
}) => JSX.Element;
export declare const TitleBar: import("styled-components").StyledComponent<"div", any, {}, never>;
export declare function PlanetActiveArtifact({ artifact, planet, }: {
    artifact: Artifact;
    planet: Planet | undefined;
}): JSX.Element;
