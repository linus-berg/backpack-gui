/**
 *
 * TrackAllButton
 *
 */
import { Button } from '@blueprintjs/core';
import { useMutation } from '@tanstack/react-query';
import { useApcApi } from 'api/apc';
import React, { memo } from 'react';
import { useKeycloak } from '@react-keycloak-fork/web';

interface Props {
  id: string;
  processor: string;
}

export const TrackArtifactButton = memo((props: Props) => {
  const apc = useApcApi();
  const mutation = useMutation(apc.TrackArtifact);

  return (
    <Button
      intent="success"
      loading={mutation.isLoading}
      onClick={() =>
        mutation.mutate({ id: props.id, processor: props.processor })
      }
      icon={'refresh'}
    ></Button>
  );
});
