import React, { memo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBackpackApi } from 'api/backpack';
import { Spinner, HTMLTable, Button, Intent, Icon } from '@blueprintjs/core';
import styled from 'styled-components';
import { useKeycloak } from '@react-keycloak-fork/web';

interface Props {}

const ScrollDiv = styled.div`
  flex: 1;
  overflow-y: auto;
  border: 1px solid #394b59;
  border-radius: 3px;
`;

export const SchedulerPanel = memo((props: Props) => {
  const backpack = useBackpackApi();
  const queryClient = useQueryClient();
  const { keycloak } = useKeycloak();
  const isAdmin = keycloak.hasResourceRole('Administrator');

  const { data, isLoading } = useQuery(['schedules'], backpack.GetSchedules, {
    refetchInterval: 10000,
  });

  const syncMutation = useMutation(backpack.TriggerSync, {
    onSuccess: () => {
      queryClient.invalidateQueries(['events']);
    },
  });

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <ScrollDiv>
      <HTMLTable striped condensed style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>Processor</th>
            <th>Schedule (Cron)</th>
            <th>Last Run</th>
            {isAdmin && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data?.data.map(schedule => (
            <tr key={schedule.id}>
              <td style={{ fontWeight: 'bold' }}>{schedule.processor}</td>
              <td>
                <code>{schedule.cron}</code>
              </td>
              <td>
                {schedule.last_run
                  ? new Date(schedule.last_run).toLocaleString()
                  : 'Never'}
              </td>
              <td>
                {isAdmin && (
                  <Button
                    small
                    minimal
                    intent={Intent.PRIMARY}
                    icon="refresh"
                    loading={
                      syncMutation.isLoading &&
                      syncMutation.variables === schedule.processor
                    }
                    onClick={() => syncMutation.mutate(schedule.processor)}
                  >
                    Sync Now
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </HTMLTable>
    </ScrollDiv>
  );
});
