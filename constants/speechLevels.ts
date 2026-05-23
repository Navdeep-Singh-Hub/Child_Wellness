/** Speech therapy UI level numbers (inserted Action Imitation before jaw/voice). */
export const SPEECH_LEVEL = {
  attention: 1,
  actionImitation: 2,
  jaw: 3,
  voice: 4,
} as const;

export function isSpeechActionLevel(level: number, session: number) {
  return level === SPEECH_LEVEL.actionImitation && session === 1;
}

export function isSpeechBodyPartsLevel(level: number, session: number) {
  return level === SPEECH_LEVEL.actionImitation && session === 2;
}

export function isSpeechVocabularyLevel(level: number, session: number) {
  return level === SPEECH_LEVEL.actionImitation && session === 3;
}

export function isSpeechCategoriesLevel(level: number, session: number) {
  return level === SPEECH_LEVEL.actionImitation && session === 4;
}

export function isSpeechPositionsLevel(level: number, session: number) {
  return level === SPEECH_LEVEL.actionImitation && session === 5;
}

export function isSpeechActionsLevel(level: number, session: number) {
  return level === SPEECH_LEVEL.actionImitation && session === 6;
}

export function isSpeechCommunityLevel(level: number, session: number) {
  return level === SPEECH_LEVEL.actionImitation && session === 7;
}

export function isSpeechDescriptionsLevel(level: number, session: number) {
  return level === SPEECH_LEVEL.actionImitation && session === 8;
}

export function isSpeechSequencesLevel(level: number, session: number) {
  return level === SPEECH_LEVEL.actionImitation && session === 9;
}

export function isSpeechComprehensionLevel(level: number, session: number) {
  return level === SPEECH_LEVEL.actionImitation && session === 10;
}

export function isSpeechJawLevel(level: number) {
  return level === SPEECH_LEVEL.jaw;
}

export function isSpeechVoiceLevel(level: number) {
  return level === SPEECH_LEVEL.voice;
}
