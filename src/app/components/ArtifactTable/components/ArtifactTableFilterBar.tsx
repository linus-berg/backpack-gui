import React from 'react';
import { Checkbox, Icon, Text } from '@blueprintjs/core';
import styled from 'styled-components';
import { SearchBar } from '../SearchBar';

interface Props {
  artifactCount: number;
  onlyRoots: boolean;
  onOnlyRootsChange: (value: boolean) => void;
  deepFilter: boolean;
  onDeepFilterChange: (value: boolean) => void;
  searchFilter: string;
  onSearchFilterChange: (value: string) => void;
}

const TableHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--table-border);
  margin-bottom: 8px;

  .bp4-dark & {
    border-bottom-color: #394b59;
  }
`;

export const ArtifactTableFilterBar = ({
  artifactCount,
  onlyRoots,
  onOnlyRootsChange,
  deepFilter,
  onDeepFilterChange,
  searchFilter,
  onSearchFilterChange,
}: Props) => {
  return (
    <TableHeader>
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icon icon="database" color="#abb3bf" />
          <Text>
            <b>{artifactCount}</b> Artifacts
          </Text>
        </div>
        <Checkbox
          label="Roots Only"
          checked={onlyRoots}
          onChange={() => onOnlyRootsChange(!onlyRoots)}
          style={{ marginBottom: 0 }}
        />
        <Checkbox
          label="Deep Search"
          checked={deepFilter}
          onChange={() => onDeepFilterChange(!deepFilter)}
          style={{ marginBottom: 0 }}
        />
      </div>
      <div style={{ width: '300px' }}>
        <SearchBar value={searchFilter} onChange={onSearchFilterChange} />
      </div>
    </TableHeader>
  );
};
