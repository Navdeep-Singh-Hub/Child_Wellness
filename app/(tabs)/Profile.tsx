import { useAuth } from '@/app/_layout';
import { getMyProfile, updateMyProfile } from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import Reanimated, {
  Extrapolation,
  FadeInDown,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const HEADER_HEIGHT = 300;

const AnimatedBlurView = Reanimated.createAnimatedComponent(BlurView);

export default function ProfileScreen() {
  const { logout } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Placeholder user info
  const user = { fullName: '', username: '', imageUrl: '', primaryEmail: '' };

  const scrollY = useSharedValue(0);

  useEffect(() => {
    (async () => {
      try {
        const p = await getMyProfile();
        setFirstName(p.firstName || '');
        setLastName(p.lastName || '');
        setEmail(p.email || (user?.primaryEmail ?? ''));
        setDob(p.dob || null);
      } catch {
        // ignore
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const onSave = async () => {
    try {
      setSaving(true);
      await updateMyProfile({ firstName, lastName });
      Alert.alert('Saved', 'Profile updated successfully ✨');
    } catch (e: any) {
      Alert.alert('Save failed', e?.message || 'Please try again');
    } finally {
      setSaving(false);
    }
  };

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const headerStyle = useAnimatedStyle(() => {
    return {
      height: HEADER_HEIGHT,
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]
          ),
        },
        {
          scale: interpolate(
            scrollY.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [2, 1, 1]
          ),
        },
      ],
    };
  });

  const avatarStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        scrollY.value,
        [0, HEADER_HEIGHT / 2],
        [1, 0],
        Extrapolation.CLAMP
      ),
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            [0, HEADER_HEIGHT / 2],
            [0, 50],
            Extrapolation.CLAMP
          ),
        },
        {
          scale: interpolate(
            scrollY.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [1.5, 1, 0.5],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  if (!loaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Parallax Header Background */}
      <Reanimated.View style={[styles.headerBackground, headerStyle]}>
        <LinearGradient
          colors={['#4F46E5', '#818CF8', '#C7D2FE']}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.headerOverlay} />
      </Reanimated.View>

      <Reanimated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          {/* Avatar Section */}
          <Reanimated.View style={[styles.avatarContainer, avatarStyle]}>
            <View style={styles.avatarWrapper}>
              {user?.imageUrl ? (
                <Image source={{ uri: user.imageUrl }} style={styles.avatarImage} />
              ) : (
                <LinearGradient
                  colors={['#E0E7FF', '#C7D2FE']}
                  style={styles.avatarPlaceholder}
                >
                  <Ionicons name="person" size={60} color="#6366F1" />
                </LinearGradient>
              )}
              <View style={styles.editBadge}>
                <Ionicons name="camera" size={16} color="#fff" />
              </View>
            </View>
            <Text style={styles.userName}>
              {firstName || 'Your Profile'} {lastName}
            </Text>
            <Text style={styles.userEmail}>{email || 'Signed in'}</Text>
          </Reanimated.View>

          {/* Form Card */}
          <Reanimated.View
            entering={FadeInDown.delay(200).springify()}
            style={styles.formCardWrapper}
          >
            <BlurView intensity={80} tint="light" style={styles.formCard}>
              <Text style={styles.sectionTitle}>Personal Details</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>First Name</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={20} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="Enter first name"
                    style={styles.input}
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Last Name</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="people-outline" size={20} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Enter last name"
                    style={styles.input}
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={[styles.inputWrapper, styles.disabledInput]}>
                  <Ionicons name="mail-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                  <Text style={styles.inputText}>{email}</Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Date of Birth</Text>
                <View style={[styles.inputWrapper, styles.disabledInput]}>
                  <Ionicons name="calendar-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                  <Text style={styles.inputText}>{dob || 'Not set'}</Text>
                </View>
              </View>

            </BlurView>
          </Reanimated.View>

          {/* Save Button */}
          <Reanimated.View entering={FadeInDown.delay(400).springify()}>
            <Pressable
              onPress={onSave}
              disabled={saving}
              style={({ pressed }) => [
                styles.saveButton,
                { transform: [{ scale: pressed ? 0.98 : 1 }] }
              ]}
            >
              <LinearGradient
                colors={saving ? ['#94A3B8', '#CBD5E1'] : ['#4F46E5', '#6366F1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveButtonGradient}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="save-outline" size={20} color="#fff" />
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </>
                )}
              </LinearGradient>
            </Pressable>
          </Reanimated.View>

          {/* Logout Button */}
          <Pressable
            onPress={async () => {
              await logout();
              router.replace('/(public)');
            }}
            style={styles.logoutButton}
          >
            <Text style={styles.logoutText}>Sign Out</Text>
          </Pressable>

        </View>
      </Reanimated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    overflow: 'hidden',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  contentContainer: {
    paddingTop: HEADER_HEIGHT - 60,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 4,
    textShadowColor: 'rgba(255,255,255,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    fontWeight: '500',
  },
  formCardWrapper: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
    backgroundColor: '#fff',
  },
  formCard: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
  },
  disabledInput: {
    backgroundColor: '#F8FAFC',
    borderColor: '#F1F5F9',
  },
  inputText: {
    fontSize: 16,
    color: '#64748B',
  },
  saveButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 16,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  logoutButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  logoutText: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 15,
  },
});
