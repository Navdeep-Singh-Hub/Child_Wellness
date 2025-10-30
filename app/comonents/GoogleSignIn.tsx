import { useSSO } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback, useEffect } from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';

export const useWarmUpBrowser = () => {
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    void WebBrowser.warmUpAsync();
    return () => void WebBrowser.coolDownAsync();
  }, []);
};

WebBrowser.maybeCompleteAuthSession();

export default function GoogleSignInButton() {
  useWarmUpBrowser();
  const { startSSOFlow } = useSSO();

  const isExpoGo = Constants.appOwnership === 'expo';

  const onPress = useCallback(async () => {
    try {
      const redirectUrl = isExpoGo
        ? AuthSession.makeRedirectUri({ useProxy: true }) // ✅ Expo Go
        : AuthSession.makeRedirectUri({
            scheme: 'childwellness',
            path: 'oauth-native-callback',
          }); // ✅ Dev/Prod build

      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl,
      });

      if (!createdSessionId) return; // MFA or additional steps
      await setActive!({ session: createdSessionId });
      router.replace('/(auth)/complete-profile'); // or '/(tabs)'
    } catch (err) {
      console.error('Google SSO failed:', JSON.stringify(err, null, 2));
    }
  }, [startSSOFlow, isExpoGo]);

  return (
<TouchableOpacity 
      onPress={onPress}
      className="bg-white border-2 border-gray-200 rounded-xl py-4 shadow-sm"
      activeOpacity={0.8}
    >
      <View className="flex-row items-center justify-center">
        <Ionicons name="logo-google" size={20} color="#EA4335" />
        <Text className="text-gray-900 font-semibold text-lg ml-3">
          Continue with Google
        </Text>
      </View>
    </TouchableOpacity>
  )
}