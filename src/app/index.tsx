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

import { HomePage } from './pages/HomePage/Loadable';
import { NotFoundPage } from './components/NotFoundPage/Loadable';
import { useTranslation } from 'react-i18next';
import './app.scss';
import { ModuleBrowser } from './pages/ModuleBrowser';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Button, Navbar, NavbarDivider } from '@blueprintjs/core';

const query_client = new QueryClient();

export function App() {
  const { i18n } = useTranslation();
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
            <Navbar.Divider />
            <Button minimal>Input</Button>
            <Button minimal>Browser</Button>
          </Navbar.Group>
        </Navbar>
        <Switch>
          <Route exact path="/" component={ModuleBrowser} />
          <Route component={NotFoundPage} />
        </Switch>
      </QueryClientProvider>
      <GlobalStyle />
    </BrowserRouter>
  );
}
