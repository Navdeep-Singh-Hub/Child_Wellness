import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SectionSelector } from './SectionSelector';
import { LevelSelector } from './LevelSelector';
import { GameSelector } from './GameSelector';
import { ProgressMap } from './ProgressMap';
import { FreeHandSession1 } from '@/components/level1-grip-session/FreeHandSession1';
import { ControlledScribblingSession2 } from '@/components/level1-controlled-session/ControlledScribblingSession2';
import { CurvesVowelsSession5 } from '@/components/level1-curves-vowels-session/CurvesVowelsSession5';
import { StraightLineLettersSession4 } from '@/components/level1-straight-letters-session/StraightLineLettersSession4';
import { SlantCurveLettersSession5 } from '@/components/level1-slant-curve-letters-session/SlantCurveLettersSession5';
import { FullAlphabetSession6 } from '@/components/level1-full-alphabet-session/FullAlphabetSession6';
import { LettersKLSession6 } from '@/components/explorer-session/LettersKLSession6';
import { ReducedGuidanceSession7 } from '@/components/level1-reduced-guidance-session/ReducedGuidanceSession7';
import { LettersMNSession7 } from '@/components/explorer-session/LettersMNSession7';
import { CopyLettersSession8 } from '@/components/level1-copy-letters-session/CopyLettersSession8';
import { LettersOPSession8 } from '@/components/explorer-session/LettersOPSession8';
import { FreeWritingSession9 } from '@/components/level1-free-writing-session/FreeWritingSession9';
import { LettersQRSession9 } from '@/components/explorer-session/LettersQRSession9';
import { MasterSession10 } from '@/components/level1-master-session/MasterSession10';
import { ExplorerMasterSession10 } from '@/components/explorer-session/ExplorerMasterSession10';
import { FarmSession1 } from '@/components/farm-session/FarmSession1';
import { OceanSession2 } from '@/components/ocean-session/OceanSession2';
import { JungleSession3 } from '@/components/jungle-session/JungleSession3';
import { SpaceSession4 } from '@/components/space-session/SpaceSession4';
import { GardenSession5 } from '@/components/garden-session/GardenSession5';
import { GrocerySession6 } from '@/components/grocery-session/GrocerySession6';
import { MusicSession7 } from '@/components/music-session/MusicSession7';
import { SuperheroSession8 } from '@/components/superhero-session/SuperheroSession8';
import { FairySession9 } from '@/components/fairy-session/FairySession9';
import { CelebrationSession10 } from '@/components/celebration-session/CelebrationSession10';
import { ATWordSession1 } from '@/components/at-word-session/ATWordSession1';
import { INWordSession2 } from '@/components/in-word-session/INWordSession2';
import { UNWordSession3 } from '../un-word-session/UNWordSession3';
import { MixedWordSession4 } from '@/components/mixed-word-session/MixedWordSession4';
import { OPWordSession5 } from '@/components/op-word-session/OPWordSession5';
import { ANWordSession6 } from '@/components/an-word-session/ANWordSession6';
import { ETWordSession7 } from '@/components/et-word-session/ETWordSession7';
import { IGWordSession8 } from '@/components/ig-word-session/IGWordSession8';
import { FamilyChallengeSession9 } from '@/components/family-challenge-session/FamilyChallengeSession9';
import { GrouperMasterSession10 } from '@/components/grouper-master-session/GrouperMasterSession10';
import { PrepositionInSession1 } from '@/components/logic-lab-session/PrepositionInSession1';
import { PrepositionOnSession2 } from '@/components/logic-lab-session/PrepositionOnSession2';
import { PrepositionUnderSession3 } from '@/components/logic-lab-session/PrepositionUnderSession3';
import { PrepositionNextToSession4 } from '@/components/logic-lab-session/PrepositionNextToSession4';
import { PrepositionBehindSession5 } from '@/components/logic-lab-session/PrepositionBehindSession5';
import { PrepositionBetweenSession6 } from '@/components/logic-lab-session/PrepositionBetweenSession6';
import { PrepositionReviewSession7 } from '@/components/logic-lab-session/PrepositionReviewSession7';
import { PatternBuilderSession8 } from '@/components/logic-lab-session/PatternBuilderSession8';
import { SequenceMasterSession9 } from '@/components/logic-lab-session/SequenceMasterSession9';
import { LogicLabMasterSession10 } from '@/components/logic-lab-session/LogicLabMasterSession10';
import { SafetySignsSession1 } from '@/components/citizen-session/SafetySignsSession1';
import { PublicPlaceSignsSession2 } from '@/components/citizen-session/PublicPlaceSignsSession2';
import { DirectionSignsSession3 } from '@/components/citizen-session/DirectionSignsSession3';
import { StoreSignsSession4 } from '@/components/citizen-session/StoreSignsSession4';
import { TrafficSignsSession5 } from '@/components/citizen-session/TrafficSignsSession5';
import { SchoolSignsSession6 } from '@/components/citizen-session/SchoolSignsSession6';
import { RestaurantSignsSession7 } from '@/components/citizen-session/RestaurantSignsSession7';
import { EmergencySignsSession8 } from '@/components/citizen-session/EmergencySignsSession8';
import { CommunitySignsSession9 } from '@/components/citizen-session/CommunitySignsSession9';
import { CitizenMasterSession10 } from '@/components/citizen-session/CitizenMasterSession10';
import { SimpleConversationsSession1 } from '@/components/graduate-session/SimpleConversationsSession1';
import { StorySentencesSession2 } from '@/components/graduate-session/StorySentencesSession2';
import { QuestionAnswerSession3 } from '@/components/graduate-session/QuestionAnswerSession3';
import { DailyStoriesSession4 } from '@/components/graduate-session/DailyStoriesSession4';
import { SocialDialogueSession5 } from '@/components/graduate-session/SocialDialogueSession5';
import { StoryUnderstandingSession6 } from '@/components/graduate-session/StoryUnderstandingSession6';
import { RealLifeProblemsSession7 } from '@/components/graduate-session/RealLifeProblemsSession7';
import { DialogueBuilderSession8 } from '@/components/graduate-session/DialogueBuilderSession8';
import { StoryProblemSolverSession9 } from '@/components/graduate-session/StoryProblemSolverSession9';
import { GraduateMasterSession10 } from '@/components/graduate-session/GraduateMasterSession10';
import { BuilderSession1 } from '@/components/builder-session/BuilderSession1';
import { BuilderSession2 } from '@/components/builder-session/BuilderSession2';
import { BuilderSession3 } from '@/components/builder-session/BuilderSession3';
import { BuilderSession4 } from '@/components/builder-session/BuilderSession4';
import { BuilderSession5 } from '@/components/builder-session/BuilderSession5';
import { BuilderSession6 } from '@/components/builder-session/BuilderSession6';
import { BuilderSession7 } from '@/components/builder-session/BuilderSession7';
import { BuilderSession8 } from '@/components/builder-session/BuilderSession8';
import { BuilderSession9 } from '@/components/builder-session/BuilderSession9';
import { BuilderSession10 } from '@/components/builder-session/BuilderSession10';
import { CounterSession1 } from '@/components/counter-session/CounterSession1';
import { CounterSession2 } from '@/components/counter-session/CounterSession2';
import { CounterSession3 } from '@/components/counter-session/CounterSession3';
import { CounterSession4 } from '@/components/counter-session/CounterSession4';
import { CounterSession5 } from '@/components/counter-session/CounterSession5';
import { CounterSession6 } from '@/components/counter-session/CounterSession6';
import { CounterSession7 } from '@/components/counter-session/CounterSession7';
import { CounterSession8 } from '@/components/counter-session/CounterSession8';
import { CounterSession9 } from '@/components/counter-session/CounterSession9';
import { CounterSession10 } from '@/components/counter-session/CounterSession10';
import { ReaderSession1 } from '@/components/reader-session/ReaderSession1';
import { ReaderSession2 } from '@/components/reader-session/ReaderSession2';
import { ReaderSession3 } from '@/components/reader-session/ReaderSession3';
import { ReaderSession4 } from '@/components/reader-session/ReaderSession4';
import { ReaderSession5 } from '@/components/reader-session/ReaderSession5';
import { ReaderSession6 } from '@/components/reader-session/ReaderSession6';
import { ReaderSession7 } from '@/components/reader-session/ReaderSession7';
import { ReaderSession8 } from '@/components/reader-session/ReaderSession8';
import { ReaderSession9 } from '@/components/reader-session/ReaderSession9';
import { ReaderSession10 } from '@/components/reader-session/ReaderSession10';
import { Level9Session1 } from '@/components/level9-session/Level9Session1';
import { Level9Session2 } from '@/components/level9-session/Level9Session2';
import { Level9Session3 } from '@/components/level9-session/Level9Session3';
import { Level9Session4 } from '@/components/level9-session/Level9Session4';
import { Level9Session6 } from '@/components/level9-session/Level9Session6';
import { Level9Session8 } from '@/components/level9-session/Level9Session8';
import { Level9Session9 } from '@/components/level9-session/Level9Session9';
import { Level9Session10 } from '@/components/level9-session/Level9Session10';

