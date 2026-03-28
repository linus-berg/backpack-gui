import React, { memo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBackpackApi } from 'api/backpack';
import { Spinner, HTMLTable, Button, Intent, Icon, H3, Tag, ButtonGroup } from '@blueprintjs/core';
import styled from 'styled-components';
import { Helmet } from 'react-helmet-async';
import { ScrollTableContainer } from 'app/components/ScrollTableContainer';

const PageDiv = styled.div`
  padding: 1rem;
`;

export const ApprovalsPage = memo(() => {
  const backpack = useBackpackApi();
  const queryClient = useQueryClient();
  
  const { data, isLoading } = useQuery(['pending_approvals'], backpack.GetPendingArtifacts);

  const approveMutation = useMutation(backpack.ApproveArtifact, {
    onSuccess: () => {
      queryClient.invalidateQueries(['pending_approvals']);
      queryClient.invalidateQueries(['events']);
    }
  });

  const rejectMutation = useMutation(backpack.RejectArtifact, {
    onSuccess: () => {
      queryClient.invalidateQueries(['pending_approvals']);
      queryClient.invalidateQueries(['events']);
    }
  });

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <>
      <Helmet>
        <title>Approvals</title>
      </Helmet>
      <PageDiv>
        <H3>
          <Icon icon="confirm" style={{ marginRight: '10px' }} />
          Pending Approvals
        </H3>
        <ScrollTableContainer style={{ height: '70vh' }}>
          <HTMLTable striped condensed style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Processor</th>
                <th>Artifact ID</th>
                <th>Requested By</th>
                <th>Timestamp</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.data?.map(pending => (
                <tr key={`${pending.processor}/${pending.id}`}>
                  <td><Tag minimal>{pending.processor}</Tag></td>
                  <td style={{ fontWeight: 'bold' }}>{pending.id}</td>
                  <td>{pending.requested_by}</td>
                  <td>{new Date(pending.timestamp).toLocaleString()}</td>
                  <td>
                    <ButtonGroup>
                      <Button
                        small
                        intent={Intent.SUCCESS}
                        icon="tick"
                        loading={approveMutation.isLoading && (approveMutation.variables as any)?.id === pending.id}
                        onClick={() => approveMutation.mutate({ id: pending.id, processor: pending.processor })}
                      >
                        Approve
                      </Button>
                      <Button
                        small
                        intent={Intent.DANGER}
                        icon="cross"
                        loading={rejectMutation.isLoading && (rejectMutation.variables as any)?.id === pending.id}
                        onClick={() => rejectMutation.mutate({ id: pending.id, processor: pending.processor })}
                      >
                        Reject
                      </Button>
                    </ButtonGroup>
                  </td>
                </tr>
              ))}
              {(!data?.data || data.data.length === 0) && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#abb3bf' }}>
                    No pending approvals found.
                  </td>
                </tr>
              )}
            </tbody>
          </HTMLTable>
        </ScrollTableContainer>
      </PageDiv>
    </>
  );
});
