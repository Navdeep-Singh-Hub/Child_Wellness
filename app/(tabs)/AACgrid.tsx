import { CATEGORIES, CATEGORY_STYLES, COMMON_WORDS, tileImages, type Category, type Tile } from '@/constants/aac';
import { addCustomTile, API_BASE_URL, getCustomTiles, getFavorites, toggleFavorite, type CustomTile } from '@/utils/api';
import { speak as speakTTS, stopTTS } from '@/utils/tts';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, usePathname, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Toast from 'react-native-toast-message';



import {
  Alert,
  Easing,
  FlatList,
  Image,
  InteractionManager,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  Animated as RNAnimated,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  useWindowDimensions,
  View
} from 'react-native';

import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MENU_WIDTH = 280;
const CLOSED_OFFSET = MENU_WIDTH + 16;

function GridMenu({ inline = false, selectedLang = 'en-US' }: { inline?: boolean; selectedLang?: 'en-US' | 'hi-IN' | 'pa-IN' | 'ta-IN' | 'te-IN' }) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  const slideAnim = useRef(new RNAnimated.Value(CLOSED_OFFSET)).current;
  const overlayOpacity = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    if (open) {
      RNAnimated.parallel([
        RNAnimated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        RNAnimated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      RNAnimated.parallel([
        RNAnimated.timing(slideAnim, {
          toValue: CLOSED_OFFSET,
          duration: 300,
          useNativeDriver: true,
        }),
        RNAnimated.timing(overlayOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [open]);

  // Get menu items with translations - we'll need selectedLang from parent
  // For now, using English as default, will be updated in main component
  const menuItems = [
    { title: 'Home', route: '/(tabs)', icon: 'home-outline', key: 'home' },
    { title: 'Games', route: '/(tabs)/Games', icon: 'game-controller-outline', key: 'games' },
    { title: 'Smart Explorer', route: '/(tabs)/SmartExplorer', icon: 'map-outline', key: 'smartExplorer' },
    { title: 'Grids', route: '/(tabs)/AACgrid', icon: 'grid-outline', key: 'grids' },
    { title: 'Profile', route: '/(tabs)/Profile', icon: 'person-outline', key: 'profile' },
    { title: 'Contact Us', route: '/(tabs)/Contact', icon: 'mail-outline', key: 'contactUs' },
    { title: 'About Us', route: '/(tabs)/About', icon: 'information-circle-outline', key: 'aboutUs' },
    { title: 'Add Tile', route: '/(tabs)/AACgrid?addTile=true', icon: 'add-circle-outline', isAction: true, key: 'addTile' },
  ];

  const navigateTo = (route: string) => {
    setOpen(false);
    setTimeout(() => {
      router.navigate(route as any);
    }, 100);
  };

  return (
    <>
      {/* Menu Button */}
      <TouchableOpacity
        onPress={() => setOpen(true)}
        activeOpacity={0.9}
        style={{
          right: inline ? undefined : 16,
          top: inline ? undefined : Platform.select({
            web: 16,
            ios: insets.top + 8,
            android: insets.top + 8,
            default: 16,
          }),
          zIndex: 1000,
          width: 44,
          height: 44,
          borderRadius: 22,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#111827',
          shadowColor: '#000',
          shadowOpacity: 0.25,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
          elevation: 10,
        }}
            accessibilityLabel={t('openMenu', selectedLang)}
      >
        <Ionicons name="menu" size={22} color="#fff" />
      </TouchableOpacity>

      {/* Full-screen overlay via Modal for consistent slide menu */}
      <Modal visible={open} transparent animationType="none" onRequestClose={() => setOpen(false)}>
        <View style={{ flex: 1 }}>
          <Pressable
            onPress={() => setOpen(false)}
            style={[StyleSheet.absoluteFillObject, { zIndex: 999 }]}
          >
            <RNAnimated.View
              style={{
                flex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                opacity: overlayOpacity,
              }}
            />
          </Pressable>

          {/* Slide-out Menu (right side) */}
          <RNAnimated.View
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: MENU_WIDTH,
              backgroundColor: '#FFFFFF',
              zIndex: 1001,
              transform: [{ translateX: slideAnim }],
              shadowColor: '#000',
              shadowOpacity: 0.3,
              shadowRadius: 20,
              shadowOffset: { width: -4, height: 0 },
              elevation: 15,
              paddingTop: insets.top + 20,
            }}
          >
            <View style={{ paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 24, fontWeight: '800', color: '#111827' }}>{t('menu', selectedLang)}</Text>
                <TouchableOpacity
                  onPress={() => setOpen(false)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#F3F4F6',
                  }}
                >
                  <Ionicons name="close" size={20} color="#111827" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ paddingTop: 12 }}>
              {menuItems.map((item, index) => {
                // Improved active detection: check multiple pathname variations
                const normalizedPathname = (pathname || '').toLowerCase();
                const normalizedRoute = (item.route || '').toLowerCase();

                // Extract route name from paths (e.g., "/(tabs)/Games" -> "games")
                const routeName = normalizedRoute.split('/').pop()?.split('?')[0] || '';
                const pathnameParts = normalizedPathname.split('/');
                const currentRouteName = pathnameParts[pathnameParts.length - 1]?.split('?')[0] || '';

                // Check if active: exact match, route name matches, or home route special case
                const isActive =
                  normalizedPathname === normalizedRoute ||
                  normalizedPathname === normalizedRoute.replace('/(tabs)', '') ||
                  (normalizedRoute === '/(tabs)' && (normalizedPathname === '/' || normalizedPathname === '' || normalizedPathname === '/(tabs)')) ||
                  (routeName && routeName === currentRouteName && routeName !== '' && routeName !== 'tabs') ||
                  (normalizedPathname.includes(routeName) && routeName !== '' && routeName !== 'tabs' && !routeName.includes('addtile'));

                const isAction = (item as any).isAction;

                // Get filled icon for active state (if available)
                const iconName = isActive && !isAction && item.icon.includes('-outline')
                  ? (item.icon.replace('-outline', '') as any)
                  : (item.icon as any);

                return (
                  <TouchableOpacity
                    key={item.title}
                    onPress={() => {
                      if (isAction && item.key === 'addTile') {
                        setOpen(false);
                        // Trigger add modal via context or direct call
                        setTimeout(() => {
                          // This will be handled by the parent component
                          router.setParams({ addTile: 'true' });
                        }, 100);
                      } else {
                        navigateTo(item.route);
                      }
                    }}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 16,
                      paddingHorizontal: 20,
                      backgroundColor: isActive ? '#F0F9FF' : (isAction ? '#EEF2FF' : 'transparent'),
                      borderLeftWidth: isActive ? 4 : 0,
                      borderLeftColor: '#2563EB',
                      marginTop: isAction ? 8 : 0,
                      borderTopWidth: isAction ? 1 : 0,
                      borderTopColor: '#E5E7EB',
                    }}
                  >
                    <Ionicons
                      name={iconName}
                      size={22}
                      color={isActive ? '#2563EB' : (isAction ? '#6366F1' : '#6B7280')}
                      style={{ marginRight: 16 }}
                    />
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: isActive ? '700' : (isAction ? '700' : '600'),
                        color: isActive ? '#2563EB' : (isAction ? '#6366F1' : '#374151'),
                      }}
                    >
                      {item.key ? t(item.key, selectedLang) : item.title}
                    </Text>
                    {isActive && (
                      <View style={{
                        marginLeft: 'auto',
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: '#2563EB',
                      }} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </RNAnimated.View>
        </View>
      </Modal>
    </>
  );
}

// ---------- Language + Translations ----------
type LangKey = 'en-US' | 'hi-IN' | 'pa-IN' | 'ta-IN' | 'te-IN';
const LANG_OPTIONS: { key: LangKey; label: string }[] = [
  { key: 'en-US', label: 'English' },
  { key: 'hi-IN', label: 'Hindi' },
  { key: 'pa-IN', label: 'Punjabi' },
  { key: 'ta-IN', label: 'Tamil' },
  { key: 'te-IN', label: 'Telugu' },
];

// UI Translations for interface elements
const UI_TRANSLATIONS: Record<LangKey, Record<string, string>> = {
  'en-US': {
    menu: 'Menu',
    home: 'Home',
    games: 'Games',
    smartExplorer: 'Smart Explorer',
    grids: 'Grids',
    profile: 'Profile',
    contactUs: 'Contact Us',
    aboutUs: 'About Us',
    addTile: 'Add Tile',
    chooseLanguage: 'Choose language',
    close: 'Close',
    createCustomTile: 'Create custom tile',
    editTile: 'Edit Tile',
    delete: 'Delete',
    edit: 'Edit',
    save: 'Save',
    cancel: 'Cancel',
    uploading: 'Uploading…',
    saving: 'Saving…',
    id: 'ID (no spaces)',
    label: 'Label',
    emoji: 'Emoji (optional)',
    imageUrl: 'Image URL',
    upload: 'Upload',
    imageUrlPlaceholder: 'https://example.com/picture.png',
    idPlaceholder: 'e.g. my_dog',
    labelPlaceholder: 'e.g. My dog',
    emojiPlaceholder: 'e.g. 🐶',
    chooseImage: 'Choose image from device',
    changeImage: 'Change image',
    maxSize: 'Max size: 1MB',
    willUploadOnSave: 'Will upload on Save',
    mustStartWithHttp: 'Must start with http:// or https://',
    favorites: 'Favorites',
    myTiles: 'My Tiles',
    deleteTile: 'Delete tile',
    deleteConfirm: 'Delete',
    goBack: 'Go back to Home',
    openMenu: 'Open menu',
    common: 'Common',
    searchWords: 'Search words…',
    buildSentence: 'Build a sentence…',
    transport: 'Transport',
    food: 'Food',
    jobs: 'Jobs',
    emotions: 'Emotions',
    actions: 'Actions',
    imageSelected: 'Image selected',
    photoAccessRequired: 'Photo access is required to pick an image.',
    allowPhotoAccess: 'Allow photo access to continue.',
    imageTooLarge: 'Image too large (max 1MB).',
    noImageSelected: 'No image selected.',
    customTileCreated: 'Custom tile created.',
    couldNotCreateTile: 'Could not create tile.',
    failed: 'Failed',
    couldNotUpdateFavorites: 'Could not update favorites',
    idAndLabelRequired: 'ID and Label are required.',
    pleaseEnterId: 'Please enter an ID (only letters, numbers, _ or -).',
    missingId: 'Missing ID.',
    invalidId: 'Invalid ID. Use letters, numbers, _ or - (2–40 chars).',
    invalidIdFormat: 'Invalid ID format.',
    pleaseEnterLabel: 'Please enter a Label.',
    missingLabel: 'Missing Label.',
    pleaseAddImageUrl: 'Please add an Image URL or switch to Upload.',
    missingImageUrl: 'Missing Image URL.',
    invalidUrl: 'That does not look like a valid http/https URL.',
    pleaseChooseImage: 'Please choose an image to upload (max 1MB).',
  },
  'hi-IN': {
    menu: 'मेनू',
    home: 'होम',
    games: 'गेम्स',
    smartExplorer: 'स्मार्ट एक्सप्लोरर',
    grids: 'ग्रिड्स',
    profile: 'प्रोफाइल',
    contactUs: 'संपर्क करें',
    aboutUs: 'हमारे बारे में',
    addTile: 'टाइल जोड़ें',
    chooseLanguage: 'भाषा चुनें',
    close: 'बंद करें',
    createCustomTile: 'कस्टम टाइल बनाएं',
    editTile: 'टाइल संपादित करें',
    delete: 'हटाएं',
    edit: 'संपादित करें',
    save: 'सहेजें',
    cancel: 'रद्द करें',
    uploading: 'अपलोड हो रहा है…',
    saving: 'सहेजा जा रहा है…',
    id: 'आईडी (बिना स्पेस के)',
    label: 'लेबल',
    emoji: 'इमोजी (वैकल्पिक)',
    imageUrl: 'छवि URL',
    upload: 'अपलोड करें',
    imageUrlPlaceholder: 'https://example.com/picture.png',
    idPlaceholder: 'जैसे: my_dog',
    labelPlaceholder: 'जैसे: मेरा कुत्ता',
    emojiPlaceholder: 'जैसे: 🐶',
    chooseImage: 'डिवाइस से छवि चुनें',
    changeImage: 'छवि बदलें',
    maxSize: 'अधिकतम आकार: 1MB',
    willUploadOnSave: 'सहेजने पर अपलोड होगा',
    mustStartWithHttp: 'http:// या https:// से शुरू होना चाहिए',
    favorites: 'पसंदीदा',
    myTiles: 'मेरी टाइल्स',
    deleteTile: 'टाइल हटाएं',
    deleteConfirm: 'हटाएं',
    goBack: 'होम पर वापस जाएं',
    openMenu: 'मेनू खोलें',
    common: 'सामान्य',
    searchWords: 'शब्द खोजें…',
    buildSentence: 'वाक्य बनाएं…',
    transport: 'यातायात',
    food: 'भोजन',
    jobs: 'नौकरियां',
    emotions: 'भावनाएं',
    actions: 'क्रियाएं',
    imageSelected: 'छवि चयनित',
    photoAccessRequired: 'छवि चुनने के लिए फोटो एक्सेस आवश्यक है।',
    allowPhotoAccess: 'जारी रखने के लिए फोटो एक्सेस की अनुमति दें।',
    imageTooLarge: 'छवि बहुत बड़ी है (अधिकतम 1MB)।',
    noImageSelected: 'कोई छवि चयनित नहीं।',
    customTileCreated: 'कस्टम टाइल बनाई गई।',
    couldNotCreateTile: 'टाइल नहीं बना सके।',
    failed: 'असफल',
    couldNotUpdateFavorites: 'पसंदीदा अपडेट नहीं कर सके',
    idAndLabelRequired: 'आईडी और लेबल आवश्यक हैं।',
    pleaseEnterId: 'कृपया एक आईडी दर्ज करें (केवल अक्षर, संख्या, _ या -)।',
    missingId: 'आईडी गायब है।',
    invalidId: 'अमान्य आईडी। अक्षर, संख्या, _ या - (2-40 वर्ण) का उपयोग करें।',
    invalidIdFormat: 'अमान्य आईडी प्रारूप।',
    pleaseEnterLabel: 'कृपया एक लेबल दर्ज करें।',
    missingLabel: 'लेबल गायब है।',
    pleaseAddImageUrl: 'कृपया एक छवि URL जोड़ें या अपलोड पर स्विच करें।',
    missingImageUrl: 'छवि URL गायब है।',
    invalidUrl: 'यह एक मान्य http/https URL नहीं लगता।',
    pleaseChooseImage: 'कृपया अपलोड करने के लिए एक छवि चुनें (अधिकतम 1MB)।',
  },
  'pa-IN': {
    menu: 'ਮੀਨੂ',
    home: 'ਹੋਮ',
    games: 'ਗੇਮਜ਼',
    smartExplorer: 'ਸਮਾਰਟ ਐਕਸਪਲੋਰਰ',
    grids: 'ਗ੍ਰਿਡਸ',
    profile: 'ਪ੍ਰੋਫਾਈਲ',
    contactUs: 'ਸੰਪਰਕ ਕਰੋ',
    aboutUs: 'ਸਾਡੇ ਬਾਰੇ',
    addTile: 'ਟਾਈਲ ਜੋੜੋ',
    chooseLanguage: 'ਭਾਸ਼ਾ ਚੁਣੋ',
    close: 'ਬੰਦ ਕਰੋ',
    createCustomTile: 'ਕਸਟਮ ਟਾਈਲ ਬਣਾਓ',
    editTile: 'ਟਾਈਲ ਸੰਪਾਦਿਤ ਕਰੋ',
    delete: 'ਹਟਾਓ',
    edit: 'ਸੰਪਾਦਿਤ ਕਰੋ',
    save: 'ਸੁਰੱਖਿਅਤ ਕਰੋ',
    cancel: 'ਰੱਦ ਕਰੋ',
    uploading: 'ਅਪਲੋਡ ਹੋ ਰਿਹਾ ਹੈ…',
    saving: 'ਸੁਰੱਖਿਅਤ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ…',
    id: 'ਆਈਡੀ (ਸਪੇਸ ਤੋਂ ਬਿਨਾਂ)',
    label: 'ਲੇਬਲ',
    emoji: 'ਇਮੋਜੀ (ਵਿਕਲਪਿਕ)',
    imageUrl: 'ਚਿੱਤਰ URL',
    upload: 'ਅਪਲੋਡ ਕਰੋ',
    imageUrlPlaceholder: 'https://example.com/picture.png',
    idPlaceholder: 'ਜਿਵੇਂ: my_dog',
    labelPlaceholder: 'ਜਿਵੇਂ: ਮੇਰਾ ਕੁੱਤਾ',
    emojiPlaceholder: 'ਜਿਵੇਂ: 🐶',
    chooseImage: 'ਡਿਵਾਈਸ ਤੋਂ ਚਿੱਤਰ ਚੁਣੋ',
    changeImage: 'ਚਿੱਤਰ ਬਦਲੋ',
    maxSize: 'ਅਧਿਕਤਮ ਸਾਈਜ਼: 1MB',
    willUploadOnSave: 'ਸੁਰੱਖਿਅਤ ਕਰਨ ਤੇ ਅਪਲੋਡ ਹੋਵੇਗਾ',
    mustStartWithHttp: 'http:// ਜਾਂ https:// ਤੋਂ ਸ਼ੁਰੂ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ',
    favorites: 'ਪਸੰਦੀਦਾ',
    myTiles: 'ਮੇਰੀਆਂ ਟਾਈਲਾਂ',
    deleteTile: 'ਟਾਈਲ ਹਟਾਓ',
    deleteConfirm: 'ਹਟਾਓ',
    goBack: 'ਹੋਮ ਤੇ ਵਾਪਸ ਜਾਓ',
    openMenu: 'ਮੀਨੂ ਖੋਲ੍ਹੋ',
    common: 'ਸਾਧਾਰਣ',
    searchWords: 'ਸ਼ਬਦ ਖੋਜੋ…',
    buildSentence: 'ਵਾਕ ਬਣਾਓ…',
    transport: 'ਆਵਾਜਾਈ',
    food: 'ਖਾਣਾ',
    jobs: 'ਨੌਕਰੀਆਂ',
    emotions: 'ਭਾਵਨਾਵਾਂ',
    actions: 'ਕਾਰਵਾਈਆਂ',
    imageSelected: 'ਚਿੱਤਰ ਚੁਣਿਆ ਗਿਆ',
    photoAccessRequired: 'ਚਿੱਤਰ ਚੁਣਨ ਲਈ ਫੋਟੋ ਪਹੁੰਚ ਲੋੜੀਂਦੀ ਹੈ।',
    allowPhotoAccess: 'ਜਾਰੀ ਰੱਖਣ ਲਈ ਫੋਟੋ ਪਹੁੰਚ ਦੀ ਇਜਾਜ਼ਤ ਦਿਓ।',
    imageTooLarge: 'ਚਿੱਤਰ ਬਹੁਤ ਵੱਡਾ ਹੈ (ਅਧਿਕਤਮ 1MB)।',
    noImageSelected: 'ਕੋਈ ਚਿੱਤਰ ਚੁਣਿਆ ਨਹੀਂ ਗਿਆ।',
    customTileCreated: 'ਕਸਟਮ ਟਾਈਲ ਬਣਾਈ ਗਈ।',
    couldNotCreateTile: 'ਟਾਈਲ ਨਹੀਂ ਬਣਾ ਸਕੇ।',
    failed: 'ਅਸਫਲ',
    couldNotUpdateFavorites: 'ਪਸੰਦੀਦਾ ਅਪਡੇਟ ਨਹੀਂ ਕਰ ਸਕੇ',
    idAndLabelRequired: 'ਆਈਡੀ ਅਤੇ ਲੇਬਲ ਲੋੜੀਂਦੇ ਹਨ।',
    pleaseEnterId: 'ਕ੍ਰਿਪਾ ਕਰਕੇ ਇੱਕ ਆਈਡੀ ਦਰਜ ਕਰੋ (ਕੇਵਲ ਅੱਖਰ, ਨੰਬਰ, _ ਜਾਂ -)।',
    missingId: 'ਆਈਡੀ ਗਾਇਬ ਹੈ।',
    invalidId: 'ਅਵੈਧ ਆਈਡੀ। ਅੱਖਰ, ਨੰਬਰ, _ ਜਾਂ - (2-40 ਅੱਖਰ) ਦੀ ਵਰਤੋਂ ਕਰੋ।',
    invalidIdFormat: 'ਅਵੈਧ ਆਈਡੀ ਫਾਰਮੈਟ।',
    pleaseEnterLabel: 'ਕ੍ਰਿਪਾ ਕਰਕੇ ਇੱਕ ਲੇਬਲ ਦਰਜ ਕਰੋ।',
    missingLabel: 'ਲੇਬਲ ਗਾਇਬ ਹੈ।',
    pleaseAddImageUrl: 'ਕ੍ਰਿਪਾ ਕਰਕੇ ਇੱਕ ਚਿੱਤਰ URL ਜੋੜੋ ਜਾਂ ਅਪਲੋਡ \'ਤੇ ਸਵਿਚ ਕਰੋ।',
    missingImageUrl: 'ਚਿੱਤਰ URL ਗਾਇਬ ਹੈ।',
    invalidUrl: 'ਇਹ ਇੱਕ ਵੈਧ http/https URL ਨਹੀਂ ਲੱਗਦਾ।',
    pleaseChooseImage: 'ਕ੍ਰਿਪਾ ਕਰਕੇ ਅਪਲੋਡ ਕਰਨ ਲਈ ਇੱਕ ਚਿੱਤਰ ਚੁਣੋ (ਅਧਿਕਤਮ 1MB)।',
  },
  'ta-IN': {
    menu: 'மெனு',
    home: 'வீடு',
    games: 'விளையாட்டுகள்',
    smartExplorer: 'ஸ்மார்ட் எக்ஸ்ப்ளோரர்',
    grids: 'கட்டங்கள்',
    profile: 'சுயவிவரம்',
    contactUs: 'எங்களைத் தொடர்பு கொள்ளுங்கள்',
    aboutUs: 'எங்களைப் பற்றி',
    addTile: 'டைல் சேர்',
    chooseLanguage: 'மொழியைத் தேர்ந்தெடுக்கவும்',
    close: 'மூடு',
    createCustomTile: 'தனிப்பயன் டைல் உருவாக்க',
    editTile: 'டைல் திருத்த',
    delete: 'நீக்கு',
    edit: 'திருத்த',
    save: 'சேமி',
    cancel: 'ரத்துசெய்',
    uploading: 'பதிவேற்றப்படுகிறது…',
    saving: 'சேமிக்கப்படுகிறது…',
    id: 'ஐடி (இடைவெளி இல்லாமல்)',
    label: 'லேபிள்',
    emoji: 'எமோஜி (விருப்பமானது)',
    imageUrl: 'பட URL',
    upload: 'பதிவேற்று',
    imageUrlPlaceholder: 'https://example.com/picture.png',
    idPlaceholder: 'எ.கா: my_dog',
    labelPlaceholder: 'எ.கா: என் நாய்',
    emojiPlaceholder: 'எ.கா: 🐶',
    chooseImage: 'சாதனத்திலிருந்து படத்தைத் தேர்ந்தெடுக்கவும்',
    changeImage: 'படத்தை மாற்று',
    maxSize: 'அதிகபட்ச அளவு: 1MB',
    willUploadOnSave: 'சேமிக்கும்போது பதிவேற்றப்படும்',
    mustStartWithHttp: 'http:// அல்லது https:// இல் தொடங்க வேண்டும்',
    favorites: 'பிடித்தவை',
    myTiles: 'எனது டைல்கள்',
    deleteTile: 'டைலை நீக்கு',
    deleteConfirm: 'நீக்கு',
    goBack: 'வீட்டிற்குத் திரும்பு',
    openMenu: 'மெனுவைத் திற',
    common: 'பொதுவான',
    searchWords: 'சொற்களைத் தேடு…',
    buildSentence: 'வாக்கியத்தை உருவாக்கு…',
    transport: 'போக்குவரத்து',
    food: 'உணவு',
    jobs: 'வேலைகள்',
    emotions: 'உணர்வுகள்',
    actions: 'செயல்கள்',
    imageSelected: 'படம் தேர்ந்தெடுக்கப்பட்டது',
    photoAccessRequired: 'படத்தைத் தேர்ந்தெடுக்க புகைப்பட அணுகல் தேவை.',
    allowPhotoAccess: 'தொடர புகைப்பட அணுகலை அனுமதிக்கவும்.',
    imageTooLarge: 'படம் மிகப் பெரியது (அதிகபட்சம் 1MB).',
    noImageSelected: 'படம் தேர்ந்தெடுக்கப்படவில்லை.',
    customTileCreated: 'தனிப்பயன் டைல் உருவாக்கப்பட்டது.',
    couldNotCreateTile: 'டைலை உருவாக்க முடியவில்லை.',
    failed: 'தோல்வி',
    couldNotUpdateFavorites: 'பிடித்தவைகளை புதுப்பிக்க முடியவில்லை',
    idAndLabelRequired: 'ஐடி மற்றும் லேபிள் தேவை.',
    pleaseEnterId: 'ஒரு ஐடியை உள்ளிடவும் (எழுத்துக்கள், எண்கள், _ அல்லது - மட்டும்).',
    missingId: 'ஐடி காணவில்லை.',
    invalidId: 'தவறான ஐடி. எழுத்துக்கள், எண்கள், _ அல்லது - (2-40 எழுத்துக்கள்) பயன்படுத்தவும்.',
    invalidIdFormat: 'தவறான ஐடி வடிவம்.',
    pleaseEnterLabel: 'ஒரு லேபிளை உள்ளிடவும்.',
    missingLabel: 'லேபிள் காணவில்லை.',
    pleaseAddImageUrl: 'ஒரு பட URL ஐ சேர்க்கவும் அல்லது பதிவேற்றத்திற்கு மாறவும்.',
    missingImageUrl: 'பட URL காணவில்லை.',
    invalidUrl: 'இது சரியான http/https URL போல் தெரியவில்லை.',
    pleaseChooseImage: 'பதிவேற்ற ஒரு படத்தைத் தேர்ந்தெடுக்கவும் (அதிகபட்சம் 1MB).',
  },
  'te-IN': {
    menu: 'మెనూ',
    home: 'హోమ్',
    games: 'గేమ్స్',
    smartExplorer: 'స్మార్ట్ ఎక్స్ప్లోరర్',
    grids: 'గ్రిడ్స్',
    profile: 'ప్రొఫైల్',
    contactUs: 'మాకు సంప్రదించండి',
    aboutUs: 'మా గురించి',
    addTile: 'టైల్ జోడించు',
    chooseLanguage: 'భాషను ఎంచుకోండి',
    close: 'మూసివేయి',
    createCustomTile: 'కస్టమ్ టైల్ సృష్టించు',
    editTile: 'టైల్ సవరించు',
    delete: 'తొలగించు',
    edit: 'సవరించు',
    save: 'సేవ్ చేయి',
    cancel: 'రద్దు చేయి',
    uploading: 'అప్లోడ్ అవుతోంది…',
    saving: 'సేవ్ అవుతోంది…',
    id: 'ఐడి (స్పేస్ లేకుండా)',
    label: 'లేబుల్',
    emoji: 'ఇమోజీ (ఐచ్ఛికం)',
    imageUrl: 'చిత్ర URL',
    upload: 'అప్లోడ్ చేయి',
    imageUrlPlaceholder: 'https://example.com/picture.png',
    idPlaceholder: 'ఉదా: my_dog',
    labelPlaceholder: 'ఉదా: నా కుక్క',
    emojiPlaceholder: 'ఉదా: 🐶',
    chooseImage: 'పరికరం నుండి చిత్రాన్ని ఎంచుకోండి',
    changeImage: 'చిత్రాన్ని మార్చు',
    maxSize: 'గరిష్ట పరిమాణం: 1MB',
    willUploadOnSave: 'సేవ్ చేసినప్పుడు అప్లోడ్ అవుతుంది',
    mustStartWithHttp: 'http:// లేదా https:// తో ప్రారంభం కావాలి',
    favorites: 'ఇష్టమైనవి',
    myTiles: 'నా టైల్స్',
    deleteTile: 'టైల్ తొలగించు',
    deleteConfirm: 'తొలగించు',
    goBack: 'హోమ్‌కు తిరిగి వెళ్ళు',
    openMenu: 'మెనూను తెరువు',
    common: 'సాధారణ',
    searchWords: 'పదాలను శోధించు…',
    buildSentence: 'వాక్యాన్ని నిర్మించు…',
    transport: 'రవాణా',
    food: 'ఆహారం',
    jobs: 'ఉద్యోగాలు',
    emotions: 'భావోద్వేగాలు',
    actions: 'చర్యలు',
    imageSelected: 'చిత్రం ఎంచుకోబడింది',
    photoAccessRequired: 'చిత్రాన్ని ఎంచుకోడానికి ఫోటో యాక్సెస్ అవసరం.',
    allowPhotoAccess: 'కొనసాగించడానికి ఫోటో యాక్సెస్ అనుమతించండి.',
    imageTooLarge: 'చిత్రం చాలా పెద్దది (గరిష్టం 1MB).',
    noImageSelected: 'చిత్రం ఎంచుకోబడలేదు.',
    customTileCreated: 'కస్టమ్ టైల్ సృష్టించబడింది.',
    couldNotCreateTile: 'టైల్ సృష్టించలేకపోయింది.',
    failed: 'విఫలం',
    couldNotUpdateFavorites: 'ఇష్టమైనవాటిని నవీకరించలేకపోయింది',
    idAndLabelRequired: 'ఐడి మరియు లేబుల్ అవసరం.',
    pleaseEnterId: 'ఒక ఐడిని నమోదు చేయండి (అక్షరాలు, సంఖ్యలు, _ లేదా - మాత్రమే).',
    missingId: 'ఐడి లేదు.',
    invalidId: 'చెల్లని ఐడి. అక్షరాలు, సంఖ్యలు, _ లేదా - (2-40 అక్షరాలు) ఉపయోగించండి.',
    invalidIdFormat: 'చెల్లని ఐడి ఫార్మాట్.',
    pleaseEnterLabel: 'ఒక లేబుల్ను నమోదు చేయండి.',
    missingLabel: 'లేబుల్ లేదు.',
    pleaseAddImageUrl: 'ఒక చిత్ర URL ని జోడించండి లేదా అప్లోడ్‌కు మారండి.',
    missingImageUrl: 'చిత్ర URL లేదు.',
    invalidUrl: 'ఇది చెల్లుబాటు అయ్యే http/https URL లాగా కనిపించడం లేదు.',
    pleaseChooseImage: 'అప్లోడ్ చేయడానికి చిత్రాన్ని ఎంచుకోండి (గరిష్ట పరిమాణం: 1MB).',
  },
};


// Per-language dictionary. Full parity across languages.
const TRANSLATIONS: Record<LangKey, Record<string, string>> = {
  'en-US': {
    i: 'i', want: 'want', more: 'more', help: 'help', go: 'go', stop: 'stop', yes: 'yes', no: 'no', please: 'please', thankyou: 'thank you',
    if: 'if', this: 'this', that: 'that', then: 'then', to: 'to',
    // Transport
    car: 'car', bike: 'bike', train: 'train', bus: 'bus', plane: 'plane', boat: 'boat', ship: 'ship', taxi: 'taxi', truck: 'truck', scooter: 'scooter',
    helicopter: 'helicopter', submarine: 'submarine', rocket: 'rocket', bicycle: 'bicycle', tram: 'tram', metro: 'metro', van: 'van', ambulance: 'ambulance',
    policecar: 'police car', firetruck: 'fire truck', skateboard: 'skateboard', rollerskates: 'roller skates', wheelchair: 'wheelchair',
    // Food
    apple: 'apple', banana: 'banana', grapes: 'grapes', pineapple: 'pineapple', mango: 'mango', orange: 'orange', strawberry: 'strawberry', watermelon: 'watermelon',
    pear: 'pear', peach: 'peach', cherry: 'cherry', kiwi: 'kiwi', lemon: 'lemon', rice: 'rice', milk: 'milk', bread: 'bread', cheese: 'cheese',
    egg: 'egg', chicken: 'chicken', fish: 'fish', pizza: 'pizza', burger: 'burger', pasta: 'pasta', salad: 'salad', soup: 'soup',
    icecream: 'ice cream', cake: 'cake', cookie: 'cookie', juice: 'juice', yogurt: 'yogurt',
    // Jobs
    doctor: 'doctor', nurse: 'nurse', teacher: 'teacher', police: 'police', firefighter: 'firefighter', farmer: 'farmer', chef: 'chef', driver: 'driver',
    engineer: 'engineer', artist: 'artist', singer: 'singer', dancer: 'dancer', soldier: 'soldier', pilot: 'pilot', judge: 'judge', lawyer: 'lawyer',
    scientist: 'scientist', programmer: 'programmer', builder: 'builder', cashier: 'cashier', waiter: 'waiter', barber: 'barber', mechanic: 'mechanic',
    plumber: 'plumber', electrician: 'electrician', photographer: 'photographer', dentist: 'dentist', veterinarian: 'veterinarian',
    // Emotions
    happy: 'happy', sad: 'sad', angry: 'angry', tired: 'tired', excited: 'excited', scared: 'scared', surprised: 'surprised', calm: 'calm',
    bored: 'bored', confused: 'confused', proud: 'proud', shy: 'shy', silly: 'silly', frustrated: 'frustrated', worried: 'worried', sleepy: 'sleepy',
    sick: 'sick', brave: 'brave', curious: 'curious', embarrassed: 'embarrassed', lonely: 'lonely', hopeful: 'hopeful', grateful: 'grateful',
    confident: 'confident', relaxed: 'relaxed', annoyed: 'annoyed', shocked: 'shocked',
    // Actions
    eat: 'eat', drink: 'drink', open: 'open', close: 'close', play: 'play', run: 'run', walk: 'walk', jump: 'jump', sit: 'sit', stand: 'stand',
    sleep: 'sleep', read: 'read', write: 'write', draw: 'draw', sing: 'sing', dance: 'dance', wash: 'wash', brush: 'brush', take: 'take', give: 'give',
    look: 'look', listen: 'listen', start: 'start', call: 'call', wait: 'wait', think: 'think',
  },

  'hi-IN': {
    i: 'मैं', want: 'चाहता हूँ', more: 'और', help: 'मदद', go: 'चलो', stop: 'रुको', yes: 'हाँ', no: 'नहीं', please: 'कृपया', thankyou: 'धन्यवाद',
    if: 'अगर', this: 'यह', that: 'वह', then: 'तब', to: 'को',
    // Transport
    car: 'कार', bike: 'बाइक', train: 'ट्रेन', bus: 'बस', plane: 'प्लेन', boat: 'नाव', ship: 'जहाज़', taxi: 'टैक्सी', truck: 'ट्रक', scooter: 'स्कूटर',
    helicopter: 'हेलीकॉप्टर', submarine: 'पनडुब्बी', rocket: 'रॉकेट', bicycle: 'साइकिल', tram: 'ट्राम', metro: 'मेट्रो', van: 'वैन', ambulance: 'एम्बुलेंस',
    policecar: 'पुलिस कार', firetruck: 'फायर ट्रक', skateboard: 'स्केटबोर्ड', rollerskates: 'रोलर स्केट्स', wheelchair: 'व्हीलचेयर',
    // Food
    apple: 'सेब', banana: 'केला', grapes: 'अंगूर', pineapple: 'अनानास', mango: 'आम', orange: 'संतरा', strawberry: 'स्ट्रॉबेरी', watermelon: 'तरबूज',
    pear: 'नाशपाती', peach: 'आड़ू', cherry: 'चेरी', kiwi: 'कीवी', lemon: 'नींबू', rice: 'चावल', milk: 'दूध', bread: 'रोटी', cheese: 'पनीर',
    egg: 'अंडा', chicken: 'चिकन', fish: 'मछली', pizza: 'पिज़्ज़ा', burger: 'बर्गर', pasta: 'पास्ता', salad: 'सलाद', soup: 'सूप',
    icecream: 'आइसक्रीम', cake: 'केक', cookie: 'कुकी', juice: 'जूस', yogurt: 'दही',
    // Jobs
    doctor: 'डॉक्टर', nurse: 'नर्स', teacher: 'शिक्षक', police: 'पुलिस', firefighter: 'दमकलकर्मी', farmer: 'किसान', chef: 'शेफ', driver: 'ड्राइवर',
    engineer: 'इंजीनियर', artist: 'कलाकार', singer: 'गायक', dancer: 'नर्तक', soldier: 'सैनिक', pilot: 'पायलट', judge: 'न्यायाधीश', lawyer: 'वकील',
    scientist: 'वैज्ञानिक', programmer: 'प्रोग्रामर', builder: 'निर्माता', cashier: 'कैशियर', waiter: 'वेटर', barber: 'नाई', mechanic: 'मैकेनिक',
    plumber: 'प्लंबर', electrician: 'इलेक्ट्रीशियन', photographer: 'फोटोग्राफर', dentist: 'दंत चिकित्सक', veterinarian: 'पशु चिकित्सक',
    // Emotions
    happy: 'खुश', sad: 'दुखी', angry: 'गुस्सा', tired: 'थका हुआ', excited: 'उत्साहित', scared: 'डरा हुआ', surprised: 'आश्चर्यचकित', calm: 'शांत',
    bored: 'ऊब गया', confused: 'उलझन', proud: 'गर्व', shy: 'शर्मीला', silly: 'मजाकिया', frustrated: 'निराश', worried: 'चिंतित', sleepy: 'नींद में',
    sick: 'बीमार', brave: 'बहादुर', curious: 'जिज्ञासु', embarrassed: 'शर्मिंदा', lonely: 'अकेला', hopeful: 'आशावान', grateful: 'आभारी',
    confident: 'आत्मविश्वासी', relaxed: 'आरामदायक', annoyed: 'चिढ़ा हुआ', shocked: 'स्तब्ध',
    // Actions
    eat: 'खाना', drink: 'पीना', open: 'खोलो', close: 'बंद करो', play: 'खेलो', run: 'दौड़ो', walk: 'चलो', jump: 'कूदो', sit: 'बैठो', stand: 'खड़े हो',
    sleep: 'सोओ', read: 'पढ़ो', write: 'लिखो', draw: 'ड्रॉ करो', sing: 'गाना गाओ', dance: 'नाचो', wash: 'धोओ', brush: 'ब्रश करो', take: 'लो', give: 'दो',
    look: 'देखो', listen: 'सुनो', start: 'शुरू करो', call: 'फोन करो', wait: 'ठहरो', think: 'सोचो',
  },

  'pa-IN': {
    i: 'ਮੈਂ', want: 'ਚਾਹੁੰਦਾ ਹਾਂ', more: 'ਹੋਰ', help: 'ਮਦਦ', go: 'ਚੱਲੋ', stop: 'ਰੁੱਕੋ', yes: 'ਹਾਂ', no: 'ਨਹੀਂ', please: 'ਕਿਰਪਾ ਕਰਕੇ', thankyou: 'ਧੰਨਵਾਦ',
    if: 'ਜੇ', this: 'ਇਹ', that: 'ਉਹ', then: 'ਫਿਰ', to: 'ਨੂੰ',
    // Transport
    car: 'ਕਾਰ', bike: 'ਬਾਈਕ', train: 'ਰੇਲਗੱਡੀ', bus: 'ਬੱਸ', plane: 'ਜਹਾਜ਼', boat: 'ਕਿਸ਼ਤੀ', ship: 'ਪੋਤ', taxi: 'ਟੈਕਸੀ', truck: 'ਟਰੱਕ', scooter: 'ਸਕੂਟਰ',
    helicopter: 'ਹੈਲੀਕਾਪਟਰ', submarine: 'ਪੰਡੂਬੀ', rocket: 'ਰਾਕੇਟ', bicycle: 'ਸਾਇਕਲ', tram: 'ਟ੍ਰਾਮ', metro: 'ਮੈਟਰੋ', van: 'ਵੈਨ', ambulance: 'ਐਂਬੂਲੈਂਸ',
    policecar: 'ਪੁਲਿਸ ਕਾਰ', firetruck: 'ਅੱਗ ਬੁਝਾਉ ਗੱਡੀ', skateboard: 'ਸਕੇਟਬੋਰਡ', rollerskates: 'ਰੋਲਰ ਸਕੇਟਸ', wheelchair: 'ਵ੍ਹੀਲਚੇਅਰ',
    // Food
    apple: 'ਸੇਬ', banana: 'ਕੇਲਾ', grapes: 'ਅੰਗੂਰ', pineapple: 'ਅਨਾਨਾਸ', mango: 'ਆਮ', orange: 'ਸੰਤਰਾ', strawberry: 'ਸਟ੍ਰਾਬੈਰੀ', watermelon: 'ਤੁਰਬੂਜ',
    pear: 'ਨਾਸ਼ਪਾਤੀ', peach: 'ਆੜੂ', cherry: 'ਚੈਰੀ', kiwi: 'ਕੀਵੀ', lemon: 'ਨਿੰਬੂ', rice: 'ਚਾਵਲ', milk: 'ਦੁੱਧ', bread: 'ਰੋਟੀ', cheese: 'ਪਨੀਰ',
    egg: 'ਅੰਡਾ', chicken: 'ਚਿਕਨ', fish: 'ਮੱਛੀ', pizza: 'ਪਿਜ਼ਾ', burger: 'ਬਰਗਰ', pasta: 'ਪਾਸਤਾ', salad: 'ਸਲਾਦ', soup: 'ਸੂਪ',
    icecream: 'ਆਈਸਕ੍ਰੀਮ', cake: 'ਕੇਕ', cookie: 'ਕੁਕੀ', juice: 'ਜੂਸ', yogurt: 'ਦਹੀਂ',
    // Jobs
    doctor: 'ਡਾਕਟਰ', nurse: 'ਨਰਸ', teacher: 'ਅਧਿਆਪਕ', police: 'ਪੁਲਿਸ', firefighter: 'ਫਾਇਰਫਾਈਟਰ', farmer: 'ਕਿਸਾਨ', chef: 'ਸ਼ੈਫ', driver: 'ਡਰਾਈਵਰ',
    engineer: 'ਇੰਜੀਨੀਅਰ', artist: 'ਕਲਾਕਾਰ', singer: 'ਗਾਇਕ', dancer: 'ਨਰਤਕਾਰ', soldier: 'ਸਿਪਾਹੀ', pilot: 'ਪਾਇਲਟ', judge: 'ਜੱਜ', lawyer: 'ਵਕੀਲ',
    scientist: 'ਵਿਗਿਆਨੀ', programmer: 'ਪ੍ਰੋਗ੍ਰਾਮਰ', builder: 'ਨਿਰਮਾਤਾ', cashier: 'ਕੈਸ਼ੀਅਰ', waiter: 'ਵੇਟਰ', barber: 'ਨਾਈ', mechanic: 'ਮਕੈਨਿਕ',
    plumber: 'ਪਲੰਬਰ', electrician: 'ਬਿਜਲੀ ਮਿਸਤਰੀ', photographer: 'ਫੋਟੋਗ੍ਰਾਫਰ', dentist: 'ਡੈਂਟਿਸਟ', veterinarian: 'ਪਸ਼ੂ ਡਾਕਟਰ',
    // Emotions
    happy: 'ਖੁਸ਼', sad: 'ਉਦਾਸ', angry: 'ਗੁੱਸਾ', tired: 'ਥੱਕਿਆ', excited: 'ਉਤਸ਼ਾਹਿਤ', scared: 'ਡਰਿਆ', surprised: 'ਹੈਰਾਨ', calm: 'ਸ਼ਾਂਤ',
    bored: 'ਬੋਰ ਹੋਇਆ', confused: 'ਉਲਝਣ', proud: 'ਮਾਣ', shy: 'ਸ਼ਰਮੀਲਾ', silly: 'ਮਜ਼ਾਕੀਆ', frustrated: 'ਨਿਰਾਸ਼', worried: 'ਚਿੰਤਤ', sleepy: 'ਨੀੰਦ ਆ ਰਹੀ',
    sick: 'ਬੀਮਾਰ', brave: 'ਬਹਾਦਰ', curious: 'ਜਿਗਿਆਸੂ', embarrassed: 'ਸ਼ਰਮਿੰਦਾ', lonely: 'ਅਕੇਲਾ', hopeful: 'ਆਸਾਵਾਨ', grateful: 'ਆਭਾਰੀ',
    confident: 'ਆਤਮਵਿਸ਼ਵਾਸੀ', relaxed: 'ਆਰਾਮਦਾਇਕ', annoyed: 'ਚਿੜ੍ਹਿਆ', shocked: 'ਹੈਰਾਨ-ਪਰੇਸ਼ਾਨ',
    // Actions
    eat: 'ਖਾਣਾ', drink: 'ਪੀਣਾ', open: 'ਖੋਲ੍ਹਣਾ', close: 'ਬੰਦ ਕਰਨਾ', play: 'ਖੇਡਣਾ', run: 'ਦੌੜਣਾ', walk: 'ਤੁਰਨਾ', jump: 'ਕੁੱਦਣਾ', sit: 'ਬੈਠਣਾ', stand: 'ਖੜ੍ਹਾ ਹੋਣਾ',
    sleep: 'ਸੌਣਾ', read: 'ਪੜ੍ਹਨਾ', write: 'ਲਿਖਣਾ', draw: 'ਚਿੱਤਰ ਬਣਾਉਣਾ', sing: 'ਗਾਣਾ ਗਾਉਣਾ', dance: 'ਨੱਚਣਾ', wash: 'ਧੋਣਾ', brush: 'ਬਰਸ਼ ਕਰਨਾ',
    take: 'ਲੈਣਾ', give: 'ਦੇਣਾ', look: 'ਵੇਖਣਾ', listen: 'ਸੁਣਨਾ', start: 'ਸ਼ੁਰੂ ਕਰਨਾ', call: 'ਫੋਨ ਕਰਨਾ', wait: 'ਉਡੀਕ ਕਰਨਾ', think: 'ਸੋਚਣਾ',
  },

  'ta-IN': {
    i: 'நான்', want: 'வேண்டும்', more: 'இன்னும்', help: 'உதவி', go: 'போ', stop: 'நிறுத்து', yes: 'ஆம்', no: 'இல்லை', please: 'தயவு செய்து', thankyou: 'நன்றி',
    if: 'என்றால்', this: 'இந்த', that: 'அந்த', then: 'அப்போது', to: 'க்கு',
    // Transport
    car: 'கார்', bike: 'பைக்', train: 'ரயில்', bus: 'பேருந்து', plane: 'விமானம்', boat: 'படகு', ship: 'கப்பல்', taxi: 'டாக்ஸி', truck: 'லாரி', scooter: 'ஸ்கூட்டர்',
    helicopter: 'ஹெலிகாப்டர்', submarine: 'நீர்மூழ்கிக் கப்பல்', rocket: 'ராக்கெட்', bicycle: 'மிதிவண்டி', tram: 'ட்ராம்', metro: 'மெட்ரோ', van: 'வேன்', ambulance: 'ஆம்புலன்ஸ்',
    policecar: 'காவல் கார்', firetruck: 'தீயணைப்பு வண்டி', skateboard: 'ஸ்கேட்போர்டு', rollerskates: 'ரோலர் ஸ்கேட்ஸ்', wheelchair: 'சக்கர நாற்காலி',
    // Food
    apple: 'ஆப்பிள்', banana: 'வாழைப்பழம்', grapes: 'திராட்சை', pineapple: 'அன்னாசி', mango: 'மாம்பழம்', orange: 'ஆரஞ்சு', strawberry: 'ஸ்ட்ராபெரி', watermelon: 'தர்பூசணி',
    pear: 'பேரிக்காய்', peach: 'பீச்', cherry: 'செர்ரி', kiwi: 'கிவி', lemon: 'எலுமிச்சை', rice: 'அரிசி', milk: 'பால்', bread: 'ரொட்டி', cheese: 'பன்னீர்',
    egg: 'முட்டை', chicken: 'கோழி', fish: 'மீன்', pizza: 'பீட்சா', burger: 'பர்கர்', pasta: 'பாஸ்தா', salad: 'சாலட்', soup: 'சூப்',
    icecream: 'ஐஸ்கிரீம்', cake: 'கேக்', cookie: 'குக்கீ', juice: 'ஜூஸ்', yogurt: 'தயிர்',
    // Jobs
    doctor: 'மருத்துவர்', nurse: 'செவிலியர்', teacher: 'ஆசிரியர்', police: 'போலீஸ்', firefighter: 'தீயணைப்பு வீரர்', farmer: 'விவசாயி', chef: 'சமையல்காரர்', driver: 'டிரைவர்',
    engineer: 'பொறியாளர்', artist: 'கலைஞர்', singer: 'பாடகர்', dancer: 'நடனக் கலைஞர்', soldier: 'சிப்பாய்', pilot: 'விமானி', judge: 'நீதிபதி', lawyer: 'வழக்கறிஞர்',
    scientist: 'அறிவியலாளர்', programmer: 'நிரலாளர்', builder: 'கட்டுமான தொழிலாளர்', cashier: 'காசாளர்', waiter: 'பரிமாறுபவர்', barber: 'முடி வெட்டுபவர்',
    mechanic: 'மெக்கானிக்', plumber: 'குழாய் வல்லுநர்', electrician: 'மின்சார தொழிலாளி', photographer: 'புகைப்படக் கலைஞர்', dentist: 'பல் மருத்துவர்', veterinarian: 'மிருக மருத்துவர்',
    // Emotions
    happy: 'மகிழ்ச்சி', sad: 'துயரம்', angry: 'கோபம்', tired: 'சோர்வு', excited: 'உற்சாகம்', scared: 'பயம்', surprised: 'ஆச்சரியம்', calm: 'அமைதி',
    bored: 'சலிப்பு', confused: 'குழப்பம்', proud: 'பெருமை', shy: 'நாணம்', silly: 'வேடிக்கை', frustrated: 'விரக்தி', worried: 'கவலை', sleepy: 'தூக்கமாக',
    sick: 'நோய்', brave: 'தைரியம்', curious: 'ஆர்வம்', embarrassed: 'வெட்கம்', lonely: 'தனிமை', hopeful: 'நம்பிக்கை', grateful: 'நன்றியுணர்வு',
    confident: 'தன்னம்பிக்கை', relaxed: 'சாந்தம்', annoyed: 'எரிச்சல்', shocked: 'அதிர்ச்சி',
    // Actions
    eat: 'சாப்பிடு', drink: 'குடி', open: 'திற', close: 'மூடு', play: 'விளையாடு', run: 'ஓடு', walk: 'நடு', jump: 'குதி', sit: 'உட்கார்', stand: 'நில்',
    sleep: 'தூங்கு', read: 'படி', write: 'எழுது', draw: 'வரை', sing: 'பாடு', dance: 'நடனம் ஆடு', wash: 'கழுவு', brush: 'துலக்கு', take: 'எடு', give: 'கொடு',
    look: 'பார்', listen: 'கேள்', start: 'தொடங்கு', call: 'அழை', wait: 'காத்திரு', think: 'யோசி',
  },

  'te-IN': {
    i: 'నేను', want: 'కావాలి', more: 'ఇంకా', help: 'సహాయం', go: 'వెళ్ళు', stop: 'ఆపు', yes: 'అవును', no: 'కాదు', please: 'దయచేసి', thankyou: 'ధన్యవాదాలు',
    if: 'ఒకవేళ', this: 'ఈ', that: 'ఆ', then: 'అప్పుడు', to: 'కు',
    // Transport
    car: 'కారు', bike: 'బైక్', train: 'రైలు', bus: 'బస్సు', plane: 'విమానం', boat: 'పడవ', ship: 'నౌక', taxi: 'టాక్సీ', truck: 'ట్రక్', scooter: 'స్కూటర్',
    helicopter: 'హెలికాప్టర్', submarine: 'జలాంతర్గామి', rocket: 'రాకెట్', bicycle: 'సైకిల్', tram: 'ట్రామ్', metro: 'మెట్రో', van: 'వ్యాన్', ambulance: 'అంబులెన్స్',
    policecar: 'పోలీస్ కారు', firetruck: 'అగ్నిమాపక వాహనం', skateboard: 'స్కేట్‌బోర్డు', rollerskates: 'రోలర్ స్కేట్స్', wheelchair: 'వీల్‌చేర్',
    // Food
    apple: 'ఆపిల్', banana: 'అరటి పండు', grapes: 'ద్రాక్ష', pineapple: 'అనాస పండు', mango: 'మామిడి', orange: 'నారింజ', strawberry: 'స్ట్రాబెర్రీ', watermelon: 'పుచ్చకాయ',
    pear: 'పియర్', peach: 'పీచ్', cherry: 'చెర్రీ', kiwi: 'కివీ', lemon: 'నిమ్మకాయ', rice: 'బియ్యం', milk: 'పాలు', bread: 'రొట్టె', cheese: 'పనీర్',
    egg: 'గుడ్డు', chicken: 'చికెన్', fish: 'చేప', pizza: 'పిజ్జా', burger: 'బర్గర్', pasta: 'పాస్తా', salad: 'సలాడ్', soup: 'సూప్',
    icecream: 'ఐస్‌క్రీమ్', cake: 'కేక్', cookie: 'కుకీ', juice: 'జ్యూస్', yogurt: 'పెరుగు',
    // Jobs
    doctor: 'డాక్టర్', nurse: 'నర్స్', teacher: 'ఉపాధ్యాయుడు', police: 'పోలీస్', firefighter: 'అగ్నిమాపక సిబ్బంది', farmer: 'రైతు', chef: 'షెఫ్', driver: 'డ్రైవర్',
    engineer: 'ఇంజనీర్', artist: 'కళాకారి', singer: 'గాయకుడు', dancer: 'నర్తకి', soldier: 'సైనికుడు', pilot: 'పైలట్', judge: 'న్యాయమూర్తి', lawyer: 'న్యాయవాది',
    scientist: 'శాస్త్రవేత్త', programmer: 'ప్రోగ్రామర్', builder: 'నిర్మాత', cashier: 'క్యాషియర్', waiter: 'వేటర్', barber: 'క్షౌరవేత్త', mechanic: 'మెకానిక్',
    plumber: 'ప్లంబర్', electrician: 'ఎలక్ట్రీషియన్', photographer: 'ఫోటోగ్రాఫర్', dentist: 'దంత వైద్యుడు', veterinarian: 'పశు వైద్యుడు',
    // Emotions
    happy: 'ఆనందం', sad: 'దుఃఖం', angry: 'కోపం', tired: 'అలసట', excited: 'ఉత్సాహం', scared: 'భయం', surprised: 'ఆశ్చర్యం', calm: 'ప్రశాంతం',
    bored: 'బోరు', confused: 'గందరగోళం', proud: 'గర్వం', shy: 'సిగ్గు', silly: 'సరదా', frustrated: 'నిరాశ', worried: 'ఆందోళన', sleepy: 'నిద్రగా',
    sick: 'అనారోగ్యం', brave: 'ధైర్యం', curious: 'ఆసక్తి', embarrassed: 'సంకోచం', lonely: 'ఒంటరితనం', hopeful: 'ఆశ', grateful: 'కృతజ్ఞత',
    confident: 'ఆత్మవిశ్వాసం', relaxed: 'ఆరామం', annoyed: 'చిరాకు', shocked: 'ఆశ్చర్యచకితం',
    // Actions
    eat: 'తిను', drink: 'త్రాగు', open: 'తెరువు', close: 'మూసివేయి', play: 'ఆడు', run: 'పరుగెట్టు', walk: 'నడుచు', jump: 'దూకు', sit: 'కూర్చో', stand: 'నిలబడు',
    sleep: 'నిద్రపో', read: 'చదువు', write: 'వ్రాయు', draw: 'గీయు', sing: 'పాడు', dance: 'నృత్యం చేయి', wash: 'కడుగు', brush: 'బ్రష్ చేయి', take: 'తీసుకో', give: 'ఇవ్వు',
    look: 'చూడి', listen: 'విని', start: 'ప్రారంభించు', call: 'పిలువు', wait: 'వేచి ఉండు', think: 'ఆలోచించు',
  },
};

// Helper function to get UI text based on language
const t = (key: string, lang: 'en-US' | 'hi-IN' | 'pa-IN' | 'ta-IN' | 'te-IN'): string => {
  return UI_TRANSLATIONS[lang]?.[key] || UI_TRANSLATIONS['en-US'][key] || key;
};

// ---------- Smart voice selection (Expo Speech) — prefer FEMALE per language ----------
// type LangKey = 'en-US' | 'hi-IN' | 'pa-IN' | 'ta-IN' | 'te-IN';

const FEMALE_HINTS = [
  'female', '#female', '.female', 'fem', '-f', '_f', 'f0', 'f1', 'f2'
];

// names/ids commonly seen on iOS/Android/Web voices
const FEMALE_PREFER: Record<LangKey, string[]> = {
  'en-US': ['samantha', 'ava', 'victoria', 'allison', 'en-us-x', 'google us english'],
  'hi-IN': ['lekha', 'sangeeta', 'hi-in-x-hia', 'hi-in-x-hif'],
  'pa-IN': ['punjab', 'punjabi', 'pa-in-x-paa', 'pa-in-x-pab'],
  'ta-IN': ['ta-in-x-taa', 'ta-in-x-tab', 'anbu', 'meera', 'tamil'],
  'te-IN': ['te-in-x-tea', 'te-in-x-teb', 'telugu'],
};

// loose language matchers (fallbacks)
const LANG_MATCH: Record<LangKey, (v: Speech.Voice) => boolean> = {
  'en-US': (v) => v.language?.toLowerCase().startsWith('en'),
  'hi-IN': (v) => v.language?.toLowerCase().startsWith('hi'),
  'pa-IN': (v) => v.language?.toLowerCase().startsWith('pa') || v.name?.toLowerCase().includes('punjab'),
  'ta-IN': (v) => v.language?.toLowerCase().startsWith('ta'),
  'te-IN': (v) => v.language?.toLowerCase().startsWith('te'),
};

let _voicesCache: Speech.Voice[] | null = null;

async function loadVoices(): Promise<Speech.Voice[]> {
  if (_voicesCache) return _voicesCache;
  try {
    _voicesCache = await Speech.getAvailableVoicesAsync();
  } catch {
    _voicesCache = [];
  }
  return _voicesCache!;
}

const norm = (s?: string) => (s || '').toLowerCase();

function looksFemale(v: Speech.Voice) {
  const n = norm(v.name);
  const id = norm(v.identifier);
  // avoid obvious male matches
  if (n.includes('male') || id.includes('male') || /\b(m|male)\b/.test(n + ' ' + id)) return false;
  // accept typical female markers
  if (FEMALE_HINTS.some(h => n.includes(h) || id.includes(h))) return true;
  return false;
}

function langMatches(v: Speech.Voice, lang: LangKey) {
  const L = norm(v.language);
  const want = norm(lang);
  return L === want || L.startsWith(want.slice(0, 2));
}

function preferByHints(voices: Speech.Voice[], lang: LangKey): Speech.Voice | null {
  if (!voices.length) return null;
  const prefs = FEMALE_PREFER[lang].map(norm);

  // 1) explicit female + preferred name/id
  const v1 = voices.find(v => looksFemale(v) && prefs.some(p => norm(v.name).includes(p) || norm(v.identifier).includes(p)));
  if (v1) return v1;

  // 2) any female-looking voice in this language set
  const v2 = voices.find(looksFemale);
  if (v2) return v2;

  // 3) first voice in this language
  return voices[0];
}

async function pickVoice(lang: LangKey): Promise<Speech.Voice | null> {
  const voices = await loadVoices();

  // voices in the requested language
  const inLang = voices.filter(v => langMatches(v, lang));
  const chosenInLang = preferByHints(inLang, lang);
  if (chosenInLang) return chosenInLang;

  // Punjabi fallback → try Hindi female (often available on devices)
  if (lang === 'pa-IN') {
    const inHindi = voices.filter(v => langMatches(v, 'hi-IN'));
    const h = preferByHints(inHindi, 'hi-IN');
    if (h) return h;
  }

  // Final fallback → English female
  const inEn = voices.filter(v => LANG_MATCH['en-US'](v));
  return preferByHints(inEn, 'en-US');
}

const TWO = (l: LangKey) => l.slice(0, 2).toLowerCase();
const DEFAULT_SPEECH_RATE = 0.8;

// Shared TTS: speech-to-speech (en_US-hfc) when available, expo-speech fallback (used first in grid)

// Normalize text for better TTS pronunciation, especially for iOS
function normalizeForSpeech(text: string, lang: LangKey): string {
  // Handle special case: single capital "I" should be spoken as pronoun, not "capital i"
  // iOS TTS sometimes reads standalone "I" as the letter name
  // Solution: For standalone "I", add a space to help TTS recognize it as a word
  if (lang === 'en-US') {
    const trimmed = text.trim();
    // If it's exactly "I" (capital) as a standalone word
    // Add a space to help iOS TTS recognize it as the pronoun, not the letter
    if (trimmed === 'I' && trimmed.length === 1) {
      // The space helps TTS interpret it as a word in context
      return 'I ';
    }
  }
  return text;
}

async function speakSmart(text: string, lang: LangKey, rateOverride?: number, skipStop?: boolean) {
  const normalizedText = normalizeForSpeech(text, lang);
  const rate = typeof rateOverride === 'number' ? rateOverride : DEFAULT_SPEECH_RATE;
  const opts = skipStop ? { skipStop: true } : undefined;

  try {
    await speakTTS(normalizedText, rate, lang, opts);
    return;
  } catch (error) {
    console.warn('[AAC] Shared TTS failed, using expo-speech with language voice:', error);
  }
  await speakTTS(normalizedText, rate, lang, opts);
}



function tWord(id: string, lang: LangKey) {
  return TRANSLATIONS[lang]?.[id] ?? id;
}
function tSentence(ids: string[], lang: LangKey) {
  return ids.map(w => tWord(w, lang)).join(' ');
}

// ---------- TTS scheduler: run speech AFTER animations ----------
// On native, InteractionManager.runAfterInteractions can wait too long (e.g. FlatList/layout
// keep "interactions" active), so TTS never fires. Use setTimeout only on native.
function scheduleSpeak(text: string, lang: LangKey, delayMs = 30, rate?: number, skipStop?: boolean) {
  const run = () => {
    setTimeout(() => {
      speakSmart(text, lang, rate, skipStop);
    }, Math.max(0, delayMs));
  };
  if (Platform.OS !== 'web') {
    run();
    return;
  }
  try {
    InteractionManager.runAfterInteractions(run);
  } catch {
    run();
  }
}

// --- speak sentence by small chunks/words for kid-friendly pacing
function speakStretched(sentence: string, lang: LangKey, wordGapMs = 420, rate?: number) {
  // Normalize spaces and split into words - but keep short punctuation chunks together
  const raw = sentence.trim().replace(/\s+/g, ' ');
  // Optionally chunk into phrases of up to N words to keep it natural
  const CHUNK_SIZE = 3; // speak in small phrase chunks (3 words each) for better flow
  const words = raw.split(' ');
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += CHUNK_SIZE) {
    chunks.push(words.slice(i, i + CHUNK_SIZE).join(' '));
  }

  // limit to a reasonable number of chunks to avoid infinite long sequences
  const MAX_CHUNKS = 80;
  const list = chunks.slice(0, MAX_CHUNKS);

  list.forEach((chunk, i) => {
    const delay = i * (wordGapMs + 10);
    scheduleSpeak(chunk, lang, delay, rate, i > 0);
  });

  if (chunks.length > MAX_CHUNKS) {
    scheduleSpeak('...', lang, list.length * (wordGapMs + 10), rate, true);
  }
}

