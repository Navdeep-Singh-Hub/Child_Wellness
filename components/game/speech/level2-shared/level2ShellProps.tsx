import React from 'react';

import { SpeechLevel2Shell, type SpeechLevel2ShellProps } from './SpeechLevel2Shell';

/** Extra optional props for Level 2 game shells */
export type Level2ShellExtras = {
  startEmoji?: string;
  startTitle?: string;
  startHint?: string;
  instructionSteps?: string[];
  onSpeakStart?: () => void;
};

export type Level2BaseShellProps = Omit<
  SpeechLevel2ShellProps,
  'onClearSpeech' | 'startEmoji' | 'startTitle' | 'startHint' | 'instructionSteps' | 'onSpeakStart' | 'playHeaderExtra'
> &
  Level2ShellExtras;

type ShellDefaults = {
  startEmoji: string;
  startTitle: string;
  startHint: string;
};

export function renderLevel2Shell(
  onClearSpeech: () => void,
  defaults: ShellDefaults,
  props: Level2BaseShellProps,
  playHeaderExtra?: React.ReactNode,
) {
  const {
    startEmoji = defaults.startEmoji,
    startTitle = defaults.startTitle,
    startHint = defaults.startHint,
    instructionSteps,
    onSpeakStart,
    ...rest
  } = props;

  return (
    <SpeechLevel2Shell
      {...rest}
      onClearSpeech={onClearSpeech}
      startEmoji={startEmoji}
      startTitle={startTitle}
      startHint={startHint}
      instructionSteps={instructionSteps}
      onSpeakStart={onSpeakStart}
      playHeaderExtra={playHeaderExtra}
    />
  );
}
