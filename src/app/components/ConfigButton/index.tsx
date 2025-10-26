/**
 *
 * ValidateAllButton
 *
 */
import { Button } from '@blueprintjs/core';
import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak-fork/web';

interface Props {}

export const ConfigButton = memo((props: Props) => {
  const { keycloak } = useKeycloak();
  const nav = useNavigate();
  if (!keycloak.hasResourceRole('Administrator')) {
    return null;
  }
  return (
    <Button icon="cog" onClick={() => nav('/config')} minimal>
      Config
    </Button>
  );
});
