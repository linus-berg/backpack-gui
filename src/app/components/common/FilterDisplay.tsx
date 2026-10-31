import React from 'react';
import { Classes, Code, Intent, Tag } from '@blueprintjs/core';
import { compileFilter } from 'utils/versionFilter';

/**
 * Shows an artifact's version filter: "All versions" when empty, the regex
 * when valid, and a clear warning when it can't be parsed (the backend can't
 * collect such an artifact).
 */
export const FilterDisplay = ({ filter }: { filter?: string | null }) => {
  const compiled = compileFilter(filter);
  if (compiled.kind === 'all') {
    return <span className={Classes.TEXT_MUTED}>All versions</span>;
  }
  if (compiled.kind === 'invalid') {
    return (
      <Tag
        minimal
        intent={Intent.DANGER}
        icon="warning-sign"
        htmlTitle={`Invalid regular expression: ${compiled.error}`}
        style={{ fontFamily: 'monospace' }}
      >
        {filter}
      </Tag>
    );
  }
  return <Code>{filter}</Code>;
};