// ---------- Small helpers ----------
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Normalize image URL to https and absolute when needed
function normImageUrl(u?: string): string | undefined {
  if (!u) return undefined;
  if (/^https?:\/\//i.test(u)) return u.replace(/^http:\/\//i, 'https://');
  return `${API_BASE_URL}${u.startsWith('/') ? '' : '/'}${u}`;
}

// ---------- UI pieces ----------
function SectionHeader({ id, title }: { id: Category['id']; title: string }) {
  const style = CATEGORY_STYLES[id];

  // 👇 RN legacy Animated for underline bounce (lightweight)
  const underline = useRef(new RNAnimated.Value(0)).current;
  const bounce = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    underline.setValue(0);
    bounce.setValue(0);

    RNAnimated.parallel([
      RNAnimated.timing(underline, {
        toValue: 1,
        duration: 550,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      RNAnimated.sequence([
        RNAnimated.timing(bounce, {
          toValue: 1,
          duration: 280,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        RNAnimated.timing(bounce, {
          toValue: 0,
          duration: 180,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [id]);

  return (
    <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <RNAnimated.Text
          style={{
            fontSize: 22,
            fontWeight: '800',
            color: style.text,
            transform: [
              { translateY: bounce.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) },
            ],
          }}
        >
          {style.headerEmoji}
        </RNAnimated.Text>

        <Text style={{ fontSize: 22, fontWeight: '800', color: style.text }}>{title}</Text>
      </View>

      <RNAnimated.View
        style={{
          height: 4,
          backgroundColor: style.accent,
          borderRadius: 999,
          marginTop: 8,
          width: underline.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', '55%'],
          }) as any,
        }}
      />
    </View>
  );
}


function AnimatedCommonChip({ t, onPress, selectedLang = 'en-US' }: { t: Tile; onPress: (t: Tile) => void; selectedLang?: LangKey }) {
  // Get translated label, fallback to original label for custom tiles
  const displayLabel = tWord(t.id, selectedLang) !== t.id ? tWord(t.id, selectedLang) : t.label;
  const scale = useSharedValue(1);
  const springCfg = { stiffness: 230, damping: 22, mass: 1 };

  const onDown = () => {
    cancelAnimation(scale);
    scale.value = withSpring(0.99, springCfg);
  };

  const onUp = () => {
    scale.value = withSpring(1.0, springCfg);
  };

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={() => {
        // micro pop, then call press after animation
        scale.value = withTiming(1.015, { duration: 85 }, (finished) => {
          if (finished) scale.value = withSpring(1.0, springCfg, (ok) => {
            if (ok) runOnJS(onPress)(t);
          });
        });
      }}
      onPressIn={onDown}
      onPressOut={onUp}
      style={[
        {
          height: 46,
          paddingHorizontal: 12,
          borderRadius: 14,
          backgroundColor: '#F3F4F6',
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: '#E5E7EB',
        },
        style,
        shadow.s,
      ]}
      accessibilityRole="button"
    >
      <Text style={{ fontWeight: '700', color: '#111827' }}>{displayLabel}</Text>
    </AnimatedPressable>
  );
}



function TileCard({
  t, index, onPress, accent, isFav, onToggleFav, isMyTile, onEditTile, onDeleteTile, selectedLang = 'en-US'
}: {
  t: Tile;
  index: number;
  onPress: (t: Tile) => void;
  accent: string;
  isFav: boolean;
  onToggleFav: (id: string) => void;
  isMyTile?: boolean;
  onEditTile?: (t: Tile) => void;
  onDeleteTile?: (t: Tile) => void;
  selectedLang?: LangKey;
}) {
  // Get translated label, fallback to original label for custom tiles
  const displayLabel = tWord(t.id, selectedLang) !== t.id ? tWord(t.id, selectedLang) : t.label;
  // Reanimated shared values
  const scale = useSharedValue(1);
  const appear = useSharedValue(0); // mount fade/scale
  const burst = useSharedValue(0); // tap expansion
  const highlight = useSharedValue(0); // glow intensity

  // Heart animation state
  const heartScale = useSharedValue(1);
  const heartBurst = useSharedValue(0);
  const heartFav = useSharedValue(isFav ? 1 : 0);

  React.useEffect(() => {
    heartFav.value = withTiming(isFav ? 1 : 0, { duration: 220 });
  }, [isFav]);

  const onHeart = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch { }
    heartScale.value = 1;
    heartScale.value = withSequence(
      withSpring(1.16, { stiffness: 520, damping: 28, mass: 0.6 }),
      withSpring(1.0, { stiffness: 240, damping: 18, mass: 0.9 }),
    );
    heartBurst.value = 0;
    heartBurst.value = withTiming(1, { duration: 650 }, () => { heartBurst.value = 0; });
    onToggleFav(t.id);
  };

  const heartWrapStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value * (1 + heartFav.value * 0.06) }],
  }));

  const heartRingStyle = useAnimatedStyle(() => {
    const scale = 1 + heartBurst.value * 1.7;
    const opacity = heartBurst.value === 0 ? 0 : (1 - heartBurst.value) * 0.35;
    return { transform: [{ scale }], opacity, borderColor: accent };
  });

  const heartIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${(heartScale.value - 1) * 60}deg` }],
  }));

  // 8 sparkle particles
  const P = 8;
  const particleStyle = (i: number) =>
    useAnimatedStyle(() => {
      const angle = (i / P) * Math.PI * 2;
      const r = 4 + heartBurst.value * 18;
      return {
        transform: [
          { translateX: Math.cos(angle) * r },
          { translateY: Math.sin(angle) * r },
          { scale: 0.4 + heartBurst.value * 0.9 },
        ],
        opacity: heartBurst.value === 0 ? 0 : 1 - heartBurst.value,
        backgroundColor: accent,
      };
    });

  // mount animation (fade in + slight scale)
  React.useEffect(() => {
    const delay = index * 25;
    appear.value = 0;
    const run = () => {
      appear.value = withTiming(1, { duration: 260 });
      scale.value = withTiming(1, { duration: 260 });
    };
    const id = setTimeout(run, delay);
    return () => clearTimeout(id);
  }, [index]);

  // physics config tuned for tiny, crisp pop
  const springCfg = { stiffness: 260, damping: 24, mass: 1 };

  const onPressIn = () => {
    cancelAnimation(scale);
    // slight compress on touch down
    scale.value = withSpring(0.98, springCfg);
  };

  const onPressOut = () => {
    // return to normal if user cancels
    scale.value = withSpring(1.0, springCfg);
  };

  // pop then JS handler AFTER animation (no lag)
  const handlePress = () => {
    cancelAnimation(scale);
    cancelAnimation(burst);
    cancelAnimation(highlight);

    burst.value = 0;
    highlight.value = 0;

    burst.value = withSequence(
      withTiming(0.26, { duration: 140, easing: Easing.out(Easing.cubic) }),
      withSpring(0, { damping: 14, stiffness: 160 })
    );

    highlight.value = withSequence(
      withTiming(1, { duration: 120, easing: Easing.out(Easing.cubic) }),
      withTiming(0, { duration: 320, easing: Easing.inOut(Easing.cubic) })
    );

    // ensure base scale returns smoothly
    scale.value = withSpring(1, springCfg);

    setTimeout(() => {
      onPress(t);
    }, 150);
  };

  const cardStyle = useAnimatedStyle(() => ({
    opacity: appear.value,
    transform: [{ scale: scale.value * (1 + burst.value) }],
    zIndex: highlight.value > 0.01 ? 30 : 1,
    shadowOpacity: 0.08 + highlight.value * 0.2,
    shadowRadius: 12 + highlight.value * 20,
    elevation: 6 + highlight.value * 8,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: highlight.value,
    transform: [{ scale: 1 + highlight.value * 0.2 }],
    borderColor: accent,
    shadowColor: accent,
    shadowOpacity: 0.25 * highlight.value,
    shadowRadius: 14,
    elevation: 6 + highlight.value * 6,
  }));

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[styles.card, cardStyle, shadow.m]}
      accessibilityRole="button"
    >
      <Animated.View pointerEvents="none" style={[styles.tapGlow, glowStyle]} />

      <View style={styles.cardInner}>
        {/* Background tint */}
        <View pointerEvents="none" style={[StyleSheet.absoluteFillObject, { backgroundColor: accent + '18', borderRadius: 12 }]} />

        {/* Image fills entire tile */}
        {t.imageUrl ? (
          <Image source={{ uri: normImageUrl(t.imageUrl) }} resizeMode="cover" style={styles.fullImage} />
        ) : t.imageKey && tileImages[t.imageKey] ? (
          <Image source={tileImages[t.imageKey]} resizeMode="cover" style={styles.fullImage} />
        ) : (
          <View style={styles.emojiWrap}>
            <Text style={styles.emojiText}>{t.emoji || '🟦'}</Text>
          </View>
        )}

        {/* Label badge - pill-shaped, floating above bottom */}
        <View style={styles.overlayLabelWrap}>
          <View style={styles.labelBadge}>
            <Text numberOfLines={1} style={styles.overlayLabelText}>{displayLabel}</Text>
          </View>
        </View>

        <Animated.View style={[styles.bottomBar, { backgroundColor: accent }]} />

        <AnimatedPressable
          onPress={onHeart}
          hitSlop={8}
          style={[{ position: 'absolute', top: 6, right: 6, zIndex: 6 }, heartWrapStyle]}
          {...(Platform.OS === 'web' ? {} : { accessibilityRole: 'button' })}
          accessibilityLabel={isFav ? 'Remove from favorites' : 'Add to favorites'}
        >
          {/* Ripple ring */}
          <Animated.View
            pointerEvents="none"
            style={[{
              position: 'absolute', top: -4, left: -4, right: -4, bottom: -4,
              borderRadius: 999, borderWidth: 2,
            }, heartRingStyle]}
          />

          {/* Chip */}
          <View style={{
            backgroundColor: 'rgba(255,255,255,0.95)',
            paddingHorizontal: 10, paddingVertical: 8,
            borderRadius: 999, borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.06)',
            alignItems: 'center', justifyContent: 'center',
            minWidth: 36, minHeight: 34,
            ...shadow.s,
          }}>
            {/* Sparkles (centered) */}
            <View
              pointerEvents="none"
              style={[StyleSheet.absoluteFillObject, { alignItems: 'center', justifyContent: 'center' }]}
            >
              <View style={{ width: 0, height: 0 }}>
                {Array.from({ length: P }).map((_, i) => (
                  <Animated.View
                    key={i}
                    style={[{ position: 'absolute', width: 6, height: 6, borderRadius: 99 }, particleStyle(i)]}
                  />
                ))}
              </View>
            </View>

            {/* Heart icon */}
            <Animated.View style={heartIconStyle}>
              <Ionicons
                name={isFav ? 'heart' : 'heart-outline'}
                size={16}
                color={isFav ? accent : '#6B7280'}
              />
            </Animated.View>
          </View>
        </AnimatedPressable>

        {isMyTile && (
          <View style={styles.tileActions}>
            <TouchableOpacity onPress={() => onEditTile?.(t)} style={[styles.actionChip, styles.editChip]}>
              <Ionicons name="create-outline" size={16} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onDeleteTile?.(t)} style={[styles.actionChip, styles.deleteChip]}>
              <Ionicons name="trash-outline" size={16} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </AnimatedPressable>
  );
}

function NiceAlert({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: '#FEF2F2', borderColor: '#FCA5A5',
      borderWidth: 1, padding: 10, borderRadius: 12, marginBottom: 10
    }}>
      <Ionicons name="alert-circle" size={18} color="#B91C1C" style={{ marginRight: 8 }} />
      <Text style={{ color: '#7F1D1D', fontWeight: '700', flex: 1 }}>{message}</Text>
    </View>
  );
}

const MAX_IMAGE_BYTES = 1_000_000; // 1MB

function isValidId(id: string) {
  // no spaces, only letters/numbers/underscore/hyphen, 2–40 chars
  return /^[a-zA-Z0-9_-]{2,40}$/.test(id);
}

function isHttpUrl(u: string) {
  try {
    const x = new URL(u);
    return x.protocol === 'http:' || x.protocol === 'https:';
  } catch {
    return false;
  }
}

function showError(msg: string) {
  Toast.show({ type: 'error', text1: 'Please fix and try again', text2: msg });
}
function showSuccess(msg: string) {
  Toast.show({ type: 'success', text1: 'Done', text2: msg });
}



// ---------- Screen ----------
export default function AACGrid() {
  const HEADER_H = 56;
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [query, setQuery] = useState('');
  const [utterance, setUtterance] = useState<string[]>([]);
  const [activeCat, setActiveCat] = useState<Category['id']>('transport');
  const [selectedLang, setSelectedLang] = useState<LangKey>('en-US');
  const [speechRate, setSpeechRate] = useState<number>(DEFAULT_SPEECH_RATE);
  // UI controls for speech speed/mode
  type SpeechMode = 'normal' | 'slow' | 'stretched';
  const [speechMode, setSpeechMode] = useState<SpeechMode>('normal');
  const [speedModalOpen, setSpeedModalOpen] = useState(false);
  const [available, setAvailable] = useState<Record<LangKey, boolean>>({
    'en-US': true, 'hi-IN': false, 'pa-IN': false, 'ta-IN': false, 'te-IN': false,
  });
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  //for add tile 
  const [formError, setFormError] = useState<string | null>(null);


  // New state for favorites and custom tiles
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [customTiles, setCustomTiles] = useState<CustomTile[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Check for addTile param and open modal
  useEffect(() => {
    if (params.addTile === 'true') {
      setShowAddModal(true);
      // Clear the param
      router.setParams({ addTile: undefined });
    }
  }, [params.addTile]);
  const [newId, setNewId] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newEmoji, setNewEmoji] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');

  // NEW: choose between URL vs Upload
  type SourceMode = 'url' | 'upload';
  const [sourceMode, setSourceMode] = useState<SourceMode>('url');

  // Upload state
  const [pickedUri, setPickedUri] = useState<string>(''); // local file URI
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit state
  type EditForm = { id: string; label: string; imageUrl?: string };
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const FAV_CATEGORY_ID = 'favorites' as const;
  const MY_CATEGORY_ID = 'mytiles' as const;

  // Auto-fit columns (target ~100px for smaller tiles)
  const { width } = useWindowDimensions();
  const horizontalPadding = 16 * 2, gap = 8, target = 100;
  const cols = Math.max(2, Math.min(6, Math.floor((width - horizontalPadding + gap) / (target + gap))));

  // Helper function to get translated category title
  const getCategoryTitle = (categoryId: Category['id'], lang: LangKey): string => {
    const titleMap: Record<Category['id'], string> = {
      transport: t('transport', lang),
      food: t('food', lang),
      jobs: t('jobs', lang),
      emotions: t('emotions', lang),
      actions: t('actions', lang),
      favorites: t('favorites', lang),
      mytiles: t('myTiles', lang),
    };
    return titleMap[categoryId] || categoryId;
  };

  const allCategories: Category[] = useMemo(() => {
    const favTiles: Tile[] = [];
    const every: Tile[] = [
      ...COMMON_WORDS,
      ...CATEGORIES.flatMap(c => c.tiles),
      ...customTiles.map(ct => ({ id: ct.id, label: ct.label, emoji: ct.emoji, imageUrl: ct.imageUrl } as Tile)),
    ];
    for (const t of every) if (favorites.has(t.id)) favTiles.push(t);

    const myTilesCat: Category = {
      id: MY_CATEGORY_ID as any,
      title: t('myTiles', selectedLang),
      color: '#E0F2FE',
      tiles: customTiles.map(ct => ({ id: ct.id, label: ct.label, emoji: ct.emoji, imageUrl: ct.imageUrl })),
    };

    const favCat: Category = {
      id: FAV_CATEGORY_ID as any,
      title: t('favorites', selectedLang),
      color: '#FFE8A3',
      tiles: favTiles,
    };

    const coreCategories = CATEGORIES.map(c => ({
      ...c,
      title: getCategoryTitle(c.id, selectedLang),
    })).filter((c) => c.id !== FAV_CATEGORY_ID && c.id !== MY_CATEGORY_ID);
    return [
      favCat,
      ...coreCategories,
      myTilesCat,
    ];
  }, [favorites, customTiles, selectedLang]);

  const category = useMemo(() => allCategories.find(c => c.id === activeCat) ?? allCategories[0], [activeCat, allCategories]);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [activeCat, cols, selectedLang, width]);

  // Cleanup audio on unmount (web only)
  // TTS is now handled by shared utility (initialized in root layout)
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTTS();
    };
  }, []);

  // Load favorites and custom tiles on mount
  useEffect(() => {
    (async () => {
      try {
        const fav = await getFavorites();
        setFavorites(new Set(fav.favorites || []));
      } catch { }
      try {
        const { tiles } = await getCustomTiles();
        const fixed = (tiles || []).map(t => ({ ...t, imageUrl: normImageUrl(t.imageUrl) }));
        setCustomTiles(fixed);
      } catch { }
    })();
  }, []);

  // Helper functions for image upload
  async function pickImageFromDevice() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setFormError(t('photoAccessRequired', selectedLang));
      showError(t('allowPhotoAccess', selectedLang));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (result.canceled) return;

    const uri = result.assets[0].uri;
    try {
      const info: any = await FileSystem.getInfoAsync(uri as any);
      if ((info as any)?.size && (info as any).size > MAX_IMAGE_BYTES) {
        setPickedUri('');
        setFormError(t('imageTooLarge', selectedLang));
        showError(t('imageTooLarge', selectedLang));
        return;
      }
    } catch {
      // if size not available, we'll still allow; upload will catch failures.
    }

    setFormError(null);
    setPickedUri(uri);
    Toast.show({ type: 'info', text1: t('imageSelected', selectedLang), text2: t('willUploadOnSave', selectedLang) });
  }


  async function uploadPickedImage(): Promise<string> {
    if (!pickedUri) throw new Error('No image selected');
    setUploading(true);
    try {
      const form = new FormData();
      const filename = `image-${Date.now()}.jpg`;

      // Determine file type from URI or default to jpeg
      let type = 'image/jpeg';
      if (pickedUri.toLowerCase().endsWith('.png')) type = 'image/png';
      else if (pickedUri.toLowerCase().endsWith('.gif')) type = 'image/gif';
      else if (pickedUri.toLowerCase().endsWith('.webp')) type = 'image/webp';

      if (Platform.OS === 'web' && pickedUri.startsWith('blob:')) {
        // Web: convert blob to File
        const response = await fetch(pickedUri);
        const blob = await response.blob();
        const file = new File([blob], filename, { type });
        form.append('file', file);
      } else {
        // React Native: use file object format
        // For React Native, we need to read the file and convert it
        if (Platform.OS !== 'web') {
          // Read file as base64 or use the URI directly
          // @ts-ignore - React Native FormData format
          form.append('file', {
            uri: Platform.OS === 'android' ? pickedUri : pickedUri.replace('file://', ''),
            name: filename,
            type: type,
          } as any);
        } else {
          // Web fallback
          form.append('file', { uri: pickedUri, name: filename, type } as any);
        }
      }

      const { authHeaders } = await import('@/utils/api');
      const headers = await authHeaders({ multipart: true });

      // Remove Content-Type header to let browser/RN set it with boundary
      const uploadHeaders: any = { ...headers };
      delete uploadHeaders['Content-Type'];
      delete uploadHeaders['content-type'];

      console.log('Uploading image:', { filename, type, uri: pickedUri.substring(0, 50) + '...' });

      const res = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        headers: uploadHeaders,
        body: form,
      });

      if (!res.ok) {
        const text = await res.text();
        console.error('Upload failed:', text);
        // Turn Multer/HTML errors into a clean message
        let msg = 'Upload failed';
        if (/File too large/i.test(text)) msg = 'Image too large (max 1MB).';
        else if (/MulterError/i.test(text)) msg = 'Upload error. Please try a smaller image.';
        else if (/No file uploaded/i.test(text)) msg = 'No file was uploaded. Please try again.';
        showError(msg);
        throw new Error(msg);
      }

      const data = await res.json();
      console.log('Upload success:', data.url);
      return data.url as string;
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMsg = error?.message || 'Failed to upload image';
      showError(errorMsg);
      throw error;
    } finally {
      setUploading(false);
    }
  }

  const isMyTile = (t: Tile) => customTiles.some(ct => ct.id === t.id);

  async function uploadOrKeep(url?: string): Promise<string | undefined> {
    if (url && /^https?:\/\//i.test(url)) return url;
    if (pickedUri) return await uploadPickedImage();
    return url;
  }

  function updateMyTileLocal(updated: CustomTile) {
    setCustomTiles((prev) => prev.map((t) => (t.id === updated.id ? { ...updated, imageUrl: normImageUrl(updated.imageUrl) } : t)));
  }

  function removeMyTileLocal(id: string) {
    setCustomTiles((prev) => prev.filter((t) => t.id !== id));
  }

  async function onEditTile(tile: Tile) {
    setEditForm({ id: tile.id, label: tile.label, imageUrl: tile.imageUrl });
    setEditOpen(true);
  }

  async function onSaveEdit() {
    if (!editForm) return;
    try {
      setSavingEdit(true);
      const finalUrl = await uploadOrKeep(editForm.imageUrl);

      try {
        const { authHeaders } = await import('@/utils/api');
        await fetch(`${API_BASE_URL}/api/me/custom-tiles/${editForm.id}`, {
          method: "PUT",
          headers: await authHeaders(),
          body: JSON.stringify({ label: editForm.label, imageUrl: finalUrl }),
        });
      } catch { }

      updateMyTileLocal({
        id: editForm.id,
        label: editForm.label,
        imageUrl: finalUrl,
      });

      setEditOpen(false);
    } finally {
      setSavingEdit(false);
    }
  }

  function confirmDelete(tile: Tile) {
    const go = async () => {
      try {
        try {
          const { authHeaders } = await import('@/utils/api');
          await fetch(`${API_BASE_URL}/api/me/custom-tiles/${tile.id}`, {
            method: "DELETE",
            headers: await authHeaders(),
          });
        } catch { }
        removeMyTileLocal(tile.id);
      } catch (e) {
        console.error("Delete failed", e);
      }
    };

    const deleteText = t('deleteConfirm', selectedLang);
    const cancelText = t('cancel', selectedLang);
    const deleteTileText = t('deleteTile', selectedLang);

    if (Platform.OS === "web") {
      if (window.confirm(`${deleteText} "${tile.label}"?`)) go();
    } else {
      Alert.alert(deleteTileText, `${deleteText} "${tile.label}"?`, [
        { text: cancelText, style: "cancel" },
        { text: deleteText, style: "destructive", onPress: go },
      ]);
    }
  }

  // Detect available voices and dim radios accordingly
  useEffect(() => {
    (async () => {
      const voices = await loadVoices();
      const next: Record<LangKey, boolean> = { ...available };
      (Object.keys(next) as LangKey[]).forEach((lk) => {
        next[lk] = !!(voices.find(v => v.language?.toLowerCase() === lk.toLowerCase()) || voices.find(LANG_MATCH[lk]));
      });
      setAvailable(next);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredCommon = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? COMMON_WORDS.filter(t => t.label.toLowerCase().includes(q)) : COMMON_WORDS;
  }, [query]);

  const filteredTiles = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = category.tiles;
    return q ? base.filter(t => t.label.toLowerCase().includes(q)) : base;
  }, [query, category]);

  // ======= Updated: do NOT await speech; schedule after animation =======
  const onTile = (t: Tile) => {
    Haptics.selectionAsync();
    setUtterance(s => [...s, t.id]);
    const say = tWord(t.id, selectedLang);

    if (speechMode === 'stretched') {
      // speak small phrase chunk with more gap
      speakStretched(say, selectedLang, 420, speechRate);
    } else {
      // normal or slow -> single chunk but with adjusted rate
      scheduleSpeak(say, selectedLang, 10, speechRate);
    }
  };

  const onSpeakSentence = () => {
    if (!utterance.length) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const say = tSentence(utterance, selectedLang);

    if (speechMode === 'stretched') {
      // speak the whole sentence stretched (phrase-by-phrase)
      speakStretched(say, selectedLang, 420, speechRate);
    } else {
      // normal sentence (single speak) - speechRate will be used
      scheduleSpeak(say, selectedLang, 10, speechRate);
    }
  };

  const theme = CATEGORY_STYLES[activeCat];
  const addBtnBottom = (insets.bottom || 12) + Platform.select({ ios: 76, android: 84, default: 82 });

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg, overflow: 'visible' }}>

      {/* Top bar: Back (left) + Search + Language menu button (right) */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            columnGap: 10,
            rowGap: 10,
            flexWrap: 'nowrap',      // keep in a single line
          }}
        >
          {/* Back button */}
          {/* <TouchableOpacity
            onPress={() => router.navigate("/(tabs)")}
            accessibilityRole="button"
            accessibilityLabel={t('goBack', selectedLang)}
            activeOpacity={0.9}
            style={{
              width: 40,
              height: 40,
              borderRadius: 999,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#000',
            }}
          >
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity> */}

          {/* Search */}
          <View
            style={[
              styles.inputWrap,
              {
                borderColor: theme.accent + '66',
                flexGrow: 1,
                flexShrink: 1,
                flexBasis: 220, // keeps search reasonably wide on wrap
              },
            ]}
          >
            <TextInput
              placeholder={t('searchWords', selectedLang)}
              value={query}
              onChangeText={setQuery}
              style={styles.input}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Language menu button */}
          <TouchableOpacity
            onPress={() => setLangMenuOpen(true)}
            activeOpacity={0.9}
            style={[styles.radioItem, { backgroundColor: theme.chip, borderColor: theme.accent + '55' }]}
            accessibilityRole="button"
            accessibilityLabel="Choose language"
          >
            <Ionicons name="globe-outline" size={18} color={theme.text} />
            <Text style={{ fontWeight: '800', color: theme.text }}>
              {LANG_OPTIONS.find(l => l.key === selectedLang)?.label || 'Language'}
            </Text>
          </TouchableOpacity>

          {/* Speech speed button */}
          <TouchableOpacity
            onPress={() => setSpeedModalOpen(true)}
            style={{
              marginLeft: 6,
              width: 44,
              height: 44,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#111827',
            }}
            accessibilityLabel="Speech speed"
          >
            <Text style={{ color: '#fff', fontWeight: '700' }}>
              {speechMode === 'stretched' ? 'S' : speechMode === 'slow' ? 'Sl' : 'N'}
            </Text>
          </TouchableOpacity>

          {/* Menu button inline with search + language */}
          <GridMenu inline selectedLang={selectedLang} />

        </View>
      </View>


      {/* Sentence strip */}
      <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
        <View
          style={[
            {
              minHeight: 60,
              borderWidth: 2,
              borderRadius: 16,
              paddingHorizontal: 12,
              paddingVertical: 10,
              backgroundColor: '#FFFFFF',
              borderColor: theme.accent + '55',
              flexDirection: 'row',
              alignItems: 'flex-start',
            },
            shadow.s,
          ]}
        >
          <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
            {utterance.length === 0 ? (
              <Text style={{ color: theme.accent, fontWeight: '600' }}>{t('buildSentence', selectedLang)}</Text>
            ) : (
              utterance.map((tileId, i) => (
                <View
                  key={`${tileId}-${i}`}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    backgroundColor: theme.chip,
                    borderRadius: 12,
                    marginRight: 6,
                    marginBottom: 6,
                  }}
                >
                  <Text style={{ color: theme.text, fontWeight: '700' }}>{tWord(tileId, selectedLang)}</Text>
                </View>
              ))
            )}
          </View>
          <View style={{ flexDirection: 'row', columnGap: 8, marginLeft: 8 }}>
            <TouchableOpacity
              onPress={onSpeakSentence}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Speak sentence"
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: theme.accent,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="volume-high-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setUtterance([])}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Clear sentence"
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: '#F3F4F6',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: '#E5E7EB',
              }}
            >
              <Ionicons name="trash-outline" size={20} color="#111827" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Category chips (responsive wrap) */}
      <View style={{ marginTop: 10 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"
          contentContainerStyle={{ paddingHorizontal: 16, columnGap: 8, backgroundColor: theme.bg }}
        >
          {allCategories.map((item) => {
            const active = item.id === activeCat;
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => setActiveCat(item.id)}
                style={[{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: active ? theme.text : theme.chip }, shadow.xs]}
                activeOpacity={0.9}
              >
                <Text style={{ color: active ? '#fff' : theme.text, fontWeight: '800' }}>{item.title}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Common words lane */}
      <View style={{ marginTop: 10 }}>
        <Text style={{ paddingHorizontal: 16, color: '#6B7280', marginBottom: 6, fontWeight: '600' }}>{t('common', selectedLang)}</Text>
        <FlatList
          data={COMMON_WORDS}
          keyExtractor={(t) => t.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"
          contentContainerStyle={{ paddingHorizontal: 16, columnGap: 10, backgroundColor: theme.bg }}
          renderItem={({ item }) => (
            <AnimatedCommonChip
              t={item}
              onPress={(tile) => {
                Haptics.selectionAsync();
                setUtterance(s => [...s, tile.id]);
                scheduleSpeak(tWord(tile.id, selectedLang), selectedLang, 10, speechRate);
              }}
              selectedLang={selectedLang}
            />
          )}
        />
      </View>

      {/* Section title */}
      <SectionHeader id={activeCat} title={category.title} />

      {/* Grid */}
      <FlatList
        style={{ flex: 1, marginTop: 6, paddingHorizontal: 16, backgroundColor: theme.bg }}
        data={filteredTiles}
        key={`auto-cols-${cols}-${category.id}`}
        numColumns={cols}
        keyExtractor={(t) => t.id}
        columnWrapperStyle={cols > 1 ? { columnGap: 8, overflow: 'visible', position: 'relative' } : undefined}
        contentContainerStyle={{
          paddingBottom: 28,
          rowGap: 8,
        }}
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        windowSize={5}
        removeClippedSubviews
        bounces={false}
        overScrollMode="never"
        updateCellsBatchingPeriod={40}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        renderItem={({ item, index }) => (
          <View style={{ flex: 1, overflow: 'visible', position: 'relative' }}>
            <TileCard
              t={item}
              index={index}
              onPress={onTile}
              accent={CATEGORY_STYLES[activeCat].accent}
              isFav={favorites.has(item.id)}
              onToggleFav={async (id) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                try {
                  const { favorites: favList } = await toggleFavorite(id);
                  setFavorites(new Set(favList));
                } catch (e) {
                  Alert.alert(t('failed', selectedLang), t('couldNotUpdateFavorites', selectedLang));
                }
              }}
              isMyTile={isMyTile(item)}
              onEditTile={onEditTile}
              onDeleteTile={confirmDelete}
              selectedLang={selectedLang}
            />
          </View>
        )}
      />

      {/* Language menu (modal sheet) */}
      {langMenuOpen && (
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.35)' }}>
          <View style={{ marginTop: 80, marginHorizontal: 16, borderRadius: 16, backgroundColor: '#fff', padding: 12, ...shadow.m }}>
            <Text style={{ fontWeight: '800', fontSize: 16, marginBottom: 8 }}>{t('chooseLanguage', selectedLang)}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 8, rowGap: 8 }}>
              {LANG_OPTIONS.map((opt) => {
                const active = selectedLang === opt.key;
                const dim = !available[opt.key];
                return (
                  <TouchableOpacity
                    key={opt.key}
                    onPress={() => { setSelectedLang(opt.key); setLangMenuOpen(false); }}
                    activeOpacity={0.9}
                    style={[styles.radioItem, { backgroundColor: active ? theme.text : theme.chip, borderColor: active ? theme.text : theme.accent + '55', opacity: dim && !active ? 0.55 : 1 }]}
                  >
                    <View style={[styles.radioOuter, { borderColor: active ? '#fff' : theme.text }]}>
                      {active && <View style={[styles.radioInner, { backgroundColor: '#fff' }]} />}
                    </View>
                    <Text style={{ fontWeight: '800', color: active ? '#fff' : theme.text }}>{opt.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={{ alignItems: 'flex-end', marginTop: 10 }}>
              <TouchableOpacity onPress={() => setLangMenuOpen(false)} style={[styles.secondaryBtn]}>
                <Text style={{ fontWeight: '700', color: '#111827' }}>{t('close', selectedLang)}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}


      {/* Add Tile Modal */}
      {showAddModal && (
        <View
          style={{
            position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.35)',
            alignItems: 'center', justifyContent: 'center', padding: 16
          }}
        >
          <View
            style={{
              width: '100%', maxWidth: 560, maxHeight: '80%',
              backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden'
            }}
          >
            <ScrollView
              contentContainerStyle={{ padding: 16 }}
              keyboardShouldPersistTaps="handled"
              // ensures scrolling on web if content is tall
              style={{ flexGrow: 0 }}
            >
              <Text style={{ fontSize: 18, fontWeight: '800', marginBottom: 10 }}>{t('createCustomTile', selectedLang)}</Text>
              <NiceAlert message={formError} />


              {/* ID */}
              <Text style={{ fontWeight: '700', color: '#374151' }}>{t('id', selectedLang)}</Text>
              <TextInput value={newId} onChangeText={setNewId} placeholder={t('idPlaceholder', selectedLang)} style={styles.input} autoCapitalize="none" />

              {/* Label */}
              <Text style={{ fontWeight: '700', color: '#374151', marginTop: 8 }}>{t('label', selectedLang)}</Text>
              <TextInput value={newLabel} onChangeText={setNewLabel} placeholder={t('labelPlaceholder', selectedLang)} style={styles.input} />

              {/* Emoji */}
              <Text style={{ fontWeight: '700', color: '#374151', marginTop: 8 }}>{t('emoji', selectedLang)}</Text>
              <TextInput value={newEmoji} onChangeText={setNewEmoji} placeholder={t('emojiPlaceholder', selectedLang)} style={styles.input} />

              {/* Source mode toggle */}
              <View style={{ flexDirection: 'row', marginTop: 12, marginBottom: 8 }}>
                <TouchableOpacity
                  onPress={() => setSourceMode('url')}
                  style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: sourceMode === 'url' ? '#2563EB' : '#E5E7EB', marginRight: 8 }}
                >
                  <Text style={{ color: sourceMode === 'url' ? '#fff' : '#111827', fontWeight: '700' }}>{t('imageUrl', selectedLang)}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSourceMode('upload')}
                  style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: sourceMode === 'upload' ? '#2563EB' : '#E5E7EB' }}
                >
                  <Text style={{ color: sourceMode === 'upload' ? '#fff' : '#111827', fontWeight: '700' }}>{t('upload', selectedLang)}</Text>
                </TouchableOpacity>
              </View>

              {sourceMode === 'url' ? (
                <>
                  <Text style={{ fontWeight: '700', color: '#374151' }}>{t('imageUrl', selectedLang)}</Text>
                  <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>
                    {t('mustStartWithHttp', selectedLang)}
                  </Text>

                  <TextInput
                    value={newImageUrl}
                    onChangeText={setNewImageUrl}
                    placeholder={t('imageUrlPlaceholder', selectedLang)}
                    style={styles.input}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </>
              ) : (
                <>
                  {/* PICK + PREVIEW + (auto)UPLOAD on Save */}
                  <TouchableOpacity
                    onPress={pickImageFromDevice}
                    activeOpacity={0.9}
                    style={{ backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, alignItems: 'center', marginTop: 4 }}
                  >
                    <Ionicons name="image-outline" size={20} color="#4B5563" />
                    <Text style={{ marginTop: 6, color: '#374151', fontWeight: '700' }}>
                      {pickedUri ? t('changeImage', selectedLang) : t('chooseImage', selectedLang)}
                    </Text>
                    <Text style={{ marginTop: 2, fontSize: 12, color: '#6B7280' }}>
                      {t('maxSize', selectedLang)}
                    </Text>
                  </TouchableOpacity>

                  {pickedUri ? (
                    <View style={{ alignItems: 'center', marginTop: 10 }}>
                      <Image source={{ uri: pickedUri }} style={{ width: 120, height: 120, borderRadius: 12 }} />
                      <Text style={{ marginTop: 6, fontSize: 12, color: '#6B7280' }}>{t('willUploadOnSave', selectedLang)}</Text>
                    </View>
                  ) : null}
                </>
              )}

              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 14 }}>
                <TouchableOpacity onPress={() => {
                  setShowAddModal(false);
                  setNewId('');
                  setNewLabel('');
                  setNewEmoji('');
                  setNewImageUrl('');
                  setPickedUri('');
                  setSourceMode('url');
                  setSaving(false);
                  setUploading(false);
                }} style={[styles.secondaryBtn, { marginRight: 8 }]}>
                  <Text>{t('cancel', selectedLang)}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={async () => {
                    if (saving || uploading) return;

                    const id = newId.trim();
                    const label = newLabel.trim();
                    const emoji = newEmoji.trim();
                    const imageUrlRaw = newImageUrl.trim();

                    // Field validations
                    if (!id && !label) {
                      setFormError?.(t('idAndLabelRequired', selectedLang));
                      showError?.(t('idAndLabelRequired', selectedLang));
                      return;
                    }
                    if (!id) {
                      setFormError?.(t('pleaseEnterId', selectedLang));
                      showError?.(t('missingId', selectedLang));
                      return;
                    }
                    if (!/^[a-zA-Z0-9_-]{2,40}$/.test(id)) {
                      setFormError?.(t('invalidId', selectedLang));
                      showError?.(t('invalidIdFormat', selectedLang));
                      return;
                    }
                    if (!label) {
                      setFormError?.(t('pleaseEnterLabel', selectedLang));
                      showError?.(t('missingLabel', selectedLang));
                      return;
                    }

                    // Image requirement: either a valid URL (when mode=url) or a picked file (when mode=upload)
                    if (sourceMode === 'url') {
                      if (!imageUrlRaw) {
                        setFormError?.(t('pleaseAddImageUrl', selectedLang));
                        showError?.(t('missingImageUrl', selectedLang));
                        return;
                      }
                      try {
                        const u = new URL(imageUrlRaw);
                        if (u.protocol !== 'http:' && u.protocol !== 'https:') throw new Error();
                      } catch {
                        setFormError?.(t('invalidUrl', selectedLang));
                        showError?.(t('invalidUrl', selectedLang));
                        return;
                      }
                    } else {
                      if (!pickedUri) {
                        setFormError?.(t('pleaseChooseImage', selectedLang));
                        showError?.(t('noImageSelected', selectedLang));
                        return;
                      }
                    }

                    setFormError?.(null);
                    setSaving(true);
                    let finalImageUrl: string | undefined = imageUrlRaw || undefined;

                    try {
                      if (sourceMode === 'upload') {
                        finalImageUrl = await uploadPickedImage();
                      }

                      const { tile } = await addCustomTile({
                        id,
                        label,
                        emoji: emoji || undefined,
                        imageUrl: finalImageUrl,
                      });

                      setCustomTiles(prev => [...prev, { ...tile, imageUrl: normImageUrl(tile.imageUrl) }]);

                      // reset form
                      setShowAddModal(false);
                      setNewId(''); setNewLabel(''); setNewEmoji('');
                      setNewImageUrl(''); setPickedUri('');
                      setSourceMode('url');

                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                      showSuccess?.(t('customTileCreated', selectedLang));
                    } catch (e: any) {
                      console.error('Error creating tile:', e);
                      setFormError?.(e?.message || t('couldNotCreateTile', selectedLang));
                      showError?.(e?.message || t('couldNotCreateTile', selectedLang));
                    } finally {
                      setSaving(false);
                    }
                  }}
                  disabled={uploading || saving}
                  style={[styles.primaryBtn, { backgroundColor: (uploading || saving) ? '#9CA3AF' : '#2563EB' }]}
                >
                  <Text style={{ color: '#fff', fontWeight: '800' }}>
                    {uploading ? t('uploading', selectedLang) : saving ? t('saving', selectedLang) : t('save', selectedLang)}
                  </Text>
                </TouchableOpacity>

              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {/* Edit Modal */}
      <Modal visible={editOpen} transparent animationType="fade" onRequestClose={() => setEditOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t('editTile', selectedLang)}</Text>

            <Text style={styles.label}>{t('label', selectedLang)}</Text>
            <TextInput
              value={editForm?.label ?? ""}
              onChangeText={(t) => setEditForm((f) => (f ? { ...f, label: t } : f))}
              style={styles.input}
              placeholder={t('labelPlaceholder', selectedLang)}
            />

            <Text style={styles.label}>{t('imageUrl', selectedLang)} ({t('emoji', selectedLang).replace(' (optional)', '')})</Text>
            <TextInput
              value={editForm?.imageUrl ?? ""}
              onChangeText={(t) => setEditForm((f) => (f ? { ...f, imageUrl: t } : f))}
              style={styles.input}
              placeholder={t('imageUrlPlaceholder', selectedLang)}
              autoCapitalize="none"
            />

            <View style={styles.row}>
              <TouchableOpacity
                onPress={() => setEditOpen(false)}
                style={[styles.btn, styles.btnGhost]}
                disabled={savingEdit}
              >
                <Text style={styles.btnText}>{t('cancel', selectedLang)}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onSaveEdit}
                style={[styles.btn, styles.btnPrimary]}
                disabled={savingEdit}
              >
                <Text style={styles.btnText}>{savingEdit ? t('saving', selectedLang) : t('save', selectedLang)}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={async () => {
              await pickImageFromDevice();
              if (pickedUri) {
                try {
                  const url = await uploadPickedImage();
                  if (url) setEditForm(f => f ? { ...f, imageUrl: url } : f);
                } catch (e) {
                  Alert.alert(t('failed', selectedLang), t('couldNotCreateTile', selectedLang));
                }
              }
            }} style={[styles.btn, styles.btnSecondary]}>
              <Text style={styles.btnText}>Replace Image</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Speed control modal */}
      <Modal visible={speedModalOpen} transparent animationType="fade" onRequestClose={() => setSpeedModalOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 20 }} onPress={() => setSpeedModalOpen(false)}>
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16 }}>
            <Text style={{ fontWeight: '800', fontSize: 18, marginBottom: 8 }}>Speech speed</Text>
            <Text style={{ color: '#6B7280', marginBottom: 12 }}>Mode: {speechMode}</Text>

            {/* Slider row (use plain RN Slider or a few buttons if you don't have slider) */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <TouchableOpacity onPress={() => { setSpeechRate(0.64); setSpeechMode('slow'); }} style={{ padding: 8, borderRadius: 8, backgroundColor: '#F3F4F6' }}>
                <Text>Slow</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setSpeechRate(DEFAULT_SPEECH_RATE); setSpeechMode('normal'); }} style={{ padding: 8, borderRadius: 8, backgroundColor: '#F3F4F6' }}>
                <Text>Normal</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setSpeechRate(0.82); setSpeechMode('stretched'); }} style={{ padding: 8, borderRadius: 8, backgroundColor: '#F3F4F6' }}>
                <Text>Stretched</Text>
              </TouchableOpacity>
            </View>

            <View style={{ marginTop: 12 }}>
              <Text style={{ fontSize: 12, color: '#6B7280' }}>Fine tune speed: {speechRate.toFixed(2)}</Text>
              {/* If you have @react-native-community/slider installed use that; otherwise keep presets */}
              {/* Example using a simple RN slider placeholder: */}
              {/* <Slider minimumValue={0.5} maximumValue={1.0} value={speechRate} onValueChange={(v)=>setSpeechRate(Number(v.toFixed(2)))} step={0.01} /> */}
            </View>

            <View style={{ marginTop: 12, flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
              <TouchableOpacity onPress={() => setSpeedModalOpen(false)} style={{ padding: 8 }}>
                <Text style={{ color: '#6B7280' }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Toast root (keep this as the last child in the screen) */}
      <Toast position="top" topOffset={60} visibilityTime={2000} />
    </View>
  );
}

// ---------- styles ----------
const shadow = {
  xs: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  s: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  m: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 5 },
};

const styles = StyleSheet.create({
  inputWrap: { borderWidth: 1.5, borderRadius: 12, backgroundColor: '#FFFFFF' },
  input: { paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: '#111827' },
  primaryBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  secondaryBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: '#E5E7EB' },

  // radio chips
  radioItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1.5, gap: 8 },
  radioOuter: { width: 18, height: 18, borderRadius: 999, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 10, height: 10, borderRadius: 999 },

  // card - images fill entire tile
  card: {
    aspectRatio: 1,
    borderRadius: 12,
    position: 'relative',
    overflow: 'visible',
  },
  cardInner: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  fullImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  tapGlow: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 16,
    borderWidth: 2,
    opacity: 0,
    pointerEvents: 'none',
  },
  emojiWrap: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  emojiText: { fontSize: 48 },
  overlayLabelWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 12,
    alignItems: 'center',
    zIndex: 2,
  },
  labelBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  overlayLabelText: {
    fontWeight: '700',
    color: '#111827',
    fontSize: 11,
    letterSpacing: 0.2,
  },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 4, zIndex: 3 },

  // Action chips for editing
  tileActions: {
    position: "absolute",
    top: 6,
    left: 6,
    flexDirection: "row",
    gap: 6,
    zIndex: 5,
  },
  actionChip: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.92)",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  editChip: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  deleteChip: {
    borderWidth: 1,
    borderColor: "rgba(255,0,0,0.15)",
  },

  // Edit modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 16,
    backgroundColor: "#fff",
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  label: { fontSize: 12, opacity: 0.7, marginTop: 10, marginBottom: 6 },
  row: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 16 },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  btnGhost: {
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  btnPrimary: {
    backgroundColor: "#2563EB",
  },
  btnSecondary: {
    backgroundColor: "#10B981",
    marginTop: 12,
  },
  btnText: { color: "#fff", fontWeight: "600" },

  heartWrap: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 32,
    height: 32,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  heartIcon: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});




