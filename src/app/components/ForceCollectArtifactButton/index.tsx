/**
 *
 * Force Collect Button
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

export const ForceCollectArtifactButton = memo((props: Props) => {
  const backpack = useBackpackApi();
  const mutation = useMutation(backpack.ValidateArtifact);
  const tooltip = 'Force collect';

  return (
    <Tooltip content={tooltip} lazy>
      <AnchorButton
        intent="danger"
        loading={mutation.isLoading}
        onClick={() =>
          mutation.mutate({
            id: props.id,
            processor: props.processor,
            force: true,
          })
        }
        icon={'repeat'}
      />
    </Tooltip>
  );
});
