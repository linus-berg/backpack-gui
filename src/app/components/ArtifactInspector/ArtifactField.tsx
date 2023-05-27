/**
 *
 * Artifact field
 *
 */
import React, { memo } from 'react';

interface Props {
  name: string;
  value: any;
}

export const ArtifactField = memo((props: Props) => {
  return (
    <div className="artifact-field-grid">
      <span className="artifact-field-name">{props.name}:</span>
      <span className="artifact-field-value">{props.value}</span>
    </div>
  );
});
