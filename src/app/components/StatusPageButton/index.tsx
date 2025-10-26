/**
 *
 * ValidateAllButton
 *
 */
import { Button } from '@blueprintjs/core';
import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';

interface Props {}

export const StatusPageButton = memo((props: Props) => {
  const nav = useNavigate();
  return (
    <Button icon="heart" onClick={() => nav('/status/')} minimal>
      Status
    </Button>
  );
});
