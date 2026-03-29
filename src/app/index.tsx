/**
 *
 * App
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 */

import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { Route, BrowserRouter, Routes, Navigate } from 'react-router-dom';

import { GlobalStyle } from 'styles/global-styles';

import { NotFoundPage } from './components/NotFoundPage/Loadable';
import { useTranslation } from 'react-i18next';
import './app.scss';
import { ProcessorBrowser } from './pages/ProcessorBrowser/Loadable';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FocusStyleManager } from '@blueprintjs/core';
import { Layout } from './Layout';
import { ProcessorConfig } from './pages/ProcessorConfig/Loadable';
import { useAuth } from 'react-oidc-context';
import { AxiosProvider } from 'api/backpack';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { StatusPage } from './pages/StatusPage/Loadable';
import { ApprovalsPage } from './pages/ApprovalsPage/Loadable';
import { ApiKeyPage } from './pages/ApiKeyPage/Loadable';
import { UserProvider, useUser } from './context/UserContext';

const query_client = new QueryClient();
FocusStyleManager.onlyShowFocusOnTabs();

const AppRoutes = () => {
  const { hasRole } = useUser();
  const isAdmin = hasRole('Administrator');

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/status" />} />
        <Route path="status" element={<StatusPage />}></Route>
        <Route path="processor">
          <Route index element={<ProcessorBrowser />} />
          <Route path=":processor" element={<ProcessorBrowser />} />
        </Route>
        <Route path="config">
          <Route index element={<ProcessorConfig />} />
          <Route path=":processor" element={<ProcessorConfig />} />
        </Route>
        {isAdmin && (
          <>
            <Route path="approvals" element={<ApprovalsPage />} />
            <Route path="apikeys" element={<ApiKeyPage />} />
          </>
        )}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export function App() {
  const { i18n } = useTranslation();
  const auth = useAuth();

  React.useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      auth.signinRedirect();
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.signinRedirect]);

  if (auth.isLoading || !auth.isAuthenticated) {
    return null;
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
          <UserProvider>
            <AppRoutes />
          </UserProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </AxiosProvider>
      <GlobalStyle />
    </BrowserRouter>
  );
}
