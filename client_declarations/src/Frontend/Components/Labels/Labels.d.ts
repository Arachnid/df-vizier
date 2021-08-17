import { EthAddress } from '@darkforest_eth/types';
export declare function AccountLabel({ includeAddressIfHasTwitter, ethAddress, }: {
    includeAddressIfHasTwitter?: boolean;
    ethAddress?: EthAddress;
}): JSX.Element;
/**
 * Link to a twitter account.
 */
export declare function TwitterLink({ twitter, color }: {
    twitter: string;
    color?: string;
}): JSX.Element;
