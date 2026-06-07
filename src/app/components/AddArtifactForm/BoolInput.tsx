import { Checkbox, H6 } from '@blueprintjs/core';
import React, { memo } from 'react';
import styled from 'styled-components';
import { AuxField } from 'types/AuxField';

interface Props {
  value: string;
  field: AuxField;
  onChange: (value: string) => void;
}

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

export const BoolInput = memo((props: Props) => {
  const OnChange = (evt: React.ChangeEvent<HTMLInputElement>) =>
    props.onChange(evt.currentTarget.checked ? 'true' : 'false');
  const field = props.field;

  return (
    <div style={{ marginBottom: '8px' }}>
      <FieldHeader>
        {field.name} <span>(key: {field.key})</span>
      </FieldHeader>
      <Checkbox
        checked={props.value === 'true'}
        label={field.placeholder || 'Enabled'}
        onChange={OnChange}
      />
    </div>
  );
});
