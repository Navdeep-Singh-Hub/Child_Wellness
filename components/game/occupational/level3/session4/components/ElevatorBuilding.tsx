import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  floors: number;
  current: number;
  target: number;
  accent: string;
};

export function ElevatorBuilding({ floors, current, target, accent }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.building}>
        {Array.from({ length: floors }).map((_, i) => {
          const floor = floors - i;
          const isCurrent = floor === current;
          const isTarget = floor === target;
          return (
            <View
              key={floor}
              style={[
                styles.floor,
                isCurrent && { backgroundColor: 'rgba(14,165,233,0.35)', borderColor: accent },
                isTarget && { backgroundColor: 'rgba(251,191,36,0.35)', borderColor: '#F59E0B' },
              ]}
            >
              <Text style={styles.floorNum}>{floor}</Text>
            </View>
          );
        })}
      </View>
      <Text style={[styles.caption, { color: accent }]}>
        Floor {current} → Go to Floor {target}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 12, top: 12, bottom: 12, width: 72 },
  building: { flex: 1, justifyContent: 'space-between', gap: 3 },
  floor: {
    flex: 1,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.5)',
    backgroundColor: 'rgba(255,255,255,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floorNum: { fontSize: 11, fontWeight: '800', color: '#334155' },
  caption: { fontSize: 10, fontWeight: '800', marginTop: 6, textAlign: 'center' },
});
