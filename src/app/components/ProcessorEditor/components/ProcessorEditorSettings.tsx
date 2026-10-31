import React from 'react';
import { Checkbox, Classes } from '@blueprintjs/core';
import styled from 'styled-components';
import { HelpTip } from 'app/components/common/HelpTip';
import {
  PROCESSOR_FLAGS,
  ProcessorFlag,
  ProcessorFlags,
} from '../processorFlags';

interface Props {
  values: ProcessorFlags;
  onChange: (flag: ProcessorFlag, value: boolean) => void;
  /** Limit to flags the API accepts when creating a processor. */
  createOnly?: boolean;
  layout?: 'row' | 'column';
}

const Flags = styled.div<{ $column: boolean }>`
  display: flex;
  flex-direction: ${p => (p.$column ? 'column' : 'row')};
  flex-wrap: wrap;
  gap: ${p => (p.$column ? '4px' : '8px 24px')};
  margin-top: 1rem;

  .${Classes.CONTROL} {
    margin-bottom: 0;
  }
`;

/** Processor switches, each with an explanation. */
export const ProcessorEditorSettings = ({
  values,
  onChange,
  createOnly,
  layout = 'row',
}: Props) => (
  <Flags $column={layout === 'column'}>
    {PROCESSOR_FLAGS.filter(f => !createOnly || f.onCreate).map(flag => (
      <div key={flag.key} style={{ display: 'flex', alignItems: 'center' }}>
        <Checkbox
          label={flag.label}
          checked={values[flag.key]}
          onChange={() => onChange(flag.key, !values[flag.key])}
        />
        <HelpTip content={flag.help} label={`About ${flag.label}`} />
      </div>
    ))}
  </Flags>
);
