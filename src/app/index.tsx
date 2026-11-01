/**
 *
 * App
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 */

import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Navigate,
  Route,
  BrowserRouter,
  Routes,
  useParams,
} from 'react-router-dom';
import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import {
  BlueprintProvider,
  Button,
  FocusStyleManager,
} from '@blueprintjs/core';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';

import { GlobalStyle } from 'styles/global-styles';
import { AxiosProvider } from 'api/backpack';
import { getErrorMessage } from 'utils/errors';
import { notify } from 'utils/toaster';
import { NotFoundPage } from './components/NotFoundPage/Loadable';
import { FullPageMessage, FullPageSpinner } from './components/common/States';
import { RequireAdmin } from './components/common/RequireAdmin';
import { ProcessorBrowser } from './pages/ProcessorBrowser/Loadable';
import { ProcessorConfig } from './pages/ProcessorConfig/Loadable';
import { StatusPage } from './pages/StatusPage/Loadable';
import { ApprovalsPage } from './pages/ApprovalsPage/Loadable';
import { ApiKeyPage } from './pages/ApiKeyPage/Loadable';
import {
  AdminLayout,
  AnnouncementsPage,
  SchedulesPage,
  SystemTasksPage,
  JobsPage,
} from './pages/Admin/Loadable';
import { LandingPage } from './pages/LandingPage';
import { Layout } from './Layout';
import { UserProvider } from './context/UserContext';
import { ConfirmProvider } from './context/ConfirmContext';
import { ThemeProvider } from './context/ThemeContext';
import './app.scss';

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: {
      /** Prefix for the error toast, e.g. "Could not save npm". */
      errorTitle?: string;
      /** Set when the caller reports errors itself. */
      skipErrorToast?: boolean;
    };
  }
}

const query_client = new QueryClient({
  // Every failed mutation is reported, so no action can fail silently.
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.meta?.skipErrorToast) {
        return;
      }
      const title = mutation.meta?.errorTitle;
      const message = getErrorMessage(error);
      notify.error(title ? `${title}: ${message}` : message);
    },
  }),
});
FocusStyleManager.onlyShowFocusOnTabs();

/** Old /config/:processor links open the processor under Admin. */
const LegacyConfigRedirect = () => {
  const { processor } = useParams();
  return (
    <Navigate
      to={`/admin/processors/${encodeURIComponent(processor ?? '')}`}
      replace
    />
  );
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Layout />}>
      <Route index element={<LandingPage />} />
      <Route path="status" element={<StatusPage />} />
      <Route path="processor">
        <Route index element={<ProcessorBrowser />} />
        <Route path=":processor" element={<ProcessorBrowser />} />
      </Route>
      <Route
        path="approvals"
        element={
          <RequireAdmin>
            <ApprovalsPage />
          </RequireAdmin>
        }
      />
      <Route
        path="admin"
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<Navigate to="processors" replace />} />
        <Route path="processors" element={<ProcessorConfig />} />
        <Route path="processors/:processor" element={<ProcessorConfig />} />
        <Route path="schedules" element={<SchedulesPage />} />
        <Route path="api-keys" element={<ApiKeyPage />} />
        <Route path="announcements" element={<AnnouncementsPage />} />
        <Route path="tasks" element={<SystemTasksPage />} />
        <Route path="jobs" element={<JobsPage />} />
      </Route>
      {/* Locations before the Admin section, kept for bookmarks. */}
      <Route
        path="config"
        element={<Navigate to="/admin/processors" replace />}
      />
      <Route path="config/:processor" element={<LegacyConfigRedirect />} />
      <Route
        path="apikeys"
        element={<Navigate to="/admin/api-keys" replace />}
      />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes>
);

export function App() {
  const { i18n } = useTranslation();
  const auth = useAuth();

  React.useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated && !auth.error) {
      auth.signinRedirect();
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.error, auth.signinRedirect]);

  if (auth.error) {
    return (
      <ThemeProvider>
        <FullPageMessage
          icon="lock"
          title="Sign-in failed"
          description={auth.error.message}
          action={
            <Button
              icon="log-in"
              intent="primary"
              text="Try again"
              onClick={() => auth.signinRedirect()}
            />
          }
        />
      </ThemeProvider>
    );
  }

  if (auth.isLoading || !auth.isAuthenticated) {
    return <FullPageSpinner label="Signing in…" />;
  }

  return (
    // BlueprintProvider supplies hotkeys (used by the artifact table),
    // overlay stacking and portal context.
    <BlueprintProvider>
      <ThemeProvider>
        <BrowserRouter
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <Helmet
            titleTemplate="%s - Backpack"
            defaultTitle="Backpack"
            htmlAttributes={{ lang: i18n.language }}
          >
            <meta
              name="description"
              content="Backpack mirrors software packages and their dependencies for offline and air-gapped use."
            />
          </Helmet>
          <AxiosProvider>
            <QueryClientProvider client={query_client}>
              <ConfirmProvider>
                <UserProvider>
                  <AppRoutes />
                </UserProvider>
              </ConfirmProvider>
              {import.meta.env.DEV && (
                <ReactQueryDevtools initialIsOpen={false} />
              )}
            </QueryClientProvider>
          </AxiosProvider>
          <GlobalStyle />
        </BrowserRouter>
      </ThemeProvider>
    </BlueprintProvider>
  );
}
