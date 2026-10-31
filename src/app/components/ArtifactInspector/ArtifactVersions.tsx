/**
 *
 * Artifact versions
 *
 */
import React, { memo, useMemo, useState } from 'react';
import {
  Button,
  Checkbox,
  Classes,
  HTMLTable,
  Icon,
  InputGroup,
  Intent,
} from '@blueprintjs/core';
import styled from 'styled-components';
import { Artifact } from 'types';
import { ArtifactVersion } from 'types/ArtifactVersion';
import { compareVersionsDesc } from 'utils/versions';
import { CompiledFilter, matchesFilter } from 'utils/versionFilter';
import { ScrollTableContainer } from 'app/components/ScrollTableContainer';
import { EmptyState } from 'app/components/common/States';
import { ArtifactFileInspector } from './ArtifactFileInspector';

interface Props {
  artifact: Artifact;
  compiled: CompiledFilter;
}

const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 16px;
  margin-top: 10px;

  .${Classes.CONTROL} {
    margin-bottom: 0;
  }
`;

const MatchIcon = ({
  compiled,
  version,
}: {
  compiled: CompiledFilter;
  version: string;
}) => {
  const match = matchesFilter(compiled, version);
  const label =
    compiled.kind === 'all'
      ? 'Collected (no filter)'
      : match === null
      ? 'Unknown: the filter is invalid'
      : match
      ? 'Matches the filter: collected'
      : 'Filtered out: not collected';
  return (
    <Icon
      icon={match === null ? 'help' : match ? 'tick-circle' : 'disable'}
      intent={match ? Intent.SUCCESS : Intent.NONE}
      className={match ? undefined : Classes.TEXT_MUTED}
      title={label}
      htmlTitle={label}
    />
  );
};

export const ArtifactVersions = memo(({ artifact, compiled }: Props) => {
  const [search, setSearch] = useState('');
  const [onlyMatching, setOnlyMatching] = useState(false);
  const [openVersion, setOpenVersion] = useState<ArtifactVersion | null>(null);

  const versions = useMemo(
    () =>
      Object.values(artifact.versions ?? {}).sort((a, b) =>
        compareVersionsDesc(a.version, b.version),
      ),
    [artifact.versions],
  );

  const shown = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return versions.filter(
      v =>
        (!needle || v.version.toLowerCase().includes(needle)) &&
        (!onlyMatching || matchesFilter(compiled, v.version) === true),
    );
  }, [versions, search, onlyMatching, compiled]);

  if (versions.length === 0) {
    return (
      <EmptyState
        icon="variable"
        title="No versions recorded"
        description="Versions appear once Backpack has tracked this artifact. External and direct-collect processors don't record versions."
      />
    );
  }

  return (
    <div>
      <Toolbar>
        <InputGroup
          type="search"
          leftIcon="search"
          placeholder="Find a version…"
          aria-label="Find a version"
          value={search}
          onChange={e => setSearch(e.currentTarget.value)}
          style={{ width: 220 }}
        />
        {compiled.kind === 'regex' && (
          <Checkbox
            label="Only versions that match the filter"
            checked={onlyMatching}
            onChange={() => setOnlyMatching(!onlyMatching)}
          />
        )}
        <span className={Classes.TEXT_MUTED}>
          {shown.length === versions.length
            ? `${versions.length} versions, newest first`
            : `Showing ${shown.length} of ${versions.length}`}
        </span>
      </Toolbar>
      <ScrollTableContainer style={{ maxHeight: '50vh', marginTop: 10 }}>
        <HTMLTable condensed striped style={{ width: '100%' }}>
          <thead>
            <tr>
              <th style={{ width: 40 }}>
                <span className={Classes.TEXT_MUTED}>Filter</span>
              </th>
              <th>Version</th>
              <th style={{ textAlign: 'right' }}>Files</th>
            </tr>
          </thead>
          <tbody>
            {shown.map(version => {
              const fileCount = Object.keys(version.files ?? {}).length;
              return (
                <tr key={version.version}>
                  <td>
                    <MatchIcon compiled={compiled} version={version.version} />
                  </td>
                  <td style={{ fontWeight: 600 }}>{version.version}</td>
                  <td style={{ textAlign: 'right' }}>
                    <Button
                      small
                      minimal
                      icon="folder-open"
                      intent={Intent.PRIMARY}
                      disabled={fileCount === 0}
                      onClick={() => setOpenVersion(version)}
                      text={fileCount}
                      aria-label={`Show ${fileCount} files for ${version.version}`}
                    />
                  </td>
                </tr>
              );
            })}
            {shown.length === 0 && (
              <tr>
                <td colSpan={3} className={Classes.TEXT_MUTED}>
                  No versions match.
                </td>
              </tr>
            )}
          </tbody>
        </HTMLTable>
      </ScrollTableContainer>
      <ArtifactFileInspector
        artifactId={artifact.id}
        processor={artifact.processor}
        version={openVersion}
        onClose={() => setOpenVersion(null)}
      />
    </div>
  );
});
