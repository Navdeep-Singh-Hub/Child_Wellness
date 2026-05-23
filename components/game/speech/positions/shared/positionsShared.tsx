/**
 * Speech Level 2 — Positions & Prepositions (shared UI).
 */

import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import RoundSuccessAnimation from '@/components/game/RoundSuccessAnimation';
import { logGameAndAward } from '@/utils/api';
import { clearScheduledSpeech, DEFAULT_TTS_RATE, speak as speakTTS, stopTTS } from '@/utils/tts';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useRef, useState } from 'react';
import {
  LayoutRectangle,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const DEFAULT_POSITION_ROUNDS = 3;

export type PositionsGameId =
  | 'put-teddy-in-box'
  | 'under-the-table'
  | 'left-or-right'
  | 'near-or-far'
  | 'behind-the-tree';

export function clearPositionSpeech() {
  clearScheduledSpeech();
  try {
    stopTTS();
  } catch {
    /* ignore */
  }
}

export function speakPosition(text: string, rate = DEFAULT_TTS_RATE) {
  clearPositionSpeech();
  speakTTS(text, rate);
}

export function hapticPositionSuccess() {
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    /* ignore */
  }
}

export function usePositionsSession(gameId: PositionsGameId, rounds = DEFAULT_POSITION_ROUNDS) {
  const [round, setRound] = useState(1);
  const [showRoundSuccess, setShowRoundSuccess] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [finalStats, setFinalStats] = useState<{ accuracy: number; totalStars: number } | null>(null);
  const finishedRef = useRef(false);

  const finishGame = useCallback(
    async (accuracy: number) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : 1;
      setFinalStats({ accuracy, totalStars: stars });
      setGameFinished(true);
      try {
        await logGameAndAward({
          type: gameId,
          correct: rounds,
          total: rounds,
          accuracy,
          xpAwarded: stars * 15,
          durationMs: rounds * 40000,
          skillTags: ['prepositions', 'spatial', 'speech-level-2'],
        });
      } catch (e) {
        console.warn('[positions game] log failed', e);
      }
    },
    [gameId, rounds],
  );

  const completeRound = useCallback(() => {
    if (round >= rounds) {
      void finishGame(Math.min(100, 70 + round * 10));
      return;
    }
    setShowRoundSuccess(true);
    setTimeout(() => {
      setShowRoundSuccess(false);
      setRound((r) => r + 1);
    }, 1400);
  }, [round, rounds, finishGame]);

  return { round, rounds, showRoundSuccess, gameFinished, finalStats, completeRound };
}

export function PositionsOverlays({
  showRoundSuccess,
  gameFinished,
  finalStats,
  onBack,
  onComplete,
}: {
  showRoundSuccess: boolean;
  gameFinished: boolean;
  finalStats: { accuracy: number; totalStars: number } | null;
  onBack: () => void;
  onComplete?: () => void;
}) {
  return (
    <>
      <RoundSuccessAnimation visible={showRoundSuccess} stars={3} />
      {gameFinished && finalStats && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <CongratulationsScreen
            message="Great spatial thinking!"
            accuracy={finalStats.accuracy}
            correct={finalStats.totalStars}
            total={3}
            xpAwarded={finalStats.totalStars * 15}
            onHome={() => {
              clearPositionSpeech();
              onBack();
            }}
            onContinue={() => {
              clearPositionSpeech();
              onComplete?.();
            }}
          />
        </View>
      )}
    </>
  );
}

type ShellProps = {
  title: string;
  subtitle: string;
  skills: string;
  gradient: [string, string];
  accent: string;
  onBack: () => void;
  round: number;
  rounds: number;
  canPlay: boolean;
  onStart: () => void;
  phaseHint: string;
  children: React.ReactNode;
};

