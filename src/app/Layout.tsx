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
import { StatusPageButton } from './components/StatusPageButton/Loadable';
import styled from 'styled-components/macro';
import LogoImage from './logo.png';
import { ThemeToggle } from './components/ThemeToggle';

const LogoBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;
const Logo = styled.img`
  height: 32px;
`;
const LogoText = styled.div`
  margin-left: 4px;
  display: inline-block;
`;
export function Layout() {
  const kc = useKeycloak();
  return (
    <>
      <Navbar>
        <Navbar.Group>
          <Navbar.Heading>
            <LogoBox>
              <Logo src={LogoImage} />
              <LogoText>Backpack</LogoText>
            </LogoBox>
          </Navbar.Heading>
          <Navbar.Divider />
          <StatusPageButton />
          <ProcessorBrowserButton />
          <ValidateAllButton />
          <TrackAllButton />
          <ConfigButton />
        </Navbar.Group>
        <Navbar.Group align={Alignment.RIGHT}>
          <ThemeToggle />
          <Button intent={Intent.DANGER} onClick={() => kc.keycloak.logout()}>
            Logout
          </Button>
        </Navbar.Group>
      </Navbar>
      <Outlet />
    </>
  );
}
