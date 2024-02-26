/**
 *
 * InspectButton
 *
 */
import { Button } from '@blueprintjs/core';
import React, { memo } from 'react';
import { Artifact } from 'types';

interface Props {
  artifact: Artifact;
  onInspect: (artifact: Artifact) => void;
}

export const InspectButton = memo((props: Props) => {
  return (
    <Button
      intent="primary"
      onClick={() => props.onInspect(props.artifact)}
      icon="search"
    />
  );
});
