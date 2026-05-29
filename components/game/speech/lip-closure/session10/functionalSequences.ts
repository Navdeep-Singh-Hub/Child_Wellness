import type { FunctionalSequenceStep } from '@/components/game/speech/lip-closure/modules/functionalSequenceTypes';

const P = (state: FunctionalSequenceStep['state'], hold: number): FunctionalSequenceStep => ({
  state,
  hold,
});

export function talkingPathSteps(round: number): FunctionalSequenceStep[] {
  if (round <= 1) return [P('ROUNDED', 500), P('SPREAD', 600)];
  if (round === 2) return [P('NEUTRAL', 400), P('ROUNDED', 550), P('SPREAD', 650)];
  return [P('CLOSED', 450), P('ROUNDED', 600), P('SPREAD', 700)];
}

export function soundBuilderSteps(round: number): FunctionalSequenceStep[] {
  if (round <= 1) return [P('CLOSED', 400), P('BURST', 300), P('ROUNDED', 600)];
  if (round === 2) return [P('CLOSED', 450), P('BURST', 350), P('ROUNDED', 550), P('AIRFLOW', 700)];
  return [P('CLOSED', 400), P('BURST', 300), P('ROUNDED', 500), P('AIRFLOW', 650), P('SPREAD', 600)];
}

export function mouthAdventureSteps(round: number): FunctionalSequenceStep[] {
  if (round <= 1) return [P('ROUNDED', 500), P('SPREAD', 550), P('ROUNDED', 500)];
  if (round === 2) return [P('CLOSED', 400), P('ROUNDED', 600), P('SPREAD', 650), P('NEUTRAL', 400)];
  return [P('CLOSED', 450), P('BURST', 300), P('ROUNDED', 550), P('SPREAD', 600), P('CLOSED', 450)];
}

export function smoothSwitchSteps(round: number): FunctionalSequenceStep[] {
  if (round <= 1) return [P('ROUNDED', 600), P('SPREAD', 650), P('ROUNDED', 600)];
  if (round === 2) return [P('SPREAD', 550), P('ROUNDED', 600), P('SPREAD', 550), P('ROUNDED', 600)];
  return [P('NEUTRAL', 400), P('ROUNDED', 550), P('SPREAD', 600), P('ROUNDED', 550), P('SPREAD', 600)];
}

export function speechPrepMasterSteps(round: number): FunctionalSequenceStep[] {
  if (round <= 1) {
    return [P('CLOSED', 450), P('BURST', 300), P('ROUNDED', 550), P('AIRFLOW', 650)];
  }
  if (round === 2) {
    return [
      P('CLOSED', 400),
      P('BURST', 300),
      P('ROUNDED', 500),
      P('AIRFLOW', 600),
      P('SPREAD', 550),
    ];
  }
  return [
    P('CLOSED', 400),
    P('BURST', 300),
    P('ROUNDED', 500),
    P('AIRFLOW', 550),
    P('SPREAD', 600),
    P('ROUNDED', 500),
  ];
}
