import { requireNativeViewManager } from 'expo-modules-core';
import React from 'react';
import { Platform, View, ViewProps } from 'react-native';

type NativeVisionViewProps = ViewProps & { active?: boolean };

const NativeVisionView =
  Platform.OS === 'android'
    ? requireNativeViewManager<NativeVisionViewProps>('ChildWellnessVision')
    : null;

export const VisionTrackingView: React.FC<{ active?: boolean; style?: ViewProps['style'] }> = ({
  active = true,
  style,
}) => {
  if (!NativeVisionView) return <View style={style} />;
  return <NativeVisionView active={active} style={[{ flex: 1 }, style]} />;
};
