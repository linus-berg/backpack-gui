import {
  InputGroup,
} from '@blueprintjs/core';
import React, { memo } from 'react';
import styled from 'styled-components';
import { AuxField } from 'types/AuxField';

interface Props {
  value: string;
  field: AuxField;
  onChange: (value: string) => void;
}

const FormRow = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`;

export const StringInput = memo((props: Props) => {
  const OnChange = evt => props.onChange(evt.currentTarget.value);
  const field = props.field;
  return (
    <FormRow>
      <InputGroup
        fill
        value={props.value}
        onChange={OnChange}
        placeholder={field.placeholder}
      />
      {/* Placeholder for help icon to maintain alignment */}
      <div style={{ width: '14px', marginLeft: '8px' }} />
    </FormRow>
  );
});
