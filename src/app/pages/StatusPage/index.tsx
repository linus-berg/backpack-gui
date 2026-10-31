import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';
import { QueueStatusTable } from '../../components/QueueStatusTable/Loadable';
import { EventFeed } from '../../components/EventFeed/Loadable';
import { SchedulerPanel } from '../../components/SchedulerPanel/Loadable';
import { Page, SectionHeader } from 'app/components/common/PageHeader';
import { ErrorBoundary } from 'app/components/common/ErrorBoundary';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(520px, 100%), 1fr));
  gap: 1rem;
`;

/** A titled panel whose table scrolls inside a bounded height. */
const Section = styled.section<{ $height: string }>`
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: ${p => p.$height};
  min-height: 280px;
`;

export function StatusPage() {
  return (
    <>
      <Helmet>
        <title>Status</title>
        <meta name="description" content="Backpack system status and events" />
      </Helmet>
      <Page style={{ gap: '1rem' }}>
        <Grid>
          <Section $height="42vh" aria-labelledby="queues-title">
            <SectionHeader
              icon="pulse"
              title={<span id="queues-title">Queues</span>}
            />
            <ErrorBoundary>
              <QueueStatusTable />
            </ErrorBoundary>
          </Section>
          <Section $height="42vh" aria-labelledby="schedules-title">
            <ErrorBoundary>
              <SchedulerPanel titleId="schedules-title" />
            </ErrorBoundary>
          </Section>
        </Grid>
        <Section $height="60vh" aria-labelledby="events-title">
          <SectionHeader
            icon="history"
            title={<span id="events-title">System events</span>}
          />
          <ErrorBoundary>
            <EventFeed />
          </ErrorBoundary>
        </Section>
      </Page>
    </>
  );
}
