/**
 *
 * TrackAllButton
 *
 */
import { Button } from '@blueprintjs/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useBackpackApi } from 'api/backpack';
import React, { memo } from 'react';
import { useKeycloak } from '@react-keycloak-fork/web';
import { AxiosResponse } from 'axios';
import { Artifact } from '../../../types';

interface Props {
  id: string;
  processor: string;
}

export const DeleteArtifactButton = memo((props: Props) => {
  const backpack = useBackpackApi();
  const { keycloak } = useKeycloak();
  const query_client = useQueryClient();
  const mutation = useMutation({
    mutationFn: backpack.DeleteArtifact,
    onSuccess: (data: AxiosResponse<Artifact>) => {
      const artifact = data.data;
      query_client.invalidateQueries({
        queryKey: ['artifact_table', artifact.processor, true],
      });
    },
  });

  if (!keycloak.hasResourceRole('Administrator')) {
    return null;
  }

  return (
    <Button
      intent="danger"
      disabled={!keycloak.hasResourceRole('Administrator')}
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
