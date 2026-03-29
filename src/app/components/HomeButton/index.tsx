import { Button } from '@blueprintjs/core';
import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';

export const HomeButton = memo(() => {
  const nav = useNavigate();
  return (
    <Button icon="home" onClick={() => nav('/')} minimal>
      Home
    </Button>
  );
});
