/**
 *
 * InspectButton
 *
 */
import { AnchorButton, Tooltip } from '@blueprintjs/core';
import React, { memo } from 'react';
import { Artifact } from 'types';

interface Props {
  artifact: Artifact;
  onInspect: (artifact: Artifact) => void;
}

export const InspectButton = memo((props: Props) => {
  const tooltip = `Inspect ${props.artifact.id}`;
  return (
    <Tooltip content={tooltip} lazy>
      <AnchorButton
        intent="primary"
        onClick={() => props.onInspect(props.artifact)}
        icon="search"
      />
    </Tooltip>
  );
});
