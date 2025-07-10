import { useQuery } from '@tanstack/react-query';
import { APC_API, APC_HOST, useApcApi } from './apc';
import React, { createContext, useContext } from 'react';

import User from '../types/User';
import { Spinner } from '@blueprintjs/core';

const authContext = createContext<User>(new User());

interface IProps {
  children: JSX.Element[] | JSX.Element;
}
export const AuthProvider = (props: IProps) => {
  const apc = useApcApi();
  const query = useQuery(['auth_me'], apc.GetMe, {
    retry: false,
  });

  if (query.error) {
    window.location.href =
      APC_API + '/auth/login?returnUrl=' + window.location.href;
  }

  if (query.isLoading || query.data === undefined) {
    return <Spinner />;
  }

  const user: User = new User();
  user.name = query.data.name;
  user.roles = query.data.roles;

  return (
    <authContext.Provider value={user}>{props.children}</authContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(authContext);
};
