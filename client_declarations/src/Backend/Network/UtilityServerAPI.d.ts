import { EthAddress, SignedMessage } from '@darkforest_eth/types';
import { AddressTwitterMap } from '../../_types/darkforest/api/UtilityServerAPITypes';
export declare const WEBSERVER_URL: string;
export declare const enum EmailResponse {
    Success = 0,
    Invalid = 1,
    ServerError = 2
}
export declare const submitInterestedEmail: (email: string) => Promise<EmailResponse>;
export declare const submitUnsubscribeEmail: (email: string) => Promise<EmailResponse>;
export declare const submitPlayerEmail: (email: string, ethAddress: EthAddress) => Promise<EmailResponse>;
export declare const submitWhitelistKey: (key: string, address: EthAddress) => Promise<string | null>;
export declare const requestDevFaucet: (address: EthAddress) => Promise<boolean>;
/**
 * Swallows all errors. Either loads the address to twitter map from the webserver in 5 seconds, or
 * returan empty map.
 */
export declare const tryGetAllTwitters: () => Promise<AddressTwitterMap>;
export declare const getAllTwitters: () => Promise<AddressTwitterMap>;
export declare const verifyTwitterHandle: (verifyMessage: SignedMessage<{
    twitter: string;
}>) => Promise<boolean>;
export declare const disconnectTwitter: (disconnectMessage: SignedMessage<{
    twitter: string;
}>) => Promise<boolean>;
