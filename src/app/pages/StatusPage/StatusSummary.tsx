import React from 'react';
import { Classes, Icon } from '@blueprintjs/core';
import styled from 'styled-components';
import { useQueueStatus, useSchedules } from 'api/queries';
import { useUser } from 'app/context/UserContext';
import { DateTime } from 'app/components/common/DateTime';
import { LinkButton } from 'app/components/common/LinkButton';
import { StatGrid, StatTile } from 'app/components/common/StatTile';
import { QueueFilter } from 'app/components/QueueStatusTable';
import { groupQueues, needsAttention } from 'utils/queueGroups';

const NextRunLine = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
`;

const rate = (value: number) =>
  `${value.toLocaleString(undefined, { maximumFractionDigits: 1 })}/s`;

/** The earliest upcoming tracking schedule, if any. */
export const NextRun = () => {
  const { hasRole } = useUser();
  const schedules = useSchedules();
  const now = Date.now();
  const next = (schedules.data ?? [])
    .filter(s => s.next_run && Date.parse(s.next_run) > now)
    .sort((a, b) => Date.parse(a.next_run!) - Date.parse(b.next_run!))[0];
  return (
    <NextRunLine className={Classes.TEXT_MUTED}>
      <Icon icon="calendar" />
      {next ? (
        <span>
          Next re-track: <b>{next.processor}</b>{' '}
          <DateTime value={next.next_run} mode="relative" />
        </span>
      ) : (
        <span>No re-track scheduled</span>
      )}
      {hasRole('Administrator') && (
        <LinkButton
          to="/admin/schedules"
          text="Schedules"
          icon="cog"
          minimal
          small
        />
      )}
    </NextRunLine>
  );
};

interface Props {
  filter: QueueFilter;
  onFilterChange: (filter: QueueFilter) => void;
}

/**
 * Tiles at the top of the Status page; the first two double as filters for
 * the queue table.
 */
export const StatusSummary = ({ filter, onFilterChange }: Props) => {
  const queues = useQueueStatus();
  const data = queues.data ?? [];
  const rows = groupQueues(data).flatMap(g =>
    g.rows.flatMap(r => (r.preview ? [r, r.preview] : [r])),
  );
  const problems = rows.filter(needsAttention);

  const waiting = data.reduce(
    (sum, q) => sum + (q.messages_ready ?? q.messages),
    0,
  );
  const inProgress = data.some(q => q.messages_in_progress !== undefined)
    ? data.reduce((sum, q) => sum + (q.messages_in_progress ?? 0), 0)
    : undefined;
  const consumers = data.reduce((sum, q) => sum + q.consumers, 0);
  const ingress = data.reduce((sum, q) => sum + (q.avg_ingress_rate ?? 0), 0);
  const egress = data.reduce((sum, q) => sum + (q.avg_egress_rate ?? 0), 0);

  const loaded = !!queues.data;
  const toggle = (value: QueueFilter) =>
    onFilterChange(filter === value ? 'all' : value);

  return (
    <StatGrid $columns={4}>
      <StatTile
        icon="warning-sign"
        label="Queues needing attention"
        value={loaded ? problems.length : '—'}
        tone={
          queues.isError && !loaded
            ? 'bad'
            : !loaded
            ? 'neutral'
            : problems.some(p => p.health.rank === 0)
            ? 'bad'
            : problems.length > 0
            ? 'attention'
            : 'good'
        }
        detail={
          queues.isError && !loaded
            ? 'Queue status unavailable'
            : !loaded
            ? '—'
            : problems.length === 0
            ? `All ${rows.length} healthy`
            : filter === 'attention'
            ? 'Showing only these'
            : 'Show only these'
        }
        active={filter === 'attention'}
        onClick={() => toggle('attention')}
      />
      <StatTile
        icon="inbox"
        label="Messages waiting"
        value={loaded ? waiting.toLocaleString() : '—'}
        detail={
          !loaded
            ? '—'
            : inProgress !== undefined
            ? `${inProgress.toLocaleString()} in progress`
            : 'Across all queues'
        }
        active={filter === 'busy'}
        onClick={() => toggle('busy')}
      />
      <StatTile
        icon="people"
        label="Consumers"
        value={loaded ? consumers.toLocaleString() : '—'}
        detail={loaded ? `Across ${data.length} queues` : '—'}
      />
      <StatTile
        icon="exchange"
        label="Throughput"
        value={loaded ? rate(ingress) : '—'}
        detail={loaded ? `in · ${rate(egress)} out` : '—'}
      />
    </StatGrid>
  );
};
