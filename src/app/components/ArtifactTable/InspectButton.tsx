/**
 *
 * InspectButton
 *
 */
import { Button } from '@blueprintjs/core';
import { useMutation } from '@tanstack/react-query';
import { useApcApi } from 'api/apc';
import React, { memo } from 'react';
import { useKeycloak } from '@react-keycloak-fork/web';
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
