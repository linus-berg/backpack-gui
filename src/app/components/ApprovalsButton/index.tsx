import React from 'react';
import { Button, Intent } from '@blueprintjs/core';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

export const ApprovalsButton = () => {
  const { hasRole } = useUser();
  const navigate = useNavigate();
  const isAdmin = hasRole('Administrator');

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
