import { LocationId } from '@darkforest_eth/types';
import React from 'react';
import { ModalHandle } from '../Views/ModalPane';
export declare function OpenPaneButton({ modal, title, element, helpContent, shortcutKey, }: {
    modal: ModalHandle;
    title: string;
    element: () => React.ReactElement;
    helpContent?: React.ReactElement;
    shortcutKey?: string;
}): JSX.Element;
export declare function OpenClaimPlanetPane({ modal, planetId, }: {
    modal: ModalHandle;
    planetId: LocationId | undefined;
}): JSX.Element;
export declare function OpenHatPaneButton({ modal, planetId, }: {
    modal: ModalHandle;
    planetId: LocationId | undefined;
}): JSX.Element;
export declare function OpenBroadcastPaneButton({ modal, planetId, }: {
    modal: ModalHandle;
    planetId: LocationId | undefined;
}): JSX.Element;
export declare function OpenUpgradeDetailsPaneButton({ modal, planetId, }: {
    modal: ModalHandle;
    planetId: LocationId | undefined;
}): JSX.Element;
export declare function OpenManagePlanetArtifactsButton({ modal, planetId, }: {
    modal: ModalHandle;
    planetId: LocationId | undefined;
}): JSX.Element;
