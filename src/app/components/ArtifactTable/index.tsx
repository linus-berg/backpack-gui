/**
 *
 * ArtifactTable
 *
 */
import { Checkbox, Spinner } from '@blueprintjs/core';
import { Column, Cell, Table2 } from '@blueprintjs/table';
import { useQuery } from '@tanstack/react-query';
import { GetAllModuleArtifacts } from 'api/apc';
import React, { memo } from 'react';
import styled from 'styled-components/macro';

interface Props {
  module: string;
}

export const ArtifactTable = memo((props: Props) => {
  const query = useQuery(
    ['artifact_table', props.module],
    GetAllModuleArtifacts,
  );
  if (query.isLoading) {
    return <Spinner />;
  }

  const columns = [
    { key: 'id' },
    { key: 'name' },
    { key: 'module' },
    {
      key: 'root',
      interactive: true,
      render: (value: boolean) => (
        <Center>
          <Checkbox checked={value} />
        </Center>
      ),
    },
  ];

  const data = query.data?.data;

  const RenderBasic = (row_idx: number, col_idx: number) => {
    const column = columns[col_idx];
    const render = column.render;
    const value = data[row_idx][column.key];
    return (
      <Cell interactive={column.interactive}>
        {render ? render(value) : value}
      </Cell>
    );
  };

  return (
    <Div>
      <Table2
        enableColumnResizing
        defaultRowHeight={22}
        numRows={query.data?.data.length}
      >
        {columns.map(column => (
          <Column name={column.key} cellRenderer={RenderBasic} />
        ))}
      </Table2>
    </Div>
  );
});
const Center = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4px;
`;

const Div = styled.div`
  width: 98vw;
  height: 80vh;
`;
