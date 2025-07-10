/**
 *
 * SearchBar
 *
 */
import { InputGroup } from '@blueprintjs/core';
import React, { memo } from 'react';

interface Props {
  value: string;
  onChange: (filter: string) => void;
}

export const SearchBar = memo((props: Props) => {
  return (
    <InputGroup
      value={props.value}
      onChange={evt => props.onChange(evt.currentTarget.value)}
    />
  );
});
