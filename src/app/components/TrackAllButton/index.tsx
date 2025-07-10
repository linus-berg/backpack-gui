/**
 *
 * TrackAllButton
 *
 */
import { Button } from '@blueprintjs/core';
import { useMutation } from '@tanstack/react-query';
import { useApcApi } from 'api/apc';
import React, { memo } from 'react';
import { useAuth } from '../../../api/AuthProvider';

interface Props {}

export const TrackAllButton = memo((props: Props) => {
  const auth = useAuth();
  const apc = useApcApi();
  const mutation = useMutation(apc.TrackAllArtifacts);

  if (!auth.HasRole('Administrator')) {
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
