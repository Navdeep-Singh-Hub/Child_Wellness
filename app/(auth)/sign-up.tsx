import { useAuth } from '@/app/_layout';
import { images } from '@/constants/images';
import Ionicons from '@expo/vector-icons/build/Ionicons';
import { Link, useRouter } from 'expo-router';
import * as React from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Linking as RNLinking, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignUpScreen() {
  const router = useRouter();
  const { signup } = useAuth();
  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [pendingVerification, setPendingVerification] = React.useState(false);

  const onCreateAccount = async () => {
    if (!emailAddress || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    setIsLoading(true);
    try {
      await signup(emailAddress);
      setPendingVerification(true);
    } catch (e: any) {
      Alert.alert('Sign up failed', e?.message || 'An error occurred during sign-up.');
    } finally {
      setIsLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 px-6">
        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full items-center justify-center mb-4 shadow-lg">
            <Image source={images.logo} style={{ width: 64, height: 64 }} />
          </View>
          <Text className="text-3xl font-bold text-gray-900 mb-2">Verify your email</Text>
          <Text className="text-lg text-gray-600 text-center">
            We've sent a verification link to:
            {"\n"}
            <Text className="font-semibold">{emailAddress}</Text>
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => RNLinking.openURL('mailto:')}
          className="rounded-xl py-4 w-full bg-blue-600 mb-2 shadow-sm"
          activeOpacity={0.85}
        >
          <Text className="text-white text-center text-lg font-semibold">Open Mail App</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.replace('/(auth)/sign-in')}
          className="rounded-xl py-4 w-full bg-green-600 shadow-sm"
          activeOpacity={0.85}
        >
          <Text className="text-white text-center text-lg font-semibold">I've Verified – Continue to Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <View className="flex-1 px-6 justify-center">
          <View className="items-center mb-8">
            <View className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full items-center justify-center mb-4 shadow-lg">
              <Image source={images.logo} style={{ width: 64, height: 64 }} />
            </View>
            <Text className="text-3xl font-bold text-gray-900 mb-2">Join Child Wellness</Text>
            <Text className="text-lg text-gray-600 text-center">
              Create an account to get started.
            </Text>
          </View>

          <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <Text className="text-2xl font-bold text-gray-900 mb-6 text-center">Create an Account</Text>
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Email</Text>
              <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-4 border border-gray-200">
                <Ionicons name="mail-outline" size={20} color="#6B7280" />
                <TextInput
                  autoCapitalize="none"
                  value={emailAddress}
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
                  onChangeText={setEmailAddress}
                  className="flex-1 ml-3 text-gray-900"
                  editable={!isLoading}
                />
              </View>
            </View>
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Password</Text>
              <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-4 border border-gray-200">
                <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
                <TextInput
                  value={password}
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  onChangeText={setPassword}
                  className="flex-1 ml-3 text-gray-900"
                  editable={!isLoading}
                />
              </View>
              <Text className="text-xs text-gray-500 mt-1 ml-1">At least 8 characters</Text>
            </View>
            <TouchableOpacity
              onPress={onCreateAccount}
              disabled={isLoading}
              className={`rounded-xl py-4 shadow-sm ${isLoading ? 'bg-gray-400' : 'bg-blue-600'}`}
              activeOpacity={0.8}
            >
              <View className="flex-row items-center justify-center">
                {isLoading ? (
                  <Ionicons name="refresh" size={20} color="white" />
                ) : (
                  <Ionicons name="person-add-outline" size={20} color="white" />
                )}
                <Text className="text-white ml-2 font-semibold text-lg">
                  {isLoading ? 'Creating Account…' : 'Create Account'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          <View className="flex-row justify-center items-center">
            <Text className="text-gray-600">Already have an account? </Text>
            <Link href='/sign-in' asChild>
              <TouchableOpacity>
                <Text className="text-blue-600 font-semibold">Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
