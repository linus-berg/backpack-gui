import React from 'react';
import { Link } from 'react-router-dom';
import { Classes, Icon, IconName, Intent } from '@blueprintjs/core';
import styled from 'styled-components';
import {
  usePendingApprovals,
  useProcessors,
  useQueueStatus,
  useRootArtifactCounts,
} from 'api/queries';
import { useUser } from 'app/context/UserContext';
import { getQueueHealth } from 'utils/queueHealth';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
`;

const Tile = styled(Link)`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  &&,
  &&:hover {
    color: inherit;
    text-decoration: none;
  }
  .value {
    font-size: 1.6rem;
    font-weight: 700;
    line-height: 1.1;
  }
`;

interface TileProps {
  to: string;
  icon: IconName;
  intent?: Intent;
  value: React.ReactNode;
  label: string;
}

const StatTile = ({
  to,
  icon,
  intent = Intent.NONE,
  value,
  label,
}: TileProps) => (
  <Tile to={to} className={`${Classes.CARD} ${Classes.INTERACTIVE}`}>
    <Icon icon={icon} size={24} intent={intent} />
    <div>
      <div className="value">{value}</div>
      <div className={Classes.TEXT_MUTED}>{label}</div>
    </div>
  </Tile>
);

/** At-a-glance numbers, each linking to the page with the details. */
export const OverviewStats = () => {
  const { hasRole } = useUser();
  const isAdmin = hasRole('Administrator');
  const processors = useProcessors();
  const counts = useRootArtifactCounts(processors.data);
  const approvals = usePendingApprovals({ enabled: isAdmin });
  const queues = useQueueStatus(15_000);

  const countValues = Object.values(counts);
  const totalRoots = countValues.every(c => c !== undefined)
    ? countValues.reduce<number>((sum, c) => sum + (c ?? 0), 0)
    : undefined;
  const queueProblems = (queues.data ?? []).filter(
    q => getQueueHealth(q).rank <= 1,
  ).length;
  const pendingCount = approvals.data?.length ?? 0;
  const dash = '—';

  return (
    <Grid>
      <StatTile
        to="/processor"
        icon="cube"
        value={totalRoots?.toLocaleString() ?? dash}
        label="Root artifacts tracked"
      />
      <StatTile
        to="/processor"
        icon="layers"
        value={processors.data?.length ?? dash}
        label="Processors"
      />
      {isAdmin && (
        <StatTile
          to="/approvals"
          icon="confirm"
          intent={pendingCount > 0 ? Intent.WARNING : Intent.NONE}
          value={approvals.data ? pendingCount : dash}
          label="Waiting for approval"
        />
      )}
      <StatTile
        to="/status"
        icon="pulse"
        intent={
          queues.isError
            ? Intent.DANGER
            : queueProblems > 0
            ? Intent.WARNING
            : Intent.SUCCESS
        }
        value={queues.isError ? '!' : queues.data ? queueProblems : dash}
        label={
          queues.isError
            ? 'Queue status unavailable'
            : queueProblems === 1
            ? 'Queue needs attention'
            : 'Queues need attention'
        }
      />
    </Grid>
  );
};
