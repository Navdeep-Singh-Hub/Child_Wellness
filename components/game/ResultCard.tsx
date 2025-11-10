// components/game/ResultCard.tsx
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, withTiming, useAnimatedProps } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { SparkleBurst } from './FX';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function ResultCard({ correct, total, onPlayAgain, onHome, xpAwarded, accuracy }: {
  correct: number; total: number;
  onPlayAgain?: () => void; onHome?: () => void;
  xpAwarded?: number;
  accuracy?: number;
}) {
  const pct = total ? correct / total : 0;
  const prog = useSharedValue(0);
  const displayedAccuracy = accuracy !== undefined ? accuracy : Math.round(pct * 100);

  useEffect(() => { prog.value = 0; prog.value = withTiming(pct, { duration: 700 }); }, [pct]);

  const R = 56, C = 2 * Math.PI * R;
  const props: any = useAnimatedProps(() => ({ strokeDashoffset: C * (1 - prog.value) } as any));

  return (
    <View style={{ padding: 16 }}>
      <View style={{ alignItems: 'center', marginVertical: 12 }}>
        <View style={{ width: 160, height: 160, alignItems: 'center', justifyContent: 'center' }}>
          <Svg width={160} height={160}>
            <Circle cx={80} cy={80} r={R} stroke="#E5E7EB" strokeWidth={10} fill="none" />
            <AnimatedCircle
              cx={80} cy={80} r={R}
              stroke="#22C55E" strokeWidth={10} fill="none"
              strokeDasharray={`${C} ${C}`} animatedProps={props}
              strokeLinecap="round"
            />
          </Svg>
          <View style={{ position: 'absolute', alignItems: 'center' }}>
            <Text style={{ fontSize: 30, fontWeight: '900', color: '#111827' }}>{correct}/{total}</Text>
            <Text style={{ marginTop: 2, color: '#6B7280', fontWeight: '700' }}>{displayedAccuracy}%</Text>
          </View>
        </View>
        <SparkleBurst visible={pct >= 0.6} color={pct >= 0.8 ? '#F59E0B' : '#22C55E'} />
      </View>

      {/* Additional stats */}
      {(xpAwarded !== undefined || accuracy !== undefined) && (
        <View style={{ backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12, marginBottom: 12, width: '100%' }}>
          {xpAwarded !== undefined && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ color: '#6B7280', fontWeight: '600' }}>XP Earned:</Text>
              <Text style={{ color: '#111827', fontWeight: '800' }}>+{xpAwarded}</Text>
            </View>
          )}
          {accuracy !== undefined && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#6B7280', fontWeight: '600' }}>Accuracy:</Text>
              <Text style={{ color: '#111827', fontWeight: '800' }}>{displayedAccuracy}%</Text>
            </View>
          )}
        </View>
      )}

      <View style={{ alignItems: 'center', gap: 10, marginTop: 6 }}>
        {onPlayAgain && (
          <TouchableOpacity onPress={onPlayAgain} activeOpacity={0.9}
            style={{ backgroundColor:'#2563EB', paddingHorizontal:16, paddingVertical:12, borderRadius:12 }}>
            <Text style={{ color:'#fff', fontWeight:'800' }}>Play again</Text>
          </TouchableOpacity>
        )}
        {onHome && (
          <TouchableOpacity onPress={onHome} activeOpacity={0.9}
            style={{ backgroundColor:'#E5E7EB', paddingHorizontal:16, paddingVertical:12, borderRadius:12 }}>
            <Text style={{ color:'#111827', fontWeight:'800' }}>Back to games</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

