import { images } from '@/constants/images'
import { useSignUp } from '@clerk/clerk-expo'
import Ionicons from '@expo/vector-icons/build/Ionicons'
import { Link, useRouter } from 'expo-router'
import * as React from 'react'
import { Alert, Image, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native'


export default function SignUpScreen() {
  const [isLoading, setIsLoading] = React.useState(false)
  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [pendingVerification, setPendingVerification] = React.useState(false)
  const [code, setCode] = React.useState('')

  // // Handle submission of sign-up form
  // const onSignUpPress = async () => {
  //   if (!isLoaded) return;
  //   if(!emailAddress || !password){
  //     Alert.alert("Error", 'Please fill all the fields')
  //     return;
  //   }

  //   try {
  //     setIsLoading(true)
  //     // Create the account first
  //     await signUp.create({ emailAddress, password })
  //     await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
  //     setPendingVerification(true)
  //   } catch (err: any) {
  //     const message = err?.errors?.[0]?.message || 'Sign up failed. Please try again.'
  //     console.error('SignUp error:', err)
  //     Alert.alert('Sign up error', message)
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }


  const onSignUpPress = async () => {
    if (!isLoaded) {
      Alert.alert('Please wait', 'Auth is still loading.');
      return;
    }
    if (!emailAddress || !password) {
      Alert.alert('Error', 'Please fill all the fields');
      return;
    }
  
    setIsLoading(true);
    try {
      // 1) Create account
      const created = await signUp.create({ emailAddress, password });
      // Optional: basic validations surfaced by Clerk
      // console.log('created', created);
  
      // 2) Ask Clerk to send email code
      const prep = await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      // console.log('prepare', prep);
  
      // 3) Only now show the code screen
      setPendingVerification(true);
    } catch (err: any) {
      // Clerk errors are structured; surface the real message
      const message =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        err?.message ||
        'Sign up failed. Please try again.';
      console.error('SignUp error:', err);
      Alert.alert('Sign up error', message);
    } finally {
      setIsLoading(false);
    }
  };
  


  // Handle submission of verification form
  // const onVerifyPress = async () => {
  //   if (!isLoaded) return

  //   try {
  //     // Use the code the user provided to attempt verification
  //     const signUpAttempt = await signUp.attemptEmailAddressVerification({
  //       code,
  //     })

  //     // If verification was completed, set the session to active
  //     // and redirect the user
  //     if (signUpAttempt.status === 'complete') {
  //       await setActive({ session: signUpAttempt.createdSessionId })
  //       router.replace('/')
  //     } else {
  //       // If the status is not complete, check why. User may need to
  //       // complete further steps.
  //       console.error(JSON.stringify(signUpAttempt, null, 2))
  //     }
  //   } catch (err) {
  //     // See https://clerk.com/docs/guides/development/custom-flows/error-handling
  //     // for more info on error handling
  //     console.error(JSON.stringify(err, null, 2))
  //   }
  // }

  const onVerifyPress = async () => {
    if (!isLoaded) return;
    setIsLoading(true);
    try {
      const res = await signUp.attemptEmailAddressVerification({ code });
      if (res.status === 'complete') {
        await setActive({ session: res.createdSessionId });
        router.replace('/'); // or "/(tabs)"
      } else {
        // When additional steps are required
        Alert.alert('Verification', 'Additional steps required.');
        console.log('verify result', res);
      }
    } catch (err: any) {
      const message =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        err?.message ||
        'Verification failed.';
      Alert.alert('Verify error', message);
    } finally {
      setIsLoading(false);
    }
  };
  


  if (pendingVerification) {
    return (
      <View className='flex-1 bg-gray-50'>
        <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className='flex-1'>

        <View className='flex-1 px-6'>
          <View className='flex-1 justify-center'>
            {/* Logo Section */}
            <View className='items-center mb-8'>
              <View className='w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full items-center justify-center mb-4 shadow-lg'>
                <Image source={images.logo} style={{width: 64, height: 64}} />
              </View>
              <Text className='text-3xl font-bold text-gray-900 mb-2'>
                Check your Email
              </Text>
              <Text className='text-lg text-gray-600 text-center'>
                We've sent a verification code 
                {emailAddress}
              </Text>
            </View>


            {/* Verification Form Section */}



            <View className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6 '>
              <Text className='text-2xl font-bold text-gray-900 mb-6 text-center '>
                Enter Verification code 
              </Text>

              {/* Code Input Section */}


              <View className='mb-4'>
              <View className='flex-row items-center bg-gray-50 rounded-xl px-4 py-4 border border-gray-200'>
                <Ionicons name='key-outline' size={20} color='#06B7280' />
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

              {/* Verify Button */}

              <TouchableOpacity 
                onPress={onVerifyPress}
                disabled={isLoading}
                className={`rounded-xl py-4 shadow-sm mb-4 ${isLoading ? 'bg-gray-400': 'bg-green-600' }`}
                activeOpacity={0.8}
                >
                  <View className='flex-row items-center justify-center'>
                    {isLoading ? (
                      <Ionicons name='refresh' size={20} color='white' />
                    ):(
                      <Ionicons name='checkmark-circle-outline' size={20} color='white' />

                    )}
                    <Text className='text-white ml-2 font-semibold text-lg ml-2'>
                      {isLoading ? 'Verifying...': 'Verify'}
                    </Text>
                  </View>
                </TouchableOpacity>
                {/* Resend Code */}
                <TouchableOpacity className='py-2'>
                  <Text className='text-blue-600 font-medium text-center'>
                    Didn't receive the code?Resend
                  </Text>
                </TouchableOpacity>
            </View>
          </View>

          {/* Footer Section */}
          <View className='pb-6'>
            <Text className='text-center text-gray-500 text-sm'>
              Almost there Just one more Step
            </Text>
          </View>
        </View>
        </KeyboardAvoidingView>

      </View>
    )
  }

  return (
    <View className='flex-1 bg-gray-50'>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className='flex-1'>


      <View className='flex-1 px-6 '>

       {/* Main section */}
       <View className='flex-1 px-6'>

       </View>
       {/* LOGO SECTION */}

       <View className='items-center mb-8'>
          <View className='w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full items-center justify-center mb-4 shadow-lg'>
            <Image source={images.logo} style={{width: 64, height: 64}} />
          </View>
          <Text className='text-3xl font-bold text-gray-900 mb-2'>
            Join Child Wellness
          </Text>
          <Text className='text-lg text-gray-600 text-center'>
            Your child's health {"\n"}and development in one place
          </Text>
        </View>
        <View>
          <View className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6'>
            <Text className='text-2xl font-bold text-gray-900 mb-6 text-center'>
              Create an Account
            </Text>

            {/* Email Input */}
            <View className='mb-4'>
              <Text className='text-sm font-medium text-gray-700 mb-2'>
                Email
              </Text>
              <View className='flex-row items-center bg-gray-50 rounded-xl px-4 py-4 border border-gray-200'>
                <Ionicons name='mail-outline' size={20} color='#6B7280' />
                <TextInput
                  autoCapitalize="none"
                  value={emailAddress}
                  placeholder="Enter your email"
                  placeholderTextColor='#9CA3AF'
                  onChangeText={setEmailAddress}
                  className='flex-1 ml-3 text-gray-900'
                  editable={!isLoading}
                />
              </View>
            </View>
            {/* Password Input */}
            <View className='mb-4'>
              <Text className='text-sm font-medium text-gray-700 mb-2'>
                Password
              </Text>
              <View className='flex-row items-center bg-gray-50 rounded-xl px-4 py-4 border border-gray-200'>
                <Ionicons name='lock-closed-outline' size={20} color='#6B7280' />
                <TextInput
                  value={password}
                  placeholder="Enter your password"
                  placeholderTextColor='#9CA3AF'
                  secureTextEntry={true}
                  onChangeText={setPassword}
                  className='flex-1 ml-3 text-gray-900'
                  editable={!isLoading}
                />
              </View>
               <Text className='text-xs text-gray-500 ml-1'>
                At least 8 characters
               </Text>
            </View>
         
         {/* Sign up button */}
         <TouchableOpacity
          onPress={onSignUpPress}
          disabled={isLoading}
          className={`rounded-xl py-4 shadow-sm mb-4 ${isLoading ? "bg-gray-400":"bg-blue-600"}`}
          activeOpacity={0.8}
         >
          <View className='flex-row items-center justify-center'>

          {isLoading ? (
            <Ionicons name='refresh' size={20} color="white" />
          ):(
            <Ionicons name='person-add-outline' size={20} color="white" />
          )}
          <Text className='text-white ml-2 font-semibold text-lg'>
            {isLoading?"Creating Account...":"Create Account"}
          </Text>
          </View>
         </TouchableOpacity>



         {/* Terms */}

         <Text className='text-xs text-gray-500 text-center mb-4'>
            By Signing Up you agree to our terms of services and privacy
         </Text>

          </View>
  
         {/* Sign in link  */}

         <View className='flex-row justify-center items-center '>
          <Text className='text-gray-600'>
            Already have an account
          </Text>
          <Link href="/sign-in" asChild>
            <TouchableOpacity>
              <Text className='text-blue-600 font-semibold'>Sign In</Text>
            </TouchableOpacity>
          </Link>
         </View>

        </View>
          {/* Footer Section */}
          <View className='pb-6'>
            <Text className='text-center text-gray-500 text-sm'>
              Are you raedy to have some fun
            </Text>
          </View>

      </View>
      </KeyboardAvoidingView>
    </View>
  )
}
