// components/PillTabBar.tsx
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as React from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = BottomTabBarProps & {
  logo?: any;                 // require(...) or { uri }
  logoSize?: number;          // px
  railColor?: string;         // black rail behind pills
  pillFill?: string;          // default pill fill (white)
  pillBorder?: string;        // pill border color (black)
  activeFill?: string;        // active/hover fill (black)
  labelColor?: string;        // default label color (black)
  hoverLabelColor?: string;   // hover/active label color (white)
};

const isWeb = Platform.OS === "web";

/**
 * Pixel-perfect “React Bits Pill Nav” for Expo Router tabs.
 * - Small rounded black rail
 * - Pills: white with black border, uppercase label
 * - Hover/press: expanding black circle wash + white label
 * - Active: filled black + white label
 * - Fixed at bottom; full width; pills auto-size & center
 */
export default function PillTabBar({
  state,
  descriptors,
  navigation,
  logo,
  logoSize = 22,
  railColor = "#000000",
  pillFill = "#FFFFFF",
  pillBorder = "#000000",
  activeFill = "#000000",
  labelColor = "#000000",
  hoverLabelColor = "#FFFFFF",
}: Props) {

  // const { state } = props;
  // ⬇️ Hide the entire tab bar on the AACgrid screen
  const activeName = state.routes[state.index]?.name;
  if (activeName === "AACgrid") return null;
  const insets = useSafeAreaInsets();

  // per-pill hover/press amount [0..1]
  const hov = React.useRef(state.routes.map(() => new Animated.Value(0))).current;

  const animateTo = (i: number, v: number, d = 160) =>
    Animated.timing(hov[i], { toValue: v, duration: d, useNativeDriver: true }).start();

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.root,
        { paddingBottom: Math.max(insets.bottom, 8) },
      ]}
    >
      {/* Rail: tiny, rounded, same height feel as pills */}
      <View
        style={[
          styles.rail,
          {
            backgroundColor: railColor,
            position: isWeb ? "fixed" : "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            paddingBottom: Math.max(insets.bottom, 8),
          },
        ]}
      >
        {/* Row wrapper keeps pills centered; rail padding ~3px like the demo */}
        <View style={styles.row}>
          {/* left “logo pill” like the demo */}
          {/* {logo ? (
            <View style={styles.logoPill}>
              <View style={styles.logoCircle}>
                <Image
                  source={logo}
                  style={{ width: logoSize, height: logoSize }}
                  resizeMode="contain"
                />
              </View>
            </View>
          ) : null} */}

          <View style={styles.pillsWrap}>
            {state.routes.map((route, i) => {
              const { options } = descriptors[route.key];
              const label =
                (options.tabBarLabel as string) ??
                (options.title as string) ??
                route.name;

              const isActive = state.index === i;

              const onPress = () => {
                const e = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!isActive && !e.defaultPrevented) navigation.navigate(route.name);
              };

              const onLongPress = () =>
                navigation.emit({ type: "tabLongPress", target: route.key });

              // circle wash grows a bit beyond pill to mimic DOM version
              const washScale = hov[i].interpolate({
                inputRange: [0, 1],
                outputRange: [0.01, 1.1],
              });

              const showHover = !isActive; // active is already filled

              return (
                <Pressable
                  key={route.key}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  onHoverIn={() => isWeb && animateTo(i, 1)}
                  onHoverOut={() => isWeb && animateTo(i, 0)}
                  onPressIn={() => !isWeb && animateTo(i, 1, 120)}
                  onPressOut={() => !isWeb && animateTo(i, 0, 120)}
                  style={({ pressed }) => [
                    styles.pill,
                    {
                      backgroundColor: isActive ? activeFill : pillFill,
                      borderColor: pillBorder,
                      opacity: pressed && !isWeb ? 0.92 : 1,
                    },
                  ]}
                >
                  {/* expanding black circle wash under the text */}
                  {showHover && (
                    <Animated.View
                      pointerEvents="none"
                      style={[
                        styles.wash,
                        { backgroundColor: activeFill, transform: [{ scale: washScale }] },
                      ]}
                    />
                  )}

                  <View style={styles.labelStack}>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.label,
                        { color: isActive ? hoverLabelColor : labelColor },
                      ]}
                    >
                      {label}
                    </Text>

                    {/* hover label (web only) */}
                    {isWeb && !isActive ? (
                      <Animated.Text
                        numberOfLines={1}
                        style={[
                          styles.hoverLabel,
                          {
                            color: hoverLabelColor,
                            opacity: hov[i],
                            transform: [
                              {
                                translateY: hov[i].interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [14, 0],
                                }),
                              },
                            ],
                          },
                        ]}
                      >
                        {label}
                      </Animated.Text>
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

const PILL_H = 38; // pill height very close to the demo
const RAIL_PAD = 3; // tiny rail padding around pills (like React Bits)
const RADIUS = 999;

const styles = StyleSheet.create({
  root: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  rail: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    // a subtle shadow that lifts the rail off the page (matches demo feel)
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: -6 },
    elevation: 18,
  },
  row: {
    alignSelf: "center",
    maxWidth: 980,
    width: "100%",
    paddingHorizontal: 12,
    paddingTop: 6,
  },
  logoPill: {
    height: PILL_H + RAIL_PAD * 2,
    padding: RAIL_PAD,
    alignSelf: "flex-start",
    marginRight: 6,
  },
  logoCircle: {
    width: PILL_H,
    height: PILL_H,
    borderRadius: RADIUS,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  pillsWrap: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    gap: 6,
    padding: RAIL_PAD,
    backgroundColor: "transparent", // rail is already black
  },
  pill: {
    height: PILL_H,
    paddingHorizontal: 16,
    borderRadius: RADIUS,
    borderWidth: 2,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  wash: {
    position: "absolute",
    width: PILL_H * 3,
    height: PILL_H * 3,
    borderRadius: PILL_H * 1.5,
    left: "50%",
    bottom: -PILL_H * 1.1,
    marginLeft: -(PILL_H * 1.5),
    opacity: 1,
  },
  labelStack: {
    minWidth: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  hoverLabel: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "800",
    textTransform: "uppercase",
  },
});
