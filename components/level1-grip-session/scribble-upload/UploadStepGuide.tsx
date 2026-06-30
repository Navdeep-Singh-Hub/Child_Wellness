import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GALLERY, UPLOAD_STEPS } from './theme';

interface UploadStepGuideProps {
  activeStep: 1 | 2 | 3;
}

export function UploadStepGuide({ activeStep }: UploadStepGuideProps) {
  return (
    <View style={styles.wrap}>
      {UPLOAD_STEPS.map((step, i) => {
        const done = step.id < activeStep;
        const active = step.id === activeStep;
        return (
          <React.Fragment key={step.id}>
            {i > 0 ? <View style={[styles.connector, done && styles.connectorDone]} /> : null}
            <View style={[styles.step, active && styles.stepActive, done && styles.stepDone]}>
              <Text style={styles.stepIcon}>{done ? '✓' : step.icon}</Text>
              <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>{step.label}</Text>
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  step: {
    alignItems: 'center',
    opacity: 0.5,
    minWidth: 64,
  },
  stepActive: { opacity: 1 },
  stepDone: { opacity: 0.85 },
  stepIcon: { fontSize: 22, marginBottom: 4 },
  stepLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: GALLERY.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stepLabelActive: { color: GALLERY.frameBrown },
  connector: {
    flex: 1,
    height: 2,
    backgroundColor: GALLERY.frameGoldLight,
    marginHorizontal: 4,
    marginBottom: 18,
    maxWidth: 40,
  },
  connectorDone: { backgroundColor: GALLERY.frameGold },
});
