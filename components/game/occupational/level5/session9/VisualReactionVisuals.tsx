/** Visual Reaction visuals — OT L5 Session 9 */
import type { Session2ThemeTokens } from '@/components/game/occupational/level5/session2/shared/Session2UI';
import type { ReactionBackdropId } from '@/components/game/occupational/level5/session9/visualReactionThemes';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';

export function ReactionBackdrop({ theme, backdrop }: { theme: Session2ThemeTokens; backdrop: ReactionBackdropId }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...theme.sky]} style={StyleSheet.absoluteFillObject} />
      {backdrop === 'flash' && <FlashGrid accent={theme.accent} />}
      {backdrop === 'traffic' && <TrafficRoad />}
      {backdrop === 'pop' && <PopArena accent={theme.accent} />}
      {backdrop === 'synesthesia' && <SynesthesiaWaves accent={theme.accent} />}
      {backdrop === 'split' && <SplitLanes accent={theme.accent} />}
    </View>
  );
}

function FlashGrid({ accent }: { accent: string }) {
  return (
    <>
      {Array.from({ length: 16 }).map((_, i) => (
        <View key={i} style={[styles.gridDot, { left: `${(i % 4) * 25 + 12}%`, top: `${Math.floor(i / 4) * 22 + 15}%`, borderColor: `${accent}22` }]} />
      ))}
      <View style={[styles.flashGlow, { backgroundColor: `${accent}15` }]} />
    </>
  );
}

function TrafficRoad() {
  return (
    <>
      <View style={styles.road} />
      <View style={styles.roadLine} />
      <View style={[styles.signalPole, { top: 14, right: 20 }]} />
    </>
  );
}

function PopArena({ accent }: { accent: string }) {
  return (
    <>
      {['🎪', '✨', '🎉'].map((e, i) => (
        <Text key={i} style={[styles.carnival, { left: `${20 + i * 28}%`, top: `${12 + (i % 2) * 5}%` }]}>{e}</Text>
      ))}
      <View style={[styles.popRing, { borderColor: `${accent}44` }]} />
    </>
  );
}

function SynesthesiaWaves({ accent }: { accent: string }) {
  return (
    <>
      <View style={[styles.wave, { top: '30%', backgroundColor: `${accent}33` }]} />
      <View style={[styles.wave, { top: '55%', backgroundColor: `${accent}22`, height: 3 }]} />
      <View style={styles.eqPanel}>
        {Array.from({ length: 5 }).map((_, i) => (
          <View key={i} style={[styles.eqBar, { height: 10 + (i % 3) * 8, backgroundColor: accent }]} />
        ))}
      </View>
    </>
  );
}

function SplitLanes({ accent }: { accent: string }) {
  return (
    <>
      <View style={[styles.lane, { left: '25%', borderColor: `${accent}44` }]} />
      <View style={[styles.lane, { right: '25%', borderColor: `${accent}33` }]} />
      <View style={[styles.splitLine, { backgroundColor: accent }]} />
    </>
  );
}

export function FlashBurst({ size, color, emoji, style }: { size: number; color: string; emoji: string; style?: object }) {
  return (
    <Animated.View style={[styles.burst, { width: size, height: size, borderRadius: size / 2, shadowColor: color }, style]}>
      <LinearGradient colors={[`${color}EE`, color, `${color}CC`]} style={[styles.burstGrad, { borderRadius: size / 2 }]}>
        <Text style={{ fontSize: size * 0.42 }}>{emoji}</Text>
      </LinearGradient>
      <View style={[styles.burstHalo, { width: size + 20, height: size + 20, borderRadius: (size + 20) / 2, borderColor: `${color}66` }]} />
    </Animated.View>
  );
}

export function SignalButton({ type, size }: { type: 'go' | 'stop'; size: number }) {
  const scale = useSharedValue(0.9);
  useEffect(() => {
    scale.value = withRepeat(withSequence(withTiming(1.05, { duration: 400 }), withTiming(0.95, { duration: 400 })), -1, true);
  }, [scale]);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const bg = type === 'go' ? '#10B981' : '#EF4444';
  const border = type === 'go' ? '#059669' : '#DC2626';
  return (
    <Animated.View style={[styles.signalBtn, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg, borderColor: border }, anim]}>
      <Text style={{ fontSize: size * 0.32 }}>{type === 'go' ? '🟢' : '🔴'}</Text>
      <Text style={styles.signalLabel}>{type === 'go' ? 'GO' : 'STOP'}</Text>
    </Animated.View>
  );
}

export function ChoiceTile({ size, emoji, scale = 1, accent }: { size: number; emoji: string; scale?: number; accent: string }) {
  return (
    <View style={[styles.choiceTile, { width: size, height: size, borderRadius: size / 2, borderColor: `${accent}55`, transform: [{ scale }] }]}>
      <Text style={{ fontSize: size * 0.48 }}>{emoji}</Text>
    </View>
  );
}

export function TimerBar({ percent, accent }: { percent: number; accent: string }) {
  return (
    <View style={styles.timerTrack}>
      <View style={[styles.timerFill, { width: `${Math.max(0, Math.min(100, percent))}%`, backgroundColor: accent }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  gridDot: { position: 'absolute', width: 10, height: 10, borderRadius: 5, borderWidth: 1 },
  flashGlow: { position: 'absolute', alignSelf: 'center', top: '35%', width: 120, height: 120, borderRadius: 60 },
  road: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%', backgroundColor: 'rgba(0,0,0,0.3)' },
  roadLine: { position: 'absolute', bottom: '17%', left: '10%', right: '10%', height: 3, backgroundColor: 'rgba(255,255,255,0.25)', borderStyle: 'dashed' },
  signalPole: { position: 'absolute', width: 8, height: 50, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4 },
  carnival: { position: 'absolute', fontSize: 22, opacity: 0.5 },
  popRing: { position: 'absolute', alignSelf: 'center', top: '38%', width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderStyle: 'dashed' },
  wave: { position: 'absolute', left: 0, right: 0, height: 4, borderRadius: 2 },
  eqPanel: { position: 'absolute', top: 12, left: 16, flexDirection: 'row', gap: 4, padding: 8, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.2)' },
  eqBar: { width: 6, borderRadius: 3, opacity: 0.7 },
  lane: { position: 'absolute', top: '20%', bottom: '20%', width: 2, borderStyle: 'dashed', borderWidth: 1 },
  splitLine: { position: 'absolute', top: '48%', left: '48%', width: 4, height: '8%', borderRadius: 2, opacity: 0.5 },
  burst: { justifyContent: 'center', alignItems: 'center', shadowOpacity: 0.7, shadowRadius: 24, shadowOffset: { width: 0, height: 8 }, elevation: 16 },
  burstGrad: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.65)' },
  burstHalo: { position: 'absolute', borderWidth: 2, backgroundColor: 'transparent' },
  signalBtn: { justifyContent: 'center', alignItems: 'center', borderWidth: 4, shadowOpacity: 0.45, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 12 },
  signalLabel: { color: '#fff', fontWeight: '900', fontSize: 18, marginTop: 2 },
  choiceTile: { justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.92)', borderWidth: 3, shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 10 },
  timerTrack: { height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4, overflow: 'hidden', width: '100%' },
  timerFill: { height: '100%', borderRadius: 4 },
});
