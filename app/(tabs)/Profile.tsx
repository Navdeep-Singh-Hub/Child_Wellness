import { useAuth } from '@/app/providers/AuthProvider';
import { getAdminCheck } from '@/utils/adminApi';
import { getMyProfile, updateMyProfile } from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Easing,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

// --- Components ---

const GlassCard = ({ children, style }: any) => (
    <View
        style={[
            {
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                borderRadius: 24,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.8)',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.08,
                shadowRadius: 16,
                elevation: 6,
            },
            style,
        ]}
    >
        {children}
    </View>
);

const AnimatedInput = ({ label, value, onChangeText, icon, placeholder, editable = true }: any) => {
    const [focused, setFocused] = useState(false);
    const focusAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(focusAnim, {
            toValue: focused ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [focused]);

    const borderColor = focusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['transparent', '#3B82F6'],
    });

    const bg = focusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['#F8FAFC', '#FFFFFF'],
    });

    return (
        <View style={{ marginBottom: 16 }}>
            <Text style={styles.inputLabel}>{label}</Text>
            <Animated.View
                style={[
                    styles.inputContainer,
                    {
                        borderColor,
                        backgroundColor: bg,
                        borderWidth: 1,
                    },
                ]}
            >
                <Ionicons name={icon} size={20} color={focused ? '#3B82F6' : '#94A3B8'} style={{ marginRight: 12 }} />
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="#94A3B8"
                    style={[styles.input, { color: editable ? '#1E293B' : '#64748B' }]}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    editable={editable}
                />
            </Animated.View>
        </View>
    );
};

