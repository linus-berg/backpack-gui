/**
 *
 * TrackAllButton
 *
 */
import { Button } from '@blueprintjs/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApcApi } from 'api/apc';
import React, { memo } from 'react';
import { AxiosResponse } from 'axios';
import { Artifact } from '../../../types';
import { useAuth } from '../../../api/AuthProvider';

interface Props {
  id: string;
  processor: string;
}

export const DeleteArtifactButton = memo((props: Props) => {
  const apc = useApcApi();
  const auth = useAuth();
  const query_client = useQueryClient();
  const mutation = useMutation({
    mutationFn: apc.DeleteArtifact,
    onSuccess: (data: AxiosResponse<Artifact>) => {
      const artifact = data.data;
      query_client.invalidateQueries({
        queryKey: ['artifact_table', artifact.processor, true],
      });
    },
  });

  if (!auth.HasRole('Administrator')) {
    return null;
  }

  return (
    <Button
      intent="danger"
      disabled={!auth.HasRole('Administrator')}
      onClick={() => {
        if (window.confirm('Do you really want to delete ' + props.id)) {
          mutation.mutate({ id: props.id, processor: props.processor });
        }
      }}
      loading={mutation.isLoading}
      icon="trash"
    ></Button>
  );
});
