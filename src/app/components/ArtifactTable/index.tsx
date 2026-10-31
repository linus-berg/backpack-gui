/**
 *
 * ArtifactTable
 *
 */
import { Button, Menu, MenuItem } from '@blueprintjs/core';
import { orderBy } from 'lodash-es';
import { Cell, Column, ColumnHeaderCell, Table2 } from '@blueprintjs/table';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import './ArtifactTable.scss';
import { Processor } from '../../../types/Processor';
import { useArtifactSummaries } from 'api/queries';
import { filterArtifacts } from 'utils/filterUtils';
import { useDebouncedValue } from 'utils/hooks/useDebouncedValue';
import {
  EmptyState,
  LoadingState,
  QueryErrorState,
} from 'app/components/common/States';
import { useArtifactActions } from 'app/components/ArtifactActions/useArtifactActions';
import { ARTIFACT_ACTIONS } from 'app/components/ArtifactActions/actions';
import { useBrowserParams } from 'app/pages/ProcessorBrowser/useBrowserParams';
import { ArtifactTableToolbar } from './components/ArtifactTableToolbar';
import { useArtifactTableColumns } from './hooks/useArtifactTableColumns';

interface Props {
  processor: Processor;
}

type SortState = { key: string; dir: 'asc' | 'desc' };

export const ArtifactTable = memo(({ processor }: Props) => {
  const params = useBrowserParams();
  const { onlyRoots, deep, inspect, setQuery } = params;

  // Typing updates the input immediately; filtering and the URL follow
  // once typing pauses.
  const [searchInput, setSearchInput] = useState(params.query);
  const search = useDebouncedValue(searchInput, 250);
  useEffect(() => {
    if (search !== params.query) {
      setQuery(search);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);
  // ...and the input follows the URL when it changes from outside (Back button).
  useEffect(() => {
    if (params.query !== search) {
      setSearchInput(params.query);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.query]);

  const [sort, setSort] = useState<SortState>({ key: 'id', dir: 'asc' });
  const [selected, setSelected] = useState<Set<string>>(() => new Set());

  const query = useArtifactSummaries(processor.id, onlyRoots);

  const isSelected = useCallback((id: string) => selected.has(id), [selected]);
  const toggleSelected = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const columns = useArtifactTableColumns({
    processor,
    onInspect: inspect,
    isSelected,
    onToggleSelected: toggleSelected,
  });

  const [widths, setWidths] = useState<number[]>(() =>
    columns.map(c => c.width),
  );
  useEffect(() => {
    if (widths.length !== columns.length) {
      setWidths(columns.map(c => c.width));
    }
  }, [columns, widths.length]);

  const total = useMemo(() => {
    const data = query.data ?? [];
    return onlyRoots ? data.filter(a => a.root) : data;
  }, [query.data, onlyRoots]);

  const rows = useMemo(() => {
    const filtered = filterArtifacts(search, total, deep);
    const column = columns.find(c => c.key === sort.key);
    return column?.sortValue
      ? orderBy(filtered, [column.sortValue], [sort.dir])
      : filtered;
  }, [total, search, deep, columns, sort]);

  // Bulk actions only ever apply to rows the user can currently see.
  const selectedVisible = useMemo(
    () => rows.filter(r => selected.has(r.id)).map(r => r.id),
    [rows, selected],
  );

  const actions = useArtifactActions(processor);

  const onBulkAction = async (action: 'update' | 'validate' | 'delete') => {
    const ids = selectedVisible;
    const kind = action === 'update' ? actions.updateAction : action;
    const ok = await actions.run(kind, ids);
    if (ok && action === 'delete') {
      setSelected(new Set());
    }
  };

  const onSelectAll = (value: boolean) => {
    setSelected(value ? new Set(rows.map(r => r.id)) : new Set());
  };

  if (query.isLoading) {
    return <LoadingState label="Loading artifacts…" />;
  }
  if (query.isError && !query.data) {
    return (
      <QueryErrorState
        title="Couldn't load artifacts"
        error={query.error}
        onRetry={() => query.refetch()}
      />
    );
  }

  const renderHeader = (index: number) => {
    const column = columns[index];
    const indicator =
      sort.key === column.key ? (sort.dir === 'asc' ? ' ↑' : ' ↓') : '';
    return (
      <ColumnHeaderCell
        name={column.name + indicator}
        menuRenderer={
          column.sortValue
            ? () => (
                <Menu>
                  <MenuItem
                    icon="sort-asc"
                    text="Sort ascending"
                    onClick={() => setSort({ key: column.key, dir: 'asc' })}
                  />
                  <MenuItem
                    icon="sort-desc"
                    text="Sort descending"
                    onClick={() => setSort({ key: column.key, dir: 'desc' })}
                  />
                </Menu>
              )
            : undefined
        }
      />
    );
  };

  const renderCell = (rowIndex: number, columnIndex: number) => {
    const column = columns[columnIndex];
    const row = rows[rowIndex];
    return (
      <Cell
        interactive={column.interactive}
        className="artifact-table-cell"
        tooltip={column.tooltip?.(row)}
      >
        {column.render(row)}
      </Cell>
    );
  };

  return (
    <Div>
      <ArtifactTableToolbar
        shownCount={rows.length}
        totalCount={total.length}
        isFetching={query.isFetching}
        onlyRoots={onlyRoots}
        onOnlyRootsChange={params.setOnlyRoots}
        deepFilter={deep}
        onDeepFilterChange={params.setDeep}
        searchFilter={searchInput}
        onSearchFilterChange={setSearchInput}
        selectedCount={selectedVisible.length}
        onSelectAll={onSelectAll}
        onBulkAction={onBulkAction}
        updateLabel={ARTIFACT_ACTIONS[actions.updateAction].label}
        canCollect={actions.canCollect}
        canDelete={actions.canDelete}
      />

      {rows.length === 0 ? (
        search ? (
          <EmptyState
            icon="search"
            title="No matching artifacts"
            description={`Nothing in ${processor.id} matches “${search}”.${
              onlyRoots
                ? ' Dependencies are hidden; turn off “Roots only” to include them.'
                : ''
            }`}
            action={
              <Button text="Clear search" onClick={() => setSearchInput('')} />
            }
          />
        ) : (
          <EmptyState
            icon="cube"
            title="No artifacts yet"
            description={`Add the first ${processor.id} artifact with the form on the right.`}
          />
        )
      ) : (
        <TableWrapper>
          <Table2
            enableColumnResizing
            enableRowHeader={false}
            numFrozenColumns={2}
            defaultRowHeight={36}
            numRows={rows.length}
            columnWidths={widths.length === columns.length ? widths : undefined}
            onColumnWidthChanged={(index, size) =>
              setWidths(prev => prev.map((w, i) => (i === index ? size : w)))
            }
            cellRendererDependencies={[rows, columns, selected, sort]}
          >
            {columns.map(column => (
              <Column
                key={column.key}
                name={column.name}
                cellRenderer={renderCell}
                columnHeaderCellRenderer={renderHeader}
              />
            ))}
          </Table2>
        </TableWrapper>
      )}
    </Div>
  );
});

const Div = styled.div`
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
`;

const TableWrapper = styled.div`
  flex: 1;
  min-height: 0;
`;
