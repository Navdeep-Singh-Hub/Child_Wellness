import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import { SENSORY_EXPLORER_THEME } from '@/components/game/occupational/level10/session1/sensoryExplorerTheme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  cursor: Point | null;
  leftWrist: Point | null;
  rightWrist: Point | null;
  accent: string;
};

export const ExplorerCursor: React.FC<Props> = ({ cursor, leftWrist, rightWrist, accent }) => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    {leftWrist && (
      <View style={[styles.wrist, { left: `${leftWrist.x * 100}%`, top: `${leftWrist.y * 100}%`, borderColor: '#A78BFA' }]}>
        <Text style={styles.wristLabel}>L</Text>
      </View>
    )}
    {rightWrist && (
      <View style={[styles.wrist, { left: `${rightWrist.x * 100}%`, top: `${rightWrist.y * 100}%`, borderColor: '#FB923C' }]}>
        <Text style={styles.wristLabel}>R</Text>
      </View>
    )}
    {cursor && (
      <View style={[styles.cursorWrap, { left: `${cursor.x * 100}%`, top: `${cursor.y * 100}%` }]}>
        <View style={[styles.cursorRing, { borderColor: accent }]} />
        <View style={[styles.cursorCore, { backgroundColor: accent }]}>
          <Text style={styles.cursorEmoji}>{SENSORY_EXPLORER_THEME.hero}</Text>
        </View>
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  cursorWrap: { position: 'absolute', width: 48, height: 48, marginLeft: -24, marginTop: -24 },
  cursorRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    borderWidth: 2,
    opacity: 0.75,
    transform: [{ scale: 1.35 }],
  },
  cursorCore: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignSelf: 'center',
    marginTop: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#22D3EE',
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 6,
  },
  cursorEmoji: { fontSize: 18 },
  wrist: {
    position: 'absolute',
    width: 28,
    height: 28,
    marginLeft: -14,
    marginTop: -14,
    borderRadius: 14,
    borderWidth: 2,
    backgroundColor: 'rgba(5,11,26,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wristLabel: { color: '#fff', fontSize: 10, fontWeight: '900' },
});
