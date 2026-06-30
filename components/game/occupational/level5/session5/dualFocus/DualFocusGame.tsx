/**
 * OT Level 5 · Session 5 · Game 5 — Dual Focus
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { MULTI_DOT } from '@/components/game/occupational/level5/session5/eyeTrackConfig';
import { DUAL_FOCUS_COPY as COPY, DUAL_FOCUS_THEME as T } from '@/components/game/occupational/level5/session5/dualFocus/dualFocusTheme';
import { CometDot, DualFocusHUD, DualFocusInfoScreen, DualStageBackdrop } from '@/components/game/occupational/level5/session5/dualFocus/DualFocusVisuals';
import { EyeTrackCountdown } from '@/components/game/occupational/level5/session5/shared/EyeTrackCountdown';
import { DOT_SIZE, useEyeTrackGame } from '@/components/game/occupational/level5/session5/shared/useEyeTrackGame';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const DualFocusGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const track = useEyeTrackGame({ config: MULTI_DOT, ttsCue: COPY.ttsCue, ttsComplete: COPY.ttsComplete, onBack });

  if (track.showInfo) return <SafeAreaView style={styles.root} edges={['top', 'bottom']}><DualFocusInfoScreen onStart={track.handleStart} onBack={track.handleExit} /></SafeAreaView>;
  if (track.showCongrats && track.done && track.finalStats) {
    return <CongratulationsScreen message={COPY.congratsMessage} showButtons correct={track.finalStats.correct} total={track.finalStats.total} xpAwarded={track.finalStats.xp}
      onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }} onHome={track.handleExit} />;
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TouchableOpacity onPress={track.handleExit} style={styles.exitBtn}><Text style={styles.exitText}>← Exit</Text></TouchableOpacity>
      <DualFocusHUD round={track.round} total={track.totalRounds} score={track.score} hint={track.hint} watching={track.phase === 'watching'} activeDot={track.activeDot} />
      <View style={styles.arena}>
        <DualStageBackdrop activeDot={track.phase === 'watching' ? track.activeDot : 0} />
        <Animated.View style={[styles.dotPos, track.multiDotAStyle]} pointerEvents="none">
          <CometDot size={DOT_SIZE} color={T.dotA} glow={T.dotAGlow} active={track.activeDot === 0 && track.phase === 'watching'} />
        </Animated.View>
        <Animated.View style={[styles.dotPos, track.multiDotBStyle]} pointerEvents="none">
          <CometDot size={DOT_SIZE} color={T.dotB} glow={T.dotBGlow} active={track.activeDot === 1 && track.phase === 'watching'} />
        </Animated.View>
        {track.phase === 'countdown' && <EyeTrackCountdown accent={T.accent} label="Switch your focus" onDone={track.beginRound} />}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#1F2937' },
  exitBtn: { position: 'absolute', top: 52, left: 14, zIndex: 50, backgroundColor: 'rgba(31,41,55,0.9)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: T.hudBorder },
  exitText: { color: T.title, fontWeight: '800', fontSize: 14 },
  arena: { flex: 1, margin: 10, marginTop: 4, borderRadius: 22, overflow: 'hidden', borderWidth: 2, borderColor: T.hudBorder },
  dotPos: { position: 'absolute', zIndex: 10 },
});

export default DualFocusGame;
