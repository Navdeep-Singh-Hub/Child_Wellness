import { HOME_LAYOUT, HOME_QUICK_ACTIONS, HOME_TYPE, type HomeQuickActionKey } from '@/constants/homeDesign';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type Props = {
  onAction: (key: HomeQuickActionKey) => void;
};

export function HomeQuickActionsRail({ onAction }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.rail}
      decelerationRate="fast"
    >
      {HOME_QUICK_ACTIONS.map((action, index) => (
        <QuickActionCard key={action.key} action={action} index={index} onPress={() => onAction(action.key)} />
      ))}
    </ScrollView>
  );
}

function QuickActionCard({
  action,
  index,
  onPress,
}: {
  action: (typeof HOME_QUICK_ACTIONS)[number];
  index: number;
  onPress: () => void;
}) {
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(enter, {
      toValue: 1,
      delay: 80 + index * 70,
      friction: 6,
      tension: 55,
      useNativeDriver: true,
    }).start();
  }, [enter, index]);

  return (
    <Animated.View
      style={{
        opacity: enter,
        transform: [
          { scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1] }) },
          { translateX: enter.interpolate({ inputRange: [0, 1], outputRange: [36, 0] }) },
        ],
      }}
    >
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          onPress();
        }}
        style={({ pressed }) => [styles.card, pressed && { transform: [{ scale: 0.96 }] }]}
        accessibilityRole="button"
        accessibilityLabel={`${action.label}. ${action.caption}`}
      >
        <LinearGradient colors={action.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        <View style={[styles.glowOrb, { backgroundColor: `${action.accentGlow}33` }]} />
        <View style={styles.iconWrap}>
          <Ionicons name={action.icon as keyof typeof Ionicons.glyphMap} size={28} color="#FFFFFF" />
        </View>
        <Text style={styles.label}>{action.label}</Text>
        <Text style={styles.caption}>{action.caption}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  rail: { paddingRight: 20, gap: 14 },
  card: {
    width: HOME_LAYOUT.quickActionWidth,
    height: 172,
    borderRadius: 26,
    padding: 18,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    shadowColor: '#0C1222',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 8,
  },
  glowOrb: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    top: -20,
    right: -16,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  label: { ...HOME_TYPE.h3, color: '#FFFFFF', marginBottom: 4 },
  caption: { ...HOME_TYPE.caption, color: 'rgba(255,255,255,0.9)', fontSize: 12 },
});
