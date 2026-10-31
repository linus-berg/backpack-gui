import { Checkbox, FormGroup } from '@blueprintjs/core';
import React, { memo } from 'react';
import { AuxField } from 'types/AuxField';

interface Props {
  value: string;
  field: AuxField;
  onChange: (value: string) => void;
}

export const BoolInput = memo(({ value, field, onChange }: Props) => (
  <FormGroup
    label={field.name}
    helperText={`Config key: ${field.key}`}
    style={{ marginBottom: 8 }}
  >
    <Checkbox
      checked={value === 'true'}
      label={field.placeholder || 'Enabled'}
      onChange={e => onChange(e.currentTarget.checked ? 'true' : 'false')}
      style={{ marginBottom: 0 }}
    />
  </FormGroup>
));
