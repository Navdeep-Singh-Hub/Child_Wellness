import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { ActivityIndicator, Button, Chip, PaperProvider, TextInput } from 'react-native-paper';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { useAuth } from '@/app/_layout';
import { sendContactMessage } from '@/utils/api';

const Pressy = ({
  children,
  onPress,
  disabled,
  style,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: any;
}) => {
  const scale = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const tap = async () => {
    if (disabled) return;
    // tactile
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // spring pop
    scale.value = withSpring(0.96, { stiffness: 300, damping: 18 }, () => {
      scale.value = withSpring(1, { stiffness: 250, damping: 18 });
    });
    onPress?.();
  };

  return (
    <Animated.View style={[aStyle, style]}>
      <TouchableOpacity activeOpacity={0.9} onPress={tap} disabled={disabled}>
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

const Card = ({ children, style }: { children: React.ReactNode; style?: any }) => (
  <View
    style={[
      {
        backgroundColor: '#fff',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
      },
      style,
    ]}
  >
    {children}
  </View>
);

export default function Contact() {
  const { session } = useAuth();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  // Enable scrolling only when content exceeds viewport height
  const [containerH, setContainerH] = useState(0);
  const [contentH, setContentH] = useState(0);

  const userEmail = session?.user?.email ?? '';
  const userName = session?.user?.name ?? '';

  const subjectChips = useMemo(
    () => [
      'Appointment',
      'Therapy Query',
      'Admissions',
      'Feedback',
      'Partnership',
      'Other',
    ],
    []
  );

  const openUrl = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (e) {
      Alert.alert('Unable to open link');
    }
  };

  const onSend = async () => {
    if (!message.trim()) {
      Alert.alert('Message required', 'Please type your message.');
      return;
    }
    setSending(true);
    try {
      await sendContactMessage({
        subject: subject.trim() || undefined,
        message: message.trim(),
      });
      setSubject('');
      setMessage('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Sent ✅', 'Thanks! We received your message.');
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Failed to send', e?.message || 'Please try again later.');
    } finally {
      setSending(false);
    }
  };

  return (
    <PaperProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F6F7FB' }}>
        <View style={{ flex: 1 }}>
          <ScrollView
            style={{ flex: 1 }}
            onLayout={(e) => setContainerH(e.nativeEvent.layout.height)}
            onContentSizeChange={(_, h) => setContentH(h)}
            scrollEnabled={contentH > containerH + 10}
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            bounces={false}
            alwaysBounceVertical={false}
            overScrollMode="never"
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={false}
          >
          {/* HERO */}
          <Card>
            <LinearGradient
              colors={['#1e293b', '#0ea5e9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 20,
                padding: 20,
                overflow: 'hidden',
              }}
            >
              <Text style={{ color: '#A5F3FC', fontWeight: '800', fontSize: 12 }}>
                We’d love to hear from you
              </Text>
              <Text
                style={{
                  color: '#FFFFFF',
                  fontWeight: '900',
                  fontSize: 28,
                  marginTop: 6,
                }}
              >
                Contact Global Child Wellness
              </Text>
              <Text style={{ color: '#E0F2FE', marginTop: 8, lineHeight: 20 }}>
                Questions, feedback, or ideas? Drop us a message and we’ll reply soon.
              </Text>

              {/* quick identity pill */}
              {!!(userEmail || userName) && (
                <View
                  style={{
                    marginTop: 14,
                    alignSelf: 'flex-start',
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.24)',
                  }}
                >
                  <Text style={{ color: '#F0FDFA', fontWeight: '600' }}>
                    {userName || 'Signed in'} {userEmail ? `· ${userEmail}` : ''}
                  </Text>
                </View>
              )}

              <View style={{ height: 4, backgroundColor: '#38bdf8', borderRadius: 999, marginTop: 16, opacity: 0.75 }} />
            </LinearGradient>
          </Card>

          {/* QUICK LINKS */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 16 }}>
            <Pressy
              onPress={() =>
                openUrl('https://wa.me/917696730604?text=Hello%20Global%20Child%20Wellness')
              }
              style={{ flexBasis: '48%' }}
            >
              <Card style={{ padding: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="logo-whatsapp" size={22} color="#22C55E" />
                  <Text style={{ fontWeight: '800', color: '#0F172A', marginLeft: 8 }}>
                    WhatsApp
                  </Text>
                </View>
                <Text style={{ color: '#6B7280', marginTop: 6 }}>
                  Message us on +91 76967 30604
                </Text>
              </Card>
            </Pressy>

            <Pressy
              onPress={() => openUrl('https://www.instagram.com/global_child_wellness')}
              style={{ flexBasis: '48%' }}
            >
              <Card style={{ padding: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="logo-instagram" size={22} color="#DB2777" />
                  <Text style={{ fontWeight: '800', color: '#0F172A', marginLeft: 8 }}>
                    Instagram
                  </Text>
                </View>
                <Text style={{ color: '#6B7280', marginTop: 6 }}>Follow our updates</Text>
              </Card>
            </Pressy>

            <Pressy onPress={() => openUrl('https://globalchildwellness.com/')} style={{ flexBasis: '48%' }}>
              <Card style={{ padding: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="globe-outline" size={22} color="#2563EB" />
                  <Text style={{ fontWeight: '800', color: '#0F172A', marginLeft: 8 }}>
                    Website
                  </Text>
                </View>
                <Text style={{ color: '#6B7280', marginTop: 6 }}>globalchildwellness.com</Text>
              </Card>
            </Pressy>

            <Pressy onPress={() => openUrl('tel:+917696730604')} style={{ flexBasis: '48%' }}>
              <Card style={{ padding: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="call-outline" size={22} color="#16A34A" />
                  <Text style={{ fontWeight: '800', color: '#0F172A', marginLeft: 8 }}>Call</Text>
                </View>
                <Text style={{ color: '#6B7280', marginTop: 6 }}>+91 76967 30604</Text>
              </Card>
            </Pressy>

            <Pressy onPress={() => openUrl('mailto:support@globalchildwellness.com')} style={{ flexBasis: '48%' }}>
              <Card style={{ padding: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="mail-outline" size={22} color="#F59E0B" />
                  <Text style={{ fontWeight: '800', color: '#0F172A', marginLeft: 8 }}>Email</Text>
                </View>
                <Text style={{ color: '#6B7280', marginTop: 6 }}>support@globalchildwellness.com</Text>
              </Card>
            </Pressy>
          </View>

          {/* VISIT US */}
          <Card style={{ marginTop: 16, padding: 16 }}>
            <Text style={{ fontWeight: '900', color: '#0F172A', fontSize: 18 }}>Visit Us</Text>
            <Text style={{ color: '#6B7280', marginTop: 6 }}>127 I-BLOCK, SARABHA NAGAR</Text>

            <Pressy
              onPress={() =>
                openUrl(
                  'https://www.google.com/maps/search/?api=1&query=Global+Child+Wellness+Centre+Ludhiana'
                )
              }
              style={{ marginTop: 12 }}
            >
              <View
                style={{
                  backgroundColor: '#10B981',
                  borderRadius: 14,
                  paddingVertical: 12,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="navigate-outline" size={18} color="#fff" />
                <Text style={{ color: '#fff', fontWeight: '800', marginLeft: 8 }}>
                  Get directions
                </Text>
              </View>
            </Pressy>
          </Card>

          {/* MESSAGE FORM */}
          <Card style={{ marginTop: 16, padding: 16 }}>
            <Text style={{ fontWeight: '900', color: '#0F172A', fontSize: 18 }}>
              Send us a message
            </Text>
            <Text style={{ color: '#6B7280', marginTop: 4 }}>
              We’ll include your account details automatically.
            </Text>

            {/* Quick subjects */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
              {subjectChips.map((s) => (
                <Chip
                  key={s}
                  mode={subject === s ? 'flat' : 'outlined'}
                  selected={subject === s}
                  onPress={() => setSubject((prev) => (prev === s ? '' : s))}
                  style={{ borderRadius: 999 }}
                >
                  {s}
                </Chip>
              ))}
            </View>

            <TextInput
              mode="outlined"
              label="Subject (optional)"
              value={subject}
              onChangeText={setSubject}
              placeholder="Type a short subject"
              style={{ marginTop: 12, backgroundColor: '#fff' }}
              outlineColor="#E5E7EB"
              activeOutlineColor="#2563EB"
            />

            <TextInput
              mode="outlined"
              label="Message"
              value={message}
              onChangeText={setMessage}
              placeholder="Type your message…"
              style={{ marginTop: 12, backgroundColor: '#fff' }}
              outlineColor="#E5E7EB"
              activeOutlineColor="#2563EB"
              multiline
              numberOfLines={6}
            />

            <Button
              mode="contained"
              onPress={onSend}
              disabled={sending}
              style={{
                marginTop: 14,
                borderRadius: 12,
                paddingVertical: 4,
              }}
              contentStyle={{ paddingVertical: 6 }}
            >
              {sending ? 'Sending…' : 'Send message'}
            </Button>

            {sending && (
              <View style={{ marginTop: 10, alignItems: 'center' }}>
                <ActivityIndicator />
              </View>
            )}
          </Card>

          {/* FOOT NOTE */}
          <View style={{ marginTop: 14, alignItems: 'center' }}>
            <Text style={{ color: '#9CA3AF', fontSize: 12 }}>
              Typically responds within a few hours.
            </Text>
          </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </PaperProvider>
  );
}
