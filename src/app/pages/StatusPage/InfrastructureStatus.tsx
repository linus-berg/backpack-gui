import React from 'react';
import { Card, Classes, Icon, IconName, Tooltip } from '@blueprintjs/core';
import styled from 'styled-components';
import { useInfrastructureHealth } from 'api/queries';
import { DateTime } from 'app/components/common/DateTime';
import {
  HealthStatus,
  InfrastructureCheck,
  InfrastructureHealth,
} from 'types/InfrastructureHealth';
import { isNotFound } from 'utils/errors';

interface Service {
  /** Check name in the API's response. */
  name: string;
  label: string;
  icon: IconName;
  /** What Backpack uses it for. */
  role: string;
  /** Shown when the API doesn't run this check. */
  notChecked?: string;
}

/** In the order of the strip; checks the GUI doesn't know follow them. */
const SERVICES: Service[] = [
  {
    name: 'rabbitmq',
    label: 'RabbitMQ',
    icon: 'exchange',
    role: 'Message broker every Backpack service works through.',
  },
  {
    name: 'rabbitmq-management',
    label: 'RabbitMQ management',
    icon: 'dashboard',
    role: 'Queue statistics on this page, and purging queues.',
  },
  {
    name: 'mongodb',
    label: 'MongoDB',
    icon: 'database',
    role: 'Artifacts, processors, schedules and events.',
  },
  {
    name: 'redis',
    label: 'Redis',
    icon: 'flash',
    role: 'Tracks what each ingest has already processed.',
  },
  {
    name: 's3',
    label: 'S3 storage',
    icon: 'cloud',
    role: 'Where the collectors store files.',
    notChecked:
      'The API has no S3 settings (BP_S3_*), so it can’t check the storage.',
  },
  {
    name: 'oidc',
    label: 'Sign-in (OIDC)',
    icon: 'key',
    role: 'The identity provider users sign in with.',
  },
];

type Tone = 'good' | 'attention' | 'bad' | 'neutral';

const TONE: Record<HealthStatus, Tone> = {
  Healthy: 'good',
  Degraded: 'attention',
  Unhealthy: 'bad',
};

const LABEL: Record<HealthStatus, string> = {
  Healthy: 'Healthy',
  Degraded: 'Degraded',
  Unhealthy: 'Unavailable',
};

const DOT: Record<Tone, string> = {
  good: 'var(--success-text)',
  attention: 'var(--warning-text)',
  bad: 'var(--danger-text)',
  neutral: 'var(--divider)',
};

const TEXT: Record<Tone, string> = {
  good: '',
  attention: 'var(--warning-text)',
  bad: 'var(--danger-text)',
  neutral: '',
};

const Strip = styled(Card)`
  && {
    display: grid;
    grid-template-columns: minmax(170px, auto) repeat(
        ${SERVICES.length},
        minmax(0, 1fr)
      );
    padding: 0;
  }
  .cell {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 2px;
    min-width: 0;
    height: 100%;
    padding: 10px 14px;
  }
  .cell-wrapper + .cell-wrapper {
    border-left: 1px solid var(--divider);
  }
  .name {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    font-weight: 600;
  }
  .label,
  .state {
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .state {
    font-size: 0.85rem;
  }
`;

const Dot = styled.span<{ $tone: Tone }>`
  flex-shrink: 0;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: ${p => DOT[p.$tone]};
`;

const State = ({
  tone,
  children,
}: {
  tone: Tone;
  children: React.ReactNode;
}) => (
  <span
    className={`state ${TEXT[tone] ? '' : Classes.TEXT_MUTED}`}
    style={TEXT[tone] ? { color: TEXT[tone] } : undefined}
  >
    {children}
  </span>
);

const ms = (value: number) => `${Math.max(0, Math.round(value))} ms`;

interface Row {
  service: Service;
  check?: InfrastructureCheck;
}

