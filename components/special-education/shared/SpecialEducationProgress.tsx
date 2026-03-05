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
  if (!progress) return section === 1 && session === 1 && game === 1;
  const sectionData = progress.sections.find((s) => s.sectionNumber === section);
  if (!sectionData || !sectionData.unlocked) return false;
  if (section === 1 && session === 1 && game === 1) return true;
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

