import React from 'react';
import { Classes, Icon, Intent } from '@blueprintjs/core';
import styled from 'styled-components';
import { useEvents } from 'api/queries';
import { EventSeverity } from 'types/Event';
import { DateTime } from 'app/components/common/DateTime';
import { LinkButton } from 'app/components/common/LinkButton';
import { LoadingState } from 'app/components/common/States';
import { SeverityToIcon, SeverityToIntent } from 'utils/events';
import { HomeCard } from './HomeCard';

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    display: grid;
    grid-template-columns: 18px 1fr auto;
    gap: 10px;
    padding: 9px 0;
    align-items: baseline;
  }
  li + li {
    border-top: 1px solid var(--table-border);
  }
  .message {
    overflow-wrap: anywhere;
  }
  .source {
    display: block;
    font-size: 0.85rem;
  }
  time {
    font-size: 0.85rem;
  }
`;

const Calm = styled.p`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 12px 0;
`;

/** The latest warnings and errors from the event log. */
export const RecentProblems = () => {
  // Same key as the Status page's default view, so the cache is shared.
  const events = useEvents(100, 30_000);
  const problems = (events.data ?? [])
    .filter(
      e =>
        e.severity === EventSeverity.ERROR ||
        e.severity === EventSeverity.WARNING,
    )
    .slice(0, 5);

  return (
    <HomeCard
      icon="warning-sign"
      title="Warnings and errors"
      titleId="home-problems"
      action={
        <LinkButton
          to="/status"
          text="All events"
          icon="arrow-right"
          minimal
          small
        />
      }
    >
      {events.isLoading ? (
        <LoadingState />
      ) : events.isError ? (
        <Calm className={Classes.TEXT_MUTED}>Couldn’t load events.</Calm>
      ) : problems.length === 0 ? (
        <Calm className={Classes.TEXT_MUTED}>
          <Icon icon="tick-circle" intent={Intent.SUCCESS} />
          Nothing to report in the latest events.
        </Calm>
      ) : (
        <List>
          {problems.map(e => (
            <li key={e.id}>
              <Icon
                icon={SeverityToIcon(e.severity)}
                intent={SeverityToIntent(e.severity)}
              />
              <span className="message">
                {e.message}
                <span className={`source ${Classes.TEXT_MUTED}`}>
                  {e.source}
                </span>
              </span>
              <span className={Classes.TEXT_MUTED}>
                <DateTime value={e.timestamp} mode="relative" />
              </span>
            </li>
          ))}
        </List>
      )}
    </HomeCard>
  );
};
