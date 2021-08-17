import { EthConnection } from '@darkforest_eth/network';
import { ModalHook } from '../Views/ModalPane';
export declare function SettingsPane({ ethConnection, hook, privateHook, }: {
    ethConnection: EthConnection;
    hook: ModalHook;
    privateHook: ModalHook;
}): JSX.Element;
