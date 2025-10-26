/**
 *
 * ModuleBrowser
 *
 */
import { Spinner, Tab, Tabs } from '@blueprintjs/core';
import { useQuery } from '@tanstack/react-query';
import { useBackpackApi } from 'api/backpack';
import React, { memo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components/macro';
import { ProcessorPanel } from './ProcessorPanel';

interface Props {}

export const ProcessorBrowser = memo((props: Props) => {
  const backpack = useBackpackApi();
  const query = useQuery(['processor_browser'], backpack.GetAllProcessors);
  const params = useParams();
  const nav = useNavigate();

  if (query.isLoading) {
    return <Spinner />;
  }

  if (query.data === undefined) {
    return <Div>Oops</Div>;
  }

  return (
    <Div>
      <Tabs
        id="processor-tabs"
        renderActiveTabPanelOnly
        selectedTabId={params.processor}
        onChange={newTabId => nav(`/processor/${newTabId}`)}
      >
        {query?.data?.data.map(processor => (
          <Tab
            key={processor.id}
            id={processor.id}
            title={processor.id.toUpperCase()}
            panel={<ProcessorPanel processor={processor} />}
          />
        ))}
      </Tabs>
    </Div>
  );
});

const Div = styled.div`
  padding-left: 0.5rem;
  padding-right: 0.5rem;
`;
