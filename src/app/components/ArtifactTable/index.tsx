/**
 *
 * ArtifactTable
 *
 */
import { Spinner } from '@blueprintjs/core';
import { get, filter, sortBy } from 'lodash-es';
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
import { filterArtifacts } from 'utils/filterUtils';
import { useArtifactTableColumns } from './hooks/useArtifactTableColumns';

interface Props {
  processor: Processor;
}

export const ArtifactTable = memo((props: Props) => {
  const backpack = useBackpackApi();

  const [only_roots, SetOnlyRoots] = useState(true);
  const [deep_filter, SetDeepFilter] = useState(false);
  const [inspect, SetInspect] = useState<null | Artifact>(null);
  const [search_filter, SetSearchFilter] = useState('');

  const query = useQuery({
    queryKey: ['artifact_table', props.processor.id, only_roots],
    queryFn: backpack.GetAllProcessorArtifacts,
  });

  const columns = useArtifactTableColumns({
    processor: props.processor,
    onInspect: SetInspect,
  });

  if (query.isLoading) {
    return <Spinner />;
  }

  const data = sortBy(query.data?.data, 'id');
  const artifacts = filterArtifacts(
    search_filter,
    only_roots ? filter(data, (artifact: Artifact) => artifact.root) : data,
    deep_filter,
  );

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
