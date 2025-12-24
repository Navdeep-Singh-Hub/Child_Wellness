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
// import ShrinkingTargetGame from '@/components/game/ShrinkingTargetGame';
import AntTrailFollowGame from '@/components/game/AntTrailFollowGame';
import BallRollPathGame from '@/components/game/BallRollPathGame';
import ConnectInOrderGlowGame from '@/components/game/ConnectInOrderGlowGame';
import CurvyRoadDriveGame from '@/components/game/CurvyRoadDriveGame';
import DontTouchGrassGame from '@/components/game/DontTouchGrassGame';
import DotToDotAnimalGame from '@/components/game/DotToDotAnimalGame';
import { FollowAndTouchGame } from '@/components/game/FollowAndTouchGame';
import HiddenShapeRevealGame from '@/components/game/HiddenShapeRevealGame';
import HouseDrawingGame from '@/components/game/HouseDrawingGame';
import LightningBoltGame from '@/components/game/LightningBoltGame';
import { MatchAndTouchGame } from '@/components/game/MatchAndTouchGame';
import MazeWalkGame from '@/components/game/MazeWalkGame';
import MoonPathGame from '@/components/game/MoonPathGame';
import MountainClimbGame from '@/components/game/MountainClimbGame';
// import RainbowTraceGame from '@/components/game/RainbowTraceGame'; // File is empty
import RiverBoatGuideGame from '@/components/game/RiverBoatGuideGame';
import RobotWireFixGame from '@/components/game/RobotWireFixGame';
import SawPathGame from '@/components/game/SawPathGame';
import ShrinkStopTapGame from '@/components/game/ShrinkStopTapGame';
import SlowThenFastGame from '@/components/game/SlowThenFastGame';
import SmallCircleTapGame from '@/components/game/SmallCircleTapGame';
import SmileMakerGame from '@/components/game/SmileMakerGame';
import SnakeSlideGame from '@/components/game/SnakeSlideGame';
import SquishTheJellyGame from '@/components/game/SquishTheJellyGame';
import StarBuilderGame from '@/components/game/StarBuilderGame';
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
import { TapWhereItLightsUpGame } from '@/components/game/TapWhereItLightsUpGame';
import TapWithSoundGame from '@/components/game/TapWithSoundGame';
import TinyDotTapGame from '@/components/game/TinyDotTapGame';
import { TouchTheDotGame } from '@/components/game/TouchTheDotGame';
import TrackThenTapSmallObjectGame from '@/components/game/TrackThenTapSmallObjectGame';
import TwoFingerSimultaneousTapGame from '@/components/game/TwoFingerSimultaneousTapGame';
import { WhereIsItGame } from '@/components/game/WhereIsItGame';
import ZigZagRaceGame from '@/components/game/ZigZagRaceGame';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type GameKey = 'menu' | 'follow-ball' | 'big-tap' | 'tap-red-circle' | 'game-3' | 'game-4' | 'game-5' | 'small-circle-tap' | 'tap-only-small' | 'shrinking-target' | 'track-then-tap' | 'multiple-small-targets' | 'tap-slowly' | 'tap-fast' | 'slow-then-fast' | 'tap-with-sound' | 'race-the-dot' | 'hold-the-button' | 'grow-the-balloon' | 'launch-rocket' | 'squish-the-jelly' | 'hold-the-light' | 'drag-ball-to-goal' | 'follow-the-line' | 'drag-animal-home' | 'drag-slowly' | 'puzzle-piece-drag' | 'tap-the-numbers' | 'tap-lights-in-order' | 'follow-the-arrows' | 'tap-colours-in-order' | 'tap-the-big-one' | 'tap-the-small-one' | 'tap-the-shape-i-show-you' | 'find-the-odd-one-out' | 'match-shape-to-outline' | 'tiny-dot-tap' | 'tap-the-center-of-the-target' | 'moving-small-target' | 'tap-only-the-smallest-shape' | 'tap-the-hidden-small-object' | 'shrinking-circle-tap' | 'tap-when-star-is-smallest' | 'shrink-stop-tap' | 'multiple-shrinking-targets' | 'shrinking-object-movement' | 'pinch-to-pop' | 'pinch-and-drag' | 'two-finger-simultaneous-tap' | 'pinch-to-resize' | 'pinch-to-open-treasure-box' | 'touch-the-dot' | 'where-is-it' | 'follow-and-touch' | 'tap-where-it-lights-up' | 'match-and-touch' | 'rainbow-trace' | 'snake-slide' | 'moon-path' | 'smile-maker' | 'curvy-road-drive' | 'mountain-climb' | 'lightning-bolt' | 'saw-path' | 'robot-wire-fix' | 'zig-zag-race' | 'maze-walk' | 'river-boat-guide' | 'ant-trail-follow' | 'ball-roll-path' | 'dont-touch-grass' | 'dot-to-dot-animal' | 'star-builder' | 'house-drawing' | 'hidden-shape-reveal' | 'connect-in-order-glow' | 'puzzle-drop-shapes' | 'shadow-match' | 'cookie-cutter-match' | 'parking-shapes' | 'fast-match' | 'big-circle-trace' | 'big-square-walk' | 'triangle-mountain-trace' | 'paint-the-shape' | 'glow-border-trace' | 'tiny-circle-coins' | 'mini-square-locks' | 'dot-border-shapes' | 'careful-trace-challenge' | 'shrink-mode-trace' | 'copy-the-line-pattern' | 'block-pattern-copy' | 'color-pattern-match' | 'stick-design-copy' | 'look-hide-draw' | 'mirror-line-draw' | 'butterfly-wings' | 'face-symmetry-draw' | 'half-shape-complete' | 'mirror-maze';

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

  // OT Level 11 (Section 2: Visual-Motor Integration) - mapped to therapy level 2
  // Level 11 Session 1 Game 1: Touch the Dot
  const isTouchTheDotAvailable =
    therapyId === 'occupational' && levelNumber === 2 && sessionNumber === 1;

  // Level 11 Session 1 Game 2: Where Is It?
  const isWhereIsItAvailable =
    therapyId === 'occupational' && levelNumber === 2 && sessionNumber === 1;

  // Level 11 Session 1 Game 3: Follow and Touch
  const isFollowAndTouchAvailable =
    therapyId === 'occupational' && levelNumber === 2 && sessionNumber === 1;

  // Level 11 Session 1 Game 4: Tap Where It Lights Up
  const isTapWhereItLightsUpAvailable =
    therapyId === 'occupational' && levelNumber === 2 && sessionNumber === 1;

  // Level 11 Session 1 Game 5: Match & Touch
  const isMatchAndTouchAvailable =
    therapyId === 'occupational' && levelNumber === 2 && sessionNumber === 1;

  // Level 2 Session 2: Trace Curved Line games
  const isRainbowTraceAvailable =
    therapyId === 'occupational' && levelNumber === 2 && sessionNumber === 2;

  const isSnakeSlideAvailable =
    therapyId === 'occupational' && levelNumber === 2 && sessionNumber === 2;

  const isMoonPathAvailable =
    therapyId === 'occupational' && levelNumber === 2 && sessionNumber === 2;

  const isSmileMakerAvailable =
    therapyId === 'occupational' && levelNumber === 2 && sessionNumber === 2;

  const isCurvyRoadDriveAvailable =
    therapyId === 'occupational' && levelNumber === 2 && sessionNumber === 2;

  // Level 2 Session 3: Trace Zig-Zag games
  const isMountainClimbAvailable =
    therapyId === 'occupational' && levelNumber === 2 && sessionNumber === 3;

  const isLightningBoltAvailable =
    therapyId === 'occupational' && levelNumber === 2 && sessionNumber === 3;

  const isSawPathAvailable =
    therapyId === 'occupational' && levelNumber === 2 && sessionNumber === 3;

  const isRobotWireFixAvailable =
    therapyId === 'occupational' && levelNumber === 2 && sessionNumber === 3;

  const isZigZagRaceAvailable =
    therapyId === 'occupational' && levelNumber === 2 && sessionNumber === 3;

  // Level 2 Session 4: Follow Path (Drag) games
  const isMazeWalkAvailable =
    therapyId === 'occupational' && levelNumber === 2 && sessionNumber === 4;

  const isRiverBoatGuideAvailable =
    therapyId === 'occupational' && levelNumber === 2 && sessionNumber === 4;

  const isAntTrailFollowAvailable =
    therapyId === 'occupational' && levelNumber === 2 && sessionNumber === 4;

  const isBallRollPathAvailable =
    therapyId === 'occupational' && levelNumber === 2 && sessionNumber === 4;

  const isDontTouchGrassAvailable =
    therapyId === 'occupational' && levelNumber === 2 && sessionNumber === 4;

  // Level 2 Session 5: Connect Dots games
  const isDotToDotAnimalAvailable =
    therapyId === 'occupational' && levelNumber === 2 && sessionNumber === 5;

  const isStarBuilderAvailable =
    therapyId === 'occupational' && levelNumber === 2 && sessionNumber === 5;

  const isHouseDrawingAvailable =
    therapyId === 'occupational' && levelNumber === 2 && sessionNumber === 5;

  const isHiddenShapeRevealAvailable =
    therapyId === 'occupational' && levelNumber === 2 && sessionNumber === 5;

  const isConnectInOrderGlowAvailable =
    therapyId === 'occupational' && levelNumber === 2 && sessionNumber === 5;

  // Level 2 Session 6: Match Shape Outline games
  const isPuzzleDropShapesAvailable =
    therapyId === 'occupational' && levelNumber === 2 && sessionNumber === 6;

  const isShadowMatchAvailable =
    therapyId === 'occupational' && levelNumber === 2 && sessionNumber === 6;

  const isCookieCutterMatchAvailable =
    therapyId === 'occupational' && levelNumber === 2 && sessionNumber === 6;

  const isParkingShapesAvailable =
    therapyId === 'occupational' && levelNumber === 2 && sessionNumber === 6;

  const isFastMatchAvailable =
    therapyId === 'occupational' && levelNumber === 2 && sessionNumber === 6;

  // Level 2 Session 7: Trace Large Shapes games
  const isBigCircleTraceAvailable =
    therapyId === 'occupational' && levelNumber === 2 && sessionNumber === 7;
  const isBigSquareWalkAvailable =
    therapyId === 'occupational' && levelNumber === 2 && sessionNumber === 7;
  const isTriangleMountainTraceAvailable =
    therapyId === 'occupational' && levelNumber === 2 && sessionNumber === 7;
  const isPaintTheShapeAvailable =
    therapyId === 'occupational' && levelNumber === 2 && sessionNumber === 7;
  const isGlowBorderTraceAvailable =
    therapyId === 'occupational' && levelNumber === 2 && sessionNumber === 7;

  // Level 2 Session 8: Trace Small Shapes games
  const isTinyCircleCoinsAvailable =
    therapyId === 'occupational' && levelNumber === 2 && sessionNumber === 8;
  const isMiniSquareLocksAvailable =
    therapyId === 'occupational' && levelNumber === 2 && sessionNumber === 8;
  const isDotBorderShapesAvailable =
    therapyId === 'occupational' && levelNumber === 2 && sessionNumber === 8;
  const isCarefulTraceChallengeAvailable =
    therapyId === 'occupational' && levelNumber === 2 && sessionNumber === 8;
  const isShrinkModeTraceAvailable =
    therapyId === 'occupational' && levelNumber === 2 && sessionNumber === 8;

  // Level 2 Session 9: Copy Simple Patterns games
  const isCopyTheLinePatternAvailable =
    therapyId === 'occupational' && levelNumber === 2 && sessionNumber === 9;
  const isBlockPatternCopyAvailable =
    therapyId === 'occupational' && levelNumber === 2 && sessionNumber === 9;
  const isColorPatternMatchAvailable =
    therapyId === 'occupational' && levelNumber === 2 && sessionNumber === 9;
  const isStickDesignCopyAvailable =
    therapyId === 'occupational' && levelNumber === 2 && sessionNumber === 9;
  const isLookHideDrawAvailable =
    therapyId === 'occupational' && levelNumber === 2 && sessionNumber === 9;

  // Level 2 Session 10: Mirror Drawing Basics games
  const isMirrorLineDrawAvailable =
    therapyId === 'occupational' && levelNumber === 2 && sessionNumber === 10;
  const isButterflyWingsAvailable =
    therapyId === 'occupational' && levelNumber === 2 && sessionNumber === 10;
  const isFaceSymmetryDrawAvailable =
    therapyId === 'occupational' && levelNumber === 2 && sessionNumber === 10;
  const isHalfShapeCompleteAvailable =
    therapyId === 'occupational' && levelNumber === 2 && sessionNumber === 10;
  const isMirrorMazeAvailable =
    therapyId === 'occupational' && levelNumber === 2 && sessionNumber === 10;

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
    // OT Level 11 (Section 2: Visual-Motor Integration) Games
    {
      id: 'touch-the-dot',
      title: 'Touch the Dot',
      emoji: '🔵',
      description: 'A large dot appears at random positions. Tap it to earn a star! Build eye-hand coordination.',
      color: '#22C55E',
      available: isTouchTheDotAvailable,
    },
    {
      id: 'where-is-it',
      title: 'Where Is It?',
      emoji: '🔍',
      description: 'Find and tap the star hidden among the background pattern. Build visual scanning and attention.',
      color: '#F59E0B',
      available: isWhereIsItAvailable,
    },
    {
      id: 'follow-and-touch',
      title: 'Follow and Touch',
      emoji: '👀',
      description: 'Watch the object move slowly, then tap it when it stops. Build visual tracking and motor timing.',
      color: '#3B82F6',
      available: isFollowAndTouchAvailable,
    },
    {
      id: 'tap-where-it-lights-up',
      title: 'Tap Where It Lights Up',
      emoji: '💡',
      description: 'Watch which shape lights up, then tap it after they all go neutral. Build visual memory.',
      color: '#8B5CF6',
      available: isTapWhereItLightsUpAvailable,
    },
    {
      id: 'match-and-touch',
      title: 'Match & Touch',
      emoji: '🎯',
      description: 'See the shape at the top, then find and tap the matching one below. Build shape recognition.',
      color: '#F472B6',
      available: isMatchAndTouchAvailable,
    },
    // Level 2 Session 2: Trace Curved Line games
    {
      id: 'rainbow-trace',
      title: 'Rainbow Trace',
      emoji: '🌈',
      description: 'Follow the arc to complete the rainbow. Build smooth curved tracking skills!',
      color: '#FF6B6B',
      available: isRainbowTraceAvailable,
    },
    {
      id: 'snake-slide',
      title: 'Snake Slide',
      emoji: '🐍',
      description: 'Follow the smooth curved motion path. Keep your wrist movement smooth!',
      color: '#10B981',
      available: isSnakeSlideAvailable,
    },
    {
      id: 'moon-path',
      title: 'Moon Path',
      emoji: '🌙',
      description: 'Trace the semi-circle moon path. Practice smooth curved motion!',
      color: '#FBBF24',
      available: isMoonPathAvailable,
    },
    {
      id: 'smile-maker',
      title: 'Smile Maker',
      emoji: '😊',
      description: 'Trace the curve to form a smile. Build smooth wrist movement!',
      color: '#F59E0B',
      available: isSmileMakerAvailable,
    },
    {
      id: 'curvy-road-drive',
      title: 'Curvy Road Drive',
      emoji: '🚗',
      description: 'Drive along the curvy road! The car slows if you cross the line.',
      color: '#3B82F6',
      available: isCurvyRoadDriveAvailable,
    },
    // Level 2 Session 3: Trace Zig-Zag games
    {
      id: 'mountain-climb',
      title: 'Mountain Climb',
      emoji: '⛰️',
      description: 'Follow the zig-zag path up the mountain. Change direction smoothly!',
      color: '#F59E0B',
      available: isMountainClimbAvailable,
    },
    {
      id: 'lightning-bolt',
      title: 'Lightning Bolt',
      emoji: '⚡',
      description: 'Trace the lightning bolt with sharp angles. Follow the zig-zag!',
      color: '#FBBF24',
      available: isLightningBoltAvailable,
    },
    {
      id: 'saw-path',
      title: 'Saw Path',
      emoji: '🪚',
      description: 'Follow the up-down saw path. Controlled motion left to right!',
      color: '#10B981',
      available: isSawPathAvailable,
    },
    {
      id: 'robot-wire-fix',
      title: 'Robot Wire Fix',
      emoji: '🤖',
      description: 'Follow the zig-zag wire to fix the robot! Trace carefully.',
      color: '#8B5CF6',
      available: isRobotWireFixAvailable,
    },
    {
      id: 'zig-zag-race',
      title: 'Zig-Zag Race',
      emoji: '🏁',
      description: 'Race along the zig-zag path! Timed but slow-paced.',
      color: '#EF4444',
      available: isZigZagRaceAvailable,
    },
    // Level 2 Session 4: Follow Path (Drag) games
    {
      id: 'maze-walk',
      title: 'Maze Walk',
      emoji: '🧩',
      description: 'Follow the clear path through the maze. Stay on track!',
      color: '#10B981',
      available: isMazeWalkAvailable,
    },
    {
      id: 'river-boat-guide',
      title: 'River Boat Guide',
      emoji: '🛶',
      description: 'Keep the boat in the river! Follow the curvy path carefully.',
      color: '#3B82F6',
      available: isRiverBoatGuideAvailable,
    },
    {
      id: 'ant-trail-follow',
      title: 'Ant Trail Follow',
      emoji: '🐜',
      description: 'Follow the dotted trail! Stay on the path made of dots.',
      color: '#8B5CF6',
      available: isAntTrailFollowAvailable,
    },
    {
      id: 'ball-roll-path',
      title: 'Ball Roll Path',
      emoji: '⚽',
      description: 'Roll the ball along the path! Drag to control the ball.',
      color: '#F59E0B',
      available: isBallRollPathAvailable,
    },
    {
      id: 'dont-touch-grass',
      title: 'Don\'t Touch the Grass',
      emoji: '🚶',
      description: 'Stay on the path! Don\'t touch the grass on either side.',
      color: '#10B981',
      available: isDontTouchGrassAvailable,
    },
    // Level 2 Session 5: Connect Dots games
    {
      id: 'dot-to-dot-animal',
      title: 'Dot-to-Dot Animal',
      emoji: '🐾',
      description: 'Connect the dots in order (1, 2, 3...) to reveal the animal!',
      color: '#3B82F6',
      available: isDotToDotAnimalAvailable,
    },
    {
      id: 'star-builder',
      title: 'Star Builder',
      emoji: '⭐',
      description: 'Connect the dots in order to build a star!',
      color: '#FBBF24',
      available: isStarBuilderAvailable,
    },
    {
      id: 'house-drawing',
      title: 'House Drawing',
      emoji: '🏠',
      description: 'Connect the dots in order to draw a house!',
      color: '#8B5CF6',
      available: isHouseDrawingAvailable,
    },
    {
      id: 'hidden-shape-reveal',
      title: 'Hidden Shape Reveal',
      emoji: '✨',
      description: 'Connect the dots to reveal the hidden shape!',
      color: '#EC4899',
      available: isHiddenShapeRevealAvailable,
    },
    {
      id: 'connect-in-order-glow',
      title: 'Connect in Order Glow',
      emoji: '💡',
      description: 'Watch the dots light up! Tap them in sequence.',
      color: '#10B981',
      available: isConnectInOrderGlowAvailable,
    },
    // Level 2 Session 6: Match Shape Outline games
    // {
    //   id: 'puzzle-drop-shapes',
    //   title: 'Puzzle Drop – Shapes',
    //   emoji: '🧩',
    //   description: 'Drag shape into outline',
    //   color: '#8B5CF6',
    //   available: isPuzzleDropShapesAvailable,
    // },
    // {
    //   id: 'shadow-match',
    //   title: 'Shadow Match',
    //   emoji: '🎭',
    //   description: 'Match exact outline',
    //   color: '#3B82F6',
    //   available: isShadowMatchAvailable,
    // },
    // {
    //   id: 'cookie-cutter-match',
    //   title: 'Cookie Cutter Match',
    //   emoji: '🍪',
    //   description: 'Shape fits only if aligned',
    //   color: '#F59E0B',
    //   available: isCookieCutterMatchAvailable,
    // },
    // {
    //   id: 'parking-shapes',
    //   title: 'Parking Shapes',
    //   emoji: '🅿️',
    //   description: 'Correct orientation needed',
    //   color: '#10B981',
    //   available: isParkingShapesAvailable,
    // },
    // {
    //   id: 'fast-match',
    //   title: 'Fast Match',
    //   emoji: '⚡',
    //   description: 'Builds speed gently (No Rotate)',
    //   color: '#EF4444',
    //   available: isFastMatchAvailable,
    // },
    // // Level 2 Session 7: Trace Large Shapes games
    // {
    //   id: 'big-circle-trace',
    //   title: 'Big Circle Trace',
    //   emoji: '⭕',
    //   description: 'Trace the big circle with your whole arm!',
    //   color: '#3B82F6',
    //   available: isBigCircleTraceAvailable,
    // },
    // {
    //   id: 'big-square-walk',
    //   title: 'Big Square Walk',
    //   emoji: '⬜',
    //   description: 'Walk around the big square with your whole arm!',
    //   color: '#10B981',
    //   available: isBigSquareWalkAvailable,
    // },
    // {
    //   id: 'triangle-mountain-trace',
    //   title: 'Triangle Mountain Trace',
    //   emoji: '⛰️',
    //   description: 'Trace the triangle mountain with your whole arm!',
    //   color: '#F59E0B',
    //   available: isTriangleMountainTraceAvailable,
    // },
    // {
    //   id: 'paint-the-shape',
    //   title: 'Paint the Shape',
    //   emoji: '🎨',
    //   description: 'Trace to fill the shape with color!',
    //   color: '#EC4899',
    //   available: isPaintTheShapeAvailable,
    // },
    // {
    //   id: 'glow-border-trace',
    //   title: 'Glow Border Trace',
    //   emoji: '✨',
    //   description: 'Trace the thick glowing border!',
    //   color: '#A855F7',
    //   available: isGlowBorderTraceAvailable,
    // },
    // // Level 2 Session 8: Trace Small Shapes games
    // {
    //   id: 'tiny-circle-coins',
    //   title: 'Tiny Circle Coins',
    //   emoji: '🪙',
    //   description: 'Trace the tiny circle coin with precision!',
    //   color: '#F59E0B',
    //   available: isTinyCircleCoinsAvailable,
    // },
    // {
    //   id: 'mini-square-locks',
    //   title: 'Mini Square Locks',
    //   emoji: '🔒',
    //   description: 'Trace the mini square lock with precision!',
    //   color: '#6366F1',
    //   available: isMiniSquareLocksAvailable,
    // },
    // {
    //   id: 'dot-border-shapes',
    //   title: 'Dot Border Shapes',
    //   emoji: '⚫',
    //   description: 'Trace the dotted border shape with precision!',
    //   color: '#8B5CF6',
    //   available: isDotBorderShapesAvailable,
    // },
    // {
    //   id: 'careful-trace-challenge',
    //   title: 'Careful Trace Challenge',
    //   emoji: '🎯',
    //   description: 'Trace slowly and carefully with precision!',
    //   color: '#10B981',
    //   available: isCarefulTraceChallengeAvailable,
    // },
    // {
    //   id: 'shrink-mode-trace',
    //   title: 'Shrink Mode Trace',
    //   emoji: '🔽',
    //   description: 'Trace the circle as it shrinks smaller each round!',
    //   color: '#EF4444',
    //   available: isShrinkModeTraceAvailable,
    // },
    // // Level 2 Session 9: Copy Simple Patterns games
    // {
    //   id: 'copy-the-line-pattern',
    //   title: 'Copy the Line Pattern',
    //   emoji: '📋',
    //   description: 'Copy the pattern by tapping vertical (|) or horizontal (—) lines!',
    //   color: '#8B5CF6',
    //   available: isCopyTheLinePatternAvailable,
    // },
    // {
    //   id: 'block-pattern-copy',
    //   title: 'Block Pattern Copy',
    //   emoji: '⬜',
    //   description: 'Copy the pattern by tapping square (□) or circle (○) blocks!',
    //   color: '#6366F1',
    //   available: isBlockPatternCopyAvailable,
    // },
    // {
    //   id: 'color-pattern-match',
    //   title: 'Color Pattern Match',
    //   emoji: '🎨',
    //   description: 'Copy the color pattern by tapping colors in order!',
    //   color: '#EF4444',
    //   available: isColorPatternMatchAvailable,
    // },
    // {
    //   id: 'stick-design-copy',
    //   title: 'Stick Design Copy',
    //   emoji: '✏️',
    //   description: 'Copy the pre-writing stroke design!',
    //   color: '#F59E0B',
    //   available: isStickDesignCopyAvailable,
    // },
    // {
    //   id: 'look-hide-draw',
    //   title: 'Look–Hide–Draw',
    //   emoji: '👁️',
    //   description: 'Pattern disappears briefly - remember and draw it!',
    //   color: '#EC4899',
    //   available: isLookHideDrawAvailable,
    // },
    // // Level 2 Session 10: Mirror Drawing Basics games
    // {
    //   id: 'mirror-line-draw',
    //   title: 'Mirror Line Draw',
    //   emoji: '🪞',
    //   description: 'Draw on the left side, and it will mirror on the right!',
    //   color: '#8B5CF6',
    //   available: isMirrorLineDrawAvailable,
    // },
    // {
    //   id: 'butterfly-wings',
    //   title: 'Butterfly Wings',
    //   emoji: '🦋',
    //   description: 'Draw one wing on the left, and it will mirror on the right!',
    //   color: '#F59E0B',
    //   available: isButterflyWingsAvailable,
    // },
    // {
    //   id: 'face-symmetry-draw',
    //   title: 'Face Symmetry Draw',
    //   emoji: '😊',
    //   description: 'Draw facial features that mirror symmetrically!',
    //   color: '#FCD34D',
    //   available: isFaceSymmetryDrawAvailable,
    // },
    // {
    //   id: 'half-shape-complete',
    //   title: 'Half Shape Complete',
    //   emoji: '✨',
    //   description: 'Draw the missing half of the shape on the right!',
    //   color: '#10B981',
    //   available: isHalfShapeCompleteAvailable,
    // },
    // {
    //   id: 'mirror-maze',
    //   title: 'Mirror Maze',
    //   emoji: '🔄',
    //   description: 'Move both objects together - drag on the left, right mirrors!',
    //   color: '#22C55E',
    //   available: isMirrorMazeAvailable,
    // },
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

  // if (currentGame === 'shrinking-target') {
  //   return <ShrinkingTargetGame onBack={() => setCurrentGame('menu')} />;
  // }

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

  if (currentGame === 'tap-the-big-one') {
    return <TapTheBigOneGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'tap-the-small-one') {
    return <TapTheSmallOneGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'tap-the-shape-i-show-you') {
    return <TapTheShapeIShowYouGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'find-the-odd-one-out') {
    return <FindTheOddOneOutGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'match-shape-to-outline') {
    return <MatchShapeToOutlineGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'tiny-dot-tap') {
    return <TinyDotTapGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'tap-the-center-of-the-target') {
    return <TapTheCenterOfTheTargetGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'moving-small-target') {
    return <MovingSmallTargetGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'tap-only-the-smallest-shape') {
    return <TapOnlyTheSmallestShapeGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'tap-the-hidden-small-object') {
    return <TapTheHiddenSmallObjectGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'shrinking-circle-tap') {
    return <ShrinkingCircleTapGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'tap-when-star-is-smallest') {
    return <TapWhenStarIsSmallestGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'shrink-stop-tap') {
    return <ShrinkStopTapGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'multiple-shrinking-targets') {
    return <MultipleShrinkingTargetsGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'shrinking-object-movement') {
    return <ShrinkingObjectMovementGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'pinch-to-pop') {
    return <PinchToPopGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'pinch-and-drag') {
    return <PinchAndDragGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'two-finger-simultaneous-tap') {
    return <TwoFingerSimultaneousTapGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'pinch-to-resize') {
    return <PinchToResizeGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'pinch-to-open-treasure-box') {
    return <PinchToOpenTreasureBoxGame onBack={() => setCurrentGame('menu')} />;
  }

  // OT Level 11 (Section 2: Visual-Motor Integration) Games
  if (currentGame === 'touch-the-dot') {
    return <TouchTheDotGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'where-is-it') {
    return <WhereIsItGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'follow-and-touch') {
    return <FollowAndTouchGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'tap-where-it-lights-up') {
    return <TapWhereItLightsUpGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'match-and-touch') {
    return <MatchAndTouchGame onBack={() => setCurrentGame('menu')} />;
  }

  // Level 2 Session 2: Trace Curved Line games
  // if (currentGame === 'rainbow-trace') {
  //   return <RainbowTraceGame onBack={() => setCurrentGame('menu')} />;
  // }

  if (currentGame === 'snake-slide') {
    return <SnakeSlideGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'moon-path') {
    return <MoonPathGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'smile-maker') {
    return <SmileMakerGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'curvy-road-drive') {
    return <CurvyRoadDriveGame onBack={() => setCurrentGame('menu')} />;
  }

  // Level 2 Session 3: Trace Zig-Zag games
  if (currentGame === 'mountain-climb') {
    return <MountainClimbGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'lightning-bolt') {
    return <LightningBoltGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'saw-path') {
    return <SawPathGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'robot-wire-fix') {
    return <RobotWireFixGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'zig-zag-race') {
    return <ZigZagRaceGame onBack={() => setCurrentGame('menu')} />;
  }

  // Level 2 Session 4: Follow Path (Drag) games
  if (currentGame === 'maze-walk') {
    return <MazeWalkGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'river-boat-guide') {
    return <RiverBoatGuideGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'ant-trail-follow') {
    return <AntTrailFollowGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'ball-roll-path') {
    return <BallRollPathGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'dont-touch-grass') {
    return <DontTouchGrassGame onBack={() => setCurrentGame('menu')} />;
  }

  // Level 2 Session 5: Connect Dots games
  if (currentGame === 'dot-to-dot-animal') {
    return <DotToDotAnimalGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'star-builder') {
    return <StarBuilderGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'house-drawing') {
    return <HouseDrawingGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'hidden-shape-reveal') {
    return <HiddenShapeRevealGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'connect-in-order-glow') {
    return <ConnectInOrderGlowGame onBack={() => setCurrentGame('menu')} />;
  }

  // // Level 2 Session 6: Match Shape Outline games
  // if (currentGame === 'puzzle-drop-shapes') {
  //   return <PuzzleDropShapesGame onBack={() => setCurrentGame('menu')} />;
  // }

  // if (currentGame === 'shadow-match') {
  //   return <ShadowMatchGame onBack={() => setCurrentGame('menu')} />;
  // }

  // if (currentGame === 'cookie-cutter-match') {
  //   return <CookieCutterMatchGame onBack={() => setCurrentGame('menu')} />;
  // }

  // if (currentGame === 'parking-shapes') {
  //   return <ParkingShapesGame onBack={() => setCurrentGame('menu')} />;
  // }

  // if (currentGame === 'fast-match') {
  //   return <FastMatchGame onBack={() => setCurrentGame('menu')} />;
  // }

  // // Level 2 Session 7: Trace Large Shapes games
  // if (currentGame === 'big-circle-trace') {
  //   return <BigCircleTraceGame onBack={() => setCurrentGame('menu')} />;
  // }

  // if (currentGame === 'big-square-walk') {
  //   return <BigSquareWalkGame onBack={() => setCurrentGame('menu')} />;
  // }

  // if (currentGame === 'triangle-mountain-trace') {
  //   return <TriangleMountainTraceGame onBack={() => setCurrentGame('menu')} />;
  // }

  // if (currentGame === 'paint-the-shape') {
  //   return <PaintTheShapeGame onBack={() => setCurrentGame('menu')} />;
  // }

  // if (currentGame === 'glow-border-trace') {
  //   return <GlowBorderTraceGame onBack={() => setCurrentGame('menu')} />;
  // }

  // // Level 2 Session 8: Trace Small Shapes games
  // if (currentGame === 'tiny-circle-coins') {
  //   return <TinyCircleCoinsGame onBack={() => setCurrentGame('menu')} />;
  // }

  // if (currentGame === 'mini-square-locks') {
  //   return <MiniSquareLocksGame onBack={() => setCurrentGame('menu')} />;
  // }

  // if (currentGame === 'dot-border-shapes') {
  //   return <DotBorderShapesGame onBack={() => setCurrentGame('menu')} />;
  // }

  // if (currentGame === 'careful-trace-challenge') {
  //   return <CarefulTraceChallengeGame onBack={() => setCurrentGame('menu')} />;
  // }

  // if (currentGame === 'shrink-mode-trace') {
  //   return <ShrinkModeTraceGame onBack={() => setCurrentGame('menu')} />;
  // }

  // // Level 2 Session 9: Copy Simple Patterns games
  // if (currentGame === 'copy-the-line-pattern') {
  //   return <CopyTheLinePatternGame onBack={() => setCurrentGame('menu')} />;
  // }

  // if (currentGame === 'block-pattern-copy') {
  //   return <BlockPatternCopyGame onBack={() => setCurrentGame('menu')} />;
  // }

  // if (currentGame === 'color-pattern-match') {
  //   return <ColorPatternMatchGame onBack={() => setCurrentGame('menu')} />;
  // }

  // if (currentGame === 'stick-design-copy') {
  //   return <StickDesignCopyGame onBack={() => setCurrentGame('menu')} />;
  // }

  // if (currentGame === 'look-hide-draw') {
  //   return <LookHideDrawGame onBack={() => setCurrentGame('menu')} />;
  // }

  // // Level 2 Session 10: Mirror Drawing Basics games
  // if (currentGame === 'mirror-line-draw') {
  //   return <MirrorLineDrawGame onBack={() => setCurrentGame('menu')} />;
  // }

  // if (currentGame === 'butterfly-wings') {
  //   return <ButterflyWingsGame onBack={() => setCurrentGame('menu')} />;
  // }

  // if (currentGame === 'face-symmetry-draw') {
  //   return <FaceSymmetryDrawGame onBack={() => setCurrentGame('menu')} />;
  // }

  // if (currentGame === 'half-shape-complete') {
  //   return <HalfShapeCompleteGame onBack={() => setCurrentGame('menu')} />;
  // }

  // if (currentGame === 'mirror-maze') {
  //   return <MirrorMazeGame onBack={() => setCurrentGame('menu')} />;
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
                  if (game.id === 'tap-the-big-one') setCurrentGame('tap-the-big-one');
                  if (game.id === 'tap-the-small-one') setCurrentGame('tap-the-small-one');
                  if (game.id === 'tap-the-shape-i-show-you') setCurrentGame('tap-the-shape-i-show-you');
                  if (game.id === 'find-the-odd-one-out') setCurrentGame('find-the-odd-one-out');
                  if (game.id === 'match-shape-to-outline') setCurrentGame('match-shape-to-outline');
                  if (game.id === 'tiny-dot-tap') setCurrentGame('tiny-dot-tap');
                  if (game.id === 'tap-the-center-of-the-target') setCurrentGame('tap-the-center-of-the-target');
                  if (game.id === 'moving-small-target') setCurrentGame('moving-small-target');
                  if (game.id === 'tap-only-the-smallest-shape') setCurrentGame('tap-only-the-smallest-shape');
                  if (game.id === 'tap-the-hidden-small-object') setCurrentGame('tap-the-hidden-small-object');
                  if (game.id === 'shrinking-circle-tap') setCurrentGame('shrinking-circle-tap');
                  if (game.id === 'tap-when-star-is-smallest') setCurrentGame('tap-when-star-is-smallest');
                  if (game.id === 'shrink-stop-tap') setCurrentGame('shrink-stop-tap');
                  if (game.id === 'multiple-shrinking-targets') setCurrentGame('multiple-shrinking-targets');
                  if (game.id === 'shrinking-object-movement') setCurrentGame('shrinking-object-movement');
                  if (game.id === 'pinch-to-pop') setCurrentGame('pinch-to-pop');
                  if (game.id === 'pinch-and-drag') setCurrentGame('pinch-and-drag');
                  if (game.id === 'two-finger-simultaneous-tap') setCurrentGame('two-finger-simultaneous-tap');
                  if (game.id === 'pinch-to-resize') setCurrentGame('pinch-to-resize');
                  if (game.id === 'pinch-to-open-treasure-box') setCurrentGame('pinch-to-open-treasure-box');
                  // OT Level 11 games
                  if (game.id === 'touch-the-dot') setCurrentGame('touch-the-dot');
                  if (game.id === 'where-is-it') setCurrentGame('where-is-it');
                  if (game.id === 'follow-and-touch') setCurrentGame('follow-and-touch');
                  if (game.id === 'tap-where-it-lights-up') setCurrentGame('tap-where-it-lights-up');
                  if (game.id === 'match-and-touch') setCurrentGame('match-and-touch');
                  // Level 2 Session 2 games
                  if (game.id === 'rainbow-trace') setCurrentGame('rainbow-trace');
                  if (game.id === 'snake-slide') setCurrentGame('snake-slide');
                  if (game.id === 'moon-path') setCurrentGame('moon-path');
                  if (game.id === 'smile-maker') setCurrentGame('smile-maker');
                  if (game.id === 'curvy-road-drive') setCurrentGame('curvy-road-drive');
                  // Level 2 Session 3 games
                  if (game.id === 'mountain-climb') setCurrentGame('mountain-climb');
                  if (game.id === 'lightning-bolt') setCurrentGame('lightning-bolt');
                  if (game.id === 'saw-path') setCurrentGame('saw-path');
                  if (game.id === 'robot-wire-fix') setCurrentGame('robot-wire-fix');
                  if (game.id === 'zig-zag-race') setCurrentGame('zig-zag-race');
                  // Level 2 Session 4 games
                  if (game.id === 'maze-walk') setCurrentGame('maze-walk');
                  if (game.id === 'river-boat-guide') setCurrentGame('river-boat-guide');
                  if (game.id === 'ant-trail-follow') setCurrentGame('ant-trail-follow');
                  if (game.id === 'ball-roll-path') setCurrentGame('ball-roll-path');
                  if (game.id === 'dont-touch-grass') setCurrentGame('dont-touch-grass');
                  // Level 2 Session 5 games
                  if (game.id === 'dot-to-dot-animal') setCurrentGame('dot-to-dot-animal');
                  if (game.id === 'star-builder') setCurrentGame('star-builder');
                  if (game.id === 'house-drawing') setCurrentGame('house-drawing');
                  if (game.id === 'hidden-shape-reveal') setCurrentGame('hidden-shape-reveal');
                  if (game.id === 'connect-in-order-glow') setCurrentGame('connect-in-order-glow');
                  // Level 2 Session 6 games
                  // if (game.id === 'puzzle-drop-shapes') setCurrentGame('puzzle-drop-shapes');
                  // if (game.id === 'shadow-match') setCurrentGame('shadow-match');
                  // if (game.id === 'cookie-cutter-match') setCurrentGame('cookie-cutter-match');
                  // if (game.id === 'parking-shapes') setCurrentGame('parking-shapes');
                  // if (game.id === 'fast-match') setCurrentGame('fast-match');
                  // // Level 2 Session 7 games
                  // if (game.id === 'big-circle-trace') setCurrentGame('big-circle-trace');
                  // if (game.id === 'big-square-walk') setCurrentGame('big-square-walk');
                  // if (game.id === 'triangle-mountain-trace') setCurrentGame('triangle-mountain-trace');
                  // if (game.id === 'paint-the-shape') setCurrentGame('paint-the-shape');
                  // if (game.id === 'glow-border-trace') setCurrentGame('glow-border-trace');
                  // // Level 2 Session 8 games
                  // if (game.id === 'tiny-circle-coins') setCurrentGame('tiny-circle-coins');
                  // if (game.id === 'mini-square-locks') setCurrentGame('mini-square-locks');
                  // if (game.id === 'dot-border-shapes') setCurrentGame('dot-border-shapes');
                  // if (game.id === 'careful-trace-challenge') setCurrentGame('careful-trace-challenge');
                  // if (game.id === 'shrink-mode-trace') setCurrentGame('shrink-mode-trace');
                  // // Level 2 Session 9 games
                  // if (game.id === 'copy-the-line-pattern') setCurrentGame('copy-the-line-pattern');
                  // if (game.id === 'block-pattern-copy') setCurrentGame('block-pattern-copy');
                  // if (game.id === 'color-pattern-match') setCurrentGame('color-pattern-match');
                  // if (game.id === 'stick-design-copy') setCurrentGame('stick-design-copy');
                  // if (game.id === 'look-hide-draw') setCurrentGame('look-hide-draw');
                  // // Level 2 Session 10 games
                  // if (game.id === 'mirror-line-draw') setCurrentGame('mirror-line-draw');
                  // if (game.id === 'butterfly-wings') setCurrentGame('butterfly-wings');
                  // if (game.id === 'face-symmetry-draw') setCurrentGame('face-symmetry-draw');
                  // if (game.id === 'half-shape-complete') setCurrentGame('half-shape-complete');
                  // if (game.id === 'mirror-maze') setCurrentGame('mirror-maze');
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
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    marginBottom: 4,
  },
  gameCardDisabled: {
    opacity: 0.6,
    borderColor: '#E5E7EB',
  },
  gameIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  gameEmoji: {
    fontSize: 32,
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
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
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
