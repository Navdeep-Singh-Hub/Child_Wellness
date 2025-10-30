// app/_layout.tsx (expo-router)
import { Stack } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { Text, View } from 'react-native';

import AuthTokenProvider from '@/app/providers/AuthTokenProvider';
import { tokenCache } from '@/utils/clerkTokenCache';
import { ClerkProvider } from '@clerk/clerk-expo';
import './globals.css';



WebBrowser.maybeCompleteAuthSession();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

function MissingKey() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <Text style={{ textAlign: 'center' }}>
        Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY (should start with "pk_")
      </Text>
    </View>
  );
}

export default function RootLayout() {
  if (!publishableKey) return <MissingKey />;

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <AuthTokenProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)/sign-in" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)/sign-up" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)/Profile" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)/complete-profile" options={{ headerShown: false }} />
        </Stack>
      </AuthTokenProvider>
    </ClerkProvider>
  );
}
