/**
 *
 * TrackAllButton
 *
 */
import { Button } from '@blueprintjs/core';
import { useMutation } from '@tanstack/react-query';
import { useBackpackApi } from 'api/backpack';
import React, { memo } from 'react';
import { useUser } from '../../context/UserContext';

interface Props {}

export const TrackAllButton = memo((props: Props) => {
  const backpack = useBackpackApi();
  const { hasRole } = useUser();
  const mutation = useMutation(backpack.TrackAllArtifacts);

  if (!hasRole('Administrator')) {
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
