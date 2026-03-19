import { advanceTherapyProgress, fetchTherapyProgress, initTherapyProgress, type TherapyProgress } from '@/utils/api';
import { useEffect, useState } from 'react';

export interface SpecialEducationProgress {
  sections: Array<{
    sectionNumber: number;
    sessions: Array<{
      sessionNumber: number;
      games: Array<{
        gameNumber: number;
        completed: boolean;
        accuracy: number;
        lastPlayedAt?: string;
      }>;
      completed: boolean;
    }>;
    completed: boolean;
    unlocked: boolean;
  }>;
  currentSection: number;
  currentSession: number;
  currentGame: number;
}

export function useSpecialEducationProgress() {
  const [progress, setProgress] = useState<SpecialEducationProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      setLoading(true);
      const response = await fetchTherapyProgress();
      const specialEd = response.therapies.find((t) => t.therapy === 'special-education');
      
      if (specialEd && specialEd.sections) {
        // Normalize: backend may return sections[].levels (legacy) or sections[].sessions
        const sections = specialEd.sections.map((s: any) => ({
          ...s,
          sessions: s.sessions ?? (s.levels || []).map((l: any) => ({
            sessionNumber: l.levelNumber ?? l.sessionNumber,
            games: l.games ?? [],
            completed: l.completed ?? false,
          })),
        }));
        setProgress({
          sections,
          currentSection: specialEd.currentSection || 1,
          currentSession: specialEd.currentSessionSE ?? 1,
          currentGame: specialEd.currentGame || 1,
        });
      } else {
        const initResponse = await initTherapyProgress();
        const initSpecialEd = initResponse.therapies.find((t) => t.therapy === 'special-education');
        if (initSpecialEd && initSpecialEd.sections) {
          const sections = initSpecialEd.sections.map((s: any) => ({
            ...s,
            sessions: s.sessions ?? (s.levels || []).map((l: any) => ({
              sessionNumber: l.levelNumber ?? l.sessionNumber,
              games: l.games ?? [],
              completed: l.completed ?? false,
            })),
          }));
          setProgress({
            sections,
            currentSection: initSpecialEd.currentSection || 1,
            currentSession: initSpecialEd.currentSessionSE ?? 1,
            currentGame: initSpecialEd.currentGame || 1,
          });
        }
      }
    } catch (error) {
      console.error('Failed to load special education progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const markGameComplete = async (
    section: number,
    session: number,
    game: number,
    accuracy: number = 100
  ) => {
    try {
      await advanceTherapyProgress({
        therapy: 'special-education',
        sectionNumber: section,
        sessionNumberSE: session,
        gameNumber: game,
        accuracy,
      });
      await loadProgress();
    } catch (error) {
      console.error('Failed to mark game complete:', error);
      throw error;
    }
  };

  return {
    progress,
    loading,
    markGameComplete,
    refresh: loadProgress,
  };
}

// Helper to check if a section/session/game is unlocked
export function isUnlocked(
  progress: SpecialEducationProgress | null,
  section: number,
  session: number,
  game: number
): boolean {
  // Matcher (section 2) sessions 1–10 are always unlocked for play (Farm through Celebration Party)
  if (section === 2 && session >= 1 && session <= 10) return true;
  // Grouper (section 4) sessions 1–10: word families + Family Challenge + Grouper Master — always unlocked
  if (section === 4 && (session === 1 || session === 2 || session === 3 || session === 4 || session === 5 || session === 6 || session === 7 || session === 8 || session === 9 || session === 10)) return true;
  // Logic Lab (section 6) sessions 1–10 — Preposition IN…Logic Lab Master — always unlocked
  if (section === 6 && (session === 1 || session === 2 || session === 3 || session === 4 || session === 5 || session === 6 || session === 7 || session === 8 || session === 9 || session === 10)) return true;
  // The Citizen (section 8) Sessions 1–10: Safety Signs … Community Signs, Citizen Master Challenge — always unlocked
  if (section === 8 && (session === 1 || session === 2 || session === 3 || session === 4 || session === 5 || session === 6 || session === 7 || session === 8 || session === 9 || session === 10)) return true;
  // The Graduate (section 10) Sessions 1–9: Simple Conversations … Dialogue Builder, Story Problem Solver — always unlocked
  if (section === 10 && (session === 1 || session === 2 || session === 3 || session === 4 || session === 5 || session === 6 || session === 7 || session === 8 || session === 9 || session === 10)) return true;
  // Explorer (section 1) Sessions 1–10 — always unlocked
  if (section === 1 && (session === 1 || session === 2 || session === 3 || session === 4 || session === 5 || session === 6 || session === 7 || session === 8 || session === 9 || session === 10)) return true;
  // Builder (section 3) Sessions 1–10 — always unlocked
  if (section === 3 && (session === 1 || session === 2 || session === 3 || session === 4 || session === 5 || session === 6 || session === 7 || session === 8 || session === 9 || session === 10)) return true;
  // Reader (section 7) Sessions 1–10 — always unlocked
  if (section === 7 && (session === 1 || session === 2 || session === 3 || session === 4 || session === 5 || session === 6 || session === 7 || session === 8 || session === 9 || session === 10)) return true;
  // Counter (section 5) Sessions 1–10 — always unlocked
  if (section === 5 && (session === 1 || session === 2 || session === 3 || session === 4 || session === 5 || session === 6 || session === 7 || session === 8 || session === 9 || session === 10)) return true;
  // Level 9 / Clockwise (section 9) Session 1 — always unlocked (more sessions can be added later)
  if (section === 9 && (session === 1 || session === 2 || session === 3 || session === 4 || session === 5 || session === 6 || session === 7 || session === 8 || session === 9 || session === 10)) return true;
  if (!progress) return false;
  const sectionData = progress.sections.find((s) => s.sectionNumber === section);
  if (!sectionData || !sectionData.unlocked) return false;
  const sessionData = sectionData.sessions?.find((s) => s.sessionNumber === session);
  if (!sessionData) return false;
  if (game > 1) {
    const prevGame = sessionData.games?.find((g) => g.gameNumber === game - 1);
    return prevGame?.completed ?? false;
  }
  if (session > 1) {
    const prevSession = sectionData.sessions?.find((s) => s.sessionNumber === session - 1);
    return prevSession?.completed ?? false;
  }
  return false;
}

