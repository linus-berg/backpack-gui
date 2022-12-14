/**
 *
 * Administration
 *
 */
import React, { memo } from 'react';
import styled from 'styled-components/macro';
import { useQuery } from '@tanstack/react-query';
import { GetAllProcessors } from 'api/apc';
import { Spinner, Tab, Tabs } from '@blueprintjs/core';
import { useNavigate, useParams } from 'react-router-dom';
import { ProcessorEditor } from 'app/components/ProcessorEditor/Loadable';

interface Props {}

export const ProcessorConfig = memo((props: Props) => {
  const query = useQuery(['processor_list'], GetAllProcessors);
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
        id="processor-config-tabs"
        renderActiveTabPanelOnly
        selectedTabId={params.processor}
        onChange={newTabId => nav(`/config/${newTabId}`)}
      >
        {query?.data?.data.map(processor => (
          <Tab
            key={processor.id}
            id={processor.id}
            title={processor.id}
            panel={<ProcessorEditor processor={processor} />}
          />
        ))}
      </Tabs>
    </Div>
  );
});

const Div = styled.div``;
