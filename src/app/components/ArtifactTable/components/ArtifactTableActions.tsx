import React from 'react';
import { ButtonGroup } from '@blueprintjs/core';
import { Artifact } from 'types';
import { Processor } from 'types/Processor';
import { InspectButton } from '../InspectButton';
import { TrackArtifactButton } from '../../TrackArtifactButton/Loadable';
import { ValidateArtifactButton } from '../../ValidateArtifactButton/Loadable';
import { DeleteArtifactButton } from '../../DeleteArtifactButton/Loadable';
import { ForceCollectArtifactButton } from '../../ForceCollectArtifactButton/Loadable';

interface Props {
  artifact: Artifact;
  processor: Processor;
  onInspect: (artifact: Artifact) => void;
}

export const ArtifactTableActions = ({ artifact, processor, onInspect }: Props) => {
  return (
    <ButtonGroup minimal>
      <InspectButton artifact={artifact} onInspect={onInspect} />
      {!processor.is_external && (
        <>
          {processor.direct_collect ? (
            <ForceCollectArtifactButton
              id={artifact.id}
              processor={artifact.processor}
            />
          ) : (
            <TrackArtifactButton
              id={artifact.id}
              processor={artifact.processor}
            />
          )}
          <ValidateArtifactButton
            id={artifact.id}
            processor={artifact.processor}
          />
        </>
      )}
      <DeleteArtifactButton id={artifact.id} processor={artifact.processor} />
    </ButtonGroup>
  );
};
