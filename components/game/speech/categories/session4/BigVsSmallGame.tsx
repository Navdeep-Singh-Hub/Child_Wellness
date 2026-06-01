import {
  CategoriesOverlays,
  CategoriesShell,
  CategoryTile,
  clearCategorySpeech,
  DEFAULT_CATEGORY_ROUNDS,
  hapticCategorySuccess,
  speakCategory,
  useCategoriesSession,
} from '@/components/game/speech/categories/shared/categoriesShared';
import type { Level2ImageKey } from '@/components/game/speech/level2-shared/speechLevel2Assets';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

type Size = 'big' | 'small';

const ITEMS: { id: string; label: string; emoji: string; size: Size; imageKey: Level2ImageKey }[] = [
  { id: 'elephant', label: 'Elephant', emoji: '🐘', size: 'big', imageKey: 'elephant' },
  { id: 'ant', label: 'Ant', emoji: '🐜', size: 'small', imageKey: 'ant' },
  { id: 'house', label: 'House', emoji: '🏠', size: 'big', imageKey: 'house' },
  { id: 'bee', label: 'Bee', emoji: '🐝', size: 'small', imageKey: 'bee' },
];

export function BigVsSmallGame({ onBack, onComplete }: Props) {
  const session = useCategoriesSession('big-vs-small', DEFAULT_CATEGORY_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [sorted, setSorted] = useState<Set<string>>(new Set());
  const [targetSize, setTargetSize] = useState<Size>('big');

  useEffect(() => {
    speakCategory('Sort by size — big and small!');
    return () => clearCategorySpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    setSorted(new Set());
    setTargetSize(session.round % 2 === 1 ? 'big' : 'small');
    speakCategory(`Tap all the ${session.round % 2 === 1 ? 'big' : 'small'} things!`);
  }, [session.round, canPlay]);

  const need = ITEMS.filter((i) => i.size === targetSize);
  const left = need.filter((i) => !sorted.has(i.id)).length;

  return (
    <>
      <CategoriesShell
        title="Big vs Small"
        subtitle="Sort by size"
        skills="📏 Attributes"
        gradient={['#FEF3C7', '#FDE68A']}
        accent="#CA8A04"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={`Find ${targetSize} items — ${left} left`}
      >
        <View style={styles.zones}>
          <View style={styles.zone}>
            <Text style={styles.zoneEmoji}>🐘</Text>
            <Text style={styles.zoneLabel}>BIG</Text>
          </View>
          <View style={styles.zone}>
            <Text style={styles.zoneEmoji}>🐜</Text>
            <Text style={styles.zoneLabel}>SMALL</Text>
          </View>
        </View>
        <View style={styles.grid}>
          {ITEMS.map((item) => (
            <CategoryTile
              key={item.id}
              label={item.label}
              emoji={item.emoji}
              imageKey={item.imageKey}
              accent="#CA8A04"
              dimmed={sorted.has(item.id)}
              onPress={() => {
                if (item.size === targetSize) {
                  if (sorted.has(item.id)) return;
                  hapticCategorySuccess();
                  const next = new Set(sorted);
                  next.add(item.id);
                  setSorted(next);
                  speakCategory(item.size === 'big' ? 'Big!' : 'Small!');
                  if (need.every((n) => next.has(n.id))) {
                    setTimeout(() => session.completeRound(), 800);
                  }
                } else {
                  speakCategory(`Look for ${targetSize} things!`);
                }
              }}
            />
          ))}
        </View>
      </CategoriesShell>
      <CategoriesOverlays
        showRoundSuccess={session.showRoundSuccess}
        gameFinished={session.gameFinished}
        finalStats={session.finalStats}
        onBack={onBack}
        onComplete={onComplete}
      />
    </>
  );
}

const styles = StyleSheet.create({
  zones: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 10 },
  zone: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    minWidth: 100,
  },
  zoneEmoji: { fontSize: 28 },
  zoneLabel: { fontWeight: '900', color: '#92400E' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
});
