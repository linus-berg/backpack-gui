import React from 'react';
import { Icon } from '@blueprintjs/core';
import {
  usePendingApprovals,
  useProcessors,
  useQueueStatus,
  useRootArtifactCounts,
} from 'api/queries';
import { useUser } from 'app/context/UserContext';
import { getQueueHealth } from 'utils/queueHealth';
import { StatGrid, StatTile } from 'app/components/common/StatTile';

const DASH = '—';

/** At-a-glance numbers, each linking to the page with the details. */
export const OverviewStats = () => {
  const { hasRole } = useUser();
  const isAdmin = hasRole('Administrator');
  const processors = useProcessors();
  const counts = useRootArtifactCounts(processors.data);
  const approvals = usePendingApprovals({ enabled: isAdmin });
  const queues = useQueueStatus(15_000);

  const countValues = Object.values(counts);
  const totalRoots =
    processors.data && countValues.every(c => c !== undefined)
      ? countValues.reduce<number>((sum, c) => sum + (c ?? 0), 0)
      : undefined;
  const processorCount = processors.data?.length;
  const needApproval = (processors.data ?? []).filter(
    p => p.requires_approval,
  ).length;
  const queueProblems = (queues.data ?? []).filter(
    q => getQueueHealth(q).rank <= 1,
  ).length;
  const pending = approvals.data?.length ?? 0;

  return (
    <StatGrid $columns={isAdmin ? 4 : 3}>
      <StatTile
        to="/processor"
        icon="cube"
        label="Artifacts tracked"
        value={totalRoots?.toLocaleString() ?? DASH}
        detail="Excluding their dependencies"
      />
      <StatTile
        to="/processor"
        icon="layers"
        label="Processors"
        value={processorCount ?? DASH}
        detail={
          processorCount === undefined
            ? DASH
            : needApproval > 0
            ? `${needApproval} require${needApproval === 1 ? 's' : ''} approval`
            : 'Ecosystems Backpack mirrors'
        }
      />
      {isAdmin && (
        <StatTile
          to="/approvals"
          icon="confirm"
          label="Waiting for approval"
          value={approvals.data ? pending : DASH}
          tone={pending > 0 ? 'attention' : 'neutral'}
          detail={
            !approvals.data
              ? DASH
              : pending > 0
              ? 'Requests to review'
              : 'Nothing waiting'
          }
        />
      )}
      <StatTile
        to="/status"
        icon="pulse"
        label="Queues"
        value={queues.isError ? '!' : queues.data ? queues.data.length : DASH}
        tone={
          queues.isError
            ? 'bad'
            : queueProblems > 0
            ? 'attention'
            : queues.data
            ? 'good'
            : 'neutral'
        }
        detail={
          queues.isError ? (
            'Status unavailable'
          ) : !queues.data ? (
            DASH
          ) : queueProblems > 0 ? (
            `${queueProblems} need${queueProblems === 1 ? 's' : ''} attention`
          ) : (
            <>
              <Icon icon="tick-circle" size={12} /> All healthy
            </>
          )
        }
      />
    </StatGrid>
  );
};
