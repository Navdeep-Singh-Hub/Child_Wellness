/** Integrated Visual Challenge backdrops — OT L5 Session 10 */
import { CanyonRallyBackdrop } from '@/components/game/occupational/level5/session10/canyonRally/CanyonRallyVisuals';
import { CometChaseBackdrop } from '@/components/game/occupational/level5/session10/cometChase/CometChaseVisuals';
import { EagleEyeQuestBackdrop } from '@/components/game/occupational/level5/session10/eagleEyeQuest/EagleEyeQuestVisuals';
import { FocusFortressBackdrop } from '@/components/game/occupational/level5/session10/focusFortress/FocusFortressVisuals';
import type { GauntletBackdropId } from '@/components/game/occupational/level5/session10/gauntletTheme';
import { StormRelayBackdrop } from '@/components/game/occupational/level5/session10/stormRelay/StormRelayVisuals';
import type { Session2ThemeTokens } from '@/components/game/occupational/level5/session2/session2Theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export { GauntletFlash, GauntletOrb, GauntletSignal } from '@/components/game/occupational/level5/session10/shared/GauntletFX';

export function GauntletBackdrop({
  theme,
  backdrop,
}: {
  theme: Session2ThemeTokens;
  backdrop: GauntletBackdropId;
}) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...theme.sky]} style={StyleSheet.absoluteFillObject} />
      {backdrop === 'comet' && <CometChaseBackdrop accent={theme.accent} />}
      {backdrop === 'fortress' && <FocusFortressBackdrop accent={theme.accent} />}
      {backdrop === 'canyon' && <CanyonRallyBackdrop accent={theme.accent} />}
      {backdrop === 'storm' && <StormRelayBackdrop accent={theme.accent} />}
      {backdrop === 'crown' && <EagleEyeQuestBackdrop accent={theme.accent} />}
    </View>
  );
}
