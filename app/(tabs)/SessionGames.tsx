import { BigTapTarget } from '@/components/game/BigTapTarget';
import { FollowTheBall } from '@/components/game/FollowTheBall';
import { FollowWhereILookGame } from '@/components/game/FollowWhereILookGame';
import BalloonPopGame from '@/components/game/MovingTargetTapGame'; // Game 3: Balloon Pop
import MultipleSmallTargetsGame from '@/components/game/MultipleSmallTargetsGame';
import MultiTapFunGame from '@/components/game/MultiTapFunGame'; // Game 5: Multi-Tap Fun
import { CatchTheBouncingStar } from '@/components/game/CatchTheBouncingStar';
import ShrinkingTargetGame from '@/components/game/ShrinkingTargetGame';
import SlowThenFastGame from '@/components/game/SlowThenFastGame';
import { SlowToFastGame } from '@/components/game/SlowToFastGame';
import SmallCircleTapGame from '@/components/game/SmallCircleTapGame';
import TapAndHoldGame from '@/components/game/TapAndHoldGame'; // Game 4: Tap and Hold
import TapFastGame from '@/components/game/TapFastGame';
import { TapForChoiceGame } from '@/components/game/TapForChoiceGame';
import { TapForMagicGame } from '@/components/game/TapForMagicGame';
import TapOnlySmallTargetGame from '@/components/game/TapOnlySmallTargetGame'; // Level 2 Game 1: Small Circle Tap
import TapRedCircleGame from '@/components/game/TapRedCircleGame';
import TapSlowlyGame from '@/components/game/TapSlowlyGame';
import { TapToAnimateGame } from '@/components/game/TapToAnimateGame';
import { TapToMakeSoundGame } from '@/components/game/TapToMakeSoundGame';
import { TapToRevealGame } from '@/components/game/TapToRevealGame';
import { TrackAndFreezeGame } from '@/components/game/TrackAndFreezeGame';
import TrackThenTapSmallObjectGame from '@/components/game/TrackThenTapSmallObjectGame';
import { SoundToTapGame } from '@/components/game/SoundToTapGame';
import { WhichSoundGame } from '@/components/game/WhichSoundGame';
import { FindSoundSourceGame } from '@/components/game/FindSoundSourceGame';
import { StopWhenSoundStopsGame } from '@/components/game/StopWhenSoundStopsGame';
import { LoudVsSoftGame } from '@/components/game/LoudVsSoftGame';
import { FollowMyEyesGame } from '@/components/game/FollowMyEyesGame';
import { EyesThenObjectGame } from '@/components/game/EyesThenObjectGame';
import { WhichSideGame } from '@/components/game/WhichSideGame';
import { FollowGazeToAnimationGame } from '@/components/game/FollowGazeToAnimationGame';
import { EyesOnlyGame } from '@/components/game/EyesOnlyGame';
import { FollowMyPointGame } from '@/components/game/FollowMyPointGame';
import { PointToObjectAppearsGame } from '@/components/game/PointToObjectAppearsGame';
import { TapThePointedObjectGame } from '@/components/game/TapThePointedObjectGame';
import { MovingArmPointingGame } from '@/components/game/MovingArmPointingGame';
import { MultiPointFollowGame } from '@/components/game/MultiPointFollowGame';
import { TapWhatYouLikeGame } from '@/components/game/TapWhatYouLikeGame';
import { WhichOneMovedGame } from '@/components/game/WhichOneMovedGame';
import { SoundToChoiceGame } from '@/components/game/SoundToChoiceGame';
import { ShowMeTheToyGame } from '@/components/game/ShowMeTheToyGame';
import { FoodVsToyGame } from '@/components/game/FoodVsToyGame';
import { PassTheBallGame } from '@/components/game/PassTheBallGame';
import { TapOnlyOnYourTurnGame } from '@/components/game/TapOnlyOnYourTurnGame';
import { YourTurnToCompleteGame } from '@/components/game/YourTurnToCompleteGame';
import { WaitForTheSignalGame } from '@/components/game/WaitForTheSignalGame';
import { TurnTimerGame } from '@/components/game/TurnTimerGame';
import { WatchAndWaitGame } from '@/components/game/WatchAndWaitGame';
import { GrowingFlowerGame } from '@/components/game/GrowingFlowerGame';
import { TimerBarTapGame } from '@/components/game/TimerBarTapGame';
import { FollowSlowMovementGame } from '@/components/game/FollowSlowMovementGame';
import { ShapesAppearOneByOneGame } from '@/components/game/ShapesAppearOneByOneGame';
import { TouchTheBallGame } from '@/components/game/TouchTheBallGame';
import { TapTheCircleGame } from '@/components/game/TapTheCircleGame';
import { FindTheSoundSourceGame } from '@/components/game/FindTheSoundSourceGame';
import { TapWhatIShowYouGame } from '@/components/game/TapWhatIShowYouGame';
import { FollowTheArrowGame } from '@/components/game/FollowTheArrowGame';
import { TapTheTargetIgnoreDistractionGame } from '@/components/game/TapTheTargetIgnoreDistractionGame';
import { SoundDistractionChallengeGame } from '@/components/game/SoundDistractionChallengeGame';
import { SlowTaskWithPopUpDistractionGame } from '@/components/game/SlowTaskWithPopUpDistractionGame';
import { SequenceWithDistractionGame } from '@/components/game/SequenceWithDistractionGame';
import { MovingTargetWithExtraObjectsGame } from '@/components/game/MovingTargetWithExtraObjectsGame';
import { JawAwarenessCrocodileGame } from '@/components/game/JawAwarenessCrocodileGame';
import { JawSwingAdventureGame } from '@/components/game/JawSwingAdventureGame';
import { JawPushChallengeGame } from '@/components/game/JawPushChallengeGame';
import { JawRhythmTapGame } from '@/components/game/JawRhythmTapGame';
import { JawStrengthBuilderGame } from '@/components/game/JawStrengthBuilderGame';
import { RainbowCurveTraceGame } from '@/components/game/RainbowCurveTraceGame';
import { DriveCarCurvyRoadGame } from '@/components/game/DriveCarCurvyRoadGame';
import { TraceSmilingMouthGame } from '@/components/game/TraceSmilingMouthGame';
import { BallRollCurvedTrackGame } from '@/components/game/BallRollCurvedTrackGame';
import { PaintCurvedSnakeGame } from '@/components/game/PaintCurvedSnakeGame';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type GameKey = 'menu' | 'follow-ball' | 'catch-star' | 'slow-to-fast' | 'track-freeze' | 'follow-look' | 'tap-magic' | 'tap-animate' | 'tap-reveal' | 'tap-sound' | 'tap-choice' | 'sound-to-tap' | 'which-sound' | 'find-sound-source' | 'stop-when-sound-stops' | 'loud-vs-soft' | 'follow-my-eyes' | 'eyes-then-object' | 'which-side' | 'follow-gaze-animation' | 'eyes-only' | 'big-tap' | 'tap-red-circle' | 'game-3' | 'game-4' | 'game-5' | 'small-circle-tap' | 'tap-only-small' | 'shrinking-target' | 'track-then-tap' | 'multiple-small-targets' | 'tap-slowly' | 'tap-fast' | 'slow-then-fast' | 'follow-my-point' | 'point-to-object-appears' | 'tap-the-pointed-object' | 'moving-arm-pointing' | 'multi-point-follow' | 'tap-what-you-like' | 'which-one-moved' | 'sound-to-choice' | 'show-me-the-toy' | 'food-vs-toy' | 'pass-the-ball' | 'tap-only-on-your-turn' | 'your-turn-to-complete' | 'wait-for-the-signal' | 'turn-timer' | 'watch-and-wait' | 'growing-flower' | 'timer-bar-tap' | 'follow-slow-movement' | 'shapes-appear-one-by-one' | 'touch-the-ball' | 'tap-the-circle' | 'find-the-sound-source' | 'tap-what-i-show-you' | 'follow-the-arrow' | 'tap-the-target-ignore-distraction' | 'sound-distraction-challenge' | 'slow-task-with-pop-up-distraction' | 'sequence-with-distraction' | 'moving-target-with-extra-objects' | 'jaw-awareness-crocodile' | 'jaw-swing-adventure' | 'jaw-push-challenge' | 'jaw-rhythm-tap' | 'jaw-strength-builder' | 'rainbow-curve-trace' | 'drive-car-curvy-road' | 'trace-smiling-mouth' | 'ball-roll-curved-track' | 'paint-curved-snake';

