// app/(auth)/complete-profile.tsx
import { images } from '@/constants/images';
import { getMyProfile, updateMyProfile } from '@/utils/api';
// import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, {
  Easing as ReanimatedEasing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming
} from 'react-native-reanimated';

// Animated Alert Component for Missing Fields
function AnimatedAlert({ 
  visible, 
  message, 
  fields, 
  onDismiss 
}: { 
  visible: boolean; 
  message: string; 
  fields: string[]; 
  onDismiss: () => void;
}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-20);
  const scale = useSharedValue(0.9);

  useEffect(() => {
    if (visible) {
      opacity.value = 0;
      translateY.value = -20;
      scale.value = 0.9;
      opacity.value = withTiming(1, { duration: 300, easing: ReanimatedEasing.out(ReanimatedEasing.cubic) });
      translateY.value = withSpring(0, { damping: 15, stiffness: 200 });
      scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(-20, { duration: 200 });
      scale.value = withTiming(0.9, { duration: 200 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  // Always render to maintain hook consistency - use pointerEvents to prevent interaction when hidden
  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[
        {
          position: 'absolute',
          top: Platform.OS === 'ios' ? 60 : 20,
          left: 16,
          right: 16,
          zIndex: visible ? 1000 : -1,
          backgroundColor: '#FEF2F2',
          borderRadius: 20,
          padding: 16,
          borderWidth: 2,
          borderColor: '#FCA5A5',
          shadowColor: '#DC2626',
          shadowOpacity: 0.3,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 8 },
          elevation: visible ? 10 : 0,
        },
        animatedStyle,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: fields.length > 0 ? 12 : 0 }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#DC2626',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <Ionicons name="alert-circle" size={24} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: '#991B1B', marginBottom: 4 }}>
            {message}
          </Text>
          {fields.length > 0 && (
            <View style={{ marginTop: 8 }}>
              {fields.map((field, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 6,
                    paddingVertical: 4,
                  }}
                >
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: '#DC2626',
                      marginRight: 8,
                    }}
                  />
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#7F1D1D' }}>
                    {field}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
        <TouchableOpacity
          onPress={onDismiss}
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: 'rgba(220, 38, 38, 0.1)',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 8,
          }}
        >
          <Ionicons name="close" size={18} color="#DC2626" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

// Shake animation hook
function useShake() {
  const shake = useSharedValue(0);
  const trigger = () => {
    shake.value = withSequence(
      withTiming(-8, { duration: 50, easing: ReanimatedEasing.linear }),
      withTiming(8, { duration: 50, easing: ReanimatedEasing.linear }),
      withTiming(-8, { duration: 50, easing: ReanimatedEasing.linear }),
      withTiming(8, { duration: 50, easing: ReanimatedEasing.linear }),
      withTiming(0, { duration: 50, easing: ReanimatedEasing.linear })
    );
  };
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));
  return { style, trigger };
}

export default function CompleteProfile() {
  // const { isSignedIn } = useAuth();
  const router = useRouter();
  // TODO: add Auth0 session check if needed

  // loading + saving
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Alert state
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [missingFields, setMissingFields] = useState<string[]>([]);
  
  // Shake animations for invalid fields
  const firstNameShake = useShake();
  const dobShake = useShake();
  const phoneShake = useShake();

  // form state (⚠️ keep same keys; backend depends on these)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [dob, setDob]             = useState(''); // YYYY-MM-DD
  const [gender, setGender]       = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState('+91'); // Default India
  const [phoneNumber, setPhoneNumber] = useState('');

  // DOB picker state
  const [showDobPicker, setShowDobPicker] = useState(false);
  const initialDate = useMemo(() => {
    // Try to parse existing dob; fallback to 6 years ago as a sensible default for AAC kids
    const valid = /^\d{4}-\d{2}-\d{2}$/.test(dob);
    return valid ? new Date(dob) : new Date(new Date().getFullYear() - 6, 0, 1);
  }, [dob]);
  const [dobDraft, setDobDraft] = useState<Date>(initialDate);

  // small inline validation (no backend changes)
  const firstNameError = useMemo(
    () => (firstName.trim().length === 0 ? 'Please enter your first name' : ''),
    [firstName]
  );
  const dobError = useMemo(
    () => (dob && !/^\d{4}-\d{2}-\d{2}$/.test(dob) ? 'Use YYYY-MM-DD' : ''),
    [dob]
  );
  const phoneError = useMemo(
    () => {
      const cleaned = phoneNumber.replace(/\D/g, '');
      if (cleaned.length === 0) return 'Phone number is required';
      if (cleaned.length < 10) return 'Phone number must be at least 10 digits';
      return '';
    },
    [phoneNumber]
  );

  const genderOptions = [
    { value: '', label: 'Skip' },
    { value: 'male', label: 'Boy' },
    { value: 'female', label: 'Girl' },
    { value: 'other', label: 'Other' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' },
  ];

  useEffect(() => {
    (async () => {
      try {
        const p = await getMyProfile();

        // already complete? go home (require phone too)
        const hasMinPhone = (q: any) => String(q?.phoneNumber || '').replace(/\D/g, '').length >= 10;
        if (p.firstName && p.dob && hasMinPhone(p)) {
          router.replace('/(tabs)');
          return;
        }

        setFirstName(p.firstName || '');
        setLastName(p.lastName || '');
        setDob((p as any).dob || '');      // keep same key
        setGender((p as any).gender || ''); // keep same key
        setPhoneCountryCode((p as any).phoneCountryCode || '+91');
        setPhoneNumber((p as any).phoneNumber || '');
      } catch {
        // silent — show form anyway
      } finally {
      setLoading(false);
      }
    })();
  }, []); // Removed isSignedIn from dependency array

  // helpers
  const toYYYYMMDD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const handleManualDobInput = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 8);
    let formatted = digitsOnly;
    if (digitsOnly.length > 4) {
      formatted = `${digitsOnly.slice(0, 4)}-${digitsOnly.slice(4, 6)}`;
    }
    if (digitsOnly.length > 6) {
      formatted = `${formatted}-${digitsOnly.slice(6, 8)}`;
    }
    setDob(formatted);
    if (showAlert && /^\d{4}-\d{2}-\d{2}$/.test(formatted)) {
      setShowAlert(false);
    }
  };

  const openDobPicker = () => {
    // sync draft with current dob (or sensible default)
    setDobDraft(initialDate);
    if (Platform.OS === 'android') {
      // Android: show native inline sheet (DateTimePicker as a one-shot)
      setShowDobPicker(true);
    } else {
      // iOS: show our modal with spinner
      setShowDobPicker(true);
    }
  };

  const onAndroidDateChange = (e: DateTimePickerEvent, selected?: Date) => {
    console.log('Android date picker event:', e.type);
    console.log('Selected date:', selected);
    
    if (e.type === 'dismissed') {
      setShowDobPicker(false);
      return;
    }
    if (selected) {
      const formattedDate = toYYYYMMDD(selected);
      console.log('Setting DOB to:', formattedDate);
      setDob(formattedDate);
      if (showAlert) {
        setShowAlert(false);
      }
    }
    setShowDobPicker(false);
  };

  const onSaveIosDob = () => {
    const formattedDate = toYYYYMMDD(dobDraft);
    console.log('iOS date picker - setting DOB to:', formattedDate);
    setDob(formattedDate);
    if (showAlert) {
      setShowAlert(false);
    }
    setShowDobPicker(false);
  };

  const onSave = async () => {
    console.log('=== SAVE BUTTON CLICKED ===');
    console.log('Form data:', { firstName, lastName, dob, gender, phoneCountryCode, phoneNumber });
    
    // Collect all missing fields
    const missing: string[] = [];
    
    if (firstName.trim().length === 0) {
      missing.push('First name');
      firstNameShake.trigger();
    }
    if (!dob || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      missing.push('Date of birth');
      dobShake.trigger();
    }
    const cleanedPhone = phoneNumber.replace(/\D/g, '');
    if (cleanedPhone.length < 10) {
      missing.push('Phone number (at least 10 digits)');
      phoneShake.trigger();
    }

    // Show animated alert if there are missing fields
    if (missing.length > 0) {
      setAlertMessage('Please fill in all required fields');
      setMissingFields(missing);
      setShowAlert(true);
      
      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        setShowAlert(false);
      }, 5000);
      
      return;
    }

    console.log('Validation passed, starting save...');
    setSaving(true);
    try {
      // 🔒 keep payload keys identical (backend contract)
      const payload: any = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dob,
        gender: gender || undefined,
        phoneCountryCode: phoneCountryCode.trim(),
        phoneNumber: cleanedPhone,
      };
      
      console.log('Sending payload to API:', payload);
      console.log('API URL:', process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:4000');
      
      const result = await updateMyProfile(payload);
      console.log('Profile saved successfully:', result);
      
      console.log('Attempting navigation to /(tabs)...');
      router.replace('/(tabs)');
      console.log('Navigation command sent');
    } catch (e: any) {
      console.error('Save failed with error:', e);
      console.error('Error details:', {
        message: e?.message,
        stack: e?.stack,
        name: e?.name
      });
      Alert.alert('Save failed', e?.message || 'Please try again.');
    } finally {
      console.log('Setting saving to false');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-600">Loading…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F7FBFF]">
      {/* Animated Alert for Missing Fields */}
      <AnimatedAlert
        visible={showAlert}
        message={alertMessage}
        fields={missingFields}
        onDismiss={() => setShowAlert(false)}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Friendly header */}
          <View className="items-center mb-4">
            {!!images?.logo && (
              <Image source={images.logo} style={{ width: 80, height: 80 }} />
            )}
            <Text className="text-2xl font-extrabold mt-2 text-[#0F172A]">
              Let’s get to know you! 🧸
            </Text>
            <Text className="text-sm text-gray-500 mt-1 text-center">
              A few quick details to make your AAC experience just right.
            </Text>

            {/* Progress hint */}
            <View className="flex-row items-center mt-3 bg-white px-3 py-2 rounded-2xl border border-blue-100">
              <Ionicons name="sparkles-outline" size={16} color="#2563EB" />
              <Text className="ml-2 text-xs font-semibold text-[#2563EB]">
                Step 1 of 2 · Profile basics
              </Text>
            </View>
          </View>

          {/* Card: First + Last Name */}
          <View className="bg-white rounded-3xl p-5 border border-gray-100 mb-4">
            <View className="flex-row items-center mb-3">
              <View className="w-9 h-9 rounded-full items-center justify-center bg-[#F0F9FF]">
                <Text style={{ fontSize: 18 }}>👦</Text>
              </View>
              <Text className="ml-2 font-extrabold text-[#0F172A]">Your Name</Text>
            </View>

            <Text className="text-xs font-bold text-gray-500 mb-1">First name</Text>
            <Animated.View style={firstNameShake.style}>
              <View
                className={`flex-row items-center rounded-2xl px-3 py-3 mb-2 border ${
                  firstNameError ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <Ionicons
                  name="person-outline"
                  size={18}
                  color={firstNameError ? '#DC2626' : '#6B7280'}
                />
                <TextInput
                  value={firstName}
                  onChangeText={(text) => {
                    setFirstName(text);
                    if (showAlert && text.trim().length > 0) {
                      setShowAlert(false);
                    }
                  }}
                  placeholder="e.g. Aarav"
                  placeholderTextColor="#9CA3AF"
                  className="ml-2 flex-1 text-[16px] text-[#0F172A]"
                />
              </View>
            </Animated.View>
            {!!firstNameError && (
              <Text className="text-xs text-red-600 mb-2">{firstNameError}</Text>
            )}

            <Text className="text-xs font-bold text-gray-500 mb-1">
              Last name (optional)
            </Text>
            <View className="flex-row items-center rounded-2xl px-3 py-3 border border-gray-200 bg-gray-50">
              <Ionicons name="id-card-outline" size={18} color="#6B7280" />
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                placeholder="e.g. Singh"
                placeholderTextColor="#9CA3AF"
                className="ml-2 flex-1 text-[16px] text-[#0F172A]"
              />
            </View>
          </View>

          {/* Card: Birthday (with picker) */}
          <View className="bg-white rounded-3xl p-5 border border-gray-100 mb-4">
            <View className="flex-row items-center mb-3">
              <View className="w-9 h-9 rounded-full items-center justify-center bg-[#FFF7ED]">
                <Text style={{ fontSize: 18 }}>🎂</Text>
              </View>
              <Text className="ml-2 font-extrabold text-[#0F172A]">Birthday</Text>
            </View>

            <Text className="text-xs font-bold text-gray-500 mb-1">Date of birth</Text>

            {/* Read-only box + Pick button (friendly for kids/parents) */}
            <Animated.View style={[dobShake.style, { flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
              <View
                className={`flex-1 flex-row items-center rounded-2xl px-3 py-1 border ${
                  dobError ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={dobError ? '#DC2626' : '#6B7280'}
                />
                <TextInput
                  value={dob}
                  onChangeText={handleManualDobInput}
                  placeholder="YYYY-MM-DD"
                  keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'number-pad'}
                  inputMode="numeric"
                  returnKeyType="done"
                  autoCorrect={false}
                  autoCapitalize="none"
                  style={{ flex: 1, marginLeft: 8, fontSize: 16, color: '#0F172A', paddingVertical: Platform.OS === 'ios' ? 12 : 8 }}
                />
              </View>

              <TouchableOpacity
                onPress={openDobPicker}
                activeOpacity={0.9}
                className="px-4 py-3 rounded-2xl bg-[#2563EB]"
              >
                <View className="flex-row items-center">
                  <Ionicons name="create-outline" size={18} color="#fff" />
                  <Text className="text-white font-extrabold text-[14px] ml-2">Pick</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>

            <Text className={`text-xs mt-1 ${dobError ? 'text-red-600' : 'text-gray-500'}`}>
              {dobError ? 'Please use format YYYY-MM-DD' : 'We use this to show age-wise tips and games.'}
            </Text>

            {/* ANDROID: inline native picker (one-shot) */}
            {Platform.OS === 'android' && showDobPicker && (
              <DateTimePicker
                value={dobDraft}
                mode="date"
                display="calendar"
                maximumDate={new Date()} // no future dates
                onChange={(e, selected) => onAndroidDateChange(e, selected || dobDraft)}
              />
            )}

            {/* iOS: modal with spinner to confirm/cancel */}
            {Platform.OS === 'ios' && (
              <Modal visible={showDobPicker} transparent animationType="slide">
                <Pressable
                  onPress={() => setShowDobPicker(false)}
                  style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.25)' }}
                />
                <View
                  style={{
                    backgroundColor: 'white',
                    paddingHorizontal: 16,
                    paddingTop: 12,
                    paddingBottom: 24,
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                  }}
                >
                  <View className="items-center mb-3">
                    <Text className="text-base font-extrabold text-[#0F172A]">Select DOB</Text>
                  </View>
                  <DateTimePicker
                    value={dobDraft}
                    mode="date"
                    display="spinner"
                    maximumDate={new Date()}
                    onChange={(_, d) => d && setDobDraft(d)}
                    style={{ alignSelf: 'center' }}
                  />
                  <View className="flex-row justify-end mt-3">
                    <TouchableOpacity
                      onPress={() => setShowDobPicker(false)}
                      className="px-4 py-2 rounded-xl bg-gray-200 mr-2"
                    >
                      <Text className="font-bold text-gray-800">Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={onSaveIosDob}
                      className="px-4 py-2 rounded-xl bg-[#2563EB]"
                    >
                      <Text className="font-bold text-white">Save</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            )}

            {/* WEB: simple date input fallback */}
            {Platform.OS === 'web' && showDobPicker && (
              <Modal visible transparent animationType="fade" onRequestClose={() => setShowDobPicker(false)}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                  <View style={{ backgroundColor: 'white', width: '100%', maxWidth: 420, borderRadius: 16, padding: 16 }}>
                    <Text className="text-base font-extrabold text-[#0F172A] mb-3">Select DOB</Text>
                    <View style={{ backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12 }}>
                      {/* @ts-ignore: web-only element */}
                      <input
                        type="date"
                        style={{ width: '100%', fontSize: 16, padding: 8, borderRadius: 8, border: '1px solid #E5E7EB' }}
                        max={new Date().toISOString().slice(0,10)}
                        value={toYYYYMMDD(dobDraft)}
                        onChange={(e) => {
                          const val = (e.target as HTMLInputElement).value;
                          if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
                            const [y,m,d] = val.split('-').map(Number);
                            setDobDraft(new Date(y, (m||1)-1, d||1));
                          }
                        }}
                      />
                    </View>
                    <View className="flex-row justify-end mt-3">
                      <TouchableOpacity onPress={() => setShowDobPicker(false)} className="px-4 py-2 rounded-xl bg-gray-200 mr-2">
                        <Text className="font-bold text-gray-800">Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => { 
                        setDob(toYYYYMMDD(dobDraft)); 
                        if (showAlert) {
                          setShowAlert(false);
                        }
                        setShowDobPicker(false); 
                      }} className="px-4 py-2 rounded-xl bg-[#2563EB]">
                        <Text className="font-bold text-white">Save</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>
            )}
          </View>

          {/* Card: Phone Number (compulsory) */}
          <View className="bg-white rounded-3xl p-5 border border-gray-100 mb-4">
            <View className="flex-row items-center mb-3">
              <View className="w-9 h-9 rounded-full items-center justify-center bg-[#FEF3C7]">
                <Text style={{ fontSize: 18 }}>📱</Text>
              </View>
              <Text className="ml-2 font-extrabold text-[#0F172A]">Phone Number</Text>
              <Text className="ml-2 text-xs text-red-600 font-bold">*</Text>
            </View>

            <Text className="text-xs font-bold text-gray-500 mb-1">Phone number (required)</Text>
            <Animated.View style={[phoneShake.style, { flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
              <View className={`flex-row items-center rounded-2xl px-3 py-3 border ${
                phoneError ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
              }`} style={{ width: 100 }}>
                <Ionicons
                  name="call-outline"
                  size={18}
                  color={phoneError ? '#DC2626' : '#6B7280'}
                />
                <TextInput
                  value={phoneCountryCode}
                  onChangeText={setPhoneCountryCode}
                  placeholder="+91"
                  placeholderTextColor="#9CA3AF"
                  className="ml-2 text-[16px] text-[#0F172A]"
                  keyboardType="phone-pad"
                  maxLength={5}
                />
              </View>
              <View className={`flex-1 flex-row items-center rounded-2xl px-3 py-3 border ${
                phoneError ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
              }`}>
                <Ionicons
                  name="phone-portrait-outline"
                  size={18}
                  color={phoneError ? '#DC2626' : '#6B7280'}
                />
                <TextInput
                  value={phoneNumber}
                  onChangeText={(text) => {
                    setPhoneNumber(text);
                    const cleaned = text.replace(/\D/g, '');
                    if (showAlert && cleaned.length >= 10) {
                      setShowAlert(false);
                    }
                  }}
                  placeholder="1234567890"
                  placeholderTextColor="#9CA3AF"
                  className="ml-2 flex-1 text-[16px] text-[#0F172A]"
                  keyboardType="phone-pad"
                  maxLength={15}
                />
              </View>
            </Animated.View>
            {!!phoneError && (
              <Text className="text-xs text-red-600 mt-1">{phoneError}</Text>
            )}
            <Text className="text-xs text-gray-500 mt-1">
              We'll use this to keep your account secure and send important updates.
            </Text>
          </View>

          {/* Card: Gender (chips) */}
          <View className="bg-white rounded-3xl p-5 border border-gray-100">
            <View className="flex-row items-center mb-3">
              <View className="w-9 h-9 rounded-full items-center justify-center bg-[#F0FDF4]">
                <Text style={{ fontSize: 18 }}>🧩</Text>
              </View>
              <Text className="ml-2 font-extrabold text-[#0F172A]">Gender (optional)</Text>
            </View>

            <View className="flex-row flex-wrap">
              {genderOptions.map((option) => {
                const active = gender === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setGender(option.value)}
                    activeOpacity={0.9}
                    className={`px-4 py-2 mr-2 mb-2 rounded-full border ${
                      active
                        ? 'bg-[#E0F2FE] border-[#38BDF8]'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                  >
                    <Text
                      className={`text-[13px] font-bold ${
                        active ? 'text-[#075985]' : 'text-[#374151]'
                      }`}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text className="text-xs text-gray-500 mt-1">
              You can skip this and add later in settings.
            </Text>
          </View>

          {/* Save button */}
          <TouchableOpacity
            onPress={onSave}
            disabled={saving}
            activeOpacity={0.9}
            className={`rounded-2xl py-4 mt-6 items-center ${
              saving ? 'bg-gray-400' : 'bg-[#2563EB]'
            }`}
          >
            <View className="flex-row items-center">
              <Ionicons name="save-outline" size={18} color="#fff" />
              <Text className="text-white font-extrabold text-[16px] ml-2">
                {saving ? 'Saving…' : 'Save and continue'}
              </Text>
            </View>
          </TouchableOpacity>

          <View className="items-center mt-3">
            <Text className="text-[12px] text-gray-500 text-center">
              We keep your details private. This helps us suggest the right AAC words & games. 💙
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
