import type { GestureResponderEvent } from 'react-native';

/** Distance from tap to target center (game-area coordinates). */
export function tapDistanceToTarget(
  locationX: number,
  locationY: number,
  targetX: number,
  targetY: number,
): number {
  return Math.sqrt(Math.pow(locationX - targetX, 2) + Math.pow(locationY - targetY, 2));
}

/** True when tap is within tolerance of a circular target (game-area coords). */
export function isTapNearTarget(
  event: GestureResponderEvent,
  targetX: number,
  targetY: number,
  targetSize: number,
  tolerance = 50,
): boolean {
  const { locationX, locationY } = event.nativeEvent;
  return tapDistanceToTarget(locationX, locationY, targetX, targetY) <= tolerance + targetSize / 2;
}

export function getGameAreaTap(event: GestureResponderEvent) {
  return { x: event.nativeEvent.locationX, y: event.nativeEvent.locationY };
}
