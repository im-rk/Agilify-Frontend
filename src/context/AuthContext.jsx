import React, { createContext, useContext, useMemo } from 'react';
import keycloak from '@/lib/keycloak';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

/**
 * Thin wrapper around the Keycloak session — there is no local login/register
 * flow, main.jsx already refused to render the app until Keycloak confirmed
 * the user is authenticated (onLoad: 'login-required').
 */
export const AuthProvider = ({ children }) => {
  const value = useMemo(() => {
    const claims = keycloak.tokenParsed || {};
    return {
      user: {
        id: claims.sub,
        email: claims.email,
        fullName: claims.name || claims.email,
      },
      logout: () => keycloak.logout({ redirectUri: window.location.origin }),
    };
  }, []);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
