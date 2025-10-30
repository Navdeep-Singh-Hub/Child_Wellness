// app/(auth)/sign-up.tsx
import { images } from '@/constants/images';
import { useAuth, useSession, useSignUp } from '@clerk/clerk-expo';
import Ionicons from '@expo/vector-icons/build/Ionicons';
import { Link, useRouter } from 'expo-router';
import * as React from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignUpScreen() {
  const router = useRouter();

  const { isLoaded, signUp, setActive } = useSignUp();
  const { isSignedIn } = useAuth();
  const session = useSession();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    const pk = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
    console.log('🔎 [SignUp mount]', { platform: Platform.OS, hasPK: !!pk, pkStartsWithPk: pk?.startsWith('pk_') ?? false });
  }, []);
  React.useEffect(() => {
    console.log('👀 signUp ref changed', { isLoaded, signUpId: signUp?.id });
  }, [signUp, isLoaded]);

  const onSignUpPress = async () => {
    const email = emailAddress.trim().toLowerCase();
    const pass = password;

    console.log('🔎 onSignUpPress', {
      isLoaded,
      email,
      passLen: pass.length,
      isSignedIn_now: isSignedIn,
      signUpDefined: !!signUp,
      signUpId_atStart: signUp?.id,
    });

    if (!isLoaded) { Alert.alert('Please wait', 'Auth is still loading.'); return; }
    if (!email || !pass) { Alert.alert('Error', 'Please fill all the fields'); return; }
    if (pass.length < 8) { Alert.alert('Weak password', 'Password must be at least 8 characters.'); return; }

    setIsLoading(true);
    try {
      // 1) Create with the hook resource
      console.log('🔎 A) create → prepare (using hook resource)');
      const created = await signUp.create({ emailAddress: email, password: pass });
      console.log('✅ A) create ok', { id: created.id, status: created.status }); // "missing_requirements" is expected here

      // 2) Prepare verification on the LIVE hook resource (not on `created`)
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      console.log('✅ A) prepare ok via hook');

      setPendingVerification(true);
    } catch (err: any) {
      console.log('❌ A) error blob:\n', JSON.stringify(err, null, 2));
      const msg = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || err?.message || 'Sign up failed.';
      Alert.alert('Sign up error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifyPress = async () => {
    console.log('🔎 onVerifyPress', { code, isLoaded });
    if (!isLoaded) return;
    if (code.trim().length < 6) { Alert.alert('Verification', 'Please enter the 6-digit code.'); return; }

    setIsLoading(true);
    try {
      const res = await signUp.attemptEmailAddressVerification({ code: code.trim() });
      console.log('✅ attemptEmailAddressVerification', { status: res.status, createdSessionId: res.createdSessionId });

      if (res.status === 'complete') {
        if (res.createdSessionId) {
          await setActive({ session: res.createdSessionId });
        }

        // Optionally ensure user in your API (non-blocking)
        try {
          const { ensureUser } = await import('@/utils/api');
          await ensureUser();
        } catch {}

        router.replace('/(auth)/complete-profile');
        return;
      }

      Alert.alert('Verification', 'Additional steps required. Please try again.');
    } catch (err: any) {
      console.log('❌ RAW Clerk verify error:\n', JSON.stringify(err, null, 2));
      const msg = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || err?.message || 'Verification failed.';
      Alert.alert('Verify error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  // ----- UI (unchanged) -----
  if (pendingVerification) {
    return (
      <View className='flex-1 bg-gray-50'>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className='flex-1'>
          <View className='flex-1 px-6'>
            <View className='flex-1 justify-center'>
              <View className='items-center mb-8'>
                <View className='w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full items-center justify-center mb-4 shadow-lg'>
                  <Image source={images.logo} style={{ width: 64, height: 64 }} />
                </View>
                <Text className='text-3xl font-bold text-gray-900 mb-2'>Check your Email</Text>
                <Text className='text-lg text-gray-600 text-center'>
                  We&apos;ve sent a verification code on your email address: {emailAddress}
                </Text>
              </View>

              <View className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6 '>
                <Text className='text-2xl font-bold text-gray-900 mb-6 text-center '>Enter Verification code</Text>
                <View className='mb-4'>
                  <View className='flex-row items-center bg-gray-50 rounded-xl px-4 py-4 border border-gray-200'>
                    <Ionicons name='key-outline' size={20} color='#6B7280' />
                    <TextInput
                      value={code}
                      placeholder='Enter your 6-digit code'
                      placeholderTextColor='#9CA3AF'
                      onChangeText={setCode}
                      className='flex-1 ml-3 text-gray-900 text-center text-lg tracking-widest'
                      keyboardType='number-pad'
                      maxLength={6}
                      editable={!isLoading}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  onPress={onVerifyPress}
                  disabled={isLoading}
                  className={`rounded-xl py-4 shadow-sm mb-4 ${isLoading ? 'bg-gray-400' : 'bg-green-600'}`}
                  activeOpacity={0.8}
                >
                  <View className='flex-row items-center justify-center'>
                    {isLoading ? (
                      <Ionicons name='refresh' size={20} color='white' />
                    ) : (
                      <Ionicons name='checkmark-circle-outline' size={20} color='white' />
                    )}
                    <Text className='text-white ml-2 font-semibold text-lg'>
                      {isLoading ? 'Verifying…' : 'Verify'}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity className='py-2'>
                  <Text className='text-blue-600 font-medium text-center'>Didn&apos;t receive the code? Resend</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className='pb-6'>
              <Text className='text-center text-gray-500 text-sm'>Almost there—just one more step</Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    );
  }

  return (
    <View className='flex-1 bg-gray-50'>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className='flex-1'>
        <View className='flex-1 px-6 '>
          <View className='items-center mb-8'>
            <View className='w-20 h-20 bg-gradient-to-r from-blue-600 to purple-600 rounded-full items-center justify-center mb-4 shadow-lg'>
              <Image source={images.logo} style={{ width: 64, height: 64 }} />
            </View>
            <Text className='text-3xl font-bold text-gray-900 mb-2'>Join Child Wellness</Text>
            <Text className='text-lg text-gray-600 text-center'>
              Your child's health {'\n'}and development in one place
            </Text>
          </View>

          <View>
            <View className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6'>
              <Text className='text-2xl font-bold text-gray-900 mb-6 text-center'>Create an Account</Text>

              <View className='mb-4'>
                <Text className='text-sm font-medium text-gray-700 mb-2'>Email</Text>
                <View className='flex-row items-center bg-gray-50 rounded-xl px-4 py-4 border border-gray-200'>
                  <Ionicons name='mail-outline' size={20} color='#6B7280' />
                  <TextInput
                    autoCapitalize='none'
                    value={emailAddress}
                    placeholder='Enter your email'
                    placeholderTextColor='#9CA3AF'
                    onChangeText={setEmailAddress}
                    className='flex-1 ml-3 text-gray-900'
                    editable={!isLoading}
                  />
                </View>
              </View>

              <View className='mb-4'>
                <Text className='text-sm font-medium text-gray-700 mb-2'>Password</Text>
                <View className='flex-row items-center bg-gray-50 rounded-xl px-4 py-4 border border-gray-200'>
                  <Ionicons name='lock-closed-outline' size={20} color='#6B7280' />
                  <TextInput
                    value={password}
                    placeholder='Enter your password'
                    placeholderTextColor='#9CA3AF'
                    secureTextEntry
                    onChangeText={setPassword}
                    className='flex-1 ml-3 text-gray-900'
                    editable={!isLoading}
                  />
                </View>
                <Text className='text-xs text-gray-500 ml-1'>At least 8 characters</Text>
              </View>

              <TouchableOpacity
                onPress={onSignUpPress}
                disabled={isLoading}
                className={`rounded-xl py-4 shadow-sm mb-4 ${isLoading ? 'bg-gray-400' : 'bg-blue-600'}`}
                activeOpacity={0.8}
              >
                <View className='flex-row items-center justify-center'>
                  {isLoading ? (
                    <Ionicons name='refresh' size={20} color='white' />
                  ) : (
                    <Ionicons name='person-add-outline' size={20} color='white' />
                  )}
                  <Text className='text-white ml-2 font-semibold text-lg'>
                    {isLoading ? 'Creating Account…' : 'Create Account'}
                  </Text>
                </View>
              </TouchableOpacity>

              <Text className='text-xs text-gray-500 text-center mb-4'>
                By Signing Up you agree to our terms of services and privacy
              </Text>
            </View>

            <View className='flex-row justify-center items-center '>
              <Text className='text-gray-600'>Already have an account </Text>
              <Link href='/(auth)/sign-in' asChild>
                <TouchableOpacity>
                  <Text className='text-blue-600 font-semibold'>Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>

          <View className='pb-6'>
            <Text className='text-center text-gray-500 text-sm'>Are you ready to have some fun</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
