import { NativeModules, Platform } from 'react-native';

/** Set true to restore Wi‑Fi / Bluetooth / Mobile shortcuts (bottom bar + slide menus). */
export const SHOW_KIOSK_NETWORK_SHORTCUTS = false;

export type KioskSettingsTarget =
  | 'settings'
  | 'wifi'
  | 'bluetooth'
  | 'display'
  | 'mobile_network';

type KioskAdminModule = {
  openSettings?: (target: KioskSettingsTarget) => Promise<boolean>;
  releaseDeviceOwner?: () => Promise<boolean>;
};

const nativeKioskAdmin = NativeModules.KioskAdmin as KioskAdminModule | undefined;

export async function openKioskSettings(target: KioskSettingsTarget = 'settings') {
  if (Platform.OS !== 'android' || !nativeKioskAdmin?.openSettings) {
    return false;
  }

  return nativeKioskAdmin.openSettings(target);
}

/** Exit device-owner / lock task so the app can be uninstalled (Android kiosk builds only). */
export async function releaseKioskDeviceOwner() {
  if (Platform.OS !== 'android' || !nativeKioskAdmin?.releaseDeviceOwner) {
    return false;
  }

  return nativeKioskAdmin.releaseDeviceOwner();
}
