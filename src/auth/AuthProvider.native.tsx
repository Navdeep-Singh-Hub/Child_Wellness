import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";
import Auth0 from "react-native-auth0";
import type {
  ClearSessionParameters,
  NativeAuthorizeOptions,
  NativeClearSessionOptions,
  WebAuthorizeParameters,
} from "react-native-auth0";

// Base64 URL decode helper (works in both web and React Native)
function base64UrlDecode(str: string): string {
  let padded = str + '='.repeat((4 - (str.length % 4)) % 4);
  padded = padded.replace(/-/g, '+').replace(/_/g, '/');

  if (typeof atob !== 'undefined') {
    return atob(padded);
  }

  if (typeof Buffer !== 'undefined') {
    return Buffer.from(padded, 'base64').toString('utf-8');
  }

  throw new Error('Base64 decoding not available');
}

type Session = { accessToken?: string; idToken?: string; profile?: any };

const extra = (Constants as any).expoConfig?.extra ?? {};
const stripProtocol = (url: string) => {
  if (!url) return url;
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
};
const domainRaw =
  (process.env.EXPO_PUBLIC_AUTH0_DOMAIN as string) || (extra.AUTH0_DOMAIN as string);
const domain = stripProtocol(domainRaw);
const clientId =
  (process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID_NATIVE as string) || (extra.AUTH0_CLIENT_ID_NATIVE as string);
const audience =
  (process.env.EXPO_PUBLIC_AUTH0_AUDIENCE as string) || (extra.AUTH0_AUDIENCE as string) || undefined;
const isDevVariant = extra.appVariant === 'development';
const auth0CallbackPackage =
  (extra.auth0CallbackPackage as string) ||
  (Constants as any).expoConfig?.android?.package ||
  'com.anonymous.childwellness';

if (!domain || !clientId) {
  console.error("Auth0 native config missing. domain:", domain, "clientId:", clientId);
  throw new Error("Auth0 native: missing domain or clientId (check EXPO_PUBLIC_* or expo.extra)");
}

const auth0 = new Auth0({ domain, clientId });

function getAuth0Scheme(packageId: string): string {
  return `${packageId}.auth0`;
}

function getAuth0CallbackUrl(packageId: string): string {
  return `${getAuth0Scheme(packageId)}://${domain}/android/${packageId}/callback`;
}

function getAuth0LogoutUrl(packageId: string): string {
  return `${getAuth0Scheme(packageId)}://${domain}/android/${packageId}/logout`;
}

function getWebAuthParams(extraParams: WebAuthorizeParameters = {}): {
  parameters: WebAuthorizeParameters;
  options: NativeAuthorizeOptions;
} {
  const parameters: WebAuthorizeParameters = {
    scope: "openid profile email offline_access",
    ...(audience ? { audience } : {}),
    ...extraParams,
  };
  const options: NativeAuthorizeOptions = {};

  if (isDevVariant) {
    parameters.redirectUrl = getAuth0CallbackUrl(auth0CallbackPackage);
    options.customScheme = getAuth0Scheme(auth0CallbackPackage);
  }

  return { parameters, options };
}

function getClearSessionParams(): {
  parameters: ClearSessionParameters;
  options: NativeClearSessionOptions;
} {
  const parameters: ClearSessionParameters = {};
  const options: NativeClearSessionOptions = {};

  if (isDevVariant) {
    parameters.returnToUrl = getAuth0LogoutUrl(auth0CallbackPackage);
    options.customScheme = getAuth0Scheme(auth0CallbackPackage);
  }

  return { parameters, options };
}

async function decodeProfileFromAuthResult(res: { accessToken?: string; idToken?: string }) {
  if (res.idToken) {
    try {
      const parts = res.idToken.split('.');
      if (parts.length === 3) {
        const decodedStr = base64UrlDecode(parts[1]);
        return JSON.parse(decodedStr);
      }
    } catch (e) {
      console.warn('Failed to decode ID token, falling back to userInfo API:', e);
    }
  }

  return auth0.auth.userInfo({ token: res.accessToken! });
}

const Ctx = createContext<{
  session: Session | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  signup: (emailHint?: string) => Promise<void>;
}>({
  session: null,
  login: async () => {},
  logout: async () => {},
  signup: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    (async () => {
      const raw = await SecureStore.getItemAsync("cw.session");
      if (raw) setSession(JSON.parse(raw));
    })();
  }, []);

  const login = async () => {
    const { parameters, options } = getWebAuthParams();
    if (isDevVariant) {
      console.log("Auth0 dev build using production callback:", parameters.redirectUrl);
    }

    const res = await auth0.webAuth.authorize(parameters, options);
    const profile = await decodeProfileFromAuthResult(res);
    const next = { accessToken: res.accessToken, idToken: res.idToken, profile };
    setSession(next);
    await SecureStore.setItemAsync("cw.session", JSON.stringify(next));
  };

  const logout = async () => {
    try {
      const { parameters, options } = getClearSessionParams();
      await auth0.webAuth.clearSession(parameters, options);
    } catch {
      // best-effort: still clear local state
    }
    setSession(null);
    await SecureStore.deleteItemAsync("cw.session");
  };

  const signup = async (emailHint?: string) => {
    const { parameters, options } = getWebAuthParams({
      screen_hint: "signup",
      login_hint: emailHint || "",
    });

    const res = await auth0.webAuth.authorize(parameters, options);
    const profile = await decodeProfileFromAuthResult(res);
    const next = { accessToken: res.accessToken, idToken: res.idToken, profile };
    setSession(next);
    await SecureStore.setItemAsync("cw.session", JSON.stringify(next));
  };

  return <Ctx.Provider value={{ session, login, logout, signup }}>{children}</Ctx.Provider>;
};

export const useAuth = () => useContext(Ctx);
