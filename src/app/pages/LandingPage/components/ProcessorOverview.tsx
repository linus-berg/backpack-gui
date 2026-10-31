import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Classes, H5, Icon, Tag } from '@blueprintjs/core';
import styled from 'styled-components';
import { useProcessors, useRootArtifactCounts } from 'api/queries';
import { LoadingState, QueryErrorState } from 'app/components/common/States';

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;

  li + li {
    border-top: 1px solid var(--table-border);
  }
  && a {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 4px;
    color: inherit;
    text-decoration: none;
  }
  && a:hover {
    background: var(--hover-bg);
  }
  .name {
    flex: 1;
    font-weight: 600;
  }
`;

/** Processors with their root artifact counts, linking into the browser. */
export const ProcessorOverview = () => {
  const processors = useProcessors();
  const counts = useRootArtifactCounts(processors.data);

  return (
    <Card>
      <H5>
        <Icon icon="layers" style={{ marginRight: 8 }} />
        Processors
      </H5>
      {processors.isLoading ? (
        <LoadingState />
      ) : processors.isError ? (
        <QueryErrorState
          error={processors.error}
          onRetry={() => processors.refetch()}
        />
      ) : (processors.data ?? []).length === 0 ? (
        <p className={Classes.TEXT_MUTED}>No processors are configured yet.</p>
      ) : (
        <List>
          {(processors.data ?? []).map(p => (
            <li key={p.id}>
              <Link to={`/processor/${encodeURIComponent(p.id)}`}>
                <span className="name">{p.id}</span>
                {p.requires_approval && (
                  <Tag minimal icon="shield">
                    approval
                  </Tag>
                )}
                {p.is_external && (
                  <Tag minimal icon="share">
                    external
                  </Tag>
                )}
                <span className={Classes.TEXT_MUTED}>
                  {counts[p.id] === undefined
                    ? '…'
                    : `${counts[p.id]} root artifacts`}
                </span>
                <Icon icon="chevron-right" className={Classes.TEXT_MUTED} />
              </Link>
            </li>
          ))}
        </List>
      )}
    </Card>
  );
};
