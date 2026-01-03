/**
 * Round Success Animation Component
 * Displays eye-pleasing celebration animation with sound after round completion
 */

import { playSuccessSound } from '@/utils/successSound';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import Svg, { Circle, Defs, G, Path, RadialGradient, Stop } from 'react-native-svg';

type Props = {
  visible: boolean;
  stars?: number; // Optional: number of stars earned
  onAnimationComplete?: () => void; // Callback when animation finishes
};

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  opacity: Animated.Value;
  scale: Animated.Value;
  color: string;
}

const PARTICLE_COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#FFE66D', '#FF8C94', '#A8E6CF'];

export default function RoundSuccessAnimation({
  visible,
  stars,
  onAnimationComplete,
}: Props) {
  const { width, height } = useWindowDimensions();
  const centerX = width / 2;
  const centerY = height / 2;
  const isTablet = width >= 768;
  const isMobile = width < 600;

  const [particles, setParticles] = useState<Particle[]>([]);
  const starScale = useRef(new Animated.Value(0)).current;
  const starRotation = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(0)).current;
  const sparkleScale = useRef(new Animated.Value(0)).current;
  const hasPlayedSound = useRef(false);
  const gradientId = useRef(`starGradient-${Math.random().toString(36).substr(2, 9)}`).current;

  useEffect(() => {
    if (visible) {
      // Play success sound
      if (!hasPlayedSound.current) {
        playSuccessSound();
        hasPlayedSound.current = true;
      }

      // Create particles
      const newParticles: Particle[] = [];
      for (let i = 0; i < 20; i++) {
        const angle = (Math.PI * 2 * i) / 20;
        newParticles.push({
          id: i,
          x: centerX,
          y: centerY,
          angle,
          speed: 2 + Math.random() * 3,
          opacity: new Animated.Value(1),
          scale: new Animated.Value(0),
          color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
        });
      }
      setParticles(newParticles);

      // Animate container fade in
      Animated.timing(containerOpacity, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();

      // Animate stars - scale up with bounce
      Animated.parallel([
        Animated.sequence([
          Animated.spring(starScale, {
            toValue: 1.2,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.spring(starScale, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(starRotation, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.spring(sparkleScale, {
            toValue: 1.1,
            tension: 40,
            friction: 6,
            useNativeDriver: true,
          }),
          Animated.spring(sparkleScale, {
            toValue: 1,
            tension: 40,
            friction: 6,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      // Animate particles
      newParticles.forEach((particle) => {
        Animated.parallel([
          Animated.timing(particle.opacity, {
            toValue: 0,
            duration: 1500,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(particle.scale, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.back(1.5)),
            useNativeDriver: true,
          }),
        ]).start();
      });

      // Hide after animation completes
      setTimeout(() => {
        Animated.timing(containerOpacity, {
          toValue: 0,
          duration: 300,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }).start(() => {
          // Reset for next time
          starScale.setValue(0);
          starRotation.setValue(0);
          sparkleScale.setValue(0);
          hasPlayedSound.current = false;
          onAnimationComplete?.();
        });
      }, 2000);
    } else {
      // Reset when hidden
      starScale.setValue(0);
      starRotation.setValue(0);
      sparkleScale.setValue(0);
      containerOpacity.setValue(0);
      hasPlayedSound.current = false;
    }
  }, [visible, centerX, centerY, onAnimationComplete]);

  if (!visible) return null;

  const starSize = isTablet ? 120 : isMobile ? 80 : 100;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: containerOpacity,
        },
      ]}
      pointerEvents="none"
    >
      {/* Particles/Sparkles */}
      {particles.map((particle) => {
        const distance = 150;
        const translateX = distance * Math.cos(particle.angle);
        const translateY = distance * Math.sin(particle.angle);

        const animatedStyle = {
          opacity: particle.opacity,
          transform: [
            {
              translateX: particle.scale.interpolate({
                inputRange: [0, 1],
                outputRange: [0, translateX],
              }),
            },
            {
              translateY: particle.scale.interpolate({
                inputRange: [0, 1],
                outputRange: [0, translateY],
              }),
            },
            { scale: particle.scale },
          ],
        };

        return (
          <Animated.View
            key={particle.id}
            style={[
              styles.particle,
              {
                left: centerX,
                top: centerY,
              },
              animatedStyle,
            ]}
          >
            <Svg width={16} height={16} viewBox="0 0 16 16">
              <Path
                d="M8 0 L9.5 6 L16 7.5 L9.5 9 L8 15 L6.5 9 L0 7.5 L6.5 6 Z"
                fill={particle.color}
              />
            </Svg>
          </Animated.View>
        );
      })}

      {/* Main Star - Rotating */}
      <Animated.View
        style={[
          styles.starContainer,
          {
            top: centerY - starSize / 2,
            left: centerX - starSize / 2,
            transform: [
              { scale: starScale },
              {
                rotate: starRotation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
          },
        ]}
      >
        <Svg width={starSize} height={starSize} viewBox="0 0 100 100">
          <Defs>
            <RadialGradient id={gradientId} cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#FFD700" stopOpacity="1" />
              <Stop offset="100%" stopColor="#FFA500" stopOpacity="0.9" />
            </RadialGradient>
          </Defs>
          <G transform="translate(50, 50)">
            {/* Large star */}
            <Path
              d="M 0 -40 L 12 -12 L 40 -12 L 16 8 L 24 36 L 0 20 L -24 36 L -16 8 L -40 -12 L -12 -12 Z"
              fill={`url(#${gradientId})`}
              stroke="#FFE66D"
              strokeWidth="2"
            />
            {/* Small sparkles around */}
            <G transform="rotate(0)">
              <Circle cx={0} cy={-50} r="4" fill="#FFE66D" opacity="0.8" />
            </G>
            <G transform="rotate(72)">
              <Circle cx={0} cy={-50} r="4" fill="#FFE66D" opacity="0.8" />
            </G>
            <G transform="rotate(144)">
              <Circle cx={0} cy={-50} r="4" fill="#FFE66D" opacity="0.8" />
            </G>
            <G transform="rotate(216)">
              <Circle cx={0} cy={-50} r="4" fill="#FFE66D" opacity="0.8" />
            </G>
            <G transform="rotate(288)">
              <Circle cx={0} cy={-50} r="4" fill="#FFE66D" opacity="0.8" />
            </G>
          </G>
        </Svg>
      </Animated.View>

      {/* Sparkle Rings */}
      <Animated.View
        style={[
          styles.sparkleRing,
          {
            top: centerY - (starSize * 1.5) / 2,
            left: centerX - (starSize * 1.5) / 2,
            transform: [{ scale: sparkleScale }],
          },
        ]}
      >
        <Svg width={starSize * 1.5} height={starSize * 1.5} viewBox="0 0 200 200">
          <Circle
            cx={100}
            cy={100}
            r={80}
            fill="none"
            stroke="#FFD700"
            strokeWidth="2"
            opacity="0.3"
          />
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 360) / 12;
            const rad = (angle * Math.PI) / 180;
            const x = 100 + Math.cos(rad) * 80;
            const y = 100 + Math.sin(rad) * 80;
            return (
              <Circle key={i} cx={x} cy={y} r="3" fill="#FFE66D" opacity="0.6" />
            );
          })}
        </Svg>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  starContainer: {
    position: 'absolute',
    zIndex: 1001,
  },
  sparkleRing: {
    position: 'absolute',
    zIndex: 1000,
  },
  particle: {
    position: 'absolute',
    width: 16,
    height: 16,
    marginLeft: -8,
    marginTop: -8,
  },
});

