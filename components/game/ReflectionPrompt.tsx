import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { submitGameFeedback } from '@/utils/api';

type Props = {
  logTimestamp?: string | null;
  onSaved?: () => void;
  observerName?: string;
};

const MOOD_CHOICES = [
  { value: 1, label: 'Tough', emoji: '😟' },
  { value: 2, label: 'Okay', emoji: '😐' },
  { value: 3, label: 'Good', emoji: '🙂' },
  { value: 4, label: 'Great', emoji: '😄' },
  { value: 5, label: 'Amazing', emoji: '🤩' },
];

export default function ReflectionPrompt({ logTimestamp, onSaved, observerName }: Props) {
  const [mood, setMood] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const disabled = !logTimestamp || (mood == null && !notes.trim());
  const helperText = useMemo(() => {
    if (!logTimestamp) return 'Stats syncing…';
    if (status === 'saved') return 'Thanks! Saved to timeline.';
    if (status === 'error') return 'Could not save. Try again?';
    return 'How did that session feel?';
  }, [logTimestamp, status]);

  const onSubmit = async () => {
    if (!logTimestamp || disabled) return;
    try {
      setStatus('saving');
      await submitGameFeedback({
        at: logTimestamp,
        mood: mood ?? undefined,
        notes: notes.trim() || undefined,
        observer: observerName,
      });
      setStatus('saved');
      if (onSaved) onSaved();
    } catch (error) {
      console.warn('feedback failed', error);
      setStatus('error');
    }
  };

  return (
    <View style={{ width: '100%', marginTop: 16, backgroundColor: '#F8FAFC', borderRadius: 16, padding: 16 }}>
      <Text style={{ fontWeight: '800', color: '#0F172A', marginBottom: 4 }}>Reflection</Text>
      <Text style={{ color: '#475569', marginBottom: 12 }}>{helperText}</Text>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
        {MOOD_CHOICES.map((choice) => {
          const active = mood === choice.value;
          return (
            <TouchableOpacity
              key={choice.value}
              onPress={() => setMood(choice.value)}
              disabled={!logTimestamp}
              style={{
                flex: 1,
                marginHorizontal: 4,
                paddingVertical: 10,
                borderRadius: 12,
                alignItems: 'center',
                borderWidth: 1.5,
                borderColor: active ? '#2563EB' : '#E2E8F0',
                backgroundColor: active ? '#DBEAFE' : '#FFFFFF',
              }}
            >
              <Text style={{ fontSize: 20 }}>{choice.emoji}</Text>
              <Text style={{ marginTop: 4, fontWeight: '700', color: active ? '#1D4ED8' : '#475569', fontSize: 12 }}>
                {choice.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, marginBottom: 12 }}>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Notes for therapist or parent (optional)"
          placeholderTextColor="#94A3B8"
          multiline
          editable={!!logTimestamp}
          style={{
            minHeight: 64,
            paddingHorizontal: 12,
            paddingVertical: 10,
            color: '#0F172A',
            textAlignVertical: 'top',
          }}
        />
      </View>

      <TouchableOpacity
        onPress={onSubmit}
        disabled={disabled || status === 'saving'}
        style={{
          backgroundColor: disabled ? '#CBD5F5' : '#2563EB',
          paddingVertical: 12,
          borderRadius: 14,
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        {status === 'saving' && <ActivityIndicator color="#fff" />}
        <Text style={{ color: '#fff', fontWeight: '800' }}>
          {status === 'saved' ? 'Saved' : 'Save reflection'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

