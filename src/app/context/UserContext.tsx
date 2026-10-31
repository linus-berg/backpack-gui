import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@blueprintjs/core';
import { useBackpackApi } from 'api/backpack';
import { queryKeys } from 'api/queries';
import { User } from 'types/User';
import { getErrorMessage } from 'utils/errors';
import { FullPageMessage, FullPageSpinner } from 'app/components/common/States';

interface IUserContext {
  user: User | null;
  hasRole: (role: string) => boolean;
  isLoading: boolean;
}

const UserContext = createContext<IUserContext | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const backpack = useBackpackApi();

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: queryKeys.user,
    queryFn: backpack.GetUserInfo,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

  const user = data?.data || null;

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return user.roles.includes(role);
  };

  if (isLoading) {
    return <FullPageSpinner label="Loading your account…" />;
  }

  // Without roles the UI would silently hide admin features, so say so.
  if (isError && !user) {
    return (
      <FullPageMessage
        icon="offline"
        title="Couldn't load your account"
        description={getErrorMessage(error)}
        action={
          <Button
            icon="refresh"
            text="Try again"
            loading={isFetching}
            onClick={() => refetch()}
          />
        }
      />
    );
  }

  return (
    <UserContext.Provider value={{ user, hasRole, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
