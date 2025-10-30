
import { CATEGORIES, CATEGORY_STYLES, COMMON_WORDS, tileImages, type Category, type Tile } from '@/constants/aac';
import { addCustomTile, API_BASE_URL, getCustomTiles, getFavorites, toggleFavorite, type CustomTile } from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import * as Speech from 'expo-speech';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  FlatList,
  Image,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
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

// Per-language dictionary. Add/edit any words you like.
const TRANSLATIONS: Record<LangKey, Record<string, string>> = {
  'en-US': {
    i: 'I', want: 'want', more: 'more', help: 'help', go: 'go', stop: 'stop', yes: 'yes', no: 'no', please: 'please', thankyou: 'thank you',
    if: 'if', this: 'this', that: 'that', then: 'then', to: 'to',
    car: 'car', bike: 'bike', train: 'train', bus: 'bus', plane: 'plane',
    apple: 'apple', banana: 'banana', rice: 'rice', milk: 'milk', bread: 'bread',
    doctor: 'doctor', teacher: 'teacher', police: 'police', farmer: 'farmer', chef: 'chef',
    happy: 'happy', sad: 'sad', angry: 'angry', tired: 'tired', excited: 'excited',
    eat: 'eat', drink: 'drink', open: 'open', close: 'close', play: 'play',
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
    confident: 'आत्मविश्वासी', relaxed: 'आरामदायक', annoyed: 'चिढ़ा', shocked: 'स्तब्ध',
    // Actions
    eat: 'खाना', drink: 'पीना', open: 'खोलो', close: 'बंद करो', play: 'खेलो', run: 'दौड़ो', walk: 'चलो', jump: 'कूदो', sit: 'बैठो', stand: 'खड़े हो',
    sleep: 'सोओ', read: 'पढ़ो', write: 'लिखो', draw: 'ड्रॉ करो', sing: 'गाना गाओ', dance: 'नाचो', wash: 'धोओ', brush: 'ब्रश करो', take: 'लो', give: 'दो',
    go: 'जाओ', come: 'आओ', look: 'देखो', listen: 'सुनो', stop: 'रुको', start: 'शुरू करो', help: 'मदद करो', call: 'फोन करो', wait: 'ठहरो', think: 'सोचो',
  },
  'pa-IN': {
    i: 'ਮੈਂ', want: 'ਚਾਹੁੰਦਾ ਹਾਂ', more: 'ਹੋਰ', help: 'ਮਦਦ', go: 'ਚੱਲੋ', stop: 'ਰੁੱਕੋ', yes: 'ਹਾਂ', no: 'ਨਹੀਂ', please: 'ਕਿਰਪਾ ਕਰਕੇ', thankyou: 'ਧੰਨਵਾਦ',
    if: 'ਜੇ', this: 'ਇਹ', that: 'ਉਹ', then: 'ਫਿਰ', to: 'ਨੂੰ',
    car: 'ਕਾਰ', bike: 'ਬਾਈਕ', train: 'ਰੇਲਗੱਡੀ', bus: 'ਬੱਸ', plane: 'ਜਹਾਜ਼',
    apple: 'ਸੇਬ', banana: 'ਕੇਲਾ', rice: 'ਚਾਵਲ', milk: 'ਦੁੱਧ', bread: 'ਰੋਟੀ',
    doctor: 'ਡਾਕਟਰ', teacher: 'ਅਧਿਆਪਕ', police: 'ਪੁਲਿਸ', farmer: 'ਕਿਸਾਨ', chef: 'ਸ਼ੈਫ',
    happy: 'ਖੁਸ਼', sad: 'ਉਦਾਸ', angry: 'ਗੁੱਸਾ', tired: 'ਥੱਕਿਆ', excited: 'ਉਤਸ਼ਾਹਿਤ',
    eat: 'ਖਾਓ', drink: 'ਪੀਓ', open: 'ਖੋਲ੍ਹੋ', close: 'ਬੰਦ ਕਰੋ', play: 'ਖੇਡੋ',
  },
  'ta-IN': {
    i: 'நான்', want: 'வேண்டும்', more: 'இன்னும்', help: 'உதவி', go: 'போ', stop: 'நிறுத்து', yes: 'ஆம்', no: 'இல்லை', please: 'தயவு செய்து', thankyou: 'நன்றி',
    if: 'என்றால்', this: 'இந்த', that: 'அந்த', then: 'அப்போது', to: 'க்கு',
    car: 'கார்', bike: 'பைக்', train: 'ரயில்', bus: 'பேருந்து', plane: 'விமானம்',
    apple: 'ஆப்பிள்', banana: 'வாழை', rice: 'அரிசி', milk: 'பால்', bread: 'ரொட்டி',
    doctor: 'மருத்துவர்', teacher: 'ஆசிரியர்', police: 'போலீஸ்', farmer: 'விவசாயி', chef: 'சமையல்காரர்',
    happy: 'மகிழ்ச்சி', sad: 'துயரம்', angry: 'கோபம்', tired: 'சோர்வு', excited: 'உற்சாகம்',
    eat: 'சாப்பிடு', drink: 'குடி', open: 'திற', close: 'மூடு', play: 'விளையாடு',
  },
  'te-IN': {
    i: 'నేను', want: 'కావాలి', more: 'ఇంకా', help: 'సహాయం', go: 'వెళ్ళు', stop: 'ఆపు', yes: 'అవును', no: 'కాదు', please: 'దయచేసి', thankyou: 'ధన్యవాదాలు',
    if: 'ఒకవేళ', this: 'ఈ', that: 'ఆ', then: 'అప్పుడు', to: 'కు',
    car: 'కారు', bike: 'బైక్', train: 'రైలు', bus: 'బస్సు', plane: 'విమానం',
    apple: 'ఆపిల్', banana: 'అరటి', rice: 'బియ్యం', milk: 'పాలు', bread: 'రొట్టి',
    doctor: 'డాక్టర్', teacher: 'ఉపాధ్యాయుడు', police: 'పోలీస్', farmer: 'రైతు', chef: 'షెఫ్',
    happy: 'సంతోషం', sad: 'దుఃఖం', angry: 'కోపం', tired: 'అలసట', excited: 'ఉత్సాహం',
    eat: 'తిను', drink: 'త్రాగు', open: 'తెరువు', close: 'మూసివేయి', play: 'ఆడు',
  },
};

