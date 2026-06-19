/**
 * OT Level 5 · Session 10 — Integrated Visual Challenge engine.
 * Rotates mixed challenge types from Sessions 1–9 per round.
 */
import { RoundCountdownOverlay } from '@/components/game/occupational/level5/session2/shared/Session2UI';
import { GauntletShell, useGauntletExit } from '@/components/game/occupational/level5/session10/GauntletShell';
import { SESSION5_10_PACING as P } from '@/components/game/occupational/level5/session10/session10Pacing';
import { GauntletFlash, GauntletOrb, GauntletSignal } from '@/components/game/occupational/level5/session10/VisualGauntletVisuals';
import type { GauntletConfig, GauntletChallenge } from '@/components/game/occupational/level5/session10/visualGauntletConfig';
import { CHALLENGE_HINTS, CHALLENGE_TTS, getGauntletTheme } from '@/components/game/occupational/level5/session10/visualGauntletThemes';
import { logGameAndAward } from '@/utils/api';
import { cleanupSounds } from '@/utils/soundPlayer';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { speak as speakTTS, stopTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';

const TOLERANCE = 52;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const NEAR_SIZE = 76;
const FAR_SIZE = 40;

interface Entity {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  emoji: string;
  mark?: string;
  isTarget?: boolean;
  dx?: number;
  dy?: number;
}

const VisualGauntletGame: React.FC<{ config: GauntletConfig; onBack?: () => void; onComplete?: () => void }> = ({
  config,
  onBack,
  onComplete,
}) => {
  const router = useRouter();
  const { theme, copy } = getGauntletTheme(config.logType);
  const handleExit = useGauntletExit(onBack);

  const [showInfo, setShowInfo] = useState(true);
  const [phase, setPhase] = useState<'countdown' | 'playing' | 'idle'>('idle');
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);

  const [challenge, setChallenge] = useState<GauntletChallenge | null>(null);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [showGo, setShowGo] = useState(false);
  const [showStop, setShowStop] = useState(false);
  const [flash, setFlash] = useState<{ x: number; y: number; visible: boolean } | null>(null);
  const [depthCue, setDepthCue] = useState<'near' | 'far' | null>(null);
  const [speedCue, setSpeedCue] = useState<'fast' | 'slow' | null>(null);
  const [active, setActive] = useState(false);

  const screenW = useRef(SCREEN_WIDTH);
  const screenH = useRef(SCREEN_HEIGHT);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const roundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const endGameRef = useRef<((s: number) => Promise<void>) | null>(null);
  const roundRef = useRef(1);
  const scoreRef = useRef(0);
  const activeRef = useRef(false);
  const challengeRef = useRef<GauntletChallenge | null>(null);
  const speedCueRef = useRef<'fast' | 'slow' | null>(null);
  const depthCueRef = useRef<'near' | 'far' | null>(null);
  const showGoRef = useRef(false);
  const showStopRef = useRef(false);
  const entitiesRef = useRef<Entity[]>([]);
  const flashRef = useRef<{ x: number; y: number; visible: boolean } | null>(null);

  useEffect(() => { roundRef.current = round; }, [round]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { activeRef.current = active; }, [active]);
  useEffect(() => { challengeRef.current = challenge; }, [challenge]);
  useEffect(() => { speedCueRef.current = speedCue; }, [speedCue]);
  useEffect(() => { depthCueRef.current = depthCue; }, [depthCue]);
  useEffect(() => { showGoRef.current = showGo; }, [showGo]);
  useEffect(() => { showStopRef.current = showStop; }, [showStop]);
  useEffect(() => { entitiesRef.current = entities; }, [entities]);
  useEffect(() => { flashRef.current = flash; }, [flash]);

  const clearTimers = useCallback(() => {
    if (animRef.current) { clearInterval(animRef.current); animRef.current = null; }
    if (roundTimerRef.current) { clearTimeout(roundTimerRef.current); roundTimerRef.current = null; }
  }, []);

  const endGame = useCallback(async (finalScore: number) => {
    clearTimers();
    setActive(false);
    const total = P.rounds;
    const xp = finalScore * P.xpPerRound;
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    setPhase('idle');
    try {
      await logGameAndAward({
        type: config.logType,
        correct: finalScore,
        total,
        accuracy: (finalScore / total) * 100,
        xpAwarded: xp,
        skillTags: config.skillTags,
      });
      router.setParams({ refreshStats: Date.now().toString() });
    } catch (e) { console.error(e); }
  }, [clearTimers, config, router]);

  useEffect(() => { endGameRef.current = endGame; }, [endGame]);

  const finishRound = useCallback((success: boolean) => {
    if (!activeRef.current) return;
    setActive(false);
    activeRef.current = false;
    clearTimers();
    setShowGo(false);
    setShowStop(false);
    setFlash(null);
    setEntities([]);

    const newScore = success ? scoreRef.current + 1 : scoreRef.current;
    if (success) {
      scoreRef.current = newScore;
      setScore(newScore);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      speakTTS('Nice!', 0.9, 'en-US');
    }

    if (roundRef.current >= P.rounds) {
      setTimeout(() => endGameRef.current?.(newScore), 700);
      return;
    }

    setTimeout(() => {
      setRound((r) => {
        const next = r + 1;
        roundRef.current = next;
        return next;
      });
    }, success ? 900 : 700);
  }, [clearTimers]);

  const pickChallenge = useCallback((r: number): GauntletChallenge => {
    if (config.randomPool) {
      return config.challenges[Math.floor(Math.random() * config.challenges.length)]!;
    }
    return config.challenges[(r - 1) % config.challenges.length]!;
  }, [config]);

  const scheduleRoundEnd = useCallback((ms: number) => {
    if (roundTimerRef.current) clearTimeout(roundTimerRef.current);
    roundTimerRef.current = setTimeout(() => finishRound(false), ms);
  }, [finishRound]);

  const startChallenge = useCallback((r: number) => {
    clearTimers();
    const kind = pickChallenge(r);
    setChallenge(kind);
    challengeRef.current = kind;
    setEntities([]);
    setShowGo(false);
    setShowStop(false);
    setFlash(null);
    setDepthCue(null);
    setSpeedCue(null);
    setActive(true);
    activeRef.current = true;

    stopTTS();
    speakTTS(CHALLENGE_TTS[kind] ?? 'Go!', 0.85, 'en-US');

    const w = screenW.current;
    const h = screenH.current;

    if (kind === 'movingTap') {
      const size = 58;
      setEntities([{
        id: 'mover',
        x: w * 0.5,
        y: h * 0.5,
        size,
        color: theme.accent,
        emoji: '☄️',
        dx: (Math.random() > 0.5 ? 1 : -1) * 2.2,
        dy: (Math.random() > 0.5 ? 1 : -1) * 2.2,
        isTarget: true,
      }]);
      animRef.current = setInterval(() => {
        setEntities((prev) => prev.map((e) => {
          if (!e.dx || !e.dy) return e;
          let nx = e.x + e.dx;
          let ny = e.y + e.dy;
          let ndx = e.dx;
          let ndy = e.dy;
          if (nx < e.size / 2 || nx > w - e.size / 2) ndx = -ndx;
          if (ny < e.size / 2 || ny > h - e.size / 2) ndy = -ndy;
          return { ...e, x: nx, y: ny, dx: ndx, dy: ndy };
        }));
      }, P.moveTickMs);
      scheduleRoundEnd(4500);
    }

    if (kind === 'flashTap') {
      const size = 120;
      setFlash({
        x: Math.random() * (w - size) + size / 2,
        y: Math.random() * (h - size - 60) + size / 2 + 30,
        visible: true,
      });
      roundTimerRef.current = setTimeout(() => {
        setFlash((f) => (f ? { ...f, visible: false } : null));
        finishRound(false);
      }, P.flashMs + 400);
    }

    if (kind === 'goStop') {
      const isGo = Math.random() > 0.45;
      setShowGo(isGo);
      setShowStop(!isGo);
      speakTTS(isGo ? 'Go!' : 'Stop!', 0.9, 'en-US');
      scheduleRoundEnd(P.goStopMs);
    }

    if (kind === 'distractTap') {
      const targetSize = 62;
      const dSize = 46;
      const placed: Entity[] = [];
      const used = new Set<string>();
      const place = (size: number) => {
        let x = 0;
        let y = 0;
        for (let i = 0; i < 20; i++) {
          x = Math.random() * (w - size) + size / 2;
          y = Math.random() * (h - size - 50) + size / 2 + 25;
          const key = `${Math.floor(x / 55)}-${Math.floor(y / 55)}`;
          if (!used.has(key)) { used.add(key); break; }
        }
        return { x, y };
      };
      const t = place(targetSize);
      placed.push({ id: 'target', x: t.x, y: t.y, size: targetSize, color: theme.accent, emoji: '🎯', mark: '⭐', isTarget: true });
      for (let i = 0; i < 3; i++) {
        const p = place(dSize);
        placed.push({ id: `d-${i}`, x: p.x, y: p.y, size: dSize, color: '#94A3B8', emoji: '⚪', isTarget: false });
      }
      setEntities(placed);
      scheduleRoundEnd(4000);
    }

    if (kind === 'nearFar') {
      const cue = Math.random() > 0.5 ? 'near' : 'far';
      setDepthCue(cue);
      depthCueRef.current = cue;
      speakTTS(cue === 'near' ? 'Tap near!' : 'Tap far!', 0.85, 'en-US');
      setEntities([
        { id: 'near', x: w * 0.35, y: h * 0.5, size: NEAR_SIZE, color: '#F59E0B', emoji: '🔶', isTarget: cue === 'near' },
        { id: 'far', x: w * 0.65, y: h * 0.5, size: FAR_SIZE, color: '#60A5FA', emoji: '🔹', isTarget: cue === 'far' },
      ]);
      scheduleRoundEnd(3500);
    }

    if (kind === 'speedMatch') {
      const cue = Math.random() > 0.5 ? 'fast' : 'slow';
      setSpeedCue(cue);
      speedCueRef.current = cue;
      speakTTS(cue === 'fast' ? 'Tap fast!' : 'Tap slow!', 0.85, 'en-US');
      setEntities([
        { id: 'fast', x: w * 0.3, y: h * 0.5, size: 54, color: '#EF4444', emoji: '⚡', dx: 3.5, dy: 1.8, isTarget: cue === 'fast' },
        { id: 'slow', x: w * 0.7, y: h * 0.5, size: 54, color: '#3B82F6', emoji: '🐢', dx: 0.9, dy: 0.7, isTarget: cue === 'slow' },
      ]);
      animRef.current = setInterval(() => {
        setEntities((prev) => prev.map((e) => {
          if (!e.dx || !e.dy) return e;
          let nx = e.x + e.dx;
          let ny = e.y + e.dy;
          let ndx = e.dx;
          let ndy = e.dy;
          if (nx < e.size / 2 || nx > w - e.size / 2) ndx = -ndx;
          if (ny < e.size / 2 || ny > h - e.size / 2) ndy = -ndy;
          return { ...e, x: nx, y: ny, dx: ndx, dy: ndy };
        }));
      }, P.moveTickMs);
      scheduleRoundEnd(4000);
    }
  }, [clearTimers, pickChallenge, theme.accent, scheduleRoundEnd, finishRound]);

  const startChallengeRef = useRef(startChallenge);
  startChallengeRef.current = startChallenge;

  useEffect(() => {
    if (phase === 'playing' && !showInfo && !done) {
      startChallengeRef.current(round);
    }
  }, [round, phase, showInfo, done]);

  const handleTap = useCallback((event: { nativeEvent: { locationX: number; locationY: number } }) => {
    if (!activeRef.current || phase !== 'playing') return;
    const tapX = event.nativeEvent.locationX;
    const tapY = event.nativeEvent.locationY;
    const kind = challengeRef.current;
    if (!kind) return;

    if (kind === 'goStop') {
      const cx = screenW.current / 2;
      const cy = screenH.current / 2;
      if (Math.hypot(tapX - cx, tapY - cy) > TOLERANCE + 60) return;
      if (showGoRef.current) {
        finishRound(true);
      } else if (showStopRef.current) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        speakTTS('Stop means no tap!', 0.8, 'en-US');
        finishRound(false);
      }
      return;
    }

    const currentFlash = flashRef.current;
    if (kind === 'flashTap' && currentFlash?.visible) {
      const size = 120;
      if (Math.hypot(tapX - currentFlash.x, tapY - currentFlash.y) <= TOLERANCE + size / 2) {
        setFlash(null);
        finishRound(true);
      }
      return;
    }

    for (const e of entitiesRef.current) {
      if (Math.hypot(tapX - e.x, tapY - e.y) > TOLERANCE + e.size / 2) continue;

      if (kind === 'movingTap' && e.isTarget) {
        finishRound(true);
        return;
      }
      if (kind === 'distractTap') {
        if (e.isTarget) finishRound(true);
        else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
          speakTTS('Find the star!', 0.8, 'en-US');
        }
        return;
      }
      if (kind === 'nearFar') {
        const cue = depthCueRef.current;
        const correct = (cue === 'near' && e.id === 'near') || (cue === 'far' && e.id === 'far');
        if (correct) finishRound(true);
        else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
          speakTTS('Wrong depth!', 0.8, 'en-US');
        }
        return;
      }
      if (kind === 'speedMatch') {
        const cue = speedCueRef.current;
        const correct = (cue === 'fast' && e.id === 'fast') || (cue === 'slow' && e.id === 'slow');
        if (correct) finishRound(true);
        else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
          speakTTS('Wrong speed!', 0.8, 'en-US');
        }
        return;
      }
    }
  }, [phase, finishRound]);

  useEffect(() => () => {
    stopTTS();
    cleanupSounds();
    clearTimers();
  }, [clearTimers]);

  const hint = challenge ? CHALLENGE_HINTS[challenge] : copy.introBody;

  return (
    <GauntletShell
      theme={theme}
      copy={copy}
      showInfo={showInfo}
      done={done}
      finalStats={finalStats}
      round={round}
      totalRounds={P.rounds}
      score={score}
      hint={hint}
      showHint={!showInfo && !done && phase === 'playing'}
      onStart={() => { setShowInfo(false); setPhase('countdown'); }}
      onExit={handleExit}
      onContinue={onComplete}
      onBack={onBack}
    >
      <Pressable
        style={styles.arena}
        onLayout={(e) => { screenW.current = e.nativeEvent.layout.width; screenH.current = e.nativeEvent.layout.height; }}
        onPress={handleTap}
      >
        {entities.map((e) => (
          <View
            key={e.id}
            pointerEvents="none"
            style={{ position: 'absolute', left: e.x - e.size / 2, top: e.y - e.size / 2 }}
          >
            <GauntletOrb size={e.size} color={e.color} emoji={e.emoji} mark={e.mark} />
          </View>
        ))}
        {flash?.visible && (
          <View pointerEvents="none" style={{ position: 'absolute', left: flash.x - 60, top: flash.y - 60 }}>
            <GauntletFlash size={120} color="#FACC15" emoji="💡" />
          </View>
        )}
        {(showGo || showStop) && (
          <View style={styles.center} pointerEvents="none">
            <GauntletSignal type={showGo ? 'go' : 'stop'} size={110} />
          </View>
        )}
      </Pressable>
      {phase === 'countdown' && (
        <RoundCountdownOverlay
          accent={theme.accent}
          onDone={() => { setPhase('playing'); stopTTS(); }}
        />
      )}
    </GauntletShell>
  );
};

const styles = StyleSheet.create({
  arena: { flex: 1, position: 'relative' },
  center: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
});

export default VisualGauntletGame;
