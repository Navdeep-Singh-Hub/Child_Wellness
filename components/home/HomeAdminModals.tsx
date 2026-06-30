import { HOME_COLORS } from '@/constants/homeDesign';
import { Ionicons } from '@expo/vector-icons';
import { type KioskSettingsTarget } from '@/utils/kioskAdmin';
import React from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

type Props = {
  showPin: boolean;
  showMenu: boolean;
  adminPin: string;
  showNetworkShortcuts: boolean;
  onPinChange: (v: string) => void;
  onPinSubmit: () => void;
  onPinClose: () => void;
  onMenuClose: () => void;
  onOpenSetting: (target: KioskSettingsTarget) => void;
  onReleaseKiosk: () => void;
};

export function HomeAdminModals({
  showPin,
  showMenu,
  adminPin,
  showNetworkShortcuts,
  onPinChange,
  onPinSubmit,
  onPinClose,
  onMenuClose,
  onOpenSetting,
  onReleaseKiosk,
}: Props) {
  return (
    <>
      <Modal visible={showPin} transparent animationType="fade" onRequestClose={onPinClose}>
        <View style={styles.backdrop}>
          <View style={styles.card}>
            <Text style={styles.title}>Admin Access</Text>
            <Text style={styles.body}>
              Enter PIN for display or system settings.
              {showNetworkShortcuts ? ' Wi‑Fi, Bluetooth, and mobile network are on the bottom bar.' : ''}
            </Text>
            <TextInput
              value={adminPin}
              onChangeText={onPinChange}
              secureTextEntry
              keyboardType="number-pad"
              maxLength={8}
              placeholder="PIN"
              placeholderTextColor={HOME_COLORS.inkFaint}
              style={styles.input}
              onSubmitEditing={onPinSubmit}
            />
            <View style={styles.actions}>
              <Pressable style={styles.secondary} onPress={onPinClose}>
                <Text style={styles.secondaryText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.primary} onPress={onPinSubmit}>
                <Text style={styles.primaryText}>Open</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showMenu} transparent animationType="slide" onRequestClose={onMenuClose}>
        <View style={styles.backdrop}>
          <View style={styles.card}>
            <Text style={styles.title}>Kiosk Admin</Text>
            <Text style={styles.body}>
              Settings open temporarily. Kiosk resumes when you return.
              {showNetworkShortcuts ? ' Use the connectivity bar at the bottom anytime.' : ''}
            </Text>
            <Pressable style={styles.menuBtn} onPress={() => onOpenSetting('display')}>
              <Ionicons name="sunny" size={20} color={HOME_COLORS.indigo} />
              <Text style={styles.menuText}>Display Settings</Text>
            </Pressable>
            <Pressable style={styles.menuBtn} onPress={() => onOpenSetting('settings')}>
              <Ionicons name="settings" size={20} color={HOME_COLORS.indigo} />
              <Text style={styles.menuText}>Full Settings</Text>
            </Pressable>
            {Platform.OS === 'android' ? (
              <Pressable style={[styles.menuBtn, styles.danger]} onPress={onReleaseKiosk}>
                <Ionicons name="exit-outline" size={20} color="#B91C1C" />
                <Text style={[styles.menuText, { color: '#B91C1C' }]}>Release kiosk</Text>
              </Pressable>
            ) : null}
            <Pressable style={styles.secondary} onPress={onMenuClose}>
              <Text style={styles.secondaryText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(12, 18, 34, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: HOME_COLORS.surface,
    borderRadius: 28,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 16,
  },
  title: { fontSize: 22, fontWeight: '900', color: HOME_COLORS.ink, marginBottom: 8 },
  body: { fontSize: 15, color: HOME_COLORS.inkMuted, lineHeight: 22, marginBottom: 18 },
  input: {
    borderWidth: 1,
    borderColor: HOME_COLORS.borderSubtle,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 20,
    fontWeight: '700',
    color: HOME_COLORS.ink,
    marginBottom: 18,
    backgroundColor: '#F8FAFC',
  },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  primary: { backgroundColor: HOME_COLORS.indigo, borderRadius: 14, paddingHorizontal: 18, paddingVertical: 12 },
  primaryText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  secondary: { backgroundColor: '#F1F5F9', borderRadius: 14, paddingHorizontal: 18, paddingVertical: 12, alignItems: 'center', marginTop: 4 },
  secondaryText: { color: HOME_COLORS.inkSoft, fontWeight: '800', fontSize: 15 },
  menuBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
  },
  menuText: { marginLeft: 12, color: '#1E3A8A', fontSize: 16, fontWeight: '800' },
  danger: { borderColor: '#FECACA', backgroundColor: '#FEF2F2' },
});
