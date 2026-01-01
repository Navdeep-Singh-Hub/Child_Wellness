/**
 * BlowMeter Component
 * Visual indicator showing blow intensity (0-100%)
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  intensity: number; // 0-1
  isBlowing: boolean;
};

export default function BlowMeter({ intensity, isBlowing }: Props) {
  const { width } = useWindowDimensions();
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const isTablet = width >= 768;
  const isMobile = width < 600;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: intensity,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [intensity]);

  const meterWidth = isTablet ? 400 : isMobile ? 280 : 350;
  const meterHeight = isTablet ? 24 : isMobile ? 16 : 20;

  // Determine color based on intensity
  const getColor = () => {
    if (intensity < 0.3) return ['#4ADE80', '#22C55E']; // Green
    if (intensity < 0.6) return ['#FBBF24', '#F59E0B']; // Yellow
    return ['#EF4444', '#DC2626']; // Red
  };

  const colors = getColor();

  return (
    <View style={[styles.container, { width: meterWidth, height: meterHeight }]}>
      <View style={[styles.meterBackground, { width: meterWidth, height: meterHeight }]}>
        <Animated.View
          style={[
            styles.meterFill,
            {
              width: animatedWidth.interpolate({
                inputRange: [0, 1],
                outputRange: [0, meterWidth],
              }),
              height: meterHeight,
            },
          ]}
        >
          <LinearGradient
            colors={colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>
      {isBlowing && (
        <Animated.View
          style={[
            styles.glow,
            {
              width: animatedWidth.interpolate({
                inputRange: [0, 1],
                outputRange: [0, meterWidth],
              }),
              height: meterHeight,
              opacity: intensity > 0.3 ? 0.6 : 0,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  meterBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  meterFill: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 10,
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
});

