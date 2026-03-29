/**
 *
 * ValidateAllButton
 *
 */
import { Button } from '@blueprintjs/core';
import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

interface Props {}

export const ConfigButton = memo((props: Props) => {
  const { hasRole } = useUser();
  const nav = useNavigate();
  if (!hasRole('Administrator')) {
    return null;
  }
  return (
    <Button icon="cog" onClick={() => nav('/config')} minimal>
      Config
    </Button>
  );
});
