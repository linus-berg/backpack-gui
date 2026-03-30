import React, { memo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBackpackApi } from 'api/backpack';
import { Spinner, HTMLTable, Button, Intent } from '@blueprintjs/core';
import { useUser } from '../../context/UserContext';
import { ScrollTableContainer } from '../ScrollTableContainer';
import { SchedulerManagerDialog } from './SchedulerManagerDialog';

interface Props {}

export const SchedulerPanel = memo((props: Props) => {
  const backpack = useBackpackApi();
  const queryClient = useQueryClient();
  const { hasRole } = useUser();
  const isAdmin = hasRole('Administrator');
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);

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
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        {isAdmin && (
          <Button 
            icon="settings" 
            minimal 
            onClick={() => setIsManageDialogOpen(true)}
          >
            Manage Schedules
          </Button>
        )}
      </div>
      <ScrollTableContainer>
        <HTMLTable striped condensed style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Processor</th>
              <th>Schedule (Cron)</th>
              <th>Last Run</th>
              <th>Next Run (Est.)</th>
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
                <td style={{ color: '#0F9960' }}>
                  {schedule.next_run
                    ? new Date(schedule.next_run).toLocaleString()
                    : 'Invalid Cron'}
                </td>
                {isAdmin && (
                  <td>
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
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </HTMLTable>
      </ScrollTableContainer>
      <SchedulerManagerDialog 
        isOpen={isManageDialogOpen} 
        onClose={() => setIsManageDialogOpen(false)} 
      />
    </>
  );
});
