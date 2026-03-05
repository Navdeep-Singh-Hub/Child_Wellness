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

