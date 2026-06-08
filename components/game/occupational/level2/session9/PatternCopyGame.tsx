/**
 * Shared tap-to-copy pattern game core for OT Level 2 Session 9.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { SESSION9_PACING } from '@/components/game/occupational/level2/session9/session9Pacing';
import {
  BlockToken,
  ColorToken,
  LineToken,
  Stroke,
  StrokeType,
  COLOR_HEX,
  renderBlockToken,
  renderLineToken,
  renderStrokeIcon,
  renderStrokeLine,
  strokeFromType,
  useTraceSound,
} from '@/components/game/occupational/level2/session9/patternUtils';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { speak as speakTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg from 'react-native-svg';

const P = SESSION9_PACING;
const SUCCESS = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const WARN = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR = require('@/assets/icons/star.png');

export type CopyMode = 'line' | 'block' | 'color' | 'stick';

export type PatternTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  gradient: [string, string, string, string];
  targetColor: string;
  userColor: string;
  emptyColor: string;
  btnBg: string;
  btnBorder: string;
  btnText: string;
  backText: string;
  backBorder: string;
  titleColor: string;
  subtitleColor: string;
  statLabel: string;
  statValue: string;
  statBorder: string;
  playBorder: string;
  playBg: string;
  sparkleColor: string;
  hintText: string;
  sectionBg: string;
};

export type PatternCopyConfig = {
  theme: PatternTheme;
  mode: CopyMode;
  generatePattern: () => LineToken[] | BlockToken[] | ColorToken[] | Stroke[];
  ttsIntro: string;
  ttsComplete: string;
  ttsWrong: string;
  congratsMessage: string;
  logType: string;
  skillTags: string[];
};

type AnyToken = LineToken | BlockToken | ColorToken | Stroke;

export const PatternCopyGame: React.FC<
  PatternCopyConfig & { onBack?: () => void; onComplete?: () => void }
> = ({
  theme: T,
  mode,
  generatePattern,
  ttsIntro,
  ttsComplete,
  ttsWrong,
  congratsMessage,
  logType,
  skillTags,
  onBack,
  onComplete,
}) => {
  const router = useRouter();
  const playSuccess = useTraceSound(SUCCESS);
  const playWarn = useTraceSound(WARN);
  const TOTAL = P.totalRounds;

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [target, setTarget] = useState<AnyToken[]>([]);
  const [user, setUser] = useState<AnyToken[]>([]);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [warnVisible, setWarnVisible] = useState(false);

  const roundActiveRef = useRef(true);
  const doneRef = useRef(false);
  const targetRef = useRef<AnyToken[]>([]);
  const generateRef = useRef(generatePattern);

  const initRound = useCallback(() => {
    const pat = generateRef.current();
    setTarget(pat);
    targetRef.current = pat;
    setUser([]);
    roundActiveRef.current = true;
  }, []);

  const endGame = useCallback(
    (finalScore: number) => {
      const total = TOTAL;
      const xp = finalScore * 18;
      setFinalStats({ correct: finalScore, total, xp });
      setDone(true);
      doneRef.current = true;
      roundActiveRef.current = false;
      setShowCongratulations(true);
      speakTTS(ttsComplete, 0.78);
      recordGame(xp)
        .then(() =>
          logGameAndAward({
            type: logType,
            correct: finalScore,
            total,
            accuracy: (finalScore / total) * 100,
            xpAwarded: xp,
            skillTags,
          }),
        )
        .then(() => router.setParams({ refreshStats: Date.now().toString() }))
        .catch(console.error);
    },
    [router, skillTags, logType, ttsComplete],
  );

  useEffect(() => {
    if (!doneRef.current) initRound();
  }, [round]);

  useEffect(() => {
    speakTTS(ttsIntro, 0.78);
    return () => {
      stopAllSpeech();
      cleanupSounds();
    };
  }, [ttsIntro]);

  const patternsMatch = (a: AnyToken[], b: AnyToken[]) => {
    if (a.length !== b.length) return false;
    if (mode === 'stick') {
      return (a as Stroke[]).every((s, i) => s.type === (b as Stroke[])[i]!.type);
    }
    return a.every((t, i) => t === b[i]);
  };

  const completeRound = useCallback(() => {
    setSparkleKey(Date.now());
    playSuccess();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    roundActiveRef.current = false;
    setScore((prev) => {
      const next = prev + 1;
      setTimeout(() => {
        if (next >= TOTAL) endGame(next);
        else {
          setRound((r) => r + 1);
          roundActiveRef.current = true;
        }
      }, P.nextRoundDelayMs);
      return next;
    });
  }, [endGame, playSuccess]);

  const failAttempt = useCallback(() => {
    setUser([]);
    setWarnVisible(true);
    setTimeout(() => setWarnVisible(false), 900);
    playWarn();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    speakTTS(ttsWrong, 0.78).catch(() => {});
  }, [playWarn, ttsWrong]);

  const handleToken = useCallback(
    (token: LineToken | BlockToken | ColorToken | StrokeType) => {
      if (!roundActiveRef.current || doneRef.current) return;

      setUser((prev) => {
        const tgt = targetRef.current;
        if (prev.length >= tgt.length) return prev;

        const nextUser: AnyToken[] =
          mode === 'stick'
            ? [...prev, strokeFromType(token as StrokeType, tgt[prev.length] as Stroke)]
            : [...prev, token as LineToken | BlockToken | ColorToken];

        if (nextUser.length === tgt.length) {
          setTimeout(() => {
            if (patternsMatch(nextUser, tgt)) completeRound();
            else failAttempt();
          }, 0);
        }
        return nextUser;
      });
    },
    [mode, completeRound, failAttempt],
  );

  const renderTarget = () => {
    if (mode === 'line') {
      return (target as LineToken[]).map((t, i) => renderLineToken(t, i, T.targetColor));
    }
    if (mode === 'block') {
      return (target as BlockToken[]).map((t, i) =>
        renderBlockToken(t, i, P.blockSize, T.targetColor, '#475569'),
      );
    }
    if (mode === 'color') {
      return (
        <View style={styles.colorRow}>
          {(target as ColorToken[]).map((c, i) => (
            <View key={i} style={[styles.colorCell, { backgroundColor: COLOR_HEX[c] }]} />
          ))}
        </View>
      );
    }
    return (target as Stroke[]).map((s, i) => renderStrokeLine(s, i, T.targetColor));
  };

  const renderUser = () => {
    if (mode === 'line') {
      return user.map((t, i) => renderLineToken(t as LineToken, i, T.userColor));
    }
    if (mode === 'block') {
      return user.map((t, i) => renderBlockToken(t as BlockToken, i, P.blockSize, T.userColor, '#A78BFA'));
    }
    if (mode === 'color') {
      return (
        <View style={styles.colorRow}>
          {user.map((c, i) => (
            <View key={i} style={[styles.colorCell, { backgroundColor: COLOR_HEX[c as ColorToken] }]} />
          ))}
          {Array.from({ length: Math.max(0, target.length - user.length) }).map((_, i) => (
            <View key={`e-${i}`} style={[styles.colorCell, styles.colorEmpty]} />
          ))}
        </View>
      );
    }
    return (user as Stroke[]).map((s, i) => renderStrokeLine(s, i, T.userColor));
  };

  const controls = () => {
    if (mode === 'line') {
      return (
        <>
          <ControlBtn T={T} label="| Vertical" onPress={() => handleToken('vertical')} disabled={user.length >= target.length} />
          <ControlBtn T={T} label="— Horizontal" onPress={() => handleToken('horizontal')} disabled={user.length >= target.length} />
        </>
      );
    }
    if (mode === 'block') {
      return (
        <>
          <ControlBtn T={T} label="□ Square" onPress={() => handleToken('square')} disabled={user.length >= target.length} />
          <ControlBtn T={T} label="○ Circle" onPress={() => handleToken('circle')} disabled={user.length >= target.length} />
        </>
      );
    }
    if (mode === 'color') {
      return (['red', 'blue', 'yellow', 'green'] as ColorToken[]).map((c) => (
        <Pressable
          key={c}
          onPress={() => handleToken(c)}
          disabled={user.length >= target.length}
          style={[styles.colorBtn, { backgroundColor: COLOR_HEX[c], opacity: user.length >= target.length ? 0.4 : 1 }]}
        />
      ));
    }
    return (['vertical', 'horizontal', 'diagonal-down', 'diagonal-up'] as StrokeType[]).map((st) => (
      <Pressable
        key={st}
        onPress={() => handleToken(st)}
        disabled={user.length >= target.length}
        style={[styles.strokeBtn, { borderColor: T.btnBorder, opacity: user.length >= target.length ? 0.4 : 1 }]}
      >
        <Svg width={30} height={30} viewBox="0 0 30 30">
          {renderStrokeIcon(st)}
        </Svg>
        <Text style={[styles.strokeLabel, { color: T.btnText }]}>{st.replace('-', ' ')}</Text>
      </Pressable>
    ));
  };

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen
        message={congratsMessage}
        showButtons
        correct={finalStats.correct}
        total={finalStats.total}
        xpAwarded={finalStats.xp}
        onContinue={() => {
          stopAllSpeech();
          cleanupSounds();
          onComplete ? onComplete() : onBack?.();
        }}
        onHome={() => {
          stopAllSpeech();
          cleanupSounds();
          onBack?.();
        }}
      />
    );
  }
  if (done && finalStats && !showCongratulations) return null;

  const svgHeight = mode === 'stick' ? 80 : mode === 'line' ? 100 : 60;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={T.gradient} locations={[0, 0.35, 0.75, 1]} style={StyleSheet.absoluteFillObject} />
      <TouchableOpacity
        onPress={() => {
          stopAllSpeech();
          cleanupSounds();
          onBack?.();
        }}
        style={styles.backBtn}
      >
        <View style={[styles.backInner, { borderColor: T.backBorder }]}>
          <Text style={[styles.backText, { color: T.backText }]}>← Back</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={[styles.title, { color: T.titleColor }]}>
          {T.emoji} {T.title}
        </Text>
        <Text style={[styles.subtitle, { color: T.subtitleColor }]}>{T.subtitle}</Text>
        <View style={styles.statsRow}>
          <View style={[styles.statPill, { borderColor: T.statBorder }]}>
            <Text style={[styles.statLabel, { color: T.statLabel }]}>Round</Text>
            <Text style={[styles.statValue, { color: T.statValue }]}>
              {round}/{TOTAL}
            </Text>
          </View>
          <View style={[styles.statPill, styles.starPill]}>
            <Image source={STAR} style={styles.starIcon} />
            <Text style={[styles.statValue, { color: T.statValue }]}>{score}</Text>
          </View>
        </View>
        <Text style={[styles.hint, { color: T.subtitleColor }]}>{T.hintText}</Text>
      </View>

      <View style={[styles.playArea, { borderColor: T.playBorder, backgroundColor: T.playBg }]}>
        <Text style={[styles.sectionTitle, { color: T.titleColor }]}>Copy this pattern</Text>
        <View style={[styles.patternBox, { backgroundColor: T.sectionBg, borderColor: T.playBorder }]}>
          {mode === 'color' ? renderTarget() : (
            <Svg width="100%" height={svgHeight} viewBox={`0 0 100 ${svgHeight}`} preserveAspectRatio="xMidYMid meet">
              {renderTarget()}
            </Svg>
          )}
        </View>

        <Text style={[styles.sectionTitle, { color: T.titleColor }]}>Your pattern</Text>
        <View style={[styles.patternBox, { backgroundColor: T.sectionBg, borderColor: T.playBorder }]}>
          {mode === 'color' ? renderUser() : (
            <Svg width="100%" height={svgHeight} viewBox={`0 0 100 ${svgHeight}`} preserveAspectRatio="xMidYMid meet">
              {renderUser()}
            </Svg>
          )}
        </View>

        <Text style={[styles.sectionTitle, { color: T.titleColor }]}>Tap to add</Text>
        <View style={styles.controlsRow}>{controls()}</View>

        <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color={T.sparkleColor} count={12} size={7} />

        {warnVisible && (
          <View style={styles.warnPill} pointerEvents="none">
            <Text style={styles.warnText}>Not quite — try again!</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const ControlBtn: React.FC<{ T: PatternTheme; label: string; onPress: () => void; disabled: boolean }> = ({
  T, label, onPress, disabled,
}) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    style={[styles.controlBtn, { backgroundColor: T.btnBg, borderColor: T.btnBorder, opacity: disabled ? 0.4 : 1 }]}
  >
    <Text style={[styles.controlBtnText, { color: T.btnText }]}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: 24, borderWidth: 1 },
  backText: { fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: '900' },
  subtitle: { fontSize: 14, fontWeight: '600', marginTop: 4, marginBottom: 8 },
  hint: { fontSize: 13, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.2)', borderColor: 'rgba(251,191,36,0.4)' },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, padding: 12 },
  sectionTitle: { fontSize: 13, fontWeight: '800', marginBottom: 6, marginTop: 4 },
  patternBox: { borderRadius: 14, borderWidth: 1, padding: 10, marginBottom: 8, alignItems: 'center', justifyContent: 'center', minHeight: 56 },
  colorRow: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  colorCell: { width: P.colorCellSize * 2, height: P.colorCellSize * 2, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' },
  colorEmpty: { backgroundColor: '#E2E8F0' },
  controlsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 4 },
  controlBtn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, borderWidth: 1, minWidth: 120, alignItems: 'center' },
  controlBtnText: { fontWeight: '800', fontSize: 15 },
  colorBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: 'rgba(255,255,255,0.8)' },
  strokeBtn: { alignItems: 'center', padding: 8, borderRadius: 12, borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.75)', minWidth: 72 },
  strokeLabel: { fontSize: 9, fontWeight: '700', marginTop: 2, textTransform: 'capitalize' },
  warnPill: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    left: '10%',
    right: '10%',
    backgroundColor: 'rgba(254,226,226,0.92)',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.25)',
  },
  warnText: { textAlign: 'center', fontSize: 13, fontWeight: '700', color: '#B91C1C' },
});

export default PatternCopyGame;
