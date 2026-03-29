import { InputGroup, H6 } from '@blueprintjs/core';
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

const FieldHeader = styled(H6)`
  margin: 0;
  margin-bottom: 4px;
  font-size: 0.75rem;
  color: #5c7080;

  span {
    color: #abb3bf;
    font-weight: 400;
    margin-left: 4px;
  }
`;

export const StringInput = memo((props: Props) => {
  const OnChange = evt => props.onChange(evt.currentTarget.value);
  const field = props.field;

  return (
    <div style={{ marginBottom: '8px' }}>
      <FieldHeader>
        {field.name} <span>(key: {field.key})</span>
      </FieldHeader>
      <FormRow>
        <InputGroup
          fill
          value={props.value || ''}
          onChange={OnChange}
          placeholder={field.placeholder}
        />
        {/* Placeholder for help icon to maintain alignment with main inputs */}
        <div style={{ width: '14px', marginLeft: '8px' }} />
      </FormRow>
    </div>
  );
});
