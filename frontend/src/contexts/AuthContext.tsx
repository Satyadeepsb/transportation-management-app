import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { LOGIN_MUTATION, REGISTER_MUTATION, GET_ME_QUERY } from '../graphql/auth';
import type { User, LoginInput, RegisterInput, AuthResponse } from '../types';
import { apolloClient } from '../lib/apollo-client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Get current user on mount
  const { data: meData, loading: meLoading } = useQuery(GET_ME_QUERY, {
    skip: !localStorage.getItem('token'),
    onError: () => {
      // Token invalid, clear it
      localStorage.removeItem('token');
      setUser(null);
    },
  });

  const [loginMutation] = useMutation<{ login: AuthResponse }>(LOGIN_MUTATION);
  const [registerMutation] = useMutation<{ register: AuthResponse }>(REGISTER_MUTATION);

  useEffect(() => {
    if (meData?.me) {
      setUser(meData.me);
    }
    setLoading(meLoading);
  }, [meData, meLoading]);

  const login = async (input: LoginInput) => {
    try {
      const { data } = await loginMutation({
        variables: input,
      });

      if (data?.login) {
        localStorage.setItem('token', data.login.accessToken);
        setUser(data.login.user);

        // Reset Apollo cache to refetch protected queries
        await apolloClient.resetStore();
      }
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const register = async (input: RegisterInput) => {
    try {
      const { data } = await registerMutation({
        variables: input,
      });

      if (data?.register) {
        localStorage.setItem('token', data.register.accessToken);
        setUser(data.register.user);

        // Reset Apollo cache
        await apolloClient.resetStore();
      }
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);

    // Clear Apollo cache
    apolloClient.clearStore();
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
