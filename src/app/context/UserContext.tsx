import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useBackpackApi } from 'api/backpack';
import { User } from 'types/User';
import { Spinner } from '@blueprintjs/core';

interface IUserContext {
  user: User | null;
  hasRole: (role: string) => boolean;
  isLoading: boolean;
}

const UserContext = createContext<IUserContext>({} as IUserContext);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const backpack = useBackpackApi();
  
  const { data, isLoading } = useQuery(['user_info'], backpack.GetUserInfo, {
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

  const user = data?.data || null;

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return user.roles.includes(role);
  };

  return (
    <UserContext.Provider value={{ user, hasRole, isLoading }}>
      {isLoading ? (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spinner size={50} />
        </div>
      ) : (
        children
      )}
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
