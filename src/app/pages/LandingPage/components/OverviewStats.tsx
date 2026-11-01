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

/* All tiles on one row. */
const Grid = styled.div<{ $columns: number }>`
  display: grid;
  grid-template-columns: repeat(${p => p.$columns}, minmax(0, 1fr));
  gap: 16px;
`;

const Tile = styled(Link)<{ $tone: Tone }>`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 18px;

  &&,
  &&:hover {
    color: inherit;
    text-decoration: none;
  }
  .top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .label {
    font-weight: 600;
  }
  .icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    background: ${p => TONE_BACKGROUND[p.$tone]};
  }
  .value {
    font-size: 1.85rem;
    font-weight: 700;
    line-height: 1.15;
    letter-spacing: -0.01em;
    font-variant-numeric: tabular-nums;
  }
  .detail {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.9rem;
    /* Neutral captions keep Blueprint's muted text colour. */
    ${p => (p.$tone === 'neutral' ? '' : `color: ${TONE_TEXT[p.$tone]};`)}
  }
`;

/** Colour is reserved for numbers that need someone to act. */
type Tone = 'neutral' | 'good' | 'attention' | 'bad';

const TONE_BACKGROUND: Record<Tone, string> = {
  neutral: 'var(--hover-bg)',
  good: 'var(--hover-bg)',
  attention: 'rgba(255, 194, 71, 0.22)',
  bad: 'rgba(205, 66, 70, 0.18)',
};

const TONE_TEXT: Record<Tone, string> = {
  neutral: '',
  good: 'var(--success-text)',
  attention: 'var(--warning-text)',
  bad: 'var(--danger-text)',
};

const TONE_INTENT: Record<Tone, Intent> = {
  neutral: Intent.NONE,
  good: Intent.SUCCESS,
  attention: Intent.WARNING,
  bad: Intent.DANGER,
};

interface TileProps {
  to: string;
  icon: IconName;
  label: string;
  value: React.ReactNode;
  detail: React.ReactNode;
  tone?: Tone;
}

const StatTile = ({
  to,
  icon,
  label,
  value,
  detail,
  tone = 'neutral',
}: TileProps) => (
  <Tile
    to={to}
    $tone={tone}
    className={`${Classes.CARD} ${Classes.INTERACTIVE}`}
  >
    <div className="top">
      <span className="label">{label}</span>
      <span className="icon" aria-hidden="true">
        <Icon
          icon={icon}
          intent={
            tone === 'neutral' || tone === 'good'
              ? undefined
              : TONE_INTENT[tone]
          }
          className={
            tone === 'neutral' || tone === 'good'
              ? Classes.TEXT_MUTED
              : undefined
          }
        />
      </span>
    </div>
    <div className="value">{value}</div>
    <div className={`detail ${tone === 'neutral' ? Classes.TEXT_MUTED : ''}`}>
      {detail}
    </div>
  </Tile>
);

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
    <Grid $columns={isAdmin ? 4 : 3}>
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
    </Grid>
  );
};
