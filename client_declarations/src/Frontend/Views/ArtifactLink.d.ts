import { Artifact } from '@darkforest_eth/types';
import React from 'react';
import { ModalHandle } from './ModalPane';
export declare function ArtifactLink({ modal, children, artifact, }: {
    modal: ModalHandle;
    artifact: Artifact;
    children: React.ReactNode | React.ReactNode[];
}): JSX.Element;