export default function ProfileScreen() {
    const { logout, session } = useAuth();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [dob, setDob] = useState<string | null>(null);
    const [gender, setGender] = useState('');
    const [phoneCountryCode, setPhoneCountryCode] = useState('+91');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [saving, setSaving] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const avatarPulse = useRef(new Animated.Value(1)).current;

    // Placeholder user info
    const user = { fullName: '', username: '', imageUrl: '', primaryEmail: '' };

    useEffect(() => {
        (async () => {
            try {
                const p = await getMyProfile();
                setFirstName(p.firstName || '');
                setLastName(p.lastName || '');
                setEmail(p.email || '');
                setDob(p.dob || null);
                setGender(p.gender || '');
                setPhoneCountryCode(p.phoneCountryCode || '+91');
                setPhoneNumber(p.phoneNumber || '');
            } catch {
                // ignore
            } finally {
                setLoaded(true);
                Animated.parallel([
                    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
                    Animated.timing(slideAnim, { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
                ]).start();
            }
        })();
    }, []);

    // Admin check: use session.sub so backend can match ADMIN_AUTH0_IDS
    useEffect(() => {
        const auth0Id = session?.profile?.sub ?? session?.profile?.user_id ?? undefined;
        getAdminCheck(auth0Id).then((r) => setIsAdmin(r.isAdmin)).catch(() => setIsAdmin(false));
    }, [session?.profile?.sub, session?.profile?.user_id]);

    const onSave = async () => {
        try {
            setSaving(true);
            // Pulse animation
            Animated.sequence([
                Animated.timing(avatarPulse, { toValue: 1.1, duration: 150, useNativeDriver: true }),
                Animated.timing(avatarPulse, { toValue: 1, duration: 150, useNativeDriver: true }),
            ]).start();

            await updateMyProfile({
                firstName,
                lastName,
                dob: dob || undefined,
                gender: gender || undefined,
                phoneCountryCode: phoneCountryCode.trim() || undefined,
                phoneNumber: phoneNumber.trim() || undefined,
            });
            Alert.alert('Success', 'Profile updated successfully ✨');
        } catch (e: any) {
            Alert.alert('Error', e?.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
        } finally {
            router.replace('/(public)');
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <LinearGradient
                colors={['#F0F9FF', '#E0F2FE', '#F5F3FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            {/* Decorative Background Elements */}
            <View style={[styles.circle, styles.circle1]} />
            <View style={[styles.circle, styles.circle2]} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header / Avatar Section */}
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                        <View style={styles.header}>
                            <Animated.View style={[styles.avatarContainer, { transform: [{ scale: avatarPulse }] }]}>
                                <LinearGradient
                                    colors={['#FFFFFF', '#F1F5F9']}
                                    style={styles.avatarGradient}
                                >
                                    {user?.imageUrl ? (
                                        <Image source={{ uri: user.imageUrl }} style={styles.avatarImage} />
                                    ) : (
                                        <Ionicons name="person" size={48} color="#CBD5E1" />
                                    )}
                                </LinearGradient>
                                <View style={styles.editBadge}>
                                    <Ionicons name="camera" size={12} color="#FFF" />
                                </View>
                            </Animated.View>

                            <Text style={styles.name}>
                                {firstName ? `${firstName} ${lastName}` : 'Your Profile'}
                            </Text>
                            <Text style={styles.email}>{email || 'Loading...'}</Text>

                            <View style={styles.badgesRow}>
                                <View style={[styles.badge, { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' }]}>
                                    <Text style={[styles.badgeText, { color: '#4F46E5' }]}>AAC User</Text>
                                </View>
                                <View style={[styles.badge, { backgroundColor: '#ECFEFF', borderColor: '#A5F3FC' }]}>
                                    <Text style={[styles.badgeText, { color: '#0891B2' }]}>Kid Friendly</Text>
                                </View>
                            </View>
                        </View>

                        {/* Form Section */}
                        <GlassCard style={styles.formCard}>
                            <Text style={styles.sectionHeader}>Personal Details</Text>

                            <AnimatedInput
                                label="First Name"
                                value={firstName}
                                onChangeText={setFirstName}
                                icon="person-outline"
                                placeholder="Enter first name"
                                editable={loaded && !saving}
                            />

                            <AnimatedInput
                                label="Last Name"
                                value={lastName}
                                onChangeText={setLastName}
                                icon="person-outline"
                                placeholder="Enter last name"
                                editable={loaded && !saving}
                            />

                            <AnimatedInput
                                label="Email"
                                value={email}
                                icon="mail-outline"
                                editable={false}
                            />

                            <AnimatedInput
                                label="Date of Birth (YYYY-MM-DD)"
                                value={dob || ''}
                                onChangeText={(t) => setDob(t.trim() || null)}
                                icon="calendar-outline"
                                placeholder="e.g. 2020-01-01"
                                editable={loaded && !saving}
                            />

                            <Text style={styles.inputLabel}>Gender</Text>
                            <View style={styles.genderRow}>
                                {['male', 'female', 'other', 'prefer-not-to-say'].map((g) => (
                                    <Pressable
                                        key={g}
                                        onPress={() => setGender(gender === g ? '' : g)}
                                        style={[
                                            styles.genderChip,
                                            gender === g && styles.genderChipActive,
                                        ]}
                                    >
                                        <Text style={[styles.genderChipText, gender === g && styles.genderChipTextActive]}>
                                            {g === 'prefer-not-to-say' ? 'Prefer not to say' : g.charAt(0).toUpperCase() + g.slice(1)}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>

                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <View style={{ width: 100 }}>
                                    <AnimatedInput
                                        label="Country code"
                                        value={phoneCountryCode}
                                        onChangeText={setPhoneCountryCode}
                                        icon="call-outline"
                                        placeholder="+91"
                                        editable={loaded && !saving}
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <AnimatedInput
                                        label="Phone number"
                                        value={phoneNumber}
                                        onChangeText={setPhoneNumber}
                                        icon="call-outline"
                                        placeholder="10-digit number"
                                        editable={loaded && !saving}
                                    />
                                </View>
                            </View>

                            <Pressable
                                onPress={onSave}
                                disabled={saving}
                                style={({ pressed }) => [
                                    styles.saveButton,
                                    pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                                    saving && { backgroundColor: '#94A3B8' }
                                ]}
                            >
                                <LinearGradient
                                    colors={saving ? ['#94A3B8', '#64748B'] : ['#3B82F6', '#2563EB']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.saveGradient}
                                >
                                    {saving ? (
                                        <Text style={styles.saveText}>Saving...</Text>
                                    ) : (
                                        <>
                                            <Ionicons name="save-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
                                            <Text style={styles.saveText}>Save Changes</Text>
                                        </>
                                    )}
                                </LinearGradient>
                            </Pressable>
                        </GlassCard>

                        {/* Admin Dashboard (only when user is in ADMIN_AUTH0_IDS) */}
                        {isAdmin && (
                            <Pressable
                                onPress={() => router.push('/(admin)/dashboard' as any)}
                                style={({ pressed }) => [
                                    styles.adminButton,
                                    pressed && { backgroundColor: '#D1FAE5' },
                                ]}
                            >
                                <Ionicons name="shield-checkmark-outline" size={20} color="#047857" />
                                <Text style={styles.adminButtonText}>Admin Analytics</Text>
                                <Ionicons name="chevron-forward" size={18} color="#047857" />
                            </Pressable>
                        )}

                        {/* Logout Button */}
                        <Pressable
                            onPress={handleLogout}
                            style={({ pressed }) => [
                                styles.logoutButton,
                                pressed && { backgroundColor: '#FEF2F2' }
                            ]}
                        >
                            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                            <Text style={styles.logoutText}>Sign Out</Text>
                        </Pressable>

                        <Text style={styles.footerText}>
                            Child Wellness App v1.0.0
                        </Text>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    circle: {
        position: 'absolute',
        width: 400,
        height: 400,
        borderRadius: 200,
        opacity: 0.3,
    },
    circle1: {
        backgroundColor: '#C7D2FE',
        top: -150,
        left: -100,
    },
    circle2: {
        backgroundColor: '#E0F2FE',
        bottom: -100,
        right: -100,
    },
    scrollContent: {
        padding: 24,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 16,
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
    avatarGradient: {
        flex: 1,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: '#FFFFFF',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#3B82F6',
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    name: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 16,
    },
    badgesRow: {
        flexDirection: 'row',
        gap: 8,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '700',
    },
    formCard: {
        padding: 24,
        marginBottom: 24,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 8,
        marginLeft: 4,
    },
    genderRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    genderChip: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: '#F8FAFC',
    },
    genderChipActive: {
        borderColor: '#3B82F6',
        backgroundColor: '#EFF6FF',
    },
    genderChipText: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
    },
    genderChipTextActive: {
        color: '#2563EB',
        fontWeight: '600',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
    },
    input: {
        flex: 1,
        fontSize: 16,
        height: '100%',
    },
    saveButton: {
        marginTop: 8,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    saveGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
    },
    saveText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 32,
    },
    logoutText: {
        color: '#EF4444',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    adminButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#D1FAE5',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#A7F3D0',
        gap: 8,
    },
    adminButtonText: {
        color: '#047857',
        fontSize: 16,
        fontWeight: '600',
    },
    footerText: {
        textAlign: 'center',
        color: '#94A3B8',
        fontSize: 12,
    },
});
