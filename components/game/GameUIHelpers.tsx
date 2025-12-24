// Shared UI components for premium game styling
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const PremiumBackButton: React.FC<{ onPress: () => void }> = ({ onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.backButton}>
    <LinearGradient
      colors={['#1E293B', '#0F172A']}
      style={styles.backButtonGradient}
    >
      <Text style={styles.backButtonText}>← Back</Text>
    </LinearGradient>
  </TouchableOpacity>
);

export const StatBadge: React.FC<{ label: string; value: string | number; accent?: boolean }> = ({ 
  label, 
  value, 
  accent = false 
}) => (
  <View style={[styles.statBadge, accent && styles.statBadgeAccent]}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  backButtonGradient: {
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.3,
  },
  statBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 18,
    alignItems: 'center',
    minWidth: 100,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  statBadgeAccent: {
    backgroundColor: '#FEF3C7',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
});