/** Known services first, then any check the GUI doesn't know yet. */
const rows = (data?: InfrastructureHealth): Row[] => {
  const checks = new Map((data?.checks ?? []).map(c => [c.name, c]));
  const known = SERVICES.map(service => ({
    service,
    check: checks.get(service.name),
  }));
  const extra = (data?.checks ?? [])
    .filter(c => !SERVICES.some(s => s.name === c.name))
    .map(
      (check): Row => ({
        service: {
          name: check.name,
          label: check.name,
          icon: 'cube',
          role: '',
        },
        check,
      }),
    );
  return [...known, ...extra];
};

/**
 * One line of indicators for the infrastructure Backpack depends on, as the
 * API sees it. Hidden when the API is too old to report it.
 */
export const InfrastructureStatus = () => {
  const query = useInfrastructureHealth();
  if (query.isError && isNotFound(query.error)) {
    return null;
  }
  const data = query.data;
  const loading = query.isLoading;
  const unreachable = query.isError;
  const items = rows(data);
  const problems = (data?.checks ?? []).filter(c => c.status !== 'Healthy');
  const down = problems.filter(c => c.status === 'Unhealthy').length;

  const overall: Tone =
    unreachable && !data
      ? 'bad'
      : !data
      ? 'neutral'
      : down > 0
      ? 'bad'
      : problems.length > 0
      ? 'attention'
      : 'good';
  const summary =
    unreachable && !data
      ? 'API unreachable'
      : !data
      ? 'Checking…'
      : problems.length === 0
      ? 'All healthy'
      : `${problems.length} need${problems.length === 1 ? 's' : ''} attention`;

  return (
    <Strip role="list" aria-label="Infrastructure health">
      <Tooltip
        className="cell-wrapper"
        targetTagName="div"
        content={
          data ? (
            <span>
              Checked by the API{' '}
              <DateTime value={data.checked_at} mode="relative" />
              {unreachable && '; the API isn’t answering now'}
            </span>
          ) : (
            'The API reports the health of what it connects to.'
          )
        }
      >
        <div
          className="cell"
          role="listitem"
          aria-label={`Infrastructure: ${summary}`}
        >
          <span className="name">
            <Icon
              icon={
                overall === 'good'
                  ? 'tick-circle'
                  : overall === 'neutral'
                  ? 'time'
                  : overall === 'attention'
                  ? 'warning-sign'
                  : 'error'
              }
              size={14}
              style={{
                color: overall === 'neutral' ? undefined : DOT[overall],
              }}
              className={overall === 'neutral' ? Classes.TEXT_MUTED : undefined}
            />
            <span className="label">Infrastructure</span>
          </span>
          <State tone={overall === 'good' ? 'neutral' : overall}>
            {unreachable && data ? (
              <>
                Last checked{' '}
                <DateTime value={data.checked_at} mode="relative" />
              </>
            ) : (
              summary
            )}
          </State>
        </div>
      </Tooltip>
      {items.map(({ service, check }) => {
        const tone: Tone = check ? TONE[check.status] : 'neutral';
        const state = check
          ? check.status === 'Healthy'
            ? `Healthy · ${ms(check.duration_ms)}`
            : check.description || LABEL[check.status]
          : loading
          ? 'Checking…'
          : data && service.notChecked
          ? 'Not checked'
          : 'Unknown';
        return (
          <Tooltip
            key={service.name}
            className="cell-wrapper"
            targetTagName="div"
            content={
              <div style={{ maxWidth: 320 }}>
                <b>{service.label}</b>
                {service.role && <div>{service.role}</div>}
                {check ? (
                  <div style={{ marginTop: 6 }}>
                    {LABEL[check.status]}
                    {check.description ? `: ${check.description}` : ''} (
                    {ms(check.duration_ms)})
                  </div>
                ) : (
                  data &&
                  service.notChecked && (
                    <div style={{ marginTop: 6 }}>{service.notChecked}</div>
                  )
                )}
              </div>
            }
          >
            <div
              className="cell"
              role="listitem"
              aria-label={`${service.label}: ${
                check ? LABEL[check.status] : state
              }`}
            >
              <span className="name">
                <Dot $tone={tone} aria-hidden="true" />
                <span className="label">{service.label}</span>
              </span>
              <State tone={tone}>{state}</State>
            </div>
          </Tooltip>
        );
      })}
    </Strip>
  );
};