export function PositionsShell({
  title,
  subtitle,
  skills,
  gradient,
  accent,
  onBack,
  round,
  rounds,
  canPlay,
  onStart,
  phaseHint,
  children,
}: ShellProps) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <LinearGradient colors={gradient} style={styles.flex}>
        <View style={[styles.header, { borderBottomColor: accent }]}>
          <TouchableOpacity
            onPress={() => {
              clearPositionSpeech();
              onBack();
            }}
            style={[styles.backBtn, { backgroundColor: `${accent}22` }]}
          >
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
        </View>

        {!canPlay ? (
          <View style={styles.startWrap}>
            <Text style={styles.startEmoji}>📍</Text>
            <Text style={styles.startTitle}>Where does it go?</Text>
            <Text style={styles.startHint}>Learn in, out, under, behind, left, right, near, and far.</Text>
            <Pressable style={[styles.startBtn, { backgroundColor: accent }]} onPress={onStart}>
              <Text style={styles.startBtnText}>Start</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={[styles.hintBar, { backgroundColor: `${accent}33` }]}>
              <Text style={styles.hintText}>{phaseHint}</Text>
            </View>
            <View style={styles.playArea}>{children}</View>
          </>
        )}

        <View style={styles.footer}>
          <Text style={styles.skills}>{skills}</Text>
          <View style={styles.dotsRow}>
            {Array.from({ length: rounds }).map((_, i) => (
              <View
                key={i}
                style={[styles.dot, { borderColor: accent }, i < round && { backgroundColor: accent }]}
              />
            ))}
          </View>
          <Text style={styles.progressText}>
            Round {Math.min(round, rounds)} / {rounds}
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

export function PositionChoiceTile({
  label,
  emoji,
  accent,
  onPress,
  selected,
}: {
  label: string;
  emoji: string;
  accent: string;
  onPress: () => void;
  selected?: boolean;
}) {
  return (
    <Pressable
      style={[styles.choiceTile, selected && { borderColor: accent, borderWidth: 3 }]}
      onPress={onPress}
    >
      <Text style={styles.choiceEmoji}>{emoji}</Text>
      <Text style={[styles.choiceLabel, { color: accent }]}>{label}</Text>
    </Pressable>
  );
}

export function PositionZone({
  label,
  emoji,
  accent,
  onPress,
  active,
  done,
  style,
}: {
  label: string;
  emoji?: string;
  accent: string;
  onPress: () => void;
  active?: boolean;
  done?: boolean;
  style?: object;
}) {
  return (
    <Pressable
      style={[
        styles.zone,
        { borderColor: accent },
        active && styles.zoneActive,
        done && styles.zoneDone,
        style,
      ]}
      onPress={onPress}
    >
      {emoji ? <Text style={styles.zoneEmoji}>{emoji}</Text> : null}
      <Text style={[styles.zoneLabel, { color: accent }]}>{label}</Text>
    </Pressable>
  );
}

function rectsOverlap(a: LayoutRectangle, b: LayoutRectangle) {
  const ax2 = a.x + a.width;
  const ay2 = a.y + a.height;
  const bx2 = b.x + b.width;
  const by2 = b.y + b.height;
  return a.x < bx2 && ax2 > b.x && a.y < by2 && ay2 > b.y;
}

