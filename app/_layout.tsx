// app/_layout.tsx (expo-router)
import { Stack } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import './globals.css';
import AuthTokenProvider from './providers/AuthTokenProvider';
import { AuthProvider } from './providers/AuthProvider';
import { preInitializeTTS, cleanupTTS } from '@/utils/tts';
import { configurePlaybackAudio } from '@/utils/configureAppAudio';
import { preloadSounds } from '@/utils/soundPlayer';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export default function RootLayout() {
  // Pre-initialize TTS for faster first use
  useEffect(() => {
    preInitializeTTS().catch((err) => {
      console.warn('[RootLayout] Failed to pre-initialize TTS:', err);
    });

    if (Platform.OS !== 'web') {
      configurePlaybackAudio()
        .then(() => preloadSounds())
        .catch((err) => {
          console.warn('[RootLayout] Failed to configure game audio:', err);
        });
    }

    // Cleanup on unmount
    return () => {
      cleanupTTS().catch((err) => {
        console.warn('[RootLayout] Failed to cleanup TTS:', err);
      });
    };
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <AuthProvider>
        <AuthTokenProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </AuthTokenProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