type GameInfo = {
  id: string;
  title: string;
  emoji: string;
  description: string;
  color: string;
  available: boolean;
};

export default function SessionGamesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    therapy?: string;
    level?: string;
    session?: string;
  }>();

  const [currentGame, setCurrentGame] = React.useState<GameKey>('menu');

  const therapyId = params.therapy || 'speech';
  const levelNumber = params.level ? parseInt(params.level, 10) : 1;
  const sessionNumber = params.session ? parseInt(params.session, 10) : 1;

  const isFollowBallAvailable =
    therapyId === 'speech' && levelNumber === 1 && sessionNumber === 1;

  const isCatchStarAvailable =
    therapyId === 'speech' && levelNumber === 1 && sessionNumber === 1;

  const isSlowToFastAvailable =
    therapyId === 'speech' && levelNumber === 1 && sessionNumber === 1;

  const isTrackFreezeAvailable =
    therapyId === 'speech' && levelNumber === 1 && sessionNumber === 1;

  const isFollowLookAvailable =
    therapyId === 'speech' && levelNumber === 1 && sessionNumber === 1;

  // Level 1 Session 2 games
  const isTapMagicAvailable =
    therapyId === 'speech' && levelNumber === 1 && sessionNumber === 2;

  const isTapAnimateAvailable =
    therapyId === 'speech' && levelNumber === 1 && sessionNumber === 2;

  const isTapRevealAvailable =
    therapyId === 'speech' && levelNumber === 1 && sessionNumber === 2;

  const isTapSoundAvailable =
    therapyId === 'speech' && levelNumber === 1 && sessionNumber === 2;

  const isTapChoiceAvailable =
    therapyId === 'speech' && levelNumber === 1 && sessionNumber === 2;

  // Level 1 Session 1 games (ONLY for Session 1)
  const isBigTapAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 1;

  const isTapRedCircleAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 1;

  const isGame3Available =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 1;

  const isGame4Available =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 1;

  const isGame5Available =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 1;

  // Level 1 Session 2 games (ONLY for Session 2 - will be added later)
  // For now, Session 2 will show placeholder games or empty list

  // Level 1 Session 2 Game 1: Small Circle Tap - available for OT Level 1 Session 2
  const isSmallCircleTapAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 2;

  // Level 1 Session 2 Game 2: Tap Only Small Target - available for OT Level 1 Session 2
  const isTapOnlySmallAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 2;

  // Level 1 Session 2 Game 3: Shrinking Target - available for OT Level 1 Session 2
  const isShrinkingTargetAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 2;

  // Level 1 Session 2 Game 4: Track Then Tap Small Object - available for OT Level 1 Session 2
  const isTrackThenTapAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 2;

  // Level 1 Session 2 Game 5: Multiple Small Targets - available for OT Level 1 Session 2
  const isMultipleSmallTargetsAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 2;

  // Level 1 Session 3 Game 1: Tap Slowly - available for OT Level 1 Session 3
  const isTapSlowlyAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 3;

  // Level 1 Session 3 Game 2: Tap Fast - available for OT Level 1 Session 3
  const isTapFastAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 3;

  // Level 1 Session 3 Game 3: Slow Then Fast - available for OT Level 1 Session 3
  const isSlowThenFastAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 3;

  // Level 1 Session 3 games - Speech Therapy
  const isSoundToTapAvailable =
    therapyId === 'speech' && levelNumber === 1 && sessionNumber === 3;

  const isWhichSoundAvailable =
    therapyId === 'speech' && levelNumber === 1 && sessionNumber === 3;

  const isFindSoundSourceAvailable =
    therapyId === 'speech' && levelNumber === 1 && sessionNumber === 3;

  const isStopWhenSoundStopsAvailable =
    therapyId === 'speech' && levelNumber === 1 && sessionNumber === 3;

  const isLoudVsSoftAvailable =
    therapyId === 'speech' && levelNumber === 1 && sessionNumber === 3;

  // Level 1 Session 4 games - Speech Therapy
  const isFollowMyEyesAvailable =
    therapyId === 'speech' && levelNumber === 1 && sessionNumber === 4;

  const isEyesThenObjectAvailable =
    therapyId === 'speech' && levelNumber === 1 && sessionNumber === 4;

  const isWhichSideAvailable =
    therapyId === 'speech' && levelNumber === 1 && sessionNumber === 4;

  const isFollowGazeToAnimationAvailable =
    therapyId === 'speech' && levelNumber === 1 && sessionNumber === 4;

  const isEyesOnlyAvailable =
    therapyId === 'speech' && levelNumber === 1 && sessionNumber === 4;

  // Level 1 Session 5 games - Speech Therapy (Pointing Games)
  const isFollowMyPointAvailable =
    therapyId === 'speech' && levelNumber === 1 && sessionNumber === 5;

  const isPointToObjectAppearsAvailable =
    therapyId === 'speech' && levelNumber === 1 && sessionNumber === 5;

  const isTapThePointedObjectAvailable =
    therapyId === 'speech' && levelNumber === 1 && sessionNumber === 5;

  const isMovingArmPointingAvailable =
    therapyId === 'speech' && levelNumber === 1 && sessionNumber === 5;

  const isMultiPointFollowAvailable =
    therapyId === 'speech' && levelNumber === 1 && sessionNumber === 5;

  // Level 1 Session 6 games - Speech Therapy (Choice & Instruction Games)
  const isTapWhatYouLikeAvailable =
    therapyId === 'speech' && levelNumber === 1 && sessionNumber === 6;

  const isWhichOneMovedAvailable =
    therapyId === 'speech' && levelNumber === 1 && sessionNumber === 6;

  const isSoundToChoiceAvailable =
    therapyId === 'speech' && levelNumber === 1 && sessionNumber === 6;

  const isShowMeTheToyAvailable =
    therapyId === 'speech' && levelNumber === 1 && sessionNumber === 6;

  const isFoodVsToyAvailable =
    therapyId === 'speech' && levelNumber === 1 && sessionNumber === 6;

  // Level 1 Session 7 games - Speech Therapy (Turn-taking & Waiting Games)
  const isPassTheBallAvailable =
    therapyId === 'speech' && levelNumber === 1 && sessionNumber === 7;

  const isTapOnlyOnYourTurnAvailable =
    therapyId === 'speech' && levelNumber === 1 && sessionNumber === 7;

  const isYourTurnToCompleteAvailable =
    therapyId === 'speech' && levelNumber === 1 && sessionNumber === 7;

  const isWaitForTheSignalAvailable =
    therapyId === 'speech' && levelNumber === 1 && sessionNumber === 7;

  const isTurnTimerAvailable =
    therapyId === 'speech' && levelNumber === 1 && sessionNumber === 7;

  // Level 1 Session 8 games - Speech Therapy (Sustained Attention Games)
  const isWatchAndWaitAvailable =
    therapyId === 'speech' && levelNumber === 1 && sessionNumber === 8;

  const isGrowingFlowerAvailable =
    therapyId === 'speech' && levelNumber === 1 && sessionNumber === 8;

  const isTimerBarTapAvailable =
    therapyId === 'speech' && levelNumber === 1 && sessionNumber === 8;

  const isFollowSlowMovementAvailable =
    therapyId === 'speech' && levelNumber === 1 && sessionNumber === 8;

  const isShapesAppearOneByOneAvailable =
    therapyId === 'speech' && levelNumber === 1 && sessionNumber === 8;

  // Level 1 Session 9 games - Speech Therapy (Instruction Following Games)
  const isTouchTheBallAvailable =
    therapyId === 'speech' && levelNumber === 1 && sessionNumber === 9;

  const isTapTheCircleAvailable =
    therapyId === 'speech' && levelNumber === 1 && sessionNumber === 9;

  const isFindTheSoundSourceAvailable =
    therapyId === 'speech' && levelNumber === 1 && sessionNumber === 9;

  const isTapWhatIShowYouAvailable =
    therapyId === 'speech' && levelNumber === 1 && sessionNumber === 9;

  const isFollowTheArrowAvailable =
    therapyId === 'speech' && levelNumber === 1 && sessionNumber === 9;

  // Level 1 Session 10 games - Speech Therapy (Distraction Filtering Games)
  const isTapTheTargetIgnoreDistractionAvailable =
    therapyId === 'speech' && levelNumber === 1 && sessionNumber === 10;

  const isSoundDistractionChallengeAvailable =
    therapyId === 'speech' && levelNumber === 1 && sessionNumber === 10;

  const isSlowTaskWithPopUpDistractionAvailable =
    therapyId === 'speech' && levelNumber === 1 && sessionNumber === 10;

  const isSequenceWithDistractionAvailable =
    therapyId === 'speech' && levelNumber === 1 && sessionNumber === 10;

  const isMovingTargetWithExtraObjectsAvailable =
    therapyId === 'speech' && levelNumber === 1 && sessionNumber === 10;

  // Level 2 Session 1 games - Speech Therapy (Jaw Awareness Games)
  const isJawAwarenessCrocodileAvailable =
    therapyId === 'speech' && levelNumber === 2 && sessionNumber === 1;
  const isJawSwingAdventureAvailable =
    therapyId === 'speech' && levelNumber === 2 && sessionNumber === 1;
  const isJawPushChallengeAvailable =
    therapyId === 'speech' && levelNumber === 2 && sessionNumber === 1;
  const isJawRhythmTapAvailable =
    therapyId === 'speech' && levelNumber === 2 && sessionNumber === 1;
  const isJawStrengthBuilderAvailable =
    therapyId === 'speech' && levelNumber === 2 && sessionNumber === 1;

  // Level 2 Session 2 games (Occupational Therapy - Curve Tracing)
  const isRainbowCurveTraceAvailable =
    (therapyId === 'occupational' || therapyId === 'speech') && levelNumber === 2 && sessionNumber === 2;
  const isDriveCarCurvyRoadAvailable =
    (therapyId === 'occupational' || therapyId === 'speech') && levelNumber === 2 && sessionNumber === 2;
  const isTraceSmilingMouthAvailable =
    (therapyId === 'occupational' || therapyId === 'speech') && levelNumber === 2 && sessionNumber === 2;
  const isBallRollCurvedTrackAvailable =
    (therapyId === 'occupational' || therapyId === 'speech') && levelNumber === 2 && sessionNumber === 2;
  const isPaintCurvedSnakeAvailable =
    (therapyId === 'occupational' || therapyId === 'speech') && levelNumber === 2 && sessionNumber === 2;

  const GAMES: GameInfo[] = [
    {
      id: 'follow-ball',
      title: 'Follow the Ball',
      emoji: '⚽',
      description: 'Watch the ball and tap when it glows! Build your Focus Power.',
      color: '#3B82F6',
      available: isFollowBallAvailable,
    },
    {
      id: 'catch-star',
      title: 'Catch the Bouncing Star',
      emoji: '⭐',
      description: 'Tap the star as it bounces around! Build visual tracking and coordination.',
      color: '#FCD34D',
      available: isCatchStarAvailable,
    },
    {
      id: 'slow-to-fast',
      title: 'Slow → Fast Game',
      emoji: '⭐',
      description: 'Tap the object as it moves! Speed increases after 3 taps.',
      color: '#F59E0B',
      available: isSlowToFastAvailable,
    },
    {
      id: 'track-freeze',
      title: 'Track & Freeze',
      emoji: '🚗',
      description: 'Follow the car... tap only when it stops! Build impulse control.',
      color: '#EF4444',
      available: isTrackFreezeAvailable,
    },
    {
      id: 'follow-look',
      title: 'Follow Where I Look',
      emoji: '👀',
      description: 'Watch my eyes! Tap the object where I\'m looking. Build gaze following.',
      color: '#F59E0B',
      available: isFollowLookAvailable,
    },
    {
      id: 'tap-magic',
      title: 'Tap for Magic',
      emoji: '✨',
      description: 'Tap the button to make magic happen! Build cause & effect understanding.',
      color: '#8B5CF6',
      available: isTapMagicAvailable,
    },
    {
      id: 'tap-animate',
      title: 'Tap to Animate',
      emoji: '🐕',
      description: 'Tap the animal to make him jump, dance, or laugh! Build control & preference.',
      color: '#F59E0B',
      available: isTapAnimateAvailable,
    },
    {
      id: 'tap-reveal',
      title: 'Tap to Reveal',
      emoji: '☁️',
      description: 'Tap the cloud to see what\'s hiding! Build anticipation & attention.',
      color: '#3B82F6',
      available: isTapRevealAvailable,
    },
    {
      id: 'tap-sound',
      title: 'Tap to Make Sound',
      emoji: '🥁',
      description: 'Tap the instrument to hear it play! Build sound association & listening.',
      color: '#F59E0B',
      available: isTapSoundAvailable,
    },
    {
      id: 'tap-choice',
      title: 'Tap for Choice',
      emoji: '🎯',
      description: 'Tap what you like! Choose between two items. Builds early choice-making.',
      color: '#3B82F6',
      available: isTapChoiceAvailable,
    },
    {
      id: 'big-tap',
      title: 'Big Tap Target',
      emoji: '🟢',
      description: 'Tap the big circle to make it burst! Build finger tap & scanning.',
      color: '#22C55E',
      available: isBigTapAvailable,
    },
    {
      id: 'tap-red-circle',                                  // 👈 NEW GAME
      title: 'Tap the Big Red Circle',
      emoji: '🔴',
      description:
        'Tap the glowing red circle to build shape & colour attention and finger control.',
      color: '#EF4444',
      available: isTapRedCircleAvailable,
    },
    {
      id: 'game-3',
      title: 'Balloon Pop',
      emoji: '🎈',
      description: 'Tap the balloon as it moves slowly across the screen. Build hand-eye coordination!',
      color: '#8B5CF6',
      available: isGame3Available,
    },
    {
      id: 'game-4',
      title: 'Tap and Hold',
      emoji: '✨',
      description: 'Tap and hold the button for 2 seconds. Build finger control and endurance!',
      color: '#3B82F6',
      available: isGame4Available,
    },
    {
      id: 'game-5',
      title: 'Multi-Tap Fun',
      emoji: '🎈',
      description: 'Tap all 5 balloons one by one! Build coordination and finger precision!',
      color: '#F472B6',
      available: isGame5Available,
    },
    {
      id: 'small-circle-tap',
      title: 'Small Circle Tap',
      emoji: '🔵',
      description: 'Tap the small circle with your index finger. Build precision and finger isolation!',
      color: '#0EA5E9',
      available: isSmallCircleTapAvailable,
    },
    {
      id: 'tap-only-small',
      title: 'Tap Only Small Target',
      emoji: '🎯',
      description: 'Large and small shapes appear. Tap only the small one when it glows!',
      color: '#F59E0B',
      available: isTapOnlySmallAvailable,
    },
    {
      id: 'shrinking-target',
      title: 'Shrinking Target',
      emoji: '🎯',
      description: 'Tap the target! It gets smaller each time. If you struggle, it grows bigger.',
      color: '#8B5CF6',
      available: isShrinkingTargetAvailable,
    },
    {
      id: 'track-then-tap',
      title: 'Track Then Tap',
      emoji: '🐝',
      description: 'Follow the moving object with your eyes, then tap it when it stops!',
      color: '#FCD34D',
      available: isTrackThenTapAvailable,
    },
    {
      id: 'multiple-small-targets',
      title: 'Multiple Small Targets',
      emoji: '⚫',
      description: 'Tap all 4 small dots to clear the screen! Build scanning and precision.',
      color: '#06B6D4',
      available: isMultipleSmallTargetsAvailable,
    },
    {
      id: 'tap-slowly',
      title: 'Tap Slowly',
      emoji: '⏱️',
      description: 'Wait for the circle to light up, then tap! Build slow motor control and rhythm.',
      color: '#3B82F6',
      available: isTapSlowlyAvailable,
    },
    {
      id: 'tap-fast',
      title: 'Tap Fast',
      emoji: '⚡',
      description: 'Circle blinks rapidly. Tap quickly to match the pace! Build fast motor activation.',
      color: '#F59E0B',
      available: isTapFastAvailable,
    },
    {
      id: 'slow-then-fast',
      title: 'Slow Then Fast',
      emoji: '🔄',
      description: 'Switch between slow and fast tapping. Build cognitive flexibility and motor switching.',
      color: '#8B5CF6',
      available: isSlowThenFastAvailable,
    },
    // Speech Therapy Level 1 Session 3 games
    {
      id: 'sound-to-tap',
      title: 'Sound → Tap',
      emoji: '🔔',
      description: 'Listen to the sound, then tap when the circle appears! Build sound detection and reaction timing.',
      color: '#3B82F6',
      available: isSoundToTapAvailable,
    },
    {
      id: 'which-sound',
      title: 'Which Sound?',
      emoji: '🎵',
      description: 'Listen to the sound and tap the matching picture! Build sound discrimination.',
      color: '#8B5CF6',
      available: isWhichSoundAvailable,
    },
    {
      id: 'find-sound-source',
      title: 'Find the Sound Source',
      emoji: '🔍',
      description: 'Listen to the sound and find what made it! Link sounds to objects.',
      color: '#F59E0B',
      available: isFindSoundSourceAvailable,
    },
    {
      id: 'stop-when-sound-stops',
      title: 'Stop When Sound Stops',
      emoji: '🛑',
      description: 'Watch the ball move with sound. Tap when the sound stops! Build self-control and auditory focus.',
      color: '#22C55E',
      available: isStopWhenSoundStopsAvailable,
    },
    {
      id: 'loud-vs-soft',
      title: 'Loud vs Soft',
      emoji: '🔊',
      description: 'Listen! Loud sound? Tap big! Soft sound? Tap small! Build volume discrimination.',
      color: '#EC4899',
      available: isLoudVsSoftAvailable,
    },
    // Speech Therapy Level 1 Session 4 games
    {
      id: 'follow-my-eyes',
      title: 'Follow My Eyes',
      emoji: '👁️',
      description: 'Watch where I look! Tap the toy that appears on that side. Build gaze following and joint attention.',
      color: '#60A5FA',
      available: isFollowMyEyesAvailable,
    },
    {
      id: 'eyes-then-object',
      title: 'Eyes Then Object',
      emoji: '👀',
      description: 'Watch my eyes, wait for the pause, then tap the toy! Build gaze interpretation and processing time.',
      color: '#3B82F6',
      available: isEyesThenObjectAvailable,
    },
    {
      id: 'which-side',
      title: 'Which Side?',
      emoji: '🤔',
      description: 'I\'m looking at one of the toys. Can you find it? Build visual scanning and decision-making.',
      color: '#8B5CF6',
      available: isWhichSideAvailable,
    },
    {
      id: 'follow-gaze-animation',
      title: 'Follow My Gaze to Animation',
      emoji: '🎈',
      description: 'Watch me look up! Tap the balloon that floats up. Build vertical gaze following and tracking.',
      color: '#EF4444',
      available: isFollowGazeToAnimationAvailable,
    },
    {
      id: 'eyes-only',
      title: 'Eyes Only',
      emoji: '👁️',
      description: 'Only my eyes move! Watch carefully and tap the correct toy. Build subtle social cue reading.',
      color: '#10B981',
      available: isEyesOnlyAvailable,
    },
    // Speech Therapy Level 1 Session 5 games (Pointing Games)
    {
      id: 'follow-my-point',
      title: 'Follow My Point',
      emoji: '👆',
      description: 'Watch me point! Tap the object I\'m pointing to. Build gesture following and joint attention.',
      color: '#FCD34D',
      available: isFollowMyPointAvailable,
    },
    {
      id: 'point-to-object-appears',
      title: 'Point → Object Appears',
      emoji: '✨',
      description: 'I point, then the object appears! Tap it when you see it. Build gesture anticipation and social prediction.',
      color: '#60A5FA',
      available: isPointToObjectAppearsAvailable,
    },
    {
      id: 'tap-the-pointed-object',
      title: 'Tap the Pointed Object',
      emoji: '🎯',
      description: 'Three objects appear. I point to one—can you find it? Build discrimination and social interpretation.',
      color: '#8B5CF6',
      available: isTapThePointedObjectAvailable,
    },
    {
      id: 'moving-arm-pointing',
      title: 'Moving Arm Pointing',
      emoji: '🤲',
      description: 'Watch my arm move slowly and point! Follow the motion and tap. Build visual tracking and gesture integration.',
      color: '#3B82F6',
      available: isMovingArmPointingAvailable,
    },
    {
      id: 'multi-point-follow',
      title: 'Multi-Point Follow',
      emoji: '⚡',
      description: 'I point left, then right—follow quickly! Build rapid attention shifting and sustained engagement.',
      color: '#EF4444',
      available: isMultiPointFollowAvailable,
    },
    // Speech Therapy Level 1 Session 6 games (Choice & Instruction Games)
    {
      id: 'tap-what-you-like',
      title: 'Tap What You Like',
      emoji: '💝',
      description: 'Choose the one you like! No wrong answer—build confidence and preference expression.',
      color: '#FCD34D',
      available: isTapWhatYouLikeAvailable,
    },
    {
      id: 'which-one-moved',
      title: 'Which One Moved?',
      emoji: '👀',
      description: 'Watch carefully! One picture wiggles—tap the one that moved. Build visual discrimination.',
      color: '#60A5FA',
      available: isWhichOneMovedAvailable,
    },
    {
      id: 'sound-to-choice',
      title: 'Sound → Choice',
      emoji: '🔊',
      description: 'Listen to the sound, then tap the matching picture! Link sounds to objects.',
      color: '#8B5CF6',
      available: isSoundToChoiceAvailable,
    },
    {
      id: 'show-me-the-toy',
      title: 'Show Me The Toy',
      emoji: '👆',
      description: 'I\'ll tell you which one to tap! Follow simple instructions and build vocabulary.',
      color: '#3B82F6',
      available: isShowMeTheToyAvailable,
    },
    {
      id: 'food-vs-toy',
      title: 'Food vs Toy',
      emoji: '🗂️',
      description: 'Tap the food or tap the toy! Learn to sort by category and build cognitive reasoning.',
      color: '#EF4444',
      available: isFoodVsToyAvailable,
    },
    // Speech Therapy Level 1 Session 7 games (Turn-taking & Waiting)
    {
      id: 'pass-the-ball',
      title: 'Pass the Ball',
      emoji: '⚽',
      description: 'Take turns passing the ball! Learn turn-taking and waiting.',
      color: '#22C55E',
      available: isPassTheBallAvailable,
    },
    {
      id: 'tap-only-on-your-turn',
      title: 'Tap Only On Your Turn',
      emoji: '🟢',
      description: 'Tap when you see GO! Wait when you see STOP! Build self-control.',
      color: '#EF4444',
      available: isTapOnlyOnYourTurnAvailable,
    },
    {
      id: 'your-turn-to-complete',
      title: 'Your Turn to Complete',
      emoji: '🧩',
      description: 'Take turns placing puzzle pieces! Learn alternating turns.',
      color: '#6366F1',
      available: isYourTurnToCompleteAvailable,
    },
    {
      id: 'wait-for-the-signal',
      title: 'Wait for the Signal',
      emoji: '🫧',
      description: 'Watch the spinner! Tap only when it turns green. Build waiting skills.',
      color: '#06B6D4',
      available: isWaitForTheSignalAvailable,
    },
    {
      id: 'turn-timer',
      title: 'Turn Timer',
      emoji: '⏱️',
      description: 'Wait for the timer to fill, then tap! Learn timed waiting.',
      color: '#FCD34D',
      available: isTurnTimerAvailable,
    },
    // Speech Therapy Level 1 Session 8 games (Sustained Attention Games)
    {
      id: 'watch-and-wait',
      title: 'Watch and Wait',
      emoji: '🎈',
      description: 'Watch the object move slowly, then tap when the ring appears! Build sustained attention.',
      color: '#FCD34D',
      available: isWatchAndWaitAvailable,
    },
    {
      id: 'growing-flower',
      title: 'Growing Flower',
      emoji: '🌻',
      description: 'Watch the flower grow! Tap when it\'s fully bloomed. Build patience and delayed gratification.',
      color: '#22C55E',
      available: isGrowingFlowerAvailable,
    },
    {
      id: 'timer-bar-tap',
      title: 'Timer Bar → Tap',
      emoji: '⭐',
      description: 'Watch the bar fill! Tap only when it\'s full. Build time perception and control.',
      color: '#3B82F6',
      available: isTimerBarTapAvailable,
    },
    {
      id: 'follow-slow-movement',
      title: 'Follow the Slow Movement',
      emoji: '🐢',
      description: 'Follow the slow-moving object with your eyes, then tap when it stops! Build extended attention.',
      color: '#8B5CF6',
      available: isFollowSlowMovementAvailable,
    },
    {
      id: 'shapes-appear-one-by-one',
      title: 'Shapes Appear One By One',
      emoji: '🔵',
      description: 'Watch shapes appear one by one, then tap all three! Build multi-step attention and memory.',
      color: '#EC4899',
      available: isShapesAppearOneByOneAvailable,
    },
    // Level 1 Session 9 games - Speech Therapy (Instruction Following Games)
    {
      id: 'touch-the-ball',
      title: 'Touch the Ball',
      emoji: '⚽',
      description: 'Listen to the instruction and touch the correct object! Build receptive command understanding.',
      color: '#3B82F6',
      available: isTouchTheBallAvailable,
    },
    {
      id: 'tap-the-circle',
      title: 'Tap the Circle',
      emoji: '⭕',
      description: 'Follow the shape instruction! Tap the correct shape. Build shape recognition and discrimination.',
      color: '#8B5CF6',
      available: isTapTheCircleAvailable,
    },
    {
      id: 'find-the-sound-source',
      title: 'Find the Sound Source',
      emoji: '🔊',
      description: 'Listen to the sound, then show me the matching object! Build sound-object linking.',
      color: '#F59E0B',
      available: isFindTheSoundSourceAvailable,
    },
    {
      id: 'tap-what-i-show-you',
      title: 'Tap What I Show You',
      emoji: '✨',
      description: 'Watch the glowing object, then tap it! Build visual instruction comprehension.',
      color: '#22C55E',
      available: isTapWhatIShowYouAvailable,
    },
    {
      id: 'follow-the-arrow',
      title: 'Follow the Arrow',
      emoji: '➡️',
      description: 'Follow the arrow and tap the object it points to! Build gestural cue understanding.',
      color: '#EC4899',
      available: isFollowTheArrowAvailable,
    },
    // Level 1 Session 10 games - Speech Therapy (Distraction Filtering Games)
    {
      id: 'tap-the-target-ignore-distraction',
      title: 'Tap the Target, Ignore Distraction',
      emoji: '🎯',
      description: 'Tap the target object only! Ignore the flying distraction. Build selective attention.',
      color: '#FCD34D',
      available: isTapTheTargetIgnoreDistractionAvailable,
    },
    {
      id: 'sound-distraction-challenge',
      title: 'Sound Distraction Challenge',
      emoji: '🔊',
      description: 'Wait for the target to glow while sounds play! Build auditory filtering.',
      color: '#3B82F6',
      available: isSoundDistractionChallengeAvailable,
    },
    {
      id: 'slow-task-with-pop-up-distraction',
      title: 'Slow Task + Pop-up Distraction',
      emoji: '🌻',
      description: 'Watch the flower grow while ignoring pop-ups! Build sustained attention.',
      color: '#22C55E',
      available: isSlowTaskWithPopUpDistractionAvailable,
    },
    {
      id: 'sequence-with-distraction',
      title: 'Sequence with Distraction',
      emoji: '🔢',
      description: 'Tap shapes in order while ignoring distractions! Build multi-step focus.',
      color: '#8B5CF6',
      available: isSequenceWithDistractionAvailable,
    },
    {
      id: 'moving-target-with-extra-objects',
      title: 'Moving Target + Extra Objects',
      emoji: '⚽',
      description: 'Tap the moving target only! Ignore other moving objects. Build visual filtering.',
      color: '#F59E0B',
      available: isMovingTargetWithExtraObjectsAvailable,
    },
    {
      id: 'jaw-awareness-crocodile',
      title: 'Jaw Awareness Crocodile',
      emoji: '🐊',
      description: 'Copy the crocodile! Open and close your mouth to match. Build jaw awareness and control.',
      color: '#22C55E',
      available: isJawAwarenessCrocodileAvailable,
    },
    {
      id: 'jaw-swing-adventure',
      title: 'Jaw Swing Adventure',
      emoji: '🦸',
      description: 'Move your jaw left and right to control the character! Build lateral jaw movement.',
      color: '#FCD34D',
      available: isJawSwingAdventureAvailable,
    },
    {
      id: 'jaw-push-challenge',
      title: 'Jaw Push Challenge',
      emoji: '🚀',
      description: 'Push your jaw forward to collect objects! Build jaw protrusion strength.',
      color: '#0EA5E9',
      available: isJawPushChallengeAvailable,
    },
    {
      id: 'jaw-rhythm-tap',
      title: 'Jaw Rhythm Tap',
      emoji: '🎵',
      description: 'Tap to open and close your jaw in rhythm! Build coordination and timing.',
      color: '#A855F7',
      available: isJawRhythmTapAvailable,
    },
    {
      id: 'jaw-strength-builder',
      title: 'Jaw Strength Builder',
      emoji: '🏗️',
      description: 'Hold your jaw open or closed to build structures! Build jaw strength and endurance.',
      color: '#F59E0B',
      available: isJawStrengthBuilderAvailable,
    },
    // Level 2 Session 2 games (Occupational Therapy - Curve Tracing)
    {
      id: 'rainbow-curve-trace',
      title: 'Rainbow Curve Trace',
      emoji: '🌈',
      description: 'Trace a big, smooth curve with a glowing finger! Build wrist rotation and prepare for letters.',
      color: '#8B5CF6',
      available: isRainbowCurveTraceAvailable,
    },
    {
      id: 'drive-car-curvy-road',
      title: 'Drive the Car on Curvy Road',
      emoji: '🚗',
      description: 'Follow a curved road using drag with a small car! Build continuous motion control and visual tracking.',
      color: '#22C55E',
      available: isDriveCarCurvyRoadAvailable,
    },
    {
      id: 'trace-smiling-mouth',
      title: 'Trace the Smiling Mouth',
      emoji: '😊',
      description: 'Trace a big smile to make the face happy! Build emotion-based engagement and natural curved shape recognition.',
      color: '#FCD34D',
      available: isTraceSmilingMouthAvailable,
    },
    {
      id: 'ball-roll-curved-track',
      title: 'Ball Roll on Curved Track',
      emoji: '⚽',
      description: 'Drag to roll a ball along a curved rail to reach a star! Build bilateral coordination prep and smooth directional movement.',
      color: '#3B82F6',
      available: isBallRollCurvedTrackAvailable,
    },
    {
      id: 'paint-curved-snake',
      title: 'Paint the Curved Snake',
      emoji: '🐍',
      description: 'Trace to color a snake body outline with a curved body! Build motivation and encourage full-path completion.',
      color: '#10B981',
      available: isPaintCurvedSnakeAvailable,
    },
  ];

  // ---------- Game render switches ----------

  if (currentGame === 'follow-ball') {
    return (
      <FollowTheBall
        onBack={() => setCurrentGame('menu')}
        therapyId={therapyId}
        levelNumber={levelNumber}
        sessionNumber={sessionNumber}
        gameId="game-1"
      />
    );
  }

  if (currentGame === 'catch-star') {
    return <CatchTheBouncingStar onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'slow-to-fast') {
    return <SlowToFastGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'track-freeze') {
    return <TrackAndFreezeGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'follow-look') {
    return <FollowWhereILookGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'tap-magic') {
    return <TapForMagicGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'tap-animate') {
    return <TapToAnimateGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'tap-reveal') {
    return <TapToRevealGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'tap-sound') {
    return <TapToMakeSoundGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'tap-choice') {
    return <TapForChoiceGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'big-tap') {
    return <BigTapTarget onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'tap-red-circle') {
    // 👇 NEW: launch our OT Game 2
    return <TapRedCircleGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'game-3') {
    return <BalloonPopGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'game-4') {
    return <TapAndHoldGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'game-5') {
    return <MultiTapFunGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'small-circle-tap') {
    return <SmallCircleTapGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'tap-only-small') {
    return <TapOnlySmallTargetGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'shrinking-target') {
    return <ShrinkingTargetGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'track-then-tap') {
    return <TrackThenTapSmallObjectGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'multiple-small-targets') {
    return <MultipleSmallTargetsGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'tap-slowly') {
    return <TapSlowlyGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'tap-fast') {
    return <TapFastGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'slow-then-fast') {
    return <SlowThenFastGame onBack={() => setCurrentGame('menu')} />;
  }

  // Speech Therapy Level 1 Session 3 games
  if (currentGame === 'sound-to-tap') {
    return <SoundToTapGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'which-sound') {
    return <WhichSoundGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'find-sound-source') {
    return <FindSoundSourceGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'stop-when-sound-stops') {
    return <StopWhenSoundStopsGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'loud-vs-soft') {
    return <LoudVsSoftGame onBack={() => setCurrentGame('menu')} />;
  }

  // Speech Therapy Level 1 Session 4 games
  if (currentGame === 'follow-my-eyes') {
    return <FollowMyEyesGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'eyes-then-object') {
    return <EyesThenObjectGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'which-side') {
    return <WhichSideGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'follow-gaze-animation') {
    return <FollowGazeToAnimationGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'eyes-only') {
    return <EyesOnlyGame onBack={() => setCurrentGame('menu')} />;
  }

  // Speech Therapy Level 1 Session 5 games (Pointing Games)
  if (currentGame === 'follow-my-point') {
    return <FollowMyPointGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'point-to-object-appears') {
    return <PointToObjectAppearsGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'tap-the-pointed-object') {
    return <TapThePointedObjectGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'moving-arm-pointing') {
    return <MovingArmPointingGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'multi-point-follow') {
    return <MultiPointFollowGame onBack={() => setCurrentGame('menu')} />;
  }

  // Speech Therapy Level 1 Session 6 games (Choice & Instruction Games)
  if (currentGame === 'tap-what-you-like') {
    return <TapWhatYouLikeGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'which-one-moved') {
    return <WhichOneMovedGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'sound-to-choice') {
    return <SoundToChoiceGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'show-me-the-toy') {
    return <ShowMeTheToyGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'food-vs-toy') {
    return <FoodVsToyGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'pass-the-ball') {
    return <PassTheBallGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'tap-only-on-your-turn') {
    return <TapOnlyOnYourTurnGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'your-turn-to-complete') {
    return <YourTurnToCompleteGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'wait-for-the-signal') {
    return <WaitForTheSignalGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'turn-timer') {
    return <TurnTimerGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'watch-and-wait') {
    return <WatchAndWaitGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'growing-flower') {
    return <GrowingFlowerGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'timer-bar-tap') {
    return <TimerBarTapGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'follow-slow-movement') {
    return <FollowSlowMovementGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'shapes-appear-one-by-one') {
    return <ShapesAppearOneByOneGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'touch-the-ball') {
    return <TouchTheBallGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'tap-the-circle') {
    return <TapTheCircleGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'find-the-sound-source') {
    return <FindTheSoundSourceGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'tap-what-i-show-you') {
    return <TapWhatIShowYouGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'follow-the-arrow') {
    return <FollowTheArrowGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'tap-the-target-ignore-distraction') {
    return <TapTheTargetIgnoreDistractionGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'sound-distraction-challenge') {
    return <SoundDistractionChallengeGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'slow-task-with-pop-up-distraction') {
    return <SlowTaskWithPopUpDistractionGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'sequence-with-distraction') {
    return <SequenceWithDistractionGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'moving-target-with-extra-objects') {
    return <MovingTargetWithExtraObjectsGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'jaw-awareness-crocodile') {
    return <JawAwarenessCrocodileGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'jaw-swing-adventure') {
    return <JawSwingAdventureGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'jaw-push-challenge') {
    return <JawPushChallengeGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'jaw-rhythm-tap') {
    return <JawRhythmTapGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'jaw-strength-builder') {
    return <JawStrengthBuilderGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'rainbow-curve-trace') {
    return <RainbowCurveTraceGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'drive-car-curvy-road') {
    return <DriveCarCurvyRoadGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'trace-smiling-mouth') {
    return <TraceSmilingMouthGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'ball-roll-curved-track') {
    return <BallRollCurvedTrackGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'paint-curved-snake') {
    return <PaintCurvedSnakeGame onBack={() => setCurrentGame('menu')} />;
  }

  // ---------- Menu UI ----------

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Session Games</Text>
          <Text style={styles.headerSubtitle}>
            {therapyId.charAt(0).toUpperCase() + therapyId.slice(1)} • Level {levelNumber} • Session {sessionNumber}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Choose a Game</Text>
        <Text style={styles.sectionSubtitle}>
          Complete games to progress through your therapy session
        </Text>

        <View style={styles.gamesGrid}>
          {GAMES.filter(game => game.available).length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>No games available yet</Text>
              <Text style={styles.emptyStateText}>
                Games for this session will be added soon!
              </Text>
            </View>
          ) : (
            GAMES.filter(game => game.available).map((game) => (
              <TouchableOpacity
                key={game.id}
                style={[
                  styles.gameCard,
                  { borderColor: game.color },
                ]}
                onPress={() => {
                  if (game.id === 'follow-ball') setCurrentGame('follow-ball');
                  if (game.id === 'catch-star') setCurrentGame('catch-star');
                  if (game.id === 'slow-to-fast') setCurrentGame('slow-to-fast');
                  if (game.id === 'track-freeze') setCurrentGame('track-freeze');
                  if (game.id === 'follow-look') setCurrentGame('follow-look');
                  if (game.id === 'tap-magic') setCurrentGame('tap-magic');
                  if (game.id === 'tap-animate') setCurrentGame('tap-animate');
                  if (game.id === 'tap-reveal') setCurrentGame('tap-reveal');
                  if (game.id === 'tap-sound') setCurrentGame('tap-sound');
                  if (game.id === 'tap-choice') setCurrentGame('tap-choice');
                  if (game.id === 'sound-to-tap') setCurrentGame('sound-to-tap');
                  if (game.id === 'which-sound') setCurrentGame('which-sound');
                  if (game.id === 'find-sound-source') setCurrentGame('find-sound-source');
                  if (game.id === 'stop-when-sound-stops') setCurrentGame('stop-when-sound-stops');
                  if (game.id === 'loud-vs-soft') setCurrentGame('loud-vs-soft');
                  if (game.id === 'follow-my-eyes') setCurrentGame('follow-my-eyes');
                  if (game.id === 'eyes-then-object') setCurrentGame('eyes-then-object');
                  if (game.id === 'which-side') setCurrentGame('which-side');
                  if (game.id === 'follow-gaze-animation') setCurrentGame('follow-gaze-animation');
                  if (game.id === 'eyes-only') setCurrentGame('eyes-only');
                  if (game.id === 'big-tap') setCurrentGame('big-tap');
                  if (game.id === 'tap-red-circle') setCurrentGame('tap-red-circle');
                  if (game.id === 'game-3') setCurrentGame('game-3');
                  if (game.id === 'game-4') setCurrentGame('game-4');
                  if (game.id === 'game-5') setCurrentGame('game-5');
                  if (game.id === 'small-circle-tap') setCurrentGame('small-circle-tap');
                  if (game.id === 'tap-only-small') setCurrentGame('tap-only-small');
                  if (game.id === 'shrinking-target') setCurrentGame('shrinking-target');
                  if (game.id === 'track-then-tap') setCurrentGame('track-then-tap');
                  if (game.id === 'multiple-small-targets') setCurrentGame('multiple-small-targets');
                  if (game.id === 'tap-slowly') setCurrentGame('tap-slowly');
                  if (game.id === 'tap-fast') setCurrentGame('tap-fast');
                  if (game.id === 'slow-then-fast') setCurrentGame('slow-then-fast');
                  if (game.id === 'follow-my-point') setCurrentGame('follow-my-point');
                  if (game.id === 'point-to-object-appears') setCurrentGame('point-to-object-appears');
                  if (game.id === 'tap-the-pointed-object') setCurrentGame('tap-the-pointed-object');
                  if (game.id === 'moving-arm-pointing') setCurrentGame('moving-arm-pointing');
                  if (game.id === 'multi-point-follow') setCurrentGame('multi-point-follow');
                  if (game.id === 'tap-what-you-like') setCurrentGame('tap-what-you-like');
                  if (game.id === 'which-one-moved') setCurrentGame('which-one-moved');
                  if (game.id === 'sound-to-choice') setCurrentGame('sound-to-choice');
                  if (game.id === 'show-me-the-toy') setCurrentGame('show-me-the-toy');
                  if (game.id === 'food-vs-toy') setCurrentGame('food-vs-toy');
                  if (game.id === 'pass-the-ball') setCurrentGame('pass-the-ball');
                  if (game.id === 'tap-only-on-your-turn') setCurrentGame('tap-only-on-your-turn');
                  if (game.id === 'your-turn-to-complete') setCurrentGame('your-turn-to-complete');
                  if (game.id === 'wait-for-the-signal') setCurrentGame('wait-for-the-signal');
                  if (game.id === 'turn-timer') setCurrentGame('turn-timer');
                  if (game.id === 'watch-and-wait') setCurrentGame('watch-and-wait');
                  if (game.id === 'growing-flower') setCurrentGame('growing-flower');
                  if (game.id === 'timer-bar-tap') setCurrentGame('timer-bar-tap');
                  if (game.id === 'follow-slow-movement') setCurrentGame('follow-slow-movement');
                  if (game.id === 'shapes-appear-one-by-one') setCurrentGame('shapes-appear-one-by-one');
                  if (game.id === 'touch-the-ball') setCurrentGame('touch-the-ball');
                  if (game.id === 'tap-the-circle') setCurrentGame('tap-the-circle');
                  if (game.id === 'find-the-sound-source') setCurrentGame('find-the-sound-source');
                  if (game.id === 'tap-what-i-show-you') setCurrentGame('tap-what-i-show-you');
                  if (game.id === 'follow-the-arrow') setCurrentGame('follow-the-arrow');
                  if (game.id === 'tap-the-target-ignore-distraction') setCurrentGame('tap-the-target-ignore-distraction');
                  if (game.id === 'sound-distraction-challenge') setCurrentGame('sound-distraction-challenge');
                  if (game.id === 'slow-task-with-pop-up-distraction') setCurrentGame('slow-task-with-pop-up-distraction');
                  if (game.id === 'sequence-with-distraction') setCurrentGame('sequence-with-distraction');
                  if (game.id === 'moving-target-with-extra-objects') setCurrentGame('moving-target-with-extra-objects');
                  if (game.id === 'jaw-awareness-crocodile') setCurrentGame('jaw-awareness-crocodile');
                  if (game.id === 'jaw-swing-adventure') setCurrentGame('jaw-swing-adventure');
                  if (game.id === 'jaw-push-challenge') setCurrentGame('jaw-push-challenge');
                  if (game.id === 'jaw-rhythm-tap') setCurrentGame('jaw-rhythm-tap');
                  if (game.id === 'jaw-strength-builder') setCurrentGame('jaw-strength-builder');
                  if (game.id === 'rainbow-curve-trace') setCurrentGame('rainbow-curve-trace');
                  if (game.id === 'drive-car-curvy-road') setCurrentGame('drive-car-curvy-road');
                  if (game.id === 'trace-smiling-mouth') setCurrentGame('trace-smiling-mouth');
                  if (game.id === 'ball-roll-curved-track') setCurrentGame('ball-roll-curved-track');
                  if (game.id === 'paint-curved-snake') setCurrentGame('paint-curved-snake');
                }}
                activeOpacity={0.8}
              >
              <View style={[styles.gameIcon, { backgroundColor: `${game.color}20` }]}>
                <Text style={styles.gameEmoji}>{game.emoji}</Text>
              </View>
              <View style={styles.gameContent}>
                <Text style={styles.gameTitle}>
                  {game.title}
                </Text>
                <Text style={styles.gameDescription}>
                  {game.description}
                </Text>
              </View>
              <View
                style={[
                  styles.playBadge,
                  { backgroundColor: `${game.color}20` },
                ]}
              >
                <Ionicons name="play" size={20} color={game.color} />
              </View>
            </TouchableOpacity>
          )))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  backText: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
  },
  gamesGrid: {
    gap: 16,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  gameCardDisabled: {
    opacity: 0.6,
    borderColor: '#E5E7EB',
  },
  gameIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  gameEmoji: {
    fontSize: 28,
  },
  gameContent: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  gameTitleDisabled: {
    color: '#9CA3AF',
  },
  gameDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  gameDescriptionDisabled: {
    color: '#9CA3AF',
  },
  playBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  emptyState: {
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
});
