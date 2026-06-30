/** OT Level 5 · Session 6 · Game 3 — Turbo Toggle */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SPEED_SWITCH_CONFIG } from '@/components/game/occupational/level5/session6/speedCatchConfig';
import { TURBO_TOGGLE_COPY as COPY, TURBO_TOGGLE_THEME as T } from '@/components/game/occupational/level5/session6/turboToggle/turboToggleTheme';
import { ToggleBall, TurboBackdrop, TurboToggleHUD, TurboToggleInfoScreen } from '@/components/game/occupational/level5/session6/turboToggle/TurboToggleVisuals';
import { SpeedCatchCountdown } from '@/components/game/occupational/level5/session6/shared/SpeedCatchCountdown';
import { BALL_SIZE, useSpeedCatchGame } from '@/components/game/occupational/level5/session6/shared/useSpeedCatchGame';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import React from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const TurboToggleGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const catch_ = useSpeedCatchGame({ config: SPEED_SWITCH_CONFIG, ttsComplete: COPY.ttsComplete, onBack });

  if (catch_.showInfo) return <SafeAreaView style={styles.root} edges={['top', 'bottom']}><TurboToggleInfoScreen onStart={catch_.handleStart} onBack={catch_.handleExit} /></SafeAreaView>;
  if (catch_.showCongrats && catch_.done && catch_.finalStats) {
    return <CongratulationsScreen message={COPY.congratsMessage} showButtons correct={catch_.finalStats.correct} total={catch_.finalStats.total} xpAwarded={catch_.finalStats.xp}
      onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }} onHome={catch_.handleExit} />;
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TouchableOpacity onPress={catch_.handleExit} style={styles.exitBtn}><Text style={styles.exitText}>← Exit</Text></TouchableOpacity>
      <TurboToggleHUD round={catch_.round} total={catch_.totalRounds} score={catch_.score} hint={catch_.hint} playing={catch_.phase === 'playing'} isFast={catch_.isFast} />
      <Pressable style={styles.arena} onLayout={(e) => catch_.onLayout(e.nativeEvent.layout.width, e.nativeEvent.layout.height)} onPress={catch_.handleGameTap}>
        <TurboBackdrop isFast={catch_.isFast} />
        {catch_.phase === 'playing' && (
          <Animated.View style={[styles.ballPos, catch_.ballStyle]} pointerEvents="none">
            <ToggleBall size={BALL_SIZE} isFast={catch_.isFast} pulse />
          </Animated.View>
        )}
        {catch_.phase === 'countdown' && <SpeedCatchCountdown accent={T.accent} onDone={catch_.startPlaying} />}
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#78350F' },
  exitBtn: { position: 'absolute', top: 52, left: 14, zIndex: 50, backgroundColor: 'rgba(66,32,6,0.9)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: T.hudBorder },
  exitText: { color: T.title, fontWeight: '800', fontSize: 14 },
  arena: { flex: 1, margin: 10, marginTop: 4, borderRadius: 22, overflow: 'hidden', borderWidth: 2, borderColor: T.hudBorder },
  ballPos: { position: 'absolute', zIndex: 10 },
});

export default TurboToggleGame;
