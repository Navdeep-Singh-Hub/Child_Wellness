/**
 * Speech Level 2 — Positions & Prepositions (shared UI).
 */

import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import RoundSuccessAnimation from '@/components/game/RoundSuccessAnimation';
import { logGameAndAward } from '@/utils/api';
import { clearScheduledSpeech, DEFAULT_TTS_RATE, speak as speakTTS, stopTTS } from '@/utils/tts';
import { Level2ChoiceTile } from '@/components/game/speech/level2-shared/Level2ChoiceTile';
import { Level2Picture } from '@/components/game/speech/level2-shared/Level2Picture';
import type { Level2ImageKey } from '@/components/game/speech/level2-shared/speechLevel2Assets';
import {
  type Level2BaseShellProps,
  renderLevel2Shell,
} from '@/components/game/speech/level2-shared/level2ShellProps';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useRef, useState } from 'react';
import { LayoutRectangle, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';

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

export function PositionsShell(props: Level2BaseShellProps) {
  return renderLevel2Shell(
    clearPositionSpeech,
    {
      startEmoji: '📍',
      startTitle: 'Where does it go?',
      startHint: 'Learn in, out, under, behind, left, right, near, and far.',
    },
    props,
  );
}

export function PositionChoiceTile({
  label,
  emoji,
  imageKey,
  accent,
  onPress,
  selected,
}: {
  label: string;
  emoji?: string;
  imageKey?: Level2ImageKey;
  accent: string;
  onPress: () => void;
  selected?: boolean;
}) {
  return (
    <Level2ChoiceTile
      label={label}
      emoji={emoji}
      imageKey={imageKey}
      accent={accent}
      onPress={onPress}
      selected={selected}
    />
  );
}

export function PositionZone({
  label,
  emoji,
  imageKey,
  accent,
  onPress,
  active,
  done,
  style,
}: {
  label: string;
  emoji?: string;
  imageKey?: Level2ImageKey;
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
      {(imageKey || emoji) ? (
        <Level2Picture imageKey={imageKey} emoji={emoji} variant="zone" />
      ) : null}
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
  itemImageKey,
  zoneLabel,
  zoneEmoji,
  zoneImageKey,
  accent,
  startX = 24,
  startY = 100,
  onSuccess,
  hintOut = 'Drag teddy into the box!',
}: {
  itemEmoji?: string;
  itemImageKey?: Level2ImageKey;
  zoneLabel: string;
  zoneEmoji?: string;
  zoneImageKey?: Level2ImageKey;
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
        <Level2Picture imageKey={zoneImageKey} emoji={zoneEmoji} variant="small" />
        <Text style={[styles.dropZoneLabel, { color: accent }]}>{zoneLabel}</Text>
        {inBox ? (
          <Level2Picture imageKey={itemImageKey} emoji={itemEmoji} variant="small" imageStyle={styles.inBoxPicture} />
        ) : null}
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
          <Level2Picture imageKey={itemImageKey} emoji={itemEmoji} variant="choice" />
        </View>
      ) : null}
      {!inBox ? (
        <Text style={styles.dragHint}>👆 Drag {itemEmoji ?? 'it'} into the box</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
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
  dropZoneLabel: { fontSize: 13, fontWeight: '800', marginTop: 4 },
  inBoxPicture: { marginTop: 6 },
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
  dragHint: { position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center', fontSize: 14, fontWeight: '700', color: '#475569' },
});
