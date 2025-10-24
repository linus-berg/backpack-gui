/**
 *
 * TrackAllButton
 *
 */
import { AnchorButton, Tooltip } from '@blueprintjs/core';
import { useMutation } from '@tanstack/react-query';
import { useBackpackApi } from 'api/backpack';
import React, { memo } from 'react';

interface Props {
  id: string;
  processor: string;
}

export const TrackArtifactButton = memo((props: Props) => {
  const backpack = useBackpackApi();
  const mutation = useMutation(backpack.TrackArtifact);
  const tooltip = `Check for ${props.id} updates`;
  return (
    <Tooltip content={tooltip} lazy>
      <AnchorButton
        intent="success"
        loading={mutation.isLoading}
        onClick={() =>
          mutation.mutate({ id: props.id, processor: props.processor })
        }
        icon={'refresh'}
      />
    </Tooltip>
  );
});
