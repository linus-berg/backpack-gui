import React from 'react';
import { Checkbox, Icon, Tooltip } from '@blueprintjs/core';
import styled from 'styled-components';

interface Props {
  directCollect: boolean;
  onDirectCollectChange: (value: boolean) => void;
  requiresApproval: boolean;
  onRequiresApprovalChange: (value: boolean) => void;
  multiAdd: boolean;
  onMultiAddChange: (value: boolean) => void;
}

const HelpIcon = styled(Icon)`
  margin-left: 8px;
  color: #abb3bf;
  cursor: help;
`;

export const ProcessorEditorSettings = ({
  directCollect,
  onDirectCollectChange,
  requiresApproval,
  onRequiresApprovalChange,
  multiAdd,
  onMultiAddChange,
}: Props) => {
  return (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Checkbox
          label="Direct Collect"
          checked={directCollect}
          onChange={() => onDirectCollectChange(!directCollect)}
          style={{ marginBottom: 0, marginTop: '1rem' }}
        />
        <Tooltip content="If enabled, the collector will fetch artifacts directly by ID instead of performing a full repository crawl." position="top">
          <HelpIcon icon="help" size={14} style={{ marginTop: '1rem' }} />
        </Tooltip>
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Checkbox
          label="Requires Approval"
          checked={requiresApproval}
          onChange={() => onRequiresApprovalChange(!requiresApproval)}
          style={{ marginBottom: 0, marginTop: '1rem' }}
        />
        <Tooltip content="New artifacts added to this processor must be approved by an administrator before they are mirrored." position="top">
          <HelpIcon icon="help" size={14} style={{ marginTop: '1rem' }} />
        </Tooltip>
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Checkbox
          label="Enable Bulk Add"
          checked={multiAdd}
          onChange={() => onMultiAddChange(!multiAdd)}
          style={{ marginBottom: 0, marginTop: '1rem' }}
        />
        <Tooltip content="Enables the 'Bulk Add' button in the processor panel for adding multiple artifacts via text input." position="top">
          <HelpIcon icon="help" size={14} style={{ marginTop: '1rem' }} />
        </Tooltip>
      </div>
    </div>
  );
};
