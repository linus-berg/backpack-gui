/**
 *
 * App
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 */

import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { Switch, Route, BrowserRouter } from 'react-router-dom';

import { GlobalStyle } from 'styles/global-styles';

import { NotFoundPage } from './components/NotFoundPage/Loadable';
import { useTranslation } from 'react-i18next';
import './app.scss';
import { ProcessorBrowser } from './pages/ProcessorBrowser/Loadable';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ButtonGroup, FocusStyleManager, Navbar } from '@blueprintjs/core';
import { ValidateAllButton } from './components/ValidateAllButton/Loadable';
import { TrackAllButton } from './components/TrackAllButton/Loadable';
import { Administration } from './pages/Administration';
import { AdministrationButton } from './components/AdministrationButton';
import { ProcessorBrowserButton } from './components/ProcessorBrowserButton';

const query_client = new QueryClient();
FocusStyleManager.onlyShowFocusOnTabs();

export function App() {
  const { i18n } = useTranslation();
  const [is_open, SetOpen] = React.useState(false);
  return (
    <BrowserRouter>
      <Helmet
        titleTemplate="%s - React Boilerplate"
        defaultTitle="React Boilerplate"
        htmlAttributes={{ lang: i18n.language }}
      >
        <meta name="description" content="A React Boilerplate application" />
      </Helmet>
      <QueryClientProvider client={query_client}>
        <Navbar>
          <Navbar.Group>
            <Navbar.Heading>Artifact Processing Complex</Navbar.Heading>
            <Navbar.Divider />
            <ButtonGroup>
              <ProcessorBrowserButton />
              <ValidateAllButton />
              <TrackAllButton />
              <AdministrationButton />
            </ButtonGroup>
          </Navbar.Group>
        </Navbar>
        <Switch>
          <Route exact path="/browser">
            <ProcessorBrowser />
          </Route>
          <Route path="/administration">
            <Administration />
          </Route>
          <Route component={NotFoundPage} />
        </Switch>
      </QueryClientProvider>
      <GlobalStyle />
    </BrowserRouter>
  );
}
