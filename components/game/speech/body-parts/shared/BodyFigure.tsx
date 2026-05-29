import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { BODY_KID_FIGURE, type BodyFigureLayout } from './bodyFigureLayout';

type Props = {
  layout: BodyFigureLayout;
  style?: ViewStyle;
  children?: React.ReactNode;
};

/**
 * Full-body kid image with clothing / body-part slots as children.
 * Slots use position:absolute inside this box.
 */
export function BodyFigure({ layout, style, children }: Props) {
  return (
    <View
      style={[
        styles.figure,
        {
          width: layout.figureW,
          height: layout.figureH,
          minWidth: layout.figureW,
          minHeight: layout.figureH,
        },
        style,
      ]}
    >
      <Image
        source={BODY_KID_FIGURE}
        style={styles.figureImage}
        contentFit="contain"
        accessibilityLabel="Child figure"
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  figure: {
    position: 'relative',
    alignSelf: 'center',
    overflow: 'visible',
  },
  figureImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
});
