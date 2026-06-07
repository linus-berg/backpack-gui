import React, { useMemo } from 'react';
import { Tag } from '@blueprintjs/core';
import { map } from 'lodash-es';
import styled from 'styled-components';
import { Processor } from 'types/Processor';
import { Artifact } from 'types';
import { AuxField } from 'types/AuxField';
import { ArtifactTableActions } from '../components/ArtifactTableActions';

const Center = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4px;
`;

interface Config {
  processor: Processor;
  onInspect: (artifact: Artifact) => void;
}

export const useArtifactTableColumns = ({ processor, onInspect }: Config) => {
  return useMemo(() => {
    const aux_columns = map(
      JSON.parse(processor.config),
      (field: AuxField) => {
        return {
          key: `config.${field.key}`,
          name: field.name,
          interactive: false,
        };
      },
    );

    return [
      { key: 'id', name: 'ID', interactive: false },
      { key: 'filter', name: 'Filter' },
      {
        key: 'root',
        name: 'Type',
        interactive: true,
        render: (row: Artifact, key: string) => (
          <Center>
            <Tag minimal intent={row[key as keyof Artifact] ? 'success' : 'warning'}>
              {row[key as keyof Artifact] ? 'root' : 'branch'}
            </Tag>
          </Center>
        ),
      },
      {
        key: 'versions',
        name: 'Versions',
        interactive: false,
        render: (row: Artifact, key: string) => (
          <Center>
            {processor.is_external || processor.direct_collect ? (
              <Tag minimal>N/A</Tag>
            ) : (
              <Tag round minimal>
                {row[key as keyof Artifact] as React.ReactNode}
              </Tag>
            )}
          </Center>
        ),
      },
      {
        key: 'dependencies',
        name: 'Dependencies',
        interactive: false,
        render: (row: Artifact, key: string) => (
          <Center>
            {processor.is_external || processor.direct_collect ? (
              <Tag minimal>N/A</Tag>
            ) : (
              <Tag round minimal>
                {row[key as keyof Artifact] as React.ReactNode}
              </Tag>
            )}
          </Center>
        ),
      },
      ...aux_columns,
      {
        key: 'action',
        name: 'Actions',
        interactive: true,
        render: (row: Artifact) => (
          <Center>
            <ArtifactTableActions
              artifact={row}
              processor={processor}
              onInspect={onInspect}
            />
          </Center>
        ),
      },
    ];
  }, [processor, onInspect]);
};
