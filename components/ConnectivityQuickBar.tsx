import { Ionicons } from '@expo/vector-icons';
import React, { useCallback } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { openKioskSettings, type KioskSettingsTarget } from '@/utils/kioskAdmin';

/** Extra lift when device reports 0 insets (common in immersive / kiosk). */
const ANDROID_MIN_BOTTOM_INSET = 28;

/**
 * Floating shortcuts to system Wi‑Fi / Bluetooth / mobile network (Android kiosk).
 * Absolute + high elevation so full-screen games don’t paint over it; safe-area fallback for Lenovo-style tablets.
 */
export default function ConnectivityQuickBar() {
  const insets = useSafeAreaInsets();

  const open = useCallback(async (target: KioskSettingsTarget) => {
    try {
      const ok = await openKioskSettings(target);
      if (!ok) {
        Alert.alert(
          'Network shortcuts unavailable',
          'This needs the custom Android app build (with KioskAdmin). Expo Go and some dev builds do not include it — install the latest preview APK from EAS.',
        );
      }
    } catch {
      Alert.alert('Could not open settings', 'Please try again or reconnect the device with ADB.');
    }
  }, []);

  if (Platform.OS !== 'android') {
    return null;
  }

  const bottomPad = Math.max(insets.bottom, ANDROID_MIN_BOTTOM_INSET) + 6;

  return (
    <View
      style={[styles.floating, { paddingBottom: bottomPad }]}
      accessibilityRole="toolbar"
      pointerEvents="box-none"
    >
      <View style={styles.card}>
        <Text style={styles.hint}>Wi‑Fi / network</Text>
        <View style={styles.row}>
          <Pressable
            style={styles.chip}
            onPress={() => open('wifi')}
            accessibilityLabel="Open Wi‑Fi settings"
          >
            <Ionicons name="wifi" size={22} color="#FFFFFF" />
            <Text style={styles.label}>Wi‑Fi</Text>
          </Pressable>
          <Pressable
            style={styles.chip}
            onPress={() => open('bluetooth')}
            accessibilityLabel="Open Bluetooth settings"
          >
            <Ionicons name="bluetooth" size={22} color="#FFFFFF" />
            <Text style={styles.label}>Bluetooth</Text>
          </Pressable>
          <Pressable
            style={styles.chip}
            onPress={() => open('mobile_network')}
            accessibilityLabel="Open mobile network settings"
          >
            <Ionicons name="cellular" size={22} color="#FFFFFF" />
            <Text style={styles.label}>Mobile</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  floating: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 8000,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  card: {
    width: '100%',
    maxWidth: 560,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    paddingTop: 8,
    paddingHorizontal: 10,
    paddingBottom: 4,
    borderWidth: 2,
    borderColor: '#38BDF8',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 28,
  },
  hint: {
    alignSelf: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
