/**
 * OT Level 5 · Session 5 · Game 4 — Lightning Jump
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { JUMP_TRACK } from '@/components/game/occupational/level5/session5/eyeTrackConfig';
import { LIGHTNING_JUMP_COPY as COPY, LIGHTNING_JUMP_THEME as T } from '@/components/game/occupational/level5/session5/lightningJump/lightningJumpTheme';
import { BoltDot, LightningJumpHUD, LightningJumpInfoScreen, StormBackdrop } from '@/components/game/occupational/level5/session5/lightningJump/LightningJumpVisuals';
import { EyeTrackCountdown } from '@/components/game/occupational/level5/session5/shared/EyeTrackCountdown';
import { DOT_SIZE, JUMP_POSITIONS, useEyeTrackGame } from '@/components/game/occupational/level5/session5/shared/useEyeTrackGame';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const LightningJumpGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const track = useEyeTrackGame({ config: JUMP_TRACK, ttsCue: COPY.ttsCue, ttsComplete: COPY.ttsComplete, onBack });
  const activeNode = useMemo(
    () => JUMP_POSITIONS.findIndex((p) => p.x === track.jumpPos.x && p.y === track.jumpPos.y),
    [track.jumpPos],
  );

  if (track.showInfo) return <SafeAreaView style={styles.root} edges={['top', 'bottom']}><LightningJumpInfoScreen onStart={track.handleStart} onBack={track.handleExit} /></SafeAreaView>;
  if (track.showCongrats && track.done && track.finalStats) {
    return <CongratulationsScreen message={COPY.congratsMessage} showButtons correct={track.finalStats.correct} total={track.finalStats.total} xpAwarded={track.finalStats.xp}
      onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }} onHome={track.handleExit} />;
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TouchableOpacity onPress={track.handleExit} style={styles.exitBtn}><Text style={styles.exitText}>← Exit</Text></TouchableOpacity>
      <LightningJumpHUD round={track.round} total={track.totalRounds} score={track.score} hint={track.hint} watching={track.phase === 'watching'} />
      <View style={styles.arena}>
        <StormBackdrop activeNode={activeNode} />
        <View style={[styles.dotPos, { left: `${track.jumpPos.x}%`, top: `${track.jumpPos.y}%`, transform: [{ translateX: -DOT_SIZE / 2 }, { translateY: -DOT_SIZE / 2 }] }]} pointerEvents="none">
          <BoltDot size={DOT_SIZE} flash={track.phase === 'watching'} />
        </View>
        {track.phase === 'countdown' && <EyeTrackCountdown accent={T.accent} label="Snap your eyes" onDone={track.beginRound} />}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#713F12' },
  exitBtn: { position: 'absolute', top: 52, left: 14, zIndex: 50, backgroundColor: 'rgba(66,32,6,0.9)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: T.hudBorder },
  exitText: { color: T.title, fontWeight: '800', fontSize: 14 },
  arena: { flex: 1, margin: 10, marginTop: 4, borderRadius: 22, overflow: 'hidden', borderWidth: 2, borderColor: T.hudBorder },
  dotPos: { position: 'absolute', zIndex: 10 },
});

export default LightningJumpGame;
