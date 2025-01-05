import React, { createContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { z } from 'zod';
import {jwtDecode} from 'jwt-decode';

const TokenDataSchema = z.object({
  email: z.string(),
  sub: z.number(),
  permission: z.string(),
  userType: z.string(),
});

type TokenData = z.infer<typeof TokenDataSchema>;

interface AuthContextType {
  accessToken?: string | null;
  accessTokenData?: TokenData | null;
  isAuthenticated: boolean;
  setAccessToken: (accessToken: string | undefined) => void;
  clearTokens: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const decodeAccessToken = (accessToken: string) => TokenDataSchema.parse(jwtDecode<TokenData>(accessToken));

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [accessToken, setAccessTokenState] = useState<string | undefined>(undefined);
  const [accessTokenData, setAccessTokenData] = useState<TokenData | undefined>(undefined);

  const setAccessToken = useCallback((token: string | undefined) => {
    const tokenData = (() => {
      try {
        return token ? decodeAccessToken(token) : undefined;
      } catch (error) {
        console.error('Failed to decode token', error);
        return undefined;
      }
    })();
    setAccessTokenState(token);
    setAccessTokenData(tokenData);
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }, []);

  const clearTokens = useCallback(() => {
    localStorage.removeItem('accessToken');
    setAccessTokenState(undefined);
    setAccessTokenData(undefined);
  }, []);

  const isAuthenticated = localStorage.getItem('accessToken') !== null;

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setAccessToken(token);
    }
  }, [setAccessToken]);

  return (
    <AuthContext.Provider value={{ accessToken, accessTokenData, isAuthenticated, setAccessToken, clearTokens }}>
      {children}
    </AuthContext.Provider>
  );
};
