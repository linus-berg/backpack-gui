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

const Title = styled(H3)`
  display: flex;
  align-items: center;
  margin-top: 0;
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

  const isValidRegex = (pattern: string) => {
    if (!pattern || pattern === '*') return true;
    try {
      new RegExp(pattern);
      return true;
    } catch (e) {
      return false;
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <>
      <Helmet>
        <title>Approvals</title>
      </Helmet>
      <PageDiv>
        <Title>
          <Icon icon="confirm" style={{ marginRight: '10px' }} />
          Pending Approvals
        </Title>
        <ScrollTableContainer style={{ height: '70vh' }}>
          <HTMLTable striped condensed style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Processor</th>
                <th>Artifact ID</th>
                <th>Filter (Regex)</th>
                <th>Configuration</th>
                <th>Requested By</th>
                <th>Timestamp</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.data?.map(pending => {
                const regexValid = isValidRegex(pending.filter);
                return (
                  <tr key={`${pending.processor}/${pending.id}`}>
                    <td><Tag minimal>{pending.processor}</Tag></td>
                    <td style={{ fontWeight: 'bold' }}>{pending.id}</td>
                    <td>
                      <Tag
                        minimal
                        intent={regexValid ? Intent.NONE : Intent.DANGER}
                        style={{ fontFamily: 'monospace' }}
                      >
                        {pending.filter || '*'}
                      </Tag>
                      {!regexValid && (
                        <Icon
                          icon="warning-sign"
                          intent={Intent.DANGER}
                          style={{ marginLeft: '5px' }}
                          title="Invalid Regular Expression"
                        />
                      )}
                    </td>
                    <td>
                      {Object.entries(pending.config || {}).map(([key, value]) => (
                        <div key={key} style={{ fontSize: '0.85em' }}>
                          <span style={{ color: '#abb3bf' }}>{key}:</span> {value}
                        </div>
                      ))}
                    </td>
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
                );
              })}
              {(!data?.data || data.data.length === 0) && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#abb3bf' }}>
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
