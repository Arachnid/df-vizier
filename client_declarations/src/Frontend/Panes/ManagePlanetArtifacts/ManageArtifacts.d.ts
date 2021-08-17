import { Artifact, LocatablePlanet } from '@darkforest_eth/types';
import { ModalHandle } from '../../Views/ModalPane';
export declare function ManageArtifactsPane({ planet, artifactsInInventory, artifactsOnPlanet, currentBlockNumber, playerAddress, roundOver, prospect, find, activate, deactivate, deposit, withdraw, modal, }: {
    planet: LocatablePlanet;
    artifactsInInventory: Artifact[];
    artifactsOnPlanet: Array<Artifact | undefined>;
    currentBlockNumber: number | undefined;
    playerAddress: string;
    roundOver: boolean;
    prospect: () => void;
    find: () => void;
    activate: (artifact: Artifact) => void;
    deactivate: (artifact: Artifact) => void;
    deposit: (artifact: Artifact) => void;
    withdraw: (artifact: Artifact) => void;
    modal: ModalHandle;
}): JSX.Element;
