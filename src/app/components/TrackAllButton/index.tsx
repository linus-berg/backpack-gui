/**
 *
 * TrackAllButton
 *
 */
import { Button } from '@blueprintjs/core';
import { useMutation } from '@tanstack/react-query';
import { useBackpackApi } from 'api/backpack';
import React, { memo } from 'react';
import { useKeycloak } from '@react-keycloak-fork/web';

interface Props {}

export const TrackAllButton = memo((props: Props) => {
  const { keycloak } = useKeycloak();
  const backpack = useBackpackApi();
  const mutation = useMutation(backpack.TrackAllArtifacts);

  if (!keycloak.hasResourceRole('Administrator')) {
    return null;
  }

  return (
    <Button
      intent="success"
      loading={mutation.isLoading}
      onClick={() => mutation.mutate()}
    >
      Track All Artifacts
    </Button>
  );
});
