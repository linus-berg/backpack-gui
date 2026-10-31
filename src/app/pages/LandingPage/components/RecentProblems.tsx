import React from 'react';
import { Card, Classes, H5, Icon, Intent } from '@blueprintjs/core';
import styled from 'styled-components';
import { useEvents } from 'api/queries';
import { EventSeverity } from 'types/Event';
import { DateTime } from 'app/components/common/DateTime';
import { LinkButton } from 'app/components/common/LinkButton';
import { LoadingState } from 'app/components/common/States';
import { SeverityToIcon, SeverityToIntent } from 'utils/events';

const List = styled.ul`
  list-style: none;
  margin: 0 0 8px;
  padding: 0;

  li {
    display: grid;
    grid-template-columns: 20px 1fr auto;
    gap: 8px;
    padding: 6px 0;
    align-items: baseline;
  }
  li + li {
    border-top: 1px solid var(--table-border);
  }
  .message {
    overflow-wrap: anywhere;
  }
`;

/** The latest errors and warnings from the event log. */
export const RecentProblems = () => {
  // Same key as the Status page's default view, so the cache is shared.
  const events = useEvents(100, 30_000);
  const problems = (events.data ?? [])
    .filter(
      e =>
        e.severity === EventSeverity.ERROR ||
        e.severity === EventSeverity.WARNING,
    )
    .slice(0, 6);

  return (
    <Card>
      <H5>
        <Icon icon="warning-sign" style={{ marginRight: 8 }} />
        Recent problems
      </H5>
      {events.isLoading ? (
        <LoadingState />
      ) : events.isError ? (
        <p className={Classes.TEXT_MUTED}>Couldn’t load events.</p>
      ) : problems.length === 0 ? (
        <p className={Classes.TEXT_MUTED}>
          <Icon icon="tick-circle" intent={Intent.SUCCESS} /> No errors or
          warnings in the latest events.
        </p>
      ) : (
        <List>
          {problems.map(e => (
            <li key={e.id}>
              <Icon
                icon={SeverityToIcon(e.severity)}
                intent={SeverityToIntent(e.severity)}
              />
              <span className="message">
                {e.message}{' '}
                <span className={Classes.TEXT_MUTED}>· {e.source}</span>
              </span>
              <span className={Classes.TEXT_MUTED}>
                <DateTime value={e.timestamp} mode="relative" />
              </span>
            </li>
          ))}
        </List>
      )}
      <LinkButton
        to="/status"
        minimal
        small
        icon="arrow-right"
        text="All system events"
      />
    </Card>
  );
};
