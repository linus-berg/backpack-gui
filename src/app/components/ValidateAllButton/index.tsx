/**
 *
 * ValidateAllButton
 *
 */
import { Button } from '@blueprintjs/core';
import { useMutation } from '@tanstack/react-query';
import { ValidateAllArtifacts } from 'api/apc';
import React, { memo } from 'react';

interface Props {}

export const ValidateAllButton = memo((props: Props) => {
  const mutation = useMutation(ValidateAllArtifacts);
  return (
    <Button
      intent="warning"
      loading={mutation.isLoading}
      onClick={() => mutation.mutate()}
    >
      Validate All Artifacts
    </Button>
  );
});
