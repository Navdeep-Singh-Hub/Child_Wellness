// app/_layout.tsx (expo-router)
import { Stack } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import './globals.css';
import AuthTokenProvider from './providers/AuthTokenProvider';
import { AuthProvider } from './providers/AuthProvider';

WebBrowser.maybeCompleteAuthSession();

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthTokenProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </AuthTokenProvider>
    </AuthProvider>
  );
}
