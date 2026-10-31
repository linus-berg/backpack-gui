/**
 *
 * Artifact dependencies
 *
 */
import React, { memo, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Classes, HTMLTable, InputGroup, Tag } from '@blueprintjs/core';
import { sortBy } from 'lodash-es';
import { Artifact } from 'types';
import { ScrollTableContainer } from 'app/components/ScrollTableContainer';
import { EmptyState } from 'app/components/common/States';

interface Props {
  artifact: Artifact;
}

export const ArtifactDependencies = memo(({ artifact }: Props) => {
  const [search, setSearch] = useState('');
  const location = useLocation();
  const { processor: currentProcessor } = useParams();

  const dependencies = useMemo(
    () =>
      sortBy(Object.values(artifact.dependencies ?? {}), [
        d => d.processor,
        d => d.id.toLowerCase(),
      ]),
    [artifact.dependencies],
  );

  const shown = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return needle
      ? dependencies.filter(d => d.id.toLowerCase().includes(needle))
      : dependencies;
  }, [dependencies, search]);

  /** Links keep the current search/filters when staying on the same processor. */
  const linkTo = (processor: string, id: string) => {
    const params =
      processor === currentProcessor
        ? new URLSearchParams(location.search)
        : new URLSearchParams();
    params.set('artifact', id);
    return { pathname: `/processor/${processor}`, search: `?${params}` };
  };

  if (dependencies.length === 0) {
    return (
      <EmptyState
        icon="inheritance"
        title="No dependencies discovered"
        description="This artifact has no recorded dependencies."
      />
    );
  }

  return (
    <div>
      <InputGroup
        type="search"
        leftIcon="search"
        placeholder="Find a dependency…"
        aria-label="Find a dependency"
        value={search}
        onChange={e => setSearch(e.currentTarget.value)}
        style={{ width: 240, marginTop: 10 }}
      />
      <ScrollTableContainer style={{ maxHeight: '50vh', marginTop: 10 }}>
        <HTMLTable compact striped style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Processor</th>
              <th>Artifact ID</th>
            </tr>
          </thead>
          <tbody>
            {shown.map(dependency => (
              <tr key={`${dependency.processor}/${dependency.id}`}>
                <td>
                  <Tag minimal>{dependency.processor}</Tag>
                </td>
                <td style={{ fontFamily: 'monospace' }}>
                  <Link
                    to={linkTo(dependency.processor, dependency.id)}
                    title={`Open ${dependency.processor}/${dependency.id}`}
                  >
                    {dependency.id}
                  </Link>
                </td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr>
                <td colSpan={2} className={Classes.TEXT_MUTED}>
                  No dependencies match.
                </td>
              </tr>
            )}
          </tbody>
        </HTMLTable>
      </ScrollTableContainer>
    </div>
  );
});
