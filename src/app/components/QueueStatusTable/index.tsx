import { Spinner, HTMLTable, Icon } from '@blueprintjs/core';
import { useQuery } from '@tanstack/react-query';
import { useBackpackApi } from 'api/backpack';
import React, { memo } from 'react';
import styled from 'styled-components/macro';
interface Props {}

const ColumnText = styled.span`
  margin-left: 4px;
`;
const Tr = styled.tr``;
const Td = styled.td``;

export const QueueStatusTable = memo((props: Props) => {
  const backpack = useBackpackApi();
  const query = useQuery(['queue_status'], backpack.GetQueueStatus, {
    refetchInterval: 5000,
  });

  if (query.isLoading || query.data === null || query.data === undefined) {
    return <Spinner></Spinner>;
  }
  const queue_rows: JSX.Element[] = [];
  for (let i in query.data?.data) {
    const queue = query.data.data[i];
    const healthy = queue.consumers > 0;
    queue_rows.push(
      <Tr>
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
        <Td>{Math.fround(queue.avg_ingress_rate)}/s</Td>
        <Td>{Math.fround(queue.avg_egress_rate)}/s</Td>
      </Tr>,
    );
  }

  return (
    <HTMLTable striped condensed>
      <thead>
        <tr>
          <th>
            <Icon icon="database" intent={'none'} />
            <ColumnText>Queue</ColumnText>
          </th>
          <th>
            <Icon icon="heart" />
            <ColumnText>Health</ColumnText>
          </th>
          <th>
            <Icon icon="cube" />
            <ColumnText>Consumers</ColumnText>
          </th>
          <th>
            <Icon icon="envelope" />
            <ColumnText>Messages</ColumnText>
          </th>
          <th>
            <Icon icon="trending-up" />
            <ColumnText>Avg. Ingress</ColumnText>
          </th>
          <th>
            <Icon icon="trending-down" />
            <ColumnText>Avg. Egress</ColumnText>
          </th>
        </tr>
      </thead>
      <tbody>{queue_rows}</tbody>
    </HTMLTable>
  );
});
