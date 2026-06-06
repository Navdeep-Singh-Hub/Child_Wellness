import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

type PoseConfirmButtonProps = {
  visible: boolean;
  label?: string;
  onPress: () => void;
  color?: string;
};

const PoseConfirmButton: React.FC<PoseConfirmButtonProps> = ({
  visible,
  label = '✓ I did the same pose!',
  onPress,
  color = '#22C55E',
}) => {
  if (!visible) return null;

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: color }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    marginTop: 24,
    paddingHorizontal: 28,
    paddingVertical: 18,
    borderRadius: 16,
    alignSelf: 'center',
    minWidth: 280,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
});

export default PoseConfirmButton;
