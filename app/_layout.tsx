import AuthTokenProvider from '@/app/providers/AuthTokenProvider';
import { tokenCache } from '@/utils/clerkTokenCache';
import { ClerkProvider } from '@clerk/clerk-expo';
import { Stack } from "expo-router";
import * as WebBrowser from 'expo-web-browser';
import './globals.css';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY as string;
WebBrowser.maybeCompleteAuthSession();

export default function RootLayout() {
  return <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
  <AuthTokenProvider>
  <Stack>
    <Stack.Screen 
    name="(tabs)" 
    options=
      {{ 

        headerShown: false 

      }} 
    />
    <Stack.Screen 
      name="(auth)" 
      options=
        {{ 
          
          headerShown: false 

        }} 
    />


    <Stack.Screen 
      name="(auth)/sign-in" 
      options=
        {{ 
          
          headerShown: false 

        }} 
    />


    <Stack.Screen 
      name="(auth)/sign-up" 
      options=
        {{ 
          
          headerShown: false 

        }} 
    />
    <Stack.Screen 
      name="(tabs)/Motor Skills" 
      options=
        {{ 
          
          headerShown: false 

        }} 
    />

     <Stack.Screen 
      name="(tabs)/Settings" 
      options=
        {{ 
          
          headerShown: false 

        }} 
      />

    <Stack.Screen 
      name="(tabs)/Profile" 
      options=
        {{ 
          
          headerShown: false 

        }} 
    />


  </Stack>
  </AuthTokenProvider>
  </ClerkProvider>
}
