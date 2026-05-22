import { Platform } from 'react-native';

/**
 * Never mix drivers on the same Animated.Value.
 * Split views: outer = translateX/Y only, inner = scale/rotate/opacity.
 */

/** translateX / translateY movement (outer Animated.View) */
export const NATIVE_MOVE = Platform.OS !== 'web';

/** scale, rotate, opacity (inner Animated.View — not on same node as left/top) */
export const NATIVE_EFFECT = Platform.OS !== 'web';

/** left, top, width, shadowOpacity */
export const NATIVE_LAYOUT = false;