// ---------- Smart voice selection (Expo Speech) ----------
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

async function pickVoice(lang: LangKey): Promise<Speech.Voice | null> {
  const voices = await loadVoices();
  let v = voices.find(v => v.language?.toLowerCase() === lang.toLowerCase());
  if (v) return v;
  v = voices.find(LANG_MATCH[lang]);
  if (v) return v;
  return voices.find(LANG_MATCH['en-US']) || null; // final fallback
}

async function speakSmart(text: string, lang: LangKey) {
  const voice = await pickVoice(lang);
  const isIndianLang = lang !== 'en-US';

  if (!voice || (voice.language && !voice.language.toLowerCase().startsWith(lang.slice(0,2).toLowerCase()))) {
    // Missing voice: guide user once per session (simple alert)
    Alert.alert(
      'Install voice',
      `This device may not have a ${lang} voice installed. I’ll use English for now.\n\nAndroid: Settings → System → Languages & input → Text-to-speech → Google TTS → Install voice data.\niOS: Settings → Accessibility → Spoken Content → Voices.`,
      [{ text: 'OK' }]
    );
    Speech.stop();
    Speech.speak(text, { language: 'en-US', rate: 0.98, pitch: 1.0 });
    return;
  }

  Speech.stop();
  Speech.speak(text, {
    language: voice.language,
    voice: voice.identifier,
    rate: isIndianLang ? 0.95 : 1.0,
    pitch: 1.0,
  });
}

function tWord(id: string, lang: LangKey) {
  return TRANSLATIONS[lang]?.[id] ?? id;
}
function tSentence(ids: string[], lang: LangKey) {
  return ids.map(w => tWord(w, lang)).join(' ');
}

// tile types, constants and styles now imported from '@/constants/aac'

// ---------- Small helpers ----------
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const springify = (v: Animated.Value, to: number) =>
  Animated.spring(v, { toValue: to, useNativeDriver: true, friction: 6, tension: 120 });

