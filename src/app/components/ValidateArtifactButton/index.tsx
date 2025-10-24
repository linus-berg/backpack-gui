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

export const ValidateArtifactButton = memo((props: Props) => {
  const backpack = useBackpackApi();
  const mutation = useMutation(backpack.ValidateArtifact);
  const tooltip = 'Verify files downloaded';

  return (
    <Tooltip content={tooltip} lazy>
      <AnchorButton
        intent="warning"
        loading={mutation.isLoading}
        onClick={() =>
          mutation.mutate({ id: props.id, processor: props.processor })
        }
        icon={'archive'}
      />
    </Tooltip>
  );
});
