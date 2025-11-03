// app/_layout.tsx (expo-router)
import { Stack } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { Platform } from 'react-native';
import './globals.css';
import AuthTokenProvider from './providers/AuthTokenProvider';

WebBrowser.maybeCompleteAuthSession();

let AuthProvider: React.FC<{children:React.ReactNode}>;
let useAuth: any;
if (Platform.OS === 'web') {
  // @ts-ignore
  const web = require('../src/auth/AuthProvider.web.tsx');
  AuthProvider = web.AuthProvider;
  useAuth = web.useAuth;
} else {
  // @ts-ignore
  const native = require('../src/auth/AuthProvider.native.tsx');
  AuthProvider = native.AuthProvider;
  useAuth = native.useAuth;
}
export { useAuth };

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthTokenProvider>
        <Stack>
          <Stack.Screen name="(public)/index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)/sign-in" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)/sign-up" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)/Profile" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)/complete-profile" options={{ headerShown: false }} />
        </Stack>
      </AuthTokenProvider>
    </AuthProvider>
  );
}
