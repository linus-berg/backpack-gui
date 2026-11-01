import React, { MouseEvent, useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Classes, Icon, InputGroup, Tag } from '@blueprintjs/core';
import styled from 'styled-components';
import { Processor } from 'types/Processor';

interface Props {
  processors: Processor[];
  /** e.g. `/processor` or `/config`; items link to `${basePath}/${id}`. */
  basePath: string;
  /** Root artifact counts, shown when available. */
  counts?: Record<string, number | undefined>;
  /**
   * Called before navigating to another processor. Return false (or resolve
   * to false) to stay, e.g. when there are unsaved changes.
   */
  onBeforeNavigate?: () => boolean | Promise<boolean>;
  label: string;
  /**
   * `panel`: a full-height side panel with a heading, for pages where the
   * list is the main navigation (Artifacts). `inline` (default): a column
   * inside a page (Admin → Processors).
   */
  variant?: 'panel' | 'inline';
}

const Aside = styled.nav<{ $panel: boolean }>`
  width: ${p => (p.$panel ? '240px' : '230px')};
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-right: 1px solid var(--divider);
  overflow-y: auto;
  ${p =>
    p.$panel
      ? `
    height: 100%;
    box-sizing: border-box;
    padding: 1rem 12px 1rem 1.25rem;
    background: var(--card-bg);
  `
      : `
    padding-right: 12px;
  `}

  @media (max-width: 900px) {
    width: auto;
    border-right: none;
    border-bottom: 1px solid var(--table-border);
    padding: 0 0 8px;
    overflow: visible;
  }
`;

/* Same heading style as the Admin section's navigation. */
const PanelTitle = styled.div`
  margin: 4px 8px 2px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;

  @media (max-width: 900px) {
    flex-direction: row;
    overflow-x: auto;
  }
`;

const Item = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 3px;
  white-space: nowrap;

  /* && outranks Blueprint's '.bp6-dark a' link color. */
  &&,
  &&:hover {
    color: inherit;
    text-decoration: none;
  }
  &:hover {
    background: var(--hover-bg);
  }
  &.active {
    background: var(--active-bg);
    font-weight: 600;
  }
  .name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const Flag = ({
  icon,
  label,
}: {
  icon: 'shield' | 'share' | 'flash';
  label: string;
}) => (
  <Icon
    icon={icon}
    size={12}
    className={Classes.TEXT_MUTED}
    title={label}
    htmlTitle={label}
  />
);

/** Searchable list of processors that scales past a handful of tabs. */
export const ProcessorSidebar = ({
  processors,
  basePath,
  counts,
  onBeforeNavigate,
  label,
  variant = 'inline',
}: Props) => {
  const [filter, setFilter] = useState('');
  const navigate = useNavigate();

  const shown = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    return needle
      ? processors.filter(p => p.id.toLowerCase().includes(needle))
      : processors;
  }, [processors, filter]);

  const onClick = (e: MouseEvent, to: string) => {
    // Let modified clicks (new tab/window) through untouched.
    if (
      !onBeforeNavigate ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey
    ) {
      return;
    }
    e.preventDefault();
    Promise.resolve(onBeforeNavigate()).then(ok => ok && navigate(to));
  };

  return (
    <Aside aria-label={label} $panel={variant === 'panel'}>
      {variant === 'panel' && (
        <PanelTitle className={Classes.TEXT_MUTED}>{label}</PanelTitle>
      )}
      {processors.length > 6 && (
        <InputGroup
          type="search"
          size="small"
          leftIcon="search"
          placeholder="Find processor…"
          aria-label="Find processor"
          value={filter}
          onChange={e => setFilter(e.currentTarget.value)}
        />
      )}
      <List>
        {shown.map(p => {
          const to = `${basePath}/${encodeURIComponent(p.id)}`;
          return (
            <li key={p.id}>
              <Item to={to} onClick={e => onClick(e, to)}>
                <span className="name" title={p.id}>
                  {p.id}
                </span>
                {p.requires_approval && (
                  <Flag icon="shield" label="Requires approval" />
                )}
                {p.is_external && (
                  <Flag icon="share" label="Managed externally" />
                )}
                {p.direct_collect && (
                  <Flag icon="flash" label="Direct collect" />
                )}
                {counts?.[p.id] !== undefined && (
                  <Tag
                    minimal
                    round
                    htmlTitle={`${counts[p.id]} root artifacts`}
                  >
                    {counts[p.id]}
                  </Tag>
                )}
              </Item>
            </li>
          );
        })}
        {shown.length === 0 && (
          <li className={Classes.TEXT_MUTED} style={{ padding: 8 }}>
            No processors match.
          </li>
        )}
      </List>
    </Aside>
  );
};
