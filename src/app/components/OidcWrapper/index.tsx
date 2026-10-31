import React, { useCallback, useEffect, useState } from 'react';
import { AuthProvider, AuthProviderProps } from 'react-oidc-context';
import { Button } from '@blueprintjs/core';
import axios from 'axios';
import { BACKPACK_API } from 'api/config';
import { getErrorMessage } from 'utils/errors';
import { FullPageMessage, FullPageSpinner } from 'app/components/common/States';

export { BACKPACK_API };

export const OidcWrapper = ({ children }: { children: React.ReactNode }) => {
  const [config, setConfig] = useState<AuthProviderProps | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    axios
      .get(`${BACKPACK_API}/auth/oidc`)
      .then(res => {
        const oidcData = res.data;
        setConfig({
          authority: oidcData.authority,
          client_id: oidcData.client_id,
          redirect_uri: window.location.origin + '/',
          scope: 'openid profile roles',
          automaticSilentRenew: true,
          accessTokenExpiringNotificationTimeInSeconds: 30,
          onSigninCallback: () => {
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname,
            );
          },
        });
      })
      .catch(err => {
        console.error('Failed to fetch OIDC config', err);
        setError(getErrorMessage(err));
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  if (error) {
    return (
      <FullPageMessage
        icon="offline"
        title="Couldn't load the sign-in configuration"
        description={`${error} (${BACKPACK_API}/auth/oidc)`}
        action={
          <Button
            icon="refresh"
            text="Try again"
            loading={loading}
            onClick={load}
          />
        }
      />
    );
  }

  if (!config) {
    return <FullPageSpinner label="Loading…" />;
  }

  return <AuthProvider {...config}>{children}</AuthProvider>;
};
