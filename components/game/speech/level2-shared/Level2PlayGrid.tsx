import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useLevel2Layout } from '@/components/game/speech/level2-shared/level2Layout';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Use 3–4 smaller tiles per row (sequence cards, etc.) */
  compact?: boolean;
};

/** Full-width choice grid tuned for tablet play areas. */
export function Level2PlayGrid({ children, style, compact }: Props) {
  const { sizes } = useLevel2Layout();

  return (
    <View
      style={[
        styles.grid,
        {
          gap: sizes.choiceGap,
          paddingHorizontal: sizes.isTablet ? 8 : 0,
        },
        compact && styles.gridCompact,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignContent: 'center',
    width: '100%',
  },
  gridCompact: {
    alignContent: 'flex-start',
  },
});
