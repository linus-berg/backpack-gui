import React, { ReactNode, useMemo } from 'react';
import { Checkbox, Classes, Tag } from '@blueprintjs/core';
import styled from 'styled-components';
import { Processor } from 'types/Processor';
import { ArtifactSummary } from 'types';
import { FilterDisplay } from 'app/components/common/FilterDisplay';
import { auxFieldList, parseAuxConfig } from 'utils/processorConfig';
import { ArtifactRowActions } from '../components/ArtifactRowActions';

export const Center = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const Middle = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

/** Artifact ID rendered as a link-style button that opens the inspector. */
const IdLink = styled.button`
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  color: inherit;
  cursor: pointer;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;

  &:hover,
  &:focus-visible {
    text-decoration: underline;
    color: var(--brand-text);
  }
`;

export interface ArtifactColumn {
  key: string;
  name: string;
  width: number;
  /** Value used for sorting; columns without one can't be sorted. */
  sortValue?: (row: ArtifactSummary) => string | number;
  render: (row: ArtifactSummary) => ReactNode;
  /** Plain-text value shown as a native tooltip when the cell is truncated. */
  tooltip?: (row: ArtifactSummary) => string;
  interactive?: boolean;
}

interface Config {
  processor: Processor;
  onInspect: (id: string) => void;
  isSelected: (id: string) => boolean;
  onToggleSelected: (id: string) => void;
}

/**
 * Column definitions for the artifact table, including one column per
 * auxiliary config field defined on the processor.
 */
export const useArtifactTableColumns = ({
  processor,
  onInspect,
  isSelected,
  onToggleSelected,
}: Config): ArtifactColumn[] => {
  return useMemo(() => {
    const countsApply = !processor.is_external && !processor.direct_collect;
    const count = (value: number) => (
      <Center>
        {countsApply ? (
          <Tag round minimal>
            {value}
          </Tag>
        ) : (
          <span
            className={Classes.TEXT_MUTED}
            title="Not tracked for this processor"
          >
            n/a
          </span>
        )}
      </Center>
    );

    const auxColumns: ArtifactColumn[] = auxFieldList(
      parseAuxConfig(processor.config),
    ).map(field => ({
      key: `config.${field.key}`,
      name: field.name,
      width: 140,
      sortValue: row => row.config?.[field.key] ?? '',
      tooltip: row => row.config?.[field.key] ?? '',
      render: row => <Middle>{row.config?.[field.key] ?? ''}</Middle>,
    }));

    return [
      {
        key: 'select',
        name: '',
        width: 40,
        interactive: true,
        render: row => (
          <Center>
            <Checkbox
              checked={isSelected(row.id)}
              onChange={() => onToggleSelected(row.id)}
              aria-label={`Select ${row.id}`}
              style={{ margin: 0 }}
            />
          </Center>
        ),
      },
      {
        key: 'id',
        name: 'ID',
        width: 200,
        interactive: true,
        sortValue: row => row.id.toLowerCase(),
        tooltip: row => row.id,
        render: row => (
          <Middle>
            <IdLink
              type="button"
              onClick={() => onInspect(row.id)}
              aria-label={`Inspect ${row.id}`}
            >
              {row.id}
            </IdLink>
          </Middle>
        ),
      },
      {
        key: 'filter',
        name: 'Version filter',
        width: 140,
        sortValue: row => row.filter ?? '',
        tooltip: row => row.filter || 'All versions',
        render: row => (
          <Middle>
            <FilterDisplay filter={row.filter} />
          </Middle>
        ),
      },
      {
        key: 'root',
        name: 'Type',
        width: 105,
        sortValue: row => (row.root ? 0 : 1),
        render: row => (
          <Center>
            <Tag
              minimal
              intent={row.root ? 'success' : 'none'}
              htmlTitle={
                row.root
                  ? 'Added directly'
                  : 'Discovered as a dependency of another artifact'
              }
            >
              {row.root ? 'root' : 'dependency'}
            </Tag>
          </Center>
        ),
      },
      {
        key: 'versions',
        name: 'Versions',
        width: 85,
        sortValue: row => row.versions ?? 0,
        render: row => count(row.versions),
      },
      {
        key: 'dependencies',
        name: 'Dependencies',
        width: 110,
        sortValue: row => row.dependencies ?? 0,
        render: row => count(row.dependencies),
      },
      ...auxColumns,
      {
        key: 'action',
        name: 'Actions',
        width: 100,
        interactive: true,
        render: row => (
          <Center>
            <ArtifactRowActions
              artifact={row}
              processor={processor}
              onInspect={onInspect}
            />
          </Center>
        ),
      },
    ];
  }, [processor, onInspect, isSelected, onToggleSelected]);
};