type NavigationMode = 'sections' | 'sessions' | 'games' | 'map' | 'playing';

export function SpecialEducationNavigator() {
  const router = useRouter();
  const [mode, setMode] = useState<NavigationMode>('sections');
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [selectedGame, setSelectedGame] = useState<number | null>(null);

  const handleBack = () => {
    if (mode === 'sessions') {
      setMode('sections');
      setSelectedSection(null);
    } else if (mode === 'games') {
      setMode('sessions');
      setSelectedSession(null);
    } else {
      router.back();
    }
  };

  const handleSelectSection = (section: number) => {
    setSelectedSection(section);
    setMode('sessions');
  };

  const handleSelectSession = (session: number) => {
    setSelectedSession(session);
    setMode('games');
  };

  const handleSelectGame = (game: number) => {
    if (selectedSection !== null && selectedSession !== null && game >= 1 && game <= 5) {
      setSelectedGame(game);
      setMode('playing');
    }
  };

  const handleGameComplete = () => {
    setSelectedGame(null);
    setMode('games');
  };

  const handleShowMap = () => {
    setMode('map');
  };

  if (mode === 'map') {
    return (
      <ProgressMap
        onBack={() => setMode('sections')}
        currentSection={selectedSection || 1}
      />
    );
  }

  if (mode === 'sessions' && selectedSection !== null) {
    return (
      <LevelSelector
        section={selectedSection}
        onBack={handleBack}
        onSelectLevel={handleSelectSession}
        onShowMap={handleShowMap}
      />
    );
  }

  // Explorer (section 1) Session 1: Letters A & B — full session flow
  if (mode === 'games' && selectedSection === 1 && selectedSession === 1) {
    const handleExitSession = () => {
      setMode('sessions');
      setSelectedSession(null);
    };
    return <FreeHandSession1 onExit={handleExitSession} />;
  }
  // Explorer (section 1) Session 2: Controlled Scribbling — full session flow
  if (mode === 'games' && selectedSection === 1 && selectedSession === 2) {
    const handleExitSession = () => {
      setMode('sessions');
      setSelectedSession(null);
    };
    return <ControlledScribblingSession2 onExit={handleExitSession} />;
  }
  // Explorer (section 1) Session 3: Curved Lines — full session flow
  if (mode === 'games' && selectedSection === 1 && selectedSession === 3) {
    const handleExitSession = () => {
      setMode('sessions');
      setSelectedSession(null);
    };
    return <CurvesVowelsSession5 onExit={handleExitSession} />;
  }
  // Explorer (section 1) Session 4: Straight-Line Letters — full session flow
  if (mode === 'games' && selectedSection === 1 && selectedSession === 4) {
    const handleExitSession = () => {
      setMode('sessions');
      setSelectedSession(null);
    };
    return <StraightLineLettersSession4 onExit={handleExitSession} />;
  }
  // Explorer (section 1) Session 5: Slant & Curve Letters — full session flow
  if (mode === 'games' && selectedSection === 1 && selectedSession === 5) {
    const handleExitSession = () => {
      setMode('sessions');
      setSelectedSession(null);
    };
    return <SlantCurveLettersSession5 onExit={handleExitSession} />;
  }
  // Explorer (section 1) Session 6: Full A–Z Tracing — full session flow
  if (mode === 'games' && selectedSection === 1 && selectedSession === 6) {
    const handleExitSession = () => {
      setMode('sessions');
      setSelectedSession(null);
    };
    return <FullAlphabetSession6 onExit={handleExitSession} />;
  }
  // Explorer (section 1) Session 7: Reduced Guidance — full session flow
  if (mode === 'games' && selectedSection === 1 && selectedSession === 7) {
    const handleExitSession = () => {
      setMode('sessions');
      setSelectedSession(null);
    };
    return <ReducedGuidanceSession7 onExit={handleExitSession} />;
  }
  // Explorer (section 1) Session 8: Copy Letters — full session flow
  if (mode === 'games' && selectedSection === 1 && selectedSession === 8) {
    const handleExitSession = () => {
      setMode('sessions');
      setSelectedSession(null);
    };
    return <CopyLettersSession8 onExit={handleExitSession} />;
  }
  // Explorer (section 1) Session 9: Free Writing — full session flow
  if (mode === 'games' && selectedSection === 1 && selectedSession === 9) {
    const handleExitSession = () => {
      setMode('sessions');
      setSelectedSession(null);
    };
    return <FreeWritingSession9 onExit={handleExitSession} />;
  }
  // Explorer (section 1) Session 10: Master Writing (FINAL) — full session flow
  if (mode === 'games' && selectedSection === 1 && selectedSession === 10) {
    const handleExitSession = () => {
      setMode('sessions');
      setSelectedSession(null);
    };
    return <MasterSession10 onExit={handleExitSession} />;
  }

  // Builder (section 3) Session 1: Object & Shape Fun — full session flow
  if (mode === 'games' && selectedSection === 3 && selectedSession === 1) {
    const handleExitSession = () => {
      setMode('sessions');
      setSelectedSession(null);
    };
    return <BuilderSession1 onExit={handleExitSession} />;
  }
  // Builder (section 3) Session 2: Word Builder & More — full session flow
  if (mode === 'games' && selectedSection === 3 && selectedSession === 2) {
    const handleExitSession = () => {
      setMode('sessions');
      setSelectedSession(null);
    };
    return <BuilderSession2 onExit={handleExitSession} />;
  }
  // Builder (section 3) Session 3: Memory & Match — full session flow
  if (mode === 'games' && selectedSection === 3 && selectedSession === 3) {
    const handleExitSession = () => {
      setMode('sessions');
      setSelectedSession(null);
    };
    return <BuilderSession3 onExit={handleExitSession} />;
  }
  // Builder (section 3) Session 4: Colors & Patterns — full session flow
  if (mode === 'games' && selectedSection === 3 && selectedSession === 4) {
    const handleExitSession = () => {
      setMode('sessions');
      setSelectedSession(null);
    };
    return <BuilderSession4 onExit={handleExitSession} />;
  }
  // Builder (section 3) Session 5: Trace, Count & Sort — full session flow
  if (mode === 'games' && selectedSection === 3 && selectedSession === 5) {
    const handleExitSession = () => {
      setMode('sessions');
      setSelectedSession(null);
    };
    return <BuilderSession5 onExit={handleExitSession} />;
  }
  // Builder (section 3) Session 6: Memory, Direction & Match — full session flow
  if (mode === 'games' && selectedSection === 3 && selectedSession === 6) {
    const handleExitSession = () => {
      setMode('sessions');
      setSelectedSession(null);
    };
    return <BuilderSession6 onExit={handleExitSession} />;
  }
  // Builder (section 3) Session 7: Size, Numbers & Patterns — full session flow
  if (mode === 'games' && selectedSection === 3 && selectedSession === 7) {
    const handleExitSession = () => {
      setMode('sessions');
      setSelectedSession(null);
    };
    return <BuilderSession7 onExit={handleExitSession} />;
  }
  // Builder (section 3) Session 8: Emotions, Colors & More — full session flow
  if (mode === 'games' && selectedSection === 3 && selectedSession === 8) {
    const handleExitSession = () => {
      setMode('sessions');
      setSelectedSession(null);
    };
    return <BuilderSession8 onExit={handleExitSession} />;
  }
  // Builder (section 3) Session 9: Spot the Difference & Shapes — full session flow
  if (mode === 'games' && selectedSection === 3 && selectedSession === 9) {
    const handleExitSession = () => {
      setMode('sessions');
      setSelectedSession(null);
    };
    return <BuilderSession9 onExit={handleExitSession} />;
  }
  // Builder (section 3) Session 10: Final — full session flow
  if (mode === 'games' && selectedSection === 3 && selectedSession === 10) {
    const handleExitSession = () => {
      setMode('sessions');
      setSelectedSession(null);
    };
    return <BuilderSession10 onExit={handleExitSession} />;
  }
  // Counter (section 5) Session 1: Patterns & Words — full session flow
  if (mode === 'games' && selectedSection === 5 && selectedSession === 1) {
    const handleExitSession = () => {
      setMode('sessions');
      setSelectedSession(null);
    };
    return <CounterSession1 onExit={handleExitSession} />;
  }
  // Counter (section 5) Session 2: Count & Compare — full session flow
  if (mode === 'games' && selectedSection === 5 && selectedSession === 2) {
    const handleExitSession = () => {
      setMode('sessions');
      setSelectedSession(null);
    };
    return <CounterSession2 onExit={handleExitSession} />;
  }
  // Counter (section 5) Session 3: Shapes & Sounds — full session flow
  if (mode === 'games' && selectedSection === 5 && selectedSession === 3) {
    const handleExitSession = () => {
      setMode('sessions');
      setSelectedSession(null);
    };
    return <CounterSession3 onExit={handleExitSession} />;
  }
  // Counter (section 5) Session 4: Color & Match — full session flow
  if (mode === 'games' && selectedSection === 5 && selectedSession === 4) {
    const handleExitSession = () => {
      setMode('sessions');
      setSelectedSession(null);
    };
    return <CounterSession4 onExit={handleExitSession} />;
  }
  // Counter (section 5) Session 5: Directions & Round — full session flow
  if (mode === 'games' && selectedSection === 5 && selectedSession === 5) {
    const handleExitSession = () => {
      setMode('sessions');
      setSelectedSession(null);
    };
    return <CounterSession5 onExit={handleExitSession} />;
  }
  // Counter (section 5) Session 6: Spot, Count & Shapes — full session flow
  if (mode === 'games' && selectedSection === 5 && selectedSession === 6) {
    const handleExitSession = () => {
      setMode('sessions');
      setSelectedSession(null);
    };
    return <CounterSession6 onExit={handleExitSession} />;
  }
  // Counter (section 5) Session 7: Pattern, Match & Build — full session flow
  if (mode === 'games' && selectedSection === 5 && selectedSession === 7) {
    const handleExitSession = () => {
      setMode('sessions');
      setSelectedSession(null);
    };
    return <CounterSession7 onExit={handleExitSession} />;
  }
  // Counter (section 5) Session 8: Emotions, Match & Shapes — full session flow
  if (mode === 'games' && selectedSection === 5 && selectedSession === 8) {
    const handleExitSession = () => {
      setMode('sessions');
      setSelectedSession(null);
    };
    return <CounterSession8 onExit={handleExitSession} />;
  }
  // Counter (section 5) Session 9: Logic, Memory & Shapes — full session flow
  if (mode === 'games' && selectedSection === 5 && selectedSession === 9) {
    const handleExitSession = () => {
      setMode('sessions');
      setSelectedSession(null);
    };
    return <CounterSession9 onExit={handleExitSession} />;
  }
  // Counter (section 5) Session 10: Counter Master (Final) — full session flow
  if (mode === 'games' && selectedSection === 5 && selectedSession === 10) {
    const handleExitSession = () => {
      setMode('sessions');
      setSelectedSession(null);
    };
    return <CounterSession10 onExit={handleExitSession} />;
  }

  // Reader (section 7) Session 1 — full session flow
  if (mode === 'games' && selectedSection === 7 && selectedSession === 1) {
    const handleExitSession = () => {
      setMode('sessions');
      setSelectedSession(null);
    };
    return <ReaderSession1 onExit={handleExitSession} />;
  }
  if (mode === 'games' && selectedSection === 7 && selectedSession === 2) {
    const handleExitSession = () => {
      setMode('sessions');
      setSelectedSession(null);
    };
    return <ReaderSession2 onExit={handleExitSession} />;
  }
  if (mode === 'games' && selectedSection === 7 && selectedSession === 3) {
    const handleExitSession = () => {
      setMode('sessions');
      setSelectedSession(null);
    };
    return <ReaderSession3 onExit={handleExitSession} />;
  }
  if (mode === 'games' && selectedSection === 7 && selectedSession === 4) {
    const handleExitSession = () => {
      setMode('sessions');
      setSelectedSession(null);
    };
    return <ReaderSession4 onExit={handleExitSession} />;
  }
  if (mode === 'games' && selectedSection === 7 && selectedSession === 5) {
    const handleExitSession = () => {
      setMode('sessions');
      setSelectedSession(null);
    };
    return <ReaderSession5 onExit={handleExitSession} />;
  }
  if (mode === 'games' && selectedSection === 7 && selectedSession === 6) {
    const handleExitSession = () => {
      setMode('sessions');
      setSelectedSession(null);
    };
    return <ReaderSession6 onExit={handleExitSession} />;
  }
  if (mode === 'games' && selectedSection === 7 && selectedSession === 7) {
    const handleExitSession = () => {
      setMode('sessions');
      setSelectedSession(null);
    };
    return <ReaderSession7 onExit={handleExitSession} />;
  }
  if (mode === 'games' && selectedSection === 7 && selectedSession === 8) {
    const handleExitSession = () => {
      setMode('sessions');
      setSelectedSession(null);
    };
    return <ReaderSession8 onExit={handleExitSession} />;
  }
  if (mode === 'games' && selectedSection === 7 && selectedSession === 9) {
    const handleExitSession = () => {
      setMode('sessions');
      setSelectedSession(null);
    };
    return <ReaderSession9 onExit={handleExitSession} />;
  }
  if (mode === 'games' && selectedSection === 7 && selectedSession === 10) {
    const handleExitSession = () => {
      setMode('sessions');
      setSelectedSession(null);
    };
    return <ReaderSession10 onExit={handleExitSession} />;
  }

  // Matcher (section 2) Sessions 1–10: Farm, Ocean, Jungle, Space, Garden, Grocery, Music, Superheroes, Fairy Tale, Celebration — show full session flow
  if (mode === 'games' && selectedSection === 2 && selectedSession !== null && [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].includes(selectedSession)) {
    const handleExitSession = () => {
      setMode('sessions');
      setSelectedSession(null);
    };
    if (selectedSession === 1) {
      return <FarmSession1 onExit={handleExitSession} />;
    }
    if (selectedSession === 2) {
      return <OceanSession2 onExit={handleExitSession} />;
    }
    if (selectedSession === 3) {
      return <JungleSession3 onExit={handleExitSession} />;
    }
    if (selectedSession === 4) {
      return <SpaceSession4 onExit={handleExitSession} />;
    }
    if (selectedSession === 5) {
      return <GardenSession5 onExit={handleExitSession} />;
    }
    if (selectedSession === 6) {
      return <GrocerySession6 onExit={handleExitSession} />;
    }
    if (selectedSession === 7) {
      return <MusicSession7 onExit={handleExitSession} />;
    }
    if (selectedSession === 8) {
      return <SuperheroSession8 onExit={handleExitSession} />;
    }
    if (selectedSession === 9) {
      return <FairySession9 onExit={handleExitSession} />;
    }
    if (selectedSession === 10) {
      return <CelebrationSession10 onExit={handleExitSession} />;
    }
  }

  // Logic Lab (section 6) Sessions 1–10: Preposition IN…Sequence Master, Logic Lab Master
  if (mode === 'games' && selectedSection === 6 && selectedSession !== null) {
    const handleExitLogicLab = () => { setMode('sessions'); setSelectedSession(null); };
    if (selectedSession === 1) return <PrepositionInSession1 onExit={handleExitLogicLab} />;
    if (selectedSession === 2) return <PrepositionOnSession2 onExit={handleExitLogicLab} />;
    if (selectedSession === 3) return <PrepositionUnderSession3 onExit={handleExitLogicLab} />;
    if (selectedSession === 4) return <PrepositionNextToSession4 onExit={handleExitLogicLab} />;
    if (selectedSession === 5) return <PrepositionBehindSession5 onExit={handleExitLogicLab} />;
    if (selectedSession === 6) return <PrepositionBetweenSession6 onExit={handleExitLogicLab} />;
    if (selectedSession === 7) return <PrepositionReviewSession7 onExit={handleExitLogicLab} />;
    if (selectedSession === 8) return <PatternBuilderSession8 onExit={handleExitLogicLab} />;
    if (selectedSession === 9) return <SequenceMasterSession9 onExit={handleExitLogicLab} />;
    if (selectedSession === 10) return <LogicLabMasterSession10 onExit={handleExitLogicLab} />;
  }

  // Level 9 / Clockwise (section 9) Session 1: Advanced Pattern, Memory 12, BRIDGE, Living/Non-living, four-objects-line task
  if (mode === 'games' && selectedSection === 9 && selectedSession === 1) {
    const handleExitSession = () => { setMode('sessions'); setSelectedSession(null); };
    return <Level9Session1 onExit={handleExitSession} />;
  }
  if (mode === 'games' && selectedSection === 9 && selectedSession === 2) {
    const handleExitSession = () => { setMode('sessions'); setSelectedSession(null); };
    return <Level9Session2 onExit={handleExitSession} />;
  }
  if (mode === 'games' && selectedSection === 9 && selectedSession === 3) {
    const handleExitSession = () => { setMode('sessions'); setSelectedSession(null); };
    return <Level9Session3 onExit={handleExitSession} />;
  }
  if (mode === 'games' && selectedSection === 9 && selectedSession === 4) {
    const handleExitSession = () => { setMode('sessions'); setSelectedSession(null); };
    return <Level9Session4 onExit={handleExitSession} />;
  }
  if (mode === 'games' && selectedSection === 9 && selectedSession === 6) {
    const handleExitSession = () => { setMode('sessions'); setSelectedSession(null); };
    return <Level9Session6 onExit={handleExitSession} />;
  }
  if (mode === 'games' && selectedSection === 9 && selectedSession === 8) {
    const handleExitSession = () => { setMode('sessions'); setSelectedSession(null); };
    return <Level9Session8 onExit={handleExitSession} />;
  }
  if (mode === 'games' && selectedSection === 9 && selectedSession === 9) {
    const handleExitSession = () => { setMode('sessions'); setSelectedSession(null); };
    return <Level9Session9 onExit={handleExitSession} />;
  }
  if (mode === 'games' && selectedSection === 9 && selectedSession === 10) {
    const handleExitSession = () => { setMode('sessions'); setSelectedSession(null); };
    return <Level9Session10 onExit={handleExitSession} />;
  }

  // The Citizen (section 8) Sessions 1–10: Safety Signs … Community Signs, Citizen Master Challenge
  if (mode === 'games' && selectedSection === 8 && selectedSession !== null) {
    const handleExitCitizen = () => { setMode('sessions'); setSelectedSession(null); };
    if (selectedSession === 1) return <SafetySignsSession1 onExit={handleExitCitizen} />;
    if (selectedSession === 2) return <PublicPlaceSignsSession2 onExit={handleExitCitizen} />;
    if (selectedSession === 3) return <DirectionSignsSession3 onExit={handleExitCitizen} />;
    if (selectedSession === 4) return <StoreSignsSession4 onExit={handleExitCitizen} />;
    if (selectedSession === 5) return <TrafficSignsSession5 onExit={handleExitCitizen} />;
    if (selectedSession === 6) return <SchoolSignsSession6 onExit={handleExitCitizen} />;
    if (selectedSession === 7) return <RestaurantSignsSession7 onExit={handleExitCitizen} />;
    if (selectedSession === 8) return <EmergencySignsSession8 onExit={handleExitCitizen} />;
    if (selectedSession === 9) return <CommunitySignsSession9 onExit={handleExitCitizen} />;
    if (selectedSession === 10) return <CitizenMasterSession10 onExit={handleExitCitizen} />;
  }

  // The Graduate (section 10) Sessions 1–10: Simple Conversations … Story Problem Solver, Graduate Master Challenge
  if (mode === 'games' && selectedSection === 10 && selectedSession !== null) {
    const handleExitGraduate = () => { setMode('sessions'); setSelectedSession(null); };
    if (selectedSession === 1) return <SimpleConversationsSession1 onExit={handleExitGraduate} />;
    if (selectedSession === 2) return <StorySentencesSession2 onExit={handleExitGraduate} />;
    if (selectedSession === 3) return <QuestionAnswerSession3 onExit={handleExitGraduate} />;
    if (selectedSession === 4) return <DailyStoriesSession4 onExit={handleExitGraduate} />;
    if (selectedSession === 5) return <SocialDialogueSession5 onExit={handleExitGraduate} />;
    if (selectedSession === 6) return <StoryUnderstandingSession6 onExit={handleExitGraduate} />;
    if (selectedSession === 7) return <RealLifeProblemsSession7 onExit={handleExitGraduate} />;
    if (selectedSession === 8) return <DialogueBuilderSession8 onExit={handleExitGraduate} />;
    if (selectedSession === 9) return <StoryProblemSolverSession9 onExit={handleExitGraduate} />;
    if (selectedSession === 10) return <GraduateMasterSession10 onExit={handleExitGraduate} />;
  }

  // Grouper (section 4) Sessions 1–10: word families + Family Challenge + Grouper Master
  if (mode === 'games' && selectedSection === 4 && (selectedSession === 1 || selectedSession === 2 || selectedSession === 3 || selectedSession === 4 || selectedSession === 5 || selectedSession === 6 || selectedSession === 7 || selectedSession === 8 || selectedSession === 9 || selectedSession === 10)) {
    const handleExitSession = () => {
      setMode('sessions');
      setSelectedSession(null);
    };
    if (selectedSession === 1) return <ATWordSession1 onExit={handleExitSession} />;
    if (selectedSession === 2) return <INWordSession2 onExit={handleExitSession} />;
    if (selectedSession === 3) return <UNWordSession3 onExit={handleExitSession} />;
    if (selectedSession === 4) return <MixedWordSession4 onExit={handleExitSession} />;
    if (selectedSession === 5) return <OPWordSession5 onExit={handleExitSession} />;
    if (selectedSession === 6) return <ANWordSession6 onExit={handleExitSession} />;
    if (selectedSession === 7) return <ETWordSession7 onExit={handleExitSession} />;
    if (selectedSession === 8) return <IGWordSession8 onExit={handleExitSession} />;
    if (selectedSession === 9) return <FamilyChallengeSession9 onExit={handleExitSession} />;
    if (selectedSession === 10) return <GrouperMasterSession10 onExit={handleExitSession} />;
  }

  if (mode === 'games' && selectedSection !== null && selectedSession !== null) {
    return (
      <GameSelector
        section={selectedSection}
        level={selectedSession}
        onBack={handleBack}
        onSelectGame={handleSelectGame}
      />
    );
  }

  // Placeholder: no games built yet — show "Coming soon" for any section/session/game
  if (mode === 'playing' && selectedSection !== null && selectedSession !== null && selectedGame !== null) {
    return (
      <View style={styles.placeholderContainer}>
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderEmoji}>🎮</Text>
          <Text style={styles.placeholderTitle}>Game {selectedGame}</Text>
          <Text style={styles.placeholderText}>Section {selectedSection} • Session {selectedSession}</Text>
          <Text style={styles.placeholderSub}>Coming soon</Text>
          <TouchableOpacity style={styles.placeholderButton} onPress={() => { setSelectedGame(null); setMode('games'); }}>
            <Text style={styles.placeholderButtonText}>Back to games</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Special Education</Text>
        <TouchableOpacity onPress={handleShowMap} style={styles.mapButton}>
          <Ionicons name="map" size={24} color="#8B5CF6" />
        </TouchableOpacity>
      </View>

      <SectionSelector
        onSelectSection={handleSelectSection}
        onShowMap={handleShowMap}
      />
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  mapButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  placeholderCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    maxWidth: 320,
  },
  placeholderEmoji: { fontSize: 48, marginBottom: 16 },
  placeholderTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  placeholderText: { fontSize: 14, color: '#64748B', marginBottom: 4 },
  placeholderSub: { fontSize: 16, fontWeight: '600', color: '#8B5CF6', marginBottom: 24 },
  placeholderButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  placeholderButtonText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
});

