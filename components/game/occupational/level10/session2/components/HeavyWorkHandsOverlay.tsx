import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import { HEAVY_WORK_THEME } from '@/components/game/occupational/level10/session2/heavyWorkTheme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  leftWrist: Point | null;
  rightWrist: Point | null;
};

export const HeavyWorkHandsOverlay: React.FC<Props> = ({ leftWrist, rightWrist }) => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    {leftWrist && (
      <View
        style={[
          styles.hand,
          styles.leftHand,
          { left: `${leftWrist.x * 100}%`, top: `${leftWrist.y * 100}%` },
        ]}
      >
        <Text style={styles.handEmoji}>🤚</Text>
      </View>
    )}
    {rightWrist && (
      <View
        style={[
          styles.hand,
          styles.rightHand,
          { left: `${rightWrist.x * 100}%`, top: `${rightWrist.y * 100}%` },
        ]}
      >
        <Text style={styles.handEmoji}>✋</Text>
      </View>
    )}
    <View style={styles.hintPill}>
      <Text style={styles.hintText}>Both hands 💪</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  hand: {
    position: 'absolute',
    width: 44,
    height: 44,
    marginLeft: -22,
    marginTop: -22,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(28,25,23,0.7)',
  },
  leftHand: { borderColor: HEAVY_WORK_THEME.accent },
  rightHand: { borderColor: HEAVY_WORK_THEME.accentAmber },
  handEmoji: { fontSize: 20 },
  hintPill: {
    position: 'absolute',
    bottom: 52,
    alignSelf: 'center',
    left: '25%',
    right: '25%',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(28,25,23,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.35)',
  },
  hintText: { color: HEAVY_WORK_THEME.accentAmber, fontSize: 12, fontWeight: '900' },
});
