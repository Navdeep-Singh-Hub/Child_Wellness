/**
 * OT Level 10 · Session 1 · Game 3 — Spot The Change
 *
 * Visual change-detection + body movement: watch prism garden tiles,
 * spot which one transformed, move your explorer dot onto it and hold.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { CameraStage } from '@/components/game/occupational/level6/session1/components/CameraStage';
import { poseStageNativeProps } from '@/components/game/occupational/level6/session1/poseStageProps';
import { usePostureAnalytics } from '@/components/game/occupational/level6/session1/usePostureAnalytics';
import { ExplorerCursor } from '@/components/game/occupational/level10/session1/components/ExplorerCursor';
import { IntegrationMeter } from '@/components/game/occupational/level10/session1/components/IntegrationMeter';
import { SensoryTileGrid } from '@/components/game/occupational/level10/session1/components/SensoryTileGrid';
import { SpotTheChangeVisuals } from '@/components/game/occupational/level10/session1/components/SpotTheChangeVisuals';
import { SPOT_CHANGE_PACING as P } from '@/components/game/occupational/level10/session1/spotTheChangePacing';
import {
  PRISM_SHELL,
  ROUND_CHANGE_INDEX,
  SENSORY_TILES,
  SPOT_THE_CHANGE_THEME as T,
  type SensoryTileDef,
} from '@/components/game/occupational/level10/session1/spotTheChangeTheme';
import {
  adaptiveResponseScore,
  distNorm,
  engagementFromMotion,
  inOrbZone,
  movementSmoothness,
} from '@/components/game/occupational/level10/session1/sensoryTrackingUtils';
import { useSensoryTracking } from '@/components/game/occupational/level10/session1/useSensoryTracking';
import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import { VisionTrackingView } from '@/hooks/useVisionTracking';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { speak as speakTTS } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const VOICE_PRAISE = ['Spotted it!', 'Sharp eyes!', 'Great watch!', 'You found it!', 'Super focus!'];

type Phase = 'intro' | 'calibrate' | 'play';
type RoundPhase = 'observe' | 'changed' | 'spot';

function tileAtCursor(cursor: Point | null, tiles: SensoryTileDef[]): SensoryTileDef | null {
  if (!cursor) return null;
  for (const t of tiles) {
    if (Math.hypot(cursor.x - t.x, cursor.y - t.y) <= t.radius) return t;
  }
  return null;
}

const SpotTheChangeGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const totalRounds = P.rounds;
  const displayTiles = SENSORY_TILES;

  const [active, setActive] = useState(true);
  const tracking = useSensoryTracking(active);
  const { sample, hasCamera, cameraSupported, pose, vision, previewContainerId, permissionGranted } = tracking;

  const {
    reset: resetAnalytics,
    recordTick,
    recordHold,
    recordStar,
    metaPayload: analyticsMeta,
  } = usePostureAnalytics();

  const [phase, setPhase] = useState<Phase>('intro');
  const [forceFallback, setForceFallback] = useState(false);
  const [round, setRound] = useState(0);
  const [spotted, setSpotted] = useState(0);
  const [roundPhase, setRoundPhase] = useState<RoundPhase>('observe');
  const [changedTileId, setChangedTileId] = useState<SensoryTileDef['id'] | null>(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const [banner, setBanner] = useState('');
  const [coachCue, setCoachCue] = useState(T.hintText);
  const [calibProgress, setCalibProgress] = useState(0);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [integration, setIntegration] = useState(0);
  const [engagement, setEngagement] = useState(0);
  const [attention, setAttention] = useState(0);
  const [quality, setQuality] = useState(0);
  const [activeTileId, setActiveTileId] = useState<SensoryTileDef['id'] | null>(null);
  const [changeFlash, setChangeFlash] = useState(false);

  const [showCongrats, setShowCongrats] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number; accuracy: number } | null>(
    null,
  );

  const camLive = hasCamera && !forceFallback;
  const useNativeVision = Platform.OS === 'android' && vision.isModuleAvailable && !forceFallback;

  const sampleRef = useRef(sample);
  const phaseRef = useRef<Phase>('intro');
  const roundPhaseRef = useRef<RoundPhase>('observe');
  const doneRef = useRef(false);
  const camLiveRef = useRef(camLive);
  const roundRef = useRef(0);
  const changedIdRef = useRef<SensoryTileDef['id'] | null>(null);
  const holdMsRef = useRef(0);
  const lastInZoneRef = useRef(0);
  const spotStartRef = useRef(0);
  const prevCursorRef = useRef(sample.cursor);
  const qualSumRef = useRef(0);
  const qualCountRef = useRef(0);
  const completedRef = useRef(0);
  const integrationSumRef = useRef(0);
  const lastTickRef = useRef(0);

  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => { sampleRef.current = sample; }, [sample]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { roundPhaseRef.current = roundPhase; }, [roundPhase]);
  useEffect(() => { camLiveRef.current = camLive; }, [camLive]);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      timeoutsRef.current = timeoutsRef.current.filter((t) => t !== id);
      fn();
    }, ms);
    timeoutsRef.current.push(id);
  }, []);

  const clearTimers = useCallback(() => {
    if (tickTimerRef.current) clearInterval(tickTimerRef.current);
    tickTimerRef.current = null;
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const targetTileForRound = useCallback((r: number) => {
    const idx = ROUND_CHANGE_INDEX[Math.min(r, ROUND_CHANGE_INDEX.length - 1)] ?? 0;
    return displayTiles[idx]!;
  }, [displayTiles]);

  const beginSpotPhase = useCallback(() => {
    roundPhaseRef.current = 'spot';
    setRoundPhase('spot');
    setBanner(T.spotLabel);
    setCoachCue('Move to the tile that changed and hold steady!');
    spotStartRef.current = Date.now();
    setChangeFlash(false);
  }, []);

  const triggerChange = useCallback(
    (tile: SensoryTileDef) => {
      changedIdRef.current = tile.id;
      setChangedTileId(tile.id);
      roundPhaseRef.current = 'changed';
      setRoundPhase('changed');
      setBanner(T.changeLabel);
      setCoachCue(T.hintText);
      setChangeFlash(true);
      speakTTS(T.voiceChange, 0.85).catch(() => {});
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      schedule(() => beginSpotPhase(), P.changeFlashMs);
    },
    [beginSpotPhase, schedule],
  );

  const endGame = useCallback(async () => {
    if (doneRef.current) return;
    doneRef.current = true;
    clearTimers();
    setActive(false);
    await tracking.vision.stopTracking().catch(() => {});

    const accuracy =
      qualCountRef.current > 0 ? Math.round((qualSumRef.current / qualCountRef.current) * 100) : 0;
    const xp = spotted * 14 + accuracy + Math.round(integrationSumRef.current / Math.max(1, completedRef.current));
    setFinalStats({ correct: completedRef.current, total: totalRounds, xp, accuracy });
    setShowCongrats(true);

    try {
      await recordGame({
        gameId: 'spot-the-change',
        score: spotted,
        accuracy,
        meta: { ...analyticsMeta, integration: integrationSumRef.current / Math.max(1, completedRef.current) },
      });
      await logGameAndAward('spot-the-change', spotted, xp);
    } catch {
      // offline
    }
    speakTTS(T.voiceComplete, 0.85).catch(() => {});
  }, [analyticsMeta, clearTimers, spotted, totalRounds, tracking.vision]);

  const startRound = useCallback(
    (r: number) => {
      const tile = targetTileForRound(r);
      roundRef.current = r;
      setRound(r);
      holdMsRef.current = 0;
      lastInZoneRef.current = 0;
      setHoldProgress(0);
      setActiveTileId(null);
      changedIdRef.current = null;
      setChangedTileId(null);
      roundPhaseRef.current = 'observe';
      setRoundPhase('observe');
      setBanner(T.observeLabel);
      setCoachCue('Watch all the garden tiles carefully…');
      setChangeFlash(false);

      schedule(() => triggerChange(tile), P.observeMs);
    },
    [schedule, targetTileForRound, triggerChange],
  );

  const completeRound = useCallback(() => {
    if (doneRef.current) return;
    setHoldProgress(0);
    setBanner('');
    setActiveTileId(null);

    recordHold(P.holdToSpotMs);
    completedRef.current += 1;
    integrationSumRef.current += integration;

    const spotMs = Date.now() - spotStartRef.current;
    const quickBonus = spotMs < P.quickSpotBonusMs;

    setSparkleKey((k) => k + 1);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    const next = completedRef.current;
    if (next % P.starEveryNRounds === 0 || quickBonus) {
      recordStar();
      speakTTS(VOICE_PRAISE[Math.floor(Math.random() * VOICE_PRAISE.length)]!, 0.85).catch(() => {});
    }
    setSpotted((n) => n + 1);

    if (next >= totalRounds) {
      schedule(() => endGame(), P.betweenRoundsMs);
    } else {
      schedule(() => startRound(next), P.betweenRoundsMs);
    }
  }, [endGame, integration, recordHold, recordStar, schedule, startRound, totalRounds]);

  const tick = useCallback(() => {
    if (doneRef.current || phaseRef.current !== 'play') return;
    const now = Date.now();
    const dt = lastTickRef.current ? now - lastTickRef.current : P.tickMs;
    lastTickRef.current = now;

    const s = sampleRef.current;
    const target = targetTileForRound(roundRef.current);
    const onTile = tileAtCursor(s.cursor, displayTiles);
    setActiveTileId(onTile?.id ?? null);

    if (!camLiveRef.current) {
      if (roundPhaseRef.current === 'spot') {
        const elapsed = now - spotStartRef.current;
        const t = clamp01(elapsed / P.fallbackSpotMs);
        setHoldProgress(t);
        setEngagement(0.76);
        setAttention(0.8);
        setQuality(0.82);
        setIntegration(0.48 + t * 0.45);
        if (t >= 1) completeRound();
      }
      recordTick(dt, { upright: true, still: false, quality: 0.82 });
      return;
    }

    if (!s.present || !s.cursor) {
      setCoachCue(T.positionCue);
      if (roundPhaseRef.current === 'spot') {
        holdMsRef.current = 0;
        setHoldProgress(0);
      }
      recordTick(dt, { upright: false, still: false, quality: 0.2 });
      return;
    }

    const prev = prevCursorRef.current;
    const smooth = movementSmoothness(prev, s.cursor);
    const motion = prev && s.cursor ? distNorm(prev, s.cursor) : 0;
    prevCursorRef.current = s.cursor;

    const engage = engagementFromMotion(motion);
    const attn = s.attentionScore;
    const onCorrect =
      roundPhaseRef.current === 'spot' && onTile?.id === changedIdRef.current && inOrbZone(s.cursor, target);
    const adapt = adaptiveResponseScore(
      onCorrect,
      holdMsRef.current / P.holdToSpotMs,
      s.postureQuality,
      smooth,
      attn,
    );
    const q = clamp01(adapt * 0.65 + s.postureQuality * 0.35);

    setEngagement(engage);
    setAttention(attn);
    setIntegration(adapt);
    setQuality(q);
    qualSumRef.current += q;
    qualCountRef.current += 1;

    if (roundPhaseRef.current === 'spot' && changedIdRef.current) {
      if (onCorrect) {
        if (lastInZoneRef.current === 0) lastInZoneRef.current = now;
        holdMsRef.current += dt;
        const prog = clamp01(holdMsRef.current / P.holdToSpotMs);
        setHoldProgress(prog);
        setCoachCue(T.hintText);
        if (prog >= 1) completeRound();
      } else if (onTile && onTile.id !== changedIdRef.current) {
        holdMsRef.current = Math.max(0, holdMsRef.current - dt);
        setHoldProgress(clamp01(holdMsRef.current / P.holdToSpotMs));
        setCoachCue('That tile did not change — find the different one!');
        lastInZoneRef.current = 0;
      } else if (now - (lastInZoneRef.current || now) > P.holdGraceMs) {
        holdMsRef.current = Math.max(0, holdMsRef.current - dt * 0.5);
        setHoldProgress(clamp01(holdMsRef.current / P.holdToSpotMs));
        lastInZoneRef.current = 0;
      }
    }

    recordTick(dt, { upright: s.postureQuality > 0.4, still: smooth > 0.55, quality: q });
  }, [completeRound, displayTiles, recordTick, targetTileForRound]);

  const beginPlay = useCallback(() => {
    phaseRef.current = 'play';
    setPhase('play');
    completedRef.current = 0;
    qualSumRef.current = 0;
    qualCountRef.current = 0;
    integrationSumRef.current = 0;
    resetAnalytics();
    schedule(() => startRound(0), P.roundIntroMs);
    if (tickTimerRef.current) clearInterval(tickTimerRef.current);
    tickTimerRef.current = setInterval(tick, P.tickMs);
  }, [resetAnalytics, schedule, startRound, tick]);

  const beginCalibration = useCallback(async () => {
    phaseRef.current = 'calibrate';
    setPhase('calibrate');
    setCalibProgress(0);
    setCoachCue('Get ready to watch for changes…');
    await tracking.vision.resetCalibration().catch(() => {});
    const start = Date.now();
    const timer = setInterval(() => {
      const p = clamp01((Date.now() - start) / P.calibrationMs);
      setCalibProgress(p);
      if (p >= 1) {
        clearInterval(timer);
        schedule(beginPlay, 400);
      }
    }, 80);
  }, [beginPlay, schedule, tracking.vision]);

  useEffect(() => {
    return () => {
      clearTimers();
      tracking.vision.stopTracking().catch(() => {});
      cleanupSounds();
      stopAllSpeech();
    };
  }, [clearTimers, tracking.vision]);

  const handleBack = useCallback(() => {
    clearTimers();
    stopAllSpeech();
    onBack?.();
  }, [clearTimers, onBack]);

  if (showCongrats && finalStats) {
    return (
      <CongratulationsScreen
        title={T.congrats}
        subtitle={`${finalStats.correct}/${finalStats.total} changes spotted · ${finalStats.accuracy}% quality`}
        emoji={T.emoji}
        onContinue={() => {
          setShowCongrats(false);
          onComplete?.();
        }}
        onHome={() => router.replace('/(tabs)/TherapyProgress')}
      />
    );
  }

  const renderOverlay = () => (
    <>
      <SpotTheChangeVisuals changeFlash={changeFlash} />
      <IntegrationMeter integration={integration} engagement={engagement} attention={attention} />
      {phase === 'play' && (
        <>
          <SensoryTileGrid
            tiles={displayTiles}
            changedTileId={changedTileId}
            phase={roundPhase}
            holdProgress={holdProgress}
            activeTileId={activeTileId}
          />
          <ExplorerCursor
            cursor={sample.cursor}
            leftWrist={sample.leftWrist}
            rightWrist={sample.rightWrist}
            accent={T.accentHot}
          />
          {!!banner && (
            <View style={styles.phaseBanner} pointerEvents="none">
              <Text style={styles.phaseBannerText}>{banner}</Text>
            </View>
          )}
        </>
      )}
      <SparkleBurst key={sparkleKey} visible={sparkleKey > 0} color={PRISM_SHELL.sparkleColor} count={20} />
      {phase === 'calibrate' && (
        <View style={styles.calibWrap} pointerEvents="none">
          <Text style={styles.calibText}>Calibrating visual focus… {Math.round(calibProgress * 100)}%</Text>
          <View style={styles.calibTrack}>
            <View style={[styles.calibFill, { width: `${calibProgress * 100}%` }]} />
          </View>
        </View>
      )}
    </>
  );

  return (
    <LinearGradient colors={T.bgGradient} style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { borderColor: PRISM_SHELL.backBorder }]}>
            <Text style={[styles.backText, { color: PRISM_SHELL.backText }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.academyLabel}>🔍 {PRISM_SHELL.academyLabel}</Text>
          <View style={{ width: 64 }} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>{T.emoji} {T.title}</Text>
          <Text style={styles.subtitle}>{T.subtitle}</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statPill, { borderColor: PRISM_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: PRISM_SHELL.statLabel }]}>Round</Text>
              <Text style={[styles.statValue, { color: PRISM_SHELL.statValue }]}>
                {Math.min(round + (phase === 'play' ? 1 : 0), totalRounds)}/{totalRounds}
              </Text>
            </View>
            <View style={[styles.statPill, { borderColor: PRISM_SHELL.statBorder }]}>
              <Text style={styles.statEmoji}>✨</Text>
              <Text style={[styles.statValue, { color: PRISM_SHELL.statValue }]}>{spotted}</Text>
            </View>
            <View style={[styles.statPill, { borderColor: PRISM_SHELL.statBorder }]}>
              <Text style={[styles.statLabel, { color: PRISM_SHELL.statLabel }]}>Quality</Text>
              <Text style={[styles.statValue, { color: PRISM_SHELL.statValue }]}>{Math.round(quality * 100)}%</Text>
            </View>
          </View>
        </View>

        <View style={styles.stageWrap}>
          {useNativeVision ? (
            <View style={styles.nativeStage}>
              <VisionTrackingView active={camLive} style={StyleSheet.absoluteFill} />
              {renderOverlay()}
              {(phase === 'play' || phase === 'calibrate') && !!coachCue && (
                <View style={styles.cueWrap} pointerEvents="none">
                  <Text style={styles.cueText}>{coachCue}</Text>
                </View>
              )}
            </View>
          ) : (
            <CameraStage
              {...poseStageNativeProps(pose)}
              previewContainerId={previewContainerId}
              cameraSupported={cameraSupported}
              permissionGranted={permissionGranted}
              hasCamera={hasCamera}
              present={sample.present}
              isDetecting={pose.isDetecting}
              calibrating={phase === 'calibrate'}
              quality={quality}
              glowColor={T.glow}
              hero={T.hero}
              coachCue={phase === 'play' || phase === 'calibrate' ? coachCue : ''}
            >
              {renderOverlay()}
            </CameraStage>
          )}
        </View>

        {phase === 'intro' && (
          <View style={styles.bottomPanel}>
            {tracking.error && camLive && <Text style={styles.errorText}>{tracking.error}</Text>}
            <View style={styles.skillRow}>
              {T.skillTags.map((tag) => (
                <View key={tag} style={styles.skillPill}>
                  <Text style={styles.skillText}>{tag}</Text>
                </View>
              ))}
            </View>
            <Pressable
              style={[styles.primaryBtn, { backgroundColor: T.accent }]}
              onPress={() => {
                speakTTS(T.voiceIntro, 0.85).catch(() => {});
                tracking.requestCameraAccess().finally(() => beginCalibration());
              }}
            >
              <Text style={styles.primaryBtnText}>Enter Prism Garden</Text>
            </Pressable>
            {cameraSupported && !camLive && (
              <Pressable style={styles.secondaryBtn} onPress={() => setForceFallback(true)}>
                <Text style={styles.secondaryText}>Skip camera — guided mode</Text>
              </Pressable>
            )}
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

export default SpotTheChangeGame;

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 4 },
  backBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1 },
  backText: { fontWeight: '800', fontSize: 14 },
  academyLabel: { color: '#6EE7B7', fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  title: { color: '#fff', fontSize: 24, fontWeight: '900' },
  subtitle: { color: '#D1FAE5', fontSize: 13, fontWeight: '600', marginTop: 4, lineHeight: 18 },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  statLabel: { fontSize: 10, fontWeight: '800' },
  statValue: { fontSize: 16, fontWeight: '900' },
  statEmoji: { fontSize: 16 },
  stageWrap: { flex: 1, marginHorizontal: 16, marginBottom: 8, minHeight: 300 },
  nativeStage: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: PRISM_SHELL.stageBorder,
    backgroundColor: PRISM_SHELL.stageBg,
    position: 'relative',
  },
  phaseBanner: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    backgroundColor: 'rgba(8,24,20,0.82)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: PRISM_SHELL.glassBorder,
  },
  phaseBannerText: { color: PRISM_SHELL.gold, fontSize: 15, fontWeight: '900', letterSpacing: 1.5 },
  calibWrap: { position: 'absolute', bottom: 48, left: 24, right: 24 },
  calibText: { color: '#fff', fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  calibTrack: { height: 8, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.15)', overflow: 'hidden' },
  calibFill: { height: '100%', borderRadius: 6, backgroundColor: '#10B981' },
  cueWrap: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    maxWidth: '90%',
    backgroundColor: 'rgba(8,24,20,0.78)',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: PRISM_SHELL.glassBorder,
  },
  cueText: { color: PRISM_SHELL.gold, fontSize: 14, fontWeight: '800', textAlign: 'center' },
  bottomPanel: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: PRISM_SHELL.glassBorder,
    gap: 12,
  },
  skillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  skillPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, backgroundColor: 'rgba(16,185,129,0.18)' },
  skillText: { color: '#A7F3D0', fontSize: 10, fontWeight: '700' },
  primaryBtn: { borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { color: '#042F2E', fontSize: 16, fontWeight: '900' },
  secondaryBtn: { paddingVertical: 8, alignItems: 'center' },
  secondaryText: { color: '#D1FAE5', fontWeight: '700' },
  errorText: { color: PRISM_SHELL.warn, textAlign: 'center', fontWeight: '700', fontSize: 12 },
});
