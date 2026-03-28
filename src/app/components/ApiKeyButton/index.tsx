import React, { memo } from 'react';
import { MenuItem } from '@blueprintjs/core';
import { useNavigate } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak-fork/web';

export const ApiKeyButton = memo(() => {
  const { keycloak } = useKeycloak();
  const navigate = useNavigate();
  const isAdmin = keycloak.hasResourceRole('Administrator');

  if (!isAdmin) {
    return null;
  }

  return (
    <MenuItem
      icon="key"
      text="Manage API Keys"
      onClick={() => navigate('/apikeys')}
    />
  );
});
