/**
 *
 * ValidateAllButton
 *
 */
import { Button } from '@blueprintjs/core';
import React, { memo } from 'react';
import { useHistory } from 'react-router-dom';

interface Props {}

export const AdministrationButton = memo((props: Props) => {
  const history = useHistory();
  return (
    <Button
      intent="primary"
      icon="cog"
      onClick={() => history.push('/administration')}
    >
      Administration
    </Button>
  );
});
