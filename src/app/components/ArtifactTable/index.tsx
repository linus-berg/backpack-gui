/**
 *
 * ArtifactTable
 *
 */
import { Spinner, Tag } from '@blueprintjs/core';
import { get, filter, map, sortBy } from 'lodash-es';
import { Cell, Column, Table2 } from '@blueprintjs/table';
import { useQuery } from '@tanstack/react-query';
import { useBackpackApi } from 'api/backpack';
import React, { memo, useState } from 'react';
import styled from 'styled-components';
import './ArtifactTable.scss';
import { Processor } from '../../../types/Processor';
import { Artifact } from 'types';
import { ArtifactInspector } from 'app/components/ArtifactInspector';
import { ArtifactTableFilterBar } from './components/ArtifactTableFilterBar';
import { ArtifactTableActions } from './components/ArtifactTableActions';
import { AuxField } from 'types/AuxField';

interface Props {
  processor: Processor;
}

const FilterObject = (filter: string, artifact: any, deep_filter = false) => {
  if (artifact === undefined || artifact === null) {
    return false;
  }
  const keys = Object.keys(artifact);
  for (let i in keys) {
    const key = keys[i];
    const value = artifact[key];
    if (deep_filter && typeof value === 'object') {
      if (FilterObject(filter, value, deep_filter)) {
        return true;
      }
    } else {
      if (('' + value).toLowerCase().includes(filter.toLowerCase())) {
        return true;
      }
    }
  }
  return false;
};

const FilterArtifacts = (
  filter_str: string,
  artifacts: Artifact[],
  deep_filter = false,
) => {
  if (filter_str === '') {
    return artifacts;
  }
  return filter(artifacts, artifact =>
    FilterObject(filter_str, artifact, deep_filter),
  );
};

export const ArtifactTable = memo((props: Props) => {
  const backpack = useBackpackApi();
  const [only_roots, SetOnlyRoots] = useState(true);
  const [deep_filter, SetDeepFilter] = useState(false);
  const [inspect, SetInspect] = useState<null | Artifact>(null);
  const [search_filter, SetSearchFilter] = useState('');
  const query = useQuery(
    ['artifact_table', props.processor.id, only_roots],
    backpack.GetAllProcessorArtifacts,
  );

  if (query.isLoading) {
    return <Spinner />;
  }

  const data = sortBy(query.data?.data, 'id');
  const artifacts = FilterArtifacts(
    search_filter,
    only_roots ? filter(data, (artifact: Artifact) => artifact.root) : data,
    deep_filter,
  );

  const aux_columns = map(
    JSON.parse(props.processor.config),
    (field: AuxField) => {
      return {
        key: `config.${field.key}`,
        name: `config.${field.key}`,
        interactive: false,
      };
    },
  );

  const columns = [
    { key: 'id', name: 'ID', interactive: false },
    { key: 'filter', name: 'Filter' },
    {
      key: 'root',
      name: 'Type',
      interactive: true,
      render: (row: any, key: string) => (
        <Center>
          <Tag minimal intent={row[key] ? 'success' : 'warning'}>
            {row[key] ? 'root' : 'branch'}
          </Tag>
        </Center>
      ),
    },
    {
      key: 'versions',
      name: 'Versions',
      interactive: false,
      render: (row: any, key: string) => (
        <Center>
          {props.processor.is_external || props.processor.direct_collect ? (
            <Tag minimal>N/A</Tag>
          ) : (
            <Tag round minimal>
              {row[key]}
            </Tag>
          )}
        </Center>
      ),
    },
    {
      key: 'dependencies',
      name: 'Deps',
      interactive: false,
      render: (row: any, key: string) => (
        <Center>
          {props.processor.is_external || props.processor.direct_collect ? (
            <Tag minimal>N/A</Tag>
          ) : (
            <Tag round minimal>
              {row[key]}
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
            processor={props.processor}
            onInspect={SetInspect}
          />
        </Center>
      ),
    },
  ];

  const RenderBasic = (row_idx: number, col_idx: number) => {
    const column = columns[col_idx];
    const value = get(artifacts[row_idx], column.key);
    const render = 'render' in column ? column.render : undefined;
    return (
      <Cell interactive={column.interactive} className="artifact-table-cell">
        {render ? render(artifacts[row_idx], column.key) : value}
      </Cell>
    );
  };

  return (
    <Div>
      <ArtifactTableFilterBar
        artifactCount={artifacts.length}
        onlyRoots={only_roots}
        onOnlyRootsChange={SetOnlyRoots}
        deepFilter={deep_filter}
        onDeepFilterChange={SetDeepFilter}
        searchFilter={search_filter}
        onSearchFilterChange={SetSearchFilter}
      />

      <TableWrapper>
        <Table2
          enableColumnResizing
          defaultRowHeight={32}
          numRows={artifacts.length}
        >
          {columns.map(column => (
            <Column
              key={column.key}
              name={column.name}
              cellRenderer={RenderBasic}
            />
          ))}
        </Table2>
      </TableWrapper>

      <ArtifactInspector onClose={() => SetInspect(null)} artifact={inspect} />
    </Div>
  );
});

const Div = styled.div`
  width: 100%;
  height: 80vh;
  display: flex;
  flex-direction: column;
`;

const TableWrapper = styled.div`
  flex: 1;
  min-height: 0;
`;

const Center = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4px;
`;
