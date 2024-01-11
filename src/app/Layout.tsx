import * as React from 'react';
import { Outlet } from 'react-router-dom';

import './app.scss';
import {
  Alignment,
  Button,
  ButtonGroup,
  Intent,
  Navbar,
} from '@blueprintjs/core';
import { ValidateAllButton } from './components/ValidateAllButton/Loadable';
import { TrackAllButton } from './components/TrackAllButton/Loadable';
import { ConfigButton } from './components/ConfigButton/Loadable';
import { ProcessorBrowserButton } from './components/ProcessorBrowserButton';
import { useKeycloak } from '@react-keycloak-fork/web';

export function Layout() {
  const kc = useKeycloak();
  return (
    <>
      <Navbar>
        <Navbar.Group>
          <Navbar.Heading>Artifact Processing Complex</Navbar.Heading>
          <Navbar.Divider />
          <ButtonGroup>
            <ProcessorBrowserButton />
            <ValidateAllButton />
            <TrackAllButton />
            <ConfigButton />
          </ButtonGroup>
        </Navbar.Group>
        <Navbar.Group align={Alignment.RIGHT}>
          <Button intent={Intent.DANGER} onClick={() => kc.keycloak.logout()}>
            Logout
          </Button>
        </Navbar.Group>
      </Navbar>
      <Outlet />
    </>
  );
}
