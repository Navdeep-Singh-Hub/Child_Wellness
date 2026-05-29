/** Speech therapy UI level numbers (inserted Action Imitation before jaw/voice). */
export const SPEECH_LEVEL = {
  attention: 1,
  actionImitation: 2,
  jaw: 3,
  voice: 4,
  lipClosure: 5,
  speechMotor: 6,
  oralMotorCoordination: 7,
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

/** Level 5 Session 1 — Air Awareness & Airflow Cause-Effect (mic only, no camera) */
export function isSpeechBreathAwarenessLevel(level: number, session: number) {
  return level === SPEECH_LEVEL.lipClosure && session === 1;
}

/** @deprecated Session 1 is now breath awareness; legacy lip-closure games removed from menu */
export function isSpeechLipClosureLevel(_level: number, _session: number) {
  return false;
}

/** Level 5 Session 2 — Mouth Movement Imitation (camera + Good try fallback) */
export function isSpeechMouthImitationLevel(level: number, session: number) {
  return level === SPEECH_LEVEL.lipClosure && session === 2;
}

/** @deprecated Session 2 is now mouth imitation; legacy lip-hold games removed from menu */
export function isSpeechLipHoldLevel(_level: number, _session: number) {
  return false;
}

/** Level 5 Session 3 — Breath Activation & Start–Stop Air (mic only) */
export function isSpeechBreathActivationLevel(level: number, session: number) {
  return level === SPEECH_LEVEL.lipClosure && session === 3;
}

/** @deprecated Session 3 is now breath activation; legacy lip-round games removed from menu */
export function isSpeechLipRoundLevel(_level: number, _session: number) {
  return false;
}

/** Level 5 Session 4 — Lip Awareness & Lip Sensory Mapping (camera + Good try) */
export function isSpeechLipAwarenessLevel(level: number, session: number) {
  return level === SPEECH_LEVEL.lipClosure && session === 4;
}

/** @deprecated Session 4 is now lip awareness; legacy lip-spread games removed from menu */
export function isSpeechLipSpreadLevel(_level: number, _session: number) {
  return false;
}

/** Level 5 Session 5 — Jaw Awareness & Open–Close Basics (camera + Good try) */
export function isSpeechJawAwarenessLevel(level: number, session: number) {
  return level === SPEECH_LEVEL.lipClosure && session === 5;
}

/** @deprecated Session 5 is now jaw awareness; legacy lip-alternation games removed from menu */
export function isSpeechLipAlternationLevel(_level: number, _session: number) {
  return false;
}

/** Level 5 Session 6 — Facial Imitation & Mirror Play (camera + Good try) */
export function isSpeechFacialImitationLevel(level: number, session: number) {
  return level === SPEECH_LEVEL.lipClosure && session === 6;
}

/** @deprecated Session 6 is now facial imitation; legacy lip-resistance games removed from menu */
export function isSpeechLipResistanceLevel(_level: number, _session: number) {
  return false;
}

/** Level 5 Session 7 — Oral Sensory Tolerance (tap / watch, no camera, no mic) */
export function isSpeechOralSensoryToleranceLevel(level: number, session: number) {
  return level === SPEECH_LEVEL.lipClosure && session === 7;
}

/** @deprecated Session 7 is now oral sensory tolerance; legacy bilabial prep removed from menu */
export function isSpeechLipBilabialLevel(level: number, session: number) {
  return false;
}

/** Level 5 Session 8 — Mouth Attention Shifting (face gate + tap, no mic) */
export function isSpeechMouthAttentionShiftingLevel(level: number, session: number) {
  return level === SPEECH_LEVEL.lipClosure && session === 8;
}

/** @deprecated Session 8 is now mouth attention shifting; legacy lip-airflow removed from menu */
export function isSpeechLipAirflowLevel(level: number, session: number) {
  return false;
}

/** Level 5 Session 9 — Tongue Awareness & Internal Mapping (tap / watch, no camera, no mic) */
export function isSpeechTongueAwarenessLevel(level: number, session: number) {
  return level === SPEECH_LEVEL.lipClosure && session === 9;
}

/** @deprecated Session 9 is now tongue awareness; legacy lip-coordination removed from menu */
export function isSpeechLipCoordinationLevel(level: number, session: number) {
  return false;
}

/** Level 5 Session 10 — Basic Oral Imitation Integration (camera poses + Good try) */
export function isSpeechOralImitationIntegrationLevel(level: number, session: number) {
  return level === SPEECH_LEVEL.lipClosure && session === 10;
}

/** @deprecated Session 10 is now oral imitation integration; legacy functional lip sequencing removed from menu */
export function isSpeechLipFunctionalSequenceLevel(level: number, session: number) {
  return false;
}

/** Level 6 Session 1 — Oral Imitation / Speech Motor Readiness (tap / watch-copy, no STT) */
export function isSpeechOralImitationLevel(level: number, session: number) {
  return level === SPEECH_LEVEL.speechMotor && session === 1;
}

/** Level 6 Session 2 — Sound Initiation (mic amplitude only, no STT) */
export function isSpeechSoundInitiationLevel(level: number, session: number) {
  return level === SPEECH_LEVEL.speechMotor && session === 2;
}

/** Level 6 Session 3 — Vowel Shaping (watch-copy, no STT, no correctness) */
export function isSpeechVowelShapingLevel(level: number, session: number) {
  return level === SPEECH_LEVEL.speechMotor && session === 3;
}

/** Level 6 Session 4 — CV Preparation (speech pattern readiness, no STT) */
export function isSpeechCVPreparationLevel(level: number, session: number) {
  return level === SPEECH_LEVEL.speechMotor && session === 4;
}

/** Level 6 Session 5 — Bilabial Sequencing (repeated bilabial movement, no STT) */
export function isSpeechBilabialSequencingLevel(level: number, session: number) {
  return level === SPEECH_LEVEL.speechMotor && session === 5;
}

/** Level 6 Session 6 — Motor Speech Timing (rhythm & pacing, no STT) */
export function isSpeechMotorTimingLevel(level: number, session: number) {
  return level === SPEECH_LEVEL.speechMotor && session === 6;
}

/** Level 6 Session 7 — Sound Stability (sustained vocal effort, mic amplitude, no STT) */
export function isSpeechSoundStabilityLevel(level: number, session: number) {
  return level === SPEECH_LEVEL.speechMotor && session === 7;
}

/** Level 6 Session 8 — Early Syllable Control (simple syllable attempts, no STT) */
export function isSpeechEarlySyllableControlLevel(level: number, session: number) {
  return level === SPEECH_LEVEL.speechMotor && session === 8;
}

/** Level 6 Session 9 — Functional Vocal Intent (mic amplitude, turn-taking, no STT) */
export function isSpeechFunctionalVocalIntentLevel(level: number, session: number) {
  return level === SPEECH_LEVEL.speechMotor && session === 9;
}

/** Level 6 Session 10 — Speech Readiness Completion (capstone integration, no STT) */
export function isSpeechReadinessCompletionLevel(level: number, session: number) {
  return level === SPEECH_LEVEL.speechMotor && session === 10;
}

/** Level 7 Session 1 — Lip + Jaw Coordination (watch-copy tap, no STT) */
export function isSpeechLipJawCoordinationLevel(level: number, session: number) {
  return level === SPEECH_LEVEL.oralMotorCoordination && session === 1;
}

/** Level 7 Session 2 — Tongue + Jaw Coordination (watch-copy tap, no STT) */
export function isSpeechTongueJawCoordinationLevel(level: number, session: number) {
  return level === SPEECH_LEVEL.oralMotorCoordination && session === 2;
}