/** Drag an item into a drop zone (measures layout on release). */
export function DragIntoZone({
  itemEmoji,
  zoneLabel,
  zoneEmoji,
  accent,
  startX = 24,
  startY = 100,
  onSuccess,
  hintOut = 'Drag teddy into the box!',
}: {
  itemEmoji: string;
  zoneLabel: string;
  zoneEmoji: string;
  accent: string;
  startX?: number;
  startY?: number;
  onSuccess: () => void;
  hintOut?: string;
}) {
  const [pos, setPos] = useState({ x: startX, y: startY });
  const [inBox, setInBox] = useState(false);
  const posRef = useRef(pos);
  posRef.current = pos;
  const itemSize = useRef({ width: 72, height: 72 });
  const zoneLayout = useRef<LayoutRectangle | null>(null);
  const dragStart = useRef({ posX: startX, posY: startY });

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !inBox,
      onMoveShouldSetPanResponder: () => !inBox,
      onPanResponderGrant: () => {
        dragStart.current = { posX: posRef.current.x, posY: posRef.current.y };
      },
      onPanResponderMove: (_, g) => {
        setPos({ x: dragStart.current.posX + g.dx, y: dragStart.current.posY + g.dy });
      },
      onPanResponderRelease: () => {
        const zone = zoneLayout.current;
        if (!zone) return;
        const itemRect: LayoutRectangle = {
          x: posRef.current.x,
          y: posRef.current.y,
          width: itemSize.current.width,
          height: itemSize.current.height,
        };
        if (rectsOverlap(itemRect, zone)) {
          hapticPositionSuccess();
          setInBox(true);
          speakPosition('Inside the box!');
          onSuccess();
        } else {
          speakPosition(hintOut);
          setPos({ x: startX, y: startY });
        }
      },
    }),
  ).current;

  return (
    <View style={styles.scene}>
      <View
        style={[styles.dropZone, { borderColor: accent }]}
        onLayout={(e) => {
          zoneLayout.current = e.nativeEvent.layout;
        }}
      >
        <Text style={styles.dropZoneEmoji}>{zoneEmoji}</Text>
        <Text style={[styles.dropZoneLabel, { color: accent }]}>{zoneLabel}</Text>
        {inBox ? <Text style={styles.inBoxEmoji}>{itemEmoji}</Text> : null}
      </View>
      {!inBox ? (
        <View
          style={[styles.draggable, { left: pos.x, top: pos.y }]}
          {...pan.panHandlers}
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            itemSize.current = { width, height };
          }}
        >
          <Text style={styles.draggableEmoji}>{itemEmoji}</Text>
        </View>
      ) : null}
      {!inBox ? (
        <Text style={styles.dragHint}>👆 Drag {itemEmoji} into the box</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderBottomWidth: 2,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 10 },
  backText: { marginLeft: 4, fontWeight: '700', color: '#0F172A', fontSize: 15 },
  headerText: { marginLeft: 10, flex: 1 },
  title: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  subtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  startWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  startEmoji: { fontSize: 56, marginBottom: 12 },
  startTitle: { fontSize: 22, fontWeight: '900', color: '#0F172A' },
  startHint: { fontSize: 15, color: '#475569', textAlign: 'center', marginTop: 8, lineHeight: 22 },
  startBtn: { marginTop: 24, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14 },
  startBtnText: { color: '#fff', fontWeight: '900', fontSize: 18 },
  hintBar: { marginHorizontal: 12, marginTop: 8, padding: 10, borderRadius: 10 },
  hintText: { fontSize: 15, fontWeight: '800', color: '#0F172A', textAlign: 'center' },
  playArea: { flex: 1, padding: 12 },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'web' ? 16 : 24,
    alignItems: 'center',
  },
  skills: { fontSize: 12, color: '#475569', textAlign: 'center', marginBottom: 8 },
  dotsRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, backgroundColor: 'transparent' },
  progressText: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  choiceTile: {
    flex: 1,
    minWidth: '42%',
    maxWidth: '48%',
    margin: 5,
    minHeight: 110,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceEmoji: { fontSize: 48 },
  choiceLabel: { fontSize: 14, fontWeight: '800', marginTop: 6 },
  zone: {
    minWidth: 100,
    minHeight: 72,
    padding: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoneActive: { borderStyle: 'solid', backgroundColor: 'rgba(255,255,255,0.95)' },
  zoneDone: { borderStyle: 'solid', backgroundColor: '#DCFCE7' },
  zoneEmoji: { fontSize: 32 },
  zoneLabel: { fontSize: 12, fontWeight: '800', marginTop: 4 },
  scene: { flex: 1, minHeight: 260, position: 'relative' },
  dropZone: {
    position: 'absolute',
    right: 16,
    top: 40,
    width: 140,
    height: 150,
    borderRadius: 14,
    borderWidth: 3,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropZoneEmoji: { fontSize: 48 },
  dropZoneLabel: { fontSize: 13, fontWeight: '800', marginTop: 4 },
  inBoxEmoji: { fontSize: 36, marginTop: 6 },
  draggable: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  draggableEmoji: { fontSize: 44 },
  dragHint: { position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center', fontSize: 14, fontWeight: '700', color: '#475569' },
});
