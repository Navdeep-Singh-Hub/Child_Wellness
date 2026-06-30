/**
 * OT Level 5 · Session 5 · Game 3 — Orbit Eye
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { CIRCULAR_TRACK } from '@/components/game/occupational/level5/session5/eyeTrackConfig';
import { ORBIT_EYE_COPY as COPY, ORBIT_EYE_THEME as T } from '@/components/game/occupational/level5/session5/orbitEye/orbitEyeTheme';
import { CosmicBackdrop, OrbitEyeHUD, OrbitEyeInfoScreen, PlanetDot } from '@/components/game/occupational/level5/session5/orbitEye/OrbitEyeVisuals';
import { EyeTrackCountdown } from '@/components/game/occupational/level5/session5/shared/EyeTrackCountdown';
import { DOT_SIZE, useEyeTrackGame } from '@/components/game/occupational/level5/session5/shared/useEyeTrackGame';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const OrbitEyeGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const track = useEyeTrackGame({ config: CIRCULAR_TRACK, ttsCue: COPY.ttsCue, ttsComplete: COPY.ttsComplete, onBack });

  if (track.showInfo) return <SafeAreaView style={styles.root} edges={['top', 'bottom']}><OrbitEyeInfoScreen onStart={track.handleStart} onBack={track.handleExit} /></SafeAreaView>;
  if (track.showCongrats && track.done && track.finalStats) {
    return <CongratulationsScreen message={COPY.congratsMessage} showButtons correct={track.finalStats.correct} total={track.finalStats.total} xpAwarded={track.finalStats.xp}
      onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }} onHome={track.handleExit} />;
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TouchableOpacity onPress={track.handleExit} style={styles.exitBtn}><Text style={styles.exitText}>← Exit</Text></TouchableOpacity>
      <OrbitEyeHUD round={track.round} total={track.totalRounds} score={track.score} hint={track.hint} watching={track.phase === 'watching'} />
      <View style={styles.arena}>
        <CosmicBackdrop />
        <Animated.View style={[styles.dotPos, track.smoothDotStyle]} pointerEvents="none"><PlanetDot size={DOT_SIZE} pulse={track.phase === 'watching'} /></Animated.View>
        {track.phase === 'countdown' && <EyeTrackCountdown accent={T.accent} label="Trace the orbit" onDone={track.beginRound} />}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#312E81' },
  exitBtn: { position: 'absolute', top: 52, left: 14, zIndex: 50, backgroundColor: 'rgba(30,27,75,0.9)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: T.hudBorder },
  exitText: { color: T.title, fontWeight: '800', fontSize: 14 },
  arena: { flex: 1, margin: 10, marginTop: 4, borderRadius: 22, overflow: 'hidden', borderWidth: 2, borderColor: T.hudBorder },
  dotPos: { position: 'absolute', zIndex: 10 },
});

export default OrbitEyeGame;
