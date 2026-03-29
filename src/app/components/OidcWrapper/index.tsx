import React, { useEffect, useState } from 'react';
import { AuthProvider, AuthProviderProps } from 'react-oidc-context';
import { Spinner } from '@blueprintjs/core';
import axios from 'axios';

export const BACKPACK_API =
  window.location.protocol + '//' + window.location.hostname + ':8004/api';

export const OidcWrapper = ({ children }: { children: React.ReactNode }) => {
  const [config, setConfig] = useState<AuthProviderProps | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get(`${BACKPACK_API}/auth/oidc`)
      .then(res => {
        const oidcData = res.data;
        setConfig({
          authority: oidcData.authority,
          client_id: oidcData.client_id,
          redirect_uri: window.location.origin + '/',
          scope: 'openid profile roles',
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
        setError('Failed to load authentication configuration.');
      });
  }, []);

  if (error) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'red',
        }}
      >
        {error}
      </div>
    );
  }

  if (!config) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Spinner size={50} />
      </div>
    );
  }

  return <AuthProvider {...config}>{children}</AuthProvider>;
};
