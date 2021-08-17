import { EthConnection, QueuedTransaction } from '@darkforest_eth/network';
import { EthAddress } from '@darkforest_eth/types';
import { BigNumber as EthersBN } from 'ethers';
export declare function openConfirmationWindowForTransaction(ethConnection: EthConnection, txRequest: QueuedTransaction, from: EthAddress, gasFeeGwei: EthersBN): Promise<void>;
