// app/(tabs)/Profile.tsx  — animated + gradient version
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
// at top
import { router } from 'expo-router';
import { useAuth } from '@/app/_layout';

// inside component:


import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { getMyProfile, updateMyProfile } from '@/utils/api';

export default function ProfileScreen() {
  // TODO: use Auth0 useAuth()
  // const { signOut, isSignedIn } = useAuth();
  // const { user } = useUser();
  const { logout } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [email,     setEmail]     = useState('');
  const [dob,       setDob]       = useState<string | null>(null);
  // Placeholder: user info (
  const user = { fullName: '', username: '', imageUrl: '', primaryEmail: '' };

  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // --- Simple entrance animations (no extra libs) ---
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(24)).current; // vertical slide-in
  const pulse = useRef(new Animated.Value(1)).current;  // save button pulse

  useEffect(() => {
    (async () => {
      try {
        // Only call API if user is signed in
        if (!user) { // Assuming user is null or undefined if not logged in
          setLoaded(true);
          Animated.parallel([
            Animated.timing(fade, { toValue: 1, duration: 550, useNativeDriver: true }),
            Animated.timing(slide, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          ]).start();
          return;
        }

        const p = await getMyProfile();
        setFirstName(p.firstName || '');
        setLastName(p.lastName || '');
        setEmail(p.email || (user?.primaryEmail ?? ''));
        setDob(p.dob || null);
      } catch {
        // ignore
      } finally {
        setLoaded(true);
        Animated.parallel([
          Animated.timing(fade, { toValue: 1, duration: 550, useNativeDriver: true }),
          Animated.timing(slide, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]).start();
      }
    })();
  }, []); // Removed isSignedIn from dependency array

  // Gentle pulse on the Save button when saving
  useEffect(() => {
    if (!saving) return;
    pulse.setValue(1);
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.04, duration: 320, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1.0, duration: 320, useNativeDriver: true }),
      ]),
      { iterations: 3 }
    ).start();
  }, [saving]);

  const onSave = async () => {
    try {
      setSaving(true);
      await updateMyProfile({ firstName, lastName }); // <- backend contract unchanged
      Alert.alert('Saved', 'Profile updated');
    } catch (e: any) {
      Alert.alert('Save failed', e?.message || 'Please try again');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {/* Gradient background */}
      <LinearGradient
        colors={['#DDEBFF', '#F8F6FF', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', inset: 0 }}
      />

      {/* Header card */}
      <Animated.View
        style={{
          opacity: fade,
          transform: [{ translateY: slide }],
          paddingHorizontal: 16,
          paddingTop: 16,
          marginTop: 40,
          marginBottom: 13,
        }}
      >
        <View
          style={{
            backgroundColor: 'rgba(255,255,255,0.9)',
            borderRadius: 24,
            padding: 16,
            borderWidth: 1,
            borderColor: 'rgba(17,17,17,0.06)',
            shadowColor: '#000',
            shadowOpacity: 0.08,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 6 },
            elevation: 4,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {user?.imageUrl ? (
              <Image source={{ uri: user.imageUrl }} style={{ width: 72, height: 72, borderRadius: 999 }} />
            ) : (
              <View style={{ width: 72, height: 72, borderRadius: 999, backgroundColor: '#E5E7EB' }} />
            )}

            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ fontSize: 20, fontWeight: '800', color: '#111827' }}>
                {user?.fullName || user?.username || 'Your profile'}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                <Ionicons name="mail-outline" size={14} color="#6B7280" />
                <Text style={{ marginLeft: 6, color: '#6B7280' }}>
                  {user?.primaryEmail || 'Signed in'}
                </Text>
              </View>

              {/* tiny badges */}
              <View style={{ flexDirection: 'row', marginTop: 8 }}>
                <View style={{ backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, marginRight: 8 }}>
                  <Text style={{ color: '#3730A3', fontWeight: '800', fontSize: 12 }}>AAC</Text>
                </View>
                <View style={{ backgroundColor: '#ECFEFF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 }}>
                  <Text style={{ color: '#0E7490', fontWeight: '800', fontSize: 12 }}>Kid-friendly</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
                onPress={async () => {
                  try {
                    await logout();
                  } finally {
                    // Send user back to auth stack
                    router.replace('/(public)');
                  }
                }}
                style={{ marginLeft: 'auto', backgroundColor: '#EF4444', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999 }}
                activeOpacity={0.9}
            >
                <Text style={{ color: 'white', fontWeight: '700' }}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Body */}
      <Animated.View
        style={{
          flex: 1,
          opacity: fade,
          transform: [{ translateY: slide }],
        }}
      >
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 28 }}
          bounces={false}
          overScrollMode="never"
          showsVerticalScrollIndicator={false}
        >
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 8 }}>
            Your information
          </Text>

          {/* Info card */}
          <View
            style={{
              backgroundColor: 'rgba(255,255,255,0.92)',
              borderRadius: 24,
              padding: 16,
              borderWidth: 1,
              borderColor: 'rgba(17,17,17,0.06)',
              shadowColor: '#000',
              shadowOpacity: 0.08,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 6 },
              elevation: 4,
            }}
          >
            {/* Email (read only) */}
            <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Email</Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#F3F4F6',
                borderRadius: 14,
                paddingHorizontal: 12,
                paddingVertical: 12,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: '#E5E7EB',
              }}
            >
              <Ionicons name="at-outline" size={18} color="#6B7280" />
              <Text style={{ marginLeft: 8, color: '#111827' }}>
                {email}
              </Text>
            </View>

            {/* First name */}
            <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>First name</Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#F9FAFB',
                borderRadius: 14,
                paddingHorizontal: 12,
                paddingVertical: 12,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: '#E5E7EB',
              }}
            >
              <Ionicons name="person-outline" size={18} color="#6B7280" />
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder="First name"
                placeholderTextColor="#9CA3AF"
                style={{ marginLeft: 8, flex: 1, color: '#111827' }}
                editable={loaded && !saving}
              />
            </View>

            {/* Last name */}
            <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Last name</Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#F9FAFB',
                borderRadius: 14,
                paddingHorizontal: 12,
                paddingVertical: 12,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: '#E5E7EB',
              }}
            >
              <Ionicons name="id-card-outline" size={18} color="#6B7280" />
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                placeholder="Last name"
                placeholderTextColor="#9CA3AF"
                style={{ marginLeft: 8, flex: 1, color: '#111827' }}
                editable={loaded && !saving}
              />
            </View>

            {/* DOB (read only) */}
            <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Date of birth</Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#F3F4F6',
                borderRadius: 14,
                paddingHorizontal: 12,
                paddingVertical: 12,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: '#E5E7EB',
              }}
            >
              <Ionicons name="calendar-outline" size={18} color="#6B7280" />
              <Text style={{ marginLeft: 8, color: '#111827' }}>
                {dob ?? 'Not set'}
              </Text>
            </View>

            {/* Save button with subtle pulse while saving */}
            <Animated.View style={{ transform: [{ scale: pulse }] }}>
              <TouchableOpacity
                onPress={onSave}
                activeOpacity={0.9}
                disabled={saving}
                style={{
                  backgroundColor: saving ? '#9CA3AF' : '#2563EB',
                  borderRadius: 14,
                  paddingVertical: 14,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="sparkles-outline" size={18} color="#fff" />
                <Text style={{ color: 'white', fontWeight: '800', marginLeft: 8 }}>
                  {saving ? 'Saving…' : 'Save changes'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Fun footer note */}
          <View style={{ alignItems: 'center', marginTop: 24 }}>
            <Text style={{ fontSize: 12, color: '#6B7280', textAlign: 'center' }}>
              Tip: Keeping your name updated helps personalize the AAC grid and games ✨
            </Text>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}
