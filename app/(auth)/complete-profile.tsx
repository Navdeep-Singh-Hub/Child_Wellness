// app/(auth)/complete-profile.tsx
import { images } from '@/constants/images';
import { ensureUser, getMyProfile, updateMyProfile } from '@/utils/api';
import { useAuth } from '@clerk/clerk-expo';
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
    View,
} from 'react-native';

export default function CompleteProfile() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  // loading + saving
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // form state (⚠️ keep same keys; backend depends on these)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [dob, setDob]             = useState(''); // YYYY-MM-DD
  const [gender, setGender]       = useState('');

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
        if (!isSignedIn) return;
        await ensureUser();
        const p = await getMyProfile();

        // already complete? go home
        if (p.firstName && p.dob) {
          router.replace('/(tabs)');
          return;
        }

        setFirstName(p.firstName || '');
        setLastName(p.lastName || '');
        setDob((p as any).dob || '');      // keep same key
        setGender((p as any).gender || ''); // keep same key
      } catch {
        // silent — show form anyway
      } finally {
      setLoading(false);
      }
    })();
  }, [isSignedIn]);

  // helpers
  const toYYYYMMDD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
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
    }
    setShowDobPicker(false);
  };

  const onSaveIosDob = () => {
    const formattedDate = toYYYYMMDD(dobDraft);
    console.log('iOS date picker - setting DOB to:', formattedDate);
    setDob(formattedDate);
    setShowDobPicker(false);
  };

  const onSave = async () => {
    console.log('=== SAVE BUTTON CLICKED ===');
    console.log('Form data:', { firstName, lastName, dob, gender });
    
    if (firstName.trim().length === 0) {
      Alert.alert('Missing info', 'Please enter your first name.');
      return;
    }
    if (!dob || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      Alert.alert('Missing/invalid DOB', 'Please select your date of birth using the "Pick" button.');
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
      };
      
      console.log('Sending payload to API:', payload);
      console.log('API URL:', process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:4000');
      
      const result = await updateMyProfile(payload);
      console.log('Profile saved successfully:', result);
      
      console.log('Attempting navigation to /(tabs)...');
      router.push('/(tabs)');
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
                onChangeText={setFirstName}
                placeholder="e.g. Aarav"
                placeholderTextColor="#9CA3AF"
                className="ml-2 flex-1 text-[16px] text-[#0F172A]"
              />
            </View>
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
            <View className="flex-row items-center gap-2">
              <View
                className={`flex-1 flex-row items-center rounded-2xl px-3 py-3 border ${
                  dobError ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={dobError ? '#DC2626' : '#6B7280'}
                />
                <Text className="ml-2 text-[16px] text-[#0F172A]">
                  {dob || 'YYYY-MM-DD'}
                </Text>
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
          </View>

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
                      <TouchableOpacity onPress={() => { setDob(toYYYYMMDD(dobDraft)); setShowDobPicker(false); }} className="px-4 py-2 rounded-xl bg-[#2563EB]">
                        <Text className="font-bold text-white">Save</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>
            )}
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
