import { Spinner, HTMLTable, Icon, Button, Intent } from '@blueprintjs/core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useBackpackApi } from 'api/backpack';
import React, { memo } from 'react';
import styled from 'styled-components';
import { useUser } from '../../context/UserContext';
import { ScrollTableContainer } from '../ScrollTableContainer';

interface Props {}

const ColumnText = styled.span`
  margin-left: 4px;
`;

const Tr = styled.tr``;
const Td = styled.td`
  vertical-align: middle !important;
`;

export const QueueStatusTable = memo((props: Props) => {
  const backpack = useBackpackApi();
  const { hasRole } = useUser();
  const queryClient = useQueryClient();
  const isAdmin = hasRole('Administrator');

  const query = useQuery(['queue_status'], backpack.GetQueueStatus, {
    refetchInterval: 5000,
  });

  const purgeMutation = useMutation(backpack.PurgeQueue, {
    onSuccess: () => {
      queryClient.invalidateQueries(['queue_status']);
    },
  });

  if (query.isLoading || query.data === null || query.data === undefined) {
    return <Spinner></Spinner>;
  }
  const queue_rows: JSX.Element[] = [];
  for (let i in query.data?.data) {
    const queue = query.data.data[i];
    const healthy = queue.consumers > 0;
    const ingress =
      queue.avg_ingress_rate != null ? queue.avg_ingress_rate.toFixed(2) : 0;
    const egress =
      queue.avg_egress_rate != null ? queue.avg_egress_rate.toFixed(2) : 0;
    queue_rows.push(
      <Tr key={queue.name}>
        <Td>{queue.name}</Td>
        <Td>
          {
            <Icon
              icon={healthy ? 'tick' : 'cross'}
              intent={healthy ? 'success' : 'danger'}
            />
          }
        </Td>
        <Td>{queue.consumers}</Td>
        <Td>{queue.messages}</Td>
        <Td>{ingress}/s</Td>
        <Td>{egress}/s</Td>
        {isAdmin && (
          <Td>
            <Button
              minimal
              small
              intent={Intent.DANGER}
              icon="trash"
              loading={
                purgeMutation.isLoading &&
                purgeMutation.variables === queue.name
              }
              onClick={() => purgeMutation.mutate(queue.name)}
            >
              Purge
            </Button>
          </Td>
        )}
      </Tr>,
    );
  }

  return (
    <ScrollTableContainer>
      <HTMLTable striped condensed style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>
              <ColumnText>Queue</ColumnText>
            </th>
            <th>
              <ColumnText>Health</ColumnText>
            </th>
            <th>
              <ColumnText>Consumers</ColumnText>
            </th>
            <th>
              <ColumnText>Messages</ColumnText>
            </th>
            <th>
              <ColumnText>Ingress</ColumnText>
            </th>
            <th>
              <ColumnText>Egress</ColumnText>
            </th>
            {isAdmin && (
              <th>
                <ColumnText>Actions</ColumnText>
              </th>
            )}
          </tr>
        </thead>
        <tbody>{queue_rows}</tbody>
      </HTMLTable>
    </ScrollTableContainer>
  );
});
