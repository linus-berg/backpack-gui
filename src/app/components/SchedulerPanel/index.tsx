import React, { memo, useState } from 'react';
import {
  Button,
  ButtonGroup,
  Classes,
  HTMLTable,
  Intent,
  Tag,
  Tooltip,
} from '@blueprintjs/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useBackpackApi } from 'api/backpack';
import { queryKeys, useSchedules } from 'api/queries';
import { useConfirm } from 'app/context/ConfirmContext';
import { useUser } from 'app/context/UserContext';
import { Schedule } from 'types/Schedule';
import { notify } from 'utils/toaster';
import { DateTime } from 'app/components/common/DateTime';
import { SectionHeader } from 'app/components/common/PageHeader';
import {
  EmptyState,
  LoadingState,
  QueryErrorState,
} from 'app/components/common/States';
import { ScrollTableContainer } from '../ScrollTableContainer';
import { ScheduleEditorDialog } from './ScheduleEditorDialog';
import { describeCron } from './cron';

interface Props {
  /** ID for the section title, so the surrounding section can reference it. */
  titleId?: string;
}

export const SchedulerPanel = memo(({ titleId }: Props) => {
  const backpack = useBackpackApi();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const { hasRole } = useUser();
  const isAdmin = hasRole('Administrator');
  const query = useSchedules();
  const [editing, setEditing] = useState<Schedule | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const syncMutation = useMutation({
    mutationFn: backpack.TriggerSync,
    meta: { errorTitle: 'Could not start the sync' },
    onSuccess: (_res, processor) => {
      notify.success(
        `Sync started for ${processor}. Progress is shown in System Events.`,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.allEvents });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: backpack.DeleteSchedule,
    meta: { errorTitle: 'Could not delete the schedule' },
    onSuccess: () => {
      notify.success('Schedule deleted.');
      queryClient.invalidateQueries({ queryKey: queryKeys.schedules });
    },
  });

  const header = (
    <SectionHeader
      icon="calendar"
      title={<span id={titleId}>Tracking schedules</span>}
      actions={
        isAdmin && (
          <Button
            size="small"
            icon="add"
            text="Add schedule"
            onClick={() => {
              setEditing(null);
              setIsEditorOpen(true);
            }}
          />
        )
      }
    />
  );

  if (query.isLoading) {
    return (
      <>
        {header}
        <LoadingState />
      </>
    );
  }
  if (query.isError && !query.data) {
    return (
      <>
        {header}
        <QueryErrorState
          title="Couldn't load schedules"
          error={query.error}
          onRetry={() => query.refetch()}
        />
      </>
    );
  }

  const schedules = query.data ?? [];

  const onDelete = async (schedule: Schedule) => {
    const ok = await confirm({
      title: `Delete the ${schedule.processor} schedule?`,
      message: (
        <p>
          <b>{schedule.processor}</b> will no longer be tracked automatically (
          <code>{schedule.cron}</code>). You can still sync it manually.
        </p>
      ),
      confirmText: 'Delete schedule',
      icon: 'trash',
      intent: Intent.DANGER,
    });
    if (ok) {
      deleteMutation.mutate(schedule.id);
    }
  };

  return (
    <>
      {header}
      {schedules.length === 0 ? (
        <EmptyState
          icon="calendar"
          title="No schedules"
          description={
            isAdmin
              ? 'Add a schedule to check processors for new versions automatically.'
              : 'Processors are only tracked when someone triggers it.'
          }
        />
      ) : (
        <ScrollTableContainer>
          <HTMLTable striped compact style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Processor</th>
                <th>Schedule</th>
                <th>Last run</th>
                <th>Next run</th>
                {isAdmin && <th />}
              </tr>
            </thead>
            <tbody>
              {schedules.map(schedule => (
                <tr key={schedule.id}>
                  <td style={{ fontWeight: 600 }}>{schedule.processor}</td>
                  <td>
                    <code>{schedule.cron}</code>
                    {describeCron(schedule.cron) && (
                      <div
                        className={Classes.TEXT_MUTED}
                        style={{ fontSize: '0.85em' }}
                      >
                        {describeCron(schedule.cron)}
                      </div>
                    )}
                  </td>
                  <td>
                    <DateTime
                      value={schedule.last_run}
                      mode="relative"
                      empty="Never"
                    />
                  </td>
                  <td>
                    {schedule.next_run ? (
                      <DateTime value={schedule.next_run} mode="relative" />
                    ) : (
                      <Tag
                        minimal
                        intent={Intent.DANGER}
                        icon="warning-sign"
                        htmlTitle="The cron expression couldn't be parsed, so this schedule never runs."
                      >
                        Invalid cron
                      </Tag>
                    )}
                  </td>
                  {isAdmin && (
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <ButtonGroup variant="minimal">
                        <Button
                          size="small"
                          icon="refresh"
                          text="Sync now"
                          loading={
                            syncMutation.isPending &&
                            syncMutation.variables === schedule.processor
                          }
                          onClick={() =>
                            syncMutation.mutate(schedule.processor)
                          }
                        />
                        <Tooltip content="Edit schedule">
                          <Button
                            size="small"
                            icon="edit"
                            aria-label={`Edit ${schedule.processor} schedule`}
                            onClick={() => {
                              setEditing(schedule);
                              setIsEditorOpen(true);
                            }}
                          />
                        </Tooltip>
                        <Tooltip content="Delete schedule">
                          <Button
                            size="small"
                            icon="trash"
                            intent={Intent.DANGER}
                            aria-label={`Delete ${schedule.processor} schedule`}
                            loading={
                              deleteMutation.isPending &&
                              deleteMutation.variables === schedule.id
                            }
                            onClick={() => onDelete(schedule)}
                          />
                        </Tooltip>
                      </ButtonGroup>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </HTMLTable>
        </ScrollTableContainer>
      )}
      {isAdmin && (
        <ScheduleEditorDialog
          isOpen={isEditorOpen}
          schedule={editing}
          existing={schedules}
          onClose={() => setIsEditorOpen(false)}
        />
      )}
    </>
  );
});
