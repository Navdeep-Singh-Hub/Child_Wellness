import { useAuth } from '@/app/providers/AuthProvider';
import { HomePublicLanding } from '@/components/home/HomePublicLanding';
import { images } from '@/constants/images';
import { getMyProfile } from '@/utils/api';
import {
  clearProfileCache,
  getCachedProfileStatus,
  isProfileComplete,
  setCachedProfileStatus,
} from '@/utils/profileCache';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';

const progressLoaderAnimation = require('@/assets/animation/loading.json');
const { width } = Dimensions.get('window');

let WebLottie: any = null;
if (Platform.OS === 'web') {
  try {
    WebLottie = require('lottie-react').default;
  } catch {
    WebLottie = null;
  }
}

export default function RootIndex() {
  const { session } = useAuth();
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      clearProfileCache();
      setRedirectPath(null);
    }
  }, [session]);

  useEffect(() => {
    if (!session?.profile) return;
    (async () => {
      const cached = await getCachedProfileStatus();
      if (cached?.isComplete) setRedirectPath('/(tabs)');
      else if (cached && !cached.isComplete) setRedirectPath('/(auth)/complete-profile');
      else setRedirectPath('/(tabs)');

      (async () => {
        try {
          const profile = await getMyProfile();
          const complete = isProfileComplete(profile);
          await setCachedProfileStatus(complete, {
            firstName: profile.firstName,
            dob: profile.dob || undefined,
            phoneNumber: profile.phoneNumber,
          });
        } catch (e) {
          console.error('Background profile verification failed:', e);
        }
      })();
    })();
  }, [session]);

  if (session) {
    if (!redirectPath) {
      return (
        <SafeAreaView style={styles.authLoad}>
          <LinearGradient colors={['#FFF8F6', '#EEF2FF', '#F0FDFA']} style={StyleSheet.absoluteFillObject} />
          <AuthLoadingContent />
        </SafeAreaView>
      );
    }
    return <Redirect href={redirectPath as any} />;
  }

  return <HomePublicLanding />;
}

function AuthLoadingContent() {
  const loaderSize = width > 500 ? 280 : 220;
  return (
    <View style={styles.loaderWrap}>
      <View style={styles.badge}>
        <Image source={images.logo} style={styles.badgeLogo} />
      </View>
      <View style={styles.card}>
        {Platform.OS === 'web' && WebLottie ? (
          <WebLottie animationData={progressLoaderAnimation} loop autoplay style={{ width: loaderSize, height: loaderSize }} />
        ) : (
          <ActivityIndicator size="large" color="#7C3AED" />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  authLoad: { flex: 1 },
  loaderWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  badge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#7C3AED',
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  badgeLogo: { width: 44, height: 44 },
  card: {
    width: width > 500 ? 300 : 240,
    height: width > 500 ? 300 : 240,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0C1222',
    shadowOpacity: 0.1,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 16 },
    elevation: 12,
  },
});
