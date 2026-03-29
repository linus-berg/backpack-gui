import React, { memo } from 'react';
import { MenuItem } from '@blueprintjs/core';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

export const ApiKeyButton = memo(() => {
  const { hasRole } = useUser();
  const navigate = useNavigate();
  const isAdmin = hasRole('Administrator');

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
