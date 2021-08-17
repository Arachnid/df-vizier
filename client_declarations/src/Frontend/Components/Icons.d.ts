import { Planet } from '@darkforest_eth/types';
import { StatIdx } from '../../_types/global/GlobalTypes';
export declare const SilverIcon: ({ color }: {
    color?: string | undefined;
}) => JSX.Element;
export declare const SilverGrowthIcon: ({ color }: {
    color?: string | undefined;
}) => JSX.Element;
export declare const EnergyGrowthIcon: ({ color }: {
    color?: string | undefined;
}) => JSX.Element;
export declare const EnergyIcon: ({ color }: {
    color?: string | undefined;
}) => JSX.Element;
export declare const RangeIcon: ({ color }: {
    color?: string | undefined;
}) => JSX.Element;
export declare const TargetIcon: () => JSX.Element;
export declare const PlayIcon: () => JSX.Element;
export declare const PauseIcon: () => JSX.Element;
export declare const UpgradeIcon: () => JSX.Element;
export declare const HelpIcon: () => JSX.Element;
export declare const PlanetIcon: () => JSX.Element;
export declare const LeaderboardIcon: () => JSX.Element;
export declare const PlanetdexIcon: () => JSX.Element;
export declare const RightarrowIcon: () => JSX.Element;
export declare const TwitterIcon: () => JSX.Element;
export declare const BroadcastIcon: () => JSX.Element;
export declare const PiratesIcon: () => JSX.Element;
export declare const Rank1Icon: () => JSX.Element;
export declare const Rank2Icon: () => JSX.Element;
export declare const Rank3Icon: () => JSX.Element;
export declare const Rank4Icon: () => JSX.Element;
export declare const FullRankIcon: () => JSX.Element;
export declare const MaxLevelIcon: () => JSX.Element;
export declare const SilverProdIcon: () => JSX.Element;
export declare const ShareIcon: () => JSX.Element;
export declare const LockIcon: () => JSX.Element;
export declare const SpeedIcon: ({ color }: {
    color?: string | undefined;
}) => JSX.Element;
export declare const DefenseIcon: ({ color }: {
    color?: string | undefined;
}) => JSX.Element;
export declare const HatIcon: () => JSX.Element;
export declare const EthIcon: () => JSX.Element;
export declare const SettingsIcon: () => JSX.Element;
export declare const ArtifactIcon: () => JSX.Element;
export declare const PluginIcon: () => JSX.Element;
export declare const DepositIcon: ({ color }: {
    color?: string | undefined;
}) => JSX.Element;
export declare const QuestionCircleIcon: ({ color }: {
    color?: string | undefined;
}) => JSX.Element;
export declare const CloseCircleIcon: ({ color }: {
    color?: string | undefined;
}) => JSX.Element;
export declare const MaximizeCircleIcon: ({ color }: {
    color?: string | undefined;
}) => JSX.Element;
export declare const MinimizeCircleIcon: ({ color }: {
    color?: string | undefined;
}) => JSX.Element;
export declare const WithdrawIcon: ({ color }: {
    color?: string | undefined;
}) => JSX.Element;
export declare const ActivateIcon: ({ color }: {
    color?: string | undefined;
}) => JSX.Element;
export declare const DeactivateIcon: ({ color }: {
    color?: string | undefined;
}) => JSX.Element;
export declare const RankIcon: ({ planet }: {
    planet: Planet | undefined;
}) => JSX.Element;
export declare const BranchIcon: ({ branch }: {
    branch: number;
}) => JSX.Element;
export declare const StatIcon: ({ stat }: {
    stat: StatIdx;
}) => JSX.Element;
/**
 Allow for tweaking the size of an icon based on the context.
 Biome & Spacetype Notifications should fill the notification box
 Others should be 3/4's the size and centered
*/
interface AlertIcon {
    height?: string;
    width?: string;
}
export declare const Quasar: ({ height, width }: AlertIcon) => JSX.Element;
export declare const FoundRuins: ({ height, width }: AlertIcon) => JSX.Element;
export declare const FoundSpacetimeRip: ({ height, width }: AlertIcon) => JSX.Element;
export declare const FoundSilver: ({ height, width }: AlertIcon) => JSX.Element;
export declare const FoundTradingPost: ({ height, width }: AlertIcon) => JSX.Element;
export declare const FoundSpace: ({ height, width }: AlertIcon) => JSX.Element;
export declare const FoundDeepSpace: ({ height, width }: AlertIcon) => JSX.Element;
export declare const FoundDeadSpace: ({ height, width }: AlertIcon) => JSX.Element;
export declare const FoundPirates: ({ height, width }: AlertIcon) => JSX.Element;
export declare const FoundComet: ({ height, width }: AlertIcon) => JSX.Element;
export declare const ArtifactFound: ({ height, width }: AlertIcon) => JSX.Element;
export declare const ArtifactProspected: ({ height, width }: AlertIcon) => JSX.Element;
export declare const FoundOcean: ({ height, width }: AlertIcon) => JSX.Element;
export declare const FoundForest: ({ height, width }: AlertIcon) => JSX.Element;
export declare const FoundGrassland: ({ height, width }: AlertIcon) => JSX.Element;
export declare const FoundTundra: ({ height, width }: AlertIcon) => JSX.Element;
export declare const FoundSwamp: ({ height, width }: AlertIcon) => JSX.Element;
export declare const FoundDesert: ({ height, width }: AlertIcon) => JSX.Element;
export declare const FoundIce: ({ height, width }: AlertIcon) => JSX.Element;
export declare const FoundWasteland: ({ height, width }: AlertIcon) => JSX.Element;
export declare const FoundLava: ({ height, width }: AlertIcon) => JSX.Element;
export declare const FoundCorrupted: ({ height, width }: AlertIcon) => JSX.Element;
export declare const PlanetAttacked: ({ height, width }: AlertIcon) => JSX.Element;
export declare const PlanetLost: ({ height, width }: AlertIcon) => JSX.Element;
export declare const PlanetConquered: ({ height, width }: AlertIcon) => JSX.Element;
export declare const MetPlayer: ({ height, width }: AlertIcon) => JSX.Element;
export declare const TxAccepted: ({ height, width }: AlertIcon) => JSX.Element;
export declare const TxConfirmed: ({ height, width }: AlertIcon) => JSX.Element;
export declare const TxInitialized: ({ height, width }: AlertIcon) => JSX.Element;
export declare const TxDeclined: ({ height, width }: AlertIcon) => JSX.Element;
export {};
