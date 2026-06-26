import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import type { TouchHand } from '@/components/game/occupational/level10/session1/mysteryTouchTheme';
import { MYSTERY_TOUCH_THEME } from '@/components/game/occupational/level10/session1/mysteryTouchTheme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  leftWrist: Point | null;
  rightWrist: Point | null;
  requiredHand: TouchHand;
};

export const HandReachOverlay: React.FC<Props> = ({ leftWrist, rightWrist, requiredHand }) => {
  const showLeft = requiredHand === 'left' || requiredHand === 'both';
  const showRight = requiredHand === 'right' || requiredHand === 'both';

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {showLeft && leftWrist && (
        <View
          style={[
            styles.hand,
            styles.leftHand,
            { left: `${leftWrist.x * 100}%`, top: `${leftWrist.y * 100}%` },
          ]}
        >
          <Text style={styles.handEmoji}>🤚</Text>
          <Text style={styles.handTag}>L</Text>
        </View>
      )}
      {showRight && rightWrist && (
        <View
          style={[
            styles.hand,
            styles.rightHand,
            { left: `${rightWrist.x * 100}%`, top: `${rightWrist.y * 100}%` },
          ]}
        >
          <Text style={styles.handEmoji}>✋</Text>
          <Text style={styles.handTag}>R</Text>
        </View>
      )}
      {requiredHand !== 'both' && (
        <View style={styles.hintPill}>
          <Text style={styles.hintText}>
            {requiredHand === 'left' ? '← Left hand' : 'Right hand →'}
          </Text>
        </View>
      )}
      {requiredHand === 'both' && (
        <View style={styles.hintPill}>
          <Text style={styles.hintText}>Both hands 🤲</Text>
        </View>
      )}
    </View>
  );
};

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
    backgroundColor: 'rgba(24,10,32,0.65)',
  },
  leftHand: { borderColor: MYSTERY_TOUCH_THEME.accent },
  rightHand: { borderColor: MYSTERY_TOUCH_THEME.accentWarm },
  handEmoji: { fontSize: 20 },
  handTag: { position: 'absolute', bottom: -2, right: 2, color: '#fff', fontSize: 8, fontWeight: '900' },
  hintPill: {
    position: 'absolute',
    bottom: 56,
    alignSelf: 'center',
    left: '20%',
    right: '20%',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(24,10,32,0.75)',
    borderWidth: 1,
    borderColor: 'rgba(216,180,254,0.35)',
  },
  hintText: { color: MYSTERY_TOUCH_THEME.accentWarm, fontSize: 12, fontWeight: '900' },
});
