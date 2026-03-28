import React from 'react';
import { H3, Icon, Tooltip } from '@blueprintjs/core';
import Editor from '@monaco-editor/react';
import styled from 'styled-components';

interface Props {
  description: string;
  onDescriptionChange: (value: string) => void;
  config: string;
  onConfigChange: (value: string) => void;
}

const HelpIcon = styled(Icon)`
  margin-left: 8px;
  color: #abb3bf;
  cursor: help;
`;

export const ProcessorEditorFields = ({
  description,
  onDescriptionChange,
  config,
  onConfigChange,
}: Props) => {
  return (
    <div style={{ display: 'flex', gap: '1rem', flex: 1, marginTop: '1rem' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <H3 style={{ marginBottom: '0.5rem' }}>Description</H3>
          <Tooltip content="HTML documentation for this processor shown to users when adding artifacts." position="right">
            <HelpIcon icon="help" size={14} style={{ marginBottom: '0.5rem' }} />
          </Tooltip>
        </div>
        <Editor
          theme="vs-dark"
          onChange={value => onDescriptionChange(value ?? '')}
          language="html"
          height="100%"
          value={description}
        />
      </div>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '20rem',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <H3 style={{ marginBottom: '0.5rem' }}>Configuration (JSON)</H3>
          <Tooltip content="Technical configuration dictionary for the processor logic." position="right">
            <HelpIcon icon="help" size={14} style={{ marginBottom: '0.5rem' }} />
          </Tooltip>
        </div>
        <Editor
          theme="vs-dark"
          onChange={value => onConfigChange(value ?? '')}
          language="json"
          height="100%"
          value={config}
        />
      </div>
    </div>
  );
};
