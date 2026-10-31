import { FormGroup, InputGroup } from '@blueprintjs/core';
import React, { memo } from 'react';
import { AuxField } from 'types/AuxField';

interface Props {
  value: string;
  field: AuxField;
  idPrefix: string;
  onChange: (value: string) => void;
}

export const StringInput = memo(
  ({ value, field, idPrefix, onChange }: Props) => {
    const id = `${idPrefix}-${field.key}`;
    return (
      <FormGroup
        label={field.name}
        labelFor={id}
        helperText={`Config key: ${field.key}`}
        style={{ marginBottom: 8 }}
      >
        <InputGroup
          id={id}
          fill
          value={value || ''}
          onChange={e => onChange(e.currentTarget.value)}
          placeholder={field.placeholder}
        />
      </FormGroup>
    );
  },
);
