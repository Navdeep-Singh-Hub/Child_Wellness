import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import Constants from "expo-constants";
import React, { createContext, useContext } from "react";
import { StyleSheet, Text, View } from "react-native";

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

/** Auth0 SPA JS only allows https: or secure contexts — not http:// LAN IPs in the browser. */
function canUseAuth0Web(): boolean {
  if (typeof window === "undefined") return false;
  if (window.isSecureContext) return true;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1";
}

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

function WebAuthBlockedScreen() {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return (
    <View style={styles.blocked}>
      <Text style={styles.blockedTitle}>Use the tablet app to test</Text>
      <Text style={styles.blockedBody}>
        Auth0 login does not work in the browser at {origin || "this address"}. Open your
        ChildWellness development build on the Android tablet instead (not Chrome and not Expo
        Go).
      </Text>
      <Text style={styles.blockedSteps}>
        1. Keep npm start running on your PC{"\n"}
        2. Same Wi‑Fi as the tablet{"\n"}
        3. Open the dev client app → scan the QR code in the terminal{"\n"}
        4. Or press a in the terminal if the tablet is connected by USB
      </Text>
      <Text style={styles.blockedHint}>
        To test in a desktop browser, use https://localhost:8081 (not http://192.168.x.x:8081).
      </Text>
    </View>
  );
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!canUseAuth0Web()) {
    return <WebAuthBlockedScreen />;
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        scope: "openid profile email",
        ...(audience ? { audience } : {}),
      }}
    >
      <Inner>{children}</Inner>
    </Auth0Provider>
  );
};

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

const styles = StyleSheet.create({
  blocked: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#F8FAFC",
  },
  blockedTitle: { fontSize: 22, fontWeight: "900", color: "#0F172A", marginBottom: 12 },
  blockedBody: { fontSize: 16, color: "#475569", lineHeight: 24, marginBottom: 16 },
  blockedSteps: { fontSize: 15, color: "#0F172A", lineHeight: 26, marginBottom: 16 },
  blockedHint: { fontSize: 13, color: "#64748B", fontStyle: "italic", lineHeight: 20 },
});
