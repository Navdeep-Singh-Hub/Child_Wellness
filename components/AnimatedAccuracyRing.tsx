// components/AnimatedAccuracyRing.tsx
import React, { useEffect, useMemo } from "react";
import { View, Text, Platform } from "react-native";
import Animated, { useSharedValue, withTiming, useAnimatedProps } from "react-native-reanimated";

let Svg: any, Circle: any; // dynamic to avoid bundler crash if svg is missing
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const svg = require("react-native-svg");
  Svg = svg.Svg;
  Circle = svg.Circle;
} catch (_) {
  Svg = null;
  Circle = null;
}

type Props = {
  value: number;         // 0..100
  size?: number;         // px
  stroke?: number;       // px
  trackColor?: string;
  progressColor?: string;
  label?: string;        // e.g., "Accuracy"
  showPercentText?: boolean;
  durationMs?: number;   // anim duration
};

export default function AnimatedAccuracyRing({
  value,
  size = 96,
  stroke = 10,
  trackColor = "#e7e7ef",
  progressColor = "#7c3aed",
  label = "Accuracy",
  showPercentText = true,
  durationMs = 600,
}: Props) {
  const radius = useMemo(() => (size - stroke) / 2, [size, stroke]);
  const circumference = useMemo(() => 2 * Math.PI * radius, [radius]);

  // clamp value just in case
  const v = Math.max(0, Math.min(100, Math.round(value)));

  const progress = useSharedValue(0); // 0..1
  useEffect(() => {
    progress.value = withTiming(v / 100, { duration: durationMs });
  }, [v, durationMs, progress]);

  // Fallback (when react-native-svg is unavailable): simple bar + number
  if (!Svg || !Circle) {
    return (
      <View
        style={{
          width: size,
          padding: 8,
          borderRadius: 16,
          backgroundColor: "#f7f7fb",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {label ? (
          <Text style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>{label}</Text>
        ) : null}
        <View
          style={{
            width: "100%",
            height: 10,
            borderRadius: 8,
            backgroundColor: trackColor,
            overflow: "hidden",
          }}
        >
          <Animated.View
            style={{
              width: `${v}%`,
              height: "100%",
              backgroundColor: progressColor,
            }}
          />
        </View>
        {showPercentText ? (
          <Text style={{ marginTop: 6, fontWeight: "700", fontSize: 16 }}>{v}%</Text>
        ) : null}
      </View>
    );
  }

  // Nice crisp circle in SVG
  const AnimatedCircle = useMemo(() => {
    return Circle ? Animated.createAnimatedComponent(Circle) : null;
  }, []);
  
  const animatedProps = useAnimatedProps(() => {
    const offset = circumference * (1 - progress.value);
    return { strokeDashoffset: offset };
  }, [circumference, progress]);

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: "absolute" }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={stroke}
          fill="none"
        />
        {AnimatedCircle ? (
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={progressColor}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animatedProps={animatedProps}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        ) : null}
      </Svg>
      <View style={{ 
        position: "absolute", 
        alignItems: "center", 
        justifyContent: "center",
        width: size,
        height: size,
      }}>
        {showPercentText ? (
          <Text style={{ 
            fontWeight: "900", 
            fontSize: size * 0.2, 
            color: "#0F172A",
            letterSpacing: -1,
          }}>{v}%</Text>
        ) : null}
        {label ? (
          <Text style={{ 
            fontSize: size * 0.12, 
            color: "#64748B",
            fontWeight: "600",
            marginTop: showPercentText ? 4 : 0,
          }}>{label}</Text>
        ) : null}
      </View>
    </View>
  );
}

