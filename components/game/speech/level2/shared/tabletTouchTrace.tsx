import { useMemo, useState } from 'react';
import { PanResponder, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

export type TracePoint = { x: number; y: number };

/** Speech L2 curved-path games use MediaPipe on web; tablets use finger drag. */
export const USE_TABLET_TOUCH_TRACE = Platform.OS !== 'web';

export function isInCalibrationCenter(
  pos: TracePoint,
  gameRect: { width: number; height: number },
  boxSize = 100,
): boolean {
  if (gameRect.width <= 0 || gameRect.height <= 0) return false;
  const centerX = gameRect.width / 2;
  const centerY = gameRect.height / 2;
  return (
    Math.abs(pos.x - centerX) < boxSize && Math.abs(pos.y - centerY) < boxSize
  );
}

export const TABLET_CALIBRATION_HINT =
  '👆 Touch and hold the center box to start';

export const WEB_CALIBRATION_HINT =
  '👆 Show your index finger in the center box';

export function useTabletFingerPan(enabled: boolean) {
  const [touchPos, setTouchPos] = useState<TracePoint | null>(null);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => USE_TABLET_TOUCH_TRACE && enabled,
        onMoveShouldSetPanResponder: () => USE_TABLET_TOUCH_TRACE && enabled,
        onPanResponderGrant: (evt) => {
          const { locationX, locationY } = evt.nativeEvent;
          setTouchPos({ x: locationX, y: locationY });
        },
        onPanResponderMove: (evt) => {
          const { locationX, locationY } = evt.nativeEvent;
          setTouchPos({ x: locationX, y: locationY });
        },
        onPanResponderRelease: () => setTouchPos(null),
        onPanResponderTerminate: () => setTouchPos(null),
      }),
    [enabled],
  );

  return {
    touchPos,
    panHandlers: USE_TABLET_TOUCH_TRACE ? panResponder.panHandlers : ({} as Record<string, unknown>),
  };
}

type TabletStartButtonProps = {
  visible: boolean;
  onStart: () => void;
  label?: string;
};

/** Shown on tablet when camera hand-tracking is skipped — starts round without center hold. */
export function TabletTraceStartButton({
  visible,
  onStart,
  label = 'Tap to Start',
}: TabletStartButtonProps) {
  if (!USE_TABLET_TOUCH_TRACE || !visible) return null;
  return (
    <View style={tabletStartStyles.wrap} pointerEvents="box-none">
      <Pressable style={tabletStartStyles.btn} onPress={onStart}>
        <Text style={tabletStartStyles.btnText}>{label}</Text>
      </Pressable>
    </View>
  );
}

const tabletStartStyles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  btn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
