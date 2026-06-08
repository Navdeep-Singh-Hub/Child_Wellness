import { NATIVE_EFFECT } from '@/utils/animation';
import React from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

export const SESSION5_AVATAR_SIZE = 140;
export const EYE_LOOK_OFFSET = 8;

export type LookDirection = 'left' | 'right' | 'center';

export function getEyeLookOffset(direction: LookDirection): number {
  if (direction === 'left') return -EYE_LOOK_OFFSET;
  if (direction === 'right') return EYE_LOOK_OFFSET;
  return 0;
}

export function animateAvatarEyes(
  avatarEyeX: Animated.Value,
  direction: LookDirection,
  duration = 400,
) {
  Animated.timing(avatarEyeX, {
    toValue: getEyeLookOffset(direction),
    duration,
    easing: Easing.out(Easing.quad),
    useNativeDriver: NATIVE_EFFECT,
  }).start();
}

export function resetAvatarEyes(avatarEyeX: Animated.Value) {
  avatarEyeX.setValue(0);
}

export function getSideObjectCenterX(direction: 'left' | 'right', screenWidth: number): number {
  return direction === 'left' ? screenWidth * 0.15 : screenWidth * 0.85;
}

export function getThreeColumnObjectCenterX(
  position: 'left' | 'center' | 'right',
  screenWidth: number,
): number {
  if (position === 'left') return screenWidth * 0.2;
  if (position === 'center') return screenWidth / 2;
  return screenWidth * 0.8;
}

/** Hand shown below the target object — points up toward the object. */
export function getPointingHandEmoji(): string {
  return '👆';
}

export const OBJECT_TAP_HAND_SIZE = 48;
export const OBJECT_TAP_HAND_OFFSET = 14;

export function getObjectTapHandPosition(
  objectCenterX: number,
  objectCenterY: number,
  objectSize: number,
) {
  return {
    left: objectCenterX - OBJECT_TAP_HAND_SIZE / 2,
    top: objectCenterY + objectSize / 2 + OBJECT_TAP_HAND_OFFSET,
  };
}

type ObjectTapHandProps = {
  objectCenterX: number;
  objectCenterY: number;
  objectSize: number;
  opacity: Animated.Value;
  scale?: Animated.Value;
  visible: boolean;
};

export function ObjectTapHand({
  objectCenterX,
  objectCenterY,
  objectSize,
  opacity,
  scale,
  visible,
}: ObjectTapHandProps) {
  if (!visible) return null;

  const { left, top } = getObjectTapHandPosition(objectCenterX, objectCenterY, objectSize);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        handStyles.container,
        {
          left,
          top,
          opacity,
          transform: scale ? [{ scale }] : undefined,
        },
      ]}
    >
      <Text style={handStyles.emoji}>{getPointingHandEmoji()}</Text>
    </Animated.View>
  );
}

type FaceProps = {
  avatarEyeX: Animated.Value;
};

export function PointingAvatarFace({ avatarEyeX }: FaceProps) {
  return (
    <View style={faceStyles.face}>
      <View style={faceStyles.eyesContainer}>
        <View style={faceStyles.eye}>
          <Animated.View
            style={[faceStyles.eyeball, { transform: [{ translateX: avatarEyeX }] }]}
          >
            <View style={faceStyles.pupil} />
          </Animated.View>
        </View>
        <View style={faceStyles.eye}>
          <Animated.View
            style={[faceStyles.eyeball, { transform: [{ translateX: avatarEyeX }] }]}
          >
            <View style={faceStyles.pupil} />
          </Animated.View>
        </View>
      </View>
      <View style={faceStyles.smile} />
    </View>
  );
}

type ArmProps = {
  armRotation: Animated.Value;
  armOpacity: Animated.Value;
  armRaiseY?: Animated.Value;
  visible: boolean;
};

export function PointingArm({ armRotation, armOpacity, armRaiseY, visible }: ArmProps) {
  if (!visible) return null;

  const rotation = {
    rotate: armRotation.interpolate({
      inputRange: [-180, 180],
      outputRange: ['-180deg', '180deg'],
    }),
  };

  return (
    <Animated.View
      style={[
        armStyles.arm,
        {
          transform: armRaiseY ? [{ translateY: armRaiseY }, rotation] : [rotation],
          opacity: armOpacity,
        },
      ]}
    >
      <View style={armStyles.armLine} />
      <View style={armStyles.hand}>
        <Text style={armStyles.handEmoji}>👉</Text>
      </View>
    </Animated.View>
  );
}

const faceStyles = StyleSheet.create({
  face: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyesContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 8,
  },
  eye: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  eyeball: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pupil: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0F172A',
  },
  smile: {
    width: 36,
    height: 16,
    borderBottomWidth: 3,
    borderBottomColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 18,
    marginTop: 2,
  },
});

const armStyles = StyleSheet.create({
  arm: {
    position: 'absolute',
    width: 58,
    height: 10,
    backgroundColor: '#2563EB',
    borderRadius: 5,
    top: SESSION5_AVATAR_SIZE / 2 - 5,
    left: SESSION5_AVATAR_SIZE / 2,
    transformOrigin: 'left center',
  },
  armLine: {
    flex: 1,
    height: 10,
    backgroundColor: '#2563EB',
    borderRadius: 5,
  },
  hand: {
    position: 'absolute',
    right: -22,
    top: -13,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handEmoji: {
    fontSize: 28,
  },
});

const handStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: OBJECT_TAP_HAND_SIZE,
    height: OBJECT_TAP_HAND_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 150,
    elevation: 12,
  },
  emoji: {
    fontSize: 44,
    textAlign: 'center',
  },
});
