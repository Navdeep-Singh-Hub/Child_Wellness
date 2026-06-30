import type { SensoryTileDef } from '@/components/game/occupational/level10/session1/spotTheChangeTheme';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  tiles: SensoryTileDef[];
  changedTileId: SensoryTileDef['id'] | null;
  phase: 'observe' | 'changed' | 'spot';
  holdProgress: number;
  activeTileId: SensoryTileDef['id'] | null;
};

export const SensoryTileGrid: React.FC<Props> = ({
  tiles,
  changedTileId,
  phase,
  holdProgress,
  activeTileId,
}) => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {tiles.map((tile) => {
        const isChanged = tile.id === changedTileId;
        const showChange = isChanged && (phase === 'changed' || phase === 'spot');
        const isTarget = phase === 'spot' && isChanged;
        const cursorOn = activeTileId === tile.id;

        return (
          <TileNode
            key={tile.id}
            tile={tile}
            emoji={showChange ? tile.changeEmoji : tile.baseEmoji}
            color={showChange ? tile.changeColor : tile.baseColor}
            pulse={showChange && phase === 'changed'}
            highlight={isTarget}
            holdProgress={isTarget ? holdProgress : 0}
            cursorOn={cursorOn}
          />
        );
      })}
    </View>
  );
};

const TileNode: React.FC<{
  tile: SensoryTileDef;
  emoji: string;
  color: string;
  pulse: boolean;
  highlight: boolean;
  holdProgress: number;
  cursorOn: boolean;
}> = ({ tile, emoji, color, pulse, highlight, holdProgress, cursorOn }) => {
  const scale = useSharedValue(1);
  const ring = useSharedValue(0);

  useEffect(() => {
    if (pulse) {
      scale.value = withRepeat(
        withSequence(withSpring(1.15), withTiming(1, { duration: 400 })),
        4,
        false,
      );
    } else {
      scale.value = withSpring(1);
    }
  }, [pulse, scale]);

  useEffect(() => {
    ring.value = withTiming(holdProgress, { duration: 120, easing: Easing.out(Easing.quad) });
  }, [holdProgress, ring]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderColor: color,
  }));

  const left = `${tile.x * 100}%`;
  const top = `${tile.y * 100}%`;

  return (
    <View style={[styles.wrap, { left, top }]}>
      {highlight && (
        <View
          style={[
            styles.holdRing,
            {
              borderColor: color,
              opacity: 0.35 + holdProgress * 0.65,
              transform: [{ scale: 1 + holdProgress * 0.25 }],
            },
          ]}
        />
      )}
      <Animated.View
        style={[
          styles.tile,
          animStyle,
          highlight && styles.tileTarget,
          cursorOn && styles.tileCursorOn,
        ]}
      >
        <Text style={styles.emoji}>{emoji}</Text>
      </Animated.View>
      <Text style={[styles.label, { color }]}>{tile.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { position: 'absolute', alignItems: 'center', marginLeft: -36, marginTop: -36, width: 72 },
  holdRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 20,
    borderWidth: 3,
    top: -4,
    left: -4,
  },
  tile: {
    width: 72,
    height: 72,
    borderRadius: 18,
    borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  tileTarget: { backgroundColor: 'rgba(255,255,255,0.18)' },
  tileCursorOn: { borderWidth: 3, backgroundColor: 'rgba(255,255,255,0.28)' },
  emoji: { fontSize: 34 },
  label: { marginTop: 6, fontSize: 10, fontWeight: '900', letterSpacing: 0.3 },
});
