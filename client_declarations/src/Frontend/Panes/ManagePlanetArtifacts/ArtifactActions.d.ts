import { Artifact } from '@darkforest_eth/types';
export declare function ArtifactActions({ artifact, viewingDepositList, anyArtifactActive, planetOwnedByPlayer, planetIsTradingPost, planetLevel, activate, deactivate, deposit, withdraw, }: {
    artifact: Artifact;
    viewingDepositList: boolean;
    anyArtifactActive: boolean;
    planetOwnedByPlayer: boolean;
    planetIsTradingPost: boolean;
    planetLevel: number;
    activate: (artifact: Artifact) => void;
    deactivate: (artifact: Artifact) => void;
    deposit: (artifact: Artifact) => void;
    withdraw: (artifact: Artifact) => void;
}): JSX.Element;
