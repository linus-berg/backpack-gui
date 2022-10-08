/**
 *
 * ArtifactTable
 *
 */
import { Spinner } from '@blueprintjs/core';
import { Column, Cell, Table2 } from '@blueprintjs/table';
import { useQuery } from '@tanstack/react-query';
import { GetAllModuleArtifacts } from 'api/apc';
import React, { memo } from 'react';
import styled from 'styled-components/macro';

interface Props {}

export const ArtifactTable = memo((props: Props) => {
  const query = useQuery(['artifact_table', 'npm'], GetAllModuleArtifacts);
  console.log(query);
  if (query.isLoading) {
    return <Spinner></Spinner>;
  }

  const columns = ['id', 'name', 'module'];

  const data = query.data?.data;

  const RenderBasic = (row, column) => {
    return <Cell>{data[row][columns[column]]}</Cell>;
  };

  return (
    <Div>
      <Table2 enableColumnResizing numRows={query.data?.data.length}>
        {columns.map(column => (
          <Column name={column} cellRenderer={RenderBasic} />
        ))}
      </Table2>
    </Div>
  );
});

const Div = styled.div`
  padding: 2rem;
  width: 80vw;
  height: 80vh;
`;
