// components/game/ResultCard.tsx
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import Animated, { useSharedValue, withTiming, useAnimatedProps } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import Lottie from 'lottie-react';
import { SparkleBurst } from './FX';
import ReflectionPrompt from './ReflectionPrompt';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
let NativeLottie: any = null;
if (Platform.OS !== 'web') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  NativeLottie = require('lottie-react-native').default;
}
const celebratoryCat = require('../../assets/animation/black rainbow cat.json');
const chillCat = require('../../assets/animation/cat Mark loading.json');

export default function ResultCard({
  correct,
  total,
  onPlayAgain,
  onHome,
  xpAwarded,
  accuracy,
  logTimestamp,
}: {
  correct: number;
  total: number;
  onPlayAgain?: () => void;
  onHome?: () => void;
  xpAwarded?: number;
  accuracy?: number;
  logTimestamp?: string | null;
}) {
  const pct = total ? correct / total : 0;
  const prog = useSharedValue(0);
  const displayedAccuracy = accuracy !== undefined ? accuracy : Math.round(pct * 100);

  useEffect(() => { prog.value = 0; prog.value = withTiming(pct, { duration: 700 }); }, [pct]);

  const R = 56, C = 2 * Math.PI * R;
  const props: any = useAnimatedProps(() => ({ strokeDashoffset: C * (1 - prog.value) } as any));

  const showCelebration = displayedAccuracy >= 80;
  const catMessage = showCelebration ? 'Sparkle Cat is proud of you!' : 'Cat is cheering you on!';

  return (
    <View style={{ padding: 16 }}>
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        {Platform.OS === 'web' ? (
          <Lottie
            animationData={showCelebration ? celebratoryCat : chillCat}
            loop={!showCelebration}
            autoplay
            style={{ width: 200, height: 200 }}
          />
        ) : NativeLottie ? (
          <NativeLottie
            source={showCelebration ? celebratoryCat : chillCat}
            autoPlay
            loop={!showCelebration}
            style={{ width: 180, height: 180 }}
          />
        ) : (
          <Text style={{ fontSize: 64 }}>{showCelebration ? '😺🎉' : '😺✨'}</Text>
        )}
        <Text style={{ marginTop: 8, fontWeight: '700', color: '#6B21A8' }}>{catMessage}</Text>
      </View>
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

      <ReflectionPrompt logTimestamp={logTimestamp} />
    </View>
  );
}

