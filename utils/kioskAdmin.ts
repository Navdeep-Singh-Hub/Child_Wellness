import { NativeModules, Platform } from 'react-native';

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
