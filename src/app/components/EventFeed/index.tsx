import React, { memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useBackpackApi } from 'api/backpack';
import { Spinner, HTMLTable, Icon, Intent, Tag } from '@blueprintjs/core';
import styled from 'styled-components';
import { EventSeverity } from 'types/Event';

interface Props {}

const ScrollDiv = styled.div`
  flex: 1;
  overflow-y: auto;
  border: 1px solid #394b59;
  border-radius: 3px;
`;

const SeverityToIntent = (severity: EventSeverity): Intent => {
  switch (severity) {
    case EventSeverity.SUCCESS:
      return Intent.SUCCESS;
    case EventSeverity.ERROR:
      return Intent.DANGER;
    case EventSeverity.WARNING:
      return Intent.WARNING;
    default:
      return Intent.NONE;
  }
};

const SeverityToIcon = (severity: EventSeverity): any => {
  switch (severity) {
    case EventSeverity.SUCCESS:
      return 'tick-circle';
    case EventSeverity.ERROR:
      return 'error';
    case EventSeverity.WARNING:
      return 'warning-sign';
    default:
      return 'info-sign';
  }
};

export const EventFeed = memo((props: Props) => {
  const backpack = useBackpackApi();
  const query = useQuery(['events'], backpack.GetEvents, {
    refetchInterval: 10000,
  });

  if (query.isLoading) {
    return <Spinner />;
  }

  return (
    <ScrollDiv>
      <HTMLTable striped condensed style={{ width: '100%' }}>
        <thead>
          <tr>
            <th style={{ width: '180px' }}>Timestamp</th>
            <th style={{ width: '100px' }}>Source</th>
            <th>Message</th>
            <th style={{ width: '120px' }}>User</th>
          </tr>
        </thead>
        <tbody>
          {query.data?.data.map(event => (
            <tr key={event.id}>
              <td style={{ fontSize: '0.85em', color: '#abb3bf' }}>
                {new Date(event.timestamp).toLocaleString()}
              </td>
              <td>
                <Tag
                  minimal
                  intent={SeverityToIntent(event.severity)}
                  icon={SeverityToIcon(event.severity)}
                >
                  {event.source}
                </Tag>
              </td>
              <td
                style={{
                  fontWeight:
                    event.severity === EventSeverity.ERROR ? 'bold' : 'normal',
                }}
              >
                {event.message}
              </td>
              <td>
                <Icon icon="user" size={12} style={{ marginRight: '5px' }} />
                {event.user}
              </td>
            </tr>
          ))}
        </tbody>
      </HTMLTable>
    </ScrollDiv>
  );
});
