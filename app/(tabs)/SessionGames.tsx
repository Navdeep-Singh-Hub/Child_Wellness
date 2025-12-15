import { BigTapTarget } from '@/components/game/BigTapTarget';
import DragAnimalHomeGame from '@/components/game/DragAnimalHomeGame';
import DragBallToGoalGame from '@/components/game/DragBallToGoalGame';
import DragSlowlyGame from '@/components/game/DragSlowlyGame';
import FindTheOddOneOutGame from '@/components/game/FindTheOddOneOutGame';
import FollowTheArrowsGame from '@/components/game/FollowTheArrowsGame';
import { FollowTheBall } from '@/components/game/FollowTheBall';
import FollowTheLineGame from '@/components/game/FollowTheLineGame';
import GrowTheBalloonGame from '@/components/game/GrowTheBalloonGame';
import HoldTheButtonGame from '@/components/game/HoldTheButtonGame';
import HoldTheLightGame from '@/components/game/HoldTheLightGame';
import LaunchRocketGame from '@/components/game/LaunchRocketGame';
import MatchShapeToOutlineGame from '@/components/game/MatchShapeToOutlineGame';
import MovingSmallTargetGame from '@/components/game/MovingSmallTargetGame';
import BalloonPopGame from '@/components/game/MovingTargetTapGame'; // Game 3: Balloon Pop
import MultipleShrinkingTargetsGame from '@/components/game/MultipleShrinkingTargetsGame';
import MultipleSmallTargetsGame from '@/components/game/MultipleSmallTargetsGame';
import MultiTapFunGame from '@/components/game/MultiTapFunGame'; // Game 5: Multi-Tap Fun
import PinchAndDragGame from '@/components/game/PinchAndDragGame';
import PinchToOpenTreasureBoxGame from '@/components/game/PinchToOpenTreasureBoxGame';
import PinchToPopGame from '@/components/game/PinchToPopGame';
import PinchToResizeGame from '@/components/game/PinchToResizeGame';
import PuzzlePieceDragGame from '@/components/game/PuzzlePieceDragGame';
import RaceTheDotGame from '@/components/game/RaceTheDotGame';
import ShrinkingCircleTapGame from '@/components/game/ShrinkingCircleTapGame';
import ShrinkingObjectMovementGame from '@/components/game/ShrinkingObjectMovementGame';
import ShrinkingTargetGame from '@/components/game/ShrinkingTargetGame';
import ShrinkStopTapGame from '@/components/game/ShrinkStopTapGame';
import SlowThenFastGame from '@/components/game/SlowThenFastGame';
import SmallCircleTapGame from '@/components/game/SmallCircleTapGame';
import SquishTheJellyGame from '@/components/game/SquishTheJellyGame';
import TapAndHoldGame from '@/components/game/TapAndHoldGame'; // Game 4: Tap and Hold
import TapColoursInOrderGame from '@/components/game/TapColoursInOrderGame';
import TapFastGame from '@/components/game/TapFastGame';
import TapLightsInOrderGame from '@/components/game/TapLightsInOrderGame';
import TapOnlySmallTargetGame from '@/components/game/TapOnlySmallTargetGame'; // Level 2 Game 1: Small Circle Tap
import TapOnlyTheSmallestShapeGame from '@/components/game/TapOnlyTheSmallestShapeGame';
import TapRedCircleGame from '@/components/game/TapRedCircleGame';
import TapSlowlyGame from '@/components/game/TapSlowlyGame';
import TapTheBigOneGame from '@/components/game/TapTheBigOneGame';
import TapTheCenterOfTheTargetGame from '@/components/game/TapTheCenterOfTheTargetGame';
import TapTheHiddenSmallObjectGame from '@/components/game/TapTheHiddenSmallObjectGame';
import TapTheNumbersGame from '@/components/game/TapTheNumbersGame';
import TapTheShapeIShowYouGame from '@/components/game/TapTheShapeIShowYouGame';
import TapTheSmallOneGame from '@/components/game/TapTheSmallOneGame';
import TapWhenStarIsSmallestGame from '@/components/game/TapWhenStarIsSmallestGame';
import TapWithSoundGame from '@/components/game/TapWithSoundGame';
import TinyDotTapGame from '@/components/game/TinyDotTapGame';
import TrackThenTapSmallObjectGame from '@/components/game/TrackThenTapSmallObjectGame';
import TwoFingerSimultaneousTapGame from '@/components/game/TwoFingerSimultaneousTapGame';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type GameKey = 'menu' | 'follow-ball' | 'big-tap' | 'tap-red-circle' | 'game-3' | 'game-4' | 'game-5' | 'small-circle-tap' | 'tap-only-small' | 'shrinking-target' | 'track-then-tap' | 'multiple-small-targets' | 'tap-slowly' | 'tap-fast' | 'slow-then-fast' | 'tap-with-sound' | 'race-the-dot' | 'hold-the-button' | 'grow-the-balloon' | 'launch-rocket' | 'squish-the-jelly' | 'hold-the-light' | 'drag-ball-to-goal' | 'follow-the-line' | 'drag-animal-home' | 'drag-slowly' | 'puzzle-piece-drag' | 'tap-the-numbers' | 'tap-lights-in-order' | 'follow-the-arrows' | 'tap-colours-in-order' | 'tap-the-big-one' | 'tap-the-small-one' | 'tap-the-shape-i-show-you' | 'find-the-odd-one-out' | 'match-shape-to-outline' | 'tiny-dot-tap' | 'tap-the-center-of-the-target' | 'moving-small-target' | 'tap-only-the-smallest-shape' | 'tap-the-hidden-small-object' | 'shrinking-circle-tap' | 'tap-when-star-is-smallest' | 'shrink-stop-tap' | 'multiple-shrinking-targets' | 'shrinking-object-movement' | 'pinch-to-pop' | 'pinch-and-drag' | 'two-finger-simultaneous-tap' | 'pinch-to-resize' | 'pinch-to-open-treasure-box';

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

  // Level 1 Session 3 Game 1: Tap Slowly - available for OT Level 1 Session 3 ONLY
  const isTapSlowlyAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 3;

  // Level 1 Session 3 Game 2: Tap Fast - available for OT Level 1 Session 3 ONLY
  const isTapFastAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 3;

  // Level 1 Session 3 Game 3: Slow Then Fast - available for OT Level 1 Session 3 ONLY
  const isSlowThenFastAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 3;

  // Level 1 Session 3 Game 4: Tap With Sound - available for OT Level 1 Session 3 ONLY
  const isTapWithSoundAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 3;

  // Level 1 Session 3 Game 5: Race The Dot - available for OT Level 1 Session 3 ONLY
  const isRaceTheDotAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 3;

  // Level 1 Session 4 Game 1: Hold The Button - available for OT Level 1 Session 4
  const isHoldTheButtonAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 4;

  // Level 1 Session 4 Game 2: Grow The Balloon - available for OT Level 1 Session 4
  const isGrowTheBalloonAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 4;

  // Level 1 Session 4 Game 3: Launch Rocket - available for OT Level 1 Session 4
  const isLaunchRocketAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 4;

  // Level 1 Session 4 Game 4: Squish The Jelly - available for OT Level 1 Session 4
  const isSquishTheJellyAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 4;

  // Level 1 Session 4 Game 5: Hold The Light - available for OT Level 1 Session 4
  const isHoldTheLightAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 4;

  // Level 1 Session 5 Game 1: Drag Ball To Goal - available for OT Level 1 Session 5
  const isDragBallToGoalAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 5;

  // Level 1 Session 5 Game 2: Follow The Line - available for OT Level 1 Session 5
  const isFollowTheLineAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 5;

  // Level 1 Session 5 Game 3: Drag Animal Home - available for OT Level 1 Session 5
  const isDragAnimalHomeAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 5;

  // Level 1 Session 5 Game 4: Drag Slowly - available for OT Level 1 Session 5
  const isDragSlowlyAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 5;

  // Level 1 Session 5 Game 5: Puzzle Piece Drag - available for OT Level 1 Session 5
  const isPuzzlePieceDragAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 5;

  // Level 1 Session 6 Game 1: Tap The Numbers - available for OT Level 1 Session 6
  const isTapTheNumbersAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 6;

  // Level 1 Session 6 Game 2: Tap Lights In Order - available for OT Level 1 Session 6
  const isTapLightsInOrderAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 6;

  // Level 1 Session 6 Game 3: Follow The Arrows - available for OT Level 1 Session 6
  const isFollowTheArrowsAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 6;

  // Level 1 Session 6 Game 4: Tap Colours In Order - available for OT Level 1 Session 6
  const isTapColoursInOrderAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 6;

  // Level 1 Session 7 Game 1: Tap The Big One - available for OT Level 1 Session 7
  const isTapTheBigOneAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 7;

  // Level 1 Session 7 Game 2: Tap The Small One - available for OT Level 1 Session 7
  const isTapTheSmallOneAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 7;

  // Level 1 Session 7 Game 3: Tap The Shape I Show You - available for OT Level 1 Session 7
  const isTapTheShapeIShowYouAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 7;

  // Level 1 Session 7 Game 4: Find The Odd One Out - available for OT Level 1 Session 7
  const isFindTheOddOneOutAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 7;

  // Level 1 Session 7 Game 5: Match Shape To Outline - available for OT Level 1 Session 7
  const isMatchShapeToOutlineAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 7;

  // Level 1 Session 8 Game 1: Tiny Dot Tap - available for OT Level 1 Session 8
  const isTinyDotTapAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 8;

  // Level 1 Session 8 Game 2: Tap The Center Of The Target - available for OT Level 1 Session 8
  const isTapTheCenterOfTheTargetAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 8;

  // Level 1 Session 8 Game 3: Moving Small Target - available for OT Level 1 Session 8
  const isMovingSmallTargetAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 8;

  // Level 1 Session 8 Game 4: Tap Only The Smallest Shape - available for OT Level 1 Session 8
  const isTapOnlyTheSmallestShapeAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 8;

  // Level 1 Session 8 Game 5: Tap The Hidden Small Object - available for OT Level 1 Session 8
  const isTapTheHiddenSmallObjectAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 8;

  // Level 1 Session 9 Game 1: Shrinking Circle Tap - available for OT Level 1 Session 9
  const isShrinkingCircleTapAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 9;

  // Level 1 Session 9 Game 2: Tap When Star Is Smallest - available for OT Level 1 Session 9
  const isTapWhenStarIsSmallestAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 9;

  // Level 1 Session 9 Game 3: Shrink Stop Tap - available for OT Level 1 Session 9
  const isShrinkStopTapAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 9;

  // Level 1 Session 9 Game 4: Multiple Shrinking Targets - available for OT Level 1 Session 9
  const isMultipleShrinkingTargetsAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 9;

  // Level 1 Session 9 Game 5: Shrinking Object + Movement - available for OT Level 1 Session 9
  const isShrinkingObjectMovementAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 9;

  // Level 1 Session 10 Game 1: Pinch to Pop - available for OT Level 1 Session 10
  const isPinchToPopAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 10;

  // Level 1 Session 10 Game 2: Pinch and Drag - available for OT Level 1 Session 10
  const isPinchAndDragAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 10;

  // Level 1 Session 10 Game 3: Two-Finger Simultaneous Tap - available for OT Level 1 Session 10
  const isTwoFingerSimultaneousTapAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 10;

  // Level 1 Session 10 Game 4: Pinch to Resize - available for OT Level 1 Session 10
  const isPinchToResizeAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 10;

  // Level 1 Session 10 Game 5: Pinch to Open Treasure Box - available for OT Level 1 Session 10
  const isPinchToOpenTreasureBoxAvailable =
    therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 10;

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
    {
      id: 'tap-with-sound',
      title: 'Tap With Sound',
      emoji: '🥁',
      description: 'Listen to the drum beat and tap with it! Start slow, then tap fast. Build rhythm and motor synchronization.',
      color: '#3B82F6',
      available: isTapWithSoundAvailable,
    },
    {
      id: 'race-the-dot',
      title: 'Race The Dot',
      emoji: '🏁',
      description: 'Tap to keep the dot moving! Race to the goal. Build visual tracking, speed modulation, and motor planning.',
      color: '#F59E0B',
      available: isRaceTheDotAvailable,
    },
    {
      id: 'hold-the-button',
      title: 'Hold The Button',
      emoji: '✅',
      description: 'Press and hold until the ring fills completely. Release when you see the green flash! Build sustained finger pressure and timing control.',
      color: '#3B82F6',
      available: isHoldTheButtonAvailable,
    },
    {
      id: 'grow-the-balloon',
      title: 'Grow The Balloon',
      emoji: '🎈',
      description: 'Press and hold to inflate the balloon. Release when its big to make it float! Build visual-motor mapping and finger endurance.',
      color: '#EF4444',
      available: isGrowTheBalloonAvailable,
    },
    {
      id: 'launch-rocket',
      title: 'Launch Rocket',
      emoji: '🚀',
      description: 'Press and hold to fill the fuel bar. Release when full to launch! Build force + duration control and delayed gratification.',
      color: '#F59E0B',
      available: isLaunchRocketAvailable,
    },
    {
      id: 'squish-the-jelly',
      title: 'Squish The Jelly',
      emoji: '🍮',
      description: 'Press and hold to compress the jelly. Release to let it spring back! Build proprioception and force regulation.',
      color: '#8B5CF6',
      available: isSquishTheJellyAvailable,
    },
    {
      id: 'hold-the-light',
      title: 'Hold The Light',
      emoji: '💡',
      description: 'Press and hold to make the bulb glow brighter. Release at full brightness! Build timing modulation and sustained attention.',
      color: '#FCD34D',
      available: isHoldTheLightAvailable,
    },
    {
      id: 'drag-ball-to-goal',
      title: 'Drag The Ball To The Goal',
      emoji: '⚽',
      description: 'Press the ball and drag it to the goal box. Release when it\'s inside! Build drag initiation and directionality.',
      color: '#3B82F6',
      available: isDragBallToGoalAvailable,
    },
    {
      id: 'follow-the-line',
      title: 'Follow The Line',
      emoji: '📏',
      description: 'Drag the object along the thick line from start to end. Stay on the line! This is the first step toward writing strokes.',
      color: '#22C55E',
      available: isFollowTheLineAvailable,
    },
    {
      id: 'drag-animal-home',
      title: 'Drag The Animal Home',
      emoji: '🏠',
      description: 'Drag the animal to its home! Match the animal with its home. Build directional drag and spatial planning.',
      color: '#FCD34D',
      available: isDragAnimalHomeAvailable,
    },
    {
      id: 'drag-slowly',
      title: 'Drag Slowly',
      emoji: '🐌',
      description: 'Drag the bar slowly along the path. Watch the speed meter! Build controlled movement and proprioception.',
      color: '#8B5CF6',
      available: isDragSlowlyAvailable,
    },
    {
      id: 'puzzle-piece-drag',
      title: 'Puzzle Piece Drag',
      emoji: '🧩',
      description: 'Drag the puzzle piece to its matching outline. Match the shapes! Build spatial problem solving and visual perception.',
      color: '#F59E0B',
      available: isPuzzlePieceDragAvailable,
    },
    {
      id: 'tap-the-numbers',
      title: 'Tap The Numbers',
      emoji: '🔢',
      description: 'Tap the numbers in order: 1, then 2, then 3! Build early sequencing and number-order foundation.',
      color: '#3B82F6',
      available: isTapTheNumbersAvailable,
    },
    {
      id: 'tap-lights-in-order',
      title: 'Tap The Lights In Order',
      emoji: '💡',
      description: 'Watch the shapes blink in sequence, then tap them in the same order! Build visual memory and attention to order.',
      color: '#FCD34D',
      available: isTapLightsInOrderAvailable,
    },
    {
      id: 'follow-the-arrows',
      title: 'Follow The Arrows',
      emoji: '➡️',
      description: 'Watch the arrow sequence, then tap them in the same order! Build early spatial sequencing and directional recall.',
      color: '#22C55E',
      available: isFollowTheArrowsAvailable,
    },
    {
      id: 'tap-colours-in-order',
      title: 'Tap Colours In Order',
      emoji: '🎨',
      description: 'Watch the color sequence, then tap them in the same order! Colors change positions each time. Build sequencing and colour discrimination.',
      color: '#8B5CF6',
      available: isTapColoursInOrderAvailable,
    },
    {
      id: 'tap-the-big-one',
      title: 'Tap The Big One',
      emoji: '🎯',
      description: 'Watch the big circle glow, then tap it! Build size discrimination and target accuracy.',
      color: '#3B82F6',
      available: isTapTheBigOneAvailable,
    },
    {
      id: 'tap-the-small-one',
      title: 'Tap The Small One',
      emoji: '🔍',
      description: 'Find and tap the smallest shape! Size changes each round. Build scale discrimination and fine-motor precision.',
      color: '#22C55E',
      available: isTapTheSmallOneAvailable,
    },
    {
      id: 'tap-the-shape-i-show-you',
      title: 'Tap The Shape I Show You',
      emoji: '🎯',
      description: 'Watch the shape, then find and tap the matching one! Build shape recognition and working memory.',
      color: '#F59E0B',
      available: isTapTheShapeIShowYouAvailable,
    },
    {
      id: 'find-the-odd-one-out',
      title: 'Find The Odd One Out',
      emoji: '🔍',
      description: 'Find the item that\'s different from the others! Build figure-ground perception and discrimination.',
      color: '#EF4444',
      available: isFindTheOddOneOutAvailable,
    },
    {
      id: 'match-shape-to-outline',
      title: 'Match Shape To Outline',
      emoji: '🧩',
      description: 'Match the shape to the outline! Build spatial reasoning and early puzzle foundation.',
      color: '#8B5CF6',
      available: isMatchShapeToOutlineAvailable,
    },
    {
      id: 'tiny-dot-tap',
      title: 'Tiny Dot Tap',
      emoji: '🎯',
      description: 'Tap the tiny dot accurately! Build fine-target accuracy and controlled finger movement.',
      color: '#EF4444',
      available: isTinyDotTapAvailable,
    },
    {
      id: 'tap-the-center-of-the-target',
      title: 'Tap The Center Of The Target',
      emoji: '🎯',
      description: 'Tap the center dot, not the outer ring! Build spatial precision and accuracy grading.',
      color: '#3B82F6',
      available: isTapTheCenterOfTheTargetAvailable,
    },
    {
      id: 'moving-small-target',
      title: 'Moving Small Target',
      emoji: '🎯',
      description: 'Tap the tiny shape when it passes through the green zone! Build dynamic accuracy and timing.',
      color: '#10B981',
      available: isMovingSmallTargetAvailable,
    },
    {
      id: 'tap-only-the-smallest-shape',
      title: 'Tap Only The Smallest Shape',
      emoji: '🔍',
      description: 'Find and tap the smallest shape! Build precision, discrimination, and selective control.',
      color: '#8B5CF6',
      available: isTapOnlyTheSmallestShapeAvailable,
    },
    {
      id: 'tap-the-hidden-small-object',
      title: 'Tap The Hidden Small Object',
      emoji: '🔍',
      description: 'Scan the pattern and find the tiny hidden object! Build visual scanning and figure-ground perception.',
      color: '#F59E0B',
      available: isTapTheHiddenSmallObjectAvailable,
    },
    {
      id: 'shrinking-circle-tap',
      title: 'Shrinking Circle Tap',
      emoji: '⭕',
      description: 'Tap the circle before it disappears! Build timing, precision, focus, and motor inhibition.',
      color: '#3B82F6',
      available: isShrinkingCircleTapAvailable,
    },
    {
      id: 'tap-when-star-is-smallest',
      title: 'Tap When Star Is Smallest',
      emoji: '⭐',
      description: 'Wait until the star reaches its smallest size, then tap! Build delayed tapping and controlled timing.',
      color: '#FCD34D',
      available: isTapWhenStarIsSmallestAvailable,
    },
    {
      id: 'shrink-stop-tap',
      title: 'Shrink → Stop → Tap',
      emoji: '⏸️',
      description: 'Wait for the object to stop shrinking, then tap! Build visual waiting and precise finger control.',
      color: '#8B5CF6',
      available: isShrinkStopTapAvailable,
    },
    {
      id: 'multiple-shrinking-targets',
      title: 'Multiple Shrinking Targets',
      emoji: '🎯',
      description: 'Watch all 3 shapes shrink! Tap the one that stops glowing! Build discrimination and selective attention.',
      color: '#EF4444',
      available: isMultipleShrinkingTargetsAvailable,
    },
    {
      id: 'shrinking-object-movement',
      title: 'Shrinking Object + Movement',
      emoji: '🐝',
      description: 'Track the moving object as it shrinks and tap it! Build dynamic targeting and visuomotor integration.',
      color: '#FCD34D',
      available: isShrinkingObjectMovementAvailable,
    },
    {
      id: 'pinch-to-pop',
      title: 'Pinch to Pop',
      emoji: '🎈',
      description: 'Use two fingers to pinch the balloon and pop it! Build pinch strength and two-finger coordination.',
      color: '#EF4444',
      available: isPinchToPopAvailable,
    },
    {
      id: 'pinch-and-drag',
      title: 'Pinch and Drag',
      emoji: '🎯',
      description: 'Pinch the object and drag it to the goal! Build pinch stability and drag coordination.',
      color: '#3B82F6',
      available: isPinchAndDragAvailable,
    },
    {
      id: 'two-finger-simultaneous-tap',
      title: 'Two-Finger Simultaneous Tap',
      emoji: '⭐',
      description: 'Tap both targets at the same time! Build bilateral finger coordination and synchronization.',
      color: '#FCD34D',
      available: isTwoFingerSimultaneousTapAvailable,
    },
    {
      id: 'pinch-to-resize',
      title: 'Pinch to Resize',
      emoji: '🎈',
      description: 'Pinch to shrink, spread to grow! Match the target size. Build controlled pinch & stretch skills.',
      color: '#8B5CF6',
      available: isPinchToResizeAvailable,
    },
    {
      id: 'pinch-to-open-treasure-box',
      title: 'Pinch to Open Treasure Box',
      emoji: '📦',
      description: 'Pinch both locks at the same time to open the treasure! Build bimanual coordination.',
      color: '#92400E',
      available: isPinchToOpenTreasureBoxAvailable,
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

  if (currentGame === 'tap-with-sound') {
    return <TapWithSoundGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'race-the-dot') {
    return <RaceTheDotGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'hold-the-button') {
    return <HoldTheButtonGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'grow-the-balloon') {
    return <GrowTheBalloonGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'launch-rocket') {
    return <LaunchRocketGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'squish-the-jelly') {
    return <SquishTheJellyGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'hold-the-light') {
    return <HoldTheLightGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'drag-ball-to-goal') {
    return <DragBallToGoalGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'follow-the-line') {
    return <FollowTheLineGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'drag-animal-home') {
    return <DragAnimalHomeGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'drag-slowly') {
    return <DragSlowlyGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'puzzle-piece-drag') {
    return <PuzzlePieceDragGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'tap-the-numbers') {
    return <TapTheNumbersGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'tap-lights-in-order') {
    return <TapLightsInOrderGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'follow-the-arrows') {
    return <FollowTheArrowsGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'tap-colours-in-order') {
    return <TapColoursInOrderGame onBack={() => setCurrentGame('menu')} />;
  }

  // if (currentGame === 'tap-the-big-one') {
  //   return <TapTheBigOneGame onBack={() => setCurrentGame('menu')} />;
  // }

  // if (currentGame === 'tap-the-small-one') {
  //   return <TapTheSmallOneGame onBack={() => setCurrentGame('menu')} />;
  // }

  // if (currentGame === 'tap-the-shape-i-show-you') {
  //   return <TapTheShapeIShowYouGame onBack={() => setCurrentGame('menu')} />;
  // }

  // if (currentGame === 'find-the-odd-one-out') {
  //   return <FindTheOddOneOutGame onBack={() => setCurrentGame('menu')} />;
  // }

  // if (currentGame === 'match-shape-to-outline') {
  //   return <MatchShapeToOutlineGame onBack={() => setCurrentGame('menu')} />;
  // }

  // if (currentGame === 'tiny-dot-tap') {
  //   return <TinyDotTapGame onBack={() => setCurrentGame('menu')} />;
  // }

  // if (currentGame === 'tap-the-center-of-the-target') {
  //   return <TapTheCenterOfTheTargetGame onBack={() => setCurrentGame('menu')} />;
  // }

  // if (currentGame === 'moving-small-target') {
  //   return <MovingSmallTargetGame onBack={() => setCurrentGame('menu')} />;
  // }

  // if (currentGame === 'tap-only-the-smallest-shape') {
  //   return <TapOnlyTheSmallestShapeGame onBack={() => setCurrentGame('menu')} />;
  // }

  // if (currentGame === 'tap-the-hidden-small-object') {
  //   return <TapTheHiddenSmallObjectGame onBack={() => setCurrentGame('menu')} />;
  // }

  // if (currentGame === 'shrinking-circle-tap') {
  //   return <ShrinkingCircleTapGame onBack={() => setCurrentGame('menu')} />;
  // }

  // if (currentGame === 'tap-when-star-is-smallest') {
  //   return <TapWhenStarIsSmallestGame onBack={() => setCurrentGame('menu')} />;
  // }

  // if (currentGame === 'shrink-stop-tap') {
  //   return <ShrinkStopTapGame onBack={() => setCurrentGame('menu')} />;
  // }

  // if (currentGame === 'multiple-shrinking-targets') {
  //   return <MultipleShrinkingTargetsGame onBack={() => setCurrentGame('menu')} />;
  // }

  // if (currentGame === 'shrinking-object-movement') {
  //   return <ShrinkingObjectMovementGame onBack={() => setCurrentGame('menu')} />;
  // }

  // if (currentGame === 'pinch-to-pop') {
  //   return <PinchToPopGame onBack={() => setCurrentGame('menu')} />;
  // }

  // if (currentGame === 'pinch-and-drag') {
  //   return <PinchAndDragGame onBack={() => setCurrentGame('menu')} />;
  // }

  // if (currentGame === 'two-finger-simultaneous-tap') {
  //   return <TwoFingerSimultaneousTapGame onBack={() => setCurrentGame('menu')} />;
  // }

  // if (currentGame === 'pinch-to-resize') {
  //   return <PinchToResizeGame onBack={() => setCurrentGame('menu')} />;
  // }

  // if (currentGame === 'pinch-to-open-treasure-box') {
  //   return <PinchToOpenTreasureBoxGame onBack={() => setCurrentGame('menu')} />;
  // }

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
                  if (game.id === 'tap-with-sound') setCurrentGame('tap-with-sound');
                  if (game.id === 'race-the-dot') setCurrentGame('race-the-dot');
                  if (game.id === 'hold-the-button') setCurrentGame('hold-the-button');
                  if (game.id === 'grow-the-balloon') setCurrentGame('grow-the-balloon');
                  if (game.id === 'launch-rocket') setCurrentGame('launch-rocket');
                  if (game.id === 'squish-the-jelly') setCurrentGame('squish-the-jelly');
                  if (game.id === 'hold-the-light') setCurrentGame('hold-the-light');
                  if (game.id === 'drag-ball-to-goal') setCurrentGame('drag-ball-to-goal');
                  if (game.id === 'follow-the-line') setCurrentGame('follow-the-line');
                  if (game.id === 'drag-animal-home') setCurrentGame('drag-animal-home');
                  if (game.id === 'drag-slowly') setCurrentGame('drag-slowly');
                  if (game.id === 'puzzle-piece-drag') setCurrentGame('puzzle-piece-drag');
                  if (game.id === 'tap-the-numbers') setCurrentGame('tap-the-numbers');
                  if (game.id === 'tap-lights-in-order') setCurrentGame('tap-lights-in-order');
                  if (game.id === 'follow-the-arrows') setCurrentGame('follow-the-arrows');
                  if (game.id === 'tap-colours-in-order') setCurrentGame('tap-colours-in-order');
                  // if (game.id === 'tap-the-big-one') setCurrentGame('tap-the-big-one');
                  // if (game.id === 'tap-the-small-one') setCurrentGame('tap-the-small-one');
                  // if (game.id === 'tap-the-shape-i-show-you') setCurrentGame('tap-the-shape-i-show-you');
                  // if (game.id === 'find-the-odd-one-out') setCurrentGame('find-the-odd-one-out');
                  // if (game.id === 'match-shape-to-outline') setCurrentGame('match-shape-to-outline');
                  // if (game.id === 'tiny-dot-tap') setCurrentGame('tiny-dot-tap');
                  // if (game.id === 'tap-the-center-of-the-target') setCurrentGame('tap-the-center-of-the-target');
                  // if (game.id === 'moving-small-target') setCurrentGame('moving-small-target');
                  // if (game.id === 'tap-only-the-smallest-shape') setCurrentGame('tap-only-the-smallest-shape');
                  // if (game.id === 'tap-the-hidden-small-object') setCurrentGame('tap-the-hidden-small-object');
                  // if (game.id === 'shrinking-circle-tap') setCurrentGame('shrinking-circle-tap');
                  // if (game.id === 'tap-when-star-is-smallest') setCurrentGame('tap-when-star-is-smallest');
                  // if (game.id === 'shrink-stop-tap') setCurrentGame('shrink-stop-tap');
                  // if (game.id === 'multiple-shrinking-targets') setCurrentGame('multiple-shrinking-targets');
                  // if (game.id === 'shrinking-object-movement') setCurrentGame('shrinking-object-movement');
                  // if (game.id === 'pinch-to-pop') setCurrentGame('pinch-to-pop');
                  // if (game.id === 'pinch-and-drag') setCurrentGame('pinch-and-drag');
                  // if (game.id === 'two-finger-simultaneous-tap') setCurrentGame('two-finger-simultaneous-tap');
                  // if (game.id === 'pinch-to-resize') setCurrentGame('pinch-to-resize');
                  // if (game.id === 'pinch-to-open-treasure-box') setCurrentGame('pinch-to-open-treasure-box');
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
