import React, { memo, useMemo } from 'react';
import { Button, Classes, HTMLTable, Intent, Tag } from '@blueprintjs/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orderBy } from 'lodash-es';
import { useBackpackApi } from 'api/backpack';
import { queryKeys, useQueueStatus } from 'api/queries';
import { useConfirm } from 'app/context/ConfirmContext';
import { useUser } from 'app/context/UserContext';
import { QueueStatus } from 'types/QueueStatus';
import { getQueueHealth } from 'utils/queueHealth';
import { notify } from 'utils/toaster';
import {
  EmptyState,
  LoadingState,
  QueryErrorState,
} from 'app/components/common/States';
import { ScrollTableContainer } from '../ScrollTableContainer';

const formatRate = (rate?: number | null) =>
  `${(rate ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}/s`;

export const QueueStatusTable = memo(() => {
  const backpack = useBackpackApi();
  const { hasRole } = useUser();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const isAdmin = hasRole('Administrator');
  const query = useQueueStatus();

  const purgeMutation = useMutation({
    mutationFn: backpack.PurgeQueue,
    meta: { errorTitle: 'Purge failed' },
    onSuccess: (_res, name) => {
      notify.success(`Purged ${name}.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.queues });
    },
  });

  const rows = useMemo(
    () =>
      orderBy(
        (query.data ?? []).map(q => ({ queue: q, health: getQueueHealth(q) })),
        [r => r.health.rank, r => r.queue.messages],
        ['asc', 'desc'],
      ),
    [query.data],
  );

  if (query.isLoading) {
    return <LoadingState />;
  }
  if (query.isError && !query.data) {
    return (
      <QueryErrorState
        title="Couldn't load queue status"
        error={query.error}
        onRetry={() => query.refetch()}
      />
    );
  }
  if (rows.length === 0) {
    return <EmptyState icon="layers" title="No queues reported" />;
  }

  const purge = async (queue: QueueStatus) => {
    const ok = await confirm({
      title: `Purge ${queue.name}?`,
      message: (
        <p>
          This permanently deletes the <b>{queue.messages.toLocaleString()}</b>{' '}
          queued message
          {queue.messages === 1 ? '' : 's'}. The work they represent won’t be
          processed.
        </p>
      ),
      confirmText: 'Purge queue',
      icon: 'trash',
      intent: Intent.DANGER,
    });
    if (ok) {
      purgeMutation.mutate(queue.name);
    }
  };

  return (
    <ScrollTableContainer>
      <HTMLTable striped condensed style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>Queue</th>
            <th>Health</th>
            <th style={{ textAlign: 'right' }}>Consumers</th>
            <th style={{ textAlign: 'right' }}>Messages</th>
            <th style={{ textAlign: 'right' }}>In</th>
            <th style={{ textAlign: 'right' }}>Out</th>
            {isAdmin && <th />}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ queue, health }) => (
            <tr key={queue.name}>
              <td style={{ overflowWrap: 'anywhere' }}>{queue.name}</td>
              <td>
                <Tag
                  minimal
                  intent={health.intent}
                  icon={health.icon}
                  htmlTitle={health.description}
                >
                  {health.label}
                </Tag>
              </td>
              <td style={{ textAlign: 'right' }}>{queue.consumers}</td>
              <td
                style={{
                  textAlign: 'right',
                  fontWeight: queue.messages ? 600 : undefined,
                }}
              >
                {queue.messages.toLocaleString()}
              </td>
              <td style={{ textAlign: 'right' }} className={Classes.TEXT_MUTED}>
                {formatRate(queue.avg_ingress_rate)}
              </td>
              <td style={{ textAlign: 'right' }} className={Classes.TEXT_MUTED}>
                {formatRate(queue.avg_egress_rate)}
              </td>
              {isAdmin && (
                <td style={{ textAlign: 'right' }}>
                  <Button
                    minimal
                    small
                    intent={Intent.DANGER}
                    icon="trash"
                    text="Purge…"
                    disabled={queue.messages === 0}
                    loading={
                      purgeMutation.isPending &&
                      purgeMutation.variables === queue.name
                    }
                    onClick={() => purge(queue)}
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </HTMLTable>
    </ScrollTableContainer>
  );
});
