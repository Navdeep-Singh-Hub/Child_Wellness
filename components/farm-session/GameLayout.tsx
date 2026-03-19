/**
 * GameLayout.tsx
 * Reusable wrapper for farm session games: consistent padding, title, and success message.
 * Keeps UI simple, large touch targets, minimal distractions.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, View, Text, StyleSheet } from 'react-native';
import { MotionBackground } from '@/components/ui/MotionBackground';

interface GameLayoutProps {
  title: string;
  children: React.ReactNode;
  /** Optional instruction shown below title */
  instruction?: string;
  /**
   * Optional background vibe. Keeps the palette calm + high contrast.
   * Defaults to 'indigo' to match Level 4 palette.
   */
  backgroundVariant?: 'indigo' | 'mint' | 'sunset' | 'ocean';
  /** Optional emoji icon shown in the header bubble */
  icon?: string;
}

export function GameLayout({ title, instruction, children, backgroundVariant = 'indigo', icon }: GameLayoutProps) {
  const [reduceMotion, setReduceMotion] = useState(false);
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => mounted && setReduceMotion(!!v))
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    enter.setValue(0);
    if (reduceMotion) {
      enter.setValue(1);
      return;
    }
    Animated.timing(enter, { toValue: 1, duration: 220, useNativeDriver: true }).start();
  }, [enter, reduceMotion, title, instruction]);

  const headerStyle = useMemo(
    () => ({
      opacity: enter,
      transform: [
        {
          translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }),
        },
      ],
    }),
    [enter]
  );

  return (
    <View style={styles.root}>
      <MotionBackground variant={backgroundVariant} />
      <View style={styles.container}>
        <Animated.View style={headerStyle}>
          <View style={styles.header}>
            {icon ? (
              <View style={styles.iconBubble}>
                <Text style={styles.iconText}>{icon}</Text>
              </View>
            ) : null}
            <Text style={styles.title}>{title}</Text>
          </View>
          {instruction ? <Text style={styles.instruction}>{instruction}</Text> : null}
        </Animated.View>
        <View style={styles.surface}>
          <View style={styles.content}>{children}</View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 8,
  },
  iconBubble: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: 'rgba(79,70,229,0.12)',
    borderWidth: 2,
    borderColor: 'rgba(79,70,229,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 22,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1f2937',
    textAlign: 'center',
  },
  instruction: {
    fontSize: 18,
    color: '#4b5563',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 26,
  },
  surface: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(79,70,229,0.18)',
    padding: 16,
    // RN shadow (iOS)
    shadowColor: '#111827',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    // RN elevation (Android)
    elevation: 3,
  },
  content: {
    flex: 1,
  },
});
