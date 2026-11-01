import React, { Fragment, memo, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  Classes,
  HTMLTable,
  Icon,
  Intent,
  Tag,
  Tooltip,
} from '@blueprintjs/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import styled from 'styled-components';
import { useBackpackApi } from 'api/backpack';
import { queryKeys, useQueueStatus } from 'api/queries';
import { useConfirm } from 'app/context/ConfirmContext';
import { useUser } from 'app/context/UserContext';
import { QueueStatus } from 'types/QueueStatus';
import { groupQueues, needsAttention, QueueRow } from 'utils/queueGroups';
import { notify } from 'utils/toaster';
import {
  EmptyState,
  LoadingState,
  QueryErrorState,
} from 'app/components/common/States';
import { ScrollTableContainer } from '../ScrollTableContainer';

/** Which queues the table shows (set by the Status page's summary tiles). */
export type QueueFilter = 'all' | 'attention' | 'busy';

const FILTERS: Record<QueueFilter, (row: QueueRow) => boolean> = {
  all: () => true,
  attention: needsAttention,
  busy: row => row.queue.messages > 0,
};

const formatRate = (rate?: number | null) =>
  `${(rate ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}/s`;

const formatCount = (value?: number) =>
  value === undefined ? '—' : value.toLocaleString();

/** Waiting messages; older APIs only report the total. */
const waiting = (q: QueueStatus) => q.messages_ready ?? q.messages;

const Table = styled(HTMLTable)`
  width: 100%;

  td.num,
  th.num {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
  tr.group-row td {
    padding-top: 10px;
    background: var(--table-header-bg);
    font-weight: 600;
  }
  tr.group-row .group-meta {
    margin-left: 10px;
    font-weight: 400;
  }
  tr.preview-row td:first-child {
    padding-left: 34px;
  }
  .queue-name {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .queue-raw {
    display: block;
    font-size: 0.8rem;
    overflow-wrap: anywhere;
  }
  .fold {
    min-width: 20px;
    min-height: 20px;
  }
  .fold-spacer {
    display: inline-block;
    width: 20px;
  }
`;

interface Props {
  filter?: QueueFilter;
}

/**
 * RabbitMQ queues grouped by role (gateway, router, processors,
 * collectors), with readable names. Each processor's preview queue is folded
 * under its main queue.
 */
export const QueueStatusTable = memo(({ filter = 'all' }: Props) => {
  const backpack = useBackpackApi();
  const { hasRole } = useUser();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const isAdmin = hasRole('Administrator');
  const query = useQueueStatus();
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  const purgeMutation = useMutation({
    mutationFn: backpack.PurgeQueue,
    meta: { errorTitle: 'Purge failed' },
    onSuccess: (_res, name) => {
      notify.success(`Purged ${name}.`);
      queryClient.invalidateQueries({ queryKey: queryKeys.queues });
    },
  });

  const groups = useMemo(
    () => groupQueues(query.data ?? [], FILTERS[filter]),
    [query.data, filter],
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
  if ((query.data ?? []).length === 0) {
    return <EmptyState icon="layers" title="No queues reported" />;
  }
  if (groups.length === 0) {
    return (
      <EmptyState
        icon="tick-circle"
        title={
          filter === 'attention'
            ? 'No queues need attention'
            : 'No queues have messages'
        }
      />
    );
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

  const toggle = (name: string) =>
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });

  const columns = isAdmin ? 8 : 7;

  const renderRow = (row: QueueRow, nested = false) => {
    const { queue, info, health } = row;
    /* Filtered views open a processor whose preview queue is the match. */
    const isOpen =
      expanded.has(queue.name) ||
      (filter !== 'all' && !!row.preview && FILTERS[filter](row.preview));
    const previewProblem = row.preview && needsAttention(row.preview);
    return (
      <tr key={queue.name} className={nested ? 'preview-row' : undefined}>
        <td>
          <span className="queue-name">
            {!nested &&
              (row.preview ? (
                <Button
                  className="fold"
                  variant="minimal"
                  size="small"
                  icon={isOpen ? 'chevron-down' : 'chevron-right'}
                  aria-expanded={isOpen}
                  aria-label={`${isOpen ? 'Hide' : 'Show'} the ${
                    info.label
                  } preview queue`}
                  onClick={() => toggle(queue.name)}
                />
              ) : (
                <span className="fold-spacer" />
              ))}
            {info.processor && !nested ? (
              <Link to={`/processor/${encodeURIComponent(info.processor)}`}>
                {info.label}
              </Link>
            ) : (
              <span>{info.label}</span>
            )}
            {previewProblem && !isOpen && (
              <Tooltip content={`Preview queue: ${row.preview!.health.label}`}>
                <Icon
                  icon="warning-sign"
                  size={12}
                  intent={row.preview!.health.intent}
                  aria-label={`Preview queue: ${row.preview!.health.label}`}
                />
              </Tooltip>
            )}
          </span>
          <span className={`queue-raw ${Classes.TEXT_MUTED}`}>
            {queue.name}
          </span>
        </td>
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
        <td className="num">{queue.consumers}</td>
        <td
          className="num"
          style={{ fontWeight: waiting(queue) ? 600 : undefined }}
        >
          {formatCount(waiting(queue))}
        </td>
        <td className={`num ${Classes.TEXT_MUTED}`}>
          {formatCount(queue.messages_in_progress)}
        </td>
        <td className={`num ${Classes.TEXT_MUTED}`}>
          {formatRate(queue.avg_ingress_rate)}
        </td>
        <td className={`num ${Classes.TEXT_MUTED}`}>
          {formatRate(queue.avg_egress_rate)}
        </td>
        {isAdmin && (
          <td className="num">
            <Button
              variant="minimal"
              size="small"
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
    );
  };

  return (
    <ScrollTableContainer>
      <Table compact>
        <thead>
          <tr>
            <th>Queue</th>
            <th>Health</th>
            <th className="num">Consumers</th>
            <th className="num">
              <Tooltip content="Messages waiting for a consumer">
                <span>Waiting</span>
              </Tooltip>
            </th>
            <th className="num">
              <Tooltip content="Messages delivered to a consumer and being processed">
                <span>In progress</span>
              </Tooltip>
            </th>
            <th className="num">In</th>
            <th className="num">Out</th>
            {isAdmin && <th />}
          </tr>
        </thead>
        <tbody>
          {groups.map(group => (
            <Fragment key={group.id}>
              <tr className="group-row">
                <td colSpan={columns}>
                  {group.label}
                  <span className={`group-meta ${Classes.TEXT_MUTED}`}>
                    {group.description}
                  </span>
                  {group.attention > 0 && (
                    <Tag
                      minimal
                      round
                      intent={Intent.WARNING}
                      style={{ marginLeft: 10 }}
                    >
                      {group.attention} need{group.attention === 1 ? 's' : ''}{' '}
                      attention
                    </Tag>
                  )}
                </td>
              </tr>
              {group.rows.map(row => (
                <Fragment key={row.queue.name}>
                  {renderRow(row)}
                  {row.preview &&
                    (expanded.has(row.queue.name) ||
                      (filter !== 'all' && FILTERS[filter](row.preview))) &&
                    renderRow(row.preview, true)}
                </Fragment>
              ))}
            </Fragment>
          ))}
        </tbody>
      </Table>
    </ScrollTableContainer>
  );
});
