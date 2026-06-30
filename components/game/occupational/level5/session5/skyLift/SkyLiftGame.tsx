/**
 * OT Level 5 · Session 5 · Game 2 — Sky Lift
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { UP_DOWN_TRACK } from '@/components/game/occupational/level5/session5/eyeTrackConfig';
import { SKY_LIFT_COPY as COPY, SKY_LIFT_THEME as T } from '@/components/game/occupational/level5/session5/skyLift/skyLiftTheme';
import { ElevatorBackdrop, LiftDot, SkyLiftHUD, SkyLiftInfoScreen } from '@/components/game/occupational/level5/session5/skyLift/SkyLiftVisuals';
import { EyeTrackCountdown } from '@/components/game/occupational/level5/session5/shared/EyeTrackCountdown';
import { DOT_SIZE, useEyeTrackGame } from '@/components/game/occupational/level5/session5/shared/useEyeTrackGame';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const SkyLiftGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const track = useEyeTrackGame({ config: UP_DOWN_TRACK, ttsCue: COPY.ttsCue, ttsComplete: COPY.ttsComplete, onBack });

  if (track.showInfo) return <SafeAreaView style={styles.root} edges={['top', 'bottom']}><SkyLiftInfoScreen onStart={track.handleStart} onBack={track.handleExit} /></SafeAreaView>;
  if (track.showCongrats && track.done && track.finalStats) {
    return <CongratulationsScreen message={COPY.congratsMessage} showButtons correct={track.finalStats.correct} total={track.finalStats.total} xpAwarded={track.finalStats.xp}
      onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }} onHome={track.handleExit} />;
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TouchableOpacity onPress={track.handleExit} style={styles.exitBtn}><Text style={styles.exitText}>← Exit</Text></TouchableOpacity>
      <SkyLiftHUD round={track.round} total={track.totalRounds} score={track.score} hint={track.hint} watching={track.phase === 'watching'} />
      <View style={styles.arena}>
        <ElevatorBackdrop />
        <Animated.View style={[styles.dotPos, track.smoothDotStyle]} pointerEvents="none"><LiftDot size={DOT_SIZE} pulse={track.phase === 'watching'} /></Animated.View>
        {track.phase === 'countdown' && <EyeTrackCountdown accent={T.accent} label="Eyes on the lift" onDone={track.beginRound} />}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#134E4A' },
  exitBtn: { position: 'absolute', top: 52, left: 14, zIndex: 50, backgroundColor: 'rgba(19,78,74,0.9)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: T.hudBorder },
  exitText: { color: T.title, fontWeight: '800', fontSize: 14 },
  arena: { flex: 1, margin: 10, marginTop: 4, borderRadius: 22, overflow: 'hidden', borderWidth: 2, borderColor: T.hudBorder },
  dotPos: { position: 'absolute', zIndex: 10 },
});

export default SkyLiftGame;