// ---------- UI pieces ----------
function SectionHeader({ id, title }: { id: Category['id']; title: string }) {
  const style = CATEGORY_STYLES[id];
  const underline = useRef(new Animated.Value(0)).current;
  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    underline.setValue(0); bounce.setValue(0);
    Animated.parallel([
      Animated.timing(underline, { toValue: 1, duration: 550, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      Animated.sequence([
        Animated.timing(bounce, { toValue: 1, duration: 280, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 0, duration: 180, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      ]),
    ]).start();
  }, [id]);

  return (
    <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Animated.Text style={{ fontSize: 22, fontWeight: '800', color: style.text, transform: [{ translateY: bounce.interpolate({ inputRange: [0,1], outputRange: [0,-6] }) }] }}>
          {style.headerEmoji}
        </Animated.Text>
        <Text style={{ fontSize: 22, fontWeight: '800', color: style.text }}>{title}</Text>
      </View>
      <Animated.View style={{ height: 4, backgroundColor: style.accent, borderRadius: 999, marginTop: 8, width: underline.interpolate({ inputRange: [0,1], outputRange: ['0%','55%'] }) as any }} />
    </View>
  );
}

function AnimatedCommonChip({ t, onPress }: { t: Tile; onPress: (t: Tile) => void }) {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <AnimatedPressable
      onPressIn={() => springify(scale, 0.96).start()}
      onPressOut={() => springify(scale, 1).start()}
      onPress={() => onPress(t)}
      style={[{ height: 46, paddingHorizontal: 12, borderRadius: 14, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', transform: [{ scale }] }, shadow.s]}
      accessibilityRole="button"
    >
      <Text style={{ fontWeight: '700' }}>{t.label}</Text>
    </AnimatedPressable>
  );
}

function TileCard({ t, index, onPress, accent, isFav, onToggleFav, isMyTile, onEditTile, onDeleteTile }: { 
  t: Tile; 
  index: number; 
  onPress: (t: Tile) => void; 
  accent: string; 
  isFav: boolean; 
  onToggleFav: (id: string) => void;
  isMyTile?: boolean;
  onEditTile?: (t: Tile) => void;
  onDeleteTile?: (t: Tile) => void;
}) {
  const mount = useRef(new Animated.Value(0)).current;
  const press = useRef(new Animated.Value(1)).current;
  const wobble = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    mount.setValue(0);
    Animated.sequence([
      Animated.delay(index * 25),
      Animated.timing(mount, { toValue: 1, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [index]);

  const rotate = wobble.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-3deg', '0deg', '3deg'] });
  const startWobble = () => {
    wobble.stopAnimation(); wobble.setValue(0);
    Animated.sequence([
      Animated.timing(wobble, { toValue: 1, duration: 90, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(wobble, { toValue: -1, duration: 90, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(wobble, { toValue: 1, duration: 90, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(wobble, { toValue: 0, duration: 90, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  };

  return (
    <AnimatedPressable
      onPressIn={() => { springify(press, 0.97).start(); startWobble(); }}
      onPressOut={() => springify(press, 1).start()}
      onPress={() => onPress(t)}
      onHoverIn={startWobble}
      style={[
        styles.card,
        { transform: [{ scale: mount.interpolate({ inputRange: [0,1], outputRange: [0.96,1] }) }, { scale: press }, { rotate }], opacity: mount, borderColor: 'rgba(17,17,17,0.06)' },
        shadow.m,
      ]}
      accessibilityRole="button"
    >
      <View pointerEvents="none" style={[StyleSheet.absoluteFillObject, { backgroundColor: accent + '18', borderRadius: 16 }]} />
      <View style={styles.emojiWrap}>
        <View style={[styles.emojiHalo, { backgroundColor: accent + '26' }]} />
        {t.imageUrl ? (
          <Image source={{ uri: t.imageUrl }} resizeMode="cover" style={styles.emojiImage} />
        ) : t.imageKey && tileImages[t.imageKey] ? (
          <Image source={tileImages[t.imageKey]} resizeMode="cover" style={styles.emojiImage} />
        ) : (
          <Text style={styles.emojiText}>{t.emoji || '🟦'}</Text>
        )}
      </View>
      <View style={styles.labelWrap}>
        <Text numberOfLines={1} style={styles.labelText}>{t.label}</Text>
      </View>
      <Animated.View style={[styles.bottomBar, { backgroundColor: accent }]} />
      
      {/* heart overlay */}
      <TouchableOpacity
        onPress={() => onToggleFav(t.id)}
        activeOpacity={0.8}
        style={{
          position: 'absolute', top: 6, right: 6,
          backgroundColor: 'rgba(255,255,255,0.9)',
          borderRadius: 999, paddingHorizontal: 8, paddingVertical: 6
        }}
      >
        <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={16} color={isFav ? '#EF4444' : '#6B7280'} />
      </TouchableOpacity>

      {/* Action chips for My Tiles */}
      {isMyTile && (
        <View style={styles.tileActions}>
          <TouchableOpacity
            onPress={() => onEditTile?.(t)}
            style={[styles.actionChip, styles.editChip]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Edit tile"
          >
            <Ionicons name="create-outline" size={16} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onDeleteTile?.(t)}
            style={[styles.actionChip, styles.deleteChip]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Delete tile"
          >
            <Ionicons name="trash-outline" size={16} />
          </TouchableOpacity>
        </View>
      )}
    </AnimatedPressable>
  );
}

// ---------- Screen ----------
export default function AACGrid() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [utterance, setUtterance] = useState<string[]>([]);
  const [activeCat, setActiveCat] = useState<Category['id']>('transport');
  const [selectedLang, setSelectedLang] = useState<LangKey>('en-US');
  const [available, setAvailable] = useState<Record<LangKey, boolean>>({
    'en-US': true, 'hi-IN': false, 'pa-IN': false, 'ta-IN': false, 'te-IN': false,
  });

  // New state for favorites and custom tiles
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [customTiles, setCustomTiles] = useState<CustomTile[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
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

  const allCategories: Category[] = useMemo(() => {
    const favTiles: Tile[] = [];
    // Collect from COMMON + all real categories
    const every: Tile[] = [
      ...COMMON_WORDS,
      ...CATEGORIES.flatMap(c => c.tiles),
      ...customTiles.map(ct => ({ id: ct.id, label: ct.label, emoji: ct.emoji, imageUrl: ct.imageUrl } as Tile)),
    ];
    for (const t of every) if (favorites.has(t.id)) favTiles.push(t);

    const myTilesCat: Category = {
      id: MY_CATEGORY_ID as any,
      title: 'My Tiles',
      color: '#E0F2FE',
      tiles: customTiles.map(ct => ({ id: ct.id, label: ct.label, emoji: ct.emoji, imageUrl: ct.imageUrl })),
    };

    const favCat: Category = {
      id: FAV_CATEGORY_ID as any,
      title: 'Favorites',
      color: '#FFE8A3',
      tiles: favTiles,
    };

    return [
      ...CATEGORIES,
      favCat,
      myTilesCat,
    ];
  }, [favorites, customTiles]);

  const category = useMemo(() => allCategories.find(c => c.id === activeCat) ?? allCategories[0], [activeCat, allCategories]);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [activeCat, cols, selectedLang, width]);

  // Load favorites and custom tiles on mount
  useEffect(() => {
    (async () => {
      try {
        const fav = await getFavorites();
        setFavorites(new Set(fav.favorites || []));
      } catch {}
      try {
        const { tiles } = await getCustomTiles();
        setCustomTiles(tiles || []);
      } catch {}
    })();
  }, []);

  // Helper functions for image upload
  async function pickImageFromDevice() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo access to pick an image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setPickedUri(uri);
    }
  }

  async function uploadPickedImage(): Promise<string> {
    if (!pickedUri) throw new Error('No image selected');
    setUploading(true);
    try {
      const form = new FormData();
      const filename = `image-${Date.now()}.jpg`;
      const type = 'image/jpeg';

      // For blob URIs, we need to fetch the blob and convert it to a file
      if (pickedUri.startsWith('blob:')) {
        const response = await fetch(pickedUri);
        const blob = await response.blob();
        
        // Create a file from the blob
        const file = new File([blob], filename, { type });
        form.append('file', file);
      } else {
        // For regular URIs (like from image picker), use the original approach
        // @ts-ignore (RN FormData file)
        form.append('file', { uri: pickedUri, name: filename, type });
      }

      // Get auth headers for the upload
      const { authHeaders } = await import('@/utils/api');
      
      // tell authHeaders we're doing multipart so it must NOT add Content-Type
      const headers = await authHeaders?.({ multipart: true }) ?? {};
      
      // extra safety: remove any content-type that might still sneak in
      for (const k of Object.keys(headers)) {
        if (k.toLowerCase() === 'content-type') delete (headers as any)[k];
      }

      const res = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        headers,          // no Content-Type here
        body: form,       // FormData
      });

      if (!res.ok) {
        const text = await res.text();
        console.error('Upload failed:', text);
        throw new Error(text || `Upload failed (${res.status})`);
      }
      const data = await res.json();
      console.log('Upload successful:', data);
      return data.url as string;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  }

  // Identify "My Tiles" - custom tiles
  const isMyTile = (t: Tile) => customTiles.some(ct => ct.id === t.id);

  // Upload or keep existing URL helper
  async function uploadOrKeep(url?: string): Promise<string | undefined> {
    // If user provided a fresh URL, keep it
    if (url && /^https?:\/\//i.test(url)) return url;

    // Otherwise, let user pick a file and upload using existing upload endpoint
    if (pickedUri) {
      return await uploadPickedImage();
    }
    return url; // fallback no-op if you only edit label
  }

  // Update the local custom tiles array
  function updateMyTileLocal(updated: CustomTile) {
    setCustomTiles((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
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
      // 1) optionally upload/keep image
      const finalUrl = await uploadOrKeep(editForm.imageUrl);

      // 2) call backend if available (optional)
      try {
        const { authHeaders } = await import('@/utils/api');
        await fetch(`${API_BASE_URL}/api/me/custom-tiles/${editForm.id}`, {
          method: "PUT",
          headers: await authHeaders(),
          body: JSON.stringify({ label: editForm.label, imageUrl: finalUrl }),
        });
      } catch {
        // ignore if you don't have this endpoint yet; local update still happens
      }

      // 3) local state update
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
        // backend delete (optional)
        try {
          const { authHeaders } = await import('@/utils/api');
          await fetch(`${API_BASE_URL}/api/me/custom-tiles/${tile.id}`, {
            method: "DELETE",
            headers: await authHeaders(),
          });
        } catch {
          // ignore if no endpoint; we still remove locally
        }
        removeMyTileLocal(tile.id);
      } catch (e) {
        console.error("Delete failed", e);
      }
    };

    if (Platform.OS === "web") {
      if (window.confirm(`Delete "${tile.label}"?`)) go();
    } else {
      Alert.alert("Delete tile", `Delete "${tile.label}"?`, [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: go },
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

  const onTile = async (t: Tile) => {
    Haptics.selectionAsync();
    setUtterance(s => [...s, t.id]); // store ids so we can translate for sentence too
    const say = tWord(t.id, selectedLang);
    await speakSmart(say, selectedLang);
  };

  const onSpeakSentence = async () => {
    if (!utterance.length) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const say = tSentence(utterance, selectedLang);
    await speakSmart(say, selectedLang);
  };

  const theme = CATEGORY_STYLES[activeCat];
  const addBtnBottom = (insets.bottom || 12) + Platform.select({ ios: 76, android: 84, default: 82 });

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg}}>
      {/* Top bar: Search (left) + language radios (right) */}
      <View style={{ paddingHorizontal: 16, paddingTop: 50 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={[styles.inputWrap, { borderColor: theme.accent + '66', flex: 1 }]}>
            <TextInput
              placeholder="Search words…"
              value={query}
              onChangeText={setQuery}
              style={styles.input}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} style={{ maxWidth: '55%' }}>
            {LANG_OPTIONS.map(opt => {
              const active = selectedLang === opt.key;
              const dim = !available[opt.key];
              return (
                <TouchableOpacity
                  key={opt.key}
                  onPress={() => setSelectedLang(opt.key)}
                  activeOpacity={0.9}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  style={[
                    styles.radioItem,
                    { backgroundColor: active ? theme.text : theme.chip, borderColor: active ? theme.text : theme.accent + '55', opacity: dim && !active ? 0.55 : 1 },
                  ]}
                >
                  <View style={[styles.radioOuter, { borderColor: active ? '#fff' : theme.text }]}>
                    {active && <View style={[styles.radioInner, { backgroundColor: '#fff' }]} />}
                  </View>
                  <Text style={{ fontWeight: '800', color: active ? '#fff' : theme.text }}>{opt.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {/* Sentence strip */}
      <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
        <View style={[{ minHeight: 50, borderWidth: 2, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: '#FFFFFF', borderColor: theme.accent + '55', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }, shadow.s]}>
          {utterance.length === 0 ? (
            <Text style={{ color: theme.accent, fontWeight: '600' }}>Build a sentence…</Text>
          ) : (
            utterance.map((tileId, i) => (
              <View key={`${tileId}-${i}`} style={{ paddingHorizontal: 10, paddingVertical: 6, backgroundColor: theme.chip, borderRadius: 12, marginRight: 6, marginBottom: 6 }}>
                <Text style={{ color: theme.text, fontWeight: '700' }}>{tWord(tileId, selectedLang)}</Text>
              </View>
            ))
          )}
        </View>
        <View style={{ flexDirection: 'row', columnGap: 10, marginTop: 10 }}>
          <TouchableOpacity onPress={onSpeakSentence} style={[styles.primaryBtn, { backgroundColor: theme.accent }]} activeOpacity={0.9}>
            <Text style={{ color: '#fff', fontWeight: '800' }}>Speak</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setUtterance([])} style={[styles.secondaryBtn]} activeOpacity={0.9}>
            <Text style={{ fontWeight: '700', color: '#111827' }}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Category chips */}
      <View style={{ marginTop: 10, paddingHorizontal: 16 }}>
        <FlatList
          data={allCategories}
          keyExtractor={(c) => c.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
          renderItem={({ item }) => {
            const active = item.id === activeCat;
            return (
              <TouchableOpacity
                onPress={() => setActiveCat(item.id)}
                style={[{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: active ? theme.text : theme.chip }, shadow.xs]}
                activeOpacity={0.9}
              >
                <Text style={{ color: active ? '#fff' : theme.text, fontWeight: '800' }}>{item.title}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Common words lane */}
      <View style={{ marginTop: 10 }}>
        <Text style={{ paddingHorizontal: 16, color: '#6B7280', marginBottom: 6, fontWeight: '600' }}>Common</Text>
        <FlatList
          data={COMMON_WORDS}
          keyExtractor={(t) => t.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, columnGap: 10 }}
          renderItem={({ item }) => (
            <AnimatedCommonChip
              t={item}
              onPress={async (tile) => {
                Haptics.selectionAsync();
                setUtterance(s => [...s, tile.id]);
                await speakSmart(tWord(tile.id, selectedLang), selectedLang);
              }}
            />
          )}
        />
      </View>

      {/* Section title */}
      <SectionHeader id={activeCat} title={category.title} />

      {/* Grid */}
      <FlatList
        style={{ marginTop: 6, paddingHorizontal: 16 }}
        data={filteredTiles}
        key={`auto-cols-${cols}-${category.id}`}
        numColumns={cols}
        keyExtractor={(t) => t.id}
        columnWrapperStyle={{ columnGap: 8 }}
        contentContainerStyle={{ paddingBottom: 28, rowGap: 8 }}
        renderItem={({ item, index }) => (
          <View style={{ flex: 1 }}>
            <TileCard
              t={item}
              index={index}
              onPress={onTile}
              accent={CATEGORY_STYLES[activeCat].accent}
              isFav={favorites.has(item.id)}
              onToggleFav={async (id) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                try {
                  const { isFavorite, favorites: favList } = await toggleFavorite(id);
                  setFavorites(new Set(favList));
                } catch (e) {
                  Alert.alert('Failed', 'Could not update favorites');
                }
              }}
              isMyTile={isMyTile(item)}
              onEditTile={onEditTile}
              onDeleteTile={confirmDelete}
            />
          </View>
        )}
      />
      
      {/* Floating add button (raised above tab bar on phone + web) */}
      <View style={{ position: 'absolute', right: 16, bottom: addBtnBottom, zIndex: 100 }}>
        <TouchableOpacity
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.9}
          style={{ backgroundColor: '#2563EB', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 999, flexDirection: 'row', alignItems: 'center', ...shadow.m }}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: '800', marginLeft: 6 }}>Add Tile</Text>
        </TouchableOpacity>
      </View>

      {/* Add Tile Modal */}
      {showAddModal && (
        <View style={{ position:'absolute', left:0, right:0, top:0, bottom:0, backgroundColor:'rgba(0,0,0,0.35)', alignItems:'center', justifyContent:'center' }}>
          <View style={{ width:'90%', backgroundColor:'#fff', borderRadius:16, padding:16 }}>
            <Text style={{ fontSize:18, fontWeight:'800', marginBottom:10 }}>Create custom tile</Text>

            {/* ID */}
            <Text style={{ fontWeight:'700', color:'#374151' }}>ID (no spaces)</Text>
            <TextInput value={newId} onChangeText={setNewId} placeholder="e.g. my_dog" style={styles.input} autoCapitalize="none" />

            {/* Label */}
            <Text style={{ fontWeight:'700', color:'#374151', marginTop:8 }}>Label</Text>
            <TextInput value={newLabel} onChangeText={setNewLabel} placeholder="e.g. My dog" style={styles.input} />

            {/* Emoji */}
            <Text style={{ fontWeight:'700', color:'#374151', marginTop:8 }}>Emoji (optional)</Text>
            <TextInput value={newEmoji} onChangeText={setNewEmoji} placeholder="e.g. 🐶" style={styles.input} />

            {/* Source mode toggle */}
            <View style={{ flexDirection:'row', marginTop:12, marginBottom:8 }}>
              <TouchableOpacity
                onPress={() => setSourceMode('url')}
                style={{ paddingVertical:8, paddingHorizontal:12, borderRadius:999, backgroundColor: sourceMode==='url' ? '#2563EB' : '#E5E7EB', marginRight:8 }}
              >
                <Text style={{ color: sourceMode==='url' ? '#fff' : '#111827', fontWeight:'700' }}>Image URL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSourceMode('upload')}
                style={{ paddingVertical:8, paddingHorizontal:12, borderRadius:999, backgroundColor: sourceMode==='upload' ? '#2563EB' : '#E5E7EB' }}
              >
                <Text style={{ color: sourceMode==='upload' ? '#fff' : '#111827', fontWeight:'700' }}>Upload</Text>
              </TouchableOpacity>
            </View>

            {sourceMode === 'url' ? (
              <>
                <Text style={{ fontWeight:'700', color:'#374151' }}>Image URL</Text>
                <TextInput
                  value={newImageUrl}
                  onChangeText={setNewImageUrl}
                  placeholder="https://example.com/picture.png"
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
                  style={{ backgroundColor:'#F3F4F6', borderWidth:1, borderColor:'#E5E7EB', borderRadius:12, padding:12, alignItems:'center', marginTop:4 }}
                >
                  <Ionicons name="image-outline" size={20} color="#4B5563" />
                  <Text style={{ marginTop:6, color:'#374151', fontWeight:'700' }}>
                    {pickedUri ? 'Change image' : 'Choose image from device'}
                  </Text>
                  <Text style={{ marginTop:2, fontSize:12, color:'#6B7280' }}>
                    Max size: 1MB
                  </Text>
                </TouchableOpacity>

                {pickedUri ? (
                  <View style={{ alignItems:'center', marginTop:10 }}>
                    <Image source={{ uri: pickedUri }} style={{ width: 120, height: 120, borderRadius: 12 }} />
                    <Text style={{ marginTop:6, fontSize:12, color:'#6B7280' }}>Will upload on Save</Text>
                  </View>
                ) : null}
              </>
            )}

            <View style={{ flexDirection:'row', justifyContent:'flex-end', marginTop:14 }}>
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
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  if (saving) return; // Prevent multiple clicks
                  
                  if (!newId || !newLabel) {
                    Alert.alert('Missing', 'ID and Label are required'); 
                    return;
                  }
                  
                  setSaving(true);
                  let finalImageUrl = newImageUrl.trim() || undefined;

                  try {
                    console.log('Starting tile creation process...');
                    console.log('Source mode:', sourceMode);
                    console.log('Picked URI:', pickedUri);
                    
                    if (sourceMode === 'upload') {
                      if (!pickedUri) { 
                        Alert.alert('No image', 'Please choose an image to upload'); 
                        return; 
                      }
                      console.log('Uploading image...');
                      finalImageUrl = await uploadPickedImage(); // ← get public URL from backend
                      console.log('Upload completed, URL:', finalImageUrl);
                    }

                    console.log('Creating custom tile with data:', {
                      id: newId.trim(),
                      label: newLabel.trim(),
                      emoji: newEmoji.trim() || undefined,
                      imageUrl: finalImageUrl,
                    });

                    const { tile } = await addCustomTile({
                      id: newId.trim(),
                      label: newLabel.trim(),
                      emoji: newEmoji.trim() || undefined,
                      imageUrl: finalImageUrl,
                    });

                    console.log('Tile created successfully:', tile);
                    setCustomTiles(prev => [...prev, tile]);
                    
                    // Close modal and reset form immediately
                    setShowAddModal(false);
                    setNewId(''); 
                    setNewLabel(''); 
                    setNewEmoji(''); 
                    setNewImageUrl(''); 
                    setPickedUri('');
                    setSourceMode('url');
                    
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  } catch (e: any) {
                    console.error('Error creating tile:', e);
                    Alert.alert('Could not add', e?.message || 'Please try again');
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={uploading || saving}
                style={[styles.primaryBtn, { backgroundColor: (uploading || saving) ? '#9CA3AF' : '#2563EB' }]}
              >
                <Text style={{ color:'#fff', fontWeight:'800' }}>
                  {uploading ? 'Uploading…' : saving ? 'Saving…' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Edit Modal */}
      <Modal visible={editOpen} transparent animationType="fade" onRequestClose={() => setEditOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Tile</Text>

            <Text style={styles.label}>Label</Text>
            <TextInput
              value={editForm?.label ?? ""}
              onChangeText={(t) => setEditForm((f) => (f ? { ...f, label: t } : f))}
              style={styles.input}
              placeholder="Enter label"
            />

            <Text style={styles.label}>Image URL (optional)</Text>
            <TextInput
              value={editForm?.imageUrl ?? ""}
              onChangeText={(t) => setEditForm((f) => (f ? { ...f, imageUrl: t } : f))}
              style={styles.input}
              placeholder="https://…"
              autoCapitalize="none"
            />

            <View style={styles.row}>
              <TouchableOpacity
                onPress={() => setEditOpen(false)}
                style={[styles.btn, styles.btnGhost]}
                disabled={savingEdit}
              >
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onSaveEdit}
                style={[styles.btn, styles.btnPrimary]}
                disabled={savingEdit}
              >
                <Text style={styles.btnText}>{savingEdit ? "Saving…" : "Save"}</Text>
              </TouchableOpacity>
            </View>

            {/* Optional: a secondary button to open your existing picker+uploader */}
            <TouchableOpacity onPress={async () => {
              await pickImageFromDevice();
              if (pickedUri) {
                try {
                  const url = await uploadPickedImage();
                  if (url) setEditForm(f => f ? { ...f, imageUrl: url } : f);
                } catch (e) {
                  Alert.alert('Upload failed', 'Could not upload image');
                }
              }
            }} style={[styles.btn, styles.btnSecondary]}>
              <Text style={styles.btnText}>Replace Image</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ---------- styles ----------
const shadow = {
  xs: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  s:  { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  m:  { shadowColor: '#000', shadowOpacity: 0.1,  shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 5 },
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

  // card - smaller tiles with bigger emojis
  card: {
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 6,
    paddingHorizontal: 8,
    borderWidth: 1.5,
    position: 'relative',
  },
  emojiWrap: { width: '100%', alignItems: 'center', justifyContent: 'center', flexGrow: 1 },
  emojiHalo: { position: 'absolute', width: 72, height: 72, borderRadius: 999, top: '50%', left: '50%', transform: [{ translateX: -36 }, { translateY: -36 }] },
  emojiImage: { width: '100%', height: '100%', position: 'absolute' },
  emojiText: { fontSize: 48 },
  labelWrap: { width: '100%', alignItems: 'center' },
  labelText: { fontWeight: '800', color: '#111827', backgroundColor: 'rgba(255,255,255,0.96)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, overflow: 'hidden', fontSize: 12 },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 4 },

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
    // subtle accent ring
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
});
