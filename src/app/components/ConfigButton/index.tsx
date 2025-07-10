/**
 *
 * ValidateAllButton
 *
 */
import { Button } from '@blueprintjs/core';
import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../api/AuthProvider';

interface Props {}

export const ConfigButton = memo((props: Props) => {
  const auth = useAuth();
  const nav = useNavigate();
  if (!auth.HasRole('Administrator')) {
    return null;
  }
  return (
    <Button intent="primary" icon="cog" onClick={() => nav('/config')}>
      Config
    </Button>
  );
});
