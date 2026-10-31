import React from 'react';
import {
  Button,
  Checkbox,
  Classes,
  Icon,
  InputGroup,
  Intent,
  Spinner,
} from '@blueprintjs/core';
import styled from 'styled-components';
import { HelpTip } from 'app/components/common/HelpTip';
import { ARTIFACT_ACTIONS } from 'app/components/ArtifactActions/actions';

const Bar = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 8px 16px;
  padding: 8px 0;
  border-bottom: 1px solid var(--table-border);
  margin-bottom: 8px;
  flex-shrink: 0;
`;

const Group = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 16px;

  .${Classes.CONTROL} {
    margin-bottom: 0;
  }
`;

const BulkBar = styled(Bar)`
  padding: 6px 10px;
  border: 1px solid var(--table-border);
  border-radius: 3px;
  background: var(--card-bg);
`;

interface Props {
  shownCount: number;
  totalCount: number;
  isFetching: boolean;
  onlyRoots: boolean;
  onOnlyRootsChange: (value: boolean) => void;
  deepFilter: boolean;
  onDeepFilterChange: (value: boolean) => void;
  searchFilter: string;
  onSearchFilterChange: (value: string) => void;
  /** Number of visible rows that are selected. */
  selectedCount: number;
  onSelectAll: (selected: boolean) => void;
  onBulkAction: (action: 'update' | 'validate' | 'delete') => void;
  updateLabel: string;
  canCollect: boolean;
  canDelete: boolean;
}

/** Search, filters and bulk actions above the artifact table. */
export const ArtifactTableToolbar = (props: Props) => {
  const {
    shownCount,
    totalCount,
    selectedCount,
    searchFilter,
    onSearchFilterChange,
  } = props;
  const allSelected = shownCount > 0 && selectedCount === shownCount;

  return (
    <>
      <Bar>
        <Group>
          <span aria-live="polite">
            <Icon icon="database" className={Classes.TEXT_MUTED} />{' '}
            <b>{shownCount}</b>
            {shownCount !== totalCount && <> of {totalCount}</>} artifacts
          </span>
          <Checkbox
            label="Select all"
            checked={allSelected}
            indeterminate={selectedCount > 0 && !allSelected}
            disabled={shownCount === 0}
            onChange={() => props.onSelectAll(!allSelected)}
          />
          <span>
            <Checkbox
              inline
              label="Roots only"
              checked={props.onlyRoots}
              onChange={() => props.onOnlyRootsChange(!props.onlyRoots)}
            />
            <HelpTip content="Show only artifacts that were added directly. Turn off to include dependencies Backpack discovered on its own." />
          </span>
          <span>
            <Checkbox
              inline
              label="Search config"
              checked={props.deepFilter}
              onChange={() => props.onDeepFilterChange(!props.deepFilter)}
            />
            <HelpTip content="Also match the search text against configuration values, not just IDs and filters." />
          </span>
          {props.isFetching && <Spinner size={16} aria-label="Refreshing" />}
        </Group>
        <div style={{ width: 300, maxWidth: '100%' }}>
          <InputGroup
            type="search"
            leftIcon="search"
            placeholder="Search artifacts…"
            aria-label="Search artifacts"
            value={searchFilter}
            onChange={e => onSearchFilterChange(e.currentTarget.value)}
            rightElement={
              searchFilter ? (
                <Button
                  minimal
                  icon="cross"
                  aria-label="Clear search"
                  onClick={() => onSearchFilterChange('')}
                />
              ) : undefined
            }
          />
        </div>
      </Bar>
      {selectedCount > 0 && (
        <BulkBar role="region" aria-label="Bulk actions">
          <Group>
            <b>{selectedCount} selected</b>
            {props.canCollect && (
              <>
                <Button
                  small
                  icon={
                    props.updateLabel === ARTIFACT_ACTIONS.track.label
                      ? ARTIFACT_ACTIONS.track.icon
                      : ARTIFACT_ACTIONS.forceCollect.icon
                  }
                  text={props.updateLabel}
                  onClick={() => props.onBulkAction('update')}
                />
                <Button
                  small
                  icon={ARTIFACT_ACTIONS.validate.icon}
                  text={ARTIFACT_ACTIONS.validate.label}
                  onClick={() => props.onBulkAction('validate')}
                />
              </>
            )}
            {props.canDelete && (
              <Button
                small
                intent={Intent.DANGER}
                icon={ARTIFACT_ACTIONS.delete.icon}
                text={`${ARTIFACT_ACTIONS.delete.label}…`}
                onClick={() => props.onBulkAction('delete')}
              />
            )}
          </Group>
          <Button
            small
            minimal
            text="Clear selection"
            onClick={() => props.onSelectAll(false)}
          />
        </BulkBar>
      )}
    </>
  );
};
