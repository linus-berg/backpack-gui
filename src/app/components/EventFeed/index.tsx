import React, { memo, useMemo, useState } from 'react';
import {
  Classes,
  HTMLSelect,
  HTMLTable,
  Icon,
  InputGroup,
  Spinner,
  Tag,
} from '@blueprintjs/core';
import styled from 'styled-components';
import { useEvents } from 'api/queries';
import { EventSeverity } from 'types/Event';
import { SeverityToIcon, SeverityToIntent } from 'utils/events';
import { DateTime } from 'app/components/common/DateTime';
import { LoadingState, QueryErrorState } from 'app/components/common/States';
import { ScrollTableContainer } from '../ScrollTableContainer';

const LIMITS = [100, 250, 500, 1000];

const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-shrink: 0;
`;

export const EventFeed = memo(() => {
  const [limit, setLimit] = useState(100);
  const [severity, setSeverity] = useState<'' | EventSeverity>('');
  const [source, setSource] = useState('');
  const [search, setSearch] = useState('');
  const query = useEvents(limit);

  const events = useMemo(() => query.data ?? [], [query.data]);
  const sources = useMemo(
    () => Array.from(new Set(events.map(e => e.source))).sort(),
    [events],
  );
  const shown = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return events.filter(
      e =>
        (!severity || e.severity === severity) &&
        (!source || e.source === source) &&
        (!needle ||
          e.message.toLowerCase().includes(needle) ||
          (e.user ?? '').toLowerCase().includes(needle)),
    );
  }, [events, severity, source, search]);

  if (query.isLoading) {
    return <LoadingState />;
  }
  if (query.isError && !query.data) {
    return (
      <QueryErrorState
        title="Couldn't load events"
        error={query.error}
        onRetry={() => query.refetch()}
      />
    );
  }

  return (
    <>
      <Toolbar>
        <InputGroup
          type="search"
          leftIcon="search"
          placeholder="Search messages or users…"
          aria-label="Search events"
          value={search}
          onChange={e => setSearch(e.currentTarget.value)}
          style={{ width: 260 }}
        />
        <HTMLSelect
          aria-label="Severity"
          value={severity}
          onChange={e =>
            setSeverity(e.currentTarget.value as '' | EventSeverity)
          }
          options={[
            { value: '', label: 'All severities' },
            { value: EventSeverity.ERROR, label: 'Errors' },
            { value: EventSeverity.WARNING, label: 'Warnings' },
            { value: EventSeverity.SUCCESS, label: 'Success' },
            { value: EventSeverity.INFO, label: 'Info' },
          ]}
        />
        <HTMLSelect
          aria-label="Source"
          value={source}
          onChange={e => setSource(e.currentTarget.value)}
          options={[
            { value: '', label: 'All sources' },
            ...sources.map(s => ({ value: s, label: s })),
          ]}
        />
        <HTMLSelect
          aria-label="Number of events to load"
          value={limit}
          onChange={e => setLimit(Number(e.currentTarget.value))}
          options={LIMITS.map(l => ({ value: l, label: `Last ${l}` }))}
        />
        <span className={Classes.TEXT_MUTED} aria-live="polite">
          {shown.length === events.length
            ? `${events.length} events`
            : `${shown.length} of ${events.length} events`}
        </span>
        {query.isFetching && <Spinner size={16} aria-label="Refreshing" />}
      </Toolbar>
      <ScrollTableContainer>
        <HTMLTable striped condensed style={{ width: '100%' }}>
          <thead>
            <tr>
              <th style={{ width: 140 }}>When</th>
              <th style={{ width: 130 }}>Source</th>
              <th>Message</th>
              <th style={{ width: 160 }}>User</th>
            </tr>
          </thead>
          <tbody>
            {shown.map(event => (
              <tr key={event.id}>
                <td className={Classes.TEXT_MUTED}>
                  <DateTime value={event.timestamp} mode="relative" />
                </td>
                <td>
                  <Tag
                    minimal
                    intent={SeverityToIntent(event.severity)}
                    icon={SeverityToIcon(event.severity)}
                    htmlTitle={event.severity}
                  >
                    {event.source}
                  </Tag>
                </td>
                <td
                  style={{
                    fontWeight:
                      event.severity === EventSeverity.ERROR ? 600 : undefined,
                    overflowWrap: 'anywhere',
                  }}
                >
                  {event.message}
                </td>
                <td>
                  <Icon icon="user" size={12} style={{ marginRight: 5 }} />
                  {event.user}
                </td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className={Classes.TEXT_MUTED}
                  style={{ textAlign: 'center', padding: '2rem' }}
                >
                  {events.length === 0
                    ? 'No events recorded yet.'
                    : 'No events match these filters.'}
                </td>
              </tr>
            )}
          </tbody>
        </HTMLTable>
      </ScrollTableContainer>
    </>
  );
});
