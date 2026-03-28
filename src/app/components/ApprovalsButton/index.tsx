import React from 'react';
import { Button, Intent } from '@blueprintjs/core';
import { useNavigate } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak-fork/web';

export const ApprovalsButton = () => {
  const { keycloak } = useKeycloak();
  const navigate = useNavigate();
  const isAdmin = keycloak.hasResourceRole('Administrator');

  if (!isAdmin) {
    return null;
  }

  return (
    <Button
      icon="confirm"
      text="Approvals"
      minimal
      onClick={() => navigate('/approvals')}
    />
  );
};
