/// <reference types="node" />
import { EthAddress } from "@darkforest_eth/types";
import { EventEmitter } from "events";
import GameUIManager from "./GameUIManager";
export declare const enum TutorialManagerEvent {
    StateChanged = "StateChanged"
}
export declare const enum TutorialState {
    None = 0,
    HomePlanet = 1,
    SendFleet = 2,
    Deselect = 3,
    ZoomOut = 4,
    MinerMove = 5,
    MinerPause = 6,
    Terminal = 7,
    HowToGetScore = 8,
    ScoringDetails = 9,
    Valhalla = 10,
    AlmostCompleted = 11,
    Completed = 12
}
declare class TutorialManager extends EventEmitter {
    static instance: TutorialManager;
    tutorialState: TutorialState;
    constructor();
    static getInstance(): TutorialManager;
    setTutorialState(newState: TutorialState): void;
    advance(): void;
    reset(account: EthAddress | undefined): void;
    complete(gameUiManager: GameUIManager): void;
    acceptInput(state: TutorialState): void;
}
export default TutorialManager;
