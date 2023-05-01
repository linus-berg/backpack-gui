/**
 *
 * ArtifactTable
 *
 */
import { Button, Checkbox, Spinner, Tag } from '@blueprintjs/core';
import _ from 'lodash';
import { Column, Cell, Table2 } from '@blueprintjs/table';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useApcApi } from 'api/apc';
import React, { memo, useState } from 'react';
import styled from 'styled-components/macro';
import './ArtifactTable.scss';
import { Processor } from '../../../types/Processor';
import { AuxField } from 'types/AuxField';
import { useKeycloak } from '@react-keycloak-fork/web';
import { Artifact } from 'types';

interface Props {
  processor: Processor;
}

export const ArtifactTable = memo((props: Props) => {
  const apc = useApcApi();
  const { keycloak } = useKeycloak();

  const [only_roots, SetOnlyRoots] = useState(true);
  const query = useQuery(
    ['artifact_table', props.processor.id, only_roots],
    apc.GetAllProcessorArtifacts,
  );

  const mutation = useMutation(apc.DeleteArtifact);

  if (query.isLoading) {
    return <Spinner />;
  }

  const aux_columns = _.map(
    JSON.parse(props.processor.config),
    (field: AuxField) => {
      return {
        key: `config.${field.key}`,
      };
    },
  );

  const columns = [
    { key: 'id' },
    { key: 'processor' },
    { key: 'filter' },
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
      key: 'versions',
      render: (row: any, key: string) => (
        <Center>{_.keys(row[key]).length}</Center>
      ),
    },
    {
      key: 'dependencies',
      render: (row: any, key: string) => (
        <Center>{_.keys(row[key]).length}</Center>
      ),
    },
    ...aux_columns,
    {
      key: 'action',
      interactive: true,
      render: row => (
        <Center>
          <Button
            intent="danger"
            disabled={!keycloak.hasResourceRole('Administrator')}
            onClick={() =>
              mutation.mutate({ id: row.id, processor: row.processor })
            }
            small
          >
            Delete
          </Button>
        </Center>
      ),
    },
  ];

  const data = _.sortBy(query.data?.data, 'id');
  const artifacts = only_roots
    ? _.filter(data, (artifact: Artifact) => artifact.root)
    : data;

  const RenderBasic = (row_idx: number, col_idx: number) => {
    const column = columns[col_idx];
    const render = column.render;
    const value = _.get(artifacts[row_idx], column.key);
    return (
      <Cell interactive={column.interactive} className="artifact-table-cell">
        {render ? render(artifacts[row_idx], column.key) : value}
      </Cell>
    );
  };

  return (
    <Div>
      <Checkbox
        label="Only roots"
        checked={only_roots}
        onChange={() => SetOnlyRoots(!only_roots)}
      />
      <Table2
        enableColumnResizing
        defaultRowHeight={30}
        numRows={artifacts.length}
      >
        {columns.map(column => (
          <Column
            key={column.key}
            name={column.key}
            cellRenderer={RenderBasic}
          />
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
  width: 100%;
  height: 80vh;
`;
