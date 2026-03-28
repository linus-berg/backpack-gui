import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';
import { QueueStatusTable } from '../../components/QueueStatusTable/Loadable';
import { EventFeed } from '../../components/EventFeed/Loadable';
import { SchedulerPanel } from '../../components/SchedulerPanel/Loadable';
import { H3, Icon } from '@blueprintjs/core';

const PageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 1rem;
  padding: 1rem;
  height: calc(100vh - 50px);
  box-sizing: border-box;
`;

const GridItem = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
`;

const Title = styled(H3)`
  margin-top: 0;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;

export function StatusPage() {
  return (
    <>
      <Helmet>
        <title>Status</title>
        <meta name="description" content="Backpack system status and events" />
      </Helmet>
      <PageGrid>
        <GridItem style={{ gridColumn: 'span 2', gridRow: 'span 2' }}>
          <Title>
            <Icon icon="pulse" style={{ marginRight: '10px' }} />
            Queue Status
          </Title>
          <QueueStatusTable />
        </GridItem>

        <GridItem style={{ gridColumn: 'span 2', gridRow: 'span 2' }}>
          <Title>
            <Icon icon="calendar" style={{ marginRight: '10px' }} />
            Tracking Schedules
          </Title>
          <SchedulerPanel />
        </GridItem>
        <GridItem style={{ gridColumn: 'span 4', gridRow: 'span 2' }}>
          <Title>
            <Icon icon="history" style={{ marginRight: '10px' }} />
            System Events
          </Title>
          <EventFeed />
        </GridItem>
      </PageGrid>
    </>
  );
}
