import * as React from 'react';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button, Tag } from '@blueprintjs/core';
import styled from 'styled-components';
import {
  QueueFilter,
  QueueStatusTable,
} from '../../components/QueueStatusTable';
import { EventFeed } from '../../components/EventFeed/Loadable';
import { FillPage, SectionHeader } from 'app/components/common/PageHeader';
import { ErrorBoundary } from 'app/components/common/ErrorBoundary';
import { NextRun, StatusSummary } from './StatusSummary';
import { InfrastructureStatus } from './InfrastructureStatus';

/* The page fits the window: the infrastructure strip and the summary at
   their natural height, the queues at theirs (up to half of what's left,
   scrolling inside beyond that), and the event log takes the rest. */
const Layout = styled(FillPage)`
  gap: 16px;

  > * {
    flex-shrink: 0;
  }
`;

const Section = styled.section<{ $fill?: boolean }>`
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: ${p => (p.$fill ? '220px' : '160px')};
  ${p =>
    p.$fill
      ? 'flex: 1 1 0; && { flex-shrink: 1; }'
      : 'flex: 0 1 auto; max-height: 50%; && { flex-shrink: 1; }'}
`;

const FILTER_LABELS: Record<Exclude<QueueFilter, 'all'>, string> = {
  attention: 'Needing attention',
  busy: 'With messages',
};

export function StatusPage() {
  const [filter, setFilter] = useState<QueueFilter>('all');

  return (
    <>
      <Helmet>
        <title>Status</title>
        <meta name="description" content="Backpack system status and events" />
      </Helmet>
      <Layout>
        <ErrorBoundary>
          <InfrastructureStatus />
        </ErrorBoundary>
        <ErrorBoundary>
          <StatusSummary filter={filter} onFilterChange={setFilter} />
        </ErrorBoundary>
        <Section aria-labelledby="queues-title">
          <SectionHeader
            icon="layers"
            title={<span id="queues-title">Queues</span>}
            actions={
              <>
                {filter !== 'all' && (
                  <>
                    <Tag minimal round icon="filter">
                      {FILTER_LABELS[filter]}
                    </Tag>
                    <Button
                      variant="minimal"
                      size="small"
                      text="Show all"
                      onClick={() => setFilter('all')}
                    />
                  </>
                )}
                <NextRun />
              </>
            }
          />
          <ErrorBoundary>
            <QueueStatusTable filter={filter} />
          </ErrorBoundary>
        </Section>
        <Section $fill aria-labelledby="events-title">
          <SectionHeader
            icon="history"
            title={<span id="events-title">System events</span>}
          />
          <ErrorBoundary>
            <EventFeed />
          </ErrorBoundary>
        </Section>
      </Layout>
    </>
  );
}
