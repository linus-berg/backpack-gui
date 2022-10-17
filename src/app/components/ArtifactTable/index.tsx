/**
 *
 * ArtifactTable
 *
 */
import { Button, Checkbox, Spinner, Tag } from '@blueprintjs/core';
import { Column, Cell, Table2 } from '@blueprintjs/table';
import { useMutation, useQuery } from '@tanstack/react-query';
import { DeleteArtifact, GetAllModuleArtifacts } from 'api/apc';
import React, { memo } from 'react';
import styled from 'styled-components/macro';
import './ArtifactTable.scss';

interface Props {
  module: string;
}

export const ArtifactTable = memo((props: Props) => {
  const query = useQuery(
    ['artifact_table', props.module],
    GetAllModuleArtifacts,
  );

  const mutation = useMutation(DeleteArtifact);

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
      render: (row: any, key: string) => (
        <Center>
          <Tag intent={row[key] ? 'success' : 'warning'}>
            {row[key] ? 'root' : 'branch'}
          </Tag>
        </Center>
      ),
    },
    {
      key: 'action',
      interactive: true,
      render: row => (
        <Center>
          <Button intent="danger" onClick={() => mutation.mutate(row.id)} small>
            Delete
          </Button>
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
      <Cell interactive={column.interactive} className="artifact-table-cell">
        {render ? render(data[row_idx], column.key) : value}
      </Cell>
    );
  };

  return (
    <Div>
      <Table2
        enableColumnResizing
        defaultRowHeight={30}
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
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4px;
`;

const Div = styled.div`
  width: 98vw;
  height: 80vh;
`;
