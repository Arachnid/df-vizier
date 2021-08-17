import { Artifact } from '@darkforest_eth/types';
import { ArtifactFileColor } from '../../Backend/GameLogic/ArtifactUtils';
export declare const ARTIFACT_URL = "https://d2wspbczt15cqu.cloudfront.net/v0.6.0-artifacts/";
export declare function ArtifactImage({ artifact, size, thumb, bgColor, }: {
    artifact: Artifact;
    size: number;
    thumb?: boolean;
    bgColor?: ArtifactFileColor;
}): JSX.Element;
