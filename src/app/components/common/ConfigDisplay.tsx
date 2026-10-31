import React from 'react';
import { Classes } from '@blueprintjs/core';
import styled from 'styled-components';
import { AuxDict } from 'types/AuxDict';
import { auxFieldName } from 'utils/processorConfig';

const List = styled.dl`
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 2px 12px;
  margin: 0;
  font-size: 0.9em;

  dt {
    white-space: nowrap;
  }
  dd {
    margin: 0;
    overflow-wrap: anywhere;
  }
`;

interface Props {
  config?: Record<string, string> | null;
  /** Field definitions used to show friendly names instead of raw keys. */
  aux?: AuxDict;
}

/** Artifact configuration as a labelled list rather than raw JSON. */
export const ConfigDisplay = ({ config, aux = {} }: Props) => {
  const entries = Object.entries(config ?? {});
  if (entries.length === 0) {
    return <span className={Classes.TEXT_MUTED}>None</span>;
  }
  return (
    <List>
      {entries.map(([key, value]) => {
        const name = auxFieldName(aux, key);
        return (
          <React.Fragment key={key}>
            <dt className={Classes.TEXT_MUTED} title={`Key: ${key}`}>
              {name}
            </dt>
            <dd>
              {value === '' ? (
                <i className={Classes.TEXT_MUTED}>empty</i>
              ) : (
                value
              )}
            </dd>
          </React.Fragment>
        );
      })}
    </List>
  );
};
