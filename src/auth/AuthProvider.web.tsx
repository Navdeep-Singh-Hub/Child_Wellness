import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import Constants from "expo-constants";
import React, { createContext, useContext } from "react";

type CtxT = {
  session: any;
  login: () => void;
  logout: () => void;
  signup: (emailHint?: string) => void;
  getAccessToken?: () => Promise<string>;
};

const extra = (Constants as any).expoConfig?.extra ?? {};
const domain =
  (process.env.EXPO_PUBLIC_AUTH0_DOMAIN as string) || (extra.AUTH0_DOMAIN as string);
const clientId =
  (process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID_WEB as string) || (extra.AUTH0_CLIENT_ID_WEB as string);
const audience =
  (process.env.EXPO_PUBLIC_AUTH0_AUDIENCE as string) || (extra.AUTH0_AUDIENCE as string) || undefined;

if (!domain || !clientId) {
  console.error("Auth0 web config missing. domain:", domain, "clientId:", clientId);
  throw new Error("Auth0 web: missing domain or clientId (check EXPO_PUBLIC_* or expo.extra)");
}

const Ctx = createContext<CtxT>({
  session: null,
  login: () => {},
  logout: () => {},
  signup: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Auth0Provider
    domain={domain}
    clientId={clientId}
    authorizationParams={{
      redirect_uri: `${window.location.origin}/${process.env.EXPO_PUBLIC_AUTH_REDIRECT_PATH}`,
      scope: "openid profile email",
      ...(audience ? { audience } : {}),
    }}
  >
    <Inner>{children}</Inner>
  </Auth0Provider>
);

const Inner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, loginWithRedirect, logout, getAccessTokenSilently } = useAuth0();
  return (
    <Ctx.Provider
      value={{
        session: isAuthenticated ? { profile: user } : null,
        login: () => loginWithRedirect(),
        logout: () => logout({ logoutParams: { returnTo: window.location.origin } }),
        signup: (emailHint?: string) =>
          loginWithRedirect({
            authorizationParams: { screen_hint: "signup", login_hint: emailHint || "" },
          }),
        getAccessToken: audience
          ? () => getAccessTokenSilently({ authorizationParams: { audience } })
          : undefined,
      }}
    >
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => useContext(Ctx);
