import { useAuth } from '@/app/_layout';
import { images } from '@/constants/images';
import { ensureUser, getMyProfile } from '@/utils/api';
import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, View } from 'react-native';
import LoginButton from '../comonents/login';

export default function RootIndex() {
  const { session } = useAuth();
  const [checkingProfile, setCheckingProfile] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    if (session?.profile) {
      setCheckingProfile(true);
      (async () => {
        try {
          // Extract Auth0 user info
          const auth0Id = session.profile.sub || session.profile.user_id || '';
          const email = session.profile.email || '';
          const name = session.profile.name || session.profile.nickname || '';
          
          // Save user to MongoDB
          await ensureUser(auth0Id, email, name);
          
          // Check if profile is complete
          const profile = await getMyProfile();
          if (profile.firstName && profile.dob) {
            // Profile complete, go to tabs
            setRedirectPath('/(tabs)');
          } else {
            // Profile incomplete, go to complete-profile
            setRedirectPath('/(auth)/complete-profile');
          }
        } catch (e) {
          console.error('Error checking profile:', e);
          // If check fails, assume incomplete and go to complete-profile
          setRedirectPath('/(auth)/complete-profile');
        } finally {
          setCheckingProfile(false);
        }
      })();
    }
  }, [session]);

  // If authenticated, check profile and redirect accordingly
  if (session) {
    if (checkingProfile) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      );
    }
    if (redirectPath) {
      return <Redirect href={redirectPath as any} />;
    }
    // Still checking, show loader
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Show beautiful homepage for unauthenticated users
  return (
    <View className="flex-1 bg-white">
      {/* Header with Login Button */}
      <View className="flex-row justify-between items-center px-6 pt-12 pb-4 bg-gradient-to-b from-blue-50 to-white">
        <View className="flex-row items-center">
          <Image source={images.logo} style={{ width: 48, height: 48 }} />
          <Text className="text-2xl font-bold text-gray-900 ml-3">Child Wellness</Text>
        </View>
        <LoginButton />
      </View>

      {/* Hero Section */}
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="items-center px-6 py-12">
          <Text className="text-4xl font-extrabold text-gray-900 text-center mb-4">
            Your Child's Health{'\n'}and Development{'\n'}in One Place
          </Text>
          <Text className="text-lg text-gray-600 text-center mb-8">
            Empowering children with AAC tools, games, and personalized learning experiences
          </Text>

          {/* Features Grid */}
          <View className="w-full">
            <View className="flex-row flex-wrap justify-between mb-6">
              <View className="w-[48%] bg-blue-50 rounded-2xl p-6 mb-4">
                <Image source={images.logo} style={{ width: 48, height: 48 }} className="mb-3" />
                <Text className="text-lg font-bold text-gray-900 mb-2">AAC Grid</Text>
                <Text className="text-sm text-gray-600">
                  Communicate with visual symbols and tiles
                </Text>
              </View>

              <View className="w-[48%] bg-purple-50 rounded-2xl p-6 mb-4">
                <Image source={images.trophyIcon} style={{ width: 48, height: 48 }} className="mb-3" />
                <Text className="text-lg font-bold text-gray-900 mb-2">Interactive Games</Text>
                <Text className="text-sm text-gray-600">
                  Fun learning activities for skill development
                </Text>
              </View>

              <View className="w-[48%] bg-green-50 rounded-2xl p-6 mb-4">
                <Image source={images.starIcon} style={{ width: 48, height: 48 }} className="mb-3" />
                <Text className="text-lg font-bold text-gray-900 mb-2">Progress Tracking</Text>
                <Text className="text-sm text-gray-600">
                  Monitor your child's growth and achievements
                </Text>
              </View>

              <View className="w-[48%] bg-orange-50 rounded-2xl p-6 mb-4">
                <Image source={images.streakIcon} style={{ width: 48, height: 48 }} className="mb-3" />
                <Text className="text-lg font-bold text-gray-900 mb-2">Daily Streaks</Text>
                <Text className="text-sm text-gray-600">
                  Build consistent learning habits
                </Text>
              </View>
            </View>
          </View>

          {/* CTA Section */}
          <View className="w-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 items-center">
            <Text className="text-2xl font-bold text-white mb-3 text-center">
              Ready to Get Started?
            </Text>
            <Text className="text-blue-100 text-center mb-6">
              Join thousands of families empowering their children's communication and learning
            </Text>
            <LoginButton />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
