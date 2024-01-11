/**
 *
 * SearchBar
 *
 */
import { Button, InputGroup } from '@blueprintjs/core';
import { useMutation } from '@tanstack/react-query';
import { useApcApi } from 'api/apc';
import React, { memo } from 'react';
import { useKeycloak } from '@react-keycloak-fork/web';
import { Artifact } from 'types';

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
