import { TP_SHADOW, TP_TYPE, type TherapyIdentity } from '@/constants/therapyProgressDesign';
import { TherapyCardPattern } from '@/components/therapyProgress/TherapyCardPattern';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

type Props = {
  therapy: TherapyIdentity;
  title?: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
};

export function TherapyContextBanner({ therapy, title, subtitle, icon = 'medkit-outline' }: Props) {
  return (
    <Animated.View entering={FadeInDown.duration(350)} style={[styles.wrap, TP_SHADOW.card(therapy.accent)]}>
      <LinearGradient colors={therapy.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
        <TherapyCardPattern pattern={therapy.pattern} accent="#FFFFFF" width={340} height={88} />
        <View style={styles.row}>
          <View style={styles.iconOrb}>
            <Ionicons name={icon} size={22} color={therapy.accent} />
          </View>
          <View style={styles.copy}>
            <Text style={styles.realm}>{therapy.realm}</Text>
            <Text style={styles.title}>{title ?? therapy.label}</Text>
            <Text style={styles.subtitle}>{subtitle ?? therapy.desc}</Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 22, overflow: 'hidden' },
  card: { padding: 16, minHeight: 88, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, zIndex: 1 },
  iconOrb: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1 },
  realm: { ...TP_TYPE.micro, color: 'rgba(255,255,255,0.7)' },
  title: { ...TP_TYPE.h2, color: '#FFFFFF', marginTop: 2 },
  subtitle: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.85)', marginTop: 3 },
});
