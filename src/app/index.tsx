/**
 *
 * App
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 */

import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { Route, BrowserRouter, Routes } from 'react-router-dom';

import { GlobalStyle } from 'styles/global-styles';

import { NotFoundPage } from './components/NotFoundPage/Loadable';
import { useTranslation } from 'react-i18next';
import './app.scss';
import { ProcessorBrowser } from './pages/ProcessorBrowser/Loadable';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FocusStyleManager } from '@blueprintjs/core';
import { Layout } from './Layout';
import { ProcessorConfig } from './pages/ProcessorConfig/Loadable';
import { useKeycloak } from '@react-keycloak-fork/web';
import { AxiosProvider } from 'api/apc';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const query_client = new QueryClient();
FocusStyleManager.onlyShowFocusOnTabs();

export function App() {
  const { i18n } = useTranslation();
  const { keycloak, initialized } = useKeycloak();

  if (initialized) {
    if (!keycloak?.authenticated) {
      keycloak.login();
    }
  }

  return (
    <BrowserRouter>
      <Helmet
        titleTemplate="%s - Backpack"
        defaultTitle="Backpack"
        htmlAttributes={{ lang: i18n.language }}
      >
        <meta name="description" content="A artifact application" />
      </Helmet>
      <AxiosProvider>
        <QueryClientProvider client={query_client}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route path="processor">
                <Route index element={<ProcessorBrowser />} />
                <Route path=":processor" element={<ProcessorBrowser />} />
              </Route>
              <Route path="config">
                <Route index element={<ProcessorConfig />} />
                <Route path=":processor" element={<ProcessorConfig />} />
              </Route>
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </AxiosProvider>
      <GlobalStyle />
    </BrowserRouter>
  );
}
