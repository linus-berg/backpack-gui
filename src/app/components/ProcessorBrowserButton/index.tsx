/**
 *
 * ValidateAllButton
 *
 */
import { Button } from '@blueprintjs/core';
import React, { memo } from 'react';
import { useHistory } from 'react-router-dom';

interface Props {}

export const ProcessorBrowserButton = memo((props: Props) => {
  const history = useHistory();
  return (
    <Button
      intent="primary"
      icon="search"
      onClick={() => history.push('/browser')}
    >
      Browser
    </Button>
  );
});
