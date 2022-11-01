/**
 *
 * TrackAllButton
 *
 */
import { Button } from '@blueprintjs/core';
import { useMutation } from '@tanstack/react-query';
import { TrackAllArtifacts } from 'api/apc';
import React, { memo } from 'react';

interface Props {}

export const TrackAllButton = memo((props: Props) => {
  const mutation = useMutation(TrackAllArtifacts);
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
